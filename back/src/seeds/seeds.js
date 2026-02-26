import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import crypto from "crypto";
import sequelize from "../db/connection.js";
import {
  User,
  Film,
  JuryRating,
  Event,
  EventRegistration,
  NewsletterSubscriber,
  SubmissionConfig,
} from "../models/index.js";

const hash = (pwd) => bcrypt.hash(pwd, 10);
const qr = () => crypto.randomBytes(32).toString("hex");

function log(msg) {
  console.log(`[seed] ${msg}`);
}

async function main() {
  await sequelize.authenticate();
  log("Connexion DB OK");

  await sequelize.sync({ force: true });
  log("Tables recréées");

  // ── 1. UTILISATEURS ────────────────────────────────────────────────────────

  log("Création des utilisateurs...");

  const [admin, jury1, jury2, real1, real2, real3, real4, real5] =
    await Promise.all([
      User.create({
        email: "admin@marsai.fr",
        username: "admin",
        password: await hash("Admin1234!"),
        role: "ADMIN",
        biography: "Administrateur de la plateforme marsAI.",
        country: "FR",
        preferredLanguage: "fr",
        newsletter: true,
      }),
      User.create({
        email: "jury1@marsai.fr",
        username: "jury_sophie",
        password: await hash("Jury1234!"),
        role: "JURY",
        biography: "Critique de cinéma spécialisée en films IA. Membre du jury marsAI 2024.",
        country: "FR",
        preferredLanguage: "fr",
        newsletter: true,
      }),
      User.create({
        email: "jury2@marsai.fr",
        username: "jury_marc",
        password: await hash("Jury1234!"),
        role: "JURY",
        biography: "Réalisateur et expert en intelligence artificielle générative.",
        country: "BE",
        preferredLanguage: "fr",
        newsletter: false,
      }),
      User.create({
        email: "emmar@marsai.fr",
        username: "emmar",
        password: await hash("Real1234!"),
        role: "REALISATEUR",
        biography: "Artiste numérique française explorant l'IA générative depuis 2020.",
        country: "FR",
        preferredLanguage: "fr",
        newsletter: true,
        socialLinks: { website: "https://emmar.art", instagram: "@emmar_art" },
      }),
      User.create({
        email: "alexchen@marsai.fr",
        username: "alexchen",
        password: await hash("Real1234!"),
        role: "REALISATEUR",
        biography: "Cinéaste indépendant, passionné de science-fiction et d'IA.",
        country: "CN",
        preferredLanguage: "en",
        newsletter: true,
        socialLinks: { twitter: "@alexchen_film" },
      }),
      User.create({
        email: "mariel@marsai.fr",
        username: "mariel",
        password: await hash("Real1234!"),
        role: "REALISATEUR",
        biography: "Réalisatrice de courts-métrages expérimentaux. Basée à Lyon.",
        country: "FR",
        preferredLanguage: "fr",
        newsletter: false,
      }),
      User.create({
        email: "yukitan@marsai.fr",
        username: "yukitan",
        password: await hash("Real1234!"),
        role: "REALISATEUR",
        biography: "Director and visual artist from Tokyo. AI cinema pioneer.",
        country: "JP",
        preferredLanguage: "en",
        newsletter: true,
        socialLinks: { instagram: "@yuki_film" },
      }),
      User.create({
        email: "jameswil@marsai.fr",
        username: "jameswil",
        password: await hash("Real1234!"),
        role: "REALISATEUR",
        biography: "Cyberpunk filmmaker from Los Angeles. Neural art enthusiast.",
        country: "US",
        preferredLanguage: "en",
        newsletter: true,
      }),
    ]);

  log("Utilisateurs créés : admin, jury_sophie, jury_marc, emmar, alexchen, mariel, yukitan, jameswil");

  // ── 2. FILMS ───────────────────────────────────────────────────────────────

  log("Création des films...");

  await Film.bulkCreate(
    [
      {
        id: 1,
        title: "Neural Odyssey",
        description: "Une exploration visuelle époustouflante des réseaux neuronaux.",
        youtubeId: "dQw4w9WgXcQ",
        posterPath: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&h=400&fit=crop",
        country: "FR", duration: 58, status: "SELECTION_OFFICIELLE", userId: real1.id,
        aiIdentity: { scenario: "ChatGPT", image: "Midjourney", video: "Runway", sound: "ElevenLabs", postProduction: "Adobe Premiere" },
      },
      {
        id: 2,
        title: "Le Dernier Humain",
        description: "Dans un monde où l'IA a tout créé, un humain cherche sa place.",
        youtubeId: "dQw4w9WgXcQ",
        posterPath: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=600&h=400&fit=crop",
        country: "CN", duration: 55, status: "SELECTION_OFFICIELLE", userId: real2.id,
        aiIdentity: { scenario: "ChatGPT", image: "Stable Diffusion", video: "Sora", sound: "ElevenLabs", postProduction: "DaVinci Resolve" },
      },
      {
        id: 3,
        title: "Algorithmes d'Amour",
        description: "Peut-on tomber amoureux d'une IA ?",
        youtubeId: "dQw4w9WgXcQ",
        posterPath: "https://images.unsplash.com/photo-1638787990698-12742ea73677?w=600&h=400&fit=crop",
        country: "FR", duration: 52, status: "SELECTION_OFFICIELLE", userId: real3.id,
        aiIdentity: { scenario: "ChatGPT", image: "DALL-E", video: "Runway", sound: null, postProduction: null },
      },
      {
        id: 4,
        title: "L'Éveil Numérique",
        description: "Une IA prend conscience de son existence.",
        youtubeId: "dQw4w9WgXcQ",
        posterPath: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop",
        country: "FR", duration: 45, status: "SELECTION_OFFICIELLE", userId: real1.id,
        aiIdentity: { scenario: null, image: "Midjourney", video: "Runway", sound: null, postProduction: null },
      },
      {
        id: 5,
        title: "Rêves Synthétiques",
        description: "Un voyage dans les rêves générés par l'IA.",
        youtubeId: "dQw4w9WgXcQ",
        posterPath: "https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=600&h=400&fit=crop",
        country: "FR", duration: 60, status: "SELECTION_OFFICIELLE", userId: real3.id,
        aiIdentity: { scenario: "ChatGPT", image: "DALL-E", video: null, sound: null, postProduction: "Premiere" },
      },
      {
        id: 6,
        title: "Pixel Perfect",
        description: "Un court-métrage entièrement généré par IA.",
        youtubeId: "dQw4w9WgXcQ",
        posterPath: "https://images.unsplash.com/photo-1633412802994-5c058f151b66?w=600&h=400&fit=crop",
        country: "FR", duration: 38, status: "SELECTION_OFFICIELLE", userId: real1.id,
        aiIdentity: { scenario: null, image: "Stable Diffusion", video: "RunwayML", sound: "Mubert", postProduction: null },
      },
      {
        id: 7,
        title: "Mémoires Virtuelles",
        description: "Une exploration poétique de la mémoire numérique.",
        youtubeId: "dQw4w9WgXcQ",
        posterPath: "https://images.unsplash.com/photo-1639322537228-f710d846310a?w=600&h=400&fit=crop",
        country: "JP", duration: 57, status: "SELECTION_OFFICIELLE", userId: real4.id,
        aiIdentity: { scenario: "ChatGPT", image: "Midjourney", video: "Sora", sound: "ElevenLabs", postProduction: "After Effects" },
      },
      {
        id: 8,
        title: "Code Quantique",
        description: "Un thriller cyberpunk où un hacker découvre un code unique.",
        youtubeId: "dQw4w9WgXcQ",
        posterPath: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop",
        country: "US", duration: 59, status: "SELECTION_OFFICIELLE", userId: real5.id,
        aiIdentity: { scenario: "ChatGPT", image: "Stable Diffusion", video: "Runway", sound: "ElevenLabs", postProduction: "DaVinci" },
      },
      {
        id: 9,
        title: "L'Ascension",
        description: "Une IA découvre la spiritualité et transcende sa programmation.",
        youtubeId: "dQw4w9WgXcQ",
        posterPath: "https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=600&h=400&fit=crop",
        country: "ES", duration: 48, status: "SELECTION_OFFICIELLE", userId: real2.id,
        aiIdentity: { scenario: "ChatGPT", image: "Midjourney", video: "Sora", sound: null, postProduction: null },
      },
      {
        id: 10,
        title: "Fragments d'Éternité",
        description: "Moments suspendus dans le temps recréés par l'IA.",
        youtubeId: "dQw4w9WgXcQ",
        posterPath: "https://images.unsplash.com/photo-1620421680010-0766ff230392?w=600&h=400&fit=crop",
        country: "IT", duration: 52, status: "SELECTION_OFFICIELLE", userId: real3.id,
        aiIdentity: { scenario: null, image: "Midjourney", video: "Runway", sound: null, postProduction: "Premiere" },
      },
      {
        id: 11,
        title: "Neon Nights",
        description: "Séoul 2099 : humains et IA en symbiose éblouissante.",
        youtubeId: "dQw4w9WgXcQ",
        posterPath: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&h=400&fit=crop",
        country: "KR", duration: 56, status: "SELECTION_OFFICIELLE", userId: real4.id,
        aiIdentity: { scenario: "ChatGPT", image: "Stable Diffusion", video: "Runway", sound: "ElevenLabs", postProduction: null },
      },
      {
        id: 12,
        title: "Conscience Artificielle",
        description: "Être conscient dans un monde peuplé d'entités artificielles.",
        youtubeId: "dQw4w9WgXcQ",
        posterPath: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&h=400&fit=crop",
        country: "DE", duration: 50, status: "SELECTION_OFFICIELLE", userId: real5.id,
        aiIdentity: { scenario: "ChatGPT", image: "DALL-E", video: "Sora", sound: "ElevenLabs", postProduction: "After Effects" },
      },
      {
        id: 13,
        title: "La Symphonie Numérique",
        description: "Composition musicale et visuelle entièrement générée par IA.",
        youtubeId: "dQw4w9WgXcQ",
        posterPath: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=400&fit=crop",
        country: "FR", duration: 55, status: "SELECTION_OFFICIELLE", userId: real1.id,
        aiIdentity: { scenario: null, image: "Midjourney", video: "Runway", sound: "Suno", postProduction: "Premiere" },
      },
      // PENDING
      { title: "Horizon Quantique", description: "Dimensions parallèles calculées par une IA.", youtubeId: "dQw4w9WgXcQ", country: "FR", duration: 43, status: "PENDING", userId: real2.id, aiIdentity: { scenario: "ChatGPT", image: "Midjourney", video: null, sound: null, postProduction: null } },
      { title: "Echo IA", description: "L'écho de l'humanité dans les systèmes artificiels.", youtubeId: "dQw4w9WgXcQ", country: "CA", duration: 37, status: "PENDING", userId: real3.id, aiIdentity: { scenario: "ChatGPT", image: "DALL-E", video: "Runway", sound: null, postProduction: null } },
      { title: "NeuroArt", description: "Exposition générée en temps réel par un réseau de neurones.", youtubeId: "dQw4w9WgXcQ", country: "GB", duration: 55, status: "PENDING", userId: real4.id, aiIdentity: { scenario: null, image: "Stable Diffusion", video: "RunwayML", sound: "Mubert", postProduction: null } },
      // APPROVED
      { title: "Pixels & Émotions", description: "Histoire d'amour entre un artiste et son IA.", youtubeId: "dQw4w9WgXcQ", country: "FR", duration: 44, status: "APPROVED", userId: real5.id, aiIdentity: { scenario: "ChatGPT", image: "DALL-E", video: "Runway", sound: "ElevenLabs", postProduction: "Premiere" } },
      { title: "Données Perdues", description: "Thriller sur la perte de données personnelles.", youtubeId: "dQw4w9WgXcQ", country: "US", duration: 59, status: "APPROVED", userId: real1.id, aiIdentity: { scenario: "ChatGPT", image: "Midjourney", video: "Sora", sound: null, postProduction: "After Effects" } },
      // REJECTED
      { title: "Violence Numérique", description: "Soumission non conforme au règlement.", youtubeId: "dQw4w9WgXcQ", country: "US", duration: 58, status: "REJECTED", rejectionReason: "Contenu non conforme : scènes de violence explicite (art. 5.2).", userId: real2.id, aiIdentity: { scenario: null, image: "Midjourney", video: null, sound: null, postProduction: null } },
      { title: "Spam IA", description: "Film soumis plusieurs fois sous des titres différents.", youtubeId: "dQw4w9WgXcQ", country: "RU", duration: 30, status: "REJECTED", rejectionReason: "Doublon détecté.", userId: real3.id, aiIdentity: { scenario: null, image: null, video: null, sound: null, postProduction: null } },
    ],
    { hooks: false, validate: false }
  );

  log("20 films créés (13 sélection, 3 pending, 2 approuvés, 2 refusés)");

  // ── 3. VOTES JURY ──────────────────────────────────────────────────────────

  log("Création des votes jury...");

  await JuryRating.bulkCreate([
    { filmId: 1,  userId: jury1.id, score: "TRES_BIEN",  internalComment: "Visuellement époustouflant. Top de la sélection." },
    { filmId: 2,  userId: jury1.id, score: "BIEN",       internalComment: "Bonne narration, mais un peu long." },
    { filmId: 3,  userId: jury1.id, score: "TRES_BIEN",  internalComment: "Très émouvant. Osé et réussi." },
    { filmId: 4,  userId: jury1.id, score: "BIEN",       internalComment: "Intéressant philosophiquement mais manque de rythme." },
    { filmId: 5,  userId: jury1.id, score: "BOF",        internalComment: "Concept intéressant mais trop répétitif visuellement." },
    { filmId: 7,  userId: jury1.id, score: "TRES_BIEN",  internalComment: "Poétique et maîtrisé. Bande son parfaite." },
    { filmId: 8,  userId: jury1.id, score: "BIEN",       internalComment: "Thriller efficace, quelques longueurs." },
    { filmId: 10, userId: jury1.id, score: "JAIME_PAS",  internalComment: "Trop abstrait malgré les belles images." },
    { filmId: 1,  userId: jury2.id, score: "BIEN",       internalComment: "Techniquement impressionnant mais narrativement creux." },
    { filmId: 2,  userId: jury2.id, score: "TRES_BIEN",  internalComment: "Le meilleur film de la sélection selon moi." },
    { filmId: 6,  userId: jury2.id, score: "TRES_BIEN",  internalComment: "L'esthétique pixel art est parfaitement maîtrisée." },
    { filmId: 9,  userId: jury2.id, score: "BOF",        internalComment: "La thématique spiritualité + IA est surexploitée." },
    { filmId: 11, userId: jury2.id, score: "BIEN",       internalComment: "Atmosphère cyberpunk réussie." },
  ]);

  log("13 votes jury créés");

  // ── 4. ÉVÉNEMENTS ──────────────────────────────────────────────────────────

  log("Création des événements...");

  const [evtWorkshop1, evtConf1, evtProjection, evtClosing, evtWorkshop2] =
    await Event.bulkCreate([
      {
        title: "Workshop : Créer avec l'IA — Midjourney & Runway",
        type: "workshop",
        description: "Initiation pratique aux outils de génération vidéo IA.",
        startDate: new Date("2026-06-12T09:00:00"),
        endDate: new Date("2026-06-12T12:00:00"),
        maxParticipants: 20,
        location: "Studio A — La Friche Belle de Mai, Marseille",
      },
      {
        title: "Conférence : L'IA redéfinit-elle le cinéma ?",
        type: "conference",
        description: "Table ronde avec réalisateurs, critiques et experts IA.",
        startDate: new Date("2026-06-12T14:00:00"),
        endDate: new Date("2026-06-12T16:30:00"),
        maxParticipants: 150,
        location: "Grande Salle — La Friche Belle de Mai, Marseille",
      },
      {
        title: "Projection : Top 13 finalistes marsAI",
        type: "projection",
        description: "Projection en avant-première des 13 films finalistes.",
        startDate: new Date("2026-06-12T19:00:00"),
        endDate: new Date("2026-06-12T22:00:00"),
        maxParticipants: 300,
        location: "Cinéma Le César, Marseille",
      },
      {
        title: "Cérémonie de clôture — Remise des prix marsAI 2024",
        type: "closing",
        description: "Soirée de gala : Grand Prix du Jury, Prix du Public. Cocktail dînatoire inclus.",
        startDate: new Date("2026-06-13T19:00:00"),
        endDate: new Date("2026-06-13T23:59:00"),
        maxParticipants: 500,
        location: "Villa Méditerranée, Marseille",
      },
      {
        title: "Workshop : Écriture de scénario assistée par ChatGPT",
        type: "workshop",
        description: "Comment utiliser ChatGPT pour structurer un scénario ?",
        startDate: new Date("2026-06-13T10:00:00"),
        endDate: new Date("2026-06-13T13:00:00"),
        maxParticipants: 25,
        location: "Salle B — La Friche Belle de Mai, Marseille",
      },
    ]);

  log("5 événements créés");

  // ── 5. INSCRIPTIONS ÉVÉNEMENTS ─────────────────────────────────────────────

  log("Création des inscriptions événements...");

  await EventRegistration.bulkCreate([
    { eventId: evtWorkshop1.id,  userId: jury1.id,  qrToken: qr(), ticketType: "vip"      },
    { eventId: evtWorkshop1.id,  userId: real1.id,  qrToken: qr(), ticketType: "press"    },
    { eventId: evtWorkshop1.id,  userId: real2.id,  qrToken: qr(), ticketType: "standard" },
    { eventId: evtConf1.id,      userId: jury1.id,  qrToken: qr(), ticketType: "vip"      },
    { eventId: evtConf1.id,      userId: jury2.id,  qrToken: qr(), ticketType: "vip"      },
    { eventId: evtConf1.id,      userId: real1.id,  qrToken: qr(), ticketType: "press"    },
    { eventId: evtConf1.id,      userId: real3.id,  qrToken: qr(), ticketType: "standard" },
    { eventId: evtProjection.id, userId: jury1.id,  qrToken: qr(), ticketType: "vip"      },
    { eventId: evtProjection.id, userId: jury2.id,  qrToken: qr(), ticketType: "vip"      },
    { eventId: evtProjection.id, userId: real1.id,  qrToken: qr(), ticketType: "press"    },
    { eventId: evtProjection.id, userId: real2.id,  qrToken: qr(), ticketType: "standard" },
    { eventId: evtProjection.id, userId: real4.id,  qrToken: qr(), ticketType: "pmr"      },
    { eventId: evtClosing.id,    userId: admin.id,  qrToken: qr(), ticketType: "vip"      },
    { eventId: evtClosing.id,    userId: jury1.id,  qrToken: qr(), ticketType: "vip"      },
    { eventId: evtClosing.id,    userId: jury2.id,  qrToken: qr(), ticketType: "vip"      },
    { eventId: evtWorkshop2.id,  userId: real3.id,  qrToken: qr(), ticketType: "standard" },
    { eventId: evtWorkshop2.id,  userId: real5.id,  qrToken: qr(), ticketType: "press"    },
  ]);

  log("17 inscriptions créées");

  // ── 6. NEWSLETTER ──────────────────────────────────────────────────────────

  log("Création des abonnés newsletter...");

  await NewsletterSubscriber.bulkCreate([
    { email: "admin@marsai.fr",       userId: admin.id,  language: "fr" },
    { email: "jury1@marsai.fr",       userId: jury1.id,  language: "fr" },
    { email: "emmar@marsai.fr",       userId: real1.id,  language: "fr" },
    { email: "alexchen@marsai.fr",    userId: real2.id,  language: "en" },
    { email: "yukitan@marsai.fr",     userId: real4.id,  language: "en" },
    { email: "visiteur1@gmail.com",   userId: null,      language: "fr" },
    { email: "visiteur2@hotmail.com", userId: null,      language: "fr" },
    { email: "cinephile@yahoo.com",   userId: null,      language: "en" },
  ]);

  log("8 abonnés newsletter créés");

  // ── 7. CONFIG SOUMISSIONS ──────────────────────────────────────────────────

  log("Création de la configuration soumissions...");

  await SubmissionConfig.bulkCreate([
    { key: "submission_open",      value: "true",                      description: "Activation des soumissions (true / false)" },
    { key: "submission_start",     value: "2026-01-01T00:00:00.000Z",  description: "Date d'ouverture des soumissions (ISO 8601)" },
    { key: "submission_end",       value: "2026-03-01T23:59:59.000Z",  description: "Date de fermeture des soumissions (ISO 8601)" },
    { key: "max_duration_seconds", value: "60",                        description: "Durée maximale d'un film en secondes" },
    { key: "max_films_selection",  value: "50",                        description: "Nombre maximum de films en sélection officielle" },
    { key: "festival_date",        value: "2026-06-12T09:00:00.000Z",  description: "Date de début du festival (Marseille)" },
  ]);

  log("6 entrées de configuration créées");

  // ── Résumé ─────────────────────────────────────────────────────────────────

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  ✅  Seed terminé avec succès !");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("  Comptes de test :");
  console.log("  ADMIN   admin@marsai.fr       Admin1234!");
  console.log("  JURY    jury1@marsai.fr       Jury1234!");
  console.log("  JURY    jury2@marsai.fr       Jury1234!");
  console.log("  REAL    emmar@marsai.fr       Real1234!");
  console.log("");
  console.log("  Films  : 13 sélection + 3 pending + 2 approuvés + 2 refusés");
  console.log("  Votes  : 13 (jury_sophie: 8, jury_marc: 5)");
  console.log("  Events : 5 | Inscriptions : 17 (avec ticketType)");
  console.log("  Newsletter : 8 abonnés");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await sequelize.close();
}

main().catch((err) => {
  console.error("\n❌ Erreur seed:", err?.message || err);
  process.exit(1);
});