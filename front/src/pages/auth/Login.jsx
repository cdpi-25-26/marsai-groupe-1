import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { login } from "../../api/auth.js";
import { LogIn, Mail, Lock, Eye, EyeOff, Send } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().min(1, "Identifiant requis"),
  password: z.string().min(1, "Clé requise"),
});

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [maintainSession, setMaintainSession] = useState(false);

  if (localStorage.getItem("username")) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <h1 className="text-xl font-semibold">
            Vous êtes déjà connecté en tant que{" "}
            <span className="text-[#51A2FF]">
              {localStorage.getItem("username")}
            </span>
          </h1>
          <Link
            to="/"
            className="mt-4 inline-flex text-sm text-white/70 hover:text-white underline underline-offset-4"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (data) => {
      return await login(data);
    },
    onSuccess: (response) => {
      localStorage.setItem("username", response.data?.user?.username);
      localStorage.setItem("role", response.data?.user?.role);
      localStorage.setItem("token", response.data?.token);

      switch (response.data?.user?.role) {
        case "ADMIN":
          navigate("/admin");
          break;
        default:
          navigate("/");
          break;
      }
    },
    onError: (error) => {
      alert(error.response?.data?.error || "Erreur de connexion au serveur");
    },
  });

  function onSubmit(data) {
    return loginMutation.mutate(data);
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-48 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#51A2FF]/20 blur-[120px]" />
        <div className="absolute -bottom-56 right-[-140px] h-[560px] w-[560px] rounded-full bg-[#9810FA]/10 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04),rgba(0,0,0,0)_55%)]" />
      </div>

      {/* HEADER */}
      <header className="relative z-10 px-6 pt-6">
        <div className="mx-auto max-w-[1400px] flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span
              style={{ fontFamily: "Arimo, sans-serif", fontWeight: 700, fontSize: "20px", lineHeight: "28px", letterSpacing: "-0.5px" }}
              className="uppercase text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
            >
              MARS
            </span>
            <span
              style={{ fontFamily: "Arimo, sans-serif", fontWeight: 700, fontSize: "20px", lineHeight: "28px", letterSpacing: "-0.5px" }}
              className="uppercase bg-gradient-to-b from-[#51A2FF] via-[#AD46FF] to-[#FF2B7F] bg-clip-text text-transparent drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
            >
              AI
            </span>
          </div>

          <div className="flex items-center gap-3 mr-20">
            <Link
              to="/auth/login"
              className="text-xs font-semibold text-white/70 hover:text-white transition"
            >
              CONNEXION
            </Link>
            <Link
              to="/auth/register"
              className="rounded-full bg-gradient-to-r from-[#51A2FF] to-[#9810FA] px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-[#51A2FF]/20 hover:opacity-95 transition"
            >
              INSCRIPTION
            </Link>
          </div>
        </div>
      </header>

      {/* CARD */}
      <main className="relative z-10 px-6 py-12">
        <div className="mx-auto max-w-[1400px] flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-2xl shadow-black/60 backdrop-blur-xl">
              {/* TITLE */}
              <div className="flex flex-col items-center text-center gap-3 mb-8">
                <div className="h-14 w-14 rounded-full bg-white/[0.04] border border-white/[0.12] flex items-center justify-center">
                  <LogIn className="text-white" size={28} />
                </div>

                <h1
                  style={{ fontFamily: "Arimo, sans-serif", fontWeight: 700, fontSize: "48px", lineHeight: "48px", letterSpacing: "-2.4px" }}
                  className="bg-gradient-to-r from-[#2B7FFF] to-[#9810FA] bg-clip-text text-transparent"
                >
                  CONNEXION
                </h1>

                <p className="text-[10px] text-white/50 uppercase tracking-[0.22em]">
                  PROTOCOLE D'ACCÈS MARSAI
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} autoComplete="off" className="space-y-5">
                {/* IDENTIFIANT DE SESSION */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white"
                  >
                    IDENTIFIANT DE SESSION
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/50 px-4 py-3 focus-within:border-[#51A2FF]/50 transition">
                    <Mail className="text-white/50 shrink-0" size={18} />
                    <input
                      id="email"
                      type="email"
                      placeholder="agent@marsai.io"
                      autoComplete="email"
                      {...register("email")}
                      className="w-full bg-transparent text-sm text-white placeholder:text-white/10 placeholder:font-[Arimo] outline-none border-none shadow-none autofill:shadow-[0_0_0_30px_rgba(0,0,0,0.9)_inset] autofill:[-webkit-text-fill-color:white]"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-400">{errors.email.message}</p>
                  )}
                </div>

                {/* CLÉ CRYPTOGRAPHIQUE */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white"
                  >
                    CLÉ CRYPTOGRAPHIQUE
                  </label>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-black/50 px-4 py-3 focus-within:border-[#51A2FF]/50 transition">
                    <Lock className="text-white/50 shrink-0" size={18} />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...register("password")}
                      className="w-full bg-transparent text-sm text-white placeholder:text-white/10 placeholder:font-[Arimo] outline-none border-none shadow-none autofill:shadow-[0_0_0_30px_rgba(0,0,0,0.9)_inset] autofill:[-webkit-text-fill-color:white]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-white/10 hover:text-white/30 transition shrink-0"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-400">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* MAINTENIR SESSION + RESET */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setMaintainSession((v) => !v)}
                    className="flex items-center gap-2"
                  >
                    <div
                      className={`h-4 w-4 rounded-full border ${
                        maintainSession
                          ? "border-[#51A2FF] bg-[#51A2FF]"
                          : "border-white/30 bg-transparent"
                      } transition`}
                    />
                    <span className="text-[10px] text-white uppercase tracking-wide font-semibold">
                      MAINTENIR SESSION
                    </span>
                  </button>

                  <button
                    type="button"
                    className="text-[10px] text-[#51A2FF] uppercase tracking-wide font-semibold hover:text-[#9810FA] transition"
                  >
                    RESET ?
                  </button>
                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-white py-3.5 text-sm font-semibold text-[#0C0B0B] uppercase tracking-wider hover:opacity-90 transition disabled:opacity-60"
                >
                  <Send size={16} />
                  {loginMutation.isPending
                    ? "CONNEXION..."
                    : "INITIALISER FLUX"}
                </button>
              </form>

              {/* LINK */}
              <div className="mt-6 text-center">
                <Link
                  to="/auth/register"
                  className="text-xs text-white hover:text-white/80 transition"
                >
                  NOUVEAU VOYAGEUR ?{" "}
                  <span className="font-semibold text-white">
                    Générer Identité
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
