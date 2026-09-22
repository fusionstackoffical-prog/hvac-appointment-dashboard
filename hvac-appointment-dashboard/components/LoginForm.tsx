"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(searchParams.get("error") === "not_authorized" ? "This account is not authorized to access the dashboard." : "");
  const [loading, setLoading] = useState(false);

  const requestedPath = searchParams.get("next");
  const destination = requestedPath?.startsWith("/") && !requestedPath.startsWith("//") ? requestedPath : "/";

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setMessage(error.message); setLoading(false); return; }
    router.replace(destination);
    router.refresh();
  }

  return <main className="auth-page"><form className="auth-card panel" onSubmit={(event) => void signIn(event)}><div className="head"><div><h3>Midland Comfort HVAC</h3><small>Sign in to manage appointments and availability.</small></div></div><div className="fields auth-fields"><label>Email<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required/></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required/></label></div>{message && <p className="availability-message" role="alert">{message}</p>}<div className="modal-actions"><button className="primary" type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button></div></form></main>;
}
