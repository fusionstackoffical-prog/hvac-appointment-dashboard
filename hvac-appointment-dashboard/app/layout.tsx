import type { Metadata } from "next";
import "./globals.css";
import "./appointments.css";
import "./auth.css";

export const metadata: Metadata = {
  title: "Midland Comfort | HVAC Operations",
  description: "Midland Comfort HVAC appointment and service operations workspace.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
