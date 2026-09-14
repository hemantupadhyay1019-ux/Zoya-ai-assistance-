import React, { useState, useMemo } from "react";
import {
  X,
  Brain,
  UserCheck,
  UserPlus,
  Trash2,
  Edit2,
  Check,
  Volume2,
  Search,
  Sparkles,
  Heart,
  Briefcase,
  MessageSquare,
  Lock,
  Tag,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  PersonProfile,
  PersonMemoryItem,
  getAllPersons,
  getActivePerson,
  setActivePersonId,
  addMemoryToPerson,
  removeMemoryFromPerson,
  updateMemoryInPerson,
  updatePersonProfile,
  deletePersonProfile,
  findOrCreatePerson,
  introducePerson,
  updatePersonDetails,
  getPersonDetails,
} from "../services/memoryService";

interface PersonMemoryModalProps {
  onClose: () => void;
  assistantMode?: "zoya" | "jarvis";
  onSpeak?: (text: string) => void;
  onActivePersonChange?: (person: PersonProfile) => void;
  onToggleMode?: (mode: "zoya" | "jarvis") => void;
}

export const PersonMemoryModal: React.FC<PersonMemoryModalProps> = ({
  onClose,
  assistantMode = "zoya",
  onSpeak,
  onActivePersonChange,
  onToggleMode,
}) => {
  const isJarvis = assistantMode === "jarvis";
  const [persons, setPersons] = useState<PersonProfile[]>(() => getAllPersons());
  const [activePersonIdState, setActivePersonIdState] = useState<string>(() => getActivePerson().id);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // New Memory form state
  const [newMemoryText, setNewMemoryText] = useState("");
  const [newMemoryCategory, setNewMemoryCategory] = useState<PersonMemoryItem["category"]>("preference");
  const [newMemoryImportance, setNewMemoryImportance] = useState<PersonMemoryItem["importance"]>("medium");

  // Inline edit memory state
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Edit Person Details (Name, Age, Work) modal state
  const [showEditDetails, setShowEditDetails] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editWork, setEditWork] = useState("");
  const [editRelationship, setEditRelationship] = useState("");
  const [editBio, setEditBio] = useState("");

  // New Person modal state
  const [showAddPersonForm, setShowAddPersonForm] = useState(false);
  const [newPersonName, setNewPersonName] = useState("");
  const [newPersonAge, setNewPersonAge] = useState("");
  const [newPersonWork, setNewPersonWork] = useState("");
  const [newPersonRole, setNewPersonRole] = useState("Friend / Acquaintance");
  const [newPersonBio, setNewPersonBio] = useState("");

  const activePerson = useMemo(() => {
    return persons.find((p) => p.id === activePersonIdState) || persons[0];
  }, [persons, activePersonIdState]);

  const refreshPersons = (newActiveId?: string) => {
    const updated = getAllPersons();
    setPersons(updated);
    if (newActiveId) {
      setActivePersonIdState(newActiveId);
      const chosen = updated.find((p) => p.id === newActiveId);
      if (chosen && onActivePersonChange) {
        onActivePersonChange(chosen);
      }
    }
  };

  const handleSwitchPerson = (id: string) => {
    const switched = setActivePersonId(id);
    setActivePersonIdState(id);
    refreshPersons(id);
    if (onActivePersonChange) {
      onActivePersonChange(switched);
    }
    if (onSpeak) {
      onSpeak(
        isJarvis
          ? `Identity confirmed. Active protocol switched to ${switched.name}. Stored records loaded.`
          : `Arre wah! Switched to ${switched.name}! Kaise ho ${switched.name}? Mujhe aapki sab baatein yaad hain!`
      );
    }
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoryText.trim()) return;

    addMemoryToPerson(activePerson.id, newMemoryText.trim(), newMemoryCategory, newMemoryImportance);
    setNewMemoryText("");
    refreshPersons(activePerson.id);
  };

  const handleDeleteMemory = (memoryId: string) => {
    removeMemoryFromPerson(activePerson.id, memoryId);
    refreshPersons(activePerson.id);
  };

  const handleStartEdit = (mem: PersonMemoryItem) => {
    setEditingMemoryId(mem.id);
    setEditText(mem.content);
  };

  const handleSaveEdit = (memoryId: string) => {
    if (editText.trim()) {
      updateMemoryInPerson(activePerson.id, memoryId, { content: editText.trim() });
      refreshPersons(activePerson.id);
    }
    setEditingMemoryId(null);
  };

  const openEditDetails = () => {
    setEditName(activePerson.name);
    setEditAge(activePerson.age !== undefined ? String(activePerson.age) : "");
    setEditWork(activePerson.work || "");
    setEditRelationship(activePerson.relationship || "");
    setEditBio(activePerson.bio || "");
    setShowEditDetails(true);
  };

  const handleSavePersonDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = updatePersonDetails(activePerson.id, {
      name: editName.trim(),
      age: editAge.trim() ? editAge.trim() : undefined,
      work: editWork.trim(),
      relationship: editRelationship.trim(),
      bio: editBio.trim(),
    });
    setShowEditDetails(false);
    refreshPersons(activePerson.id);
    if (onActivePersonChange) {
      onActivePersonChange(updated);
    }
    if (onSpeak) {
      onSpeak(
        isJarvis
          ? `Dossier updated for ${updated.name}. Age: ${updated.age || 'unspecified'}, Work: ${updated.work || 'unspecified'}.`
          : `Details update ho gaye! Naam ${updated.name}, Age ${updated.age || 'not set'}, aur Work ${updated.work || 'not set'} save kar liya hai!`
      );
    }
  };

  const handleGivePersonDetails = () => {
    const details = getPersonDetails(activePerson.id, assistantMode);
    if (onSpeak) {
      onSpeak(details.speechText);
    }
  };

  const handleCreatePerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim()) return;

    const created = introducePerson({
      name: newPersonName.trim(),
      age: newPersonAge.trim() ? newPersonAge.trim() : undefined,
      work: newPersonWork.trim(),
      relationship: newPersonRole.trim(),
      bio: newPersonBio.trim(),
    });

    setNewPersonName("");
    setNewPersonAge("");
    setNewPersonWork("");
    setNewPersonBio("");
    setShowAddPersonForm(false);
    refreshPersons(created.id);
    if (onActivePersonChange) {
      onActivePersonChange(created);
    }
    if (onSpeak) {
      onSpeak(
        isJarvis
          ? `Subject registered: ${created.name}. Age: ${created.age || 'unrecorded'}. Profession: ${created.work || 'unrecorded'}.`
          : `Welcome ${created.name}! Zoya ne aapka naam ${created.name}, age ${created.age || 'not specified'}, aur work ${created.work || 'not specified'} register kar liya hai!`
      );
    }
  };

  const handleDeleteProfile = (personId: string) => {
    if (persons.length <= 1) return;
    if (window.confirm(`Are you sure you want to delete profile for ${activePerson.name}?`)) {
      deletePersonProfile(personId);
      const remaining = getAllPersons();
      setPersons(remaining);
      setActivePersonIdState(remaining[0].id);
      if (onActivePersonChange) {
        onActivePersonChange(remaining[0]);
      }
    }
  };

  const handleReciteAllMemories = () => {
    if (!onSpeak) return;
    if (!activePerson.memories || activePerson.memories.length === 0) {
      onSpeak(`${activePerson.name}, abhi tak koi memory save nahi hui hai. Kuch bhi bataiye, main yaad kar lungi!`);
      return;
    }
    const memList = activePerson.memories.map((m) => m.content).join(". Also, ");
    const speech = isJarvis
      ? `Accessing neural memory for ${activePerson.name}. Here are the recorded entries: ${memList}.`
      : `Sunye ${activePerson.name}! Mujhe aapke baare me yeh sab yaad hai: ${memList}. Aapki ek bhi baat main nahi bhoolti!`;
    onSpeak(speech);
  };

  const filteredMemories = useMemo(() => {
    let list = activePerson.memories || [];
    if (selectedCategory !== "all") {
      list = list.filter((m) => m.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((m) => m.content.toLowerCase().includes(q) || m.category.includes(q));
    }
    return list;
  }, [activePerson, selectedCategory, searchQuery]);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "preference":
        return <Heart size={13} className="text-pink-400" />;
      case "fact":
      case "personal":
        return <UserCheck size={13} className="text-cyan-400" />;
      case "topic":
        return <MessageSquare size={13} className="text-indigo-400" />;
      case "promise":
        return <Lock size={13} className="text-amber-400" />;
      default:
        return <Tag size={13} className="text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-950 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden font-sans text-slate-100">
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 flex items-center justify-center shadow-inner">
              <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-wide text-white">
                  Neural Person & Memory Vault
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Total Recall
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Remembers whoever speaks, their name, relationship, preferences & past talking points
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddPersonForm(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-medium transition-all cursor-pointer"
            >
              <UserPlus size={14} />
              <span>Add Person</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Person Selector Tabs Bar */}
        <div className="px-5 py-2.5 bg-slate-900/40 border-b border-slate-800/80 flex items-center justify-between gap-3 overflow-x-auto">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Layers size={13} className="text-cyan-400" />
              <span>Who is Talking:</span>
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {persons.map((p) => {
                const isActive = p.id === activePerson.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSwitchPerson(p.id)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20 scale-105"
                        : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60"
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: isActive ? "#020617" : p.avatarColor || "#06B6D4" }}
                    />
                    <span>{p.name}</span>
                    <span className="opacity-70 text-[10px]">({p.memories?.length || 0})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setShowAddPersonForm(true)}
            className="sm:hidden shrink-0 p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
            title="Add New Person"
          >
            <UserPlus size={14} />
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Active Person Profile Banner */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-cyan-500/30 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-lg border border-white/20 shrink-0"
                  style={{ backgroundColor: activePerson.avatarColor || "#06B6D4" }}
                >
                  {activePerson.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-white tracking-wide">{activePerson.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      {activePerson.relationship}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Active Speaker
                    </span>
                  </div>

                  {/* Core Details Tags: Age & Work */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <div className="px-2.5 py-1 rounded-lg bg-pink-500/15 border border-pink-500/30 text-pink-300 text-xs font-mono font-semibold flex items-center gap-1">
                      <span>🎂 Age:</span>
                      <span className="text-white font-bold">{activePerson.age ? `${activePerson.age} yrs` : "Not set"}</span>
                    </div>

                    <div className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold flex items-center gap-1">
                      <Briefcase size={12} />
                      <span>Work:</span>
                      <span className="text-white font-bold">{activePerson.work || "Not set"}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-2">{activePerson.bio}</p>

                  <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> Known Since: {activePerson.createdDate}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={11} /> Talks: {activePerson.totalConversations} sessions
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Brain size={11} className="text-cyan-400" /> Memories: {activePerson.memories?.length || 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap">
                <button
                  onClick={handleGivePersonDetails}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold cursor-pointer transition-all hover:scale-105"
                  title="Zoya or JARVIS speaks this person's complete details aloud"
                >
                  <Volume2 size={14} className="text-cyan-400 animate-pulse" />
                  <span>Give Details Aloud</span>
                </button>

                <button
                  onClick={openEditDetails}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium cursor-pointer transition-all"
                  title="Edit Name, Age, Work, and Role"
                >
                  <Edit2 size={13} />
                  <span>Edit Details</span>
                </button>

                <button
                  onClick={handleReciteAllMemories}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-medium cursor-pointer transition-all hover:scale-105"
                  title="Speak memories aloud in Zoya's voice"
                >
                  <Brain size={13} />
                  <span>Recite Memories</span>
                </button>

                {persons.length > 1 && (
                  <button
                    onClick={() => handleDeleteProfile(activePerson.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors cursor-pointer"
                    title="Delete this person profile"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Edit Person Details Modal Form */}
          {showEditDetails && (
            <form
              onSubmit={handleSavePersonDetails}
              className="p-4 rounded-xl bg-slate-900 border border-cyan-500/50 shadow-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Edit2 size={14} /> Edit Personal Details for {activePerson.name}
                </span>
                <button
                  type="button"
                  onClick={() => setShowEditDetails(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Age (e.g. 23)</label>
                  <input
                    type="text"
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                    placeholder="e.g. 23"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Work / Profession</label>
                  <input
                    type="text"
                    value={editWork}
                    onChange={(e) => setEditWork(e.target.value)}
                    placeholder="e.g. AI System Architect & Software Engineer"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Relationship / Role</label>
                  <input
                    type="text"
                    value={editRelationship}
                    onChange={(e) => setEditRelationship(e.target.value)}
                    placeholder="e.g. Owner & Creator, Best Friend, Tech Lead"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Bio / Role Summary</label>
                  <input
                    type="text"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Short description of this person"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowEditDetails(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* New Person Creation Form (Inline Drawer) */}
          {showAddPersonForm && (
            <form
              onSubmit={handleCreatePerson}
              className="p-4 rounded-xl bg-slate-900 border border-cyan-500/40 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus size={14} /> Register New Person
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddPersonForm(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    placeholder="e.g., Rahul, Sneha, Dad, Mom"
                    required
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Age</label>
                  <input
                    type="text"
                    value={newPersonAge}
                    onChange={(e) => setNewPersonAge(e.target.value)}
                    placeholder="e.g., 23"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Work / Profession</label>
                  <input
                    type="text"
                    value={newPersonWork}
                    onChange={(e) => setNewPersonWork(e.target.value)}
                    placeholder="e.g., Software Engineer, Doctor, Student"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Relationship / Role</label>
                  <input
                    type="text"
                    value={newPersonRole}
                    onChange={(e) => setNewPersonRole(e.target.value)}
                    placeholder="e.g., Brother, Tech Lead, Family, Friend"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">Brief Bio / Notes</label>
                  <input
                    type="text"
                    value={newPersonBio}
                    onChange={(e) => setNewPersonBio(e.target.value)}
                    placeholder="e.g., Software engineer interested in Python and cricket"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddPersonForm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                >
                  Save Person Profile
                </button>
              </div>
            </form>
          )}

          {/* Quick Memory Adder */}
          <form
            onSubmit={handleAddMemory}
            className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-400" />
                <span>Teach Zoya a Memory for {activePerson.name}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                (Also auto-memorizes while you talk!)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newMemoryText}
                onChange={(e) => setNewMemoryText(e.target.value)}
                placeholder={`e.g., "${activePerson.name} likes black coffee without sugar" or "Birthday is 12th Oct"`}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700/80 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={newMemoryCategory}
                  onChange={(e) => setNewMemoryCategory(e.target.value as any)}
                  className="px-2.5 py-2 rounded-lg bg-slate-950 border border-slate-700/80 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
                >
                  <option value="preference">Preference / Like</option>
                  <option value="fact">Fact / Background</option>
                  <option value="topic">Topic / Plan</option>
                  <option value="promise">Promise / Secret</option>
                  <option value="personal">Personal Info</option>
                  <option value="general">General Note</option>
                </select>

                <button
                  type="submit"
                  disabled={!newMemoryText.trim()}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  Save Memory
                </button>
              </div>
            </div>
          </form>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activePerson.name}'s memories...`}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto py-1">
              {[
                { id: "all", label: "All" },
                { id: "preference", label: "Preferences" },
                { id: "fact", label: "Facts" },
                { id: "topic", label: "Topics" },
                { id: "promise", label: "Promises" },
                { id: "personal", label: "Personal" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer shrink-0 ${
                    selectedCategory === tab.id
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                      : "text-slate-400 hover:text-white bg-slate-900/50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Memories List */}
          <div className="space-y-2.5">
            {filteredMemories.length === 0 ? (
              <div className="text-center py-10 px-4 rounded-xl bg-slate-900/30 border border-slate-800/60">
                <Brain className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-300">No memories found</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Teach Zoya something using the input above or simply talk to her—she automatically remembers key facts!
                </p>
              </div>
            ) : (
              filteredMemories.map((mem) => {
                const isEditing = editingMemoryId === mem.id;
                return (
                  <div
                    key={mem.id}
                    className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/30 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-0.5 p-1.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                        {getCategoryIcon(mem.category)}
                      </div>
                      <div className="flex-1">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="flex-1 px-2.5 py-1 rounded bg-slate-950 border border-cyan-500 text-xs text-white focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => handleSaveEdit(mem.id)}
                              className="p-1 rounded bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setEditingMemoryId(null)}
                              className="p-1 rounded text-slate-400 hover:text-white"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-slate-200 leading-relaxed">{mem.content}</p>
                            <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-slate-500">
                              <span className="uppercase tracking-wider text-cyan-400/90">{mem.category}</span>
                              <span>•</span>
                              <span>{mem.timestamp}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {!isEditing && (
                      <div className="flex items-center gap-1.5 self-end sm:self-center opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        {onSpeak && (
                          <button
                            onClick={() => onSpeak(mem.content)}
                            className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                            title="Speak memory"
                          >
                            <Volume2 size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleStartEdit(mem)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Edit memory"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteMemory(mem.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                          title="Delete memory"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Dynamic Identity & Memory Active for <b className="text-white">{activePerson.name}</b>
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                if (onSpeak) {
                  onSpeak(
                    `Namaste ${activePerson.name}! All your ${activePerson.memories?.length || 0} memories are permanently locked in my brain.`
                  );
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              Test Greeting
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-md cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonMemoryModal;
