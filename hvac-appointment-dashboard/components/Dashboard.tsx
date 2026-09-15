import Shell from "./Shell";
import { ArrowUpRight, CalendarDays, CheckCircle2, Clock3, Users, type LucideIcon } from "lucide-react";

const appointments = [["10:00 AM", "John Smith", "AC Repair", "Midland, TX", "Confirmed"], ["1:00 PM", "Sarah Lee", "Maintenance", "Odessa, TX", "Confirmed"], ["9:00 AM", "Mike Brown", "Heating Repair", "Midland, TX", "Pending"], ["2:30 PM", "Emily Davis", "AC Installation", "Stanton, TX", "Confirmed"]] as const;
const stats: [string, string, string, LucideIcon][] = [["Total Leads", "32", "+18%", Users], ["Today's Appointments", "5", "+2", CalendarDays], ["Upcoming Appointments", "14", "+4", Clock3], ["Completed", "9", "+12%", CheckCircle2]];
const leads = ["John Smith · AC Repair", "Sarah Lee · Maintenance", "Mike Brown · Heating Repair", "Jessica Moore · AC Repair"] as const;

export default function Dashboard() {
  return <Shell title="Dashboard" subtitle="A clear view of today's leads and appointments.">
    <div className="stats">{stats.map(([label, value, change, Icon]) => <div className="stat" key={label}><span><Icon /></span><div><small>{label}</small><h2>{value}</h2><em>{change} <i>vs last period</i></em></div></div>)}</div>
    <div className="cols"><div className="panel"><div className="head"><div><h3>Today's Appointments</h3><small>September 16, 2026</small></div><a href="/appointments">View all <ArrowUpRight size={14} /></a></div>{appointments.map((appointment) => <div className="row" key={`${appointment[0]}-${appointment[1]}`}><time>{appointment[0]}</time><div className="person"><strong>{appointment[1]}</strong><small>{appointment[2]} · {appointment[3]}</small></div><b className={`badge ${appointment[4].toLowerCase()}`}>{appointment[4]}</b></div>)}</div>
      <div className="panel"><div className="head"><div><h3>Recent Leads</h3><small>Latest service requests</small></div><a href="/leads">View all</a></div>{leads.map((lead, index) => { const [name, service] = lead.split(" · "); return <div className="lead" key={lead}><strong>{name[0]}{name.split(" ")[1][0]}</strong><div><b>{name}</b><small>{service}</small></div><span>{index < 2 ? "Booked" : "New"}</span></div>; })}</div></div>
    <div className="panel"><div className="head"><div><h3>Upcoming Appointments</h3><small>Next scheduled service calls</small></div></div><div className="table"><div className="tr th"><b>Customer</b><b>Service</b><b>Date</b><b>Time</b><b>Status</b></div>{appointments.slice(1).map((appointment) => <div className="tr" key={`${appointment[0]}-${appointment[1]}`}><span>{appointment[1]}</span><span>{appointment[2]}</span><span>Sep 16, 2026</span><span>{appointment[0]}</span><span className="badge confirmed">{appointment[4]}</span></div>)}</div></div>
  </Shell>;
}
