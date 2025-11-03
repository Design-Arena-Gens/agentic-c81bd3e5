import { TOPICS } from "./topics";
import { combineLocalDateAndTime, parseLocalDateISO } from "./time";

function formatICSDate(d: Date): string {
  // UTC basic format: YYYYMMDDTHHMMSSZ
  const pad = (n: number) => n.toString().padStart(2, "0");
  const y = d.getUTCFullYear();
  const m = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const hh = pad(d.getUTCHours());
  const mm = pad(d.getUTCMinutes());
  const ss = pad(d.getUTCSeconds());
  return `${y}${m}${day}T${hh}${mm}${ss}Z`;
}

export function generateIcsForPlan(startDateISO: string, reminderTime: string): string {
  const start = parseLocalDateISO(startDateISO);
  const lines: string[] = [];
  lines.push("BEGIN:VCALENDAR");
  lines.push("VERSION:2.0");
  lines.push("PRODID:-//20-Day Python + AI Planner//EN");

  for (let i = 0; i < TOPICS.length; i++) {
    const dayDate = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const localStart = combineLocalDateAndTime(dayDate.toISOString().slice(0, 10), reminderTime);
    const dtStart = formatICSDate(localStart);
    const end = new Date(localStart.getTime() + 60 * 60 * 1000);
    const dtEnd = formatICSDate(end);
    const uid = `day-${i + 1}-${localStart.getTime()}@20day-python-ai`;

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${formatICSDate(new Date())}`);
    lines.push(`DTSTART:${dtStart}`);
    lines.push(`DTEND:${dtEnd}`);
    lines.push(`SUMMARY:Day ${i + 1} ? ${TOPICS[i]}`);
    lines.push(`DESCRIPTION:20-Day Python + AI Planner`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
