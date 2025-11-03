export function getLocalISODate(d: Date): string {
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60_000);
  return local.toISOString().slice(0, 10);
}

export function parseLocalDateISO(isoDate: string): Date {
  const [y, m, day] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, day);
}

export function combineLocalDateAndTime(isoDate: string, hhmm: string): Date {
  const [y, m, day] = isoDate.split("-").map(Number);
  const [hh, mm] = hhmm.split(":").map(Number);
  return new Date(y, m - 1, day, hh, mm, 0, 0);
}

export function computeDayIndex(startDateISO: string, now: Date): number {
  const start = parseLocalDateISO(startDateISO);
  const msPerDay = 86_400_000;
  const diff = Math.floor((stripTime(now).getTime() - stripTime(start).getTime()) / msPerDay);
  return Math.max(0, Math.min(diff, 19));
}

export function stripTime(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function getNextReminderDate(startDateISO: string, hhmm: string, now: Date): Date {
  let target = combineLocalDateAndTime(getLocalISODate(now), hhmm);
  if (target.getTime() <= now.getTime()) {
    // tomorrow at reminder time
    target = new Date(target.getTime() + 86_400_000);
  }
  return target;
}

export function formatCountdown(target: Date, now: Date): string {
  const ms = Math.max(0, target.getTime() - now.getTime());
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}
