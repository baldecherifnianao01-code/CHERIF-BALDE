import { useState, type FormEvent } from 'react';
import { ArrowUpRight, CheckCircle2, Globe, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { isSafeExternalUrl, useApp } from '../../context/AppContext.tsx';

export function ContactSection() {
  const { portfolio, lang, t } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!portfolio) return null;

  const { profile } = portfolio;
  const heading =
    lang === 'fr' ? profile.siteTexts.contactHeading : profile.siteTexts.contactHeadingEn;

  const cleanWhatsapp = profile.whatsapp.replace(/[^0-9]/g, '');
  const whatsappUrl = cleanWhatsapp ? `https://wa.me/${cleanWhatsapp}` : '';

  const socialItems = [
    ...(profile.githubUrl && isSafeExternalUrl(profile.githubUrl)
      ? [{ label: 'GitHub', url: profile.githubUrl }]
      : []),
    ...(profile.linkedinUrl && isSafeExternalUrl(profile.linkedinUrl)
      ? [{ label: 'LinkedIn', url: profile.linkedinUrl }]
      : []),
    ...(profile.tiktokUrl && isSafeExternalUrl(profile.tiktokUrl)
      ? [{ label: 'TikTok', url: profile.tiktokUrl }]
      : []),
    ...(profile.otherSocials || []).filter((s) => isSafeExternalUrl(s.url)),
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = (await res.json()) as {
        saved?: boolean;
        emailDelivered?: boolean;
        message?: string;
        error?: string;
      };

      if (!res.ok) {
        setFeedback({
          type: 'error',
          text: data.error || "Une erreur est survenue lors de l'envoi.",
        });
        return;
      }

      setFeedback({
        type: 'success',
        text:
          data.message ||
          'Votre message a bien été enregistré dans la messagerie sécurisée du portfolio.',
      });
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch {
      setFeedback({
        type: 'error',
        text: 'Impossible de joindre le serveur. Veuillez réessayer ou utiliser votre messagerie directe.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-wide text-[#9E7B34] dark:text-[#C8A45D]">
            {t.contact.eyebrow}
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-[#0B0B0D] dark:text-white sm:text-4xl [text-wrap:balance]">
            {heading}
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Coordonnées directes */}
          <div className="lg:col-span-5 space-y-6 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#131317] p-8">
            <h3 className="text-lg font-semibold text-[#0B0B0D] dark:text-white">
              {t.contact.infoTitle}
            </h3>

            <dl className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-[#C8A45D] shrink-0 mt-1" />
                <div>
                  <dt className="text-xs text-zinc-500 dark:text-zinc-400">Email</dt>
                  <dd className="mt-0.5 font-medium text-[#0B0B0D] dark:text-white break-all">
                    <a href={`mailto:${profile.email}`} className="hover:text-[#C8A45D]">
                      {profile.email}
                    </a>
                  </dd>
                </div>
              </div>

              {profile.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-[#C8A45D] shrink-0 mt-1" />
                  <div>
                    <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                      {t.contact.phoneLabel}
                    </dt>
                    <dd className="mt-0.5 font-mono font-medium text-[#0B0B0D] dark:text-white">
                      <a href={`tel:${profile.phone}`} className="hover:text-[#C8A45D]">
                        {profile.phone}
                      </a>
                    </dd>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-[#C8A45D] shrink-0 mt-1" />
                <div>
                  <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                    {t.contact.locationLabel}
                  </dt>
                  <dd className="mt-0.5 font-medium text-[#0B0B0D] dark:text-white">
                    {lang === 'fr' ? profile.location : profile.locationEn}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="h-4 w-4 text-[#C8A45D] shrink-0 mt-1" />
                <div>
                  <dt className="text-xs text-zinc-500 dark:text-zinc-400">
                    {t.contact.websiteLabel}
                  </dt>
                  <dd className="mt-0.5 font-mono font-medium text-[#9E7B34] dark:text-[#C8A45D]">
                    {profile.website}
                  </dd>
                </div>
              </div>
            </dl>

            {/* Bouton WhatsApp affiché lorsque le numéro est renseigné */}
            <div className="pt-4 border-t border-zinc-100 dark:border-white/10 flex flex-wrap gap-3">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0B0B0D] dark:bg-[#C8A45D] px-4 py-2.5 text-xs font-semibold text-white dark:text-[#0B0B0D] hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{t.contact.whatsappBtn}</span>
                </a>
              )}

              <a
                href={`mailto:${profile.email}`}
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 dark:border-white/15 px-4 py-2.5 text-xs font-medium text-[#0B0B0D] dark:text-white hover:border-[#C8A45D] transition-colors whitespace-nowrap"
              >
                <Mail className="h-4 w-4 text-[#C8A45D]" />
                <span>{t.contact.emailDirect}</span>
              </a>
            </div>

            {socialItems.length > 0 && (
              <div className="pt-4 border-t border-zinc-100 dark:border-white/10 flex flex-wrap gap-4 text-xs">
                {socialItems.map((s) => (
                  <a
                    key={s.label + s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-zinc-600 dark:text-zinc-300 hover:text-[#C8A45D]"
                  >
                    <span>{s.label}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Formulaire de contact réel */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 space-y-5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#131317] p-8"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  {t.contact.nameLabel}
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Prénom & Nom"
                  className="w-full rounded-lg border border-zinc-300 dark:border-white/15 bg-[#FAF9F6] dark:bg-[#0B0B0D] px-4 py-2.5 text-sm text-[#0B0B0D] dark:text-white focus:border-[#C8A45D] focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  {t.contact.emailLabel}
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="w-full rounded-lg border border-zinc-300 dark:border-white/15 bg-[#FAF9F6] dark:bg-[#0B0B0D] px-4 py-2.5 text-sm text-[#0B0B0D] dark:text-white focus:border-[#C8A45D] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="contact-subject"
                className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                {t.contact.subjectLabel}
              </label>
              <input
                id="contact-subject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={
                  lang === 'fr'
                    ? 'Opportunité professionnelle, projet web ou collaboration'
                    : 'Career opportunity, web project, or collaboration'
                }
                className="w-full rounded-lg border border-zinc-300 dark:border-white/15 bg-[#FAF9F6] dark:bg-[#0B0B0D] px-4 py-2.5 text-sm text-[#0B0B0D] dark:text-white focus:border-[#C8A45D] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="contact-message"
                className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                {t.contact.messageLabel}
              </label>
              <textarea
                id="contact-message"
                rows={5}
                required
                minLength={10}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  lang === 'fr'
                    ? 'Décrivez votre besoin ou votre proposition...'
                    : 'Describe your inquiry or proposal...'
                }
                className="w-full rounded-lg border border-zinc-300 dark:border-white/15 bg-[#FAF9F6] dark:bg-[#0B0B0D] px-4 py-2.5 text-sm text-[#0B0B0D] dark:text-white focus:border-[#C8A45D] focus:outline-none"
              />
            </div>

            {feedback && (
              <div
                role="status"
                className={`flex items-start gap-2.5 rounded-lg border p-3.5 text-xs leading-relaxed ${
                  feedback.type === 'success'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
                    : 'border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200'
                }`}
              >
                {feedback.type === 'success' && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B0B0D] dark:bg-[#C8A45D] px-6 py-3 text-sm font-semibold text-white dark:text-[#0B0B0D] hover:opacity-90 disabled:opacity-60 transition-opacity cursor-pointer"
            >
              <Send className="h-4 w-4" />
              <span>{submitting ? t.contact.sending : t.contact.sendBtn}</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
