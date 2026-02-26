import { useTranslation } from 'react-i18next';

export default function FooterLayout() {
      const { t } = useTranslation();
    
    
    return (
          <footer className="bg-black text-white pt-20 md:pt-32 pb-12 md:pb-16 border-t border-white/5 px-4 md:px-6">
        <div className="w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 mb-20 md:mb-32">
            <div className="md:col-span-5 flex flex-col gap-8 md:gap-10">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl md:text-4xl font-black uppercase tracking-tight">MARS</span>
                <span className="text-3xl md:text-4xl font-black uppercase tracking-tight text-purple-500">AI</span>
              </div>
              <p className="text-white/30 text-base md:text-lg font-light leading-relaxed max-w-sm italic">
                {t('pages.landing.footer.tagline')}
              </p>
            </div>

            <div className="md:col-span-3 flex flex-col gap-6 md:gap-8">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-500">{t('pages.landing.footer.nav')}</span>
              <ul className="space-y-3 md:space-y-4 font-bold text-white/40 text-sm uppercase tracking-[0.14em]">
                <li><button onClick={() => onNavigate('home')} className="hover:text-white transition-colors">{t('pages.landing.footer.gallery')}</button></li>
                <li><button onClick={() => onNavigate('agenda')} className="hover:text-white transition-colors">{t('pages.landing.footer.program')}</button></li>
                <li><button onClick={() => onNavigate('competition')} className="hover:text-white transition-colors">{t('pages.landing.footer.top50')}</button></li>
                <li><button onClick={() => onNavigate('ticket')} className="hover:text-white transition-colors">{t('pages.landing.footer.ticketing')}</button></li>
              </ul>
            </div>

            <div className="md:col-span-4 flex flex-col gap-8 md:gap-10">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[32px] md:rounded-[40px]">
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-4 md:mb-6 leading-none">
                  {t('pages.landing.footer.newsletter')}
                </h3>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder={t('pages.landing.footer.email')}
                    className="bg-white/5 border border-white/10 rounded-2xl px-5 md:px-6 py-3 md:py-4 flex-1 text-sm focus:outline-none focus:border-purple-500 transition-colors placeholder:text-white/20"
                  />
                  <button className="bg-white text-black px-5 md:px-6 py-3 md:py-4 rounded-2xl font-black uppercase text-xs tracking-[0.14em] hover:bg-purple-500 hover:text-white transition-all">
                    {t('pages.landing.footer.ok')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-12 md:pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 opacity-20 text-[10px] font-black uppercase tracking-[0.3em]">
            <span className="text-center md:text-left">{t('pages.landing.footer.copyright')}</span>
            <div className="flex flex-wrap gap-6 md:gap-12 justify-center">
              <span>{t('pages.landing.footer.design')}</span>
              <span>{t('pages.landing.footer.legal')}</span>
            </div>
          </div>
        </div>
      </footer>
    );
}