"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Shell from "./Shell";
import { ArrowUpRight, CalendarDays, CheckCircle2, Clock3, Users } from "lucide-react";
import { Appointment, displayDate, displayTime, loadAppointments, loadLeads, type Lead } from "../lib/appointments";
import { CustomerIdentity, EmptyState, MetricCard, SectionCard, StatusBadge, TableContainer } from "./ui";

const today = () => { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; };

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(true);
  const [leadsError, setLeadsError] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => { setLoading(true); try { setAppointments(await loadAppointments()); setError(""); } catch (cause) { setError(`Could not load dashboard data: ${cause instanceof Error ? cause.message : "Please try again."}`); } finally { setLoading(false); } }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { loadLeads().then(setLeads).catch((cause) => setLeadsError(`Could not load leads: ${cause instanceof Error ? cause.message : "Please try again."}`)).finally(() => setLeadsLoading(false)); }, []);
  const currentDay = today();
  const active = appointments.filter((appointment) => !["cancelled", "completed"].includes(appointment.status));
  const todays = active.filter((appointment) => appointment.date === currentDay);
  const upcoming = active.filter((appointment) => appointment.date >= currentDay).slice(0, 5);
  const recent = appointments.filter((appointment) => appointment.date <= currentDay).slice(-5).reverse();
  const metricValue = (value: number) => loading || error ? "—" : String(value);

  return <Shell title="Dashboard" subtitle="A clear perspective on your service operations.">
    <div className="overview-heading"><div><span className="section-index">01</span><h2>Operations overview</h2></div><span className="date-label"><CalendarDays size={14} />{displayDate(currentDay)}</span></div>
    <div className="stats">
      <MetricCard label="Total leads" value={leadsLoading || leadsError ? "—" : String(leads.length)} context="Customer requests" icon={Users} tone="ice" />
      <MetricCard label="Today's appointments" value={metricValue(todays.length)} context="Scheduled for today" icon={CalendarDays} tone="lavender" />
      <MetricCard label="Upcoming" value={metricValue(active.filter((appointment) => appointment.date >= currentDay).length)} context="Active bookings · today onward" icon={Clock3} tone="amber" />
      <MetricCard label="Completed" value={metricValue(appointments.filter((appointment) => appointment.status === "completed").length)} context="Services completed" icon={CheckCircle2} tone="emerald" />
    </div>
    {error && <p className="availability-message" role="alert">{error}</p>}
    <div className="dashboard-primary">
      <SectionCard title="Today's schedule" description="Your service day, at a glance" href="/appointments" className="today-panel">
        <div className="today-summary"><div><span className="eyebrow">ON THE SCHEDULE</span><strong>{metricValue(todays.length)}<small>appointments today</small></strong></div><CalendarDays size={42} strokeWidth={1} aria-hidden="true" /></div>
        {loading ? <EmptyState title="Loading your schedule…" loading icon={CalendarDays} /> : error ? <EmptyState title="Schedule unavailable" description="Please reload to try again." /> : todays.length === 0 ? <EmptyState title="A clear schedule today" description="Appointments scheduled for today will appear here." icon={CalendarDays} /> : todays.map((appointment) => <div className="schedule-item" key={appointment.id}><time>{displayTime(appointment.time)}</time><CustomerIdentity name={appointment.customerName} detail={`${appointment.service} · ${appointment.location}`} /><StatusBadge status={appointment.status} /></div>)}
        <Link href="/appointments" className="panel-bottom-link">Manage appointments <ArrowUpRight size={16} /></Link>
      </SectionCard>
      <SectionCard title="Recent leads" description="Latest customer requests" href="/leads" className="recent-leads-panel">
        {leadsError ? <p className="availability-message" role="alert">{leadsError}</p> : leadsLoading ? <EmptyState title="Loading leads…" loading /> : leads.length === 0 ? <EmptyState title="Ready for your next customer" description="New service requests will appear here." icon={Users} /> : leads.slice(0, 5).map((lead) => <div className="lead-row" key={lead.id}><CustomerIdentity name={lead.name} detail={`${lead.service} · ${lead.location}`} /><StatusBadge status={lead.appointment?.status ?? "new"} /></div>)}
      </SectionCard>
    </div>
    <SectionCard title="Upcoming appointments" description="Your next scheduled service calls" href="/appointments">
      <TableContainer label="Upcoming appointments"><table className="data-table"><thead><tr><th scope="col">Customer</th><th scope="col">Service</th><th scope="col">Date</th><th scope="col">Time</th><th scope="col">Status</th></tr></thead><tbody>{upcoming.map((appointment) => <tr key={appointment.id}><td><CustomerIdentity name={appointment.customerName} /></td><td>{appointment.service}</td><td className="numeric">{displayDate(appointment.date)}</td><td className="numeric">{displayTime(appointment.time)}</td><td><StatusBadge status={appointment.status} /></td></tr>)}</tbody></table></TableContainer>
      {loading ? <EmptyState title="Loading appointments…" loading /> : !error && upcoming.length === 0 ? <EmptyState title="No upcoming appointments" description="Your next scheduled service calls will appear here." icon={CalendarDays} /> : null}
    </SectionCard>
    <div className="dashboard-secondary">
      <SectionCard title="Recent appointments" description="Most recent service dates through today" href="/appointments">
        {loading ? <EmptyState title="Loading appointments…" loading /> : !error && recent.length === 0 ? <EmptyState title="Your service history starts here" description="Recent appointments will appear as your schedule fills." icon={Clock3} /> : recent.map((appointment) => <div className="lead-row" key={appointment.id}><CustomerIdentity name={appointment.customerName} detail={`${appointment.service} · ${displayDate(appointment.date)} · ${displayTime(appointment.time)}`} /><StatusBadge status={appointment.status} /></div>)}
      </SectionCard>
      <SectionCard title="Appointment status" description="Across all service appointments" className="status-panel">
        {loading ? <EmptyState title="Loading totals…" loading /> : <div className="status-breakdown">{["pending", "confirmed", "completed", "cancelled"].map((status) => <div className="status-total" key={status}><StatusBadge status={status} /><strong>{error ? "—" : appointments.filter((appointment) => appointment.status === status).length}</strong></div>)}</div>}
      </SectionCard>
    </div>
  </Shell>;
}
