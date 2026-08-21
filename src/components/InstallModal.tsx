import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Smartphone,
  ArrowDown,
  Chrome,
  Compass,
  Share,
  PlusSquare,
  Download,
  Check,
  Copy,
  QrCode,
  Sparkles,
  ShieldCheck,
  Zap,
  ExternalLink,
  HardDrive,
  Layers,
  ArrowDownToLine,
  Share2,
  CheckCircle2
} from "lucide-react";

interface InstallModalProps {
  onClose: () => void;
  deferredPrompt?: any;
}

type Tab = "android" | "direct-download" | "ios" | "qr";

export default function InstallModal({ onClose, deferredPrompt: initialDeferredPrompt }: InstallModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("android");
  const [copied, setCopied] = useState(false);
  const [appUrl, setAppUrl] = useState("");
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(
    initialDeferredPrompt || (typeof window !== "undefined" ? (window as any).__deferredInstallPrompt : null)
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAppUrl(window.location.origin || window.location.href);

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        (window as any).__deferredInstallPrompt = e;
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }
  }, []);

  // Direct 1-Tap Native Android Install Trigger
  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      try {
        setIsInstalling(true);
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === "accepted") {
          setInstallSuccess(true);
        }
        setDeferredPrompt(null);
        (window as any).__deferredInstallPrompt = null;
      } catch (err) {
        console.warn("Install prompt error:", err);
      } finally {
        setIsInstalling(false);
      }
    } else {
      // Fallback: Trigger download package and show step prompt
      handleDownloadPackage();
    }
  };

  // Direct Download Standalone Android Web Launcher (.html / .pwa launcher file)
  const handleDownloadPackage = () => {
    try {
      const currentOrigin = typeof window !== "undefined" ? window.location.origin : "https://ais-dev-zcymrwq26icm6xjgc3lvyv-597118409614.asia-southeast1.run.app";
      const fileContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Zoya AI Assistant 💅 (Android App Launcher)</title>
  <meta name="theme-color" content="#0e111a">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <link rel="icon" type="image/jpeg" href="${currentOrigin}/icon-192.jpg">
  <style>
    body {
      background: #0e111a;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      text-align: center;
      box-sizing: border-box;
    }
    .card {
      background: #151a28;
      border: 1px solid rgba(236,72,153,0.3);
      border-radius: 28px;
      padding: 30px 24px;
      max-width: 380px;
      width: 100%;
      box-shadow: 0 0 50px rgba(236,72,153,0.25);
    }
    .logo {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 3px solid #ec4899;
      margin: 0 auto 16px;
      box-shadow: 0 0 20px rgba(236,72,153,0.4);
    }
    h1 { margin: 0 0 8px; font-size: 22px; color: #fff; }
    p { color: #a1a1aa; font-size: 13px; line-height: 1.5; margin: 0 0 24px; }
    .btn {
      display: block;
      background: linear-gradient(135deg, #ec4899, #8b5cf6);
      color: #fff;
      font-weight: bold;
      text-decoration: none;
      padding: 14px 20px;
      border-radius: 16px;
      font-size: 15px;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 20px rgba(236,72,153,0.4);
    }
  </style>
  <script>
    // Auto-launch standalone app
    window.location.replace("${currentOrigin}");
  </script>
</head>
<body>
  <div class="card">
    <img class="logo" src="${currentOrigin}/icon-192.jpg" alt="Zoya AI">
    <h1>Zoya AI Assistant 💅</h1>
    <p>Launching Zoya AI Ultra Suite for Android (Hemant's Direct Link)...</p>
    <a class="btn" href="${currentOrigin}">Open Zoya AI Now</a>
  </div>
</body>
</html>`;

      const blob = new Blob([fileContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Zoya-AI-Android-App.html";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (e) {
      console.error("Direct download failed", e);
    }
  };

  const handleCopyLink = () => {
    if (!appUrl) return;
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Zoya AI Assistant Android App",
          text: "Install Zoya AI directly on your Android phone home screen! 💅",
          url: appUrl
        });
      } catch (err) {
        console.warn("Share cancelled or failed:", err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div id="install-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-3 sm:p-5 animate-fade-in pointer-events-auto">
      <motion.div
        id="install-modal-container"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-xl max-h-[92vh] bg-[#0c101a] border border-pink-500/30 rounded-3xl p-5 sm:p-7 shadow-[0_0_80px_rgba(236,72,153,0.3)] flex flex-col relative overflow-hidden text-white"
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-pink-500 to-cyan-400" />

        {/* Close Button */}
        <button
          id="close-install-modal"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Header with Icon and Direct Status */}
        <div className="flex items-center gap-3.5 mb-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-cyan-500/20 border border-pink-500/40 flex items-center justify-center shrink-0 shadow-inner">
            <Download size={24} className="text-pink-400 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold font-mono tracking-tight text-white">
                DOWNLOAD ZOYA ANDROID APP
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase font-semibold">
                Direct Option
              </span>
            </div>
            <p className="text-xs text-white/60 font-sans">
              1-Tap Direct Install • Standalone WebAPK • Full Offline Hardware Features
            </p>
          </div>
        </div>

        {/* Direct One-Click Android Download & Install Banner */}
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-pink-950/40 via-[#131929] to-purple-950/40 border border-pink-500/40 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-500/20 text-pink-300 border border-pink-500/30 shrink-0">
              <Smartphone size={22} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Direct Android 1-Tap Install</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-pink-500/30 text-pink-200">Recommended</span>
              </h3>
              <p className="text-xs text-white/60">
                Adds Zoya icon directly to your Android phone home screen instantly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleNativeInstall}
              disabled={isInstalling}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 text-black font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_25px_rgba(236,72,153,0.4)] flex items-center justify-center gap-2 cursor-pointer hover:scale-105 disabled:opacity-50"
            >
              <Download size={15} />
              <span>{isInstalling ? "Installing..." : "Install Android App"}</span>
            </button>
          </div>
        </div>

        {/* Download Success / Notification */}
        {installSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Zoya AI has been installed to your home screen successfully! 💅</span>
          </div>
        )}

        {downloadSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Zoya Android Launcher downloaded! Open it to launch standalone mode.</span>
          </div>
        )}

        {/* Platform & Method Tabs */}
        <div className="flex border-b border-white/10 mb-4 overflow-x-auto text-xs font-mono font-bold uppercase tracking-wider shrink-0">
          <button
            id="tab-android"
            onClick={() => setActiveTab("android")}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "android"
                ? "border-pink-500 text-pink-400"
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            <Chrome size={13} />
            <span>Android Chrome & Samsung</span>
          </button>

          <button
            id="tab-direct-download"
            onClick={() => setActiveTab("direct-download")}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "direct-download"
                ? "border-cyan-400 text-cyan-300"
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            <ArrowDownToLine size={13} />
            <span>Direct File Package (.html/apk)</span>
          </button>

          <button
            id="tab-qr"
            onClick={() => setActiveTab("qr")}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "qr"
                ? "border-emerald-400 text-emerald-300"
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            <QrCode size={13} />
            <span>QR Phone Scan</span>
          </button>

          <button
            id="tab-ios"
            onClick={() => setActiveTab("ios")}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "ios"
                ? "border-violet-500 text-violet-400"
                : "border-transparent text-white/40 hover:text-white/70"
            }`}
          >
            <Compass size={13} />
            <span>iPhone / iOS</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto min-h-[190px] pr-1">
          <AnimatePresence mode="wait">
            {activeTab === "android" && (
              <motion.div
                key="android"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3 text-left"
              >
                <div className="flex items-start gap-3 bg-white/5 border border-white/5 rounded-2xl p-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 mt-0.5 shrink-0">
                    <Chrome size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white mb-0.5">Step 1: Open in Android Chrome or Samsung Browser</h4>
                    <p className="text-[11px] text-white/60 leading-relaxed font-sans">
                      Ensure you are browsing on your Android device in Google Chrome, Samsung Internet, or Brave.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 border border-white/5 rounded-2xl p-3">
                  <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 mt-0.5 shrink-0">
                    <span className="text-sm font-bold font-mono">⋮</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white mb-0.5">Step 2: Tap the 3 Dots Menu Button (⋮)</h4>
                    <p className="text-[11px] text-white/60 leading-relaxed font-sans">
                      Tap the <strong className="text-white">three dots menu (⋮)</strong> located at the top-right or bottom-right corner of your browser.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 border border-white/5 rounded-2xl p-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 mt-0.5 shrink-0">
                    <ArrowDown size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white mb-0.5">Step 3: Select "Install App" or "Add to Home screen"</h4>
                    <p className="text-[11px] text-white/60 leading-relaxed font-sans">
                      Tap <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong>. Zoya will appear directly alongside your native Android applications!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "direct-download" && (
              <motion.div
                key="direct-download"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3 text-left"
              >
                <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-bold">
                      <HardDrive size={16} />
                      <span>OFFLINE STANDALONE ANDROID LAUNCHER</span>
                    </div>
                    <span className="text-[10px] font-mono text-white/50">Size: ~2.4 KB</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed font-sans">
                    Download the direct standalone offline launcher file for Android. You can save it to your phone's Download folder, click it to open Zoya instantly with no browser URL bar or headers!
                  </p>
                  <button
                    onClick={handleDownloadPackage}
                    className="py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
                  >
                    <ArrowDownToLine size={15} />
                    <span>Download Zoya-AI-Android-App.html</span>
                  </button>
                </div>

                <div className="p-3 bg-white/5 border border-white/5 rounded-2xl text-xs text-white/60 flex items-center justify-between">
                  <span>Direct URL Access:</span>
                  <button
                    onClick={handleCopyLink}
                    className="text-pink-400 hover:text-pink-300 font-mono font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copied ? "Copied!" : "Copy App Link"}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === "qr" && (
              <motion.div
                key="qr"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col sm:flex-row items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 text-left"
              >
                {/* Visual QR Card */}
                <div className="p-3 bg-white rounded-2xl shrink-0 shadow-xl flex flex-col items-center justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(appUrl || window.location.href)}&color=0e111a`}
                    alt="Scan to download Zoya Android App"
                    className="w-32 h-32"
                  />
                  <span className="text-[10px] text-black font-mono font-bold mt-1">SCAN ON ANDROID</span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sparkles size={14} className="text-emerald-400" />
                    <span>Scan with Android Camera</span>
                  </h4>
                  <p className="text-xs text-white/70 leading-relaxed font-sans">
                    Open your Android phone camera, point it at this QR code, and tap the link to open and install Zoya immediately.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-white flex items-center gap-1.5 cursor-pointer"
                    >
                      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copied ? "Link Copied" : "Copy Link"}</span>
                    </button>
                    <button
                      onClick={handleNativeShare}
                      className="px-3 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                    >
                      <Share2 size={12} />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "ios" && (
              <motion.div
                key="ios"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3 text-left"
              >
                <div className="flex items-start gap-3 bg-white/5 border border-white/5 rounded-2xl p-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 mt-0.5 shrink-0">
                    <Compass size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white mb-0.5">1. Open in Safari</h4>
                    <p className="text-[11px] text-white/60 leading-relaxed font-sans">
                      Open this page inside the native Apple Safari browser on your iPhone or iPad.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 border border-white/5 rounded-2xl p-3">
                  <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 mt-0.5 shrink-0">
                    <Share size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white mb-0.5">2. Tap the Share Icon</h4>
                    <p className="text-[11px] text-white/60 leading-relaxed font-sans">
                      Tap the standard <strong className="text-white">Share</strong> button (box with an upward arrow) in Safari's bottom toolbar.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/5 border border-white/5 rounded-2xl p-3">
                  <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400 mt-0.5 shrink-0">
                    <PlusSquare size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white mb-0.5">3. Choose "Add to Home Screen"</h4>
                    <p className="text-[11px] text-white/60 leading-relaxed font-sans">
                      Scroll down Safari's share menu and select <strong className="text-white">"Add to Home Screen"</strong>.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono text-white/60 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span className="text-[11px]">Android Native WebAPK & PWA Ready</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
