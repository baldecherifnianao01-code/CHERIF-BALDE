import { Languages } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext.tsx';

export function LanguagesSection() {
  const { portfolio, lang, t } = useApp();
  if (!portfolio) return null;

  const heading =
    lang === 'fr'
      ? portfolio.profile.siteTexts.languagesHeading
      : portfolio.profile.siteTexts.languagesHeadingEn;

  return (
    <section id="langues" className="border-b border-zinc-200 dark:border-white/10 py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-wide text-[#9E7B34] dark:text-[#C8A45D]">
            {t.languages.eyebrow}
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#0B0B0D] dark:text-white sm:text-4xl [text-wrap:balance]">
            {heading}
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {portfolio.languages.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#131317] p-6 transition-colors hover:border-[#C8A45D]/50"
            >
              <Languages className="h-5 w-5 text-[#C8A45D]" />
              <h3 className="mt-4 text-lg font-semibold text-[#0B0B0D] dark:text-white">
                {lang === 'fr' ? item.name : item.nameEn}
              </h3>
              <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                {lang === 'fr' ? item.proficiency : item.proficiencyEn}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
