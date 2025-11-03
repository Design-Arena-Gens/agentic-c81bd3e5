import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "20-Day Python + AI Planner",
  description: "Daily learning plan with reminders and calendar export",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
