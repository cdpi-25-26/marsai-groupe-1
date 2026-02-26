import { motion, AnimatePresence } from "motion/react";
import { Ticket, User, Mail, Download, X, Calendar, MapPin, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { TopBar } from "../../layouts/TopBar.jsx";
import QRCodeStyling from "qr-code-styling";
import { fetchEvents, registerForEvent } from "../../api/events.js";

// Décode le payload JWT stocké dans localStorage
function getCurrentUser() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    // base64url → base64 standard avant atob()
    const b64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

const TICKET_TYPES = [
  { value: "standard", label: "Standard",  color: "from-[#51a2ff] to-[#0066ff]" },
  { value: "vip",      label: "VIP",       color: "from-[#ad46ff] to-[#7000ff]" },
  { value: "pmr",      label: "PMR",       color: "from-[#ff9500] to-[#ffcc00]" },
  { value: "press",    label: "Presse",    color: "from-[#30d158] to-[#00a321]" },
];

const createLogoSVG = () => {
  const svg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="#02040a" rx="12"/>
    <text x="50" y="45" font-family="Arial, sans-serif" font-size="16" font-weight="900" text-anchor="middle" fill="#ffffff">MARS</text>
    <text x="50" y="65" font-family="Arial, sans-serif" font-size="16" font-weight="900" text-anchor="middle" fill="#ad46ff">AI</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export default function TicketPage() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [firstName, setFirstName]     = useState("");
  const [lastName, setLastName]       = useState("");
  const [email, setEmail]             = useState(currentUser?.email || "");
  const [ticketType, setTicketType]   = useState("standard");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [events, setEvents]           = useState([]);
  const [loading, setLoading]         = useState(false);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [error, setError]             = useState(null);
  const [ticketInfo, setTicketInfo]   = useState(null);
  const [showTicket, setShowTicket]   = useState(false);

  const qrCodeRef      = useRef(null);
  const qrCodeInstance = useRef(null);

  // Charger les événements
  useEffect(() => {
    fetchEvents()
      .then((res) => setEvents(res.data))
      .catch(() => setError("Impossible de charger les événements."))
      .finally(() => setEventsLoading(false));
  }, []);

  // Générer le QR code quand le ticket est affiché
  useEffect(() => {
    if (showTicket && ticketInfo && qrCodeRef.current && !qrCodeInstance.current) {
      qrCodeInstance.current = new QRCodeStyling({
        width: 280,
        height: 280,
        type: "svg",
        data: ticketInfo.qrToken,
        image: createLogoSVG(),
        imageOptions: { crossOrigin: "anonymous", margin: 4, imageSize: 0.3 },
        dotsOptions: { color: "#ffffff", type: "rounded" },
        backgroundOptions: { color: "#00000000" },
        cornersSquareOptions: { color: "#51a2ff", type: "extra-rounded" },
        cornersDotOptions: { color: "#ad46ff", type: "dot" },
      });
      qrCodeInstance.current.append(qrCodeRef.current);
    }
    return () => {
      if (!showTicket && qrCodeRef.current) {
        qrCodeRef.current.innerHTML = "";
        qrCodeInstance.current = null;
      }
    };
  }, [showTicket, ticketInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      navigate("/auth/login");
      return;
    }
    if (!selectedEventId) {
      setError("Veuillez sélectionner un événement.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await registerForEvent(selectedEventId, ticketType);
      const { registration, event } = res.data;
      setTicketInfo({
        qrToken:    registration.qrToken,
        ticketType: registration.ticketType,
        firstName,
        lastName,
        email:      currentUser.username,
        eventTitle: event.title,
        eventDate:  new Date(event.startDate).toLocaleDateString("fr-FR", {
          weekday: "long", day: "numeric", month: "long", year: "numeric",
        }),
        eventLocation: event.location,
      });
      setShowTicket(true);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la réservation.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (qrCodeInstance.current) {
      qrCodeInstance.current.download({
        name: `marsai-ticket-${ticketInfo?.qrToken?.slice(0, 8)}`,
        extension: "png",
      });
    }
  };

  const handleCloseTicket = () => {
    setShowTicket(false);
    if (qrCodeRef.current) {
      qrCodeRef.current.innerHTML = "";
      qrCodeInstance.current = null;
    }
  };

  const selectedType = TICKET_TYPES.find((t) => t.value === ticketType);

  return (
    <div className="min-h-screen bg-black text-white font-['Arimo'] overflow-x-hidden">
      <TopBar />

      {/* Background ambiance */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#51a2ff]/[0.04] rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#ad46ff]/[0.04] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 pt-32 md:pt-40 pb-20 px-4 md:px-6">
        <div className="flex flex-col items-center justify-center">

          {/* Formulaire */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl mb-20"
          >
            <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 md:p-14 shadow-2xl">

              {/* En-tête */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/[0.05] border border-white/10 rounded-[24px] mb-6">
                  <Ticket className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                  Billetterie
                </h1>
                <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.3em]">
                  Marseille Hub — Festival 2026
                </p>
              </div>

              {/* Avertissement non connecté */}
              {!currentUser && (
                <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-[20px] mb-6">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <p className="text-amber-300 text-sm">
                    Vous devez être{" "}
                    <button
                      onClick={() => navigate("/auth/login")}
                      className="underline font-bold hover:text-amber-200 transition-colors"
                    >
                      connecté
                    </button>{" "}
                    pour réserver un billet.
                  </p>
                </div>
              )}

              {/* Erreur */}
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-[20px] mb-6">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Nom / Prénom */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white mb-3 ml-1">Prénom</label>
                    <div className="relative">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Sophie"
                        required
                        className="w-full h-[72px] bg-black/40 border border-white/10 rounded-[28px] pl-16 pr-6 text-sm font-medium focus:outline-none focus:border-[#51a2ff]/50 focus:bg-black/60 transition-all placeholder:text-white/10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white mb-3 ml-1">Nom</label>
                    <div className="relative">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Martin"
                        required
                        className="w-full h-[72px] bg-black/40 border border-white/10 rounded-[28px] pl-16 pr-6 text-sm font-medium focus:outline-none focus:border-[#51a2ff]/50 focus:bg-black/60 transition-all placeholder:text-white/10"
                      />
                    </div>
                  </div>
                </div>

                {/* Email (pré-rempli depuis le JWT) */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white mb-3 ml-1">
                    Email / Compte
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                    <input
                      type="text"
                      value={currentUser ? currentUser.username : ""}
                      readOnly
                      placeholder="Connectez-vous pour continuer"
                      className="w-full h-[72px] bg-black/40 border border-white/10 rounded-[28px] pl-16 pr-6 text-sm font-medium text-white/60 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Sélection d'événement */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white mb-3 ml-1">
                    Événement
                  </label>
                  {eventsLoading ? (
                    <div className="flex items-center gap-3 h-[72px] px-6 bg-black/40 border border-white/10 rounded-[28px]">
                      <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
                      <span className="text-sm text-white/30">Chargement des événements...</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 pointer-events-none z-10" />
                      <select
                        value={selectedEventId}
                        onChange={(e) => setSelectedEventId(e.target.value)}
                        required
                        className="w-full h-[72px] bg-black/40 border border-white/10 rounded-[28px] pl-16 pr-6 text-sm font-medium focus:outline-none focus:border-[#51a2ff]/50 focus:bg-black/60 transition-all appearance-none text-white"
                      >
                        <option value="" className="bg-black text-white/40">Sélectionner un événement</option>
                        {events.map((evt) => (
                          <option key={evt.id} value={evt.id} className="bg-black text-white">
                            {evt.title} — {new Date(evt.startDate).toLocaleDateString("fr-FR")}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Type d'accès */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white mb-4 ml-1">
                    Type d'accès
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {TICKET_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setTicketType(type.value)}
                        className={`h-16 rounded-[20px] font-black uppercase text-[10px] tracking-widest transition-all border ${
                          ticketType === type.value
                            ? "bg-white text-black border-white"
                            : "bg-black/40 border-white/10 text-white/40 hover:border-white/20"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bouton soumettre */}
                <button
                  type="submit"
                  disabled={loading || !currentUser}
                  className="w-full h-[76px] bg-white text-black rounded-[28px] font-black uppercase tracking-[0.25em] text-[11px] relative overflow-hidden group transition-transform active:scale-[0.97] shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#ad46ff] via-[#51a2ff] to-[#ff2d55] opacity-0 group-hover:opacity-10 transition-opacity" />
                  <span className="relative z-10 flex items-center justify-center gap-4">
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Ticket className="w-5 h-5" />
                    )}
                    {loading ? "Réservation en cours..." : "Générer Pass Cyber"}
                  </span>
                </button>

              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal ticket */}
      <AnimatePresence>
        {showTicket && ticketInfo && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-8 bg-black/95 backdrop-blur-2xl overflow-y-auto"
            onClick={handleCloseTicket}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg"
            >
              <button
                onClick={handleCloseTicket}
                className="absolute -top-6 -right-6 z-10 w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/15 rounded-[40px] shadow-2xl">
                <div className="p-8 md:p-10">

                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${selectedType?.color} rounded-[24px] mb-4 shadow-xl`}>
                      <Ticket className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-black uppercase text-white mb-2 tracking-tighter">Votre Pass</h2>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Digital Identité marsAI</p>
                  </div>

                  {/* QR Code */}
                  <div className="flex items-center justify-center bg-white/[0.03] border border-white/10 rounded-[32px] p-6 mb-8">
                    <div ref={qrCodeRef} className="flex items-center justify-center" />
                  </div>

                  {/* Infos ticket */}
                  <div className="space-y-4 mb-8">
                    <div className="p-5 bg-black/40 border border-white/10 rounded-[24px]">
                      <div className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">Détenteur</div>
                      <div className="text-white font-bold text-lg">{ticketInfo.firstName} {ticketInfo.lastName}</div>
                    </div>

                    <div className="p-5 bg-black/40 border border-white/10 rounded-[24px]">
                      <div className="flex items-center gap-2 text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">
                        <Calendar className="w-3 h-3" /> Événement
                      </div>
                      <div className="text-white font-bold">{ticketInfo.eventTitle}</div>
                      <div className="text-white/50 text-sm mt-1">{ticketInfo.eventDate}</div>
                    </div>

                    <div className="p-5 bg-black/40 border border-white/10 rounded-[24px]">
                      <div className="flex items-center gap-2 text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">
                        <MapPin className="w-3 h-3" /> Lieu
                      </div>
                      <div className="text-white font-bold text-sm">{ticketInfo.eventLocation}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-black/40 border border-white/10 rounded-[24px]">
                        <div className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">Niveau</div>
                        <div className="text-white font-bold uppercase">{ticketInfo.ticketType}</div>
                      </div>
                      <div
                        className="p-5 bg-black/40 border border-white/10 rounded-[24px] cursor-pointer hover:border-white/30 transition-all"
                        onClick={() => { navigator.clipboard.writeText(ticketInfo.qrToken); alert("Token copié !"); }}
                        title="Cliquer pour copier"
                      >
                        <div className="text-white/30 text-[9px] font-black uppercase tracking-widest mb-1">ID Token (cliquer pour copier)</div>
                        <div className="text-white font-mono text-[9px] break-all">{ticketInfo.qrToken}</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleDownload}
                    className="w-full h-[72px] bg-white text-black rounded-[24px] font-black uppercase tracking-[0.2em] text-[11px] hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <span className="flex items-center justify-center gap-3">
                      <Download className="w-5 h-5" />
                      Télécharger Ticket
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
