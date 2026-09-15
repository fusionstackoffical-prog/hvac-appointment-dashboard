"use client";

import { useCallback, useEffect, useState } from "react";
import Shell from "./Shell";
import { supabase } from "../lib/supabase";

type AvailabilityDay = { dayOfWeek: number; name: string; enabled: boolean; start: string; end: string; appointmentDuration: number };
type AvailabilityRow = { day_of_week: number; start_time: string; end_time: string; enabled: boolean; appointment_duration?: number | null; duration_minutes?: number | null };

const defaultDays: AvailabilityDay[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((name, dayOfWeek) => ({
  dayOfWeek, name, enabled: dayOfWeek > 0 && dayOfWeek < 6, start: "08:00", end: "17:00", appointmentDuration: 60,
}));

export default function Availability() {
  const [days, setDays] = useState<AvailabilityDay[]>(defaultDays);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const applyRows = useCallback((rows: AvailabilityRow[]) => {
    const byDay = new Map(rows.map((row) => [row.day_of_week, row]));
    setDays(defaultDays.map((day) => {
      const row = byDay.get(day.dayOfWeek);
      return row ? { ...day, enabled: row.enabled, start: row.start_time.slice(0, 5), end: row.end_time.slice(0, 5), appointmentDuration: row.appointment_duration ?? row.duration_minutes ?? day.appointmentDuration } : day;
    }));
  }, []);

  const loadAvailability = useCallback(async () => {
    setLoading(true);
    setMessage("");
    const fullResult = await supabase.from("availability").select("day_of_week, start_time, end_time, enabled, appointment_duration, duration_minutes").order("day_of_week");
    if (!fullResult.error) {
      applyRows((fullResult.data ?? []) as AvailabilityRow[]);
    } else {
      const scheduleResult = await supabase.from("availability").select("day_of_week, start_time, end_time, enabled").order("day_of_week");
      if (scheduleResult.error) setMessage(`Could not load availability: ${scheduleResult.error.message}`);
      else applyRows(scheduleResult.data as AvailabilityRow[]);
    }
    setLoading(false);
  }, [applyRows]);

  useEffect(() => { void loadAvailability(); }, [loadAvailability]);

  function updateDay(dayOfWeek: number, update: Partial<AvailabilityDay>) {
    setDays((current) => current.map((day) => day.dayOfWeek === dayOfWeek ? { ...day, ...update } : day));
    setMessage("");
  }

  async function saveAvailability() {
    setSaving(true);
    setMessage("");
    const rows = days.map((day) => ({ day_of_week: day.dayOfWeek, start_time: `${day.start}:00`, end_time: `${day.end}:00`, enabled: day.enabled, appointment_duration: day.appointmentDuration }));
    const { error } = await supabase.from("availability").upsert(rows, { onConflict: "day_of_week" });
    if (error) setMessage(`Could not save availability: ${error.message}`);
    else { setMessage("Availability saved."); await loadAvailability(); }
    setSaving(false);
  }

  return <Shell title="Availability" subtitle="Set the hours when customers can book appointments.">
    <div className="panel"><div className="head"><div><h3>Weekly availability</h3><small>Choose the days and hours available for service appointments.</small></div><button className="primary" onClick={() => void saveAvailability()} disabled={loading || saving}>{saving ? "Saving..." : "Save changes"}</button></div>
      <div className="schedule">{loading ? <div className="empty">Loading availability...</div> : days.map((day) => <div className="sched" key={day.dayOfWeek}>
        <div><b>{day.name}</b><small>{day.enabled ? "Accepting appointments" : "Unavailable"}</small></div>
        <button type="button" className={`toggle ${day.enabled ? "on" : ""}`} aria-label={`Toggle ${day.name} availability`} aria-pressed={day.enabled} onClick={() => updateDay(day.dayOfWeek, { enabled: !day.enabled })}><i /></button>
        <input aria-label={`${day.name} start time`} type="time" value={day.start} disabled={!day.enabled} onChange={(event) => updateDay(day.dayOfWeek, { start: event.target.value })}/><span>to</span>
        <input aria-label={`${day.name} end time`} type="time" value={day.end} disabled={!day.enabled} onChange={(event) => updateDay(day.dayOfWeek, { end: event.target.value })}/>
      </div>)}</div>
    </div>
    <div className="panel settings-box"><label>Appointment duration<select value={days[0]?.appointmentDuration ?? 60} disabled={loading} onChange={(event) => { const appointmentDuration = Number(event.target.value); setDays((current) => current.map((day) => ({ ...day, appointmentDuration }))); setMessage(""); }}><option value={30}>30 minutes</option><option value={45}>45 minutes</option><option value={60}>60 minutes</option><option value={90}>90 minutes</option><option value={120}>120 minutes</option></select></label></div>
    {message && <p className="availability-message" role="status">{message}</p>}
  </Shell>;
}
