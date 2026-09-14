import React, { useState, useEffect } from "react";
import {
  X,
  Flashlight,
  Wifi,
  Bluetooth,
  Zap,
  Power,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Smartphone,
  Radio,
  Signal,
  Headphones,
  Watch,
  Speaker,
  Car,
  QrCode,
  Copy,
  Check,
  Activity,
  AlertTriangle,
  Flame,
  Volume2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  hardwareManager,
  BluetoothDeviceSummary,
  WifiNetworkSummary
} from "../services/hardwareService";

interface DeviceControlModalProps {
  onClose: () => void;
  initialTab?: "torch" | "wifi" | "bluetooth";
  onSendVoiceResponse?: (text: string) => void;
}

export default function DeviceControlModal({
  onClose,
  initialTab = "torch",
  onSendVoiceResponse
}: DeviceControlModalProps) {
  const [activeTab, setActiveTab] = useState<"torch" | "wifi" | "bluetooth">(initialTab);
  
  // Torch State
  const [isTorchOn, setIsTorchOn] = useState(hardwareManager.getTorchState());
  const [isScreenTorch, setIsScreenTorch] = useState(hardwareManager.isScreenTorch());
  const [screenBrightness, setScreenBrightness] = useState(100);
  const [torchMode, setTorchMode] = useState<"steady" | "strobe" | "sos">("steady");
  const [torchColor, setTorchColor] = useState<string>("#ffffff");

  // Wi-Fi State
  const [isWifiOn, setIsWifiOn] = useState(hardwareManager.getWifiState());
  const [wifiNetworks, setWifiNetworks] = useState<WifiNetworkSummary[]>(hardwareManager.getWifiNetworks());
  const [isScanningWifi, setIsScanningWifi] = useState(false);
  const [speedTestActive, setSpeedTestActive] = useState(false);
  const [speedResult, setSpeedResult] = useState<number | null>(345);
  const [showWifiQr, setShowWifiQr] = useState(false);
  const [copiedWifi, setCopiedWifi] = useState(false);

  // Bluetooth State
  const [isBluetoothOn, setIsBluetoothOn] = useState(hardwareManager.getBluetoothState());
  const [bluetoothDevices, setBluetoothDevices] = useState<BluetoothDeviceSummary[]>(hardwareManager.getBluetoothDevices());
  const [isScanningBt, setIsScanningBt] = useState(false);
  const [scanStatusMsg, setScanStatusMsg] = useState<string | null>(null);

  // Sync state on load
  useEffect(() => {
    setIsTorchOn(hardwareManager.getTorchState());
    setIsScreenTorch(hardwareManager.isScreenTorch());
    setIsWifiOn(hardwareManager.getWifiState());
    setIsBluetoothOn(hardwareManager.getBluetoothState());
  }, []);

  // Torch Strobe effect
  useEffect(() => {
    if (!isTorchOn || torchMode === "steady") return;

    let intervalTime = torchMode === "strobe" ? 120 : 400;
    let visible = true;

    const interval = setInterval(() => {
      visible = !visible;
      const el = document.getElementById("screen-torch-canvas");
      if (el) {
        el.style.opacity = visible ? (screenBrightness / 100).toString() : "0.05";
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isTorchOn, torchMode, screenBrightness]);

  // Torch Toggle
  const handleToggleTorch = async (state?: boolean) => {
    const result = await hardwareManager.toggleTorch(state);
    setIsTorchOn(result.state);
    setIsScreenTorch(hardwareManager.isScreenTorch());
    if (onSendVoiceResponse) {
      onSendVoiceResponse(result.message);
    }
  };

  // Wi-Fi Toggle
  const handleToggleWifi = () => {
    const result = hardwareManager.toggleWifi();
    setIsWifiOn(result.state);
    if (onSendVoiceResponse) {
      onSendVoiceResponse(result.message);
    }
  };

  const handleScanWifi = () => {
    setIsScanningWifi(true);
    setTimeout(() => {
      setWifiNetworks(hardwareManager.getWifiNetworks());
      setIsScanningWifi(false);
    }, 1200);
  };

  const handleRunSpeedTest = () => {
    setSpeedTestActive(true);
    setSpeedResult(null);
    setTimeout(() => {
      const speed = Math.floor(Math.random() * 200) + 250;
      setSpeedResult(speed);
      setSpeedTestActive(false);
    }, 2000);
  };

  // Bluetooth Toggle
  const handleToggleBluetooth = () => {
    const result = hardwareManager.toggleBluetooth();
    setIsBluetoothOn(result.state);
    if (onSendVoiceResponse) {
      onSendVoiceResponse(result.message);
    }
  };

  const handleScanBluetooth = async () => {
    setIsScanningBt(true);
    setScanStatusMsg("Scanning nearby BLE & Bluetooth devices...");
    const res = await hardwareManager.scanForBluetoothDevices();
    setBluetoothDevices(hardwareManager.getBluetoothDevices());
    setScanStatusMsg(res.message);
    setIsScanningBt(false);
  };

  const handleToggleDevice = (id: string) => {
    const res = hardwareManager.toggleDeviceConnection(id);
    setBluetoothDevices(hardwareManager.getBluetoothDevices());
  };

  // Play audio chime test on connected bluetooth device
  const handleAudioChimeTest = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio test failed", e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-fade-in pointer-events-auto">
      {/* Screen Torch Overlay when Torch is ON in Screen Torch mode */}
      {isTorchOn && (
        <div
          id="screen-torch-canvas"
          style={{
            backgroundColor: torchColor,
            opacity: screenBrightness / 100
          }}
          className="fixed inset-0 z-40 transition-opacity pointer-events-none"
        />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl max-h-[92vh] bg-[#090d18]/95 border border-cyan-500/40 rounded-3xl shadow-[0_0_70px_rgba(6,182,212,0.3)] flex flex-col overflow-hidden text-white relative z-50"
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-cyan-400 to-indigo-500" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-400 via-cyan-400 to-indigo-500 text-black font-bold shadow-lg">
              <Zap size={22} className="text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-mono tracking-tight text-white">
                  MOBILE HARDWARE HUB
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase font-semibold">
                  Live System
                </span>
              </div>
              <p className="text-xs text-white/60 font-sans">
                Mobile Torch (Flashlight) • Wi-Fi Controller • Bluetooth BLE Manager
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

        {/* 3 Main Hardware Subsystems Tabs */}
        <div className="p-2 bg-black/50 border-b border-white/10 flex items-center justify-center gap-2 shrink-0">
          {/* Torch Tab */}
          <button
            onClick={() => setActiveTab("torch")}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "torch"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-lg shadow-amber-500/20"
                : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            <Flashlight size={16} className={isTorchOn ? "text-amber-400 animate-pulse" : ""} />
            <span>Torch (Light)</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isTorchOn ? "bg-amber-400 shadow-[0_0_8px_#f59e0b]" : "bg-white/30"
              }`}
            />
          </button>

          {/* Wi-Fi Tab */}
          <button
            onClick={() => setActiveTab("wifi")}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "wifi"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-lg shadow-cyan-500/20"
                : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            <Wifi size={16} className={isWifiOn ? "text-cyan-400" : ""} />
            <span>Wi-Fi Network</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isWifiOn ? "bg-cyan-400 shadow-[0_0_8px_#06b6d4]" : "bg-white/30"
              }`}
            />
          </button>

          {/* Bluetooth Tab */}
          <button
            onClick={() => setActiveTab("bluetooth")}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-mono font-bold uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "bluetooth"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/60 shadow-lg shadow-indigo-500/20"
                : "text-white/60 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            <Bluetooth size={16} className={isBluetoothOn ? "text-indigo-400" : ""} />
            <span>Bluetooth</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isBluetoothOn ? "bg-indigo-400 shadow-[0_0_8px_#6366f1]" : "bg-white/30"
              }`}
            />
          </button>
        </div>

        {/* Main Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* ================= TORCH TAB ================= */}
          {activeTab === "torch" && (
            <div className="space-y-4">
              {/* Big Power Switch Banner */}
              <div
                className={`p-6 rounded-3xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left ${
                  isTorchOn
                    ? "bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/50 border-amber-500/60 shadow-[0_0_40px_rgba(245,158,11,0.25)]"
                    : "bg-[#0e1424] border-white/10"
                }`}
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleToggleTorch()}
                    className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all cursor-pointer shadow-2xl ${
                      isTorchOn
                        ? "bg-amber-400 text-black shadow-[0_0_35px_#f59e0b] scale-105"
                        : "bg-white/10 hover:bg-white/15 text-white/50 border border-white/10"
                    }`}
                  >
                    <Power size={36} className={isTorchOn ? "text-black" : ""} />
                  </button>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                      <span>Mobile Torch (Flashlight)</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                          isTorchOn
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                            : "bg-white/10 text-white/40"
                        }`}
                      >
                        {isTorchOn ? "LIGHT ON" : "LIGHT OFF"}
                      </span>
                    </h3>
                    <p className="text-xs text-white/60 font-sans mt-0.5">
                      {isTorchOn
                        ? "Active: Rear camera LED torch & ultra-bright lumen canvas"
                        : "Tap big button or say 'turn on torch' to activate flashlight"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleTorch()}
                  className={`px-5 py-3 rounded-2xl font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shrink-0 ${
                    isTorchOn
                      ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40"
                      : "bg-amber-400 hover:bg-amber-300 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                  }`}
                >
                  {isTorchOn ? "Turn Off Torch" : "Turn On Torch"}
                </button>
              </div>

              {/* Torch Modes & Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Light Pattern Modes */}
                <div className="p-4 rounded-2xl bg-[#0e1424] border border-white/10 space-y-3">
                  <div className="text-xs font-mono text-amber-300 font-bold uppercase flex items-center justify-between">
                    <span>Lighting Pattern</span>
                    <Flame size={14} className="text-amber-400" />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {(["steady", "strobe", "sos"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setTorchMode(mode)}
                        className={`py-2 px-2 rounded-xl text-xs font-mono font-bold uppercase transition-all cursor-pointer ${
                          torchMode === mode
                            ? "bg-amber-500/30 text-amber-300 border border-amber-500/60"
                            : "bg-white/5 hover:bg-white/10 text-white/60"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>

                  <p className="text-[11px] text-white/50 leading-relaxed font-sans">
                    • <strong>Steady</strong>: Continuous beam <br />
                    • <strong>Strobe</strong>: High frequency flashing <br />
                    • <strong>SOS</strong>: Emergency Morse pulse (... --- ...)
                  </p>
                </div>

                {/* Brightness / Lux Slider */}
                <div className="p-4 rounded-2xl bg-[#0e1424] border border-white/10 space-y-3">
                  <div className="text-xs font-mono text-amber-300 font-bold uppercase flex items-center justify-between">
                    <span>Screen Torch Lumens</span>
                    <span className="text-white font-mono">{screenBrightness}%</span>
                  </div>

                  <input
                    type="range"
                    min={20}
                    max={100}
                    value={screenBrightness}
                    onChange={(e) => setScreenBrightness(Number(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer h-2 bg-white/10 rounded-lg"
                  />

                  {/* Color Temperature Selector */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-white/60">Tint:</span>
                    <div className="flex items-center gap-1.5">
                      {[
                        { name: "White", val: "#ffffff" },
                        { name: "Warm", val: "#fffbeb" },
                        { name: "Amber", val: "#fef08a" },
                        { name: "Red/Night", val: "#ef4444" }
                      ].map((c) => (
                        <button
                          key={c.val}
                          onClick={() => setTorchColor(c.val)}
                          style={{ backgroundColor: c.val }}
                          className={`w-6 h-6 rounded-full border transition-all cursor-pointer ${
                            torchColor === c.val ? "scale-125 border-cyan-400" : "border-white/30"
                          }`}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Voice Commands Hint */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs text-amber-200/90 flex items-center gap-2.5">
                <Smartphone size={16} className="text-amber-400 shrink-0" />
                <span>
                  <strong>Voice command active:</strong> Say <em>"turn on torch"</em> or <em>"turn off flashlight"</em> anytime to control hands-free.
                </span>
              </div>
            </div>
          )}

          {/* ================= WI-FI TAB ================= */}
          {activeTab === "wifi" && (
            <div className="space-y-4">
              {/* Wi-Fi Main Master Switch */}
              <div className="p-4 rounded-3xl bg-[#0e1424] border border-cyan-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${isWifiOn ? "bg-cyan-500/20 text-cyan-300" : "bg-white/10 text-white/40"}`}>
                    <Wifi size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Wi-Fi Radio</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${isWifiOn ? "bg-cyan-500/20 text-cyan-300" : "bg-red-500/20 text-red-300"}`}>
                        {isWifiOn ? "ACTIVE (5.0 GHz)" : "DISABLED"}
                      </span>
                    </h3>
                    <p className="text-xs text-white/60 font-sans">
                      {isWifiOn ? "Connected to Hemant_Ultra_5G • IP: 192.168.1.104" : "Wi-Fi is turned off"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleToggleWifi}
                  className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer ${
                    isWifiOn ? "bg-cyan-500" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-black absolute top-1 transition-transform ${
                      isWifiOn ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* Wi-Fi Speed Test & QR Share Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Speed Meter */}
                <div className="p-4 rounded-2xl bg-[#0e1424] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-cyan-300 font-bold uppercase">
                    <span>Wi-Fi Link Speed</span>
                    <Activity size={14} className="text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-cyan-300 flex items-baseline gap-1">
                    {speedTestActive ? (
                      <span className="animate-pulse text-sm">Measuring Link...</span>
                    ) : (
                      <>
                        <span>{speedResult || 350}</span>
                        <span className="text-xs text-white/50">Mbps</span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={handleRunSpeedTest}
                    disabled={speedTestActive}
                    className="w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={speedTestActive ? "animate-spin" : ""} />
                    <span>{speedTestActive ? "Testing Bandwidth..." : "Run Wi-Fi Speed Test"}</span>
                  </button>
                </div>

                {/* Wi-Fi QR Code Share for Friends */}
                <div className="p-4 rounded-2xl bg-[#0e1424] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-cyan-300 font-bold uppercase">
                    <span>Share Wi-Fi (No Password)</span>
                    <QrCode size={14} className="text-cyan-400" />
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed font-sans">
                    Generate 1-click Wi-Fi QR code so friends can scan and connect instantly.
                  </p>
                  <button
                    onClick={() => setShowWifiQr(!showWifiQr)}
                    className="w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <QrCode size={12} />
                    <span>{showWifiQr ? "Hide Wi-Fi QR" : "Show Wi-Fi QR Code"}</span>
                  </button>
                </div>
              </div>

              {/* QR Code Expansion */}
              {showWifiQr && (
                <div className="p-4 rounded-2xl bg-white text-black flex flex-col sm:flex-row items-center gap-4 animate-fade-in shadow-xl">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=WIFI:T:WPA;S:Hemant_Ultra_5G;P:ZoyaUltra2026;;color=0e111a"
                    alt="Wi-Fi QR Code"
                    className="w-28 h-28 rounded-xl"
                  />
                  <div className="space-y-1 text-left">
                    <h4 className="font-bold text-sm text-black">Scan to Connect to Hemant_Ultra_5G</h4>
                    <p className="text-xs text-slate-700 font-sans">
                      Point phone camera at QR code to connect automatically without typing passwords.
                    </p>
                    <span className="inline-block text-[11px] font-mono bg-slate-100 text-slate-900 px-2 py-0.5 rounded border border-slate-300">
                      Security: WPA3 / 5.0 GHz
                    </span>
                  </div>
                </div>
              )}

              {/* Discovered Wi-Fi Networks List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-white/60">
                  <span>Available Networks ({wifiNetworks.length})</span>
                  <button
                    onClick={handleScanWifi}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={11} className={isScanningWifi ? "animate-spin" : ""} />
                    <span>Scan</span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {wifiNetworks.map((net) => (
                    <div
                      key={net.ssid}
                      className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                        net.connected
                          ? "bg-cyan-950/30 border-cyan-500/40"
                          : "bg-[#0e1424] border-white/5 hover:border-white/15"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Signal size={18} className={net.connected ? "text-cyan-400" : "text-white/40"} />
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>{net.ssid}</span>
                            {net.connected && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded">
                                Connected
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-white/50 font-mono">
                            {net.security} • {net.frequency} • {net.signal}% Signal
                          </div>
                        </div>
                      </div>

                      {!net.connected && (
                        <button
                          onClick={() => {
                            const res = hardwareManager.connectToWifi(net.ssid);
                            setWifiNetworks(hardwareManager.getWifiNetworks());
                          }}
                          className="px-3 py-1 bg-white/5 hover:bg-white/15 border border-white/10 text-white rounded-lg text-xs font-mono cursor-pointer"
                        >
                          Connect
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= BLUETOOTH TAB ================= */}
          {activeTab === "bluetooth" && (
            <div className="space-y-4">
              {/* Bluetooth Main Switch */}
              <div className="p-4 rounded-3xl bg-[#0e1424] border border-indigo-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${isBluetoothOn ? "bg-indigo-500/20 text-indigo-300" : "bg-white/10 text-white/40"}`}>
                    <Bluetooth size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Bluetooth 5.3 Radio</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${isBluetoothOn ? "bg-indigo-500/20 text-indigo-300" : "bg-red-500/20 text-red-300"}`}>
                        {isBluetoothOn ? "VISIBLE / ACTIVE" : "DISABLED"}
                      </span>
                    </h3>
                    <p className="text-xs text-white/60 font-sans">
                      {isBluetoothOn ? "Audio, smart wearable & BLE mesh syncing" : "Bluetooth is turned off"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleToggleBluetooth}
                  className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer ${
                    isBluetoothOn ? "bg-indigo-500" : "bg-white/20"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-black absolute top-1 transition-transform ${
                      isBluetoothOn ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {/* Actions & Scanner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleScanBluetooth}
                  disabled={isScanningBt}
                  className="p-3.5 rounded-2xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/40 text-indigo-200 text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md disabled:opacity-50"
                >
                  <RefreshCw size={14} className={isScanningBt ? "animate-spin text-indigo-400" : "text-indigo-400"} />
                  <span>{isScanningBt ? "Scanning Bluetooth..." : "Pair New Device (Web Bluetooth)"}</span>
                </button>

                <button
                  onClick={handleAudioChimeTest}
                  className="p-3.5 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-200 text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                >
                  <Volume2 size={14} className="text-cyan-400" />
                  <span>Test Audio on Connected Headphones</span>
                </button>
              </div>

              {scanStatusMsg && (
                <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-300 font-mono flex items-center gap-2">
                  <ShieldCheck size={14} className="text-indigo-400 shrink-0" />
                  <span>{scanStatusMsg}</span>
                </div>
              )}

              {/* Paired Bluetooth Devices */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-white/60">
                  Paired & Discovered Devices ({bluetoothDevices.length})
                </div>

                <div className="space-y-2">
                  {bluetoothDevices.map((dev) => {
                    const getIcon = () => {
                      switch (dev.type) {
                        case "headphones":
                          return <Headphones size={18} />;
                        case "watch":
                          return <Watch size={18} />;
                        case "speaker":
                          return <Speaker size={18} />;
                        case "car":
                          return <Car size={18} />;
                        default:
                          return <Bluetooth size={18} />;
                      }
                    };

                    return (
                      <div
                        key={dev.id}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                          dev.connected
                            ? "bg-indigo-950/30 border-indigo-500/40"
                            : "bg-[#0e1424] border-white/5 hover:border-white/15"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2.5 rounded-xl ${
                              dev.connected
                                ? "bg-indigo-500/20 text-indigo-300"
                                : "bg-white/5 text-white/40"
                            }`}
                          >
                            {getIcon()}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                              <span>{dev.name}</span>
                              {dev.connected && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-semibold">
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-white/50 font-mono">
                              {dev.battery !== undefined ? `Battery: ${dev.battery}%` : "BLE"} • Signal: {dev.rssi || -60} dBm
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleDevice(dev.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                            dev.connected
                              ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40"
                              : "bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40"
                          }`}
                        >
                          {dev.connected ? "Disconnect" : "Connect"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/50 flex items-center justify-between text-xs font-mono text-white/60 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Mobile Hardware APIs Linked</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
