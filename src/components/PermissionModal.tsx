import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MicOff, Keyboard, RefreshCw, ExternalLink, ShieldAlert, CheckCircle2, Volume2, Sparkles, X } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSwitchToText?: () => void;
  onRetryMic?: () => void;
  errorMessage?: string;
}

export default function PermissionModal({ onClose, onSwitchToText, onRetryMic, errorMessage }: Props) {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryResult, setRetryResult] = useState<string | null>(null);

  const handleTestMic = async () => {
    setIsRetrying(true);
    setRetryResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setRetryResult("granted");
      setTimeout(() => {
        if (onRetryMic) {
          onRetryMic();
        } else {
          onClose();
        }
      }, 700);
    } catch (err: any) {
      console.warn("Direct mic test failed:", err);
      setRetryResult("denied");
      setIsRetrying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-fade-in pointer-events-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-[#0c101a] border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(239,68,68,0.25)] flex flex-col text-white relative overflow-hidden"
      >
        {/* Glowing top line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-pink-500 to-amber-500" />
        
        {/* Header with Close */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center shrink-0 shadow-inner">
              <MicOff size={24} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
                <span>MICROPHONE PERMISSION NEEDED</span>
              </h2>
              <p className="text-xs text-white/60 font-sans">
                Zoya & JARVIS require mic access for real-time live voice conversation
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error diagnosis banner */}
        <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-3.5 mb-5 flex items-start gap-3 text-xs text-red-200">
          <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-red-300">
              {errorMessage || "Browser blocked microphone access (Permission denied)"}
            </div>
            <div className="text-[11px] text-white/70 leading-relaxed font-sans">
              Either microphone permission was denied in your browser settings, or the embedded preview container requires you to grant audio permission or open in a new browser tab.
            </div>
          </div>
        </div>
        
        {/* Step-by-step resolution */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left w-full mb-6 space-y-2.5">
          <p className="text-xs text-emerald-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={13} />
            <span>How to enable Microphone:</span>
          </p>
          <ul className="text-xs text-white/80 space-y-2 pl-1 font-sans">
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">1</span>
              <span>Click the <strong>lock (🔒)</strong> or <strong>site settings (⚙️)</strong> icon in your browser URL bar.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">2</span>
              <span>Set <strong>Microphone</strong> to <strong>"Allow"</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">3</span>
              <span>Click <strong>"Test & Reconnect Mic"</strong> below, or switch to <strong>Text / Keyboard Mode</strong>.</span>
            </li>
          </ul>
        </div>

        {/* Retry status banner */}
        {retryResult === "granted" && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Microphone permission granted! Starting voice session...</span>
          </div>
        )}

        {retryResult === "denied" && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>Permission still blocked. You can use Text Mode or open app in a new window.</span>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <button 
            onClick={handleTestMic}
            disabled={isRetrying}
            className="py-3 px-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRetrying ? "animate-spin text-black" : "text-black"} />
            <span>{isRetrying ? "Requesting..." : "Test & Reconnect Mic"}</span>
          </button>

          <button 
            onClick={() => {
              onClose();
              if (onSwitchToText) {
                onSwitchToText();
              }
            }}
            className="py-3 px-4 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-300 font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Keyboard size={14} />
            <span>Switch to Text Mode</span>
          </button>
        </div>

        {/* Secondary Options */}
        <div className="flex items-center justify-between text-xs pt-3 border-t border-white/10">
          <button
            onClick={() => {
              try {
                window.open(window.location.href, "_blank", "noopener,noreferrer");
              } catch (e) {
                window.location.reload();
              }
            }}
            className="text-white/60 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ExternalLink size={12} />
            <span>Open in New Tab</span>
          </button>

          <button 
            onClick={onClose}
            className="text-white/50 hover:text-white/80 transition-colors cursor-pointer px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10"
          >
            Dismiss
          </button>
        </div>
      </motion.div>
    </div>
  );
}
