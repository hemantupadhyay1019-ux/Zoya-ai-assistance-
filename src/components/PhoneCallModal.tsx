import React, { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, Calendar, User, Clock, MapPin, CheckCircle2, Mic, Volume2, Plus, Sparkles, Send, X, ArrowLeft, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Contact, PhoneCall } from "../types/assistant";

interface PhoneCallModalProps {
  initialRecipient?: string;
  initialPurpose?: string;
  onClose: () => void;
  onAppointmentBooked?: (call: PhoneCall) => void;
}

const DEFAULT_CONTACTS: Contact[] = [
  { id: "c1", name: "Dr. Sharma Dental Clinic", phone: "+91 98765 43210", email: "appointments@drsharmadental.in", relationship: "Medical / Doctor" },
  { id: "c2", name: "Apex Gourmet Restaurant", phone: "+91 91234 56789", email: "reserve@apexgourmet.com", relationship: "Dining & Events" },
  { id: "c3", name: "Grand Unisex Salon", phone: "+91 99887 76655", email: "care@grandsalon.in", relationship: "Grooming / Spa" },
  { id: "c4", name: "Mom (Savita)", phone: "+91 98111 22334", email: "mom@family.com", relationship: "Family" },
  { id: "c5", name: "Alex Johnson (Tech Lead)", phone: "+91 97654 32109", email: "alex@horizon.tech", relationship: "Colleague / Work" }
];

export default function PhoneCallModal({ initialRecipient, initialPurpose, onClose, onAppointmentBooked }: PhoneCallModalProps) {
  const [activeTab, setActiveTab] = useState<"call" | "contacts" | "history">("call");
  const [phoneNumber, setPhoneNumber] = useState(initialRecipient || "+91 98765 43210");
  const [contactName, setContactName] = useState(initialRecipient || "Dr. Sharma Dental Clinic");
  const [purpose, setPurpose] = useState(initialPurpose || "Book Doctor Appointment for tomorrow 4 PM");
  const [callState, setCallState] = useState<"idle" | "ringing" | "connected" | "ended">("idle");
  const [transcript, setTranscript] = useState<{ speaker: string; text: string; time: string }[]>([]);
  const [duration, setDuration] = useState(0);
  const [isAppointmentConfirmed, setIsAppointmentConfirmed] = useState(false);
  const [confirmedDetails, setConfirmedDetails] = useState<{ service: string; venue: string; date: string; time: string } | null>(null);

  const timerRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  const handleKeypadPress = (digit: string) => {
    setPhoneNumber((prev) => prev + digit);
  };

  const startCall = () => {
    setCallState("ringing");
    setTranscript([]);
    setDuration(0);
    setIsAppointmentConfirmed(false);
    setConfirmedDetails(null);

    // Simulate Ringing -> Connected
    setTimeout(() => {
      setCallState("connected");

      // Start duration counter
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      // Simulate human-like call conversation for appointment or phone call
      runCallSimulation(contactName, purpose);
    }, 2500);
  };

  const endCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCallState("ended");
    setTimeout(() => {
      setCallState("idle");
    }, 2000);
  };

  const runCallSimulation = (target: string, callPurpose: string) => {
    const isDoc = target.toLowerCase().includes("sharma") || target.toLowerCase().includes("doctor") || target.toLowerCase().includes("dental");
    const isResto = target.toLowerCase().includes("restaurant") || target.toLowerCase().includes("apex") || target.toLowerCase().includes("dining");

    const steps = [
      {
        speaker: target,
        text: `Hello! Thank you for calling ${target}. How can I help you today?`,
        delay: 1500,
      },
      {
        speaker: "Zoya (JARVIS AI Assistant)",
        text: `Namaste! I am calling on behalf of my master, Hemant. He would like to ${callPurpose}.`,
        delay: 3500,
      },
      {
        speaker: target,
        text: isDoc 
          ? `Certainly! We have an opening for tomorrow at 4:00 PM with Dr. Sharma. Will that work for Hemant?`
          : isResto
          ? `Great! We can reserve a table for 2 people tomorrow at 8:00 PM. Should I lock that in?`
          : `Sure! I have noted down Hemant's request. Let me confirm the schedule for you.`,
        delay: 6500,
      },
      {
        speaker: "Zoya (JARVIS AI Assistant)",
        text: `Yes, 4:00 PM works perfectly! Please book it under the name Hemant and send the confirmation receipt.`,
        delay: 9500,
      },
      {
        speaker: target,
        text: `Done! The appointment is officially confirmed for tomorrow at 4:00 PM. Thank you for calling!`,
        delay: 12500,
      },
      {
        speaker: "Zoya (JARVIS AI Assistant)",
        text: `Thank you so much! Have a wonderful day. Bye!`,
        delay: 14500,
      }
    ];

    steps.forEach((step) => {
      setTimeout(() => {
        setTranscript((prev) => [
          ...prev,
          {
            speaker: step.speaker,
            text: step.text,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          }
        ]);

        if (step.delay === 12500) {
          setIsAppointmentConfirmed(true);
          const details = {
            service: callPurpose.includes("Doctor") ? "Dental Checkup & Consultation" : "VIP Table Reservation",
            venue: target,
            date: "Tomorrow (July 23, 2026)",
            time: "04:00 PM IST",
          };
          setConfirmedDetails(details);

          if (onAppointmentBooked) {
            onAppointmentBooked({
              id: "call-" + Date.now(),
              contactName: target,
              phoneNumber: phoneNumber,
              purpose: callPurpose,
              type: "appointment",
              status: "completed",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              durationSeconds: 45,
              transcript: [],
              appointmentDetails: {
                service: details.service,
                venue: details.venue,
                date: details.date,
                time: details.time,
                confirmedBy: target,
              },
            });
          }
        }

        if (step.delay === 14500) {
          setTimeout(() => {
            endCall();
          }, 1500);
        }
      }, step.delay);
    });
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-[#090d16] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(6,182,212,0.2)] flex flex-col h-[85vh] max-h-[700px] text-white relative"
      >
        {/* Top Header */}
        <div className="p-5 bg-gradient-to-r from-cyan-950/60 via-[#0b101d] to-violet-950/60 border-b border-cyan-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Phone size={20} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono tracking-wider text-cyan-400 uppercase flex items-center gap-2">
                HUMAN-LIKE CALL & APPOINTMENT AGENT <ShieldCheck size={16} className="text-emerald-400" />
              </h2>
              <p className="text-xs text-white/60 font-mono">Zoya & JARVIS Voice Telephony Service</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-black/40 text-xs font-mono shrink-0">
          <button
            onClick={() => setActiveTab("call")}
            className={`flex-1 py-3 text-center transition-all cursor-pointer border-b-2 font-semibold ${
              activeTab === "call" ? "border-cyan-400 text-cyan-400 bg-cyan-500/10" : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            📞 Phone Call & Dialer
          </button>
          <button
            onClick={() => setActiveTab("contacts")}
            className={`flex-1 py-3 text-center transition-all cursor-pointer border-b-2 font-semibold ${
              activeTab === "contacts" ? "border-cyan-400 text-cyan-400 bg-cyan-500/10" : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            👥 Saved Contacts
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-6 relative flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {callState !== "idle" ? (
              /* ACTIVE CALL OVERLAY */
              <motion.div
                key="active-call"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col items-center justify-between py-4"
              >
                {/* Caller Info Header */}
                <div className="text-center flex flex-col items-center">
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-600 p-[2px] mb-4 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                    <div className="w-full h-full bg-[#0d121f] rounded-full flex items-center justify-center">
                      <User size={36} className="text-cyan-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-wide">{contactName}</h3>
                  <p className="text-xs font-mono text-cyan-300/80 mt-1">{phoneNumber}</p>
                  
                  <div className="mt-3 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-400 flex items-center gap-2">
                    {callState === "ringing" ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                        <span>Ringing... Connecting AI Voice Agent</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>In Call • {formatDuration(duration)}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Animated Waveform / Audio Bar */}
                {callState === "connected" && (
                  <div className="flex items-center gap-1.5 h-12 my-4">
                    {[40, 75, 30, 90, 60, 100, 45, 80, 50, 95, 35, 70, 85, 40].map((h, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [`${h}%`, `${100 - h}%`, `${h}%`] }}
                        transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.08 }}
                        className="w-1 bg-gradient-to-t from-cyan-500 to-violet-500 rounded-full"
                      />
                    ))}
                  </div>
                )}

                {/* Live Call Transcript Box */}
                <div className="w-full bg-black/40 border border-cyan-500/20 rounded-2xl p-4 max-h-[220px] overflow-y-auto space-y-3 mb-4 text-left">
                  <div className="flex items-center gap-2 border-b border-cyan-500/10 pb-2 mb-2">
                    <Sparkles size={14} className="text-cyan-400 animate-spin" />
                    <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                      Live Human AI Conversation Log
                    </span>
                  </div>
                  {transcript.length === 0 ? (
                    <p className="text-xs text-white/40 italic font-mono text-center py-4">
                      Initiating call protocol... Zoya is establishing human-like tone...
                    </p>
                  ) : (
                    transcript.map((item, idx) => (
                      <div key={idx} className="text-xs space-y-0.5">
                        <div className="flex items-center justify-between font-mono text-[10px] text-cyan-400/80">
                          <span className="font-semibold">{item.speaker}</span>
                          <span>{item.time}</span>
                        </div>
                        <p className="text-white/90 bg-white/5 p-2 rounded-lg border border-white/5 leading-relaxed">
                          "{item.text}"
                        </p>
                      </div>
                    ))
                  )}
                  <div ref={transcriptEndRef} />
                </div>

                {/* Confirmed Appointment Notification */}
                {isAppointmentConfirmed && confirmedDetails && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-4 mb-4 text-emerald-300 flex items-start gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                  >
                    <CheckCircle2 size={24} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-left text-xs space-y-1">
                      <p className="font-bold text-sm text-emerald-300 font-mono">APPOINTMENT CONFIRMED!</p>
                      <p><span className="font-semibold text-white/80">Service:</span> {confirmedDetails.service}</p>
                      <p><span className="font-semibold text-white/80">Venue:</span> {confirmedDetails.venue}</p>
                      <p><span className="font-semibold text-white/80">Time & Date:</span> {confirmedDetails.date} at {confirmedDetails.time}</p>
                    </div>
                  </motion.div>
                )}

                {/* Hangup Button */}
                <button
                  onClick={endCall}
                  className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all transform hover:scale-110 cursor-pointer"
                  title="End Phone Call"
                >
                  <PhoneOff size={28} />
                </button>
              </motion.div>
            ) : activeTab === "call" ? (
              /* DIALER TAB */
              <motion.div
                key="dialer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                {/* Input Fields */}
                <div className="space-y-3 bg-white/5 p-4 rounded-2xl border border-white/10 text-left">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider font-semibold block mb-1">
                      Target Person / Business Name
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Dr. Sharma Dental Clinic"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-400 outline-none font-sans"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider font-semibold block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-cyan-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider font-semibold block mb-1">
                      Call Purpose / Appointment Request
                    </label>
                    <input
                      type="text"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="e.g. Book checkup slot for tomorrow at 4 PM"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-cyan-400 outline-none font-sans"
                    />
                  </div>
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((key) => (
                    <button
                      key={key}
                      onClick={() => handleKeypadPress(key)}
                      className="py-3 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/40 rounded-2xl text-lg font-mono font-bold text-white transition-all active:scale-95 cursor-pointer"
                    >
                      {key}
                    </button>
                  ))}
                </div>

                {/* Big Start Call Button */}
                <button
                  onClick={startCall}
                  disabled={!phoneNumber.trim()}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-bold font-mono uppercase tracking-wider rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Phone size={22} className="fill-black" />
                  <span>Execute Human AI Phone Call</span>
                </button>
              </motion.div>
            ) : (
              /* CONTACTS TAB */
              <motion.div
                key="contacts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3 text-left"
              >
                <p className="text-xs text-white/60 font-mono mb-2">Select a contact for instant AI phone appointment calling:</p>
                {DEFAULT_CONTACTS.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 bg-white/5 hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 rounded-2xl flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold font-mono">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">{c.name}</h4>
                        <p className="text-xs font-mono text-white/50">{c.phone} • {c.relationship}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setContactName(c.name);
                        setPhoneNumber(c.phone);
                        setActiveTab("call");
                      }}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black font-mono text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Phone size={14} />
                      <span>Select</span>
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
