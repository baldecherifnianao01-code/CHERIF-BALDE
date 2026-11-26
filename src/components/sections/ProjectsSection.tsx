import { useState } from 'react';
import { ExternalLink, FolderKanban, Github } from 'lucide-react';
import { motion } from 'motion/react';
import { isSafeExternalUrl, useApp } from '../../context/AppContext.tsx';
import type { ProjectStatus } from '../../types/portfolio.ts';

export function ProjectsSection() {
  const { portfolio, lang, t } = useApp();
  const [filter, setFilter] = useState<'all' | ProjectStatus>('all');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  if (!portfolio) return null;

  const heading =
    lang === 'fr'
      ? portfolio.profile.siteTexts.projectsHeading
      : portfolio.profile.siteTexts.projectsHeadingEn;

  const filtered =
    filter === 'all'
      ? portfolio.projects
      : portfolio.projects.filter((p) => p.status === filter);

  const filterButtons: Array<{ key: 'all' | ProjectStatus; label: string }> = [
    { key: 'all', label: t.projects.filters.all },
    { key: 'concept', label: t.projects.filters.concept },
    { key: 'completed', label: t.projects.filters.completed },
    { key: 'upcoming', label: t.projects.filters.upcoming },
  ];

  return (
    <section id="projets" className="border-b border-zinc-200 dark:border-white/10 py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-wide text-[#9E7B34] dark:text-[#C8A45D]">
              {t.projects.eyebrow}
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#0B0B0D] dark:text-white sm:text-4xl [text-wrap:balance]">
              {heading}
            </h2>
          </div>

          {/* Contrôles de filtre interactifs */}
          <div className="inline-flex flex-wrap items-center gap-1 rounded-lg bg-zinc-200/70 dark:bg-white/5 p-1 self-start">
            {filterButtons.map((btn) => (
              <button
                key={btn.key}
                type="button"
                onClick={() => setFilter(btn.key)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  filter === btn.key
                    ? 'bg-white dark:bg-[#18181D] text-[#0B0B0D] dark:text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-[#0B0B0D] dark:hover:text-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, idx) => {
            const title = lang === 'fr' ? project.title : project.titleEn;
            const description = lang === 'fr' ? project.description : project.descriptionEn;
            const statusText = t.projects.statusLabels[project.status];
            const hasProjectUrl = isSafeExternalUrl(project.projectUrl);
            const hasGithubUrl = isSafeExternalUrl(project.githubUrl);
            const showImage = Boolean(project.imageUrl) && !failedImages[project.id];

            return (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.35, delay: idx * 0.04 }}
                className="flex flex-col overflow-hidden rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#131317] transition-colors hover:border-[#C8A45D]/50"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100 dark:bg-[#1A1A20]">
                  {showImage ? (
                    <img
                      src={project.imageUrl}
                      alt={title}
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedImages((prev) => ({ ...prev, [project.id]: true }))
                      }
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-zinc-100 to-zinc-200/70 dark:from-[#16161B] dark:to-[#0F0F13]">
                      <FolderKanban className="h-8 w-8 text-[#C8A45D] mb-3" />
                      <span className="font-display text-xl font-semibold text-[#0B0B0D] dark:text-white">
                        {title}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <div className="text-xs text-[#9E7B34] dark:text-[#C8A45D] font-medium">
                    {statusText}
                  </div>

                  <h3 className="mt-1.5 font-display text-2xl font-semibold text-[#0B0B0D] dark:text-white">
                    {title}
                  </h3>

                  <p className="mt-2.5 flex-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {description}
                  </p>

                  {/* Technologies en texte sobre séparé par · (zéro pilules statiques) */}
                  <p className="mt-4 pt-4 border-t border-zinc-100 dark:border-white/10 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                    {project.technologies.join(' · ')}
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-2.5">
                    {hasProjectUrl ? (
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B0B0D] dark:bg-[#C8A45D] px-3.5 py-2 text-xs font-semibold text-white dark:text-[#0B0B0D] hover:opacity-90 transition-opacity whitespace-nowrap"
                      >
                        <span>{t.projects.viewProject}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-white/10 px-3.5 py-2 text-xs font-medium text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                        {t.projects.viewProject} · {t.projects.linkUnavailable}
                      </span>
                    )}

                    {hasGithubUrl ? (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 dark:border-white/15 px-3.5 py-2 text-xs font-medium text-[#0B0B0D] dark:text-white hover:border-[#C8A45D] transition-colors whitespace-nowrap"
                      >
                        <Github className="h-3.5 w-3.5" />
                        <span>{t.projects.viewGithub}</span>
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-white/10 px-3 py-2 text-xs font-medium text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                        <Github className="h-3.5 w-3.5" />
                        <span>GitHub</span>
                      </span>
                    )}
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
