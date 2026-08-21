import React, { useState } from "react";
import { GraduationCap, BookOpen, CheckCircle2, Sparkles, HelpCircle, Award, Volume2, X, ChevronRight, Brain, Lightbulb, Mail } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ClassroomLesson } from "../types/assistant";
import { getZoyaAudio } from "../services/geminiService";
import { playPCM } from "../utils/audioUtils";

interface TeacherClassroomModalProps {
  onClose: () => void;
  onOpenEmailNotes?: (subject: string, body: string) => void;
}

const LESSON_DATABASE: ClassroomLesson[] = [
  {
    id: "l1",
    gradeLevel: "Class 9-10 (High School)",
    subject: "Science / Physics",
    topicTitle: "Newton's Laws of Motion & Momentum",
    keyConcepts: ["Inertia (First Law)", "F = m * a (Second Law)", "Action & Reaction (Third Law)", "Conservation of Momentum"],
    explanation: "Newton's First Law states that an object remains at rest or in uniform motion unless acted upon by an external net force. Newton's Second Law quantifies force as mass times acceleration (F = ma). Newton's Third Law proves that forces always occur in equal and opposite pairs.",
    exampleProblem: "A force of 20 Newtons is applied to a 5 kg mass. What is its acceleration?\nSolution: Acceleration a = F / m = 20 N / 5 kg = 4 m/s².",
    practiceQuestion: "Why do passengers jerk forward when a fast-moving bus suddenly stops?",
    teacherTips: "Relate this to daily bus rides! Inertia of motion keeps the upper body moving forward when the bus brakes."
  },
  {
    id: "l2",
    gradeLevel: "Class 11-12 (Higher Sec)",
    subject: "Mathematics",
    topicTitle: "Calculus: Derivatives & Rates of Change",
    keyConcepts: ["Limits & Continuity", "Power Rule d/dx(x^n) = n*x^(n-1)", "Chain Rule", "Maxima & Minima Application"],
    explanation: "Derivatives measure how a function changes as its input changes. Geometrically, the derivative f'(x) represents the slope of the tangent line to the curve at point x.",
    exampleProblem: "Find the derivative of f(x) = 3x² + 5x - 7.\nSolution: f'(x) = 3*(2x) + 5*(1) - 0 = 6x + 5.",
    practiceQuestion: "What is the derivative of f(x) = sin(x) + cos(x)?",
    teacherTips: "Remember: d/dx[sin(x)] = cos(x), and d/dx[cos(x)] = -sin(x). Pay close attention to the minus sign!"
  },
  {
    id: "l3",
    gradeLevel: "University / CS",
    subject: "Computer Science",
    topicTitle: "Data Structures: Binary Search Trees & O(log n) Complexity",
    keyConcepts: ["BST Property (Left < Root < Right)", "In-order Traversal gives Sorted Array", "Tree Balancing (AVL / Red-Black)", "Search Complexity O(log n) vs O(n)"],
    explanation: "A Binary Search Tree is a node-based binary tree data structure where the left child of a node contains only values smaller than the node, and the right child contains values greater.",
    exampleProblem: "Insert 15, 10, 20 into an empty BST.\nSolution: 15 becomes root. 10 goes left of 15. 20 goes right of 15.",
    practiceQuestion: "What is the worst-case time complexity of searching a degenerate (skewed) BST?",
    teacherTips: "In a completely skewed tree (like a linked list), searching degrades to O(n). That's why we use self-balancing trees like AVL!"
  },
  {
    id: "l4",
    gradeLevel: "Class 6-8 (Middle)",
    subject: "Mathematics",
    topicTitle: "Algebra Basics: Solving Linear Equations in One Variable",
    keyConcepts: ["Variables vs Constants", "Transposition Rule", "Combining Like Terms", "Checking Solutions"],
    explanation: "An algebraic equation is a mathematical statement showing two expressions are equal. We isolate the unknown variable 'x' by applying inverse operations to both sides.",
    exampleProblem: "Solve 2x + 8 = 20.\nSolution: Subtract 8 -> 2x = 12. Divide by 2 -> x = 6.",
    practiceQuestion: "If 5x - 15 = 35, what is the value of x?",
    teacherTips: "Whatever operation you perform on the left side of the equation, you MUST do to the right side!"
  },
  {
    id: "l5",
    gradeLevel: "Class 1-5 (Primary)",
    subject: "English & Communication",
    topicTitle: "Parts of Speech: Nouns, Verbs & Adjectives",
    keyConcepts: ["Nouns (Naming Words)", "Verbs (Action Words)", "Adjectives (Describing Words)", "Building Fun Sentences"],
    explanation: "Nouns are names of people, places, or things. Verbs tell us what someone or something is doing. Adjectives describe or give more details about a noun!",
    exampleProblem: "In the sentence 'The fast cheetah ran smoothly', identify the verb and adjective.\nSolution: Verb = 'ran', Adjective = 'fast'.",
    practiceQuestion: "Identify the Noun in: 'Zoya is reading a wonderful book.'",
    teacherTips: "Nouns are everywhere you look! Look around your room right now: table, chair, laptop are all nouns!"
  }
];

export default function TeacherClassroomModal({ onClose, onOpenEmailNotes }: TeacherClassroomModalProps) {
  const [selectedGrade, setSelectedGrade] = useState<string>("All Grades");
  const [selectedSubject, setSelectedSubject] = useState<string>("All Subjects");
  const [activeLesson, setActiveLesson] = useState<ClassroomLesson>(LESSON_DATABASE[0]);
  const [userAnswer, setUserAnswer] = useState("");
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
  const [isSpeakingTeacher, setIsSpeakingTeacher] = useState(false);

  const handleMailLessonNotes = () => {
    if (onOpenEmailNotes) {
      const emailSubject = `Zoya AI Study Notes: ${activeLesson.topicTitle} (${activeLesson.gradeLevel})`;
      const emailBody = `ZOYA AI TEACHER CLASSROOM LESSON NOTES
--------------------------------------------------
Grade Level: ${activeLesson.gradeLevel}
Subject: ${activeLesson.subject}
Topic: ${activeLesson.topicTitle}

KEY CONCEPTS:
${activeLesson.keyConcepts.map((c) => `• ${c}`).join("\n")}

LESSON EXPLANATION & THEORY:
${activeLesson.explanation}

WORKED EXAMPLE & SOLUTION:
${activeLesson.exampleProblem}

TEACHER'S PRO TIP:
${activeLesson.teacherTips}

Prepared by Zoya AI Teacher for Hemant.`;
      onOpenEmailNotes(emailSubject, emailBody);
    }
  };

  const filteredLessons = LESSON_DATABASE.filter((lesson) => {
    const matchGrade = selectedGrade === "All Grades" || lesson.gradeLevel === selectedGrade;
    const matchSubject = selectedSubject === "All Subjects" || lesson.subject === selectedSubject;
    return matchGrade && matchSubject;
  });

  const handleSpeechLesson = async () => {
    setIsSpeakingTeacher(true);
    const teacherText = `Classroom Attention! Today's lesson topic is ${activeLesson.topicTitle}. ${activeLesson.explanation} Teacher Tip: ${activeLesson.teacherTips}`;
    const audioBase64 = await getZoyaAudio(teacherText);
    if (audioBase64) {
      await playPCM(audioBase64);
    }
    setIsSpeakingTeacher(false);
  };

  const checkAnswer = () => {
    if (!userAnswer.trim()) return;
    setQuizFeedback(`Zoya Teacher Feedback: Great attempt! You answered "${userAnswer}". Review the teacher tips to verify your reasoning.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl bg-[#090d19] border border-amber-500/30 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(245,158,11,0.2)] flex flex-col h-[90vh] text-white relative"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-950/70 via-[#120d1c] to-violet-950/70 border-b border-amber-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <GraduationCap size={22} className="animate-bounce" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono tracking-wider text-amber-400 uppercase flex items-center gap-2">
                AI CLASSROOM TEACHER & LESSON ENGINE <Sparkles size={16} className="text-yellow-300" />
              </h2>
              <p className="text-xs text-white/60 font-mono">Interactive Topics & Step-by-Step Lessons for All Classes (1 to 12 & University)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 p-4 bg-black/40 border-b border-white/10 text-xs font-mono shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">Class / Grade:</span>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-[#121726] border border-amber-500/30 rounded-xl px-3 py-1.5 text-white outline-none focus:border-amber-400"
            >
              <option value="All Grades">All Grades (1-12 & University)</option>
              <option value="Class 1-5 (Primary)">Class 1-5 (Primary)</option>
              <option value="Class 6-8 (Middle)">Class 6-8 (Middle)</option>
              <option value="Class 9-10 (High School)">Class 9-10 (High School)</option>
              <option value="Class 11-12 (Higher Sec)">Class 11-12 (Higher Sec)</option>
              <option value="University / CS">University / CS</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">Subject:</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-[#121726] border border-amber-500/30 rounded-xl px-3 py-1.5 text-white outline-none focus:border-amber-400"
            >
              <option value="All Subjects">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science / Physics">Science / Physics</option>
              <option value="Computer Science">Computer Science</option>
              <option value="English & Communication">English & Communication</option>
            </select>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-6 text-left grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Lesson Directory */}
          <div className="space-y-3">
            <p className="text-xs font-mono uppercase text-amber-400 font-bold tracking-wider mb-2">
              CURRICULUM LESSONS ({filteredLessons.length})
            </p>
            {filteredLessons.map((lesson) => (
              <div
                key={lesson.id}
                onClick={() => {
                  setActiveLesson(lesson);
                  setQuizFeedback(null);
                  setUserAnswer("");
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  activeLesson.id === lesson.id
                    ? "bg-amber-500/15 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                    : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-1 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                    {lesson.subject}
                  </span>
                  <span className="text-white/50">{lesson.gradeLevel}</span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{lesson.topicTitle}</h4>
              </div>
            ))}
          </div>

          {/* Right 2 Columns: Active Teacher Blackboard */}
          <div className="lg:col-span-2 space-y-5">
            {/* Topic Blackboard Banner */}
            <div className="bg-[#070b14] border border-amber-500/30 rounded-2xl p-5 space-y-4 relative shadow-2xl">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold mr-2">
                    {activeLesson.gradeLevel}
                  </span>
                  <span className="text-xs font-mono text-white/60">{activeLesson.subject}</span>
                  <h3 className="text-lg font-bold text-amber-300 font-mono mt-1">{activeLesson.topicTitle}</h3>
                </div>

                <div className="flex items-center gap-2">
                  {onOpenEmailNotes && (
                    <button
                      onClick={handleMailLessonNotes}
                      className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-mono font-medium text-xs flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
                      title="Send this lesson note via Email"
                    >
                      <Mail size={15} />
                      <span className="hidden sm:inline">Send Notes on Mail</span>
                    </button>
                  )}
                  <button
                    onClick={handleSpeechLesson}
                    disabled={isSpeakingTeacher}
                    className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg cursor-pointer disabled:opacity-50"
                    title="Listen to Zoya Teacher's Voice Explanation"
                  >
                    <Volume2 size={16} className={isSpeakingTeacher ? "animate-pulse" : ""} />
                    <span>{isSpeakingTeacher ? "Teaching..." : "Teacher Audio"}</span>
                  </button>
                </div>
              </div>

              {/* Key Concepts Badges */}
              <div className="flex flex-wrap gap-2">
                {activeLesson.keyConcepts.map((concept, idx) => (
                  <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-amber-200/90 flex items-center gap-1">
                    <Brain size={12} className="text-amber-400" />
                    {concept}
                  </span>
                ))}
              </div>

              {/* Detailed Explanation */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-mono text-amber-400 uppercase font-bold tracking-wider">
                  📖 LESSON EXPLANATION & THEORY
                </h4>
                <p className="text-xs text-white/90 leading-relaxed font-sans">{activeLesson.explanation}</p>
              </div>

              {/* Example Problem Solution */}
              <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 text-xs font-mono space-y-1">
                <span className="text-amber-400 font-bold uppercase text-[10px]">
                  💡 WORKED EXAMPLE & SOLUTION:
                </span>
                <pre className="text-amber-200/90 whitespace-pre-wrap font-mono leading-relaxed">
                  {activeLesson.exampleProblem}
                </pre>
              </div>

              {/* Teacher Tips */}
              <div className="bg-violet-950/20 border border-violet-500/30 rounded-xl p-3 text-xs space-y-1 flex items-start gap-2">
                <Lightbulb size={18} className="text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-mono text-violet-300 font-bold uppercase text-[10px]">TEACHER'S PRO TIP:</span>
                  <p className="text-violet-200/90">{activeLesson.teacherTips}</p>
                </div>
              </div>
            </div>

            {/* Interactive Student Quiz Question */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle size={16} /> CLASSROOM PRACTICE QUIZ
              </h4>
              <p className="text-sm text-white font-semibold">{activeLesson.practiceQuestion}</p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400"
                />
                <button
                  onClick={checkAnswer}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs transition-all cursor-pointer"
                >
                  Submit
                </button>
              </div>

              {quizFeedback && (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                  {quizFeedback}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
