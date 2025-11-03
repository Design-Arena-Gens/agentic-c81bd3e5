"use client";
import { useEffect, useMemo, useState } from "react";
import { TOPICS } from "@/lib/topics";
import { QUOTES } from "@/lib/quotes";
import { computeDayIndex, formatCountdown, getLocalISODate, getNextReminderDate } from "@/lib/time";
import { generateIcsForPlan } from "@/lib/ics";

type Settings = {
  startDateISO: string; // yyyy-mm-dd (local)
  reminderTime: string; // HH:MM 24h
};

const DEFAULT_SETTINGS: Settings = {
  startDateISO: getLocalISODate(new Date()),
  reminderTime: "09:00",
};

export default function Page() {
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("planner:settings");
      if (raw) {
        try { return JSON.parse(raw) as Settings; } catch {}
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [completed, setCompleted] = useState<boolean[]>(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("planner:completed");
      if (raw) {
        try { return JSON.parse(raw) as boolean[]; } catch {}
      }
    }
    return Array(TOPICS.length).fill(false);
  });

  const todayIndex = useMemo(() => {
    return computeDayIndex(settings.startDateISO, new Date());
  }, [settings.startDateISO]);

  const progressPct = useMemo(() => {
    const done = completed.filter(Boolean).length;
    return Math.round((done / TOPICS.length) * 100);
  }, [completed]);

  useEffect(() => {
    localStorage.setItem("planner:settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem("planner:completed", JSON.stringify(completed));
  }, [completed]);

  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  const nextReminder = useMemo(() => getNextReminderDate(settings.startDateISO, settings.reminderTime, new Date()), [settings.startDateISO, settings.reminderTime]);
  const [countdown, setCountdown] = useState<string>(() => formatCountdown(nextReminder, new Date()));

  useEffect(() => {
    const id = setInterval(() => setCountdown(formatCountdown(nextReminder, new Date())), 1000);
    return () => clearInterval(id);
  }, [nextReminder]);

  function toggleComplete(index: number) {
    setCompleted(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }

  async function requestNotifyOnce() {
    if (!("Notification" in window)) return alert("Notifications not supported in this browser");
    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }
    if (Notification.permission !== "granted") return alert("Please enable notifications");
    const ms = Math.max(0, nextReminder.getTime() - Date.now());
    setTimeout(() => {
      new Notification("Time to study!", {
        body: `Today: ${TOPICS[Math.min(todayIndex, TOPICS.length - 1)]}`,
        tag: "planner-reminder",
      });
    }, ms);
    alert("Reminder scheduled for this session.");
  }

  function downloadICS() {
    const blob = new Blob([generateIcsForPlan(settings.startDateISO, settings.reminderTime)], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "20-day-python-ai-plan.ics";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="container">
      <div className="header">
        <div>
          <div className="title">20-Day Python + AI Planner</div>
          <div className="subtitle">Daily topics, gentle reminders, and calendar export</div>
        </div>
        <div className="row">
          <button className="btn" onClick={downloadICS}>Add to Calendar (.ics)</button>
          <button className="btn secondary" onClick={requestNotifyOnce}>Schedule Local Reminder</button>
        </div>
      </div>

      <div className="grid" style={{ marginTop: 16 }}>
        <section className="card">
          <h3>Today's Focus</h3>
          <div className="small">Motivation: {quote}</div>
          <div style={{ marginTop: 10, padding: 12, borderRadius: 10, background: "#0f172a", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              Day {Math.min(todayIndex + 1, TOPICS.length)} of {TOPICS.length}
            </div>
            <div style={{ marginTop: 6 }}>{TOPICS[Math.min(todayIndex, TOPICS.length - 1)]}</div>
            <div className="small" style={{ marginTop: 6 }}>
              Next reminder in: <span className="badge">{countdown}</span>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <div className="progress"><span style={{ width: `${progressPct}%` }} /></div>
            <div className="small" style={{ marginTop: 6 }}>{progressPct}% complete</div>
          </div>
          <div style={{ marginTop: 16 }} className="row">
            <label style={{ display: "grid", gap: 6 }}>
              <span className="small">Start date</span>
              <input
                className="input"
                type="date"
                value={settings.startDateISO}
                onChange={(e) => setSettings(s => ({ ...s, startDateISO: e.target.value }))}
              />
            </label>
            <label style={{ display: "grid", gap: 6 }}>
              <span className="small">Reminder time</span>
              <input
                className="input"
                type="time"
                value={settings.reminderTime}
                onChange={(e) => setSettings(s => ({ ...s, reminderTime: e.target.value }))}
              />
            </label>
          </div>
        </section>

        <section className="card">
          <h3>All Topics</h3>
          <ul className="list">
            {TOPICS.map((t, i) => (
              <li key={i}>
                <input
                  type="checkbox"
                  checked={!!completed[i]}
                  onChange={() => toggleComplete(i)}
                  aria-label={`Mark Day ${i + 1} complete`}
                />
                <div style={{ display: "grid" }}>
                  <div style={{ fontWeight: 600 }}>Day {i + 1}</div>
                  <div className="small">{t}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card" style={{ marginTop: 16 }}>
        <h3>Tips</h3>
        <div className="small">- Use <span className="kbd">Add to Calendar</span> for reliable reminders on any device.</div>
        <div className="small">- <span className="kbd">Schedule Local Reminder</span> works while this page stays open.</div>
      </section>
    </div>
  );
}
