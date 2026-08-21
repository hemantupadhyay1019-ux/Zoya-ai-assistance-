import React, { useState } from "react";
import { Shield, Cpu, Activity, Phone, Image, Code2, Sparkles, Zap, Radio, Globe, Lock, GraduationCap, Clock, Menu, Grid, RotateCcw, Gauge, Download, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AllFunctionsModal from "./AllFunctionsModal";

interface JarvisHudProps {
  mode: "zoya" | "jarvis";
  talkSpeed: number;
  onSetTalkSpeed: (speed: number) => void;
  onRestartSystem: () => void;
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

export default function JarvisHud({
  mode,
  talkSpeed,
  onSetTalkSpeed,
  onRestartSystem,
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
}: JarvisHudProps) {
  const isJarvis = mode === "jarvis";
  const [showAllMenu, setShowAllMenu] = useState(false);

  return (
    <div className="w-full flex flex-col items-center gap-3 z-20 pointer-events-auto my-1">
      {/* Mode Switcher Banner */}
      <div className="bg-[#080d1a]/90 border border-cyan-500/30 rounded-full p-1.5 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.2)] flex items-center gap-2">
        <button
          onClick={() => onToggleMode("zoya")}
          className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            !isJarvis
              ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-lg"
              : "text-white/60 hover:text-white"
          }`}
        >
          <span>💅 Zoya Sassy AI</span>
        </button>

        <button
          onClick={() => onToggleMode("jarvis")}
          className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            isJarvis
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_20px_rgba(6,182,212,0.5)]"
              : "text-white/60 hover:text-white"
          }`}
        >
          <Zap size={14} className={isJarvis ? "fill-black" : ""} />
          <span>🤖 JARVIS Iron Man Mode</span>
        </button>
      </div>

      {/* Holographic Arc Reactor Hud Badges (when in JARVIS mode) */}
      {isJarvis && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-mono"
        >
          <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Cpu size={12} className="animate-spin text-cyan-400" />
            <span>Quantum Core: 99.8%</span>
          </div>

          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Shield size={12} className="text-emerald-400" />
            <span>Cyber Shield: Active</span>
          </div>

          <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1.5">
            <GraduationCap size={12} className="text-amber-400" />
            <span>AI Teacher: All Classes</span>
          </div>
        </motion.div>
      )}

      {/* Single Unified Command Bar - ALL FUNCTIONS IN ONE MENU */}
      <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl">
        {/* Main "⚡ ALL FUNCTIONS MENU" Button */}
        <button
          onClick={() => setShowAllMenu(true)}
          className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-pink-600 text-white font-mono font-bold text-xs sm:text-sm flex items-center gap-2.5 sm:gap-3 transition-all shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:shadow-[0_0_45px_rgba(6,182,212,0.8)] hover:scale-105 cursor-pointer border border-white/30"
          title="Open Master Menu - Access All Functions & Tools in One Place"
        >
          <Grid size={18} className="text-cyan-200 animate-pulse" />
          <span className="tracking-wide">⚡ ALL FUNCTIONS MENU</span>
          <span className="bg-black/40 text-cyan-200 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full border border-white/20 uppercase">
            Master Hub ({talkSpeed}x Speed)
          </span>
        </button>

        {/* Direct Android Download Option */}
        {onOpenInstall && (
          <button
            onClick={onOpenInstall}
            className="px-3.5 py-2.5 sm:py-3 rounded-2xl bg-pink-500/15 border border-pink-500/40 hover:bg-pink-500/25 text-pink-300 hover:text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-lg hover:scale-105 cursor-pointer"
            title="Direct Download & Install Android App (1-Tap WebAPK & PWA)"
          >
            <Download size={15} className="text-pink-400 animate-bounce" />
            <span>Download Android App</span>
          </button>
        )}

        {/* Quick Process Restart */}
        <button
          onClick={onRestartSystem}
          className="px-3 py-2.5 sm:py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 hover:text-white text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-lg hover:scale-105 cursor-pointer"
          title="Restart AI Session & Clear System Errors"
        >
          <RotateCcw size={14} className="text-amber-400" />
          <span className="hidden sm:inline">Restart</span>
        </button>
      </div>

      {/* Modal for All Functions */}
      <AnimatePresence>
        {showAllMenu && (
          <AllFunctionsModal
            mode={mode}
            talkSpeed={talkSpeed}
            onSetTalkSpeed={onSetTalkSpeed}
            onRestartSystem={onRestartSystem}
            onClose={() => setShowAllMenu(false)}
            onToggleMode={onToggleMode}
            onOpenCall={onOpenCall}
            onOpenPhoto={onOpenPhoto}
            onOpenCoding={onOpenCoding}
            onOpenCyber={onOpenCyber}
            onOpenTeacher={onOpenTeacher}
            onOpenReactShortcuts={onOpenReactShortcuts}
            onOpenTimetable={onOpenTimetable}
            onOpenActionsLog={onOpenActionsLog}
            onOpenEmailNotes={onOpenEmailNotes}
            onOpenTranslator={onOpenTranslator}
            onOpenSoftwareUpdate={onOpenSoftwareUpdate}
            onOpenMobileControl={onOpenMobileControl}
            onOpenYouTube={onOpenYouTube}
            onOpenSearch={onOpenSearch}
            onOpenInstall={onOpenInstall}
          />
        )}
      </AnimatePresence>
    </div>
  );
}


