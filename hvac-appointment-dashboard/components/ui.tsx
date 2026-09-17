import Link from "next/link";
import { ArrowUpRight, Inbox, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return <span className={`badge ${status}`}><span className="status-dot" aria-hidden="true" />{label ?? status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

export function MetricCard({ label, value, context, icon: Icon, tone }: { label: string; value: string; context: string; icon: LucideIcon; tone: string }) {
  return <div className={`metric-card ${tone}`}>
    <div className="metric-top"><span>{label}</span><Icon size={18} aria-hidden="true" /></div>
    <div className="metric-value">{value}</div>
    <div className="metric-context"><span className="metric-tick" aria-hidden="true" />{context}</div>
  </div>;
}

export function SectionCard({ title, description, href, action, className = "", children }: { title: string; description?: string; href?: string; action?: ReactNode; className?: string; children: ReactNode }) {
  return <div className={`panel ${className}`}><div className="head"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{href ? <Link href={href} className="text-link">View all <ArrowUpRight size={15} aria-hidden="true" /></Link> : action}</div>{children}</div>;
}

export function EmptyState({ title, description, loading = false, icon: Icon = Inbox }: { title: string; description?: string; loading?: boolean; icon?: LucideIcon }) {
  return <div className={`empty ${loading ? "is-loading" : ""}`} role="status"><span className="empty-icon"><Icon size={22} aria-hidden="true" /></span><strong>{title}</strong>{description && <p>{description}</p>}</div>;
}

export function CustomerIdentity({ name, detail }: { name: string; detail?: string }) {
  const initials = name?.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("") || "—";
  return <div className="customer-identity"><span className="customer-avatar" aria-hidden="true">{initials}</span><div><strong>{name}</strong>{detail && <small>{detail}</small>}</div></div>;
}

export function TableContainer({ label, children }: { label: string; children: ReactNode }) {
  return <div className="table" role="region" aria-label={label} tabIndex={0}>{children}</div>;
}
