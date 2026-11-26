import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  ArrowLeft,
  Check,
  FileText,
  ImagePlus,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Plus,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import type {
  ContactMessage,
  EducationItem,
  ExperienceItem,
  GalleryCategory,
  GalleryPhoto,
  PortfolioData,
  ProjectItem,
  ProjectStatus,
  SkillCategory,
} from '../types/portfolio.ts';

type AdminTab =
  | 'profile'
  | 'gallery'
  | 'skills'
  | 'education'
  | 'projects'
  | 'experiences'
  | 'vision'
  | 'contact'
  | 'messages'
  | 'security';

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Impossible de lire le fichier.'));
    reader.readAsDataURL(file);
  });
}

export function AdminPage() {
  const { portfolio, refreshPortfolio, navigate, adminToken, setAdminToken } = useApp();

  const [statusLoading, setStatusLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [envManaged, setEnvManaged] = useState(false);

  const [passwordInput, setPasswordInput] = useState('');
  const [confirmInput, setConfirmInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('profile');
  const [draft, setDraft] = useState<PortfolioData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Changement de mot de passe
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwFeedback, setPwFeedback] = useState<string | null>(null);

  // Nouvel ajout galerie
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState<GalleryCategory>('portrait');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (portfolio && !draft) {
      setDraft(structuredClone(portfolio));
    }
  }, [portfolio, draft]);

  const checkAdminStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (adminToken) headers.Authorization = `Bearer ${adminToken}`;
      const res = await fetch('/api/admin/status', { headers });
      const data = (await res.json()) as {
        initialized: boolean;
        envManaged: boolean;
        authenticated: boolean;
      };
      setInitialized(data.initialized);
      setEnvManaged(data.envManaged);
      if (!data.authenticated && adminToken) {
        setAdminToken(null);
      }
    } catch {
      setAuthError('Impossible de vérifier le statut administrateur.');
    } finally {
      setStatusLoading(false);
    }
  }, [adminToken, setAdminToken]);

  useEffect(() => {
    void checkAdminStatus();
  }, [checkAdminStatus]);

  const loadMessages = useCallback(async () => {
    if (!adminToken) return;
    setMessagesLoading(true);
    try {
      const res = await fetch('/api/messages', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const list = (await res.json()) as ContactMessage[];
        setMessages(list);
      }
    } finally {
      setMessagesLoading(false);
    }
  }, [adminToken]);

  useEffect(() => {
    if (adminToken && activeTab === 'messages') {
      void loadMessages();
    }
  }, [adminToken, activeTab, loadMessages]);

  const handleSetup = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (passwordInput.length < 8) {
      setAuthError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (passwordInput !== confirmInput) {
      setAuthError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    setAuthSubmitting(true);
    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = (await res.json()) as { token?: string; error?: string };
      if (!res.ok || !data.token) {
        setAuthError(data.error || 'Configuration impossible.');
        return;
      }
      setAdminToken(data.token);
      setInitialized(true);
      setPasswordInput('');
      setConfirmInput('');
    } catch {
      setAuthError('Erreur réseau.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = (await res.json()) as { token?: string; error?: string };
      if (!res.ok || !data.token) {
        setAuthError(data.error || 'Identifiants invalides.');
        return;
      }
      setAdminToken(data.token);
      setPasswordInput('');
    } catch {
      setAuthError('Erreur réseau.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const uploadBinaryFile = async (file: File): Promise<{ url: string; filename: string } | null> => {
    if (!adminToken) return null;
    setUploading(true);
    setSaveNotice(null);
    try {
      const dataBase64 = await readFileAsBase64(file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          dataBase64,
          mimeType: file.type,
        }),
      });
      const data = (await res.json()) as { url?: string; filename?: string; error?: string };
      if (!res.ok || !data.url) {
        setSaveNotice({ type: 'err', text: data.error || 'Échec du téléversement.' });
        return null;
      }
      return { url: data.url, filename: data.filename || file.name };
    } catch {
      setSaveNotice({ type: 'err', text: 'Erreur lors de la lecture ou envoi du fichier.' });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const persistDraft = async (nextDraft: PortfolioData) => {
    if (!adminToken) return;
    setSaving(true);
    setSaveNotice(null);
    try {
      const res = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(nextDraft),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        setSaveNotice({ type: 'err', text: err.error || 'Erreur lors de la sauvegarde.' });
        return;
      }
      await refreshPortfolio();
      setSaveNotice({ type: 'ok', text: 'Modifications enregistrées avec succès.' });
    } catch {
      setSaveNotice({ type: 'err', text: 'Impossible de contacter le serveur.' });
    } finally {
      setSaving(false);
    }
  };

  const handleGalleryUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !draft) return;
    const uploaded = await uploadBinaryFile(file);
    if (!uploaded) return;

    const newPhoto: GalleryPhoto = {
      id: `photo-${Date.now()}`,
      url: uploaded.url,
      caption: newPhotoCaption.trim(),
      captionEn: newPhotoCaption.trim(),
      category: newPhotoCategory,
      createdAt: new Date().toISOString(),
    };

    const nextDraft: PortfolioData = {
      ...draft,
      gallery: [newPhoto, ...draft.gallery],
      profile: {
        ...draft.profile,
        heroPhotoId: draft.profile.heroPhotoId || newPhoto.id,
      },
    };
    setDraft(nextDraft);
    setNewPhotoCaption('');
    await persistDraft(nextDraft);
  };

  const handleCvUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !draft) return;
    const uploaded = await uploadBinaryFile(file);
    if (!uploaded) return;

    const nextDraft: PortfolioData = {
      ...draft,
      profile: {
        ...draft.profile,
        cvFileUrl: uploaded.url,
        cvFileName: file.name,
      },
    };
    setDraft(nextDraft);
    await persistDraft(nextDraft);
  };

  const handleCertificateUpload = async (eduId: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !draft) return;
    const uploaded = await uploadBinaryFile(file);
    if (!uploaded) return;

    const nextDraft: PortfolioData = {
      ...draft,
      education: draft.education.map((item) =>
        item.id === eduId
          ? { ...item, certificateUrl: uploaded.url, certificateName: file.name }
          : item
      ),
    };
    setDraft(nextDraft);
    await persistDraft(nextDraft);
  };

  const handleProjectImageUpload = async (projId: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !draft) return;
    const uploaded = await uploadBinaryFile(file);
    if (!uploaded) return;

    const nextDraft: PortfolioData = {
      ...draft,
      projects: draft.projects.map((p) => (p.id === projId ? { ...p, imageUrl: uploaded.url } : p)),
    };
    setDraft(nextDraft);
    await persistDraft(nextDraft);
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!adminToken) return;
    setPwFeedback(null);
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (!res.ok) {
      setPwFeedback(data.error || 'Échec de la modification.');
      return;
    }
    setCurrentPw('');
    setNewPw('');
    setPwFeedback('Mot de passe mis à jour avec succès.');
  };

  if (statusLoading) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-6">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Chargement de l'espace administrateur...
        </p>
      </main>
    );
  }

  // Écran d'authentification ou de première configuration
  if (!adminToken) {
    return (
      <main className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-6 py-16">
        <div className="rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#131317] p-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#C8A45D]/15 border border-[#C8A45D]/40 mb-5">
            {initialized ? (
              <Lock className="h-5 w-5 text-[#C8A45D]" />
            ) : (
              <KeyRound className="h-5 w-5 text-[#C8A45D]" />
            )}
          </div>

          <h1 className="font-display text-3xl font-semibold text-[#0B0B0D] dark:text-white">
            {initialized ? 'Espace Administrateur' : 'Configuration initiale'}
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {initialized
              ? 'Connectez-vous pour gérer votre profil, vos photographies, vos projets, vos compétences et vos messages.'
              : 'Créez votre mot de passe administrateur personnel pour sécuriser votre tableau de bord (8 caractères minimum).'}
          </p>

          <form
            onSubmit={initialized ? handleLogin : handleSetup}
            className="mt-6 space-y-4"
          >
            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
              >
                {initialized ? 'Mot de passe' : 'Nouveau mot de passe administrateur'}
              </label>
              <input
                id="admin-password"
                type="password"
                required
                minLength={initialized ? 1 : 8}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-white/15 bg-[#FAF9F6] dark:bg-[#0B0B0D] px-4 py-2.5 text-sm text-[#0B0B0D] dark:text-white focus:border-[#C8A45D] focus:outline-none"
              />
            </div>

            {!initialized && (
              <div>
                <label
                  htmlFor="admin-password-confirm"
                  className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5"
                >
                  Confirmer le mot de passe
                </label>
                <input
                  id="admin-password-confirm"
                  type="password"
                  required
                  minLength={8}
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-white/15 bg-[#FAF9F6] dark:bg-[#0B0B0D] px-4 py-2.5 text-sm text-[#0B0B0D] dark:text-white focus:border-[#C8A45D] focus:outline-none"
                />
              </div>
            )}

            {authError && (
              <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-200">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authSubmitting}
              className="w-full rounded-lg bg-[#0B0B0D] dark:bg-[#C8A45D] px-4 py-2.5 text-sm font-semibold text-white dark:text-[#0B0B0D] hover:opacity-90 disabled:opacity-60 transition-opacity cursor-pointer"
            >
              {authSubmitting
                ? 'Vérification...'
                : initialized
                ? 'Se connecter'
                : 'Activer mon espace administrateur'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-6 inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-[#C8A45D] cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Retour au portfolio public</span>
          </button>
        </div>
      </main>
    );
  }

  if (!draft) return null;

  const tabs: Array<{ id: AdminTab; label: string }> = [
    { id: 'profile', label: 'Profil & Textes' },
    { id: 'gallery', label: 'Galerie & Photos' },
    { id: 'skills', label: 'Compétences' },
    { id: 'education', label: 'Formations & PDF' },
    { id: 'projects', label: 'Projets' },
    { id: 'experiences', label: 'Expériences & Langues' },
    { id: 'vision', label: 'Objectifs & Intérêts' },
    { id: 'contact', label: 'Contact & Réseaux' },
    { id: 'messages', label: 'Messages reçus' },
    { id: 'security', label: 'Sécurité' },
  ];

  const inputClass =
    'w-full rounded-lg border border-zinc-300 dark:border-white/15 bg-[#FAF9F6] dark:bg-[#0B0B0D] px-3.5 py-2 text-sm text-[#0B0B0D] dark:text-white focus:border-[#C8A45D] focus:outline-none';

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-200 dark:border-white/10 pb-6">
        <div>
          <p className="text-xs font-medium text-[#9E7B34] dark:text-[#C8A45D]">
            Administration privée
          </p>
          <h1 className="font-display text-3xl font-semibold text-[#0B0B0D] dark:text-white">
            Tableau de bord — {draft.profile.fullName}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 dark:border-white/15 px-3.5 py-2 text-xs font-medium text-[#0B0B0D] dark:text-white hover:border-[#C8A45D] cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Voir le site</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => persistDraft(draft)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B0B0D] dark:bg-[#C8A45D] px-4 py-2 text-xs font-semibold text-white dark:text-[#0B0B0D] hover:opacity-90 disabled:opacity-60 cursor-pointer"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{saving ? 'Sauvegarde...' : 'Enregistrer tout'}</span>
          </button>

          <button
            type="button"
            onClick={() => setAdminToken(null)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 dark:border-white/15 px-3 py-2 text-xs text-zinc-600 dark:text-zinc-300 hover:border-rose-500 hover:text-rose-500 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {saveNotice && (
        <div
          className={`mt-5 flex items-center gap-2 rounded-lg border px-4 py-3 text-xs ${
            saveNotice.type === 'ok'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-200'
          }`}
        >
          {saveNotice.type === 'ok' && <Check className="h-4 w-4" />}
          <span>{saveNotice.text}</span>
        </div>
      )}

      {/* Navigation des onglets */}
      <div className="mt-6 flex flex-wrap gap-1.5 rounded-xl bg-zinc-200/70 dark:bg-white/5 p-1.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white dark:bg-[#18181D] text-[#0B0B0D] dark:text-white shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-[#0B0B0D] dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-6">
        {/* ONGLET 1 : PROFIL & TEXTES */}
        {activeTab === 'profile' && (
          <div className="space-y-6 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#131317] p-6">
            <h2 className="font-display text-2xl font-semibold text-[#0B0B0D] dark:text-white">
              Identité, présentation & CV PDF
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Nom complet</label>
                <input
                  className={inputClass}
                  value={draft.profile.fullName}
                  onChange={(e) =>
                    setDraft({ ...draft, profile: { ...draft.profile, fullName: e.target.value } })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">
                  Titre professionnel (FR)
                </label>
                <input
                  className={inputClass}
                  value={draft.profile.title}
                  onChange={(e) =>
                    setDraft({ ...draft, profile: { ...draft.profile, title: e.target.value } })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">
                  Titre professionnel (EN)
                </label>
                <input
                  className={inputClass}
                  value={draft.profile.titleEn}
                  onChange={(e) =>
                    setDraft({ ...draft, profile: { ...draft.profile, titleEn: e.target.value } })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Localisation</label>
                <input
                  className={inputClass}
                  value={draft.profile.location}
                  onChange={(e) =>
                    setDraft({ ...draft, profile: { ...draft.profile, location: e.target.value } })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Phrase d'accroche (FR)
              </label>
              <input
                className={inputClass}
                value={draft.profile.tagline}
                onChange={(e) =>
                  setDraft({ ...draft, profile: { ...draft.profile, tagline: e.target.value } })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Courte présentation d'accueil (FR)
              </label>
              <textarea
                rows={2}
                className={inputClass}
                value={draft.profile.shortBio}
                onChange={(e) =>
                  setDraft({ ...draft, profile: { ...draft.profile, shortBio: e.target.value } })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Paragraphes « À propos de moi » (un paragraphe par ligne)
              </label>
              <textarea
                rows={7}
                className={inputClass}
                value={draft.profile.aboutParagraphs.join('\n')}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    profile: {
                      ...draft.profile,
                      aboutParagraphs: e.target.value.split('\n').filter((l) => l.trim().length > 0),
                    },
                  })
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-zinc-200 dark:border-white/10 pt-5">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                  Fichier CV PDF personnalisé
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-white/15 px-3.5 py-2 text-xs font-medium cursor-pointer hover:border-[#C8A45D]">
                    <Upload className="h-3.5 w-3.5 text-[#C8A45D]" />
                    <span>{uploading ? 'Envoi...' : 'Importer un CV (PDF)'}</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleCvUpload}
                    />
                  </label>
                  {draft.profile.cvFileUrl && (
                    <span className="text-xs text-zinc-500">
                      Actuel : {draft.profile.cvFileName || 'CV-personnalise.pdf'}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-xs text-zinc-500">
                  Si aucun PDF n'est importé, un CV PDF est généré automatiquement à partir de vos données.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1.5">
                  Google Analytics (optionnel, format G-XXXXXXXXXX)
                </label>
                <input
                  className={inputClass}
                  placeholder="G-XXXXXXXXXX"
                  value={draft.profile.analyticsId}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      profile: { ...draft.profile, analyticsId: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* ONGLET 2 : GALERIE PHOTOGRAPHIQUE */}
        {activeTab === 'gallery' && (
          <div className="space-y-6 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#131317] p-6">
            <div>
              <h2 className="font-display text-2xl font-semibold text-[#0B0B0D] dark:text-white">
                Galerie photographique personnelle
              </h2>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Ajoutez vos vraies photographies depuis votre ordinateur, choisissez votre photo principale (Accueil) et votre photo À propos.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 rounded-xl border border-dashed border-[#C8A45D]/50 bg-[#C8A45D]/[0.04] p-5 sm:grid-cols-12 items-end">
              <div className="sm:col-span-5">
                <label className="block text-xs font-medium text-zinc-500 mb-1">Légende</label>
                <input
                  className={inputClass}
                  placeholder="Ex: Portrait professionnel à Casablanca"
                  value={newPhotoCaption}
                  onChange={(e) => setNewPhotoCaption(e.target.value)}
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-zinc-500 mb-1">Catégorie</label>
                <select
                  className={inputClass}
                  value={newPhotoCategory}
                  onChange={(e) => setNewPhotoCategory(e.target.value as GalleryCategory)}
                >
                  <option value="portrait">Portrait professionnel</option>
                  <option value="professional">Tenue professionnelle</option>
                  <option value="workspace">Environnement de travail</option>
                  <option value="presentation">Photo de présentation</option>
                  <option value="event">Photo lors d'événements</option>
                  <option value="other">Autres photographies</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B0B0D] dark:bg-[#C8A45D] px-4 py-2.5 text-xs font-semibold text-white dark:text-[#0B0B0D] cursor-pointer hover:opacity-90">
                  <ImagePlus className="h-4 w-4" />
                  <span>{uploading ? 'Import...' : 'Choisir une photo'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleGalleryUpload}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {draft.gallery.map((photo) => {
                const isHero = draft.profile.heroPhotoId === photo.id;
                const isAbout = draft.profile.aboutPhotoId === photo.id;
                return (
                  <div
                    key={photo.id}
                    className="overflow-hidden rounded-xl border border-zinc-200 dark:border-white/10 bg-[#FAF9F6] dark:bg-[#0B0B0D]"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption || 'Photo'}
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <div className="p-4 space-y-3">
                      <input
                        className={inputClass}
                        placeholder="Légende..."
                        value={photo.caption}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            gallery: draft.gallery.map((g) =>
                              g.id === photo.id
                                ? { ...g, caption: e.target.value, captionEn: e.target.value }
                                : g
                            ),
                          })
                        }
                      />

                      <div className="flex flex-wrap gap-1.5 text-xs">
                        <button
                          type="button"
                          onClick={() =>
                            setDraft({
                              ...draft,
                              profile: { ...draft.profile, heroPhotoId: photo.id },
                            })
                          }
                          className={`rounded-md px-2.5 py-1 border cursor-pointer ${
                            isHero
                              ? 'border-[#C8A45D] bg-[#C8A45D]/15 text-[#9E7B34] dark:text-[#C8A45D] font-medium'
                              : 'border-zinc-300 dark:border-white/15 text-zinc-500'
                          }`}
                        >
                          {isHero ? 'Photo principale ✓' : 'Définir Accueil'}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDraft({
                              ...draft,
                              profile: { ...draft.profile, aboutPhotoId: photo.id },
                            })
                          }
                          className={`rounded-md px-2.5 py-1 border cursor-pointer ${
                            isAbout
                              ? 'border-[#C8A45D] bg-[#C8A45D]/15 text-[#9E7B34] dark:text-[#C8A45D] font-medium'
                              : 'border-zinc-300 dark:border-white/15 text-zinc-500'
                          }`}
                        >
                          {isAbout ? 'Photo À propos ✓' : 'Définir À propos'}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setDraft({
                              ...draft,
                              gallery: draft.gallery.filter((g) => g.id !== photo.id),
                              profile: {
                                ...draft.profile,
                                heroPhotoId: isHero ? null : draft.profile.heroPhotoId,
                                aboutPhotoId: isAbout ? null : draft.profile.aboutPhotoId,
                              },
                            })
                          }
                          className="ml-auto rounded-md border border-rose-500/30 px-2 py-1 text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ONGLET 3 : COMPÉTENCES */}
        {activeTab === 'skills' && (
          <div className="space-y-6 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#131317] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold text-[#0B0B0D] dark:text-white">
                  Compétences & niveaux modifiables
                </h2>
                <p className="mt-1 text-xs text-zinc-500">
                  Laissez le pourcentage vide pour ne pas afficher de score chiffré, ou définissez librement vos niveaux (0–100).
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDraft({
                    ...draft,
                    skills: [
                      ...draft.skills,
                      {
                        id: `sk-${Date.now()}`,
                        category: 'web',
                        name: 'Nouvelle compétence',
                        nameEn: 'New Skill',
                        level: null,
                        levelLabel: '',
                        levelLabelEn: '',
                      },
                    ],
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 dark:border-white/15 px-3 py-2 text-xs font-medium cursor-pointer hover:border-[#C8A45D]"
              >
                <Plus className="h-3.5 w-3.5 text-[#C8A45D]" />
                <span>Ajouter une compétence</span>
              </button>
            </div>

            <div className="space-y-3">
              {draft.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="grid grid-cols-1 gap-3 rounded-lg border border-zinc-200 dark:border-white/10 p-3 sm:grid-cols-12 items-center"
                >
                  <select
                    className={`${inputClass} sm:col-span-3`}
                    value={skill.category}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        skills: draft.skills.map((s) =>
                          s.id === skill.id
                            ? { ...s, category: e.target.value as SkillCategory }
                            : s
                        ),
                      })
                    }
                  >
                    <option value="web">A. Développement web</option>
                    <option value="multimedia">B. Multimédia</option>
                    <option value="tools">C. Outils</option>
                  </select>

                  <input
                    className={`${inputClass} sm:col-span-4`}
                    value={skill.name}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        skills: draft.skills.map((s) =>
                          s.id === skill.id ? { ...s, name: e.target.value, nameEn: e.target.value } : s
                        ),
                      })
                    }
                  />

                  <input
                    className={`${inputClass} sm:col-span-2`}
                    type="number"
                    min={0}
                    max={100}
                    placeholder="%"
                    value={skill.level ?? ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? null : Math.min(100, Math.max(0, Number(e.target.value)));
                      setDraft({
                        ...draft,
                        skills: draft.skills.map((s) => (s.id === skill.id ? { ...s, level: val } : s)),
                      });
                    }}
                  />

                  <input
                    className={`${inputClass} sm:col-span-2`}
                    placeholder="Libellé (ex: Avancé)"
                    value={skill.levelLabel}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        skills: draft.skills.map((s) =>
                          s.id === skill.id
                            ? { ...s, levelLabel: e.target.value, levelLabelEn: e.target.value }
                            : s
                        ),
                      })
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        skills: draft.skills.filter((s) => s.id !== skill.id),
                      })
                    }
                    className="sm:col-span-1 inline-flex justify-center rounded-lg border border-rose-500/30 p-2 text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ONGLET 4 : FORMATIONS & CERTIFICATS PDF */}
        {activeTab === 'education' && (
          <div className="space-y-6 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#131317] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-semibold text-[#0B0B0D] dark:text-white">
                Parcours académique & Certificats
              </h2>
              <button
                type="button"
                onClick={() => {
                  const newEdu: EducationItem = {
                    id: `edu-${Date.now()}`,
                    period: '2026',
                    title: 'Nouvelle formation',
                    titleEn: 'New Education',
                    institution: 'Établissement',
                    institutionEn: 'Institution',
                    status: 'completed',
                    certificateUrl: null,
                    certificateName: null,
                  };
                  setDraft({ ...draft, education: [...draft.education, newEdu] });
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 dark:border-white/15 px-3 py-2 text-xs font-medium cursor-pointer hover:border-[#C8A45D]"
              >
                <Plus className="h-3.5 w-3.5 text-[#C8A45D]" />
                <span>Ajouter une formation</span>
              </button>
            </div>

            <div className="space-y-4">
              {draft.education.map((edu) => (
                <div
                  key={edu.id}
                  className="space-y-3 rounded-xl border border-zinc-200 dark:border-white/10 p-4"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                    <input
                      className={`${inputClass} sm:col-span-3`}
                      value={edu.period}
                      placeholder="Année / Période"
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          education: draft.education.map((item) =>
                            item.id === edu.id ? { ...item, period: e.target.value } : item
                          ),
                        })
                      }
                    />
                    <input
                      className={`${inputClass} sm:col-span-6`}
                      value={edu.title}
                      placeholder="Diplôme / Formation"
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          education: draft.education.map((item) =>
                            item.id === edu.id
                              ? { ...item, title: e.target.value, titleEn: e.target.value }
                              : item
                          ),
                        })
                      }
                    />
                    <select
                      className={`${inputClass} sm:col-span-3`}
                      value={edu.status}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          education: draft.education.map((item) =>
                            item.id === edu.id
                              ? { ...item, status: e.target.value as 'completed' | 'planned' }
                              : item
                          ),
                        })
                      }
                    >
                      <option value="completed">Diplôme validé</option>
                      <option value="planned">Formation envisagée</option>
                    </select>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <input
                      className={`${inputClass} max-w-md`}
                      value={edu.institution}
                      placeholder="Établissement"
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          education: draft.education.map((item) =>
                            item.id === edu.id
                              ? {
                                  ...item,
                                  institution: e.target.value,
                                  institutionEn: e.target.value,
                                }
                              : item
                          ),
                        })
                      }
                    />

                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 dark:border-white/15 px-3 py-1.5 text-xs cursor-pointer hover:border-[#C8A45D]">
                        <FileText className="h-3.5 w-3.5 text-[#C8A45D]" />
                        <span>{edu.certificateUrl ? 'Remplacer PDF/Image' : 'Joindre certificat'}</span>
                        <input
                          type="file"
                          accept="application/pdf,image/jpeg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => handleCertificateUpload(edu.id, e)}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            education: draft.education.filter((i) => i.id !== edu.id),
                          })
                        }
                        className="rounded-lg border border-rose-500/30 p-2 text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ONGLET 5 : PROJETS */}
        {activeTab === 'projects' && (
          <div className="space-y-6 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#131317] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-semibold text-[#0B0B0D] dark:text-white">
                Gestion du Portfolio & Projets
              </h2>
              <button
                type="button"
                onClick={() => {
                  const newProj: ProjectItem = {
                    id: `proj-${Date.now()}`,
                    title: 'NOUVEAU PROJET',
                    titleEn: 'NEW PROJECT',
                    description: 'Description du projet...',
                    descriptionEn: 'Project description...',
                    technologies: ['React', 'TypeScript'],
                    imageUrl: '',
                    projectUrl: '',
                    githubUrl: '',
                    status: 'concept',
                  };
                  setDraft({ ...draft, projects: [...draft.projects, newProj] });
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 dark:border-white/15 px-3 py-2 text-xs font-medium cursor-pointer hover:border-[#C8A45D]"
              >
                <Plus className="h-3.5 w-3.5 text-[#C8A45D]" />
                <span>Ajouter un projet</span>
              </button>
            </div>

            <div className="space-y-5">
              {draft.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="space-y-3 rounded-xl border border-zinc-200 dark:border-white/10 p-5"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                    <input
                      className={`${inputClass} sm:col-span-6 font-semibold`}
                      value={proj.title}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          projects: draft.projects.map((p) =>
                            p.id === proj.id
                              ? { ...p, title: e.target.value, titleEn: e.target.value }
                              : p
                          ),
                        })
                      }
                    />
                    <select
                      className={`${inputClass} sm:col-span-4`}
                      value={proj.status}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          projects: draft.projects.map((p) =>
                            p.id === proj.id
                              ? { ...p, status: e.target.value as ProjectStatus }
                              : p
                          ),
                        })
                      }
                    >
                      <option value="concept">Concept en cours</option>
                      <option value="in_progress">En développement</option>
                      <option value="completed">Projet réalisé</option>
                      <option value="upcoming">Espace évolutif</option>
                    </select>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          projects: draft.projects.filter((p) => p.id !== proj.id),
                        })
                      }
                      className="sm:col-span-2 inline-flex items-center justify-center gap-1 rounded-lg border border-rose-500/30 px-3 py-2 text-xs text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Supprimer</span>
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    className={inputClass}
                    value={proj.description}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        projects: draft.projects.map((p) =>
                          p.id === proj.id
                            ? { ...p, description: e.target.value, descriptionEn: e.target.value }
                            : p
                        ),
                      })
                    }
                  />

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <input
                      className={inputClass}
                      placeholder="Technologies (séparées par des virgules)"
                      value={proj.technologies.join(', ')}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          projects: draft.projects.map((p) =>
                            p.id === proj.id
                              ? {
                                  ...p,
                                  technologies: e.target.value
                                    .split(',')
                                    .map((t) => t.trim())
                                    .filter(Boolean),
                                }
                              : p
                          ),
                        })
                      }
                    />
                    <input
                      className={inputClass}
                      placeholder="URL du projet (https://...)"
                      value={proj.projectUrl}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          projects: draft.projects.map((p) =>
                            p.id === proj.id ? { ...p, projectUrl: e.target.value } : p
                          ),
                        })
                      }
                    />
                    <input
                      className={inputClass}
                      placeholder="URL GitHub (https://github.com/...)"
                      value={proj.githubUrl}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          projects: draft.projects.map((p) =>
                            p.id === proj.id ? { ...p, githubUrl: e.target.value } : p
                          ),
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 dark:border-white/15 px-3 py-1.5 text-xs cursor-pointer hover:border-[#C8A45D]">
                      <ImagePlus className="h-3.5 w-3.5 text-[#C8A45D]" />
                      <span>Importer une image de couverture</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => handleProjectImageUpload(proj.id, e)}
                      />
                    </label>
                    {proj.imageUrl && (
                      <span className="text-xs text-zinc-500 truncate max-w-xs">{proj.imageUrl}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ONGLET 6 : EXPÉRIENCES & LANGUES */}
        {activeTab === 'experiences' && (
          <div className="space-y-8">
            <div className="space-y-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#131317] p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-semibold text-[#0B0B0D] dark:text-white">
                  Expériences professionnelles
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    const next: ExperienceItem = {
                      id: `exp-${Date.now()}`,
                      role: 'Nouveau poste',
                      roleEn: 'New Role',
                      department: 'Service',
                      departmentEn: 'Department',
                      location: 'Casablanca, Maroc',
                      period: '2026',
                      responsibilities: ['Mission principale...'],
                      responsibilitiesEn: ['Core responsibility...'],
                      softSkills: ['Communication'],
                      softSkillsEn: ['Communication'],
                    };
                    setDraft({ ...draft, experiences: [...draft.experiences, next] });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 dark:border-white/15 px-3 py-2 text-xs font-medium cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 text-[#C8A45D]" />
                  <span>Ajouter une expérience</span>
                </button>
              </div>

              {draft.experiences.map((exp) => (
                <div
                  key={exp.id}
                  className="space-y-3 rounded-xl border border-zinc-200 dark:border-white/10 p-4"
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <input
                      className={inputClass}
                      value={exp.role}
                      placeholder="Poste"
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          experiences: draft.experiences.map((x) =>
                            x.id === exp.id ? { ...x, role: e.target.value, roleEn: e.target.value } : x
                          ),
                        })
                      }
                    />
                    <input
                      className={inputClass}
                      value={exp.department}
                      placeholder="Département"
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          experiences: draft.experiences.map((x) =>
                            x.id === exp.id
                              ? { ...x, department: e.target.value, departmentEn: e.target.value }
                              : x
                          ),
                        })
                      }
                    />
                    <input
                      className={inputClass}
                      value={exp.period}
                      placeholder="Période"
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          experiences: draft.experiences.map((x) =>
                            x.id === exp.id ? { ...x, period: e.target.value } : x
                          ),
                        })
                      }
                    />
                  </div>
                  <textarea
                    rows={3}
                    className={inputClass}
                    placeholder="Missions (une par ligne)"
                    value={exp.responsibilities.join('\n')}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        experiences: draft.experiences.map((x) =>
                          x.id === exp.id
                            ? {
                                ...x,
                                responsibilities: e.target.value.split('\n').filter(Boolean),
                              }
                            : x
                        ),
                      })
                    }
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          experiences: draft.experiences.filter((x) => x.id !== exp.id),
                        })
                      }
                      className="text-xs text-rose-500 hover:underline cursor-pointer"
                    >
                      Supprimer cette expérience
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#131317] p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-semibold text-[#0B0B0D] dark:text-white">
                  Langues
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      languages: [
                        ...draft.languages,
                        {
                          id: `lang-${Date.now()}`,
                          name: 'Nouvelle langue',
                          nameEn: 'New Language',
                          proficiency: 'Parlé, lu',
                          proficiencyEn: 'Spoken, read',
                        },
                      ],
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 dark:border-white/15 px-3 py-2 text-xs font-medium cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 text-[#C8A45D]" />
                  <span>Ajouter une langue</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {draft.languages.map((langItem) => (
                  <div
                    key={langItem.id}
                    className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-white/10 p-3"
                  >
                    <input
                      className={inputClass}
                      value={langItem.name}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          languages: draft.languages.map((l) =>
                            l.id === langItem.id
                              ? { ...l, name: e.target.value, nameEn: e.target.value }
                              : l
                          ),
                        })
                      }
                    />
                    <input
                      className={inputClass}
                      value={langItem.proficiency}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          languages: draft.languages.map((l) =>
                            l.id === langItem.id
                              ? { ...l, proficiency: e.target.value, proficiencyEn: e.target.value }
                              : l
                          ),
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          languages: draft.languages.filter((l) => l.id !== langItem.id),
                        })
                      }
                      className="text-rose-500 p-2 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ONGLET 7 : OBJECTIFS & CENTRES D'INTÉRÊT */}
        {activeTab === 'vision' && (
          <div className="space-y-6 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#131317] p-6">
            <h2 className="font-display text-2xl font-semibold text-[#0B0B0D] dark:text-white">
              Objectifs professionnels & Centres d'intérêt
            </h2>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">Titre section</label>
              <input
                className={inputClass}
                value={draft.objectives.title}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    objectives: { ...draft.objectives, title: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Phrase inspirante
              </label>
              <input
                className={inputClass}
                value={draft.objectives.quote}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    objectives: { ...draft.objectives, quote: e.target.value },
                  })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-500 mb-1">
                Ambitions (une par ligne)
              </label>
              <textarea
                rows={6}
                className={inputClass}
                value={draft.objectives.items.join('\n')}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    objectives: {
                      ...draft.objectives,
                      items: e.target.value.split('\n').filter(Boolean),
                    },
                  })
                }
              />
            </div>
          </div>
        )}

        {/* ONGLET 8 : COORDONNÉES & RÉSEAUX */}
        {activeTab === 'contact' && (
          <div className="space-y-5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#131317] p-6">
            <h2 className="font-display text-2xl font-semibold text-[#0B0B0D] dark:text-white">
              Coordonnées & Réseaux sociaux
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Email</label>
                <input
                  className={inputClass}
                  value={draft.profile.email}
                  onChange={(e) =>
                    setDraft({ ...draft, profile: { ...draft.profile, email: e.target.value } })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Téléphone</label>
                <input
                  className={inputClass}
                  value={draft.profile.phone}
                  onChange={(e) =>
                    setDraft({ ...draft, profile: { ...draft.profile, phone: e.target.value } })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">WhatsApp</label>
                <input
                  className={inputClass}
                  value={draft.profile.whatsapp}
                  onChange={(e) =>
                    setDraft({ ...draft, profile: { ...draft.profile, whatsapp: e.target.value } })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">GitHub URL</label>
                <input
                  className={inputClass}
                  placeholder="https://github.com/..."
                  value={draft.profile.githubUrl}
                  onChange={(e) =>
                    setDraft({ ...draft, profile: { ...draft.profile, githubUrl: e.target.value } })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">TikTok URL</label>
                <input
                  className={inputClass}
                  placeholder="https://www.tiktok.com/@..."
                  value={draft.profile.tiktokUrl}
                  onChange={(e) =>
                    setDraft({ ...draft, profile: { ...draft.profile, tiktokUrl: e.target.value } })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">LinkedIn URL</label>
                <input
                  className={inputClass}
                  placeholder="https://www.linkedin.com/in/..."
                  value={draft.profile.linkedinUrl}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      profile: { ...draft.profile, linkedinUrl: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {/* ONGLET 9 : MESSAGES REÇUS */}
        {activeTab === 'messages' && (
          <div className="space-y-4 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#131317] p-6">
            <h2 className="font-display text-2xl font-semibold text-[#0B0B0D] dark:text-white">
              Messagerie reçue
            </h2>

            {messagesLoading ? (
              <p className="text-sm text-zinc-500">Chargement des messages...</p>
            ) : messages.length === 0 ? (
              <div className="rounded-lg border border-dashed border-zinc-300 dark:border-white/15 p-8 text-center text-sm text-zinc-500">
                <Mail className="mx-auto h-7 w-7 text-[#C8A45D] mb-2" />
                Aucun message reçu pour le moment.
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-xl border p-4 ${
                      msg.read
                        ? 'border-zinc-200 dark:border-white/10'
                        : 'border-[#C8A45D]/50 bg-[#C8A45D]/[0.04]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-[#0B0B0D] dark:text-white">
                        {msg.subject}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <span className="font-mono">
                          {new Date(msg.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                        <button
                          type="button"
                          onClick={async () => {
                            await fetch(`/api/messages/${msg.id}`, {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${adminToken}`,
                              },
                              body: JSON.stringify({ read: !msg.read }),
                            });
                            void loadMessages();
                          }}
                          className="text-[#C8A45D] hover:underline cursor-pointer"
                        >
                          {msg.read ? 'Marquer non lu' : 'Marquer lu'}
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await fetch(`/api/messages/${msg.id}`, {
                              method: 'DELETE',
                              headers: { Authorization: `Bearer ${adminToken}` },
                            });
                            void loadMessages();
                          }}
                          className="text-rose-500 hover:underline cursor-pointer"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      De : {msg.name} ({msg.email})
                      <span aria-hidden="true"> · </span>
                      {msg.emailDelivered ? 'Email transmis' : 'Enregistré en boîte locale'}
                    </p>
                    <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ONGLET 10 : SÉCURITÉ */}
        {activeTab === 'security' && (
          <div className="space-y-5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#131317] p-6">
            <h2 className="font-display text-2xl font-semibold text-[#0B0B0D] dark:text-white">
              Sécurité du compte administrateur
            </h2>
            {envManaged ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Le mot de passe administrateur est actuellement défini via la variable d'environnement serveur <code className="font-mono">ADMIN_PASSWORD</code>. Modifiez cette variable dans vos paramètres d'hébergement pour le changer.
              </p>
            ) : (
              <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    required
                    className={inputClass}
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">
                    Nouveau mot de passe (8 caractères min.)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    className={inputClass}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                  />
                </div>
                {pwFeedback && (
                  <p className="text-xs text-[#9E7B34] dark:text-[#C8A45D]">{pwFeedback}</p>
                )}
                <button
                  type="submit"
                  className="rounded-lg bg-[#0B0B0D] dark:bg-[#C8A45D] px-4 py-2 text-xs font-semibold text-white dark:text-[#0B0B0D] cursor-pointer"
                >
                  Mettre à jour le mot de passe
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
