import { Award, ExternalLink, GraduationCap } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext.tsx';

export function EducationSection() {
  const { portfolio, lang, t } = useApp();
  if (!portfolio) return null;

  const heading =
    lang === 'fr'
      ? portfolio.profile.siteTexts.educationHeading
      : portfolio.profile.siteTexts.educationHeadingEn;

  const completed = portfolio.education.filter((e) => e.status === 'completed');
  const planned = portfolio.education.filter((e) => e.status === 'planned');

  return (
    <section id="parcours" className="border-b border-zinc-200 dark:border-white/10 py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-wide text-[#9E7B34] dark:text-[#C8A45D]">
            {t.education.eyebrow}
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#0B0B0D] dark:text-white sm:text-4xl [text-wrap:balance]">
            {heading}
          </h2>
        </div>

        {/* Diplômes obtenus et parcours validé */}
        <div className="mt-12 relative">
          <div
            aria-hidden="true"
            className="absolute left-3.5 top-2 bottom-2 w-px bg-zinc-200 dark:bg-white/10 hidden sm:block"
          />

          <div className="space-y-6">
            {completed.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.35, delay: idx * 0.04 }}
                className="relative sm:pl-12"
              >
                <span
                  aria-hidden="true"
                  className="hidden sm:flex absolute left-0 top-6 h-7 w-7 items-center justify-center rounded-full border border-[#C8A45D] bg-[#FAF9F6] dark:bg-[#0B0B0D]"
                >
                  <GraduationCap className="h-3.5 w-3.5 text-[#C8A45D]" />
                </span>

                <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#131317] p-6 transition-colors hover:border-[#C8A45D]/50">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-mono font-medium text-[#9E7B34] dark:text-[#C8A45D]">
                      {item.period}
                    </span>
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {t.education.completedBadge}
                    </span>
                  </div>

                  <h3 className="mt-2 text-lg font-semibold text-[#0B0B0D] dark:text-white">
                    {lang === 'fr' ? item.title : item.titleEn}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {lang === 'fr' ? item.institution : item.institutionEn}
                  </p>

                  {item.certificateUrl && (
                    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-white/5">
                      <a
                        href={item.certificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-medium text-[#9E7B34] dark:text-[#C8A45D] hover:underline"
                      >
                        <Award className="h-3.5 w-3.5" />
                        <span>{item.certificateName || t.education.viewCertificate}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Distinction claire pour les formations envisagées */}
        {planned.length > 0 && (
          <div className="mt-12">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">
              {t.education.plannedBadge}
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {planned.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-dashed border-[#C8A45D]/50 bg-[#C8A45D]/[0.04] p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-mono font-medium text-[#9E7B34] dark:text-[#C8A45D]">
                      {item.period}
                    </span>
                    <span className="text-[#9E7B34] dark:text-[#C8A45D]">
                      {t.education.plannedBadge}
                    </span>
                  </div>
                  <h4 className="mt-2 text-lg font-semibold text-[#0B0B0D] dark:text-white">
                    {lang === 'fr' ? item.title : item.titleEn}
                  </h4>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {lang === 'fr' ? item.institution : item.institutionEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
