"use client";

import { useCallback, useEffect, useState } from "react";
import Shell from "./Shell";
import { displayDate, displayTime, Lead, loadLeads } from "../lib/appointments";

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const refresh = useCallback(async () => { setLoading(true); try { setLeads(await loadLeads()); setError(""); } catch (cause) { setError(`Could not load leads: ${cause instanceof Error ? cause.message : "Please try again."}`); } finally { setLoading(false); } }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  return <Shell title="Leads" subtitle="View incoming service requests in one place."><div className="toolbar"><input placeholder="Search leads..."/><button type="button">All services</button><button type="button">All statuses</button></div>{error && <p className="availability-message" role="alert">{error}</p>}<div className="panel"><div className="table"><div className="tr appointments-tr th"><b>Customer</b><b>Service</b><b>Problem</b><b>Location</b><b>Appointment</b><b>Status</b></div>{loading ? <div className="empty">Loading leads...</div> : leads.length === 0 ? <div className="empty">No leads yet.</div> : leads.map((lead) => <div className="tr appointments-tr" key={lead.id}><span><b>{lead.name}</b></span><span>{lead.service}</span><span>{lead.problem ?? "—"}</span><span>{lead.location}</span><span>{lead.appointment ? `${displayDate(lead.appointment.date)} · ${displayTime(lead.appointment.time)}` : "—"}</span><span className={`badge ${lead.appointment?.status ?? "pending"}`}>{lead.appointment ? lead.appointment.status.charAt(0).toUpperCase() + lead.appointment.status.slice(1) : "New"}</span></div>)}</div></div></Shell>;
}
