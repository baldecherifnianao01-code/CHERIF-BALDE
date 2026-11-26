import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { UI_COPY, type Lang } from '../i18n/translations.ts';
import type { PortfolioData } from '../types/portfolio.ts';

export type Theme = 'dark' | 'light';

interface AppContextValue {
  theme: Theme;
  toggleTheme: () => void;
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (typeof UI_COPY)['fr'] | (typeof UI_COPY)['en'];
  portfolio: PortfolioData | null;
  loading: boolean;
  error: string | null;
  refreshPortfolio: () => Promise<void>;
  currentPath: string;
  navigate: (path: string, hash?: string) => void;
  adminToken: string | null;
  setAdminToken: (token: string | null) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function isSafeExternalUrl(rawUrl: string): boolean {
  if (!rawUrl || !rawUrl.trim()) return false;
  try {
    const parsed = new URL(rawUrl.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('cb_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // Ignore storage access errors
    }
    return 'dark';
  });

  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem('cb_lang');
      if (saved === 'en' || saved === 'fr') return saved;
    } catch {
      // Ignore storage access errors
    }
    return 'fr';
  });

  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  // Jeton administrateur conservé uniquement en mémoire (jamais en localStorage)
  const [adminToken, setAdminToken] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('cb_theme', theme);
    } catch {
      // Ignore storage write errors
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem('cb_lang', lang);
    } catch {
      // Ignore storage write errors
    }
  }, [lang]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
  }, []);

  const refreshPortfolio = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/portfolio');
      if (!res.ok) throw new Error('Erreur lors du chargement du portfolio.');
      const data = (await res.json()) as PortfolioData;
      setPortfolio(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur réseau.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshPortfolio();
  }, [refreshPortfolio]);

  // Chargement facultatif et respectueux de la confidentialité de Google Analytics
  useEffect(() => {
    const gaId = portfolio?.profile.analyticsId?.trim();
    if (!gaId || !/^G-[A-Z0-9]+$/i.test(gaId)) return;
    if (document.getElementById('ga-script')) return;

    const script = document.createElement('script');
    script.id = 'ga-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.appendChild(script);

    const inline = document.createElement('script');
    inline.id = 'ga-config';
    inline.text = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaId}', { anonymize_ip: true });`;
    document.head.appendChild(inline);
  }, [portfolio?.profile.analyticsId]);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((path: string, hash?: string) => {
    const normalized = path.startsWith('/') ? path : `/${path}`;
    if (window.location.pathname !== normalized) {
      window.history.pushState({}, '', hash ? `${normalized}#${hash}` : normalized);
      setCurrentPath(normalized);
    } else if (hash) {
      window.history.replaceState({}, '', `${normalized}#${hash}`);
    }

    if (hash) {
      requestAnimationFrame(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const t = UI_COPY[lang];

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        lang,
        setLang,
        t,
        portfolio,
        loading,
        error,
        refreshPortfolio,
        currentPath,
        navigate,
        adminToken,
        setAdminToken,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp doit être utilisé dans AppProvider');
  return ctx;
}
