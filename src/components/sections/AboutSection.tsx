import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext.tsx';
import { PhotoFrame } from '../PhotoFrame.tsx';

export function AboutSection() {
  const { portfolio, lang, t } = useApp();
  if (!portfolio) return null;

  const { profile, gallery } = portfolio;
  const aboutPhoto =
    gallery.find((p) => p.id === profile.aboutPhotoId) ||
    gallery.find((p) => p.id !== profile.heroPhotoId) ||
    gallery[0] ||
    null;

  const heading = lang === 'fr' ? profile.siteTexts.aboutHeading : profile.siteTexts.aboutHeadingEn;
  const paragraphs = lang === 'fr' ? profile.aboutParagraphs : profile.aboutParagraphsEn;

  return (
    <section id="a-propos" className="border-b border-zinc-200 dark:border-white/10 py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12"
        >
          {/* Photographie professionnelle dédiée à la section À propos */}
          <div className="lg:col-span-5">
            <PhotoFrame
              src={aboutPhoto?.url}
              alt={`${profile.fullName} — ${heading}`}
              aspectClass="aspect-[4/5]"
              placeholderTitle={lang === 'fr' ? 'Portrait — À propos' : 'About Portrait'}
              placeholderHint={
                lang === 'fr'
                  ? 'Définissez une photo dédiée à la section À propos depuis la galerie administrateur.'
                  : 'Select a dedicated photo for the About section in the admin gallery.'
              }
            />
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div>
              <p className="text-xs font-medium tracking-wide text-[#9E7B34] dark:text-[#C8A45D]">
                {t.about.eyebrow}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#0B0B0D] dark:text-white sm:text-4xl [text-wrap:balance]">
                {heading}
              </h2>
            </div>

            <div className="space-y-4 text-base leading-relaxed text-zinc-700 dark:text-zinc-300">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 border-t border-zinc-200 dark:border-white/10 pt-6 sm:grid-cols-3 text-sm">
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.about.originLabel}</p>
                <p className="mt-1 font-medium text-[#0B0B0D] dark:text-white">
                  {t.about.originValue}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.about.residenceLabel}</p>
                <p className="mt-1 font-medium text-[#0B0B0D] dark:text-white">
                  {lang === 'fr' ? profile.location : profile.locationEn}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{t.about.websiteLabel}</p>
                <p className="mt-1 font-mono text-sm font-medium text-[#9E7B34] dark:text-[#C8A45D]">
                  cherifbalde.com
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
