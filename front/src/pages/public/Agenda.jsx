import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import {
  MapPin,
  Clock,
  Calendar,
  TrainFront,
  Car,
  Navigation,
  Sparkles,
  Users
} from "lucide-react";

import { TopBar } from "../../layouts/TopBar";
import { ImageWithFallback } from "../../components/common/ImageWithFallBack";

// Import figma assets from the provided code
import imgMap from "../../assets/Image/8bda8b1a311ace4c1ca756fc036b819a50be97fb.png";
import FooterLayout from "../../layouts/FooterLayout";

const conferenceColors = [
  "text-emerald-400",
  "text-purple-400",
  "text-[#51A2FF]/50",
  "text-pink-400",
  "text-pink-400",
  "text-purple-400",
  "text-[#51A2FF]",
];

const conferenceTimes = ["09:30", "10:30", "13:00", "14:30", "16:30", "19:00", "21:00"];

const workshopTimes = ["14h30", "15h45", "17h00", "18h15"];
const workshopCoaches = ["Thomas Aubert", "Thomas Aubert", "Thomas Aubert", "Nicolas Lambert"];

export function AgendaPage({ onNavigate }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 font-['Arimo']">
      <TopBar onNavigate={onNavigate} currentPage="agenda" />

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] left-[-5%] w-[400px] h-[400px] bg-pink-600/10 blur-[100px] rounded-full" />
        <div className="absolute top-[40%] right-[10%] w-[300px] h-[300px] bg-pink-600/5 blur-[80px] rounded-full" />
        <div className="absolute top-[60%] left-[20%] w-[400px] h-[400px] bg-[#51A2FF]/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 pt-32 md:pt-40">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 text-purple-500 mb-4">
            <Calendar className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-[0.3em]">{t("pages.agenda.infoPratiques")}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">
            {t("pages.agenda.date")}
          </h1>
          <h2 className="text-3xl md:text-4xl font-black text-purple-500 mb-8">
            {t("pages.agenda.city")}
          </h2>

          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-pink-500/20 p-3 rounded-[24px]">
                <MapPin className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter">{t("pages.agenda.venueName")}</h3>
            </div>
            <p className="text-white/60 leading-relaxed">
              {t("pages.agenda.venueDesc")}
            </p>
          </div>
        </motion.div>

        {/* Programme Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8 border-b-2 border-purple-500/30 pb-4 inline-flex">
            <Clock className="w-6 h-6 text-purple-400" />
            <h3 className="text-2xl font-black uppercase tracking-tighter">{t("pages.agenda.programTitle")}</h3>
          </div>

          <div className="space-y-4">
            {conferenceTimes.map((time, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${conferenceColors[idx].replace('text', 'from')}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[24px]`} />
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] p-6 flex items-center gap-8 group-hover:bg-white/10 transition-all duration-300">
                  <div className={`text-2xl font-black ${conferenceColors[idx]} shrink-0 tabular-nums`}>
                    {time}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${conferenceColors[idx]}`}>
                      {t(`pages.agenda.conferences.${idx}.type`)}
                    </span>
                    <h4 className="text-lg font-bold leading-tight text-white/90">
                      {t(`pages.agenda.conferences.${idx}.title`)}
                    </h4>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Access Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8 border-b-2 border-[#51A2FF]/30 pb-4 inline-flex">
            <Navigation className="w-6 h-6 text-[#51A2FF]" />
            <h3 className="text-2xl font-black uppercase tracking-tighter">{t("pages.agenda.access.title")}</h3>
          </div>

          <div className="space-y-6 mb-8">
            <div className="flex gap-6 items-start">
              <div className="bg-[#51A2FF]/10 p-4 rounded-[24px] shrink-0">
                <TrainFront className="w-6 h-6 text-[#51A2FF]" />
              </div>
              <div>
                <h4 className="text-lg font-black mb-1">{t("pages.agenda.access.transport.title")}</h4>
                <p className="text-white/50 text-sm leading-relaxed" style={{ whiteSpace: "pre-line" }}>
                  {t("pages.agenda.access.transport.desc")}
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="bg-pink-500/10 p-4 rounded-[24px] shrink-0">
                <Car className="w-6 h-6 text-pink-400" />
              </div>
              <div>
                <h4 className="text-lg font-black mb-1">{t("pages.agenda.access.car.title")}</h4>
                <p className="text-white/50 text-sm leading-relaxed" style={{ whiteSpace: "pre-line" }}>
                  {t("pages.agenda.access.car.desc")}
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="bg-purple-500/10 p-4 rounded-[24px] shrink-0">
                <MapPin className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h4 className="text-lg font-black mb-1">{t("pages.agenda.access.address.title")}</h4>
                <p className="text-white/50 text-sm leading-relaxed">
                  {t("pages.agenda.access.address.desc")}
                </p>
              </div>
            </div>
          </div>

          <div className="aspect-video w-full rounded-[32px] overflow-hidden border border-white/10 relative group">
            <ImageWithFallback
              src={imgMap}
              alt={t("pages.agenda.access.mapAlt")}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          </div>
        </section>

        {/* Workshops Section */}
        <section>
          <div className="flex items-center gap-3 mb-8 border-b-2 border-pink-500/50 pb-4 inline-flex">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <Sparkles className="w-6 h-6 text-pink-500" />
            </motion.div>
            <h3 className="text-2xl font-black uppercase tracking-tighter">{t("pages.agenda.workshopsSection.sectionTitle")}</h3>
          </div>

          <div className="bg-gradient-to-br from-white/10 to-transparent backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-3xl font-black uppercase tracking-tighter">
                {t("pages.agenda.workshopsSection.title")}<br />
                <span className="text-pink-500">{t("pages.agenda.workshopsSection.subtitle")}</span>
              </h4>
              <Users className="w-10 h-10 text-pink-500/30" />
            </div>

            <p className="text-white/50 text-xs uppercase tracking-widest mb-10 leading-relaxed">
              {t("pages.agenda.workshopsSection.desc")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workshopTimes.map((time, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 backdrop-blur-md border border-white/5 rounded-[24px] p-6 flex flex-col justify-between hover:bg-white/10 transition-colors duration-300"
                >
                  <div>
                    <span className="text-[#51A2FF] text-sm font-black mb-3 block">{time}</span>
                    <h5 className="text-lg font-black leading-tight mb-2 uppercase">{t(`pages.agenda.workshopsSection.items.${idx}.title`)}</h5>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">{t("pages.agenda.workshopsSection.coach")} : {workshopCoaches[idx]}</p>
                  </div>

                  <div className="mt-auto">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mb-4">
                      <span className="text-white/40">{t("pages.agenda.workshopsSection.availability")}</span>
                      <span className="text-[#51A2FF]">{t(`pages.agenda.workshopsSection.items.${idx}.capacity`)}</span>
                    </div>
                    <button className="w-full bg-white text-black font-black py-4 rounded-[24px] uppercase text-xs tracking-widest hover:bg-[#51A2FF] hover:text-white transition-all duration-300 cursor-pointer">
                      {t("pages.agenda.workshopsSection.reserve")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <FooterLayout></FooterLayout>
    </div>
  );
}
