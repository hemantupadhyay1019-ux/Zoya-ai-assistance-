import React, { useState, useEffect } from "react";
import { Clock, Bell, Plus, Trash2, CheckCircle, AlertCircle, Sparkles, Volume2, X, Play, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TimetableSlot } from "../types/assistant";
import { getZoyaAudio } from "../services/geminiService";
import { playPCM } from "../utils/audioUtils";

interface TimetableReminderModalProps {
  onClose: () => void;
  onSlotAdded?: (slot: TimetableSlot) => void;
}

const DEFAULT_TIMETABLE: TimetableSlot[] = [
  {
    id: "t1",
    time: "08:00 AM",
    activity: "Morning Revision & Daily Planning",
    category: "Study",
    alertEnabled: true,
    isCompleted: false
  },
  {
    id: "t2",
    time: "09:30 AM",
    activity: "React & Full-Stack Coding Session",
    category: "Work",
    alertEnabled: true,
    isCompleted: false
  },
  {
    id: "t3",
    time: "01:00 PM",
    activity: "Lunch Break & Relax",
    category: "Break",
    alertEnabled: false,
    isCompleted: false
  },
  {
    id: "t4",
    time: "03:00 PM",
    activity: "Math & Science / Physics Problem Solving",
    category: "Study",
    alertEnabled: true,
    isCompleted: false
  },
  {
    id: "t5",
    time: "06:00 PM",
    activity: "Gym, Fitness & Evening Walk",
    category: "Fitness",
    alertEnabled: true,
    isCompleted: false
  },
  {
    id: "t6",
    time: "08:30 PM",
    activity: "Cyber Security & Code Review with Zoya",
    category: "Study",
    alertEnabled: true,
    isCompleted: false
  }
];

export default function TimetableReminderModal({ onClose, onSlotAdded }: TimetableReminderModalProps) {
  const [slots, setSlots] = useState<TimetableSlot[]>(() => {
    const saved = localStorage.getItem("zoya_timetable_slots");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_TIMETABLE;
      }
    }
    return DEFAULT_TIMETABLE;
  });

  const [newTime, setNewTime] = useState("07:00 PM");
  const [newActivity, setNewActivity] = useState("");
  const [newCategory, setNewCategory] = useState<TimetableSlot["category"]>("Study");
  const [activeAlertMsg, setActiveAlertMsg] = useState<string | null>(null);
  const [isAlertTesting, setIsAlertTesting] = useState(false);

  useEffect(() => {
    localStorage.setItem("zoya_timetable_slots", JSON.stringify(slots));
  }, [slots]);

  const detectCategory = (text: string): TimetableSlot["category"] => {
    const lower = text.toLowerCase();
    
    // Study keywords
    if (
      lower.includes("study") ||
      lower.includes("math") ||
      lower.includes("physics") ||
      lower.includes("science") ||
      lower.includes("lesson") ||
      lower.includes("revision") ||
      lower.includes("exam") ||
      lower.includes("quiz") ||
      lower.includes("class") ||
      lower.includes("lecture") ||
      lower.includes("homework") ||
      lower.includes("chapter") ||
      lower.includes("tutor") ||
      lower.includes("read") ||
      lower.includes("calculus") ||
      lower.includes("algebra")
    ) {
      return "Study";
    }

    // Work keywords
    if (
      lower.includes("work") ||
      lower.includes("code") ||
      lower.includes("coding") ||
      lower.includes("react") ||
      lower.includes("project") ||
      lower.includes("meeting") ||
      lower.includes("client") ||
      lower.includes("office") ||
      lower.includes("deploy") ||
      lower.includes("dev") ||
      lower.includes("bug") ||
      lower.includes("email") ||
      lower.includes("report") ||
      lower.includes("presentation") ||
      lower.includes("github")
    ) {
      return "Work";
    }

    // Fitness keywords
    if (
      lower.includes("gym") ||
      lower.includes("workout") ||
      lower.includes("run") ||
      lower.includes("fitness") ||
      lower.includes("walk") ||
      lower.includes("yoga") ||
      lower.includes("exercise") ||
      lower.includes("cardio") ||
      lower.includes("sport")
    ) {
      return "Fitness";
    }

    // Break keywords
    if (
      lower.includes("lunch") ||
      lower.includes("dinner") ||
      lower.includes("breakfast") ||
      lower.includes("break") ||
      lower.includes("relax") ||
      lower.includes("coffee") ||
      lower.includes("tea") ||
      lower.includes("nap") ||
      lower.includes("snack")
    ) {
      return "Break";
    }

    // Personal keywords
    if (
      lower.includes("doctor") ||
      lower.includes("dentist") ||
      lower.includes("family") ||
      lower.includes("movie") ||
      lower.includes("shopping") ||
      lower.includes("friend") ||
      lower.includes("game") ||
      lower.includes("gaming") ||
      lower.includes("personal")
    ) {
      return "Personal";
    }

    return "Study";
  };

  const handleActivityChange = (val: string) => {
    setNewActivity(val);
    if (val.trim()) {
      const autoCat = detectCategory(val);
      setNewCategory(autoCat);
    }
  };

  const addSlot = () => {
    if (!newActivity.trim()) return;
    const detected = detectCategory(newActivity);
    const newSlot: TimetableSlot = {
      id: "t-" + Date.now(),
      time: newTime,
      activity: newActivity.trim(),
      category: newCategory || detected,
      alertEnabled: true,
      isCompleted: false
    };
    setSlots((prev) => [...prev, newSlot]);
    if (onSlotAdded) {
      onSlotAdded(newSlot);
    }
    setNewActivity("");
  };

  const deleteSlot = (id: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleSlotComplete = (id: string) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isCompleted: !s.isCompleted } : s))
    );
  };

  const toggleAlert = (id: string) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, alertEnabled: !s.alertEnabled } : s))
    );
  };

  const triggerLiveAlert = async (slot: TimetableSlot) => {
    setIsAlertTesting(true);
    const alertText = `Hemant! Attention please! It is now ${slot.time}. Time for your scheduled task: "${slot.activity}". Get ready to focus!`;
    setActiveAlertMsg(alertText);

    // Audio beep simulation
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.5);

    // Zoya voice notification
    const audioBase64 = await getZoyaAudio(alertText);
    if (audioBase64) {
      await playPCM(audioBase64);
    }
    setIsAlertTesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl bg-[#0a0d18] border border-violet-500/30 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(139,92,246,0.2)] flex flex-col h-[85vh] text-white relative"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-violet-950/70 via-[#120a24] to-pink-950/70 border-b border-violet-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <Clock size={22} className="animate-spin" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono tracking-wider text-violet-300 uppercase flex items-center gap-2">
                TIMETABLE & STUDY REMINDER ALARM ENGINE <Bell size={16} className="text-pink-400 animate-bounce" />
              </h2>
              <p className="text-xs text-white/60 font-mono">Automatic Reminders & Voice Alerts for Hemant's Work & Study Schedules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Live Active Alert Banner if triggered */}
        <AnimatePresence>
          {activeAlertMsg && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-gradient-to-r from-pink-600 to-violet-600 p-3 px-6 flex items-center justify-between text-xs font-mono font-bold text-white shrink-0 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Bell size={16} className="animate-bounce" />
                <span>{activeAlertMsg}</span>
              </div>
              <button
                onClick={() => setActiveAlertMsg(null)}
                className="bg-black/30 hover:bg-black/50 px-2.5 py-1 rounded text-[10px] uppercase cursor-pointer"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add New Schedule Bar */}
        <div className="p-4 bg-black/40 border-b border-white/10 flex flex-wrap items-center gap-3 text-xs font-mono shrink-0">
          <input
            type="text"
            value={newTime}
            onChange={(e) => setNewTime(e.target.value)}
            placeholder="Time (e.g. 10:00 AM)"
            className="bg-[#121626] border border-white/15 rounded-xl px-3 py-2 text-white outline-none w-32 focus:border-violet-400"
          />

          <input
            type="text"
            value={newActivity}
            onChange={(e) => handleActivityChange(e.target.value)}
            placeholder="Activity (e.g. Physics Revision, React Coding, Gym Workout...)"
            className="flex-1 min-w-[200px] bg-[#121626] border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-violet-400"
          />

          <div className="flex items-center gap-1.5">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="bg-[#121626] border border-violet-500/30 rounded-xl px-3 py-2 text-white outline-none focus:border-violet-400"
            >
              <option value="Work">Work</option>
              <option value="Study">Study</option>
              <option value="Personal">Personal</option>
              <option value="Fitness">Fitness</option>
              <option value="Break">Break</option>
            </select>
            {newActivity.trim().length > 2 && (
              <span className="hidden sm:inline-block px-2 py-1 rounded-md bg-violet-500/20 border border-violet-500/40 text-[10px] text-violet-300 font-mono flex items-center gap-1">
                <Sparkles size={10} className="text-pink-400 animate-pulse" />
                Auto
              </span>
            )}
          </div>

          <button
            onClick={addSlot}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-bold flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Slot</span>
          </button>
        </div>

        {/* Timetable Slots Directory */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 text-left">
          {slots.map((slot) => {
            const getCategoryColor = (cat: string) => {
              switch (cat) {
                case "Study":
                  return "bg-amber-500/20 border-amber-500/40 text-amber-300";
                case "Work":
                  return "bg-cyan-500/20 border-cyan-500/40 text-cyan-300";
                case "Fitness":
                  return "bg-emerald-500/20 border-emerald-500/40 text-emerald-300";
                case "Break":
                  return "bg-pink-500/20 border-pink-500/40 text-pink-300";
                default:
                  return "bg-violet-500/20 border-violet-500/40 text-violet-300";
              }
            };

            return (
              <div
                key={slot.id}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                  slot.isCompleted
                    ? "bg-white/5 border-white/10 opacity-50 line-through"
                    : "bg-[#090d1c] border-violet-500/25 hover:border-violet-500/40 shadow-xl"
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Completion checkbox */}
                  <button
                    onClick={() => toggleSlotComplete(slot.id)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                      slot.isCompleted
                        ? "bg-emerald-500 border-emerald-400 text-black"
                        : "border-white/20 hover:border-violet-400"
                    }`}
                  >
                    {slot.isCompleted && <CheckCircle size={16} />}
                  </button>

                  {/* Time Badge */}
                  <div className="bg-black/60 border border-violet-500/30 px-3 py-1.5 rounded-xl font-mono text-xs font-bold text-violet-300">
                    {slot.time}
                  </div>

                  {/* Category Tag */}
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${getCategoryColor(
                      slot.category
                    )}`}
                  >
                    {slot.category}
                  </span>

                  {/* Activity Name */}
                  <span className="text-sm font-semibold text-white">{slot.activity}</span>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => triggerLiveAlert(slot)}
                    disabled={isAlertTesting}
                    className="px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 text-pink-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    title="Test Zoya Voice Alarm Alert"
                  >
                    <Volume2 size={14} className={isAlertTesting ? "animate-bounce" : ""} />
                    <span>Test Alert</span>
                  </button>

                  <button
                    onClick={() => toggleAlert(slot.id)}
                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                      slot.alertEnabled
                        ? "bg-violet-500/20 border-violet-500 text-violet-300"
                        : "bg-white/5 border-white/10 text-white/40"
                    }`}
                    title={slot.alertEnabled ? "Alerts Enabled" : "Alerts Disabled"}
                  >
                    <Bell size={16} className={slot.alertEnabled ? "text-violet-400 animate-pulse" : ""} />
                  </button>

                  <button
                    onClick={() => deleteSlot(slot.id)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 border border-white/10 transition-colors cursor-pointer"
                    title="Delete Slot"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
