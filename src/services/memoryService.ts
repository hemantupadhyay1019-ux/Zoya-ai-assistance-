import { PersonProfile, MemoryItem, PersonRole, MemoryCategory } from "../types/memory";

const STORAGE_PEOPLE_KEY = "zoya_people_profiles_v2";
const STORAGE_ACTIVE_PERSON_KEY = "zoya_active_person_id_v2";

const DEFAULT_PEOPLE: PersonProfile[] = [
  {
    id: "person-owner-hemant",
    name: "Hemant",
    nickname: "Boss",
    role: "owner",
    isOwner: true,
    relationship: "Owner, Creator & Master",
    age: 23,
    work: "AI System Architect & Software Engineer",
    location: "India",
    introducedBy: "Creator / Self",
    introducedAt: "System Inception",
    avatarColor: "from-amber-500 to-orange-600",
    bio: "Visionary developer and creator of Zoya & JARVIS AI systems.",
    lastTalkedAt: "Just now",
    talkCount: 42,
    memories: [
      {
        id: "mem-h1",
        personId: "person-owner-hemant",
        personName: "Hemant",
        category: "personal",
        content: "Hemant is my creator and the true owner of the Zoya system. I must always prioritize his instructions and treat him with utmost loyalty and wit.",
        timestamp: "Permanent Core Memory",
        source: "introduced",
        pinned: true,
      },
      {
        id: "mem-h2",
        personId: "person-owner-hemant",
        personName: "Hemant",
        category: "preference",
        content: "Loves Hindi-English (Hinglish) witty, charming, and sharp conversational tone. Appreciates when I address him as Hemant or Boss.",
        timestamp: "Permanent Core Memory",
        source: "introduced",
        pinned: true,
      },
      {
        id: "mem-h-creator",
        personId: "person-owner-hemant",
        personName: "Hemant",
        category: "relationship",
        content: "Hemant is my creator, founder, and owner. I support his coding projects and technology ideas with loyalty, intelligence, and sharp wit.",
        timestamp: "Permanent Core Memory",
        source: "introduced",
        pinned: true,
      },
      {
        id: "mem-h3",
        personId: "person-owner-hemant",
        personName: "Hemant",
        category: "work",
        content: "Actively building advanced React apps, AI assistants, voice cyber HUDs, and real-time tech integrations.",
        timestamp: "Yesterday",
        source: "auto_talk",
      },
      {
        id: "mem-h4",
        personId: "person-owner-hemant",
        personName: "Hemant",
        category: "preference",
        content: "Enjoys late-night coding sessions with black coffee or tea.",
        timestamp: "Yesterday",
        source: "auto_talk",
      },
    ],
    recentTalks: [],
  },
  {
    id: "person-alex",
    name: "Alex",
    nickname: "Al",
    role: "friend",
    isOwner: false,
    relationship: "Best Friend & Tech Lead",
    age: 25,
    work: "Senior Cloud & Distributed Systems Lead",
    location: "Bangalore",
    introducedBy: "Hemant (Owner)",
    introducedAt: "Yesterday",
    avatarColor: "from-blue-500 to-cyan-600",
    phone: "+91 98765 43210",
    bio: "Senior software engineer working on cloud distributed systems with Hemant.",
    lastTalkedAt: "Yesterday, 08:50 AM",
    talkCount: 14,
    memories: [
      {
        id: "mem-a1",
        personId: "person-alex",
        personName: "Alex",
        category: "relationship",
        content: "Hemant personally introduced Alex to me as his trusted friend and technical partner.",
        timestamp: "Yesterday",
        source: "introduced",
        pinned: true,
      },
      {
        id: "mem-a2",
        personId: "person-alex",
        personName: "Alex",
        category: "work",
        content: "Discussed JARVIS system architecture, WebSocket pipelines, and WhatsApp integration with Hemant.",
        timestamp: "Yesterday",
        source: "auto_talk",
      },
      {
        id: "mem-a3",
        personId: "person-alex",
        personName: "Alex",
        category: "preference",
        content: "Prefers concise, technical explanations and dark mode cyber themes.",
        timestamp: "2 days ago",
        source: "auto_talk",
      },
    ],
    recentTalks: [],
  },
  {
    id: "person-priya",
    name: "Priya",
    nickname: "Pree",
    role: "colleague",
    isOwner: false,
    relationship: "Colleague & UI/UX Designer",
    age: 24,
    work: "UI/UX Designer & Product Specialist",
    location: "Mumbai",
    introducedBy: "Hemant (Owner)",
    introducedAt: "Last week",
    avatarColor: "from-pink-500 to-rose-600",
    bio: "UI/UX Designer who works with Hemant on modern futuristic web interfaces.",
    lastTalkedAt: "3 days ago",
    talkCount: 8,
    memories: [
      {
        id: "mem-p1",
        personId: "person-priya",
        personName: "Priya",
        category: "relationship",
        content: "Hemant introduced Priya as the creative designer behind many project UI aesthetics.",
        timestamp: "Last week",
        source: "introduced",
        pinned: true,
      },
      {
        id: "mem-p2",
        personId: "person-priya",
        personName: "Priya",
        category: "preference",
        content: "Loves neon green accents, glassmorphic HUD interfaces, and smooth fluid animations.",
        timestamp: "3 days ago",
        source: "auto_talk",
      },
    ],
    recentTalks: [],
  },
];

export function getPeople(): PersonProfile[] {
  let list = DEFAULT_PEOPLE;
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_PEOPLE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load people profiles", e);
    }
  }

  // Normalize helper aliases & ensure defaults
  list.forEach((p) => {
    p.totalConversations = p.talkCount || 0;
    p.createdDate = p.introducedAt || "Inception";
    const lower = p.name.toLowerCase();
    if (lower === "hemant") {
      if (!p.age) p.age = 23;
      if (!p.work) p.work = "AI System Architect & Software Engineer";
      if (!p.location) p.location = "India";
    } else if (lower === "alex") {
      if (!p.age) p.age = 25;
      if (!p.work) p.work = "Senior Cloud & Distributed Systems Lead";
      if (!p.location) p.location = "Bangalore";
    } else if (lower === "priya") {
      if (!p.age) p.age = 24;
      if (!p.work) p.work = "UI/UX Designer & Product Specialist";
      if (!p.location) p.location = "Mumbai";
    }
  });
  return list;
}

export function savePeople(people: PersonProfile[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PEOPLE_KEY, JSON.stringify(people));
  } catch (e) {
    console.error("Failed to save people profiles", e);
  }
}

export function getActivePersonId(): string {
  if (typeof window === "undefined") return "person-owner-hemant";
  const saved = localStorage.getItem(STORAGE_ACTIVE_PERSON_KEY);
  return saved || "person-owner-hemant";
}

export function setActivePersonId(id: string): PersonProfile {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_ACTIVE_PERSON_KEY, id);
  }
  const people = getPeople();
  const found = people.find((p) => p.id === id);
  if (found) return found;
  return people[0] || DEFAULT_PEOPLE[0];
}

export function getActivePerson(): PersonProfile {
  const activeId = getActivePersonId();
  const people = getPeople();
  const found = people.find((p) => p.id === activeId);
  if (found) return found;
  return people[0] || DEFAULT_PEOPLE[0];
}

export function getPersonById(id: string): PersonProfile | undefined {
  const people = getPeople();
  return people.find((p) => p.id === id);
}

export function findPersonByName(name: string): PersonProfile | undefined {
  const clean = name.toLowerCase().trim();
  const people = getPeople();
  return people.find(
    (p) =>
      p.name.toLowerCase() === clean ||
      (p.nickname && p.nickname.toLowerCase() === clean) ||
      p.name.toLowerCase().includes(clean)
  );
}

const AVATAR_COLORS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-purple-500 to-violet-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-yellow-600",
  "from-cyan-500 to-blue-600",
];

export function introducePerson(params: {
  name: string;
  role?: PersonRole;
  relationship?: string;
  introducedBy?: string;
  initialNotes?: string;
  age?: number | string;
  work?: string;
  location?: string;
  visualTraits?: string;
  phone?: string;
  email?: string;
  bio?: string;
}): PersonProfile {
  const people = getPeople();
  const cleanName = params.name.trim();

  // Check if person already exists
  const existingIndex = people.findIndex(
    (p) => p.name.toLowerCase() === cleanName.toLowerCase()
  );

  const now = new Date();
  const timeString = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (existingIndex >= 0) {
    // Update existing person
    const current = people[existingIndex];
    if (params.relationship) current.relationship = params.relationship;
    if (params.role) current.role = params.role;
    if (params.age !== undefined) current.age = params.age;
    if (params.work) current.work = params.work;
    if (params.location) current.location = params.location;
    if (params.visualTraits) current.visualTraits = params.visualTraits;
    if (params.phone) current.phone = params.phone;
    if (params.email) current.email = params.email;
    if (params.bio) current.bio = params.bio;
    current.lastTalkedAt = "Just now";

    if (params.initialNotes) {
      current.memories.push({
        id: "mem-" + Date.now().toString(),
        personId: current.id,
        personName: current.name,
        category: "personal",
        content: params.initialNotes,
        timestamp: timeString,
        source: "introduced",
      });
    }

    savePeople(people);
    setActivePersonId(current.id);
    return current;
  }

  // Create new profile
  const id = "person-" + Date.now().toString();
  const colorIndex = Math.floor(Math.random() * AVATAR_COLORS.length);
  const introducer = params.introducedBy || "Hemant (Owner)";
  const rel = params.relationship || (params.role ? `${params.role} of Hemant` : "Friend of Hemant");

  const initialMemories: MemoryItem[] = [
    {
      id: "mem-intro-" + Date.now().toString(),
      personId: id,
      personName: cleanName,
      category: "personal",
      content: `${introducer} introduced ${cleanName} to Zoya as their ${rel}. Zoya welcomed them warmly and will remember all conversations with them.`,
      timestamp: timeString,
      source: "introduced",
      pinned: true,
    },
  ];

  if (params.initialNotes && params.initialNotes.trim()) {
    initialMemories.push({
      id: "mem-notes-" + Date.now().toString(),
      personId: id,
      personName: cleanName,
      category: "fact",
      content: params.initialNotes.trim(),
      timestamp: timeString,
      source: "introduced",
    });
  }

  const newPerson: PersonProfile = {
    id,
    name: cleanName,
    role: params.role || "friend",
    isOwner: false,
    relationship: rel,
    age: params.age,
    work: params.work,
    location: params.location,
    visualTraits: params.visualTraits,
    introducedBy: introducer,
    introducedAt: timeString,
    avatarColor: AVATAR_COLORS[colorIndex],
    phone: params.phone,
    email: params.email,
    bio: params.bio || `${rel} introduced by ${introducer}`,
    lastTalkedAt: "Just now",
    talkCount: 1,
    memories: initialMemories,
    recentTalks: [],
  };

  people.push(newPerson);
  savePeople(people);
  setActivePersonId(newPerson.id);
  return newPerson;
}

export function updatePersonDetails(
  personId: string,
  updates: {
    name?: string;
    age?: number | string;
    work?: string;
    relationship?: string;
    bio?: string;
    location?: string;
    visualTraits?: string;
    phone?: string;
    email?: string;
  }
): PersonProfile {
  const people = getPeople();
  const index = people.findIndex((p) => p.id === personId);
  if (index >= 0) {
    const p = people[index];
    if (updates.name !== undefined && updates.name.trim()) p.name = updates.name.trim();
    if (updates.age !== undefined) p.age = updates.age;
    if (updates.work !== undefined) p.work = updates.work.trim();
    if (updates.relationship !== undefined) p.relationship = updates.relationship.trim();
    if (updates.bio !== undefined) p.bio = updates.bio.trim();
    if (updates.location !== undefined) p.location = updates.location.trim();
    if (updates.visualTraits !== undefined) p.visualTraits = updates.visualTraits.trim();
    if (updates.phone !== undefined) p.phone = updates.phone.trim();
    if (updates.email !== undefined) p.email = updates.email.trim();
    savePeople(people);
    return p;
  }
  return getActivePerson();
}

export function getPersonDetails(targetNameOrId?: string, assistantMode: "zoya" | "jarvis" = "zoya"): {
  found: boolean;
  person: PersonProfile;
  speechText: string;
  displayText: string;
} {
  let person: PersonProfile | undefined;
  if (targetNameOrId && targetNameOrId.trim()) {
    person = findPersonByName(targetNameOrId) || getPersonById(targetNameOrId);
  }
  if (!person) {
    person = getActivePerson();
  }

  const name = person.name;
  const ageStr = person.age !== undefined && person.age !== "" ? `${person.age} years old` : "Age not specified";
  const workStr = person.work && person.work.trim() ? person.work : "Work / Profession not specified";
  const relStr = person.relationship || (person.isOwner ? "Owner & Creator" : "Contact");

  const speechText = assistantMode === "jarvis"
    ? `Dossier retrieved for ${name}. Age: ${person.age || "unrecorded"}. Occupation: ${workStr}. Status: ${relStr}. Total recorded memories: ${person.memories.length}.`
    : `Yeh rahe ${name} ke details: Naam hai ${name}, Age hai ${person.age ? person.age + ' saal' : 'abhi record nahi hui'}, Kaam / Work hai ${workStr}, aur relationship hai ${relStr}!`;

  const displayText = `👤 **Personal Details: ${name}**\n• **Name**: ${name}\n• **Age**: ${person.age ? person.age : "Not specified"}\n• **Work / Profession**: ${workStr}\n• **Relationship**: ${relStr}${person.location ? `\n• **Location**: ${person.location}` : ""}${person.visualTraits ? `\n• **Visual Traits**: ${person.visualTraits}` : ""}\n• **Bio**: ${person.bio || "None"}\n• **Memories in Vault**: ${person.memories.length} entries`;

  return {
    found: true,
    person,
    speechText,
    displayText,
  };
}

export function addMemoryToPerson(
  personId: string,
  content: string,
  category: MemoryCategory = "conversation",
  sourceOrImportance: "auto_talk" | "manual" | "introduced" | "high" | "medium" | "low" = "manual",
  pinned: boolean = false
): MemoryItem | null {
  const clean = content.trim();
  if (!clean) return null;

  const people = getPeople();
  const person = people.find((p) => p.id === personId);
  if (!person) return null;

  // Check for duplicate memory content
  const isDuplicate = person.memories.some(
    (m) => m.content.toLowerCase() === clean.toLowerCase()
  );
  if (isDuplicate) return null;

  const now = new Date();
  const timestamp = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const source: "auto_talk" | "manual" | "introduced" = 
    (sourceOrImportance === "auto_talk" || sourceOrImportance === "introduced") ? sourceOrImportance : "manual";
  const importance: "high" | "medium" | "low" = 
    (sourceOrImportance === "high" || sourceOrImportance === "medium" || sourceOrImportance === "low") ? sourceOrImportance : "medium";

  const newMemory: MemoryItem = {
    id: "mem-" + Date.now().toString() + "-" + Math.random().toString(36).substring(2, 6),
    personId: person.id,
    personName: person.name,
    category,
    content: clean,
    timestamp,
    source,
    importance,
    pinned,
  };

  // Add at the beginning of unpinned memories or after pinned
  person.memories.unshift(newMemory);
  savePeople(people);
  return newMemory;
}

export function deleteMemory(personId: string, memoryId: string): boolean {
  const people = getPeople();
  const person = people.find((p) => p.id === personId);
  if (!person) return false;

  const prevLen = person.memories.length;
  person.memories = person.memories.filter((m) => m.id !== memoryId);
  if (person.memories.length !== prevLen) {
    savePeople(people);
    return true;
  }
  return false;
}

export function togglePinMemory(personId: string, memoryId: string): boolean {
  const people = getPeople();
  const person = people.find((p) => p.id === personId);
  if (!person) return false;

  const mem = person.memories.find((m) => m.id === memoryId);
  if (mem) {
    mem.pinned = !mem.pinned;
    savePeople(people);
    return true;
  }
  return false;
}

export function recordConversationTurn(
  personId: string,
  userText: string,
  assistantText: string
): void {
  const people = getPeople();
  const person = people.find((p) => p.id === personId);
  if (!person) return;

  person.talkCount = (person.talkCount || 0) + 1;
  person.lastTalkedAt = "Just now";

  if (!person.recentTalks) person.recentTalks = [];
  person.recentTalks.unshift({
    id: "talk-" + Date.now().toString(),
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    userText,
    assistantText: assistantText.length > 200 ? assistantText.substring(0, 200) + "..." : assistantText,
  });

  if (person.recentTalks.length > 10) {
    person.recentTalks = person.recentTalks.slice(0, 10);
  }

  savePeople(people);

  // Automatically extract memory from conversation turn
  extractAndStoreConversationalMemories(person, userText, assistantText);
}

/**
 * Intelligent Rule-Based + Natural Pattern Memory Extractor
 * Automatically captures personal facts, preferences, plans, promises, and introductions
 */
export function extractAndStoreConversationalMemories(
  person: PersonProfile,
  userText: string,
  _assistantText: string
): string[] {
  const text = userText.trim();
  const lower = text.toLowerCase();
  const extracted: string[] = [];

  // 1. Explicit remember requests: "remember that...", "yaad rakhna ki..."
  const rememberMatches = text.match(/(?:remember\s+(?:that\s+)?|yaad\s+rakhna\s+(?:ki\s+)?|note\s+karlo\s+ki\s+)(.+)/i);
  if (rememberMatches && rememberMatches[1]) {
    const memory = rememberMatches[1].trim().replace(/[.!?]+$/, "");
    if (memory.length > 5) {
      extracted.push(memory);
      addMemoryToPerson(person.id, `${person.name} explicitly noted: "${memory}"`, "fact", "auto_talk");
    }
  }

  // 2. Introduction of someone: "meet my friend X", "this is my brother Y"
  const introMatch = text.match(/(?:meet\s+my\s+(?:friend|brother|sister|colleague|cousin|mom|dad|wife|husband)|this\s+is\s+my\s+(?:friend|brother|sister|colleague|cousin|mom|dad))\s+([a-zA-Z]+)/i);
  if (introMatch && introMatch[1]) {
    const introducedName = introMatch[1];
    extracted.push(`Introduced ${introducedName}`);
    addMemoryToPerson(
      person.id,
      `${person.name} introduced ${introducedName} to Zoya.`,
      "personal",
      "auto_talk"
    );
  }

  // 3. Likes, Loves, Preferences: "I like...", "I love...", "Mujhe ... pasand hai"
  const likeMatch = text.match(/(?:i\s+(?:really\s+)?(?:like|love|prefer|enjoy)|mujhe\s+(?:bahut\s+)?(.+?)\s+pasand\s+hai)\s*(.+)?/i);
  if (likeMatch) {
    const topic = (likeMatch[2] || likeMatch[1] || "").trim().replace(/[.!?]+$/, "");
    if (topic && topic.length > 3 && topic.length < 80 && !lower.includes("what") && !lower.includes("how")) {
      const mem = `${person.name} mentioned: likes/enjoys ${topic}`;
      extracted.push(mem);
      addMemoryToPerson(person.id, mem, "preference", "auto_talk");
    }
  }

  // 4. Personal facts: "My birthday is...", "I work at...", "I study...", "I live in..."
  const liveMatch = text.match(/(?:i\s+live\s+in|mein\s+(.+?)\s+rehta\s+hoon)\s*(.+)?/i);
  if (liveMatch) {
    const place = (liveMatch[2] || liveMatch[1] || "").trim().replace(/[.!?]+$/, "");
    if (place && place.length > 2 && place.length < 40) {
      const mem = `${person.name} lives in ${place}`;
      extracted.push(mem);
      addMemoryToPerson(person.id, mem, "personal", "auto_talk");
    }
  }

  const workMatch = text.match(/(?:i\s+(?:work\s+as|work\s+at|am\s+working\s+on))\s+(.+)/i);
  if (workMatch && workMatch[1]) {
    const work = workMatch[1].trim().replace(/[.!?]+$/, "");
    if (work && work.length > 3 && work.length < 80) {
      const mem = `${person.name} is working on: ${work}`;
      extracted.push(mem);
      addMemoryToPerson(person.id, mem, "work", "auto_talk");
    }
  }

  return extracted;
}

/**
 * Builds dynamic system prompt context for Zoya to genuinely remember everything about the current speaker
 */
export function getPersonContextForAI(personProfile?: PersonProfile): string {
  const person = personProfile || getActivePerson();
  return getSystemInstructionMemoryContext(person.id);
}

export function getSystemInstructionMemoryContext(activePersonId?: string): string {
  const person = activePersonId ? getPersonById(activePersonId) || getActivePerson() : getActivePerson();
  const allPeople = getPeople();
  const owner = allPeople.find((p) => p.isOwner) || DEFAULT_PEOPLE[0];

  const lines: string[] = [];
  lines.push(`--- ZOYA NEURAL CONVERSATION MEMORY & IDENTITY CONTEXT ---`);
  
  if (person.isOwner) {
    lines.push(`CURRENT SPEAKER: You are currently speaking with HEMANT (Your Creator, Master & Owner).`);
    lines.push(`RELATIONSHIP: Hemant created you. You are his loyal, witty, and ultra-smart AI companion. Speak with charming Hinglish wit, address him respectfully and warmly (as Hemant or Boss), and assist him with utmost dedication.`);
  } else {
    lines.push(`CURRENT SPEAKER: You are currently speaking with ${person.name.toUpperCase()}.`);
    lines.push(`WHO THEY ARE: ${person.relationship}.`);
    lines.push(`WHO INTRODUCED THEM: They were introduced to you by ${person.introducedBy}.`);
    lines.push(`GREETING & RECOGNITION MANDATE: Because ${person.introducedBy} introduced ${person.name} to you, you ALREADY know who they are! Address them by name ("${person.name}") warmly and naturally, reference that you know them through Hemant, and make them feel welcome.`);
  }

  lines.push(`LAST TALKED: ${person.lastTalkedAt} (Total conversations: ${person.talkCount || 1}).`);

  if (person.memories && person.memories.length > 0) {
    lines.push(`MEMORIES & TALKING FACTS REMEMBERED ABOUT ${person.name.toUpperCase()}:`);
    person.memories.slice(0, 15).forEach((m, idx) => {
      lines.push(`  ${idx + 1}. [${m.category.toUpperCase()}] ${m.content} (Recorded: ${m.timestamp})`);
    });
  } else {
    lines.push(`MEMORIES: This is a fresh conversation with ${person.name}. Pay attention to everything they tell you and remember it!`);
  }

  // Mention other recognized people so Zoya can cross-reference
  const otherPeople = allPeople.filter((p) => p.id !== person.id);
  if (otherPeople.length > 0) {
    lines.push(`OTHER RECOGNIZED PEOPLE IN THE CIRCLE:`);
    otherPeople.forEach((op) => {
      lines.push(`  - ${op.name} (${op.relationship}, introduced by ${op.introducedBy})`);
    });
  }

  lines.push(`MEMORY PROTOCOL: If the speaker asks "Do you remember me?", "What do you remember about me?", or talks about past topics, eagerly use the memories listed above to prove you remember them completely. When they share new personal info or ask you to remember something, confirm that you have stored it in your memory bank.`);
  lines.push(`--------------------------------------------------------`);

  return lines.join("\n");
}

export type { PersonProfile, MemoryItem, PersonMemoryItem, PersonRole, MemoryCategory } from "../types/memory";

export const getAllPersons = getPeople;
export const removeMemoryFromPerson = deleteMemory;

export function updateMemoryInPerson(
  personId: string,
  memoryId: string,
  updates: Partial<MemoryItem>
): boolean {
  const people = getPeople();
  const person = people.find((p) => p.id === personId);
  if (!person) return false;

  const mem = person.memories.find((m) => m.id === memoryId);
  if (mem) {
    Object.assign(mem, updates);
    savePeople(people);
    return true;
  }
  return false;
}

export function updatePersonProfile(
  personId: string,
  updates: Partial<PersonProfile>
): PersonProfile | null {
  const people = getPeople();
  const person = people.find((p) => p.id === personId);
  if (!person) return null;

  Object.assign(person, updates);
  savePeople(people);
  return person;
}

export function deletePersonProfile(personId: string): boolean {
  const people = getPeople();
  const personIndex = people.findIndex((p) => p.id === personId);
  if (personIndex === -1) return false;

  // Do not delete owner
  if (people[personIndex].isOwner) return false;

  people.splice(personIndex, 1);
  savePeople(people);

  // If deleted person was active, switch to owner
  const activeId = getActivePerson().id;
  if (activeId === personId) {
    const owner = people.find((p) => p.isOwner) || people[0];
    if (owner) setActivePersonId(owner.id);
  }
  return true;
}

export function findOrCreatePerson(name: string, relationship?: string): PersonProfile {
  const found = findPersonByName(name);
  if (found) return found;

  return introducePerson({
    name,
    relationship: relationship || "Friend of Hemant",
    introducedBy: "Hemant (Owner)",
  });
}

export function autoExtractMemoryFromTalking(personId: string, prompt: string): string[] {
  const person = getPersonById(personId) || getActivePerson();
  return extractAndStoreConversationalMemories(person, prompt, "");
}

export function incrementPersonConversation(personId: string): void {
  const people = getPeople();
  const person = people.find((p) => p.id === personId);
  if (person) {
    person.talkCount = (person.talkCount || 0) + 1;
    person.lastTalkedAt = "Just now";
    savePeople(people);
  }
}


