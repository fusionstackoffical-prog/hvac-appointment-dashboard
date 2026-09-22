"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Shell from "./Shell";
import { CalendarClock, Check, Clock3, Save, ShieldCheck } from "lucide-react";
import { EmptyState, SectionCard } from "./ui";
import { loadAvailability, type Availability } from "../lib/appointments";
import { supabase } from "../lib/supabase";

type AvailabilityDay = { dayOfWeek: number; name: string; enabled: boolean; start: string; end: string; appointmentDuration: number; slots: string[] };
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function toMinutes(time: string) { const [hours, minutes] = time.slice(0, 5).split(":").map(Number); return hours * 60 + minutes; }
function fromMinutes(value: number) { return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`; }
function slotsForWindow(start: string, end: string, duration: number) {
  const slots: string[] = [];
  for (let minute = toMinutes(start); minute + duration <= toMinutes(end); minute += duration) slots.push(fromMinutes(minute));
  return slots;
}
function displaySlot(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(2000, 0, 1, hours, minutes));
}
function asDays(rows: Availability[]) {
  const byDay = new Map(rows.map((row) => [row.day_of_week, row]));
  return dayNames.map((name, dayOfWeek) => {
    const row = byDay.get(dayOfWeek);
    const start = row?.start_time.slice(0, 5) ?? "08:00";
    const end = row?.end_time.slice(0, 5) ?? "17:00";
    const appointmentDuration = row?.appointment_duration ?? 60;
    return { dayOfWeek, name, enabled: row?.enabled ?? (dayOfWeek > 0 && dayOfWeek < 6), start, end, appointmentDuration, slots: row?.available_slots?.map((slot) => slot.slice(0, 5)) ?? slotsForWindow(start, end, appointmentDuration) };
  });
}

export default function Availability() {
  const [days, setDays] = useState<AvailabilityDay[]>([]);
  const [slotStorageReady, setSlotStorageReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setMessage("");
    try {
      const rows = await loadAvailability();
      setDays(asDays(rows));
      setSlotStorageReady(rows.some((row) => Array.isArray(row.available_slots)));
    } catch (cause) { setMessage(`Could not load availability: ${cause instanceof Error ? cause.message : "Please try again."}`); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const selectedSlots = useMemo(() => days.reduce((total, day) => total + (day.enabled ? day.slots.length : 0), 0), [days]);
  function updateDay(dayOfWeek: number, update: Partial<AvailabilityDay>) { setDays((current) => current.map((day) => day.dayOfWeek === dayOfWeek ? { ...day, ...update } : day)); setMessage(""); }
  function toggleSlot(dayOfWeek: number, slot: string) {
    setDays((current) => current.map((day) => day.dayOfWeek !== dayOfWeek ? day : { ...day, slots: day.slots.includes(slot) ? day.slots.filter((currentSlot) => currentSlot !== slot) : [...day.slots, slot].sort() }));
    setMessage("");
  }
  function updateDuration(duration: number) {
    setDays((current) => current.map((day) => ({ ...day, appointmentDuration: duration, slots: slotsForWindow(day.start, day.end, duration) })));
    setMessage("Appointment duration changed. Slot selections were reset to the existing booking window.");
  }
  async function saveAvailability() {
    if (!slotStorageReady) { setMessage("Individual slots need the included Supabase migration before they can be saved. Your current availability was left unchanged."); return; }
    setSaving(true); setMessage("");
    const rows = days.map((day) => ({ day_of_week: day.dayOfWeek, start_time: `${day.start}:00`, end_time: `${day.end}:00`, enabled: day.enabled, appointment_duration: day.appointmentDuration, available_slots: day.enabled ? day.slots.map((slot) => `${slot}:00`) : [] }));
    const { error } = await supabase.from("availability").upsert(rows, { onConflict: "day_of_week" });
    if (error) setMessage(`Could not save availability: ${error.message}`);
    else { setMessage("Availability slots saved."); await load(); }
    setSaving(false);
  }

  return <Shell title="Availability" subtitle="Shape a precise, bookable service schedule.">
    <div className="workspace-intro"><div className="intro-icon"><CalendarClock size={21}/></div><div><h2>Your booking availability</h2><p>Select the exact appointment starts customers can book.</p></div><button className="primary" onClick={() => void saveAvailability()} disabled={loading || saving}><Save size={16}/>{saving ? "Saving..." : "Save changes"}</button></div>
    {message && <p className="availability-message" role="status">{message}</p>}
    <div className="availability-layout">
      <SectionCard title="Weekly appointment slots" description="Selected times are available to book. Turn a day off to pause all of its slots." action={<span className="subtle-label">{loading ? "—" : `${selectedSlots} selected slots`}</span>}>
        <div className="slot-schedule">{loading ? <EmptyState title="Loading availability…" loading icon={Clock3}/> : days.map((day) => {
          const slots = slotsForWindow(day.start, day.end, day.appointmentDuration);
          return <section className={`slot-day ${day.enabled ? "enabled" : "disabled"}`} key={day.dayOfWeek} aria-labelledby={`day-${day.dayOfWeek}`}>
            <div className="slot-day-heading"><div className="day-info"><span className="day-monogram" aria-hidden="true">{day.name.slice(0, 2)}</span><div><h3 id={`day-${day.dayOfWeek}`}>{day.name}</h3><p>{day.enabled ? `${day.slots.length} selected appointment slots` : "All slots paused"}</p></div></div><button type="button" className={`toggle ${day.enabled ? "on" : ""}`} aria-label={`Toggle ${day.name} availability`} aria-pressed={day.enabled} onClick={() => updateDay(day.dayOfWeek, { enabled: !day.enabled })}><i/></button></div>
            <div className="slot-grid" role="group" aria-label={`${day.name} appointment times`}>{slots.map((slot) => { const selected = day.slots.includes(slot); return <button key={slot} type="button" className={`slot-tile ${selected ? "selected" : ""}`} aria-pressed={selected} disabled={!day.enabled} onClick={() => toggleSlot(day.dayOfWeek, slot)}><span>{displaySlot(slot)}</span>{selected && <Check size={13} strokeWidth={2.4} aria-hidden="true"/>}</button>; })}</div>
          </section>;
        })}</div>
      </SectionCard>
      <div className="availability-side"><SectionCard title="Appointment duration" description="Time reserved for each service visit." className="duration-panel"><div className="duration-icon"><Clock3 size={28} strokeWidth={1.5}/></div><label className="duration-control">Default duration<select value={days[0]?.appointmentDuration ?? 60} disabled={loading} onChange={(event) => updateDuration(Number(event.target.value))}><option value={30}>30 minutes</option><option value={45}>45 minutes</option><option value={60}>60 minutes</option><option value={90}>90 minutes</option><option value={120}>120 minutes</option></select></label><p className="panel-note">Changing duration regenerates the selectable starts from your existing booking windows.</p></SectionCard><div className="scheduling-note"><ShieldCheck size={20}/><div><h3>Source of truth</h3><p>Slots are saved in Supabase and can be read by your future booking system. A booking flow should also check the requested time against this list and reject occupied appointments atomically.</p></div></div></div>
    </div>
  </Shell>;
}
