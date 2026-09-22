"use client";

import { useCallback, useEffect, useState } from "react";
import { Phone, Search, SlidersHorizontal, Users } from "lucide-react";
import Shell from "./Shell";
import { CustomerIdentity, EmptyState, SectionCard, StatusBadge, TableContainer } from "./ui";
import { displayDate, displayTime, Lead, loadLeads } from "../lib/appointments";

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const refresh = useCallback(async () => { setLoading(true); try { setLeads(await loadLeads()); setError(""); } catch (cause) { setError(`Could not load leads: ${cause instanceof Error ? cause.message : "Please try again."}`); } finally { setLoading(false); } }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  return <Shell title="Leads" subtitle="Every customer request. One organized workspace.">
    <div className="workspace-intro"><div className="intro-icon"><Users size={21} /></div><div><h2>Customer requests</h2><p>Contact details, service needs and booking status.</p></div><span className="record-count">{loading || error ? "—" : leads.length}<small>total leads</small></span></div>
    {error && <p className="availability-message" role="alert">{error}</p>}
    <SectionCard title="Lead directory" description="All incoming requests" action={<span className="subtle-label">Latest first</span>}>
      <div className="directory-toolbar"><label className="search-control"><Search size={16} aria-hidden="true" /><input aria-label="Search leads (not available)" placeholder="Search leads" disabled /></label><button type="button" disabled>All services</button><button type="button" disabled><SlidersHorizontal size={15} />All statuses</button><span className="control-note">Search & filters are not available yet</span></div>
      <TableContainer label="Customer leads"><table className="data-table leads-table"><thead><tr>{["Customer", "Phone", "Service", "Problem", "Location", "Appointment", "Status"].map((label) => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>{leads.map((lead) => <tr key={lead.id}>
        <td><CustomerIdentity name={lead.name} /></td>
        <td>{lead.phone ? <a className="phone-link" href={`tel:${lead.phone.replace(/[^\d+*#,;]/g, "")}`}><Phone size={13} aria-hidden="true" />{lead.phone}</a> : "—"}</td>
        <td>{lead.service}</td><td className="problem-cell">{lead.problem}</td><td>{lead.location}</td>
        <td>{lead.appointment ? <div className="date-stack"><span>{displayDate(lead.appointment.date)}</span><small>{displayTime(lead.appointment.time)}</small></div> : <span className="muted">—</span>}</td>
        <td><StatusBadge status={lead.appointment?.status ?? "new"} /></td>
      </tr>)}</tbody></table></TableContainer>
      {loading ? <EmptyState title="Loading customer requests…" loading /> : !error && leads.length === 0 ? <EmptyState title="Your next customer starts here" description="Incoming requests and their contact details will appear in this directory." icon={Users} /> : null}
      <div className="table-footer"><span>{loading || error ? "—" : leads.length} records</span><span>Customer requests · Midland Comfort</span></div>
    </SectionCard>
  </Shell>;
}
