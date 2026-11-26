import { Briefcase, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext.tsx';

export function ExperienceSection() {
  const { portfolio, lang, t } = useApp();
  if (!portfolio) return null;

  const heading =
    lang === 'fr'
      ? portfolio.profile.siteTexts.experienceHeading
      : portfolio.profile.siteTexts.experienceHeadingEn;

  return (
    <section id="experiences" className="border-b border-zinc-200 dark:border-white/10 py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-wide text-[#9E7B34] dark:text-[#C8A45D]">
            {t.experience.eyebrow}
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#0B0B0D] dark:text-white sm:text-4xl [text-wrap:balance]">
            {heading}
          </h2>
        </div>

        <div className="mt-12 space-y-6">
          {portfolio.experiences.map((exp, idx) => {
            const role = lang === 'fr' ? exp.role : exp.roleEn;
            const department = lang === 'fr' ? exp.department : exp.departmentEn;
            const responsibilities = lang === 'fr' ? exp.responsibilities : exp.responsibilitiesEn;
            const softSkills = lang === 'fr' ? exp.softSkills : exp.softSkillsEn;

            return (
              <motion.article
                key={exp.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#131317] p-8"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between pb-6 border-b border-zinc-100 dark:border-white/10">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#C8A45D]/40 bg-[#C8A45D]/10">
                      <Briefcase className="h-5 w-5 text-[#C8A45D]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#0B0B0D] dark:text-white">
                        {role}
                      </h3>
                      <p className="mt-1 text-sm text-[#9E7B34] dark:text-[#C8A45D] font-medium">
                        {department}
                        <span aria-hidden="true"> · </span>
                        {exp.location}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                    {exp.period}
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
                  <div className="lg:col-span-7">
                    <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-3">
                      {t.experience.responsibilitiesTitle}
                    </h4>
                    <ul className="space-y-2.5 text-sm text-zinc-700 dark:text-zinc-300">
                      {responsibilities.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-[#C8A45D] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="lg:col-span-5">
                    <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-3">
                      {t.experience.softSkillsTitle}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-zinc-700 dark:text-zinc-300">
                      {softSkills.map((skill, i) => (
                        <div key={i} className="py-1 border-b border-zinc-100 dark:border-white/5">
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
