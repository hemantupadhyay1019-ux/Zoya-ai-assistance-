import React, { useState } from "react";
import {
  X,
  Phone,
  Image,
  GraduationCap,
  Code2,
  Clock,
  Lock,
  Cpu,
  Sparkles,
  Zap,
  ListChecks,
  Search,
  ChevronRight,
  Terminal,
  RotateCcw,
  Gauge,
  ShieldAlert,
  Bot,
  Mail,
  Languages,
  RefreshCw,
  Smartphone,
  Tv,
  Play,
  Camera,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AllFunctionsModalProps {
  mode: "zoya" | "jarvis";
  talkSpeed: number;
  onSetTalkSpeed: (speed: number) => void;
  onRestartSystem: () => void;
  onClose: () => void;
  onToggleMode: (mode: "zoya" | "jarvis") => void;
  onOpenCall: () => void;
  onOpenPhoto: () => void;
  onOpenCoding: () => void;
  onOpenCyber: () => void;
  onOpenTeacher: () => void;
  onOpenReactShortcuts: () => void;
  onOpenTimetable: () => void;
  onOpenActionsLog: () => void;
  onOpenEmailNotes?: () => void;
  onOpenTranslator?: () => void;
  onOpenSoftwareUpdate?: () => void;
  onOpenMobileControl?: () => void;
  onOpenYouTube?: () => void;
  onOpenSearch?: () => void;
  onOpenInstall?: () => void;
}

export default function AllFunctionsModal({
  mode,
  talkSpeed,
  onSetTalkSpeed,
  onRestartSystem,
  onClose,
  onToggleMode,
  onOpenCall,
  onOpenPhoto,
  onOpenCoding,
  onOpenCyber,
  onOpenTeacher,
  onOpenReactShortcuts,
  onOpenTimetable,
  onOpenActionsLog,
  onOpenEmailNotes,
  onOpenTranslator,
  onOpenSoftwareUpdate,
  onOpenMobileControl,
  onOpenYouTube,
  onOpenSearch,
  onOpenInstall,
}: AllFunctionsModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const isJarvis = mode === "jarvis";

  const categories = [
    {
      id: "search-grounding",
      title: "Google Web Search & Live Intelligence",
      description: "Real-time Google Search grounding for news, sports, weather, and instant facts",
      color: "from-cyan-500/20 to-blue-600/20",
      borderColor: "border-cyan-500/30",
      badgeColor: "text-cyan-300 bg-cyan-500/10 border-cyan-500/30",
      items: [
        {
          id: "youtube-player",
          title: "YouTube Music & Video Player",
          description: "Search and play songs, stream Lofi chill beats, Arijit Singh hits & watch videos in-app or YouTube web",
          icon: Tv,
          iconColor: "text-red-400",
          action: () => {
            onClose();
            if (onOpenYouTube) onOpenYouTube();
          },
          tag: "YouTube Live",
          keywords: ["youtube", "video", "play", "song", "music", "arijit", "lofi", "stream", "watch", "listen", "audio", "track"]
        },
        {
          id: "web-search",
          title: "Google Web Search & News Grounding",
          description: "Search live weather, breaking news, sports scores, stock prices & real-time web facts",
          icon: Search,
          iconColor: "text-cyan-400",
          action: () => {
            onClose();
            if (onOpenSearch) {
              onOpenSearch();
            } else {
              onOpenActionsLog();
            }
          },
          tag: "Google Grounded",
          keywords: ["google", "search", "web", "news", "weather", "scores", "ipl", "today", "facts", "find", "lookup"]
        }
      ]
    },
    {
      id: "speed-restart",
      title: "Talk Speed & Mobile Control",
      description: "Mobile system link controller, software updates & process restart",
      color: "from-amber-500/20 to-emerald-500/20",
      borderColor: "border-amber-500/30",
      badgeColor: "text-amber-300 bg-amber-500/10 border-amber-500/30",
      items: [
        {
          id: "download-android",
          title: "Direct Download Android App / Install PWA",
          description: "1-Tap direct download, home screen installation, standalone offline launcher & QR scanner",
          icon: Download,
          iconColor: "text-pink-400",
          action: () => {
            onClose();
            if (onOpenInstall) onOpenInstall();
          },
          tag: "Direct Option",
          keywords: ["download", "install", "apk", "android", "app", "download app", "save", "home screen", "offline", "softy"]
        },
        {
          id: "mobile-control",
          title: "Mobile System Direct Link Controller",
          description: "Direct URL access, QR code mobile share, hardware triggers & deep-links",
          icon: Smartphone,
          iconColor: "text-cyan-400",
          action: () => {
            onClose();
            if (onOpenMobileControl) onOpenMobileControl();
          },
          tag: "Direct Access",
          keywords: ["mobile", "control", "link", "url", "qr", "pwa", "install", "402", "share", "friends", "system"]
        },
        {
          id: "update-software",
          title: "Master Software & Subsystems Updater",
          description: "Update all 8 software modules: Gemini 3.7 Vision, YouTube Player, Google Search Grounding, Translator & Kernel to v5.0.0 Ultra Suite",
          icon: RefreshCw,
          iconColor: "text-emerald-400",
          action: () => {
            onClose();
            if (onOpenSoftwareUpdate) onOpenSoftwareUpdate();
          },
          tag: "v5.0.0 Ultra Suite",
          keywords: ["update", "softy", "software", "update softy", "update all softy", "update all", "version", "patch", "upgrade", "manifest", "kernel", "modules"]
        },
        {
          id: "restart",
          title: "Restart AI Process & Clear Errors",
          description: "Wipe memory cache, reset audio streams, and restart Zoya/JARVIS fresh without glitches",
          icon: RotateCcw,
          iconColor: "text-amber-400",
          action: () => {
            onRestartSystem();
            onClose();
          },
          tag: "System Reset",
          keywords: ["restart", "reset", "clear", "error", "wipe", "fix", "reload", "reboot"]
        },
        {
          id: "speed-fast",
          title: `Talk Speed Booster (Current: ${talkSpeed}x)`,
          description: "Accelerate voice response output speed (1.0x normal, 1.3x fast, 1.5x rapid, 1.75x ultra)",
          icon: Gauge,
          iconColor: "text-cyan-400",
          action: () => {
            const speeds = [1.0, 1.25, 1.3, 1.5, 1.75];
            const nextIdx = (speeds.indexOf(talkSpeed) + 1) % speeds.length;
            onSetTalkSpeed(speeds[nextIdx]);
          },
          tag: `${talkSpeed}x Active Speed`,
          keywords: ["speed", "talk", "fast", "voice", "audio", "rate", "tempo", "booster"]
        }
      ]
    },
    {
      id: "comm",
      title: "Telephony & Language Translation",
      description: "Automated calls, multi-language real-time translation, and email notes",
      color: "from-cyan-500/20 to-purple-500/20",
      borderColor: "border-cyan-500/30",
      badgeColor: "text-cyan-300 bg-cyan-500/10 border-cyan-500/30",
      items: [
        {
          id: "translator",
          title: "Real-Time Multi-Language Translator",
          description: "Translate text and speech across 30+ languages (Hindi, English, Spanish, etc.) with voice TTS playback",
          icon: Languages,
          iconColor: "text-purple-400",
          action: () => {
            onClose();
            if (onOpenTranslator) onOpenTranslator();
          },
          tag: "30+ Languages",
          keywords: ["translate", "translator", "language", "hindi", "english", "spanish", "convert", "speech", "tts"]
        },
        {
          id: "call",
          title: "Call Agent & Appointments",
          description: "Place automated phone calls to doctors, restaurants, or contacts to book slots",
          icon: Phone,
          iconColor: "text-cyan-400",
          action: () => {
            onClose();
            onOpenCall();
          },
          tag: "Active Call Engine",
          keywords: ["call", "phone", "appointment", "doctor", "dentist", "book", "dial", "telephony"]
        },
        {
          id: "photo",
          title: "Camera Scanner & Photo Visual Q&A",
          description: "Capture live camera frame, upload photos, ask AI questions/solve math/code, and share via WhatsApp/Email",
          icon: Camera,
          iconColor: "text-pink-400",
          action: () => {
            onClose();
            onOpenPhoto();
          },
          tag: "Camera Vision Q&A",
          keywords: ["camera", "crame", "photo", "image", "visual", "qa", "question", "answer", "solve", "ocr", "send", "whatsapp", "picture", "share", "media", "attachment"]
        },
        {
          id: "email-notes",
          title: "Send Notes on Mail",
          description: "Dispatch classroom study notes, developer cheatsheets, and reminders via Email/Gmail",
          icon: Mail,
          iconColor: "text-amber-400",
          action: () => {
            onClose();
            if (onOpenEmailNotes) onOpenEmailNotes();
          },
          tag: "Email Dispatcher",
          keywords: ["email", "mail", "notes", "gmail", "dispatch", "send", "study", "notes on mail"]
        }
      ]
    },
    {
      id: "edu",
      title: "Education & Study Center",
      description: "Classroom lessons, developer cheatsheets, and smart study schedules",
      color: "from-amber-500/20 to-violet-500/20",
      borderColor: "border-amber-500/30",
      badgeColor: "text-amber-300 bg-amber-500/10 border-amber-500/30",
      items: [
        {
          id: "teacher",
          title: "AI Classroom Teacher",
          description: "Step-by-step topic lessons & quizzes for Class 1 to 12 (NCERT, CBSE, Science, Math)",
          icon: GraduationCap,
          iconColor: "text-amber-400",
          action: () => {
            onClose();
            onOpenTeacher();
          },
          tag: "All Grades 1-12",
          keywords: ["teacher", "teach", "class", "school", "ncert", "cbse", "math", "science", "physics", "lesson", "education"]
        },
        {
          id: "react",
          title: "React & VS Code Shortcuts",
          description: "Interactive cheat sheet, keyboard shortcuts, custom hooks, and snippet references",
          icon: Code2,
          iconColor: "text-sky-400",
          action: () => {
            onClose();
            onOpenReactShortcuts();
          },
          tag: "Dev Productivity",
          keywords: ["react", "vscode", "shortcuts", "hooks", "snippets", "code", "cheatsheet", "developer", "ide"]
        },
        {
          id: "timetable",
          title: "Timetable & Auto Alarms",
          description: "Auto-categorized study schedule (Work, Study, Personal) with voice alert alarms",
          icon: Clock,
          iconColor: "text-violet-400",
          action: () => {
            onClose();
            onOpenTimetable();
          },
          tag: "Smart Reminders",
          keywords: ["timetable", "alarm", "reminder", "schedule", "clock", "study", "time", "calendar", "alert"]
        }
      ]
    },
    {
      id: "labs",
      title: "Coding & Cybersecurity Labs",
      description: "Live software compiler, algorithms, and penetration testing simulation suite",
      color: "from-indigo-500/20 to-emerald-500/20",
      borderColor: "border-indigo-500/30",
      badgeColor: "text-indigo-300 bg-indigo-500/10 border-indigo-500/30",
      items: [
        {
          id: "coding",
          title: "Coding Tutor & Software Compiler",
          description: "Write, test, and execute JavaScript/TypeScript code snippets with instant AI debugging",
          icon: Terminal,
          iconColor: "text-indigo-400",
          action: () => {
            onClose();
            onOpenCoding();
          },
          tag: "IDE Simulator",
          keywords: ["coding", "code", "compiler", "javascript", "typescript", "python", "debug", "ide", "terminal", "program"]
        },
        {
          id: "cyber",
          title: "Cyber Security & Ethical Hacking",
          description: "Port scanner, network penetration testing, SQL injection, and security audit lab",
          icon: Lock,
          iconColor: "text-emerald-400",
          action: () => {
            onClose();
            onOpenCyber();
          },
          tag: "Hacking Sandbox",
          keywords: ["cyber", "security", "hacking", "ethical", "nmap", "sql", "penetration", "audit", "lock", "shield"]
        }
      ]
    },
    {
      id: "system",
      title: "System Persona & Action Log",
      description: "Persona switching and complete history log of past activities",
      color: "from-pink-500/20 to-cyan-500/20",
      borderColor: "border-pink-500/30",
      badgeColor: "text-pink-300 bg-pink-500/10 border-pink-500/30",
      items: [
        {
          id: "mode-zoya",
          title: "Switch to Zoya Sassy Persona",
          description: "Fun, energetic, witty Indian assistant persona with quick roasts & catchphrases",
          icon: Sparkles,
          iconColor: "text-pink-400",
          action: () => {
            onToggleMode("zoya");
            onClose();
          },
          tag: mode === "zoya" ? "CURRENT ACTIVE" : "Switch Mode",
          keywords: ["zoya", "sassy", "mode", "persona", "roast", "catchphrase", "fun"]
        },
        {
          id: "mode-jarvis",
          title: "Switch to JARVIS Iron Man Mode",
          description: "Tactical, arc-reactor holographic HUD, futuristic defense computer voice persona",
          icon: Zap,
          iconColor: "text-cyan-400",
          action: () => {
            onToggleMode("jarvis");
            onClose();
          },
          tag: mode === "jarvis" ? "CURRENT ACTIVE" : "Switch Mode",
          keywords: ["jarvis", "ironman", "mode", "hud", "tactical", "arc", "reactor"]
        },
        {
          id: "actions-log",
          title: "Completed Actions Log",
          description: "View full past record of calls, appointment confirmations, photos sent, and reminders",
          icon: ListChecks,
          iconColor: "text-cyan-300",
          action: () => {
            onClose();
            onOpenActionsLog();
          },
          tag: "History Records",
          keywords: ["actions", "log", "history", "records", "completed", "past", "calls", "photos", "reminders"]
        }
      ]
    }
  ];

  const q = searchQuery.toLowerCase().trim();

  const filteredCategories = categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => {
        if (!q) return true;
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesTag = item.tag.toLowerCase().includes(q);
        const matchesCatTitle = cat.title.toLowerCase().includes(q);
        const matchesCatDesc = cat.description.toLowerCase().includes(q);
        const matchesKeywords = item.keywords?.some((k) => k.toLowerCase().includes(q));
        return matchesTitle || matchesDesc || matchesTag || matchesCatTitle || matchesCatDesc || matchesKeywords;
      })
    }))
    .filter((cat) => cat.items.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xl animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl max-h-[90vh] bg-[#090d18]/95 border border-cyan-500/30 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden text-white"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500 to-pink-500 text-black font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <Zap size={20} className="fill-black" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
                <span>ALL FUNCTIONS & OPERATIONS HUB</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                  Single Menu
                </span>
              </h2>
              <p className="text-xs text-white/60">
                Access all Zoya & JARVIS tools, labs, telephony agents, teacher classroom, shortcuts & reminders
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-white/10 bg-black/40 shrink-0">
          <div className="relative flex items-center">
            <Search size={16} className="absolute left-3.5 text-cyan-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all functions (e.g. Call, Teacher, Shortcuts, Cyber, Timetable...)"
              className="w-full bg-[#111626] border border-cyan-500/30 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/40 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 text-xs text-white/50 hover:text-white cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Function Grid Categories */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {filteredCategories.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center opacity-50">
              <Search size={36} className="mb-2 text-cyan-400" />
              <p className="text-sm font-semibold">No functions matched "{searchQuery}"</p>
              <p className="text-xs text-white/60">Try searching for call, teacher, react, or cyber</p>
            </div>
          ) : (
            filteredCategories.map((cat) => (
              <div key={cat.id} className="space-y-3">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <span className={`text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${cat.badgeColor}`}>
                    {cat.title}
                  </span>
                  <span className="text-xs text-white/40 font-mono hidden sm:inline">
                    — {cat.description}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {cat.items.map((item) => {
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={item.action}
                        className={`p-4 rounded-2xl border ${cat.borderColor} bg-gradient-to-br ${cat.color} hover:bg-white/10 transition-all text-left flex items-start gap-3.5 group cursor-pointer shadow-lg hover:scale-[1.01]`}
                      >
                        <div className="p-3 rounded-xl bg-black/40 border border-white/10 shrink-0 group-hover:scale-110 transition-transform">
                          <IconComp size={20} className={item.iconColor} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors truncate">
                              {item.title}
                            </h4>
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-black/40 border border-white/10 text-white/70 shrink-0">
                              {item.tag}
                            </span>
                          </div>
                          <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        <ChevronRight size={16} className="text-white/30 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all self-center shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/50 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-white/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>JARVIS Unified Command Interface Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors cursor-pointer"
          >
            Close Menu
          </button>
        </div>
      </motion.div>
    </div>
  );
}
