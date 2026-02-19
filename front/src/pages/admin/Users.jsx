import { useEffect, useState } from "react";
import { deleteUser, getUsers, updateUser } from "../../api/users.js";
import { useMutation } from "@tanstack/react-query";
import { createUser } from "../../api/users.js";
import { useForm } from "react-hook-form";
import { Trash2, Pencil, X } from "lucide-react";

function Users() {
  const [users, setUsers] = useState([]);
  const [modeEdit, setModeEdit] = useState(false);

  function refreshUsers() {
    getUsers()
      .then((data) => {
        setUsers(data.data);
      })
      .catch(() => {
        setUsers([]);
      });
  }

  useEffect(() => {
    refreshUsers();
  }, []);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const registerMutation = useMutation({
    mutationFn: async (newUser) => {
      return await createUser(newUser);
    },
    onSuccess: () => {
      handleReset();
      refreshUsers();
    },
    onError: (error) => {
      alert(error.response?.data?.error || "Erreur lors de la création");
    },
  });

  function onSubmit(data) {
    return registerMutation.mutate(data);
  }

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await deleteUser(id);
    },
    onSuccess: () => {
      refreshUsers();
    },
  });

  function handleDelete(id) {
    if (confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) {
      deleteMutation.mutate(id);
    }
  }

  const updateMutation = useMutation({
    mutationFn: async (updatedUser) => {
      return await updateUser(updatedUser.id, updatedUser);
    },
    onSuccess: () => {
      handleReset();
      refreshUsers();
    },
  });

  function handleEdit(user) {
    setValue("id", user.id);
    setValue("username", user.username);
    setValue("email", user.email || "");
    setValue("password", "");
    setModeEdit(true);
  }

  function handleReset() {
    setValue("id", undefined);
    setValue("username", "");
    setValue("email", "");
    setValue("password", "");
    setModeEdit(false);
  }

  function onUpdate(updatedUser) {
    updateMutation.mutate(updatedUser);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Utilisateurs</h1>

      {/* TABLE */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] overflow-hidden mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.08]">
              <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-white px-4 py-3">Username</th>
              <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-white px-4 py-3">Email</th>
              <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-white px-4 py-3">Rôle</th>
              <th className="text-right text-[10px] font-semibold uppercase tracking-wider text-white px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition">
                  <td className="px-4 py-3 text-sm font-medium">{user.username}</td>
                  <td className="px-4 py-3 text-sm text-white">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full ${
                      user.role === "ADMIN"
                        ? "bg-[#51A2FF]/20 text-[#51A2FF]"
                        : user.role === "JURY"
                          ? "bg-[#9810FA]/20 text-[#AD46FF]"
                          : "bg-white/10 text-white/60"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1.5 rounded-lg hover:bg-white/[0.08] text-white/40 hover:text-white transition"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-1.5 rounded-lg hover:bg-red-400/10 text-white/40 hover:text-red-400 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-white/40">Aucun utilisateur trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FORM */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <h2 className="text-lg font-semibold mb-4">
          {modeEdit ? "Modifier l'utilisateur" : "Créer un utilisateur"}
        </h2>
        <form
          onSubmit={modeEdit ? handleSubmit(onUpdate) : handleSubmit(onSubmit)}
          className="flex flex-wrap items-end gap-4"
        >
          <input type="hidden" {...register("id")} />

          <div className="flex-1 min-w-[180px] space-y-1">
            <label htmlFor="username" className="text-[10px] font-semibold uppercase tracking-wider text-white">
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Nom d'utilisateur"
              {...register("username")}
              className="w-full rounded-xl border border-white/[0.08] bg-white px-4 py-2.5 text-sm text-black placeholder:text-black/40 outline-none focus:border-[#51A2FF]/50 transition"
            />
            {errors.username && <p className="text-xs text-red-400">{errors.username.message}</p>}
          </div>

          <div className="flex-1 min-w-[180px] space-y-1">
            <label htmlFor="email" className="text-[10px] font-semibold uppercase tracking-wider text-white">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="email@exemple.com"
              {...register("email")}
              className="w-full rounded-xl border border-white/[0.08] bg-white px-4 py-2.5 text-sm text-black placeholder:text-black/40 outline-none focus:border-[#51A2FF]/50 transition"
            />
            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div className="flex-1 min-w-[180px] space-y-1">
            <label htmlFor="password" className="text-[10px] font-semibold uppercase tracking-wider text-white">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              placeholder="Mot de passe"
              {...register("password")}
              className="w-full rounded-xl border border-white/[0.08] bg-white px-4 py-2.5 text-sm text-black placeholder:text-black/40 outline-none focus:border-[#51A2FF]/50 transition"
            />
            {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <div className="flex gap-2">
            {modeEdit && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] text-sm text-white/60 hover:text-white hover:bg-white/[0.04] transition"
              >
                <X size={14} />
                Annuler
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#51A2FF] to-[#9810FA] text-sm font-semibold text-white hover:opacity-90 transition"
            >
              {modeEdit ? "Mettre à jour" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Users;
