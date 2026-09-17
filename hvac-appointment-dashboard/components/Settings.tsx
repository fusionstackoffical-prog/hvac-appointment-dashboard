import { Building2, Mail, MapPin, LockKeyhole } from "lucide-react";
import Shell from "./Shell";
import { SectionCard } from "./ui";

const fields = [["Business name", "Midland Comfort HVAC"], ["Business location", "Midland, Texas"], ["Business email", "hello@midlandcomfort.com"], ["Business phone", "(432) 555-0100"]] as const;

export default function Settings() {
  return <Shell title="Settings" subtitle="The details behind your service business.">
    <div className="workspace-intro"><div className="intro-icon"><Building2 size={21}/></div><div><h2>Business profile</h2><p>Your business identity and contact information.</p></div><span className="readonly-label"><LockKeyhole size={14}/>Read-only profile</span></div>
    <div className="settings-layout"><div className="business-card"><span className="business-monogram">MC<span/></span><span className="eyebrow">MIDLAND COMFORT</span><h2>Comfort is<br />our business.</h2><p>Heating, ventilation &<br />air conditioning</p><div className="business-location"><MapPin size={15}/>Midland, Texas</div></div>
      <div className="settings-panels"><SectionCard title="Business identity" description="The name and location of your business." action={<Building2 size={18} className="muted"/>}><div className="fields">{fields.slice(0, 2).map(([label, value]) => <label key={label}>{label}<input value={value} readOnly/></label>)}</div></SectionCard>
      <SectionCard title="Contact information" description="Your business contact details." action={<Mail size={18} className="muted"/>}><div className="fields">{fields.slice(2).map(([label, value]) => <label key={label}>{label}<input value={value} readOnly/></label>)}</div></SectionCard>
      <p className="settings-note"><LockKeyhole size={15}/>This profile is currently view-only. Editing is not available.</p></div>
    </div>
  </Shell>;
}
