"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Shell from "./Shell";
import Modal from "./Modal";
import { CalendarDays, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { CustomerIdentity, EmptyState, SectionCard, TableContainer } from "./ui";
import { Appointment, appointmentStatuses, AppointmentStatus, createAppointment, displayDate, displayTime, loadAppointments, loadAvailability, NewAppointment, updateAppointmentStatus, validateAvailability, type Availability } from "../lib/appointments";

const blankForm: NewAppointment = { customerName: "", phone: "", email: "", service: "", problem: "", location: "", date: "", time: "" };
const statusLabel = (status: string) => status.charAt(0).toUpperCase() + status.slice(1);

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]); const [availability, setAvailability] = useState<Availability[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [message, setMessage] = useState(""); const [formOpen, setFormOpen] = useState(false); const [form, setForm] = useState<NewAppointment>(blankForm); const [saving, setSaving] = useState(false); const [updatingId, setUpdatingId] = useState<string | null>(null);
  const refresh = useCallback(async () => { setLoading(true); setError(""); try { const [nextAppointments, nextAvailability] = await Promise.all([loadAppointments(), loadAvailability()]); setAppointments(nextAppointments); setAvailability(nextAvailability); } catch (cause) { setError(`Could not load appointments: ${cause instanceof Error ? cause.message : "Please try again."}`); } finally { setLoading(false); } }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  function updateForm(field: keyof NewAppointment, value: string) { setForm((current) => ({ ...current, [field]: value })); setError(""); }
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setMessage(""); const required: Array<[keyof NewAppointment, string]> = [["customerName", "Customer name"], ["phone", "Phone"], ["service", "Service"], ["location", "Location"], ["date", "Appointment date"], ["time", "Appointment time"]]; const missing = required.find(([field]) => !form[field].trim()); if (missing) { setError(`${missing[1]} is required.`); return; } const availabilityError = validateAvailability(form, availability); if (availabilityError) { setError(availabilityError); return; } setSaving(true); setError(""); try { await createAppointment(form); setForm(blankForm); setFormOpen(false); setMessage("Appointment created."); await refresh(); } catch (cause) { setError(`Could not create appointment: ${cause instanceof Error ? cause.message : "Please try again."}`); } finally { setSaving(false); } }
  async function changeStatus(id: string, status: AppointmentStatus) { setUpdatingId(id); setError(""); setMessage(""); try { await updateAppointmentStatus(id, status); setMessage("Appointment status updated."); await refresh(); } catch (cause) { setError(`Could not update appointment status: ${cause instanceof Error ? cause.message : "Please try again."}`); } finally { setUpdatingId(null); } }
  return <Shell title="Appointments" subtitle="Plan the day. Keep every service call moving.">
    <div className="workspace-intro"><div className="intro-icon"><CalendarDays size={21}/></div><div><h2>Service schedule</h2><p>Upcoming visits and past appointments, together.</p></div><button className="primary" type="button" onClick={() => { setError(""); setMessage(""); setFormOpen(true); }}><Plus size={17}/>New appointment</button></div>
    {error && !formOpen && <p className="availability-message" role="alert">{error}</p>}
    {message && <p className="availability-message" role="status">{message}</p>}
    <SectionCard title="All appointments" description="Manage your service bookings" action={<span className="subtle-label">{loading || error ? "—" : appointments.length} appointments</span>}>
      <div className="directory-toolbar"><label className="search-control"><Search size={16}/><input placeholder="Search customers or services" aria-label="Search appointments (not available)" disabled/></label><button type="button" disabled><CalendarDays size={15}/>Calendar</button><button type="button" disabled><SlidersHorizontal size={15}/>Filters</button><span className="control-note">Search, calendar & filters are not available yet</span></div>
      <TableContainer label="Service appointments"><table className="data-table appointments-table"><thead><tr>{["Customer", "Service", "Date", "Time", "Location", "Status"].map((label) => <th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{appointments.map((appointment) => <tr key={appointment.id}>
        <td><CustomerIdentity name={appointment.customerName}/></td><td>{appointment.service}</td><td className="numeric">{displayDate(appointment.date)}</td><td className="numeric">{displayTime(appointment.time)}</td><td>{appointment.location}</td>
        <td><select className={`status-select ${appointment.status}`} aria-label={`Update status for ${appointment.customerName}`} value={appointment.status} disabled={updatingId === appointment.id} onChange={(event) => void changeStatus(appointment.id, event.target.value as AppointmentStatus)}>{appointmentStatuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></td>
      </tr>)}</tbody></table></TableContainer>
      {loading ? <EmptyState title="Loading your appointments…" loading icon={CalendarDays}/> : !error && appointments.length === 0 ? <EmptyState title="Make room for great service" description="Create your first appointment to start building your schedule." icon={CalendarDays}/> : null}
      <div className="table-footer"><span>{loading || error ? "—" : appointments.length} records</span><span>Select a status to update an appointment</span></div>
    </SectionCard>
    {formOpen && <Modal titleId="appointment-title" onClose={() => setFormOpen(false)}><form className="appointment-modal" onSubmit={(event) => void submit(event)}>
      <div className="head"><div><span className="eyebrow">SERVICE SCHEDULING</span><h2 id="appointment-title">New appointment</h2><p>Customer and scheduling details, in one place.</p></div><button className="icon-button" type="button" aria-label="Close new appointment" onClick={() => setFormOpen(false)}><X size={19}/></button></div>
      {error && <p className="availability-message modal-message" role="alert">{error}</p>}
      <div className="form-section-title"><span>01</span>Customer details</div>
      <div className="fields appointment-fields">
        <label>Customer name<input value={form.customerName} onChange={(event) => updateForm("customerName", event.target.value)} autoFocus required/></label>
        <label>Phone<input type="tel" value={form.phone} onChange={(event) => updateForm("phone", event.target.value)} required/></label>
        <label>Email <small>(optional)</small><input type="email" value={form.email} onChange={(event) => updateForm("email", event.target.value)}/></label>
        <label>Location<input value={form.location} onChange={(event) => updateForm("location", event.target.value)} required/></label>
      </div>
      <div className="form-section-title"><span>02</span>Service & appointment</div>
      <div className="fields appointment-fields">
        <label>Service<input value={form.service} onChange={(event) => updateForm("service", event.target.value)} required/></label>
        <label>Problem / notes<input value={form.problem} onChange={(event) => updateForm("problem", event.target.value)}/></label>
        <label>Appointment date<input type="date" value={form.date} onChange={(event) => updateForm("date", event.target.value)} required/></label>
        <label>Appointment time<input type="time" value={form.time} onChange={(event) => updateForm("time", event.target.value)} required/></label>
      </div>
      <div className="modal-actions"><button type="button" onClick={() => setFormOpen(false)}>Cancel</button><button className="primary" disabled={saving} type="submit">{saving ? "Creating..." : "Create appointment"}</button></div>
    </form></Modal>}
  </Shell>;
}
