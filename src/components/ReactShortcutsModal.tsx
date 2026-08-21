import React, { useState } from "react";
import { Code2, Copy, Check, Zap, Sparkles, Terminal, Keyboard, Cpu, BookMarked, X } from "lucide-react";
import { motion } from "motion/react";
import { ReactShortcut } from "../types/assistant";

interface ReactShortcutsModalProps {
  onClose: () => void;
}

const REACT_SHORTCUTS_DATA: ReactShortcut[] = [
  {
    id: "rs1",
    title: "React Functional Component Snippet",
    category: "VS Code Shortcuts",
    shortcutOrSyntax: "rafce",
    description: "Generates an ES7 React Arrow Function Component with export.",
    codeSnippet: `import React from 'react';\n\nconst MyComponent = () => {\n  return (\n    <div>\n      <h1>Hello React</h1>\n    </div>\n  );\n};\n\nexport default MyComponent;`
  },
  {
    id: "rs2",
    title: "useState Hook Initializer Pattern",
    category: "Hooks",
    shortcutOrSyntax: "const [state, setState] = useState(initialValue)",
    description: "Declares a state variable and setter function with standard type inference.",
    codeSnippet: `const [count, setCount] = useState<number>(0);\n\n// Functional state update (prevents race conditions):\nsetCount((prev) => prev + 1);`
  },
  {
    id: "rs3",
    title: "useEffect Guard & Cleanup Pattern",
    category: "Hooks",
    shortcutOrSyntax: "useEffect(() => { ... return () => cleanup() }, [deps])",
    description: "Executes side effects and cleans up subscriptions or timers on unmount.",
    codeSnippet: `useEffect(() => {\n  const timer = setInterval(() => {\n    console.log('Tick');\n  }, 1000);\n\n  // Mandatory cleanup function:\n  return () => clearInterval(timer);\n}, []);`
  },
  {
    id: "rs4",
    title: "useCallback & useMemo Optimization",
    category: "Performance & State",
    shortcutOrSyntax: "useCallback(fn, deps) / useMemo(() => val, deps)",
    description: "Memoizes callbacks and expensive computations to avoid unnecessary re-renders.",
    codeSnippet: `const memoizedCallback = useCallback(() => {\n  doSomething(a, b);\n}, [a, b]);\n\nconst memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);`
  },
  {
    id: "rs5",
    title: "VS Code Multi-Cursor & Duplicate Line",
    category: "VS Code Shortcuts",
    shortcutOrSyntax: "Alt + Shift + Down (Duplicate) | Ctrl + D (Select Next)",
    description: "Essential keyboard shortcuts for rapid React JSX editing in VS Code.",
    codeSnippet: `// Alt + Shift + Down: Duplicate line down\n// Ctrl + D (Cmd + D on Mac): Select next occurrence\n// Alt + Click: Multi-cursor typing`
  },
  {
    id: "rs6",
    title: "Custom Hook Template",
    category: "Hooks",
    shortcutOrSyntax: "useCustomHook()",
    description: "Encapsulates reusable component logic into custom React hook.",
    codeSnippet: `export function useLocalStorage<T>(key: string, initialValue: T) {\n  const [storedValue, setStoredValue] = useState<T>(() => {\n    const item = window.localStorage.getItem(key);\n    return item ? JSON.parse(item) : initialValue;\n  });\n\n  const setValue = (value: T) => {\n    setStoredValue(value);\n    window.localStorage.setItem(key, JSON.stringify(value));\n  };\n\n  return [storedValue, setValue] as const;\n}`
  }
];

export default function ReactShortcutsModal({ onClose }: ReactShortcutsModalProps) {
  const [activeCategory, setActiveCategory] = useState<string>("All Categories");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ["All Categories", "Hooks", "VS Code Shortcuts", "Performance & State"];

  const filteredShortcuts = REACT_SHORTCUTS_DATA.filter((s) => {
    return activeCategory === "All Categories" || s.category === activeCategory;
  });

  const copyCode = (id: string, text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl bg-[#0a0f1d] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.2)] flex flex-col h-[85vh] text-white relative"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-cyan-950/70 via-[#0d1428] to-blue-950/70 border-b border-cyan-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Code2 size={22} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono tracking-wider text-cyan-400 uppercase flex items-center gap-2">
                REACT & FRONTEND SHORTCUTS CHEATSHEET <Zap size={16} className="text-yellow-400 fill-yellow-400" />
              </h2>
              <p className="text-xs text-white/60 font-mono">Hooks, VS Code Snippets, Performance & Developer Productivity Shortcuts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 p-4 bg-black/40 border-b border-white/10 overflow-x-auto shrink-0 font-mono text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  : "bg-white/5 text-white/60 border-white/10 hover:border-white/20 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* List of Shortcuts */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-left">
          {filteredShortcuts.map((item) => (
            <div
              key={item.id}
              className="bg-[#070c18] border border-cyan-500/20 hover:border-cyan-500/40 rounded-2xl p-4 space-y-3 transition-all shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold mr-2">
                    {item.category}
                  </span>
                  <h3 className="text-sm font-bold text-white inline-block">{item.title}</h3>
                </div>
                <div className="bg-black/50 border border-white/10 px-3 py-1 rounded-lg text-xs font-mono text-cyan-400 font-semibold">
                  {item.shortcutOrSyntax}
                </div>
              </div>

              <p className="text-xs text-white/70">{item.description}</p>

              {item.codeSnippet && (
                <div className="relative bg-black/70 border border-white/10 rounded-xl p-3 font-mono text-xs text-cyan-200">
                  <button
                    onClick={() => copyCode(item.id, item.codeSnippet)}
                    className="absolute top-2 right-2 px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                  <pre className="whitespace-pre-wrap overflow-x-auto pr-20">{item.codeSnippet}</pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
