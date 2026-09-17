"use client";

import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function UnauthorizedPage() {
  const router = useRouter();
  async function signOut() { await supabase.auth.signOut(); router.replace("/login"); router.refresh(); }
  return <main className="auth-page"><div className="auth-card panel"><div className="head"><div><h3>Access not authorized</h3><small>This account cannot access the HVAC management dashboard.</small></div></div><div className="modal-actions"><button className="primary" type="button" onClick={() => void signOut()}>Sign out</button></div></div></main>;
}
