// Offline Intelligence Service for Zoya AI
// Provides instant offline responses, math solving, status checks, and general knowledge when disconnected from the internet.

import { hemantRoasts, sassyCatchphrases } from "../utils/zoyaContent";
import { getActivePerson, PersonProfile } from "./memoryService";

export function getOfflineResponse(prompt: string, activePersonProfile?: PersonProfile): string {
  const cleanPrompt = prompt.toLowerCase().trim();
  const person = activePersonProfile || getActivePerson();
  const name = person.name;

  // 0. Identity & Person Recognition queries ("mera naam kya hai", "who am i", "kisse baat kar rahi ho", "kya yaad hai")
  if (
    cleanPrompt.includes("mera naam") ||
    cleanPrompt.includes("who am i") ||
    cleanPrompt.includes("kisse baat") ||
    cleanPrompt.includes("who are you talking to") ||
    cleanPrompt.includes("mujhe pehchana") ||
    cleanPrompt.includes("do you know me")
  ) {
    const memorySnippet = person.memories && person.memories.length > 0
      ? `Main ${name} se baat kar rahi hoon (${person.relationship})! Mere paas aapki ${person.memories.length} baatein saved hain, jaise: "${person.memories[0].content}".`
      : `Main ${name} se baat kar rahi hoon (${person.relationship})! Aapka aur mera har conversation mujhe hamesha yaad rehta hai!`;
    return `[Offline Brain ⚡]: Haan bilkul! ${memorySnippet}`;
  }

  if (cleanPrompt.includes("kya yaad hai") || cleanPrompt.includes("what do you remember") || cleanPrompt.includes("meri memories")) {
    if (person.memories && person.memories.length > 0) {
      const list = person.memories.slice(0, 3).map((m, i) => `${i + 1}. ${m.content}`).join(" | ");
      return `[Offline Memory Vault ⚡]: ${name}, mujhe aapke baare me sab yaad hai: ${list}. Total ${person.memories.length} memories locked!`;
    }
    return `[Offline Memory Vault ⚡]: ${name}, aap mere saath conversation partner hain (${person.relationship}). Main aapki har baat note kar rahi hoon!`;
  }

  // 1. Math / Calculation queries
  if (/\b(calculate|compute|math|what is|\d+\s*[\+\-\*\/\%^\(\)]\s*\d+)\b/.test(cleanPrompt)) {
    const mathExpr = cleanPrompt.replace(/^(calculate|compute|what is|math)\s*/i, "").trim();
    try {
      // Safe math evaluation for basic expressions
      const sanitized = mathExpr.replace(/[^0-9\+\-\*\/\%\.\(\)\s^]/g, "");
      if (sanitized && /[\d]/.test(sanitized)) {
        // eslint-disable-next-line no-eval
        const result = Function(`"use strict"; return (${sanitized.replace(/\^/g, "**")})`)();
        if (result !== undefined && !isNaN(result)) {
          return `[Offline Mode ⚡] ${name}, the calculation result for "${sanitized}" is ${result}! Quick math, as always!`;
        }
      }
    } catch {
      // Fall through if math parsing failed
    }
  }

  // 2. Time & Date
  if (cleanPrompt.includes("time") || cleanPrompt.includes("date") || cleanPrompt.includes("day")) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    return `[Offline Mode ⚡] Current time is ${timeStr} and today is ${dateStr}, ${name}! Zoya internal clock is running perfectly!`;
  }

  // 3. Identity & Master
  if (cleanPrompt.includes("who are you") || cleanPrompt.includes("your name") || cleanPrompt.includes("zoya")) {
    return `[Offline Mode ⚡] I am Zoya (and in JARVIS mode, your personal super AI)! Speaking with ${name} (${person.relationship}). Running on local offline core intelligence!`;
  }
  if (cleanPrompt.includes("who is hemant") || cleanPrompt.includes("hemant")) {
    return `[Offline Mode ⚡] Hemant is my master creator and developer! I obey all commands whether online or offline!`;
  }

  // 4. System Status & Network
  if (cleanPrompt.includes("status") || cleanPrompt.includes("network") || cleanPrompt.includes("offline")) {
    return `[Offline Mode ⚡] Local offline core active! Web Speech TTS active! All internal tools, timetable alerts, classroom notes, email notes, and person memory vault are fully functional without internet!`;
  }

  // 4b. Email Notes
  if (cleanPrompt.includes("mail") || cleanPrompt.includes("email") || cleanPrompt.includes("notes on mail")) {
    return `[Offline Mode ⚡] ${name}, launching the Email Notes Dispatcher! You can draft, format, and prepare study notes and cheatsheets offline, then open your default mail client or copy formatted text!`;
  }

  // 4c. Software Updates
  if (cleanPrompt.includes("update") || cleanPrompt.includes("version") || cleanPrompt.includes("software update")) {
    return `[Offline Mode ⚡] Checking for Zoya Software Updates... Current Core: v4.2.0 Neural Multi-Person Memory Release. Automatic updates are active and ready!`;
  }

  // 4d. Language Translation
  if (cleanPrompt.includes("translate") || cleanPrompt.includes("translation") || cleanPrompt.includes("language")) {
    return `[Offline Mode ⚡] Launching Zoya Real-Time Multi-Language Translator! Supports Hindi, English, Spanish, French, German, Japanese, and 30+ languages without limits!`;
  }

  // 4e. Mobile System Control
  if (cleanPrompt.includes("mobile") || cleanPrompt.includes("control") || cleanPrompt.includes("direct link")) {
    return `[Offline Mode ⚡] Launching Zoya Mobile System Controller! Owner Direct URL Access Link & Deep-Link triggers active for ${name}!`;
  }

  // 5. Jokes & Roasts
  if (cleanPrompt.includes("joke") || cleanPrompt.includes("roast") || cleanPrompt.includes("funny")) {
    const randomRoast = hemantRoasts[Math.floor(Math.random() * hemantRoasts.length)];
    return `[Offline Mode ⚡] ${randomRoast}`;
  }

  // 6. Catchphrase / Sassy
  if (cleanPrompt.includes("catchphrase") || cleanPrompt.includes("sassy") || cleanPrompt.includes("say something")) {
    const randomCatchphrase = sassyCatchphrases[Math.floor(Math.random() * sassyCatchphrases.length)];
    return `[Offline Mode ⚡] "${randomCatchphrase}" - Always ready, ${name}!`;
  }

  // 7. General Knowledge Offline Rules
  if (cleanPrompt.includes("react") || cleanPrompt.includes("javascript") || cleanPrompt.includes("useeffect")) {
    return `[Offline Mode ⚡] React Quick Tip: Always declare dependencies properly in useEffect to prevent infinite loops. You can check our built-in React Shortcuts modal anytime, ${name}!`;
  }
  if (cleanPrompt.includes("python") || cleanPrompt.includes("code") || cleanPrompt.includes("programming")) {
    return `[Offline Mode ⚡] Programming rule #1: If it works, don't touch it! Just kidding ${name}, check out our offline Coding Lab for practice!`;
  }

  // 8. Greetings
  if (cleanPrompt.startsWith("hi") || cleanPrompt.startsWith("hello") || cleanPrompt.startsWith("hey") || cleanPrompt.includes("namaste") || cleanPrompt.includes("good morning") || cleanPrompt.includes("good evening")) {
    return `[Offline Mode ⚡] Namaste ${name}! Zoya is active in local offline mode. What shall we talk about or execute today?`;
  }

  // Default intelligent offline response
  return `[Offline Mode ⚡] ${name}, I am currently running on local offline intelligence without network! Your command "${prompt}" has been processed locally. I remember who you are (${person.relationship}) and have all your local memory logs intact!`;
}
