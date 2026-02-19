import { motion } from "motion/react";
import { Facebook, Instagram, Youtube, Twitter, Send } from "lucide-react";

export function LandingFooter() {
  const socialLinks = [
    { icon: Facebook, href: "#" },
    { icon: Instagram, href: "#" },
    { icon: Youtube, href: "#" },
    { icon: Twitter, href: "#" }
  ];

  return (
    <footer className="py-24 px-6 md:px-12 bg-black border-t border-white/5 overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-start mb-24">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 flex flex-col gap-10">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black uppercase tracking-tighter text-white">MARS</span>
              <span className="text-4xl font-black uppercase tracking-tighter text-[#ad46ff]">AI</span>
            </div>
            <p className="text-white text-[18px] font-medium leading-relaxed max-w-[320px] italic">
              "La plateforme mondiale de la narration générative, ancrée dans la lumière de Marseille."
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, i) => (
                <button 
                  key={i} 
                  className="w-12 h-12 rounded-full bg-white/[0.05] border border-white flex items-center justify-center hover:bg-white hover:border-white transition-all group"
                >
                  <social.icon className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                </button>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-8">
            <div className="flex flex-col gap-10">
              <span className="text-[11px] font-black tracking-[0.4em] text-[#ad46ff] uppercase">Navigation</span>
              <ul className="flex flex-col gap-5">
                {["Galerie", "Programme", "Top 50", "Billetterie"].map((link, j) => (
                  <li key={j}>
                    <button className="text-[16px] text-white hover:text-white transition-colors">{link}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-10">
              <span className="text-[11px] font-black tracking-[0.4em] text-[#ad46ff] uppercase">Légal</span>
              <ul className="flex flex-col gap-5">
                {["Partenaires", "FAQ", "Contact"].map((link, j) => (
                  <li key={j}>
                    <button className="text-[16px] text-white hover:text-white transition-colors">{link}</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-4">
            <div className="bg-[#0d0d0d] border border-white rounded-[32px] p-10 md:p-12 relative overflow-hidden group">
              {/* Decorative Glow */}
              <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-[#ad46ff]/10 blur-[80px] rounded-full pointer-events-none" />
              
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-8 relative z-10">
                RESTEZ<br />CONNECTÉ
              </h3>
              
              <div className="flex gap-3 relative z-10">
                <div className="flex-1 relative">
                  <input 
                    type="email" 
                    placeholder="Email Signal" 
                    className="w-full h-14 bg-white/[0.03] border border-white rounded-xl px-6 text-sm focus:outline-none focus:border-white transition-all placeholder:text-white"
                  />
                </div>
                <button className="h-14 px-6 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-xl hover:bg-[#ad46ff] hover:text-white transition-all active:scale-95">
                  OK
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 pt-12 border-t border-white/5">
          <div className="flex items-center gap- text-[10px] font-pink tracking-[0.3em] text-white uppercase">
            <span>© 2026 MARS.A.I PROTOCOL</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
            <span>MARSEILLE HUB</span>
          </div>
          
          <div className="flex items-center gap-12 text-[10px] font-black tracking-[0.3em] text-white uppercase">
            <span className="text-white">DESIGN SYSTÈME CYBER-PREMIUM</span>
            <span className="text-white">LÉGAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}