import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import {
  Film, User, Mail, Globe, Clock, Tag, ChevronRight, ChevronLeft,
  Upload, Check, Loader2, Sparkles, Video, Image,
} from 'lucide-react';
import { createSubmission } from '../../api/submissions';
import { getCategories } from '../../api/categories';

const AI_TOOLS = [
  'Sora', 'Runway ML', 'Kling AI', 'Pika Labs',
  'Midjourney', 'DALL-E 3', 'Stable Diffusion',
  'ElevenLabs', 'Suno AI', 'Luma AI', 'HeyGen', 'Adobe Firefly',
];

// ── Schéma Zod (champs texte uniquement) ──────────────────────────────────
const submitSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  director: z.string().min(1, 'Le nom du réalisateur est requis'),
  email: z.string().email("L'email est invalide"),
  category: z.string().min(1, 'La catégorie est requise').or(z.number()),
  country: z.string().min(1, 'Le pays est requis'),
  duration: z.string().min(1, 'La durée est requise'),
  description: z.string().min(50, 'Décrivez votre film en au moins 50 caractères'),
  aiTools: z.array(z.string()).min(1, 'Sélectionnez au moins un outil IA'),
});

// ── Composant indicateur de progression ───────────────────────────────────
function StepIndicator({ step }) {
  const steps = [
    { n: 1, label: 'Informations' },
    { n: 2, label: 'Description & IA' },
    { n: 3, label: 'Fichiers' },
  ];
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black border transition-all ${
              step > s.n
                ? 'bg-gradient-to-r from-purple-600 to-[#51A2FF] border-transparent text-white'
                : step === s.n
                  ? 'border-[#51A2FF] text-[#51A2FF] bg-[#51A2FF]/10'
                  : 'border-white/20 text-white/30 bg-transparent'
            }`}>
              {step > s.n ? <Check className="w-4 h-4" /> : s.n}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${
              step === s.n ? 'text-white/70' : 'text-white/30'
            }`}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-16 h-px mx-2 mb-4 transition-all ${
              step > s.n ? 'bg-gradient-to-r from-purple-600 to-[#51A2FF]' : 'bg-white/10'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Composant champ texte ─────────────────────────────────────────────────
function Field({ label, icon: Icon, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60">
        <Icon className="w-3.5 h-3.5" /> {label}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

const inputClass =
  'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-[#51A2FF]/50 focus:bg-white/8 transition-all text-sm';

// ── Étape 1 : Informations générales ─────────────────────────────────────
function Step1({ register, errors, categories = [] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="md:col-span-2">
        <Field label="Titre du film" icon={Film} error={errors.title?.message}>
          <input {...register('title')} placeholder="Ex : Éveil synthétique" className={inputClass} />
        </Field>
      </div>

      <Field label="Réalisateur" icon={User} error={errors.director?.message}>
        <input {...register('director')} placeholder="Prénom Nom" className={inputClass} />
      </Field>

      <Field label="Email" icon={Mail} error={errors.email?.message}>
        <input {...register('email')} type="email" placeholder="contact@example.com" className={inputClass} />
      </Field>

      <Field label="Catégorie" icon={Tag} error={errors.category?.message}>
        <select {...register('category')} className={`${inputClass} cursor-pointer`} defaultValue="">
          <option value="" disabled className="bg-zinc-900">Choisir une catégorie</option>
          {categories.map(c => (
            <option key={c.id} value={c.id} className="bg-zinc-900">{c.name}</option>
          ))}
        </select>
      </Field>

      <Field label="Pays" icon={Globe} error={errors.country?.message}>
        <input {...register('country')} placeholder="Ex : France" className={inputClass} />
      </Field>

      <div className="md:col-span-2">
        <Field label="Durée" icon={Clock} error={errors.duration?.message}>
          <input {...register('duration')} placeholder="Ex : 12 min 30 sec" className={inputClass} />
        </Field>
      </div>
    </div>
  );
}

// ── Étape 2 : Description & outils IA ────────────────────────────────────
function Step2({ register, errors, aiTools, toggleTool }) {
  const charCount = (register('description') && 0) || 0;
  return (
    <div className="flex flex-col gap-6">
      <Field label="Description du film" icon={Film} error={errors.description?.message}>
        <textarea
          {...register('description')}
          placeholder="Décrivez votre film, son univers, son propos artistique... (min. 50 caractères)"
          rows={5}
          className={`${inputClass} resize-none`}
        />
      </Field>

      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60">
          <Sparkles className="w-3.5 h-3.5" /> Outils IA utilisés
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AI_TOOLS.map(tool => {
            const selected = aiTools?.includes(tool);
            return (
              <button
                key={tool}
                type="button"
                onClick={() => toggleTool(tool)}
                className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all border cursor-pointer ${
                  selected
                    ? 'bg-gradient-to-r from-purple-600/30 to-[#51A2FF]/30 border-[#51A2FF]/50 text-white'
                    : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30 hover:text-white/80'
                }`}
              >
                {selected && <Check className="w-3 h-3 inline mr-1" />}
                {tool}
              </button>
            );
          })}
        </div>
        {errors.aiTools && (
          <p className="text-red-400 text-xs">{errors.aiTools.message}</p>
        )}
      </div>
    </div>
  );
}

// ── Étape 3 : Fichiers ────────────────────────────────────────────────────
function FileDropZone({ label, icon: Icon, accept, file, onFile, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60">
        <Icon className="w-3.5 h-3.5" /> {label}
      </label>
      <label className={`relative flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
        file
          ? 'border-[#51A2FF]/50 bg-[#51A2FF]/5'
          : 'border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/5'
      }`}>
        <input
          type="file"
          accept={accept}
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={e => onFile(e.target.files[0] || null)}
        />
        {file ? (
          <>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-[#51A2FF] flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div className="text-center">
              <p className="text-white text-sm font-bold truncate max-w-xs">{file.name}</p>
              <p className="text-white/40 text-xs">{(file.size / 1024 / 1024).toFixed(1)} Mo</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <Upload className="w-5 h-5 text-white/40" />
            </div>
            <div className="text-center">
              <p className="text-white/60 text-sm font-bold">Glissez ou cliquez pour choisir</p>
              <p className="text-white/30 text-xs mt-1">{accept.replace(/,/g, ', ')}</p>
            </div>
          </>
        )}
      </label>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

function Step3({ videoFile, thumbnailFile, setVideoFile, setThumbnailFile, fileErrors }) {
  return (
    <div className="flex flex-col gap-6">
      <FileDropZone
        label="Fichier vidéo"
        icon={Video}
        accept=".mp4,.mov,.avi,.mkv,.webm"
        file={videoFile}
        onFile={setVideoFile}
        error={fileErrors.videoFile}
      />
      <FileDropZone
        label="Miniature (thumbnail)"
        icon={Image}
        accept=".jpg,.jpeg,.png,.webp"
        file={thumbnailFile}
        onFile={setThumbnailFile}
        error={fileErrors.thumbnailFile}
      />
    </div>
  );
}

// ── État succès ───────────────────────────────────────────────────────────
function SuccessState() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center flex flex-col items-center gap-6 max-w-md"
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-[#51A2FF] flex items-center justify-center shadow-[0_0_60px_rgba(147,51,234,0.4)]">
          <Check className="w-12 h-12 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-black uppercase text-white mb-2">Film soumis !</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Votre film a bien été reçu. Notre équipe l'examinera et vous contactera par email
            pour confirmer sa sélection ou non à la compétition.
          </p>
        </div>
        <a
          href="/"
          className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white font-bold text-sm uppercase tracking-wider hover:bg-white/10 transition-all"
        >
          Retour à l'accueil
        </a>
      </motion.div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────
export default function Submit() {
  const [step, setStep] = useState(1);
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [fileErrors, setFileErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(submitSchema),
    defaultValues: { aiTools: [] },
  });

  const aiTools = watch('aiTools');

  const toggleTool = (tool) => {
    const current = getValues('aiTools') || [];
    const next = current.includes(tool)
      ? current.filter(t => t !== tool)
      : [...current, tool];
    setValue('aiTools', next, { shouldValidate: true });
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      const fd = new FormData();
      fd.append('title', data.title);
      fd.append('director', data.director);
      fd.append('email', data.email);
      fd.append('categoryId', data.category);
      fd.append('country', data.country);
      fd.append('duration', data.duration);
      fd.append('description', data.description);
      fd.append('aiTools', JSON.stringify(data.aiTools));
      fd.append('videoFile', videoFile);
      fd.append('thumbnailFile', thumbnailFile);
      return createSubmission(fd);
    },
    onSuccess: () => setSubmitted(true),
    onError: (err) => {
      alert(err.response?.data?.error || 'Une erreur est survenue.');
    },
  });

  const nextStep = async () => {
    const fields =
      step === 1
        ? ['title', 'director', 'email', 'category', 'country', 'duration']
        : ['description', 'aiTools'];
    const valid = await trigger(fields);
    if (valid) setStep(s => s + 1);
  };

  const handleFinalSubmit = (data) => {
    const errs = {};
    if (!videoFile) errs.videoFile = 'Le fichier vidéo est requis';
    if (!thumbnailFile) errs.thumbnailFile = 'La miniature est requise';
    if (Object.keys(errs).length > 0) {
      setFileErrors(errs);
      return;
    }
    setFileErrors({});
    mutation.mutate(data);
  };

  if (submitted) return <SuccessState />;

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 flex items-start justify-center">
      <div className="w-full max-w-2xl">

        {/* En-tête */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white mb-3">
            Soumettre un <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-[#51A2FF]">film</span>
          </h1>
          <p className="text-white/40 text-sm">
            Partagez votre création IA avec la communauté MARS AI
          </p>
        </div>

        {/* Indicateur d'étapes */}
        <StepIndicator step={step} />

        {/* Carte du formulaire */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-8 bg-white/[0.03] backdrop-blur-[40px] border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden"
        >
          {/* Reflet supérieur */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          <form onSubmit={handleSubmit(handleFinalSubmit)}>
            {step === 1 && <Step1 register={register} errors={errors} categories={categories} />}
            {step === 2 && (
              <Step2
                register={register}
                errors={errors}
                aiTools={aiTools}
                toggleTool={toggleTool}
              />
            )}
            {step === 3 && (
              <Step3
                videoFile={videoFile}
                thumbnailFile={thumbnailFile}
                setVideoFile={setVideoFile}
                setThumbnailFile={setThumbnailFile}
                fileErrors={fileErrors}
              />
            )}

            {/* Boutons de navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t border-white/5">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-bold uppercase tracking-wider cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Précédent
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-[#51A2FF] text-white font-bold text-sm uppercase tracking-wider hover:shadow-[0_0_24px_rgba(168,85,247,0.4)] transition-all cursor-pointer"
                >
                  Suivant <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-[#51A2FF] text-white font-bold text-sm uppercase tracking-wider hover:shadow-[0_0_24px_rgba(168,85,247,0.4)] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {mutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {mutation.isPending ? 'Envoi en cours...' : 'Soumettre le film'}
                </button>
              )}
            </div>
          </form>
        </motion.div>

        {/* Note bas de page */}
        <p className="text-center text-white/25 text-xs mt-6">
          En soumettant, vous acceptez que votre film soit évalué par notre jury dans le respect du règlement du festival.
        </p>
      </div>
    </div>
  );
}
