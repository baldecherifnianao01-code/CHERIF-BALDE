import { useState } from 'react';
import { ArrowUpRight, Check, Lock, Share2 } from 'lucide-react';
import { isSafeExternalUrl, useApp } from '../context/AppContext.tsx';

export function Footer() {
  const { portfolio, navigate, t, lang, setLang, theme, toggleTheme } = useApp();
  const [copied, setCopied] = useState(false);

  const profile = portfolio?.profile;
  const year = new Date().getFullYear();

  const handleShare = async () => {
    const shareUrl = window.location.origin;
    const shareTitle = profile?.fullName
      ? `${profile.fullName} — ${lang === 'fr' ? profile.title : profile.titleEn}`
      : 'Cherif Balde — Portfolio';

    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url: shareUrl });
        return;
      } catch {
        // Fallback vers le presse-papiers
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignore clipboard failure
    }
  };

  const pageLinks = [
    { label: t.nav.home, path: '/' },
    { label: t.nav.about, path: '/a-propos' },
    { label: t.nav.education, path: '/parcours' },
    { label: lang === 'fr' ? 'Compétences' : 'Skills', path: '/competences' },
    { label: t.nav.projects, path: '/projets' },
    { label: lang === 'fr' ? 'Expériences' : 'Experience', path: '/experiences' },
    { label: lang === 'fr' ? 'Langues' : 'Languages', path: '/langues' },
    { label: lang === 'fr' ? 'Objectifs' : 'Objectives', path: '/objectifs' },
    { label: lang === 'fr' ? "Centres d'intérêt" : 'Interests', path: '/centres-interet' },
    { label: t.nav.gallery, path: '/galerie' },
    { label: t.nav.contact, path: '/contact' },
  ];

  const socialItems = [
    ...(profile?.githubUrl && isSafeExternalUrl(profile.githubUrl)
      ? [{ label: 'GitHub', url: profile.githubUrl }]
      : []),
    ...(profile?.linkedinUrl && isSafeExternalUrl(profile.linkedinUrl)
      ? [{ label: 'LinkedIn', url: profile.linkedinUrl }]
      : []),
    ...(profile?.tiktokUrl && isSafeExternalUrl(profile.tiktokUrl)
      ? [{ label: 'TikTok', url: profile.tiktokUrl }]
      : []),
    ...(profile?.otherSocials || []).filter((s) => isSafeExternalUrl(s.url)),
  ];

  return (
    <footer className="border-t border-zinc-200 dark:border-white/10 bg-white dark:bg-[#0E0E11] transition-colors duration-200">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-4 space-y-3">
            <div className="font-display text-2xl font-semibold text-[#0B0B0D] dark:text-white">
              {profile?.fullName || 'Cherif Balde'}
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {lang === 'fr' ? profile?.title : profile?.titleEn}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {lang === 'fr' ? profile?.location : profile?.locationEn}
              <span aria-hidden="true"> · </span>
              {profile?.website || 'https://cherifbalde.com'}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-white/15 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:border-[#C8A45D] transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-[#C8A45D]" /> : <Share2 className="h-3.5 w-3.5 text-[#C8A45D]" />}
                {copied ? t.hero.copied : t.hero.share}
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-white/15 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:border-[#C8A45D] transition-colors cursor-pointer"
              >
                {theme === 'dark' ? t.footer.themeLight : t.footer.themeDark}
              </button>
              <button
                type="button"
                onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                className="inline-flex items-center rounded-lg border border-zinc-200 dark:border-white/15 px-2.5 py-1.5 text-xs font-mono font-medium text-zinc-700 dark:text-zinc-200 hover:border-[#C8A45D] transition-colors cursor-pointer"
              >
                {lang === 'fr' ? 'EN' : 'FR'}
              </button>
            </div>
          </div>

          <div className="md:col-span-5">
            <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-4">
              {lang === 'fr' ? 'Navigation du portfolio' : 'Portfolio Navigation'}
            </h3>
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
              {pageLinks.map((item) => (
                <li key={item.path}>
                  <button
                    type="button"
                    onClick={() => navigate(item.path)}
                    className="text-zinc-600 dark:text-zinc-400 hover:text-[#9E7B34] dark:hover:text-[#C8A45D] transition-colors cursor-pointer text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              {lang === 'fr' ? 'Réseaux & Contact' : 'Networks & Contact'}
            </h3>
            <div className="flex flex-col gap-2 text-sm">
              <a
                href={`mailto:${profile?.email || 'baldecherifnianao01@gmail.com'}`}
                className="text-zinc-700 dark:text-zinc-300 hover:text-[#C8A45D] transition-colors truncate"
              >
                {profile?.email || 'baldecherifnianao01@gmail.com'}
              </a>
              {socialItems.map((s) => (
                <a
                  key={s.label + s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-zinc-600 dark:text-zinc-400 hover:text-[#C8A45D] transition-colors"
                >
                  <span>{s.label}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-zinc-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <p>
            © {year} {profile?.fullName || 'Cherif Balde'}. {t.footer.rights}
          </p>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="inline-flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 hover:text-[#9E7B34] dark:hover:text-[#C8A45D] transition-colors cursor-pointer"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>{t.footer.adminLink}</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
