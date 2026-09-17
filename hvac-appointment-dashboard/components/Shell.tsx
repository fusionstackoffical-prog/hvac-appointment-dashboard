"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, CalendarDays, Users, Clock3, Settings, Wind, LogOut, ChevronRight } from "lucide-react";
import { supabase } from "../lib/supabase";

const navigation = [["/", "Dashboard", LayoutDashboard], ["/appointments", "Appointments", CalendarDays], ["/leads", "Leads", Users], ["/availability", "Availability", Clock3], ["/settings", "Settings", Settings]] as const;

export default function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  async function signOut() { await supabase.auth.signOut(); router.replace("/login"); router.refresh(); }

  return <div className="shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><Wind size={23} strokeWidth={1.6} /></span><div><b>MIDLAND COMFORT</b><small>HVAC Operations</small></div></div>
      <div className="nav-label">WORKSPACE</div>
      <nav aria-label="Main navigation">{navigation.map(([href, label, Icon]) => <Link href={href} key={href} className={pathname === href ? "active" : undefined} aria-current={pathname === href ? "page" : undefined} aria-label={label} title={label}><Icon size={19} strokeWidth={1.7} /><span>{label}</span>{pathname === href && <span className="nav-indicator" aria-hidden="true" />}</Link>)}</nav>
      <div className="sidebar-caption"><span className="eyebrow">BUILT FOR COMFORT.</span><p>Every request.<br />Every service call.</p><div className="sidebar-line" /></div>
      <div className="owner"><strong className="owner-avatar">MC</strong><div><b>Owner</b><small>Midland Comfort</small></div><button className="logout icon-button" type="button" aria-label="Sign out" title="Sign out" onClick={() => void signOut()}><LogOut size={17} /></button></div>
    </aside>
    <main id="main-content" tabIndex={-1}>
      <div className="topbar"><div className="breadcrumb"><Wind size={16} aria-hidden="true" /><span>Operations</span><ChevronRight size={13} aria-hidden="true" /><strong>{title}</strong></div><div className="account-header"><span className="online"><span aria-hidden="true" />System online</span><span className="header-divider" /><span className="owner-avatar" title="Owner">MC</span></div></div>
      <div className="page-content"><header className="page-header"><div><span className="eyebrow">HVAC OPERATIONS / {title === "Dashboard" ? "OVERVIEW" : "WORKSPACE"}</span><h1>{title}</h1><p>{subtitle}</p></div><span className="workspace-tag">MIDLAND COMFORT<span>Operations intelligence platform</span></span></header>{children}<footer className="page-footer"><span>Midland Comfort <span className="footer-slash">/</span> HVAC Operations</span><span>Precision in every service.</span></footer></div>
    </main>
  </div>;
}
