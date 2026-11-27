import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import express, { type Express, type Request, type Response } from 'express';
import {
  createSessionToken,
  extractBearerToken,
  hashPassword,
  isAdminInitialized,
  requireAdmin,
  verifyEnvPassword,
  verifyPassword,
  verifySessionToken,
} from './auth.ts';
import { generatePortfolioPdf } from './pdfGenerator.ts';
import {
  addContactMessage,
  deleteContactMessage,
  getAdminCredential,
  getContactMessages,
  getPortfolio,
  markMessageRead,
  resolveSafeUploadPath,
  saveUploadedFile,
  setAdminCredential,
  updatePortfolio,
} from './storage.ts';
import type { PortfolioData } from './types.ts';

export function createApiApp(): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '15mb' }));

  // Sécurité HTTP de base
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Lecture publique du portfolio
  app.get('/api/portfolio', async (_req, res) => {
    try {
      const data = await getPortfolio();
      res.json(data);
    } catch (error) {
      console.error('Erreur lecture portfolio:', error);
      res.status(500).json({ error: 'Impossible de charger les données du portfolio.' });
    }
  });

  // Téléchargement réel du CV PDF (uploadé ou généré dynamiquement)
  app.get('/api/cv/download', async (_req, res) => {
    try {
      const portfolio = await getPortfolio();
      if (portfolio.profile.cvFileUrl) {
        const filename = path.basename(portfolio.profile.cvFileUrl);
        const safePath = resolveSafeUploadPath(filename);
        if (safePath && fs.existsSync(safePath)) {
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', 'attachment; filename="CV-Cherif-Balde.pdf"');
          res.sendFile(safePath);
          return;
        }
      }
      const pdfBuffer = generatePortfolioPdf(portfolio);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="CV-Cherif-Balde.pdf"');
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Erreur téléchargement CV:', error);
      res.status(500).json({ error: 'Erreur lors de la génération du CV PDF.' });
    }
  });

  // Formulaire de contact réel (sauvegarde serveur + envoi email via Resend si configuré)
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, subject, message } = req.body ?? {};
      if (
        typeof name !== 'string' ||
        typeof email !== 'string' ||
        typeof subject !== 'string' ||
        typeof message !== 'string'
      ) {
        res.status(400).json({ error: 'Tous les champs sont requis.' });
        return;
      }

      const cleanName = name.trim();
      const cleanEmail = email.trim();
      const cleanSubject = subject.trim();
      const cleanMessage = message.trim();

      if (cleanName.length < 2 || cleanName.length > 120) {
        res.status(400).json({ error: 'Veuillez saisir un nom complet valide.' });
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || cleanEmail.length > 180) {
        res.status(400).json({ error: 'Veuillez saisir une adresse email valide.' });
        return;
      }
      if (cleanSubject.length < 2 || cleanSubject.length > 180) {
        res.status(400).json({ error: "Veuillez préciser l'objet du message." });
        return;
      }
      if (cleanMessage.length < 10 || cleanMessage.length > 4000) {
        res.status(400).json({ error: 'Votre message doit contenir entre 10 et 4000 caractères.' });
        return;
      }

      const portfolio = await getPortfolio();
      let emailDelivered = false;
      const resendKey = process.env.RESEND_API_KEY?.trim();
      const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() || 'Portfolio <onboarding@resend.dev>';

      if (resendKey) {
        try {
          const mailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: fromEmail,
              to: [portfolio.profile.email],
              reply_to: cleanEmail,
              subject: `[Portfolio cherifbalde.com] ${cleanSubject}`,
              text: `Nouveau message de ${cleanName} (${cleanEmail})\n\nObjet : ${cleanSubject}\n\n${cleanMessage}`,
            }),
          });
          emailDelivered = mailRes.ok;
        } catch (err) {
          console.error('Erreur envoi Resend:', err);
          emailDelivered = false;
        }
      }

      await addContactMessage({
        id: crypto.randomUUID(),
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
        createdAt: new Date().toISOString(),
        read: false,
        emailDelivered,
      });

      res.status(201).json({
        saved: true,
        emailDelivered,
        message: emailDelivered
          ? 'Votre message a bien été envoyé par email et enregistré dans la messagerie du site.'
          : 'Votre message a été enregistré dans la messagerie sécurisée du tableau de bord. Note : la notification email automatique nécessite la configuration de RESEND_API_KEY sur le serveur.',
      });
    } catch (error) {
      console.error('Erreur soumission contact:', error);
      res.status(500).json({ error: "Impossible d'enregistrer votre message pour le moment." });
    }
  });

  // Statut d'authentification administrateur
  app.get('/api/admin/status', async (req, res) => {
    try {
      const { initialized, envManaged } = await isAdminInitialized();
      const token = extractBearerToken(req);
      const authenticated = Boolean(token && verifySessionToken(token));
      res.json({ initialized, envManaged, authenticated });
    } catch (error) {
      console.error('Erreur statut admin:', error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  });

  // Configuration initiale du mot de passe admin
  app.post('/api/admin/setup', async (req, res) => {
    try {
      const { initialized } = await isAdminInitialized();
      if (initialized) {
        res.status(403).json({ error: 'Le compte administrateur est déjà configuré.' });
        return;
      }
      const { password } = req.body ?? {};
      if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
        res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' });
        return;
      }
      const { salt, hash } = hashPassword(password);
      await setAdminCredential({
        salt,
        hash,
        updatedAt: new Date().toISOString(),
      });
      const token = createSessionToken();
      res.status(201).json({ token });
    } catch (error) {
      console.error('Erreur setup admin:', error);
      res.status(500).json({ error: 'Impossible de configurer le mot de passe.' });
    }
  });

  // Connexion administrateur
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { password } = req.body ?? {};
      if (typeof password !== 'string' || !password) {
        res.status(400).json({ error: 'Mot de passe requis.' });
        return;
      }

      if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim().length > 0) {
        if (!verifyEnvPassword(password)) {
          res.status(401).json({ error: 'Mot de passe incorrect.' });
          return;
        }
        res.json({ token: createSessionToken() });
        return;
      }

      const cred = await getAdminCredential();
      if (!cred) {
        res.status(403).json({ error: "Veuillez d'abord initialiser le mot de passe administrateur." });
        return;
      }
      if (!verifyPassword(password, cred.salt, cred.hash)) {
        res.status(401).json({ error: 'Mot de passe incorrect.' });
        return;
      }
      res.json({ token: createSessionToken() });
    } catch (error) {
      console.error('Erreur login admin:', error);
      res.status(500).json({ error: 'Erreur lors de la connexion.' });
    }
  });

  // Changement de mot de passe administrateur (protégé)
  app.post('/api/admin/change-password', requireAdmin, async (req, res) => {
    try {
      if (process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim().length > 0) {
        res.status(400).json({
          error: 'Le mot de passe est actuellement géré via la variable serveur ADMIN_PASSWORD.',
        });
        return;
      }
      const { currentPassword, newPassword } = req.body ?? {};
      if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
        res.status(400).json({ error: 'Champs invalides.' });
        return;
      }
      if (newPassword.length < 8 || newPassword.length > 128) {
        res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' });
        return;
      }
      const cred = await getAdminCredential();
      if (!cred || !verifyPassword(currentPassword, cred.salt, cred.hash)) {
        res.status(401).json({ error: 'Mot de passe actuel incorrect.' });
        return;
      }
      const { salt, hash } = hashPassword(newPassword);
      await setAdminCredential({
        salt,
        hash,
        updatedAt: new Date().toISOString(),
      });
      res.json({ ok: true });
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du mot de passe.' });
    }
  });

  // Mise à jour complète des données du portfolio (protégé)
  app.put('/api/portfolio', requireAdmin, async (req, res) => {
    try {
      const body = req.body as PortfolioData;
      if (!body || typeof body !== 'object' || !body.profile || !Array.isArray(body.projects)) {
        res.status(400).json({ error: 'Structure de données invalide.' });
        return;
      }
      const updated = await updatePortfolio(body);
      res.json(updated);
    } catch (error) {
      console.error('Erreur sauvegarde portfolio:', error);
      res.status(500).json({ error: 'Erreur lors de la sauvegarde.' });
    }
  });

  // Upload sécurisé de photos (JPG/PNG/WebP) et certificats/CV (PDF) (protégé)
  app.post('/api/upload', requireAdmin, async (req, res) => {
    try {
      const { dataBase64, mimeType } = req.body ?? {};
      if (typeof dataBase64 !== 'string' || typeof mimeType !== 'string') {
        res.status(400).json({ error: 'Fichier ou type MIME manquant.' });
        return;
      }
      const saved = await saveUploadedFile(dataBase64, mimeType);
      res.status(201).json(saved);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Échec du téléversement.';
      res.status(400).json({ error: message });
    }
  });

  // Lecture, marquage lu et suppression des messages reçus (protégé)
  app.get('/api/messages', requireAdmin, async (_req, res) => {
    try {
      const messages = await getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error('Erreur lecture messages:', error);
      res.status(500).json({ error: 'Impossible de charger les messages.' });
    }
  });

  app.patch('/api/messages/:id', requireAdmin, async (req, res) => {
    try {
      const id = String(req.params.id);
      const { read } = req.body ?? {};
      if (typeof read !== 'boolean') {
        res.status(400).json({ error: 'Valeur invalide.' });
        return;
      }
      const ok = await markMessageRead(id, read);
      if (!ok) {
        res.status(404).json({ error: 'Message introuvable.' });
        return;
      }
      res.json({ ok: true });
    } catch (error) {
      console.error('Erreur mise à jour message:', error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  });

  app.delete('/api/messages/:id', requireAdmin, async (req, res) => {
    try {
      const id = String(req.params.id);
      const ok = await deleteContactMessage(id);
      if (!ok) {
        res.status(404).json({ error: 'Message introuvable.' });
        return;
      }
      res.json({ ok: true });
    } catch (error) {
      console.error('Erreur suppression message:', error);
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  });

  // Service sécurisé des fichiers uploadés (accessible via /uploads/:filename et /api/uploads/:filename)
  const serveUpload = (req: Request, res: Response) => {
    const safePath = resolveSafeUploadPath(String(req.params.filename));
    if (!safePath || !fs.existsSync(safePath)) {
      res.status(404).send('Fichier introuvable.');
      return;
    }
    res.sendFile(safePath);
  };

  app.get('/uploads/:filename', serveUpload);
  app.get('/api/uploads/:filename', serveUpload);

  return app;
}
