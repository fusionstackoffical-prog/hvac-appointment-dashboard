import { supabase } from "./supabase";

export const appointmentStatuses = ["pending", "confirmed", "completed", "cancelled"] as const;
export type AppointmentStatus = (typeof appointmentStatuses)[number];

type AppointmentLead = { name: string; service: string; location: string } | null;
type AppointmentRecord = { id: string; appointment_date: string; appointment_time: string; status: string; created_at: string; leads: AppointmentLead | AppointmentLead[] };
export type Appointment = { id: string; date: string; time: string; status: AppointmentStatus; customerName: string; service: string; location: string };
export type Availability = { day_of_week: number; start_time: string; end_time: string; enabled: boolean; appointment_duration: number };
export type NewAppointment = { customerName: string; phone: string; email: string; service: string; problem: string; location: string; date: string; time: string };
export type Lead = { id: string; name: string; service: string; problem: string | null; location: string; appointment: { date: string; time: string; status: string } | null };

function asAppointment(record: AppointmentRecord): Appointment {
  const lead = Array.isArray(record.leads) ? record.leads[0] : record.leads;
  const status = appointmentStatuses.includes(record.status as AppointmentStatus) ? record.status as AppointmentStatus : "pending";
  return { id: record.id, date: record.appointment_date, time: record.appointment_time, status, customerName: lead?.name ?? "Unknown customer", service: lead?.service ?? "—", location: lead?.location ?? "—" };
}

export async function loadAppointments() {
  const result = await supabase.from("appointments").select("id, appointment_date, appointment_time, status, created_at, leads(name, service, location)").order("appointment_date", { ascending: true }).order("appointment_time", { ascending: true });
  if (result.error) throw result.error;
  return (result.data as unknown as AppointmentRecord[]).map(asAppointment);
}

export async function loadAvailability() {
  const result = await supabase.from("availability").select("day_of_week, start_time, end_time, enabled, appointment_duration").order("day_of_week");
  if (result.error) throw result.error;
  return result.data as Availability[];
}

export async function loadLeads() {
  const result = await supabase.from("leads").select("id, name, service, problem, location, appointments(appointment_date, appointment_time, status)").order("created_at", { ascending: false });
  if (result.error) throw result.error;
  return (result.data ?? []).map((lead) => {
    const appointments = lead.appointments as unknown as Array<{ appointment_date: string; appointment_time: string; status: string }> | null;
    const appointment = appointments?.[0] ?? null;
    return { id: lead.id, name: lead.name, service: lead.service, problem: lead.problem, location: lead.location, appointment: appointment ? { date: appointment.appointment_date, time: appointment.appointment_time, status: appointment.status } : null } as Lead;
  });
}

export function validateAvailability(input: Pick<NewAppointment, "date" | "time">, availability: Availability[]) {
  if (!input.date || !input.time) return "Choose an appointment date and time.";
  const weekday = new Date(`${input.date}T12:00:00`).getDay();
  const schedule = availability.find((day) => day.day_of_week === weekday);
  if (!schedule || !schedule.enabled) return "Appointments are not available on the selected day.";
  const start = schedule.start_time.slice(0, 5); const end = schedule.end_time.slice(0, 5);
  const [hours, minutes] = input.time.split(":").map(Number); const endsAt = hours * 60 + minutes + schedule.appointment_duration;
  const [closeHours, closeMinutes] = end.split(":").map(Number);
  if (input.time < start) return `Appointments start at ${start}.`;
  if (input.time >= end || endsAt > closeHours * 60 + closeMinutes) return `This appointment needs ${schedule.appointment_duration} minutes and must finish by ${end}.`;
  return null;
}

export async function createAppointment(input: NewAppointment) {
  const result = await supabase.rpc("create_appointment", { p_name: input.customerName, p_phone: input.phone, p_email: input.email || null, p_service: input.service, p_problem: input.problem || null, p_location: input.location, p_appointment_date: input.date, p_appointment_time: input.time });
  if (result.error) throw result.error;
  return result.data;
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus) {
  const result = await supabase.rpc("update_appointment_status", { p_appointment_id: id, p_status: status });
  if (result.error) throw result.error;
}

export function displayDate(date: string) { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T12:00:00`)); }
export function displayTime(time: string) { const [hours, minutes] = time.slice(0, 5).split(":").map(Number); return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(2000, 0, 1, hours, minutes)); }
