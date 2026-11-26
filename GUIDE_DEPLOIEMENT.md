# Guide complet d'installation, de gestion et de déploiement — Portfolio Cherif Balde

Ce guide explique simplement comment comprendre, modifier, exécuter et publier votre site web professionnel sur Internet avec le domaine **cherifbalde.com**.

---

## 1. Structure des dossiers du projet

- `index.html` : Page HTML principale, métadonnées SEO (Google, OpenGraph, Twitter) et favicon personnalisé `CB`.
- `server.ts` : Serveur Node.js / Express qui gère les routes API sécurisées (`/api/*`), le téléchargement du CV en PDF, le formulaire de contact, l'authentification administrateur et le stockage persistant.
- `server/` :
  - `auth.ts` : Hachage des mots de passe (`scrypt`) et jetons de session signés.
  - `storage.ts` : Sauvegarde persistante des données (`data/db.json`) et des fichiers uploadés (`data/uploads/`).
  - `pdfGenerator.ts` : Génération dynamique du CV au format PDF si aucun fichier PDF personnalisé n'est uploadé.
- `src/` :
  - `context/AppContext.tsx` : Gestion du thème (Sombre / Clair), de la langue (`FR` / `EN`), du routeur et de l'état global.
  - `i18n/translations.ts` : Dictionnaire bilingue Français / Anglais.
  - `components/sections/` : Toutes les sections et pages du portfolio (Accueil, À propos, Parcours, Compétences, Projets, Expériences, Langues, Objectifs, Centres d'intérêt, Galerie, Contact).
  - `pages/AdminPage.tsx` : Tableau de bord administrateur accessible sur `/admin`.
- `supabase/schema.sql` : Script SQL prêt à l'emploi si vous souhaitez migrer vers Supabase.

---

## 2. Commandes dans le terminal VS Code

1. **Installer les dépendances :**
   ```bash
   npm install
   ```
2. **Créer le fichier `.env` à partir de `.env.example` :**
   ```bash
   cp .env.example .env
   ```
3. **Lancer le site en mode développement (frontend + backend sur le port 3000) :**
   ```bash
   npm run dev
   ```
4. **Vérifier les types TypeScript :**
   ```bash
   npm run lint
   ```
5. **Construire le site pour la production :**
   ```bash
   npm run build
   npm start
   ```

---

## 3. Configuration de l'Administration (`/admin`) et des Secrets

- Ouvrez l'URL `/admin` (un lien discret « Administration » se trouve également en bas de page).
- Lors de la première visite (si `ADMIN_PASSWORD` n'est pas défini dans `.env`), un formulaire sécurisé vous permet de **créer votre mot de passe administrateur**. Il est haché côté serveur avec `scrypt` et stocké de manière sécurisée.
- Vous pouvez aussi définir `ADMIN_PASSWORD` directement dans les variables d'environnement (ou Secrets) pour imposer un mot de passe serveur prioritaire.
- **Envoi d'emails réel via le formulaire de contact :**
  1. Créez un compte gratuit sur [Resend](https://resend.com).
  2. Générez une clé API et ajoutez `RESEND_API_KEY` dans `.env` (ou dans les secrets de votre hébergeur).
  3. Tous les messages sont dans tous les cas enregistrés dans l'onglet **Messages** de `/admin`.

---

## 4. Configuration optionnelle de Supabase (Base de données & Stockage cloud)

1. Créez un compte sur [supabase.com](https://supabase.com) et cliquez sur **New Project**.
2. Ouvrez **SQL Editor** dans votre tableau de bord Supabase.
3. Copiez le contenu du fichier `supabase/schema.sql` et cliquez sur **Run**.
4. Dans **Authentication → Providers**, activez **Email** et créez votre utilisateur administrateur.
5. Dans **Project Settings → API**, copiez `Project URL` (`SUPABASE_URL`) et `anon public key` (`SUPABASE_ANON_KEY`) dans vos variables d'environnement.

---

## 5. Connexion à GitHub

Dans le terminal VS Code :

```bash
git init
git add .
git commit -m "Initialisation du portfolio professionnel de Cherif Balde"
git branch -M main
git remote add origin https://github.com/VOTRE_COMPTE/cherifbalde-portfolio.git
git push -u origin main
```

---

## 6. Déploiement en ligne & Domaine `cherifbalde.com`

> **Note importante :** Ce projet inclut un serveur Express (`server.ts`) pour la persistance des fichiers uploadés et l'API backend. Vous pouvez le déployer sur **Render**, **Railway**, **Fly.io** ou **Cloud Run** (avec `npm run build` et `npm start`), ou utiliser **Vercel** en connectant les routes `/api/*` avec Supabase.

### Étapes sur Vercel (ou hébergeur Node.js) :
1. Connectez votre dépôt GitHub à votre compte Vercel / hébergeur.
2. Ajoutez vos variables d'environnement (`ADMIN_PASSWORD`, `RESEND_API_KEY`, etc.).
3. Lancez le déploiement (`npm run build` / `npm start`).

### Connexion du domaine `cherifbalde.com` :
1. Dans les paramètres de votre projet hébergé, ouvrez **Domains** et ajoutez `cherifbalde.com` ainsi que `www.cherifbalde.com`.
2. Chez votre bureau d'enregistrement de domaine (Namecheap, Cloudflare, OVH, etc.), ouvrez la zone **DNS** et ajoutez :
   - **Enregistrement A** : Nom `@` → Valeur IP fournie par votre hébergeur (ex. Vercel : `76.76.21.21`).
   - **Enregistrement CNAME** : Nom `www` → Valeur CNAME fournie par votre hébergeur (ex. `cname.vercel-dns.com`).
3. Attendez quelques minutes la propagation DNS : le certificat HTTPS (SSL) s'active automatiquement.
