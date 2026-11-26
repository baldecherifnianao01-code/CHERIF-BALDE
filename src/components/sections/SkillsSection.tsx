import { Code2, Palette, Wrench } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext.tsx';
import type { SkillCategory } from '../../types/portfolio.ts';

export function SkillsSection() {
  const { portfolio, lang, t } = useApp();
  if (!portfolio) return null;

  const heading =
    lang === 'fr'
      ? portfolio.profile.siteTexts.skillsHeading
      : portfolio.profile.siteTexts.skillsHeadingEn;

  const categories: Array<{ key: SkillCategory; label: string; icon: typeof Code2 }> = [
    { key: 'web', label: t.skills.categories.web, icon: Code2 },
    { key: 'multimedia', label: t.skills.categories.multimedia, icon: Palette },
    { key: 'tools', label: t.skills.categories.tools, icon: Wrench },
  ];

  return (
    <section id="competences" className="border-b border-zinc-200 dark:border-white/10 py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-wide text-[#9E7B34] dark:text-[#C8A45D]">
            {t.skills.eyebrow}
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#0B0B0D] dark:text-white sm:text-4xl [text-wrap:balance]">
            {heading}
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {categories.map(({ key, label, icon: Icon }, groupIdx) => {
            const items = portfolio.skills.filter((s) => s.category === key);
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.35, delay: groupIdx * 0.05 }}
                className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#131317] p-6"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-white/10">
                  <Icon className="h-5 w-5 text-[#C8A45D] shrink-0" />
                  <h3 className="text-base font-semibold text-[#0B0B0D] dark:text-white">
                    {label}
                  </h3>
                </div>

                <ul className="mt-5 space-y-4">
                  {items.map((skill) => {
                    const skillName = lang === 'fr' ? skill.name : skill.nameEn;
                    const customLabel = lang === 'fr' ? skill.levelLabel : skill.levelLabelEn;
                    const hasNumericLevel =
                      typeof skill.level === 'number' && skill.level >= 0 && skill.level <= 100;

                    return (
                      <li key={skill.id} className="space-y-1.5">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                            {skillName}
                          </span>
                          {hasNumericLevel ? (
                            <span className="font-mono text-xs text-[#9E7B34] dark:text-[#C8A45D] shrink-0">
                              {customLabel ? `${customLabel} · ${skill.level}%` : `${skill.level}%`}
                            </span>
                          ) : customLabel ? (
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                              {customLabel}
                            </span>
                          ) : null}
                        </div>

                        {hasNumericLevel ? (
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-white/10">
                            <div
                              className="h-full rounded-full bg-[#C8A45D] transition-all duration-300"
                              style={{ width: `${skill.level}%` }}
                            />
                          </div>
                        ) : (
                          <div className="h-px w-full bg-zinc-100 dark:bg-white/5" />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
