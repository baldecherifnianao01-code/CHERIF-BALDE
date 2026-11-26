import { useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export function Navbar() {
  const { currentPath, navigate, t, theme, toggleTheme, lang, setLang, portfolio } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: t.nav.home, path: '/' },
    { label: t.nav.about, path: '/a-propos' },
    { label: t.nav.education, path: '/parcours' },
    { label: t.nav.projects, path: '/projets' },
    { label: t.nav.gallery, path: '/galerie' },
  ];

  const handleNav = (path: string) => {
    setMobileOpen(false);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 dark:border-white/10 bg-[#FAF9F6]/90 dark:bg-[#0B0B0D]/90 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1 : Wordmark unique */}
        <button
          type="button"
          onClick={() => handleNav('/')}
          className="font-display text-xl font-semibold tracking-tight text-[#0B0B0D] dark:text-white whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A45D] rounded"
        >
          {portfolio?.profile.fullName || 'Cherif Balde'}
        </button>

        {/* Zone 2 : 5 liens concis sur une seule ligne */}
        <nav aria-label="Navigation principale" className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const active = currentPath === item.path;
            return (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNav(item.path)}
                className={`text-sm font-medium whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer pb-0.5 border-b focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A45D] rounded-t ${
                  active
                    ? 'text-[#9E7B34] dark:text-[#C8A45D] border-[#C8A45D]'
                    : 'text-zinc-600 dark:text-zinc-400 border-transparent hover:text-[#0B0B0D] dark:hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3 : 1 action principale (et bouton menu mobile sur petits écrans) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleNav('/contact')}
            className="hidden md:inline-flex items-center justify-center rounded-lg bg-[#0B0B0D] dark:bg-[#C8A45D] px-4 py-2 text-xs font-semibold text-white dark:text-[#0B0B0D] hover:bg-zinc-800 dark:hover:bg-[#D9B770] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A45D]"
          >
            {t.nav.cta}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 dark:border-white/15 text-[#0B0B0D] dark:text-white hover:border-[#C8A45D] transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Menu mobile responsive */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-200 dark:border-white/10 bg-[#FAF9F6] dark:bg-[#0B0B0D] px-6 py-5">
          <nav className="grid grid-cols-2 gap-3" aria-label="Menu mobile">
            {[
              ...navItems,
              { label: lang === 'fr' ? 'Compétences' : 'Skills', path: '/competences' },
              { label: lang === 'fr' ? 'Expériences' : 'Experience', path: '/experiences' },
              { label: lang === 'fr' ? 'Langues' : 'Languages', path: '/langues' },
              { label: lang === 'fr' ? 'Objectifs' : 'Objectives', path: '/objectifs' },
              { label: lang === 'fr' ? "Centres d'intérêt" : 'Interests', path: '/centres-interet' },
              { label: t.nav.contact, path: '/contact' },
            ].map((item) => (
              <button
                key={item.path}
                type="button"
                onClick={() => handleNav(item.path)}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  currentPath === item.path
                    ? 'bg-[#C8A45D]/15 text-[#9E7B34] dark:text-[#C8A45D]'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-white/10 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-zinc-200 dark:border-white/15 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-[#C8A45D]" /> : <Moon className="h-4 w-4 text-[#9E7B34]" />}
              {theme === 'dark' ? t.footer.themeLight : t.footer.themeDark}
            </button>

            <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-200/70 dark:bg-white/10">
              <button
                type="button"
                onClick={() => setLang('fr')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer ${
                  lang === 'fr' ? 'bg-white dark:bg-[#0B0B0D] text-[#0B0B0D] dark:text-white' : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer ${
                  lang === 'en' ? 'bg-white dark:bg-[#0B0B0D] text-[#0B0B0D] dark:text-white' : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
