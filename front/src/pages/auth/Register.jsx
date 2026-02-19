import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { signIn } from "../../api/auth.js";
import { UserRoundPlus, User, Mail, Eye, EyeOff, Send } from "lucide-react";
import { useMutation } from "@tanstack/react-query";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const registerSchema = z
  .object({
    username: z.string().min(1, "L'alias citoyen est requis"),
    email: z.string().email("Email invalide"),
    password: z.string().min(6, "Minimum 6 caractères"),
    confirmPassword: z.string().min(1, "Veuillez confirmer le mot de passe"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

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
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      // On n'envoie pas confirmPassword au back (souvent inutile côté API)
      const payload = {
        username: data.username,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      };
      return await signIn(payload);
    },
    onSuccess: (response) => {
      localStorage.setItem("username", response.data?.user?.username);
      localStorage.setItem("role", response.data?.user?.role);
      localStorage.setItem("token", response.data?.token);
      navigate("/");
    },
    onError: (error) => {
      alert(error.response?.data?.error || "Erreur lors de l'inscription");
    },
  });

  function onSubmit(data) {
    return registerMutation.mutate(data);
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
                  <UserRoundPlus className="text-white" size={28} />
                </div>

                <h1
                  style={{ fontFamily: "Arimo, sans-serif", fontWeight: 700, fontSize: "48px", lineHeight: "48px", letterSpacing: "-2.4px" }}
                  className="bg-gradient-to-r from-[#2B7FFF] to-[#9810FA] bg-clip-text text-transparent"
                >
                  INSCRIPTION
                </h1>

                <p className="text-[10px] text-white uppercase tracking-[0.22em]">
                  NOUVEAU PROFIL CYBER-PREMIUM
                </p>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* USERNAME */}
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white"
                  >
                    ALIAS CITOYEN
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/50 px-4 py-3 focus-within:border-[#51A2FF]/50 transition">
                    <User className="text-white" size={18} />
                    <input
                      id="username"
                      type="text"
                      placeholder="John Doe"
                      {...register("username")}
                      className="w-full bg-transparent text-[14px] text-white placeholder:text-white/40 placeholder:font-[Arimo] placeholder:font-normal outline-none border-none shadow-none"
                    />
                  </div>
                  {errors.username && (
                    <p className="text-xs text-red-400">
                      {errors.username.message}
                    </p>
                  )}
                </div>

                {/* EMAIL */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white"
                  >
                    CANAL DE COMMUNICATION
                  </label>
                  <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/50 px-4 py-3 focus-within:border-[#51A2FF]/50 transition">
                    <Mail className="text-white" size={18} />
                    <input
                      id="email"
                      type="email"
                      placeholder="nom@exemple.com"
                      autoComplete="email"
                      {...register("email")}
                      className="w-full bg-transparent text-[14px] text-white placeholder:text-white/40 placeholder:font-[Arimo] placeholder:font-normal outline-none border-none shadow-none autofill:shadow-[0_0_0_30px_rgba(0,0,0,0.9)_inset] autofill:[-webkit-text-fill-color:white]"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-400">{errors.email.message}</p>
                  )}
                </div>

                {/* PASSWORD + CONFIRM */}
                <div className="grid grid-cols-2 gap-4">
                  {/* PASSWORD */}
                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white"
                    >
                      CLÉ D'ACCÈS
                    </label>
                    <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-black/50 px-4 py-3 focus-within:border-[#51A2FF]/50 transition">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        {...register("password")}
                        className="w-full bg-transparent text-sm text-white placeholder:text-white/70 placeholder:font-[Arimo] outline-none border-none shadow-none autofill:shadow-[0_0_0_30px_rgba(0,0,0,0.9)_inset] autofill:[-webkit-text-fill-color:white]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-white hover:text-white/80 transition"
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

                  {/* CONFIRM */}
                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white"
                    >
                      VÉRIFICATION
                    </label>
                    <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-black/50 px-4 py-3 focus-within:border-[#51A2FF]/50 transition">
                      <input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("confirmPassword")}
                        className="w-full bg-transparent text-sm text-white placeholder:text-white/70 placeholder:font-[Arimo] outline-none border-none shadow-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="text-white hover:text-white/80 transition"
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-400">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* CHECKBOX */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setAcceptTerms((v) => !v)}
                    className="shrink-0"
                  >
                    <div
                      className={`h-4 w-4 rounded-full border ${
                        acceptTerms
                          ? "border-[#51A2FF] bg-[#51A2FF]"
                          : "border-white bg-transparent"
                      } transition`}
                    />
                  </button>
                  <span className="text-[14px] text-white/70 uppercase tracking-wide font-normal font-[Arimo]">
                    JE CONSENTS AUX TERMERS ET AU CONDITION GENERAL
                  </span>
                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-white py-3.5 text-sm font-semibold text-[#0C0B0B] uppercase tracking-wider hover:opacity-90 transition disabled:opacity-60"
                >
                  <Send size={16} />
                  {registerMutation.isPending
                    ? "INSCRIPTION..."
                    : "GÉNÉRER IDENTITÉ"}
                </button>

                {/* LINK */}
                <div className="text-center pt-2">
                  <Link
                    to="/auth/login"
                    className="text-xs text-white hover:text-white/80 transition"
                  >
                    DÉJÀ ENREGISTRÉ ?{"   "}
                    <span className="font-semibold text-white">
                      Ouvrir Session
                    </span>
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
