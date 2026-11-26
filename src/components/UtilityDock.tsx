import { useEffect, useState } from 'react';
import { ArrowUp, Moon, Sun } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export function UtilityDock() {
  const { theme, toggleTheme, lang, setLang, t, currentPath } = useApp();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 360);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (currentPath === '/admin') return null;

  return (
    <div className="fixed bottom-5 right-5 z-30 hidden sm:flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-white/15 bg-white/90 dark:bg-[#141418]/90 px-2 py-1.5 backdrop-blur-md shadow-lg">
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? t.footer.themeLight : t.footer.themeDark}
        title={theme === 'dark' ? t.footer.themeLight : t.footer.themeDark}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
      >
        {theme === 'dark' ? (
          <Sun className="h-4 w-4 text-[#C8A45D]" />
        ) : (
          <Moon className="h-4 w-4 text-[#9E7B34]" />
        )}
      </button>

      <button
        type="button"
        onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
        aria-label={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
        className="inline-flex h-8 px-2 items-center justify-center rounded-lg font-mono text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
      >
        {lang === 'fr' ? 'EN' : 'FR'}
      </button>

      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label={t.footer.backToTop}
          title={t.footer.backToTop}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B0B0D] dark:bg-[#C8A45D] text-white dark:text-[#0B0B0D] hover:opacity-90 transition-opacity cursor-pointer"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
