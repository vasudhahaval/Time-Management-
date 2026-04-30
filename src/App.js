import { useState, useEffect, useRef } from "react";

const COLORS = {
  bg: "#0f0f13",
  card: "#16161d",
  accent: "#f5a623",
  accent2: "#e05c5c",
  accent3: "#4ecdc4",
  text: "#f0eee8",
  muted: "#6b6b7a",
  border: "#252530",
};

const TASKS_INIT = [
  { id: 1, title: "Complete Math Assignment", category: "Academic", priority: "High", duration: 60, done: false, dueDate: "2026-04-30" },
  { id: 2, title: "Read Chapter 5 – Economics", category: "Study", priority: "Medium", duration: 45, done: false, dueDate: null },
  { id: 3, title: "Project Presentation Prep", category: "Academic", priority: "High", duration: 90, done: false, dueDate: "2026-05-02" },
  { id: 4, title: "30-min Walk / Exercise", category: "Personal", priority: "Low", duration: 30, done: false, dueDate: null },
  { id: 5, title: "Revise DSA Notes", category: "Study", priority: "Medium", duration: 50, done: true, dueDate: "2026-04-28" },
];

const DISTRACTION_DATA = [
  { label: "Social Media", value: 38, color: "#e05c5c" },
  { label: "Streaming", value: 24, color: "#f5a623" },
  { label: "Gaming", value: 18, color: "#a78bfa" },
  { label: "Chatting", value: 20, color: "#4ecdc4" },
];

const TIPS = [
  "Use the Pomodoro Technique — 25 min focus, 5 min break.",
  "Write tomorrow's top 3 tasks tonight.",
  "Silence notifications during study blocks.",
  "Start with your hardest task first (Eat the Frog!).",
  "Review your schedule every Sunday evening.",
  "Batch similar tasks together to reduce context switching.",
  "Set a 'shutdown ritual' to end your study day clearly.",
];

const CATEGORY_COLOR = { Academic: "#f5a623", Study: "#4ecdc4", Personal: "#a78bfa" };

function DonutChart({ data }) {
  const size = 140, cx = 70, cy = 70, r = 50, stroke = 18;
  const circumference = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.value, 0);
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={COLORS.border} strokeWidth={stroke} />
      {data.map((d) => {
        const dash = (d.value / total) * circumference;
        const gap = circumference - dash;
        const el = (
          <circle
            key={d.label}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={d.color}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
            style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dasharray 0.6s ease" }}
          />
        );
        offset += dash;
        return el;
      })}
      <text x={cx} y={cy + 5} textAnchor="middle" fill={COLORS.text} fontSize="13" fontWeight="700" fontFamily="monospace">
        {total}%
      </text>
    </svg>
  );
}

function PomodoroTimer({ onComplete, onSessionComplete }) {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState("focus");
  const ref = useRef(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSeconds((s) => {
        if (s <= 1) { 
          clearInterval(ref.current); 
          setRunning(false); 
          onComplete && onComplete(); // Call onComplete when timer ends
          if (mode === "focus") {
            onSessionComplete && onSessionComplete(); // Increment sessions for focus
          }
          return 0; 
        }
        return s - 1;
      }), 1000);
    } else clearInterval(ref.current);
    return () => clearInterval(ref.current);
  }, [running, onComplete, onSessionComplete, mode]);

  const reset = (m) => {
    setRunning(false);
    setMode(m);
    setSeconds(m === "focus" ? 25 * 60 : 5 * 60);
  };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const total = mode === "focus" ? 25 * 60 : 5 * 60;
  const pct = ((total - seconds) / total) * 100;
  const r = 52, circ = 2 * Math.PI * r;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {["focus", "break"].map((m) => (
          <button key={m} onClick={() => reset(m)} style={{
            padding: "4px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12,
            fontFamily: "monospace", fontWeight: 600, letterSpacing: 1,
            background: mode === m ? COLORS.accent : COLORS.border,
            color: mode === m ? "#000" : COLORS.muted,
          }}>{m.toUpperCase()}</button>
        ))}
      </div>
      <svg width={130} height={130} viewBox="0 0 130 130">
        <circle cx={65} cy={65} r={r} fill="none" stroke={COLORS.border} strokeWidth={10} />
        <circle cx={65} cy={65} r={r} fill="none"
          stroke={mode === "focus" ? COLORS.accent : COLORS.accent3}
          strokeWidth={10}
          strokeDasharray={`${(pct / 100) * circ} ${circ}`}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.5s ease" }}
        />
        <text x={65} y={60} textAnchor="middle" fill={COLORS.text} fontSize="22" fontWeight="700" fontFamily="monospace">{mm}:{ss}</text>
        <text x={65} y={78} textAnchor="middle" fill={COLORS.muted} fontSize="10" fontFamily="monospace">{mode}</text>
      </svg>
      <button onClick={() => setRunning((r) => !r)} style={{
        padding: "8px 28px", borderRadius: 24, border: "none", cursor: "pointer",
        background: running ? COLORS.accent2 : COLORS.accent,
        color: "#000", fontWeight: 700, fontFamily: "monospace", fontSize: 13, letterSpacing: 1,
      }}>{running ? "PAUSE" : "START"}</button>
    </div>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : TASKS_INIT;
  });
  const [tab, setTab] = useState("dashboard");
  const [newTask, setNewTask] = useState({ title: "", category: "Academic", priority: "Medium", duration: 30 });
  const [tipIdx, setTipIdx] = useState(0);
  const [reminderDuration, setReminderDuration] = useState(() => {
    const saved = localStorage.getItem('reminderDuration');
    return saved ? parseInt(saved) : 10;
  });
  const [awayTimer, setAwayTimer] = useState(null);
  const [durationValue, setDurationValue] = useState(() => {
    const saved = localStorage.getItem('reminderDuration');
    return saved ? parseInt(saved) : 10;
  });
  const [durationUnit, setDurationUnit] = useState(() => {
    const saved = localStorage.getItem('durationUnit');
    return saved || 'seconds';
  });
  const [completedSessions, setCompletedSessions] = useState(() => {
    const saved = localStorage.getItem('completedSessions');
    return saved ? parseInt(saved) : 0;
  });
  const streak = 5;

  useEffect(() => {
    const iv = setInterval(() => setTipIdx((i) => (i + 1) % TIPS.length), 4000);
    return () => clearInterval(iv);
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Save reminder settings
  useEffect(() => {
    localStorage.setItem('reminderDuration', reminderDuration.toString());
    localStorage.setItem('durationUnit', durationUnit);
    localStorage.setItem('completedSessions', completedSessions.toString());
  }, [reminderDuration, durationUnit, completedSessions]);

  // Play beep sound
  const playBeep = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  // Handle visibility change for web version
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, start timer
        const timer = setTimeout(() => {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Reminder', {
              body: 'Your time is over now lets get back to work',
              icon: '/favicon.ico'
            });
          }
          playBeep(); // Play beep sound
        }, reminderDuration * 1000);
        setAwayTimer(timer);
      } else {
        // Tab is visible, clear timer
        if (awayTimer) {
          clearTimeout(awayTimer);
          setAwayTimer(null);
        }
      }
    };

    if (!window.electronAPI) {
      // Web version: request notification permission and listen to visibility
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [reminderDuration, awayTimer]);

  const toggleTask = (id) => setTasks((ts) => ts.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  const addTask = () => {
    if (!newTask.title.trim()) return;
    setTasks((ts) => [...ts, { ...newTask, id: Date.now(), done: false }]);
    setNewTask({ title: "", category: "Academic", priority: "Medium", duration: 30 });
  };
  const deleteTask = (id) => setTasks((ts) => ts.filter((t) => t.id !== id));

  const setReminder = async () => {
    const multiplier = durationUnit === 'minutes' ? 60 : durationUnit === 'hours' ? 3600 : 1;
    const totalSeconds = durationValue * multiplier;
    setReminderDuration(totalSeconds);

    if (window.electronAPI) {
      // Desktop app
      await window.electronAPI.setDuration(totalSeconds);
      alert(`Reminder duration set to ${durationValue} ${durationUnit}`);
    } else {
      // Web version
      alert(`Reminder duration set to ${durationValue} ${durationUnit}. Switch tabs to test.`);
    }
  };

  const done = tasks.filter((t) => t.done).length;
  const pct = Math.round((done / tasks.length) * 100);
  const totalMins = tasks.filter((t) => !t.done).reduce((s, t) => s + t.duration, 0);

  const TABS = ["dashboard", "tasks", "timer", "insights"];

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "sans-serif" }}>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${COLORS.border}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: COLORS.muted, fontFamily: "monospace", textTransform: "uppercase" }}>Student OS</div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }}>Time Manager</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: COLORS.card, padding: "6px 14px", borderRadius: 20, border: `1px solid ${COLORS.border}` }}>
          <span style={{ fontSize: 16 }}>🔥</span>
          <span style={{ fontFamily: "monospace", fontSize: 13, color: COLORS.accent }}>{streak} day streak</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${COLORS.border}`, padding: "0 24px" }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "12px 20px", background: "none", border: "none", cursor: "pointer",
            borderBottom: tab === t ? `2px solid ${COLORS.accent}` : "2px solid transparent",
            color: tab === t ? COLORS.accent : COLORS.muted,
            fontFamily: "monospace", fontSize: 11, letterSpacing: 2, textTransform: "uppercase",
            fontWeight: tab === t ? 600 : 400,
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding: "24px", maxWidth: 860, margin: "0 auto" }}>

        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
              {[
                { label: "Tasks Done", val: `${done}/${tasks.length}`, color: COLORS.accent3, icon: "✅" },
                { label: "Mins Remaining", val: `${totalMins}m`, color: COLORS.accent, icon: "⏱" },
                { label: "Focus Score", val: `${pct}%`, color: "#a78bfa", icon: "🎯" },
                { label: "Sessions", val: `${completedSessions}`, color: COLORS.accent2, icon: "🔥" },
              ].map(({ label, val, color, icon }) => (
                <div key={label} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: "18px 16px" }}>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color, fontFamily: "monospace" }}>{val}</div>
                  <div style={{ fontSize: 11, color: COLORS.muted, letterSpacing: 1, textTransform: "uppercase", marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Reminder Settings */}
            <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>App Reminder Settings</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <label style={{ fontSize: 14 }}>Duration:</label>
                <input
                  type="number"
                  value={durationValue}
                  onChange={(e) => setDurationValue(Number(e.target.value))}
                  min={1}
                  max={durationUnit === 'hours' ? 24 : durationUnit === 'minutes' ? 1440 : 3600}
                  style={{
                    background: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: COLORS.text,
                    fontSize: 14,
                    width: 80,
                    outline: "none"
                  }}
                />
                <select
                  value={durationUnit}
                  onChange={(e) => setDurationUnit(e.target.value)}
                  style={{
                    background: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 8,
                    padding: "8px 12px",
                    color: COLORS.text,
                    fontSize: 14,
                    outline: "none"
                  }}
                >
                  <option value="seconds">Seconds</option>
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                </select>
                <button
                  onClick={setReminder}
                  style={{
                    background: COLORS.accent,
                    color: "#000",
                    border: "none",
                    borderRadius: 8,
                    padding: "8px 16px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "monospace",
                    fontSize: 12
                  }}
                >
                  SET
                </button>
              </div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 8 }}>
                Set how long to wait before showing a reminder when you switch to another tab/app.
              </div>
            </div>

            <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, border: `1px solid ${COLORS.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontWeight: 600 }}>Today's Progress</span>
                <span style={{ fontFamily: "monospace", color: COLORS.accent, fontSize: 14 }}>{pct}%</span>
              </div>
              <div style={{ height: 10, background: COLORS.border, borderRadius: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${COLORS.accent3}, ${COLORS.accent})`, borderRadius: 6, transition: "width 0.6s ease" }} />
              </div>
            </div>

            <div style={{ background: `${COLORS.accent}15`, border: `1px solid ${COLORS.accent}40`, borderRadius: 14, padding: "14px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 18 }}>💡</span>
              <div>
                <div style={{ fontSize: 11, color: COLORS.accent, letterSpacing: 2, fontFamily: "monospace", marginBottom: 4 }}>TIP OF THE MOMENT</div>
                <div style={{ fontSize: 14, lineHeight: 1.5 }}>{TIPS[tipIdx]}</div>
              </div>
            </div>

            <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontWeight: 600, marginBottom: 14 }}>Upcoming Tasks</div>
              {tasks.filter((t) => !t.done).slice(0, 3).map((t) => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: CATEGORY_COLOR[t.category] || COLORS.muted, flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: 14 }}>{t.title}</div>
                  <div style={{ fontSize: 11, color: COLORS.muted, fontFamily: "monospace" }}>{t.duration}m</div>
                  <div style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: t.priority === "High" ? `${COLORS.accent2}30` : t.priority === "Medium" ? `${COLORS.accent}30` : `${COLORS.accent3}30`, color: t.priority === "High" ? COLORS.accent2 : t.priority === "Medium" ? COLORS.accent : COLORS.accent3 }}>{t.priority}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TASKS */}
        {tab === "tasks" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontWeight: 600, marginBottom: 14 }}>Add New Task</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  placeholder="Task title..."
                  style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 14px", color: COLORS.text, fontSize: 14, outline: "none" }}
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: 10 }}>
                  {[{ key: "category", opts: ["Academic", "Study", "Personal"] }, { key: "priority", opts: ["High", "Medium", "Low"] }].map(({ key, opts }) => (
                    <select key={key} value={newTask[key]} onChange={(e) => setNewTask({ ...newTask, [key]: e.target.value })}
                      style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 12px", color: COLORS.text, fontSize: 13 }}>
                      {opts.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  ))}
                  <input type="number" value={newTask.duration} min={5} max={240}
                    onChange={(e) => setNewTask({ ...newTask, duration: Number(e.target.value) })}
                    style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 12px", color: COLORS.text, fontSize: 13, width: "100%" }}
                  />
                </div>
                <button onClick={addTask} style={{ background: COLORS.accent, color: "#000", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontFamily: "monospace", letterSpacing: 1 }}>+ ADD TASK</button>
              </div>
            </div>

            {tasks.map((t) => (
              <div key={t.id} style={{ background: COLORS.card, borderRadius: 12, padding: "14px 16px", border: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 12, opacity: t.done ? 0.55 : 1 }}>
                <button onClick={() => toggleTask(t.id)} style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${t.done ? COLORS.accent3 : COLORS.muted}`, background: t.done ? COLORS.accent3 : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {t.done && <span style={{ fontSize: 12, color: "#000" }}>✓</span>}
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, textDecoration: t.done ? "line-through" : "none" }}>{t.title}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: CATEGORY_COLOR[t.category] || COLORS.muted, fontFamily: "monospace" }}>{t.category}</span>
                    <span style={{ fontSize: 11, color: COLORS.muted, fontFamily: "monospace" }}>· {t.duration}min</span>
                  </div>
                </div>
                <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 10, background: t.priority === "High" ? `${COLORS.accent2}25` : t.priority === "Medium" ? `${COLORS.accent}25` : `${COLORS.accent3}25`, color: t.priority === "High" ? COLORS.accent2 : t.priority === "Medium" ? COLORS.accent : COLORS.accent3 }}>{t.priority}</span>
                <button onClick={() => deleteTask(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.muted, fontSize: 18, padding: "0 4px" }}>×</button>
              </div>
            ))}
          </div>
        )}

        {/* TIMER */}
        {tab === "timer" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
            <div style={{ background: COLORS.card, borderRadius: 20, padding: "36px 40px", border: `1px solid ${COLORS.border}`, width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Pomodoro Timer</div>
              <div style={{ fontSize: 12, color: COLORS.muted, textAlign: "center", marginBottom: 8 }}>25 min focus · 5 min break</div>
              <PomodoroTimer onComplete={playBeep} onSessionComplete={() => setCompletedSessions(s => s + 1)} />
            </div>
            <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, border: `1px solid ${COLORS.border}`, width: "100%", maxWidth: 320 }}>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>How Pomodoro Works</div>
              {["Choose a task to work on", "Set timer for 25 minutes", "Work until timer rings", "Take a 5-minute break", "Every 4 sessions → 15 min break"].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "6px 0" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: COLORS.accent, color: "#000", fontWeight: 700, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 13, color: COLORS.muted, lineHeight: 1.6 }}>{s}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INSIGHTS */}
        {tab === "insights" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Distraction Sources</div>
              <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 16 }}>Average daily time lost by students</div>
              <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                <DonutChart data={DISTRACTION_DATA} />
                <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                  {DISTRACTION_DATA.map((d) => (
                    <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                      <div style={{ flex: 1, fontSize: 13 }}>{d.label}</div>
                      <div style={{ height: 6, width: `${d.value * 1.5}px`, background: d.color, borderRadius: 3, opacity: 0.7 }} />
                      <div style={{ fontFamily: "monospace", fontSize: 12, color: COLORS.muted, width: 36, textAlign: "right" }}>{d.value}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontWeight: 600, marginBottom: 16 }}>Impact of Time Management</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "Poor Planning", effect: "Missed deadlines, stress", icon: "📉", bad: true },
                  { label: "Good Planning", effect: "Better grades, less stress", icon: "📈", bad: false },
                  { label: "Procrastination", effect: "Last-minute panic, errors", icon: "😰", bad: true },
                  { label: "Prioritization", effect: "Steady progress, confidence", icon: "🎯", bad: false },
                ].map(({ label, effect, icon, bad }) => (
                  <div key={label} style={{ background: bad ? `${COLORS.accent2}10` : `${COLORS.accent3}10`, border: `1px solid ${bad ? COLORS.accent2 : COLORS.accent3}30`, borderRadius: 10, padding: "14px 16px" }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: bad ? COLORS.accent2 : COLORS.accent3, marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 12, color: COLORS.muted, lineHeight: 1.5 }}>{effect}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: COLORS.card, borderRadius: 14, padding: 20, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontWeight: 600, marginBottom: 14 }}>Top Strategies for Students</div>
              {[
                ["Time Blocking", "Assign fixed slots to tasks in your calendar."],
                ["Eisenhower Matrix", "Sort tasks by urgency × importance."],
                ["2-Minute Rule", "If it takes under 2 min, do it now."],
                ["Weekly Review", "Every Sunday, plan the week ahead."],
              ].map(([name, desc]) => (
                <div key={name} style={{ display: "flex", gap: 14, padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                  <div style={{ width: 6, borderRadius: 3, background: COLORS.accent, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: COLORS.accent }}>{name}</div>
                    <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 2 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}