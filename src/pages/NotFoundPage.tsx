import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export function NotFoundPage() {
  const { navigate, t } = useApp();

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-mono text-sm font-medium text-[#9E7B34] dark:text-[#C8A45D]">
        {t.notFound.code}
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold text-[#0B0B0D] dark:text-white sm:text-5xl">
        {t.notFound.title}
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {t.notFound.description}
      </p>
      <button
        type="button"
        onClick={() => navigate('/')}
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#0B0B0D] dark:bg-[#C8A45D] px-5 py-2.5 text-sm font-semibold text-white dark:text-[#0B0B0D] hover:opacity-90 transition-opacity cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{t.notFound.backHome}</span>
      </button>
    </main>
  );
}
