import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  UserPlus,
  Ban,
  ChevronLeft,
  Loader2,
  ChevronDown,
  Check,
  User,
  Shield,
  Award,
} from "lucide-react";
import { getUsers, createUser, updateUser, deleteUser } from "../../api/users.js";

const roleToFilter = (role) => {
  if (role === "ADMIN") return "admin";
  if (role === "JURY") return "jury";
  return "user";
};

const ROLES = [
  { value: "REALISATEUR", label: "Réalisateur", icon: User, color: "text-[#51A2FF]" },
  { value: "JURY", label: "Juré", icon: Award, color: "text-purple-400" },
  { value: "ADMIN", label: "Admin", icon: Shield, color: "text-pink-400" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ email: "", username: "", password: "", role: "REALISATEUR" });
  const [submitting, setSubmitting] = useState(false);
  const [addError, setAddError] = useState("");
  const [rolePopupUser, setRolePopupUser] = useState(null);
  const [selectedRoleInPopup, setSelectedRoleInPopup] = useState(null);
  const [updatingRoleId, setUpdatingRoleId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getUsers();
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger les utilisateurs");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const name = user.username || user.email || "";
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = filterRole === "all" || roleToFilter(user.role) === filterRole;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    const r = ROLES.find((x) => x.value === role) || ROLES[0];
    const colors = {
      REALISATEUR: "bg-[#51A2FF]/20 border-[#51A2FF]/30 text-[#51A2FF]",
      JURY: "bg-purple-500/20 border-purple-500/30 text-purple-400",
      ADMIN: "bg-pink-500/20 border-pink-500/30 text-pink-400",
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${colors[role] || colors.REALISATEUR}`}
      >
        <r.icon className="w-3.5 h-3.5" />
        {r.label}
      </span>
    );
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddError("");
    setSubmitting(true);
    try {
      await createUser(addForm);
      setShowAddModal(false);
      setAddForm({ email: "", username: "", password: "", role: "REALISATEUR" });
      fetchUsers();
    } catch (err) {
      setAddError(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Impossible de supprimer");
    }
  };

  const openRolePopup = (e, user) => {
    e.stopPropagation();
    setRolePopupUser(user);
    setSelectedRoleInPopup(user.role);
  };

  const closeRolePopup = () => {
    setRolePopupUser(null);
    setSelectedRoleInPopup(null);
  };

  const handleConfirmRoleInPopup = async () => {
    if (!rolePopupUser || !selectedRoleInPopup || rolePopupUser.role === selectedRoleInPopup) {
      closeRolePopup();
      return;
    }
    setUpdatingRoleId(rolePopupUser.id);
    try {
      await updateUser(rolePopupUser.id, { role: selectedRoleInPopup });
      closeRolePopup();
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Impossible de modifier le rôle");
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const filters = [
    { id: "all", label: "Tous" },
    { id: "user", label: "Réalisateurs" },
    { id: "jury", label: "Jurés" },
    { id: "admin", label: "Admins" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-['Arimo',sans-serif] overflow-y-auto pb-32">
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#51A2FF]/5 rounded-full blur-[150px]" />
      </div>

      <div className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-3xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          <div className="flex justify-start mb-4 md:mb-6">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Retour au Dashboard</span>
            </Link>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 leading-tight mb-1 md:mb-2">
            Gestion des Utilisateurs
          </h1>
          <p className="text-white/40 text-xs md:text-sm font-medium uppercase tracking-widest mb-6 md:mb-8">
            Contrôle du protocole marsAI 2026
          </p>

          {/* Barre recherche + filtres + bouton — responsive */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-3">
              <div className="sm:col-span-12 md:col-span-6 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par nom ou email..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-3 md:py-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#51A2FF]/50 transition-all"
                />
              </div>
              <div className="sm:col-span-12 md:col-span-4 flex flex-wrap gap-2 sm:gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setFilterRole(filter.id)}
                    className={`min-w-0 flex-1 sm:flex-none px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl md:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all border ${
                      filterRole === filter.id
                        ? "bg-white text-black border-white"
                        : "bg-white/[0.02] text-white/40 border-white/10 hover:border-white/20"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <div className="sm:col-span-12 md:col-span-2">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-full bg-gradient-to-r from-[#51A2FF] to-purple-600 text-white font-black uppercase tracking-widest py-3 md:py-3.5 px-4 rounded-xl md:rounded-2xl hover:shadow-xl hover:shadow-[#51A2FF]/20 transition-all flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-5 h-5 shrink-0" />
                  <span className="truncate">Ajouter</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-[#51A2FF] animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-red-400 text-sm">
            {error}
          </div>
        ) : (
          <>
            {/* Desktop: tableau */}
            <div className="hidden lg:block bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 md:p-6 border-b border-white/5 text-[10px] md:text-xs font-black uppercase tracking-widest text-white/40">
                <div className="col-span-4">Utilisateur</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Rôle</div>
                <div className="col-span-2">Activité</div>
                <div className="col-span-1 text-right">Actions</div>
              </div>
              <div className="divide-y divide-white/5">
                {filteredUsers.length === 0 ? (
                  <div className="p-12 text-center text-white/40 text-sm">Aucun utilisateur trouvé.</div>
                ) : (
                  filteredUsers.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.03, 0.3) }}
                      className="grid grid-cols-12 gap-4 p-4 md:p-6 hover:bg-white/[0.02] transition-all items-center"
                    >
                      <div className="col-span-4 flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#51A2FF] to-purple-600 flex items-center justify-center font-black text-sm shrink-0">
                          {(user.username || user.email || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-black text-sm truncate">{user.username || user.email}</h3>
                          <p className="text-xs text-white/40">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="col-span-3 text-sm text-white/60 truncate" title={user.email}>
                        {user.email}
                      </div>
                      <div className="col-span-2 flex items-center">
                        <button
                          type="button"
                          onClick={(e) => openRolePopup(e, user)}
                          disabled={updatingRoleId === user.id}
                          className="inline-flex items-center gap-1.5 rounded-xl border bg-white/5 hover:bg-white/10 border-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                          {updatingRoleId === user.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              {getRoleBadge(user.role)}
                              <ChevronDown className="w-3.5 h-3.5 text-white/40" />
                            </>
                          )}
                        </button>
                      </div>
                      <div className="col-span-2 text-sm">
                        {user.role === "JURY" && (
                          <span className="text-purple-400 font-bold">
                            {user.votesCompleted ?? 0} vote{(user.votesCompleted ?? 0) !== 1 ? "s" : ""}
                          </span>
                        )}
                        {user.role === "REALISATEUR" && (
                          <span className="text-[#51A2FF] font-bold">
                            {user.filmsSubmitted ?? 0} film{(user.filmsSubmitted ?? 0) !== 1 ? "s" : ""}
                          </span>
                        )}
                        {user.role === "ADMIN" && <span className="text-white/40">—</span>}
                      </div>
                      <div className="col-span-1 flex items-center justify-end">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="w-8 h-8 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl flex items-center justify-center transition-all"
                          title="Supprimer"
                        >
                          <Ban className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Mobile: cartes */}
            <div className="lg:hidden space-y-4">
              {filteredUsers.length === 0 ? (
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 text-center text-white/40 text-sm">
                  Aucun utilisateur trouvé.
                </div>
              ) : (
                filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.03, 0.3) }}
                    className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 hover:bg-white/[0.04] transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#51A2FF] to-purple-600 flex items-center justify-center font-black text-base shrink-0">
                          {(user.username || user.email || "?").charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-black text-sm truncate">{user.username || user.email}</h3>
                          <p className="text-xs text-white/50 truncate" title={user.email}>
                            {user.email}
                          </p>
                          <p className="text-[10px] text-white/40 mt-0.5">
                            Inscrit le {user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "—"}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => openRolePopup(e, user)}
                          disabled={updatingRoleId === user.id}
                          className="inline-flex items-center gap-1.5 rounded-xl border bg-white/5 hover:bg-white/10 border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                        >
                          {updatingRoleId === user.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              {getRoleBadge(user.role)}
                              <ChevronDown className="w-3.5 h-3.5 text-white/40" />
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="w-10 h-10 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl flex items-center justify-center transition-all shrink-0"
                          title="Supprimer"
                        >
                          <Ban className="w-5 h-5 text-red-400" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/50 pt-2 border-t border-white/5">
                      {user.role === "JURY" && (
                        <span className="text-purple-400 font-bold">
                          {user.votesCompleted ?? 0} vote{(user.votesCompleted ?? 0) !== 1 ? "s" : ""}
                        </span>
                      )}
                      {user.role === "REALISATEUR" && (
                        <span className="text-[#51A2FF] font-bold">
                          {user.filmsSubmitted ?? 0} film{(user.filmsSubmitted ?? 0) !== 1 ? "s" : ""}
                        </span>
                      )}
                      {user.role === "ADMIN" && <span>—</span>}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal ajout utilisateur */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowAddModal(false);
              setAddError("");
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a0a] border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-lg md:text-xl font-black uppercase tracking-tight mb-6">
                Ajouter un utilisateur
              </h2>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-white/50 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#51A2FF]/50 text-sm"
                    placeholder="email@exemple.fr"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-white/50 mb-1.5">
                    Nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    required
                    value={addForm.username}
                    onChange={(e) => setAddForm((p) => ({ ...p, username: e.target.value }))}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#51A2FF]/50 text-sm"
                    placeholder="Pseudo"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-white/50 mb-1.5">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={addForm.password}
                    onChange={(e) => setAddForm((p) => ({ ...p, password: e.target.value }))}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-[#51A2FF]/50 text-sm"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-white/50 mb-1.5">Rôle</label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm((p) => ({ ...p, role: e.target.value }))}
                    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#51A2FF]/50 text-sm"
                  >
                    <option value="REALISATEUR">Réalisateur</option>
                    <option value="JURY">Juré</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                {addError && <p className="text-sm text-red-400">{addError}</p>}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setAddError("");
                    }}
                    className="flex-1 py-3 rounded-xl border border-white/20 text-white/80 font-bold uppercase text-xs hover:bg-white/5"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#51A2FF] to-purple-600 text-white font-bold uppercase text-xs disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Créer"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup changement de rôle */}
      <AnimatePresence>
        {rolePopupUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={closeRolePopup}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 w-full max-w-sm"
            >
              <h3 className="text-sm font-black uppercase tracking-widest text-white/60 mb-1">
                Changer le rôle
              </h3>
              <p className="text-white font-bold mb-5 truncate">
                {rolePopupUser.username || rolePopupUser.email}
              </p>
              <div className="space-y-2 mb-6">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setSelectedRoleInPopup(r.value)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm font-bold uppercase tracking-wider transition-all ${r.color} ${
                      selectedRoleInPopup === r.value
                        ? "bg-white/10 border-white/30"
                        : "bg-white/[0.03] border-white/10 hover:bg-white/5"
                    }`}
                  >
                    <r.icon className="w-5 h-5 shrink-0" />
                    {r.label}
                    {selectedRoleInPopup === r.value && <Check className="w-5 h-5 ml-auto shrink-0" />}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeRolePopup}
                  className="flex-1 py-2.5 rounded-xl border border-white/20 text-white/80 font-bold uppercase text-[10px] hover:bg-white/5"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRoleInPopup}
                  disabled={rolePopupUser.role === selectedRoleInPopup}
                  className="flex-1 py-2.5 rounded-xl bg-[#51A2FF] text-black font-bold uppercase text-[10px] hover:bg-[#51A2FF]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
