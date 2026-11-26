import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext.tsx';

export function ObjectivesSection() {
  const { portfolio, lang, t } = useApp();
  if (!portfolio) return null;

  const { objectives } = portfolio;
  const title = lang === 'fr' ? objectives.title : objectives.titleEn;
  const quote = lang === 'fr' ? objectives.quote : objectives.quoteEn;
  const items = lang === 'fr' ? objectives.items : objectives.itemsEn;

  return (
    <section id="objectifs" className="border-b border-zinc-200 dark:border-white/10 py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium tracking-wide text-[#9E7B34] dark:text-[#C8A45D]">
              {t.objectives.eyebrow}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#0B0B0D] dark:text-white sm:text-4xl [text-wrap:balance]">
              {title}
            </h2>

            <blockquote className="mt-8 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#131317] p-6">
              <p className="font-display text-2xl italic leading-snug text-[#9E7B34] dark:text-[#C8A45D]">
                « {quote} »
              </p>
            </blockquote>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {items.map((ambition, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#131317] p-5"
              >
                <div className="space-y-1.5">
                  <span className="font-mono text-xs text-[#9E7B34] dark:text-[#C8A45D]">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <p className="text-sm font-medium leading-relaxed text-zinc-800 dark:text-zinc-200">
                    {ambition}
                  </p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-zinc-400 shrink-0 mt-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
