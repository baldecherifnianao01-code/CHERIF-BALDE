import {
  Activity,
  BookOpen,
  Compass,
  Cpu,
  Film,
  Globe,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext.tsx';

const ICON_MAP: Record<string, LucideIcon> = {
  Cpu,
  Compass,
  Activity,
  Globe,
  BookOpen,
  Film,
  Sparkles,
};

export function InterestsSection() {
  const { portfolio, lang, t } = useApp();
  if (!portfolio) return null;

  const heading =
    lang === 'fr'
      ? portfolio.profile.siteTexts.interestsHeading
      : portfolio.profile.siteTexts.interestsHeadingEn;

  return (
    <section
      id="centres-interet"
      className="border-b border-zinc-200 dark:border-white/10 py-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-wide text-[#9E7B34] dark:text-[#C8A45D]">
            {t.interests.eyebrow}
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#0B0B0D] dark:text-white sm:text-4xl [text-wrap:balance]">
            {heading}
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {portfolio.interests.map((item, idx) => {
            const Icon = ICON_MAP[item.icon] || Compass;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="flex items-center gap-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#131317] p-5 transition-colors hover:border-[#C8A45D]/50"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#C8A45D]/10 border border-[#C8A45D]/30">
                  <Icon className="h-5 w-5 text-[#9E7B34] dark:text-[#C8A45D]" />
                </div>
                <span className="text-sm font-medium text-[#0B0B0D] dark:text-white">
                  {lang === 'fr' ? item.label : item.labelEn}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
