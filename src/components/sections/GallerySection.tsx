import { useEffect, useState } from 'react';
import { Camera, Maximize2, X } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import type { GalleryCategory, GalleryPhoto } from '../../types/portfolio.ts';

export function GallerySection() {
  const { portfolio, lang, t, navigate } = useApp();
  const [category, setCategory] = useState<'all' | GalleryCategory>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPhoto(null);
    };
    if (selectedPhoto) {
      window.addEventListener('keydown', onKeyDown);
    }
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedPhoto]);

  if (!portfolio) return null;

  const { profile, gallery } = portfolio;
  const heading =
    lang === 'fr' ? profile.siteTexts.galleryHeading : profile.siteTexts.galleryHeadingEn;

  const filtered =
    category === 'all' ? gallery : gallery.filter((photo) => photo.category === category);

  const categoryButtons: Array<{ key: 'all' | GalleryCategory; label: string }> = [
    { key: 'all', label: t.gallery.categories.all },
    { key: 'portrait', label: t.gallery.categories.portrait },
    { key: 'professional', label: t.gallery.categories.professional },
    { key: 'workspace', label: t.gallery.categories.workspace },
    { key: 'presentation', label: t.gallery.categories.presentation },
    { key: 'event', label: t.gallery.categories.event },
    { key: 'other', label: t.gallery.categories.other },
  ];

  return (
    <section id="galerie" className="border-b border-zinc-200 dark:border-white/10 py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-wide text-[#9E7B34] dark:text-[#C8A45D]">
              {t.gallery.eyebrow}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#0B0B0D] dark:text-white sm:text-4xl [text-wrap:balance]">
              {heading}
            </h2>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
              {t.gallery.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-white/15 px-4 py-2 text-xs font-medium text-[#0B0B0D] dark:text-white hover:border-[#C8A45D] transition-colors self-start cursor-pointer whitespace-nowrap"
          >
            <Camera className="h-3.5 w-3.5 text-[#C8A45D]" />
            <span>{t.gallery.openAdmin}</span>
          </button>
        </div>

        {gallery.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center gap-1.5 rounded-lg bg-zinc-200/70 dark:bg-white/5 p-1 w-fit">
            {categoryButtons.map((btn) => (
              <button
                key={btn.key}
                type="button"
                onClick={() => setCategory(btn.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  category === btn.key
                    ? 'bg-white dark:bg-[#18181D] text-[#0B0B0D] dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-[#0B0B0D] dark:hover:text-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="mt-12 rounded-xl border border-dashed border-zinc-300 dark:border-white/15 bg-white dark:bg-[#131317] p-12 text-center">
            <Camera className="mx-auto h-10 w-10 text-[#C8A45D]" />
            <h3 className="mt-4 text-base font-semibold text-[#0B0B0D] dark:text-white">
              {t.gallery.emptyTitle}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
              {t.gallery.emptyDesc}
            </p>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0B0B0D] dark:bg-[#C8A45D] px-5 py-2.5 text-xs font-semibold text-white dark:text-[#0B0B0D] hover:opacity-90 transition-opacity cursor-pointer"
            >
              <span>{t.gallery.openAdmin}</span>
            </button>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((photo) => {
              const caption = lang === 'fr' ? photo.caption : photo.captionEn || photo.caption;
              const isHero = profile.heroPhotoId === photo.id;
              const isAbout = profile.aboutPhotoId === photo.id;
              const categoryLabel = t.gallery.categories[photo.category];

              return (
                <figure
                  key={photo.id}
                  className="group overflow-hidden rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#131317]"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(photo)}
                    className="relative block aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-[#1A1A20] cursor-pointer text-left"
                  >
                    <img
                      src={photo.url}
                      alt={caption || categoryLabel}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <span className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <Maximize2 className="h-4 w-4" />
                    </span>
                  </button>

                  <figcaption className="p-4 space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                      <span>{categoryLabel}</span>
                      {isHero && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#9E7B34] dark:text-[#C8A45D] font-medium">
                            {t.gallery.heroTag}
                          </span>
                        </>
                      )}
                      {isAbout && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#9E7B34] dark:text-[#C8A45D] font-medium">
                            {t.gallery.aboutTag}
                          </span>
                        </>
                      )}
                    </div>
                    {caption && (
                      <p className="text-sm font-medium text-[#0B0B0D] dark:text-white">
                        {caption}
                      </p>
                    )}
                  </figcaption>
                </figure>
              );
            })}
          </div>
        )}
      </div>

      {/* Visionneuse plein écran */}
      {selectedPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedPhoto(null)}
            aria-label="Fermer"
            className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className="max-h-[90vh] max-w-4xl overflow-hidden rounded-xl bg-[#0E0E11] border border-white/15"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.caption || 'Photo'}
              referrerPolicy="no-referrer"
              className="max-h-[78vh] w-auto object-contain mx-auto"
            />
            {(selectedPhoto.caption || selectedPhoto.captionEn) && (
              <div className="border-t border-white/10 px-6 py-4 text-sm text-zinc-200">
                {lang === 'fr'
                  ? selectedPhoto.caption
                  : selectedPhoto.captionEn || selectedPhoto.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
