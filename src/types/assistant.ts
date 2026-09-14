export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  relationship: string;
}

export interface CallTranscriptEntry {
  speaker: string;
  text: string;
  time: string;
}

export interface AppointmentDetails {
  service: string;
  venue: string;
  date: string;
  time: string;
  confirmedBy: string;
  notes?: string;
}

export interface PhoneCall {
  id: string;
  contactName: string;
  phoneNumber: string;
  purpose: string;
  type: "appointment" | "outgoing" | "incoming";
  status: "initiating" | "in_progress" | "completed" | "failed";
  timestamp: string;
  durationSeconds: number;
  transcript: CallTranscriptEntry[];
  appointmentDetails?: AppointmentDetails;
}

export interface MediaAttachment {
  id: string;
  title: string;
  type: "photo" | "document" | "code_screenshot";
  url: string;
  previewUrl: string;
  sentTo?: string;
  contactPhone?: string;
  sentAt?: string;
  status: "draft" | "sending" | "sent" | "failed";
  caption?: string;
  question?: string;
  aiAnswer?: string;
}

export interface CodeTopic {
  id: string;
  title: string;
  language: "javascript" | "python" | "cpp" | "html" | "sql";
  level: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  code: string;
  explanation: string;
  outputExample: string;
}

export interface CybersecurityModule {
  id: string;
  title: string;
  category: "Web Security" | "Ethical Hacking & Pentesting" | "Network Defense" | "Cryptography" | "System Hardening";
  level: "Fundamentals" | "Practical Defense" | "Architectural Security";
  summary: string;
  howItWorks: string;
  ethicalGuidance: string;
  vulnerabilityExample: string;
  patchCode: string;
  preventionSteps: string[];
}

export interface ClassroomLesson {
  id: string;
  gradeLevel: "Class 1-5 (Primary)" | "Class 6-8 (Middle)" | "Class 9-10 (High School)" | "Class 11-12 (Higher Sec)" | "University / CS";
  subject: "Mathematics" | "Science / Physics" | "Computer Science" | "English & Communication" | "History & Civics";
  topicTitle: string;
  keyConcepts: string[];
  explanation: string;
  exampleProblem: string;
  practiceQuestion: string;
  teacherTips: string;
}

export interface TimetableSlot {
  id: string;
  time: string; // e.g. "09:00 AM"
  activity: string; // e.g. "React Coding & Project Work"
  category: "Study" | "Work" | "Break" | "Fitness" | "Personal";
  isCompleted?: boolean;
  alertEnabled: boolean;
}

export interface ReactShortcut {
  id: string;
  title: string;
  category: "Hooks" | "VS Code Shortcuts" | "Vite & React Tooling" | "Performance & State";
  shortcutOrSyntax: string;
  description: string;
  codeSnippet?: string;
}

export interface CompletedAction {
  id: string;
  type: "call" | "photo" | "reminder" | "search";
  title: string;
  recipientOrTarget?: string;
  details: string;
  timestamp: string;
  status: "Completed" | "Confirmed" | "Sent" | "Scheduled";
  metadata?: {
    duration?: string;
    category?: string;
    imageUrl?: string;
    venue?: string;
  };
}

