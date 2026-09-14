import React, { useState } from "react";
import { Code2, ShieldAlert, Terminal, Play, BookOpen, Lock, Cpu, CheckCircle2, Copy, Sparkles, X, Shield, CpuIcon, Layers, FileCode } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CodeTopic, CybersecurityModule } from "../types/assistant";

interface CodingCyberLabProps {
  initialTab?: "coding" | "cybersecurity";
  onClose: () => void;
}

const CODING_TOPICS: CodeTopic[] = [
  {
    id: "py-1",
    title: "Python Data Structures & Algorithms",
    language: "python",
    level: "Intermediate",
    description: "Master Python lists, dictionaries, list comprehensions, and search algorithms.",
    code: `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return f"Found target {target} at index {mid}!"
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
            
    return "Target not found in array"

# Test binary search
data = [10, 20, 35, 45, 60, 80, 99]
print(binary_search(data, 60))`,
    explanation: "Binary Search operates in O(log n) time by dividing the search range in half on each iteration.",
    outputExample: "Found target 60 at index 4!"
  },
  {
    id: "js-1",
    title: "Async/Await & Promises in JavaScript",
    language: "javascript",
    level: "Advanced",
    description: "Understand asynchronous event loops, API requests, and exception handling.",
    code: `async function fetchUserData(userId) {
  try {
    console.log(\`[JARVIS] Requesting data for user ID: \${userId}...\`);
    const response = await new Promise((resolve) => 
      setTimeout(() => resolve({ id: userId, name: "Hemant", role: "Master Architect" }), 800)
    );
    console.log("[JARVIS] Response received successfully!");
    return response;
  } catch (error) {
    console.error("Failed to fetch user data:", error);
  }
}

fetchUserData(101).then((data) => console.log("User Profile:", data));`,
    explanation: "Promises represent values that will resolve in the future. Async/await provides clean synchronous-like syntax for promises.",
    outputExample: `[JARVIS] Requesting data for user ID: 101...\n[JARVIS] Response received successfully!\nUser Profile: { id: 101, name: 'Hemant', role: 'Master Architect' }`
  },
  {
    id: "cpp-1",
    title: "C++ Memory Management & Pointers",
    language: "cpp",
    level: "Advanced",
    description: "Learn dynamic memory allocation, stack vs heap, and smart pointers in C++.",
    code: `#include <iostream>
#include <memory>

class JARVISCore {
public:
    JARVISCore() { std::cout << "JARVIS System Online\\n"; }
    ~JARVISCore() { std::cout << "JARVIS System Offline\\n"; }
    void status() { std::cout << "Quantum Shield Status: 100% Optimal\\n"; }
};

int main() {
    // Unique pointer for automatic memory release
    std::unique_ptr<JARVISCore> core = std::make_unique<JARVISCore>();
    core->status();
    return 0;
}`,
    explanation: "Smart pointers like std::unique_ptr automatically deallocate memory when going out of scope, preventing memory leaks.",
    outputExample: `JARVIS System Online\nQuantum Shield Status: 100% Optimal\nJARVIS System Offline`
  }
];

const CYBER_MODULES: CybersecurityModule[] = [
  {
    id: "cy-1",
    title: "Web Vulnerability: SQL Injection (SQLi) & Defense",
    category: "Web Security",
    level: "Fundamentals",
    summary: "How attackers exploit unsanitized database queries and how to secure them using Prepared Statements.",
    howItWorks: "When raw string concatenation is used in SQL queries, an attacker can input `' OR '1'='1` to alter query logic and bypass authentication.",
    ethicalGuidance: "Ethical security researchers test for SQLi to verify database input sanitization and prevent unauthorized data leaks.",
    vulnerabilityExample: `// ❌ VULNERABLE SQL QUERY (String concatenation)
const query = "SELECT * FROM users WHERE username = '" + userInput + "' AND password = '" + passInput + "'";`,
    patchCode: `// ✅ SECURE SQL QUERY (Parameterized Prepared Statement)
const query = "SELECT * FROM users WHERE username = ? AND password = ?";
db.query(query, [userInput, passInput]);`,
    preventionSteps: [
      "Always use Parameterized Queries or ORMs (Drizzle, Prisma, TypeORM).",
      "Apply strict input validation and type checking.",
      "Grant least-privilege permissions to database service accounts."
    ]
  },
  {
    id: "cy-2",
    title: "Network Security: Ethical Penetration Testing & Port Scanning",
    category: "Ethical Hacking & Pentesting",
    level: "Practical Defense",
    summary: "Understanding TCP/IP handshakes, open port discovery, and firewall rule auditing.",
    howItWorks: "Penetration testers send SYN packets to target ports to identify running services (SSH, HTTP, FTP) and locate unpatched service versions.",
    ethicalGuidance: "Port scanning must ONLY be performed on systems you explicitly own or have written authorization to audit.",
    vulnerabilityExample: `# Conceptual Port Reconnaissance (Nmap Defense Audit)
nmap -sV -sC -p 1-1000 192.168.1.1`,
    patchCode: `# Secure Firewall Rule (UFW / iptables)
# Block all incoming traffic except SSH and HTTP/HTTPS
ufw default deny incoming
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable`,
    preventionSteps: [
      "Disable unnecessary network services and close unused ports.",
      "Deploy Web Application Firewalls (WAF) and Intrusion Detection Systems (IDS).",
      "Keep all service packages updated to the latest secure security releases."
    ]
  },
  {
    id: "cy-3",
    title: "Cryptography: Public Key Infrastructure (PKI) & TLS Encryption",
    category: "Cryptography",
    level: "Architectural Security",
    summary: "How asymmetric RSA/ECC keys secure internet communications and prevent Man-In-The-Middle (MITM) attacks.",
    howItWorks: "Data is encrypted using a recipient's Public Key and can only be decrypted by their secret Private Key.",
    ethicalGuidance: "Understanding encryption ensures developers build zero-trust data stores and end-to-end encrypted messaging channels.",
    vulnerabilityExample: `// ❌ Insecure HTTP plain-text communication
http.get("http://api.example.com/user-data");`,
    patchCode: `// ✅ Secure TLS 1.3 End-to-End Encryption with SHA-256 Certificates
https.get("https://api.example.com/user-data", {
  minVersion: 'TLSv1.3'
});`,
    preventionSteps: [
      "Enforce HTTPS and HSTS (HTTP Strict Transport Security) headers.",
      "Store secrets using HMAC-SHA256 or bcrypt / Argon2 hashing for passwords.",
      "Never hardcode private keys or secrets inside client-side code."
    ]
  },
  {
    id: "cy-4",
    title: "Mobile Security: Smartphone Defense & App Permission Auditing",
    category: "System Hardening",
    level: "Practical Defense",
    summary: "How mobile operating systems isolate applications through sandboxing and how to audit app permissions against unauthorized access.",
    howItWorks: "Mobile platforms (Android/iOS) enforce strict per-application sandboxes. Malicious apps attempt privilege escalation via sideloaded APKs or excessive runtime permissions (contacts, storage, camera, SMS).",
    ethicalGuidance: "Auditing mobile app permissions and analyzing APK manifests helps users protect their privacy and stop unwanted background data exfiltration.",
    vulnerabilityExample: `<!-- ❌ Overly permissive AndroidManifest.xml (Dangerous Privileges) -->
<manifest>
  <uses-permission android:name="android.permission.READ_CONTACTS" />
  <uses-permission android:name="android.permission.READ_SMS" />
  <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
</manifest>`,
    patchCode: `<!-- ✅ Principle of Least Privilege: Only request necessary permissions at runtime -->
<!-- Use scoped storage and system pickers without granting direct file access -->
<manifest>
  <uses-permission android:name="android.permission.INTERNET" />
</manifest>`,
    preventionSteps: [
      "Regularly review App Permissions in Settings > Privacy > Permission Manager.",
      "Only install apps from verified official app stores and verify developer credentials.",
      "Enable Google Play Protect and avoid enabling 'Install Unknown Apps / Sideloading'.",
      "Keep the mobile operating system and security patches up to date."
    ]
  },
  {
    id: "cy-5",
    title: "Data Protection: Device Encryption & Secure File Sharing",
    category: "Cryptography",
    level: "Architectural Security",
    summary: "Understanding hardware-backed mobile encryption (FBE/FDE) and authenticated file transfer protocols.",
    howItWorks: "Modern mobile phones use File-Based Encryption (FBE) where cryptographic keys are tied to the device's hardware Secure Enclave/TrustZone. Data cannot be extracted without the master user passcode.",
    ethicalGuidance: "Ethical cybersecurity engineers deploy zero-knowledge protocols and end-to-end encryption to guarantee that only the intended recipient can decrypt files.",
    vulnerabilityExample: `// ❌ Insecure unencrypted local file transfer over cleartext HTTP
const socket = new WebSocket("ws://192.168.1.50:8080");
socket.send(rawSensitiveFileData);`,
    patchCode: `// ✅ Authenticated AES-GCM-256 encrypted file transfer with TLS
const encryptedPayload = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv: cryptographicIV },
  recipientPublicKey,
  fileArrayBuffer
);
await fetch("https://secure-vault.internal/transfer", { method: "POST", body: encryptedPayload });`,
    preventionSteps: [
      "Always set a strong screen lock (PIN, password, or biometric key).",
      "Use end-to-end encrypted sharing mechanisms (AirDrop, Quick Share, or encrypted vault sync).",
      "Enable remote wipe capabilities (Find My Device) in case a phone is misplaced."
    ]
  }
];

export default function CodingCyberLab({ initialTab = "coding", onClose }: CodingCyberLabProps) {
  const [activeTab, setActiveTab] = useState<"coding" | "cybersecurity">(initialTab);
  const [selectedTopic, setSelectedTopic] = useState<CodeTopic>(CODING_TOPICS[0]);
  const [selectedCyber, setSelectedCyber] = useState<CybersecurityModule>(CYBER_MODULES[0]);
  const [consoleOutput, setConsoleOutput] = useState<string>("");
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleRunCode = () => {
    setIsRunningCode(true);
    setConsoleOutput("Initializing JARVIS Sandbox runtime environment...\nCompiling code snippet...");

    setTimeout(() => {
      setIsRunningCode(false);
      setConsoleOutput(`[JARVIS RUNTIME OUTPUT]\n----------------------------------------\n${selectedTopic.outputExample}\n----------------------------------------\nProcess exited with status 0 (Success)`);
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-lg p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl bg-[#070b14] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.25)] flex flex-col h-[90vh] text-white relative"
      >
        {/* Top Header */}
        <div className="p-5 bg-gradient-to-r from-cyan-950/80 via-[#0a0f1d] to-indigo-950/80 border-b border-cyan-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Cpu size={22} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono tracking-wider text-cyan-400 uppercase flex items-center gap-2">
                JARVIS INTELLIGENCE CORE & ACADEMY <Sparkles size={16} className="text-yellow-400" />
              </h2>
              <p className="text-xs text-white/60 font-mono">Master Computer Science, Programming & Ethical Cybersecurity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 bg-black/50 text-xs font-mono shrink-0">
          <button
            onClick={() => setActiveTab("coding")}
            className={`flex-1 py-3.5 text-center transition-all cursor-pointer border-b-2 font-bold flex items-center justify-center gap-2 ${
              activeTab === "coding"
                ? "border-cyan-400 text-cyan-400 bg-cyan-500/10"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            <Code2 size={16} /> 💻 Software Engineering & Code Tutor
          </button>
          <button
            onClick={() => setActiveTab("cybersecurity")}
            className={`flex-1 py-3.5 text-center transition-all cursor-pointer border-b-2 font-bold flex items-center justify-center gap-2 ${
              activeTab === "cybersecurity"
                ? "border-emerald-400 text-emerald-400 bg-emerald-500/10"
                : "border-transparent text-white/60 hover:text-white"
            }`}
          >
            <ShieldAlert size={16} /> 🛡️ Ethical Hacking & Cyber Security Hub
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-6 text-left">
          {activeTab === "coding" ? (
            /* CODING LAB VIEW */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              {/* Left Column: Topics list */}
              <div className="space-y-3">
                <p className="text-xs font-mono uppercase text-cyan-400 font-bold tracking-wider mb-2">
                  SELECT TUTORIAL MODULE
                </p>
                {CODING_TOPICS.map((topic) => (
                  <div
                    key={topic.id}
                    onClick={() => {
                      setSelectedTopic(topic);
                      setConsoleOutput("");
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedTopic.id === topic.id
                        ? "bg-cyan-500/15 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                        : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                        {topic.language}
                      </span>
                      <span className="text-[10px] font-mono text-white/50">{topic.level}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">{topic.title}</h4>
                    <p className="text-xs text-white/60 line-clamp-2">{topic.description}</p>
                  </div>
                ))}
              </div>

              {/* Right 2 Columns: Code Editor & Console */}
              <div className="lg:col-span-2 flex flex-col justify-between space-y-4">
                {/* Code Window */}
                <div className="bg-[#04070e] border border-cyan-500/30 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
                  {/* Editor Header */}
                  <div className="bg-[#0b101d] px-4 py-2.5 border-b border-cyan-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                      <span className="ml-2 text-xs font-mono text-cyan-400 font-semibold">
                        {selectedTopic.title}.{selectedTopic.language}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(selectedTopic.code)}
                        className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] font-mono text-white/70 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedCode ? <CheckCircle2 size={12} className="text-emerald-400" /> : <Copy size={12} />}
                        <span>{copiedCode ? "Copied" : "Copy"}</span>
                      </button>

                      <button
                        onClick={handleRunCode}
                        disabled={isRunningCode}
                        className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Play size={12} className="fill-black" />
                        <span>Run Code</span>
                      </button>
                    </div>
                  </div>

                  {/* Code View */}
                  <pre className="p-4 font-mono text-xs text-cyan-200/90 leading-relaxed overflow-x-auto bg-[#04070e] max-h-[280px]">
                    <code>{selectedTopic.code}</code>
                  </pre>
                </div>

                {/* Explanation Card */}
                <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-4 text-xs space-y-1">
                  <span className="font-mono text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                    JARVIS TUTOR INSIGHT
                  </span>
                  <p className="text-white/90 leading-relaxed">{selectedTopic.explanation}</p>
                </div>

                {/* Interactive Console Output */}
                <div className="bg-black/80 border border-emerald-500/30 rounded-2xl p-4 font-mono text-xs text-emerald-400 space-y-2">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1 text-[10px] text-emerald-500 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><Terminal size={12} /> JARVIS SANDBOX TERMINAL</span>
                    <span>Status: Ready</span>
                  </div>
                  <pre className="text-xs text-emerald-300 leading-relaxed whitespace-pre-wrap min-h-[60px]">
                    {consoleOutput || `// Click "Run Code" to execute this snippet inside JARVIS's isolated virtual engine.`}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            /* CYBERSECURITY LAB VIEW */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              {/* Left Column: Cyber Modules */}
              <div className="space-y-3">
                <p className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider mb-2">
                  ETHICAL HACKING & DEFENSE MODULES
                </p>
                {CYBER_MODULES.map((mod) => (
                  <div
                    key={mod.id}
                    onClick={() => setSelectedCyber(mod)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedCyber.id === mod.id
                        ? "bg-emerald-500/15 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                        : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        {mod.category}
                      </span>
                      <span className="text-[10px] font-mono text-white/50">{mod.level}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mb-1">{mod.title}</h4>
                    <p className="text-xs text-white/60 line-clamp-2">{mod.summary}</p>
                  </div>
                ))}
              </div>

              {/* Right 2 Columns: Detailed Breakdown */}
              <div className="lg:col-span-2 space-y-5">
                {/* Module Overview */}
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 border-b border-emerald-500/20 pb-2">
                    <Shield size={18} className="text-emerald-400" />
                    <h3 className="text-base font-bold font-mono text-emerald-300">{selectedCyber.title}</h3>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider mb-1">
                      How Vulnerability Works Conceptually
                    </h5>
                    <p className="text-xs text-white/90 leading-relaxed">{selectedCyber.howItWorks}</p>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-mono text-yellow-400 uppercase font-bold tracking-wider mb-1">
                      Ethical Guidance & Defensive Compliance
                    </h5>
                    <p className="text-xs text-yellow-200/80 leading-relaxed italic">{selectedCyber.ethicalGuidance}</p>
                  </div>
                </div>

                {/* Code Comparison (Vulnerable vs Patch) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-4 text-xs font-mono space-y-2">
                    <span className="text-red-400 font-bold text-[10px] uppercase tracking-wider block border-b border-red-500/20 pb-1">
                      ⚠️ Vulnerable Concept / Risk
                    </span>
                    <pre className="text-red-200/90 whitespace-pre-wrap overflow-x-auto text-[11px]">
                      {selectedCyber.vulnerabilityExample}
                    </pre>
                  </div>

                  <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 text-xs font-mono space-y-2">
                    <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-wider block border-b border-emerald-500/20 pb-1">
                      ✅ Secure Patch Implementation
                    </span>
                    <pre className="text-emerald-200/90 whitespace-pre-wrap overflow-x-auto text-[11px]">
                      {selectedCyber.patchCode}
                    </pre>
                  </div>
                </div>

                {/* Prevention Checklist */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                  <h5 className="text-[10px] font-mono text-cyan-400 uppercase font-bold tracking-wider">
                    Defensive Security Recommendations
                  </h5>
                  <ul className="space-y-1.5 text-xs text-white/80">
                    {selectedCyber.preventionSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
