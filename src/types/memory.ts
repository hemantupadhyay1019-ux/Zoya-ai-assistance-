export type PersonRole = "owner" | "partner" | "friend" | "family" | "colleague" | "guest" | "other";

export type MemoryCategory = "fact" | "preference" | "conversation" | "plan" | "secret" | "personal" | "work" | "relationship";

export interface MemoryItem {
  id: string;
  personId: string;
  personName: string;
  category: MemoryCategory;
  content: string;
  timestamp: string;
  source: "auto_talk" | "manual" | "introduced";
  pinned?: boolean;
  importance?: "high" | "medium" | "low";
}

export type PersonMemoryItem = MemoryItem;

export interface ConversationTurnRecord {
  id: string;
  timestamp: string;
  userText: string;
  assistantText: string;
}

export interface PersonProfile {
  id: string;
  name: string;
  nickname?: string;
  role: PersonRole;
  isOwner: boolean;
  relationship: string;
  introducedBy: string; // e.g. "Hemant (Owner)" or "Self"
  introducedAt: string;
  createdDate?: string;
  avatarColor: string; // Hex or Tailwind color
  age?: number | string; // Age of the person (e.g. 23 or "23 years")
  work?: string; // Profession, occupation, or role (e.g. "Software Engineer & AI Architect")
  location?: string; // City or place of origin
  visualTraits?: string; // Visual appearance, features, or attire
  phone?: string;
  email?: string;
  bio?: string;
  lastTalkedAt: string;
  talkCount: number;
  totalConversations?: number;
  memories: MemoryItem[];
  recentTalks?: ConversationTurnRecord[];
}
