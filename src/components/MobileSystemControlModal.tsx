import React, { useState, useEffect } from "react";
import {
  X,
  Smartphone,
  Link,
  Copy,
  Check,
  QrCode,
  Share2,
  PhoneCall,
  MessageSquare,
  Mail,
  MapPin,
  Camera,
  Settings,
  Wifi,
  Volume2,
  BatteryCharging,
  Cpu,
  ShieldCheck,
  Zap,
  ExternalLink,
  Radio,
  Lock,
  Unlock,
  Sparkles
} from "lucide-react";
import { motion } from "motion/react";

interface MobileSystemControlModalProps {
  onClose: () => void;
  onSendToChat?: (text: string) => void;
}

export default function MobileSystemControlModal({
  onClose,
  onSendToChat
}: MobileSystemControlModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"link" | "share-fix" | "deep-links" | "diagnostics">("link");
  const [appUrl, setAppUrl] = useState("");
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState(false);
  const [networkStatus, setNetworkStatus] = useState("Online");
  const [volumeLevel, setVolumeLevel] = useState(80);
  const [flashlightState, setFlashlightState] = useState(false);
  const [systemLogs, setSystemLogs] = useState<string[]>([
    "Zoya Mobile System Controller Initialized.",
    "Direct Link Access Granted to Owner (Hemant).",
    "All System Deep-Links & Direct Hardware API Triggers Active."
  ]);

  useEffect(() => {
    // Determine current app URL
    if (typeof window !== "undefined") {
      setAppUrl(window.location.origin || window.location.href);
      setNetworkStatus(navigator.onLine ? "Online (High Speed)" : "Offline Mode");
    }

    // Try reading device battery if available
    if (typeof navigator !== "undefined" && "getBattery" in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);

        battery.addEventListener("levelchange", () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
        battery.addEventListener("chargingchange", () => {
          setIsCharging(battery.charging);
        });
      }).catch(() => {});
    }
  }, []);

  // Copy Direct Link
  const handleCopyLink = () => {
    if (!appUrl) return;
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    addLog(`Copied Zoya Direct System Link: ${appUrl}`);
    setTimeout(() => setCopied(false), 2000);
  };

  // Add system log
  const addLog = (msg: string) => {
    setSystemLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 8)]);
  };

  // Handle Share Direct Link
  const handleShareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Zoya AI Mobile System Access",
          text: "Direct link access to Zoya AI Voice Assistant & System Controller for Hemant.",
          url: appUrl
        });
        addLog("Direct system access link shared via Native Web Share API.");
      } catch (e) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  // Deep Link System Triggers
  const handleDeepLink = (protocol: string, label: string) => {
    addLog(`Executing System Deep-Link: ${label} (${protocol})`);
    try {
      window.location.href = protocol;
    } catch (err) {
      console.warn("Deep link execution error:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-3xl max-h-[92vh] bg-[#090d18]/95 border border-cyan-500/30 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden text-white"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-black font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <Smartphone size={20} className="text-black" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-mono tracking-tight text-white flex items-center gap-2">
                <span>ZOYA MOBILE SYSTEM CONTROLLER</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                  Owner Link
                </span>
              </h2>
              <p className="text-xs text-white/60">
                Direct URL access, mobile hardware triggers, system deep-links & remote controller
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

        {/* Navigation Tabs */}
        <div className="p-2 bg-black/40 border-b border-white/10 flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap shrink-0">
          <button
            onClick={() => setActiveTab("link")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "link"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Link size={14} />
            <span>Direct Link</span>
          </button>
          <button
            onClick={() => setActiveTab("share-fix")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "share-fix"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-500/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Share2 size={14} />
            <span>Fix 402 / Share Friends</span>
          </button>
          <button
            onClick={() => setActiveTab("deep-links")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "deep-links"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/50 shadow-md shadow-purple-500/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Zap size={14} />
            <span>Deep-Links</span>
          </button>
          <button
            onClick={() => setActiveTab("diagnostics")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "diagnostics"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-md shadow-emerald-500/20"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Cpu size={14} />
            <span>Diagnostics</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {activeTab === "link" && (
            <div className="space-y-4">
              {/* Direct Access Link Box */}
              <div className="p-4 rounded-2xl bg-[#0e1424] border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-300 font-bold uppercase flex items-center gap-2">
                    <Sparkles size={14} className="text-cyan-400" />
                    Zoya Direct Mobile Web Access URL
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                    Always Online
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-black/50 border border-white/10 rounded-xl p-2.5">
                  <input
                    type="text"
                    readOnly
                    value={appUrl || (typeof window !== "undefined" ? window.location.href : "https://ais-pre-zcymrwq26icm6xjgc3lvyv-597118409614.asia-southeast1.run.app")}
                    className="flex-1 bg-transparent text-sm font-mono text-cyan-200 outline-none select-all truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copied ? "Copied!" : "Copy Link"}</span>
                  </button>
                  <button
                    onClick={handleShareLink}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
                    title="Share Link via Mobile"
                  >
                    <Share2 size={16} />
                  </button>
                </div>

                <p className="text-xs text-white/60 leading-relaxed">
                  Open this link on any iOS, Android, or desktop browser for direct access to Zoya. No logins required for Owner (Hemant).
                </p>
              </div>

              {/* QR Code & PWA Install Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* QR Code Visualizer */}
                <div className="p-4 rounded-2xl bg-[#0e1424] border border-white/10 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="p-3 bg-white rounded-2xl shadow-lg border border-cyan-400/50">
                    <QrCode size={110} className="text-black" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Scan QR Code on Mobile</h4>
                    <p className="text-xs text-white/60">
                      Scan with iPhone or Android camera to open Zoya instantly
                    </p>
                  </div>
                </div>

                {/* Add to Home Screen / PWA */}
                <div className="p-4 rounded-2xl bg-[#0e1424] border border-white/10 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-mono text-purple-300 font-bold uppercase mb-1 flex items-center gap-1.5">
                      <Smartphone size={14} />
                      Install as Mobile App (PWA)
                    </div>
                    <h4 className="text-sm font-bold text-white mb-2">Full Screen Mobile Control</h4>
                    <ol className="text-xs text-white/70 space-y-1.5 list-decimal pl-4">
                      <li>Open the direct URL in Chrome or Safari on mobile.</li>
                      <li>Tap <span className="text-cyan-300 font-semibold font-mono">"Share"</span> or menu icon <span className="text-cyan-300 font-mono">⋮</span></li>
                      <li>Select <span className="text-cyan-300 font-semibold font-mono">"Add to Home Screen"</span></li>
                      <li>Launch Zoya as a standalone app anytime!</li>
                    </ol>
                  </div>

                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-2">
                    <ShieldCheck size={16} className="shrink-0" />
                    <span>Owner Override: Zero popups, direct execution granted!</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "share-fix" && (
            <div className="space-y-4">
              {/* Error 402 / 404 Fix Explanation Header */}
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/40 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase font-mono">
                  <ShieldCheck size={18} />
                  <span>Why Friends See "Error 402" or "Page Not Found"</span>
                </div>
                <p className="text-xs text-white/80 leading-relaxed">
                  The <code className="text-amber-300 font-mono">ais-dev-...</code> and <code className="text-amber-300 font-mono">ais-pre-...</code> URLs are <strong className="text-white">private container preview links</strong> tied to your personal Google AI Studio session. When someone else opens them, Cloud Run blocks access and shows <strong className="text-red-400 font-mono">Error 402</strong> or <strong className="text-red-400 font-mono">404 Page Not Found</strong>.
                </p>
              </div>

              {/* Step-By-Step Solution Options */}
              <div className="space-y-3">
                <h3 className="text-xs font-mono uppercase font-bold text-cyan-300 tracking-wider">
                  How To Share Zoya So Friends Can Use It Seamlessly (3 Easy Ways):
                </h3>

                {/* Option 1: AI Studio Share Button */}
                <div className="p-4 rounded-2xl bg-[#0e1424] border border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-300 font-bold uppercase flex items-center gap-2">
                      <Share2 size={16} className="text-cyan-400" />
                      Option 1: Click "Share" in Google AI Studio (Instant)
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                      Recommended
                    </span>
                  </div>
                  <ol className="text-xs text-white/80 space-y-1.5 list-decimal pl-4 leading-relaxed">
                    <li>In the top right corner of your Google AI Studio editor, click the <strong className="text-cyan-300">Share</strong> button.</li>
                    <li>Toggle ON <strong className="text-cyan-300">"Public Share Link"</strong> or generate a published app snapshot.</li>
                    <li>Copy that published link and send it to your friend. They can open Zoya instantly without 402/404 errors!</li>
                  </ol>
                </div>

                {/* Option 2: Cloud Run Deployment */}
                <div className="p-4 rounded-2xl bg-[#0e1424] border border-purple-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-purple-300 font-bold uppercase flex items-center gap-2">
                      <ExternalLink size={16} className="text-purple-400" />
                      Option 2: Deploy to Cloud Run (Permanent Public App)
                    </span>
                    <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30">
                      24/7 Hosting
                    </span>
                  </div>
                  <ol className="text-xs text-white/80 space-y-1.5 list-decimal pl-4 leading-relaxed">
                    <li>Go to <strong className="text-purple-300">Settings → Deploy</strong> in the AI Studio top menu.</li>
                    <li>Click <strong className="text-purple-300">Deploy to Cloud Run</strong>.</li>
                    <li>You will get a dedicated public production domain (e.g., <code className="text-purple-300 font-mono">zoya-app.run.app</code>) that anyone in the world can use!</li>
                  </ol>
                </div>

                {/* Option 3: Export to GitHub / Vercel */}
                <div className="p-4 rounded-2xl bg-[#0e1424] border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-300 font-bold uppercase flex items-center gap-2">
                      <Zap size={16} className="text-emerald-400" />
                      Option 3: Export to GitHub / Vercel (1-Click Free Hosting)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      Free Web Host
                    </span>
                  </div>
                  <ol className="text-xs text-white/80 space-y-1.5 list-decimal pl-4 leading-relaxed">
                    <li>Click <strong className="text-emerald-300">Settings → Export to GitHub</strong> or download the ZIP file.</li>
                    <li>Import the repository into <strong className="text-emerald-300">Vercel</strong> or <strong className="text-emerald-300">Netlify</strong> (100% Free).</li>
                    <li>Your friends can use your app at <code className="text-emerald-300 font-mono">zoya.vercel.app</code> with full speed and zero access blocks!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {activeTab === "deep-links" && (
            <div className="space-y-4">
              <div className="text-xs font-mono text-purple-300 uppercase tracking-wider font-bold">
                Direct Hardware & System Protocols (Single-Click Mobile Triggers)
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => handleDeepLink("tel:112", "Emergency Phone Dialer")}
                  className="p-3.5 rounded-2xl bg-[#0e1424] hover:bg-cyan-950/40 border border-white/10 hover:border-cyan-500/50 text-left space-y-2 transition-all cursor-pointer group"
                >
                  <div className="p-2 rounded-xl bg-green-500/20 text-green-400 w-fit group-hover:scale-110 transition-transform">
                    <PhoneCall size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Phone Dialer</div>
                    <div className="text-[10px] text-white/50 font-mono">tel: protocol</div>
                  </div>
                </button>

                <button
                  onClick={() => handleDeepLink("sms:?body=Zoya%20System%20Report", "SMS Messaging")}
                  className="p-3.5 rounded-2xl bg-[#0e1424] hover:bg-cyan-950/40 border border-white/10 hover:border-cyan-500/50 text-left space-y-2 transition-all cursor-pointer group"
                >
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 w-fit group-hover:scale-110 transition-transform">
                    <MessageSquare size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">SMS Composer</div>
                    <div className="text-[10px] text-white/50 font-mono">sms: protocol</div>
                  </div>
                </button>

                <button
                  onClick={() => handleDeepLink("mailto:durgeshu49@gmail.com?subject=Zoya%20Control", "Email App")}
                  className="p-3.5 rounded-2xl bg-[#0e1424] hover:bg-cyan-950/40 border border-white/10 hover:border-cyan-500/50 text-left space-y-2 transition-all cursor-pointer group"
                >
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 w-fit group-hover:scale-110 transition-transform">
                    <Mail size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Email Dispatch</div>
                    <div className="text-[10px] text-white/50 font-mono">mailto: protocol</div>
                  </div>
                </button>

                <button
                  onClick={() => handleDeepLink("https://maps.google.com", "Google Maps GPS")}
                  className="p-3.5 rounded-2xl bg-[#0e1424] hover:bg-cyan-950/40 border border-white/10 hover:border-cyan-500/50 text-left space-y-2 transition-all cursor-pointer group"
                >
                  <div className="p-2 rounded-xl bg-red-500/20 text-red-400 w-fit group-hover:scale-110 transition-transform">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">GPS Navigation</div>
                    <div className="text-[10px] text-white/50 font-mono">geo: / maps</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.capture = "environment";
                    input.click();
                    addLog("Opened mobile camera sensor");
                  }}
                  className="p-3.5 rounded-2xl bg-[#0e1424] hover:bg-cyan-950/40 border border-white/10 hover:border-cyan-500/50 text-left space-y-2 transition-all cursor-pointer group"
                >
                  <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 w-fit group-hover:scale-110 transition-transform">
                    <Camera size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Camera Sensor</div>
                    <div className="text-[10px] text-white/50 font-mono">Direct Shutter</div>
                  </div>
                </button>

                <button
                  onClick={() => handleDeepLink("app-settings:", "System Settings")}
                  className="p-3.5 rounded-2xl bg-[#0e1424] hover:bg-cyan-950/40 border border-white/10 hover:border-cyan-500/50 text-left space-y-2 transition-all cursor-pointer group"
                >
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 w-fit group-hover:scale-110 transition-transform">
                    <Settings size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">System Settings</div>
                    <div className="text-[10px] text-white/50 font-mono">Control Panel</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {activeTab === "diagnostics" && (
            <div className="space-y-4">
              {/* Telemetry Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#0e1424] border border-white/10 space-y-1">
                  <div className="text-[10px] font-mono text-white/50 uppercase flex items-center justify-between">
                    <span>Battery Status</span>
                    <BatteryCharging size={14} className="text-emerald-400" />
                  </div>
                  <div className="text-lg font-bold text-emerald-300 font-mono">
                    {batteryLevel !== null ? `${batteryLevel}%` : "100% (Simulated)"}
                  </div>
                  <div className="text-[10px] text-white/60">
                    {isCharging ? "⚡ Fast Charging" : "Battery Nominal"}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0e1424] border border-white/10 space-y-1">
                  <div className="text-[10px] font-mono text-white/50 uppercase flex items-center justify-between">
                    <span>Network State</span>
                    <Wifi size={14} className="text-cyan-400" />
                  </div>
                  <div className="text-lg font-bold text-cyan-300 font-mono">{networkStatus}</div>
                  <div className="text-[10px] text-white/60">Low Latency Channel</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#0e1424] border border-white/10 space-y-1">
                  <div className="text-[10px] font-mono text-white/50 uppercase flex items-center justify-between">
                    <span>Audio Master</span>
                    <Volume2 size={14} className="text-purple-400" />
                  </div>
                  <div className="text-lg font-bold text-purple-300 font-mono">{volumeLevel}%</div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={volumeLevel}
                    onChange={(e) => setVolumeLevel(Number(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer h-1 bg-white/20 rounded-lg"
                  />
                </div>
              </div>

              {/* Real-time System Log Console */}
              <div className="p-4 rounded-2xl bg-[#060810] border border-white/10 space-y-2">
                <div className="text-xs font-mono text-white/50 uppercase flex items-center justify-between">
                  <span>Remote System Telemetry Log</span>
                  <span className="text-[10px] text-emerald-400 font-mono">● LIVE</span>
                </div>
                <div className="space-y-1 text-xs font-mono text-cyan-300/90 max-h-[140px] overflow-y-auto">
                  {systemLogs.map((log, idx) => (
                    <div key={idx} className="border-b border-white/5 pb-1">
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/50 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-white/60">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Zoya System Controller Active for Hemant</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors cursor-pointer"
          >
            Close Controller
          </button>
        </div>
      </motion.div>
    </div>
  );
}
