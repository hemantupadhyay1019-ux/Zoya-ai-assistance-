import React, { useState, useMemo } from "react";
import {
  Brain,
  Users,
  UserPlus,
  Search,
  Pin,
  Trash2,
  CheckCircle2,
  X,
  Volume2,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Clock,
  Heart,
  Briefcase,
  Lightbulb,
  Plus
} from "lucide-react";
import {
  getPeople,
  getActivePerson,
  setActivePersonId,
  introducePerson,
  addMemoryToPerson,
  deleteMemory,
  togglePinMemory,
  PersonProfile,
  MemoryCategory,
  PersonRole,
  MemoryItem,
} from "../services/memoryService";

interface MemoryVaultModalProps {
  onClose: () => void;
  onSpeak?: (text: string) => void;
  onPersonSwitched?: (person: PersonProfile) => void;
}

export default function MemoryVaultModal({
  onClose,
  onSpeak,
  onPersonSwitched,
}: MemoryVaultModalProps) {
  const [people, setPeople] = useState<PersonProfile[]>(() => getPeople());
  const [activePerson, setActivePersonState] = useState<PersonProfile>(() => getActivePerson());
  const [activeTab, setActiveTab] = useState<"people" | "memories" | "introduce">("people");

  // Memory filtering state
  const [selectedPersonFilter, setSelectedPersonFilter] = useState<string>("all");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Introduce person form state
  const [introName, setIntroName] = useState("");
  const [introRole, setIntroRole] = useState<PersonRole>("friend");
  const [introRelationship, setIntroRelationship] = useState("Friend of Hemant");
  const [introNotes, setIntroNotes] = useState("");
  const [introPhone, setIntroPhone] = useState("");
  const [formSuccessMessage, setFormSuccessMessage] = useState("");

  // Add memory inline form state
  const [newMemoryTargetId, setNewMemoryTargetId] = useState<string>(activePerson.id);
  const [newMemoryContent, setNewMemoryContent] = useState("");
  const [newMemoryCategory, setNewMemoryCategory] = useState<MemoryCategory>("fact");
  const [showAddMemoryBox, setShowAddMemoryBox] = useState(false);

  const refreshData = () => {
    const updated = getPeople();
    setPeople(updated);
    const currActive = getActivePerson();
    setActivePersonState(currActive);
  };

  const handleSwitchSpeaker = (person: PersonProfile) => {
    const switched = setActivePersonId(person.id);
    setActivePersonState(switched);
    refreshData();
    if (onPersonSwitched) {
      onPersonSwitched(switched);
    }
    const announce = person.isOwner
      ? `Active speaker switched back to Hemant (Boss & Creator). Welcome back, Hemant!`
      : `Active speaker switched to ${person.name} (${person.relationship}). Zoya remembers ${person.memories.length} details about you, ${person.name}!`;
    if (onSpeak) {
      onSpeak(announce);
    }
  };

  const handleIntroduceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!introName.trim()) return;

    const newPerson = introducePerson({
      name: introName.trim(),
      role: introRole,
      relationship: introRelationship.trim() || `${introRole} of Hemant`,
      introducedBy: "Hemant (Owner)",
      initialNotes: introNotes.trim(),
      phone: introPhone.trim(),
    });

    refreshData();
    setActivePersonState(newPerson);
    if (onPersonSwitched) {
      onPersonSwitched(newPerson);
    }

    setFormSuccessMessage(`Success! ${newPerson.name} has been introduced to Zoya. Active speaker switched to ${newPerson.name}!`);
    setTimeout(() => setFormSuccessMessage(""), 4000);

    const greeting = `Aaye haye, hello ${newPerson.name}! Hemant ne mujhe aapke baare me bataya tha. Welcome! Main aapki har baat hamesha yaad rakhungi.`;
    if (onSpeak) {
      onSpeak(greeting);
    }

    // Reset form
    setIntroName("");
    setIntroRelationship("Friend of Hemant");
    setIntroNotes("");
    setIntroPhone("");
    setActiveTab("people");
  };

  const handleAddMemorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryContent.trim()) return;

    addMemoryToPerson(
      newMemoryTargetId,
      newMemoryContent.trim(),
      newMemoryCategory,
      "manual",
      false
    );

    refreshData();
    setNewMemoryContent("");
    setShowAddMemoryBox(false);

    const targetPerson = people.find((p) => p.id === newMemoryTargetId);
    if (onSpeak && targetPerson) {
      onSpeak(`Got it! I have safely locked this memory into ${targetPerson.name}'s vault.`);
    }
  };

  const handleDeleteMemory = (personId: string, memoryId: string) => {
    deleteMemory(personId, memoryId);
    refreshData();
  };

  const handleTogglePin = (personId: string, memoryId: string) => {
    togglePinMemory(personId, memoryId);
    refreshData();
  };

  // Compile all memories across people
  const allMemories = useMemo(() => {
    const list: MemoryItem[] = [];
    people.forEach((p) => {
      if (p.memories) {
        list.push(...p.memories);
      }
    });
    return list;
  }, [people]);

  const filteredMemories = useMemo(() => {
    return allMemories.filter((m) => {
      if (selectedPersonFilter !== "all" && m.personId !== selectedPersonFilter) {
        return false;
      }
      if (selectedCategoryFilter !== "all" && m.category !== selectedCategoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.content.toLowerCase().includes(q) ||
          m.personName.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allMemories, selectedPersonFilter, selectedCategoryFilter, searchQuery]);

  const getCategoryIcon = (cat: MemoryCategory) => {
    switch (cat) {
      case "preference":
        return <Heart size={13} className="text-pink-400" />;
      case "work":
        return <Briefcase size={13} className="text-blue-400" />;
      case "fact":
        return <Lightbulb size={13} className="text-amber-400" />;
      case "plan":
        return <Clock size={13} className="text-emerald-400" />;
      case "conversation":
        return <MessageSquare size={13} className="text-cyan-400" />;
      default:
        return <Sparkles size={13} className="text-purple-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-gray-900/95 via-gray-950 to-black border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/40 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-500/20 bg-cyan-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                  Zoya Neural Memory & People Vault
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Long-Term Recall
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Remembers every person Zoya talks with, their details, and past discussions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Active Speaker Banner */}
        <div className="px-5 py-2.5 bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/40 border-b border-cyan-500/15 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-gray-400">Currently Talking With:</span>
            <span className="font-semibold text-white bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15">
              {activePerson.name} {activePerson.isOwner ? "(Owner & Creator)" : `(${activePerson.relationship})`}
            </span>
            <span className="text-[11px] text-cyan-300/80 hidden sm:inline">
              • {activePerson.memories.length} memories loaded
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onSpeak) {
                  onSpeak(`I am currently talking with ${activePerson.name}. ${activePerson.isOwner ? "He is my creator and boss!" : `He/She was introduced to me by ${activePerson.introducedBy} as ${activePerson.relationship}.`} I have ${activePerson.memories.length} memories saved for this conversation.`);
                }
              }}
              className="px-2.5 py-1 rounded-md bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-1.5 transition-colors"
              title="Voice identify active speaker"
            >
              <Volume2 size={13} />
              <span>Identify Speaker</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-5 pt-3 border-b border-gray-800 gap-2 bg-black/40">
          <button
            onClick={() => setActiveTab("people")}
            className={`pb-3 px-3 text-xs sm:text-sm font-medium transition-all relative flex items-center gap-2 ${
              activeTab === "people"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Users size={15} />
            <span>People & Circle ({people.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("memories")}
            className={`pb-3 px-3 text-xs sm:text-sm font-medium transition-all relative flex items-center gap-2 ${
              activeTab === "memories"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <Brain size={15} />
            <span>All Memories ({allMemories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("introduce")}
            className={`pb-3 px-3 text-xs sm:text-sm font-medium transition-all relative flex items-center gap-2 ${
              activeTab === "introduce"
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            <UserPlus size={15} />
            <span>+ Introduce New Person</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {formSuccessMessage && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{formSuccessMessage}</span>
            </div>
          )}

          {/* TAB 1: PEOPLE & CIRCLE */}
          {activeTab === "people" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Recognized People in Circle</h3>
                  <p className="text-xs text-gray-400">
                    Click "Switch to This Person" whenever someone else speaks to Zoya.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("introduce")}
                  className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-md shadow-cyan-900/30 transition-all cursor-pointer"
                >
                  <UserPlus size={14} />
                  <span>Introduce Someone</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {people.map((person) => {
                  const isActive = person.id === activePerson.id;
                  return (
                    <div
                      key={person.id}
                      className={`p-4 rounded-xl border transition-all duration-200 ${
                        isActive
                          ? "bg-cyan-950/30 border-cyan-500/50 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500/30"
                          : "bg-gray-900/50 border-gray-800 hover:border-gray-700 hover:bg-gray-900/80"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${person.avatarColor} flex items-center justify-center font-bold text-white text-lg shadow-md shrink-0`}
                          >
                            {person.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-base font-bold text-white">{person.name}</h4>
                              {person.isOwner && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  Owner & Creator
                                </span>
                              )}
                              {isActive && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                  Active
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-cyan-300/90 font-medium">
                              {person.relationship}
                            </p>
                            {!person.isOwner && (
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                Introduced by: <span className="text-gray-300">{person.introducedBy}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {person.bio && (
                        <p className="text-xs text-gray-300 mt-2.5 line-clamp-2 bg-black/30 p-2 rounded-lg border border-white/5">
                          {person.bio}
                        </p>
                      )}

                      <div className="mt-3 pt-2.5 border-t border-gray-800 flex items-center justify-between text-[11px] text-gray-400">
                        <div className="flex items-center gap-3">
                          <span>🧠 {person.memories.length} Memories</span>
                          <span>💬 {person.talkCount || 1} Talks</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isActive ? (
                            <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 size={12} />
                              <span>Speaking Now</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSwitchSpeaker(person)}
                              className="px-2.5 py-1 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
                            >
                              Switch to {person.name}
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedPersonFilter(person.id);
                              setActiveTab("memories");
                            }}
                            className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-gray-300 text-xs transition-colors"
                            title="View memories for this person"
                          >
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MEMORY VAULT */}
          {activeTab === "memories" && (
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="p-3.5 bg-gray-900/60 border border-gray-800 rounded-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search facts, preferences, conversations..."
                        className="w-full pl-9 pr-3 py-1.5 bg-black/50 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedPersonFilter}
                      onChange={(e) => setSelectedPersonFilter(e.target.value)}
                      className="px-2.5 py-1.5 bg-black/50 border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="all">All People ({people.length})</option>
                      {people.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.relationship})
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedCategoryFilter}
                      onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                      className="px-2.5 py-1.5 bg-black/50 border border-gray-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="all">All Categories</option>
                      <option value="fact">Facts</option>
                      <option value="preference">Preferences</option>
                      <option value="conversation">Conversations</option>
                      <option value="plan">Plans</option>
                      <option value="work">Work & Tech</option>
                      <option value="personal">Personal</option>
                    </select>

                    <button
                      onClick={() => setShowAddMemoryBox(!showAddMemoryBox)}
                      className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Teach Memory</span>
                    </button>
                  </div>
                </div>

                {/* Inline Add Memory Box */}
                {showAddMemoryBox && (
                  <form
                    onSubmit={handleAddMemorySubmit}
                    className="p-3 bg-black/60 border border-cyan-500/30 rounded-lg space-y-2 animate-fade-in"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                        <Sparkles size={13} />
                        Teach Zoya a new memory fact
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddMemoryBox(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-400">Target Person</label>
                        <select
                          value={newMemoryTargetId}
                          onChange={(e) => setNewMemoryTargetId(e.target.value)}
                          className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-white"
                        >
                          {people.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.relationship})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-gray-400">Category</label>
                        <select
                          value={newMemoryCategory}
                          onChange={(e) => setNewMemoryCategory(e.target.value as MemoryCategory)}
                          className="w-full px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-white"
                        >
                          <option value="fact">Fact / Knowledge</option>
                          <option value="preference">Preference / Likes</option>
                          <option value="conversation">Conversation Note</option>
                          <option value="plan">Future Plan</option>
                          <option value="work">Work / Tech</option>
                          <option value="personal">Personal Detail</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400">Memory Details</label>
                      <input
                        type="text"
                        value={newMemoryContent}
                        onChange={(e) => setNewMemoryContent(e.target.value)}
                        placeholder="e.g. Loves drinking hot coffee at 11 PM, works on React..."
                        className="w-full px-3 py-1.5 bg-gray-900 border border-gray-700 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddMemoryBox(false)}
                        className="px-2.5 py-1 text-xs text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium cursor-pointer"
                      >
                        Save to Memory Vault
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Memory List */}
              {filteredMemories.length === 0 ? (
                <div className="p-8 text-center bg-gray-900/30 border border-gray-800 rounded-xl">
                  <Brain size={32} className="mx-auto text-gray-600 mb-2" />
                  <p className="text-sm font-medium text-gray-400">No memories matched your filter</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Talk to Zoya or click "Teach Memory" to add permanent memories!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredMemories.map((mem) => {
                    const person = people.find((p) => p.id === mem.personId);
                    return (
                      <div
                        key={mem.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          mem.pinned
                            ? "bg-gradient-to-r from-amber-950/20 via-gray-900/80 to-gray-900/60 border-amber-500/40"
                            : "bg-gray-900/40 border-gray-800/80 hover:border-gray-700"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded-md bg-white/5 border border-white/10">
                              {getCategoryIcon(mem.category)}
                            </span>
                            <span className="text-xs font-bold text-white">
                              {mem.personName}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                              {mem.category}
                            </span>
                            {mem.pinned && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
                                <Pin size={10} /> Core Memory
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleTogglePin(mem.personId, mem.id)}
                              className={`p-1.5 rounded-md hover:bg-white/10 transition-colors ${
                                mem.pinned ? "text-amber-400" : "text-gray-500 hover:text-gray-300"
                              }`}
                              title={mem.pinned ? "Unpin memory" : "Pin core memory"}
                            >
                              <Pin size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteMemory(mem.personId, mem.id)}
                              className="p-1.5 rounded-md text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Delete memory"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-gray-200 mt-2 leading-relaxed">
                          {mem.content}
                        </p>

                        <div className="mt-2.5 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                          <span>Recorded: {mem.timestamp}</span>
                          <span>
                            Source:{" "}
                            {mem.source === "auto_talk"
                              ? "🎙️ Auto-learned from conversation"
                              : mem.source === "introduced"
                              ? "🤝 Introduced by Hemant"
                              : "✍️ Manually taught"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INTRODUCE NEW PERSON */}
          {activeTab === "introduce" && (
            <div className="max-w-xl mx-auto p-5 bg-gray-900/60 border border-gray-800 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Introduce a Person to Zoya</h3>
                  <p className="text-xs text-gray-400">
                    Tell Zoya who they are. She will acknowledge who introduced them and remember all their future discussions.
                  </p>
                </div>
              </div>

              <form onSubmit={handleIntroduceSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Person's Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={introName}
                    onChange={(e) => setIntroName(e.target.value)}
                    placeholder="e.g. Rahul Sharma, Priya Singh, Mom, Vikram..."
                    className="w-full px-3 py-2 bg-black/60 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Circle Category
                    </label>
                    <select
                      value={introRole}
                      onChange={(e) => setIntroRole(e.target.value as PersonRole)}
                      className="w-full px-3 py-2 bg-black/60 border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="friend">Friend</option>
                      <option value="family">Family Member</option>
                      <option value="colleague">Colleague / Coworker</option>
                      <option value="guest">Guest / Visitor</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Relationship to Hemant
                    </label>
                    <input
                      type="text"
                      value={introRelationship}
                      onChange={(e) => setIntroRelationship(e.target.value)}
                      placeholder="e.g. Best friend, College roommate, Sister..."
                      className="w-full px-3 py-2 bg-black/60 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Phone / WhatsApp Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={introPhone}
                    onChange={(e) => setIntroPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2 bg-black/60 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Initial Memory Notes / Facts to Remember
                  </label>
                  <textarea
                    rows={3}
                    value={introNotes}
                    onChange={(e) => setIntroNotes(e.target.value)}
                    placeholder="e.g. Loves chai, studying engineering, prefers Hindi, working with Hemant on a mobile app..."
                    className="w-full px-3 py-2 bg-black/60 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="p-3 bg-cyan-950/30 border border-cyan-500/20 rounded-xl text-[11px] text-cyan-300/80 flex items-center gap-2">
                  <ShieldCheck size={16} className="shrink-0 text-cyan-400" />
                  <span>
                    Introduced by <strong>Hemant (Owner)</strong>. Zoya will address {introName || "them"} by name and remember all talks across sessions.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-950/40 transition-all cursor-pointer"
                >
                  Introduce & Save to Neural Vault
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-gray-800 bg-black/60 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <Brain size={14} className="text-cyan-400" />
            <span>Multi-Person Persistent Brain (Saved in Local Storage)</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
