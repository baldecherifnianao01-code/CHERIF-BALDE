import { ArrowRight, Download, Mail, MapPin } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { PhotoFrame } from '../PhotoFrame.tsx';

export function HeroSection() {
  const { portfolio, lang, t, navigate } = useApp();
  if (!portfolio) return null;

  const { profile, gallery } = portfolio;
  const heroPhoto = gallery.find((p) => p.id === profile.heroPhotoId) || gallery[0] || null;

  const title = lang === 'fr' ? profile.title : profile.titleEn;
  const tagline = lang === 'fr' ? profile.tagline : profile.taglineEn;
  const shortBio = lang === 'fr' ? profile.shortBio : profile.shortBioEn;
  const location = lang === 'fr' ? profile.location : profile.locationEn;
  const availability = lang === 'fr' ? profile.availability : profile.availabilityEn;
  const eyebrow = lang === 'fr' ? profile.siteTexts.heroEyebrow : profile.siteTexts.heroEyebrowEn;

  return (
    <section className="relative overflow-hidden border-b border-zinc-200 dark:border-white/10">
      {/* Arrière-plan discret architectural */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(200,164,93,0.12),transparent_55%)]"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-12">
          {/* Colonne gauche : Typographie & Actions */}
          <div className="flex flex-col justify-center lg:col-span-7">
            <p className="text-xs font-medium tracking-wide text-[#9E7B34] dark:text-[#C8A45D]">
              {eyebrow}
              <span aria-hidden="true"> · </span>
              {location}
            </p>

            <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight text-[#0B0B0D] dark:text-white sm:text-6xl lg:text-7xl [text-wrap:balance]">
              {profile.fullName}
            </h1>

            <p className="mt-3 text-lg font-medium text-zinc-700 dark:text-zinc-200 sm:text-xl">
              {title}
            </p>

            <blockquote className="mt-6 max-w-2xl font-display text-2xl italic leading-snug text-[#9E7B34] dark:text-[#C8A45D] sm:text-3xl">
              « {tagline} »
            </blockquote>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
              {shortBio}
            </p>

            {/* Boutons principaux demandés : Découvrir mon parcours, Me contacter, Télécharger mon CV */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/parcours')}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0B0B0D] dark:bg-[#C8A45D] px-5 py-3 text-sm font-semibold text-white dark:text-[#0B0B0D] hover:bg-zinc-800 dark:hover:bg-[#D9B770] transition-colors duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A45D]"
              >
                <span>{t.hero.discover}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-white/20 bg-white dark:bg-transparent px-5 py-3 text-sm font-medium text-[#0B0B0D] dark:text-white hover:border-[#C8A45D] dark:hover:border-[#C8A45D] transition-colors duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A45D]"
              >
                <Mail className="h-4 w-4 text-[#C8A45D]" />
                <span>{t.hero.contact}</span>
              </button>

              <a
                href="/api/cv/download"
                download="CV-Cherif-Balde.pdf"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-white/10 px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:border-[#C8A45D] hover:text-[#0B0B0D] dark:hover:text-white transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A45D]"
              >
                <Download className="h-4 w-4 text-[#C8A45D]" />
                <span>{t.hero.downloadCv}</span>
              </a>
            </div>
          </div>

          {/* Colonne droite : Grande photographie professionnelle */}
          <div className="lg:col-span-5">
            <PhotoFrame
              src={heroPhoto?.url}
              alt={`${profile.fullName} — ${title}`}
              aspectClass="aspect-[4/5] lg:h-full lg:min-h-[460px]"
              showAdminShortcut
            />
          </div>
        </div>

        {/* Bandeau d'informations clés pleine largeur sous le hero */}
        <div className="mt-14 grid grid-cols-1 gap-6 border-t border-zinc-200 dark:border-white/10 pt-8 sm:grid-cols-3">
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {lang === 'fr' ? 'Localisation actuelle' : 'Current Location'}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[#0B0B0D] dark:text-white">
              <MapPin className="h-4 w-4 text-[#C8A45D] shrink-0" />
              <span>{location}</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {lang === 'fr' ? 'Disponibilité' : 'Availability'}
            </p>
            <p className="mt-1 text-sm font-medium text-[#0B0B0D] dark:text-white">
              {availability}
            </p>
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {lang === 'fr' ? 'Domaine officiel' : 'Official Domain'}
            </p>
            <p className="mt-1 font-mono text-sm font-medium text-[#9E7B34] dark:text-[#C8A45D]">
              {profile.website.replace(/^https?:\/\//, '')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
