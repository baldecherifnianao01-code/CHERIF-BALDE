import { useState } from 'react';
import { Camera } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

interface PhotoFrameProps {
  src?: string | null;
  alt: string;
  aspectClass?: string;
  placeholderTitle?: string;
  placeholderHint?: string;
  showAdminShortcut?: boolean;
}

export function PhotoFrame({
  src,
  alt,
  aspectClass = 'aspect-[3/4]',
  placeholderTitle,
  placeholderHint,
  showAdminShortcut = false,
}: PhotoFrameProps) {
  const [failed, setFailed] = useState(false);
  const { navigate, t } = useApp();

  if (src && !failed) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-[#141418] ${aspectClass}`}
      >
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
        />
      </div>
    );
  }

  // Cadre architectural sobre et authentique tant que l'utilisateur n'a pas importé sa vraie photo
  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-zinc-200 dark:border-white/12 bg-gradient-to-br from-zinc-100 via-white to-zinc-100 dark:from-[#141418] dark:via-[#0F0F13] dark:to-[#18181E] p-8 text-center ${aspectClass}`}
    >
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-[#C8A45D]/40 bg-[#C8A45D]/10">
        <span className="font-display text-3xl font-semibold tracking-wider text-[#9E7B34] dark:text-[#C8A45D]">
          CB
        </span>
      </div>
      <p className="text-sm font-semibold text-[#0B0B0D] dark:text-white">
        {placeholderTitle || t.hero.photoPlaceholderTitle}
      </p>
      <p className="mt-2 max-w-xs text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
        {placeholderHint || t.hero.photoPlaceholderHint}
      </p>
      {showAdminShortcut && (
        <button
          type="button"
          onClick={() => navigate('/admin')}
          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-white/15 px-3.5 py-2 text-xs font-medium text-[#0B0B0D] dark:text-white hover:border-[#C8A45D] transition-colors cursor-pointer"
        >
          <Camera className="h-3.5 w-3.5 text-[#C8A45D]" />
          <span>{t.gallery.openAdmin}</span>
        </button>
      )}
    </div>
  );
}
