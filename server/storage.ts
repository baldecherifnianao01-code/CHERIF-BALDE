import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import type { AdminCredential, ContactMessage, DatabaseState, PortfolioData } from './types.ts';

const ROOT_DIR = process.cwd();
const DATA_DIR = path.resolve(ROOT_DIR, 'data');
export const UPLOADS_DIR = path.resolve(DATA_DIR, 'uploads');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

export function createInitialPortfolio(): PortfolioData {
  return {
    profile: {
      fullName: 'Cherif Balde',
      title: 'Développeur Web & Multimédia',
      titleEn: 'Web & Multimedia Developer',
      tagline: 'Je transforme les idées en expériences numériques modernes, créatives et utiles.',
      taglineEn: 'I turn ideas into modern, creative, and purposeful digital experiences.',
      shortBio:
        "Basé à Casablanca, je conçois des interfaces web épurées, accessibles et performantes en combinant développement moderne, sensibilité visuelle et rigueur technique.",
      shortBioEn:
        'Based in Casablanca, I design clean, accessible, high-performing web interfaces combining modern development, visual craft, and technical rigor.',
      aboutParagraphs: [
        'Je m’appelle Cherif BALDE. Je suis d’origine sénégalaise et je réside actuellement à Casablanca, au Maroc.',
        'Mon parcours est marqué par la volonté d’apprendre, de progresser et de construire un avenir professionnel solide.',
        'Après mes études au Sénégal, j’ai poursuivi mon parcours au Maroc dans le domaine du multimédia et des technologies du web.',
        'Je m’intéresse particulièrement au développement web, à la création de site web, au design numérique et aux nouvelles technologies.',
        'Je suis une personne motivée, sérieuse, ambitieuse et déterminée à développer continuellement mes compétences.',
        'Mon objectif est de participer à la réalisation de projets numériques innovants et d’évoluer dans un environnement professionnel international.',
      ],
      aboutParagraphsEn: [
        'My name is Cherif BALDE. I am originally from Senegal and currently live in Casablanca, Morocco.',
        'My journey is driven by a determination to learn, grow, and build a strong professional future.',
        'After my studies in Senegal, I continued my academic path in Morocco in the field of multimedia and web technologies.',
        'I am particularly passionate about web development, website creation, digital design, and emerging technologies.',
        'I am motivated, dependable, ambitious, and committed to continuously improving my skills.',
        'My goal is to contribute to innovative digital projects and grow within an international professional environment.',
      ],
      location: 'Casablanca, Maroc',
      locationEn: 'Casablanca, Morocco',
      availability: 'Ouvert aux opportunités professionnelles nationales et internationales',
      availabilityEn: 'Open to national and international professional opportunities',
      email: 'baldecherifnianao01@gmail.com',
      phone: '+221784179379',
      whatsapp: '+221784179379',
      website: 'https://cherifbalde.com',
      githubUrl: '',
      tiktokUrl: '',
      linkedinUrl: '',
      otherSocials: [],
      heroPhotoId: null,
      aboutPhotoId: null,
      cvFileUrl: null,
      cvFileName: null,
      analyticsId: process.env.GA_MEASUREMENT_ID || '',
      siteTexts: {
        heroEyebrow: 'Identité Numérique & Portfolio',
        heroEyebrowEn: 'Digital Identity & Portfolio',
        aboutHeading: 'À propos de moi',
        aboutHeadingEn: 'About Me',
        educationHeading: 'Parcours académique',
        educationHeadingEn: 'Academic Background',
        skillsHeading: 'Compétences & Outils',
        skillsHeadingEn: 'Skills & Tools',
        projectsHeading: 'Portfolio & Projets',
        projectsHeadingEn: 'Portfolio & Projects',
        experienceHeading: 'Expériences professionnelles',
        experienceHeadingEn: 'Professional Experience',
        languagesHeading: 'Langues maîtrisées',
        languagesHeadingEn: 'Languages',
        interestsHeading: "Centres d'intérêt",
        interestsHeadingEn: 'Interests',
        galleryHeading: 'Galerie photographique',
        galleryHeadingEn: 'Photography Gallery',
        contactHeading: 'Entrer en contact',
        contactHeadingEn: 'Get in Touch',
      },
    },
    education: [
      {
        id: 'edu-2017',
        period: '2017',
        title: 'BFEM',
        titleEn: 'BFEM (Middle School Diploma)',
        institution: 'Collège de Nianao, Sénégal',
        institutionEn: 'Collège de Nianao, Senegal',
        status: 'completed',
        certificateUrl: null,
        certificateName: null,
      },
      {
        id: 'edu-2022',
        period: '2022',
        title: 'Baccalauréat série S2',
        titleEn: 'Scientific Baccalaureate (Series S2)',
        institution: 'Lycée de Pakour, Sénégal',
        institutionEn: 'Lycée de Pakour, Senegal',
        status: 'completed',
        certificateUrl: null,
        certificateName: null,
      },
      {
        id: 'edu-2023',
        period: '2022 – 2023',
        title: 'Licence 1 Physique-Chimie, Sciences de la Matière',
        titleEn: 'Bachelor Year 1 in Physics & Chemistry, Materials Science',
        institution: 'Faculté des Sciences et Techniques, Université Cheikh Anta Diop de Dakar',
        institutionEn: 'Faculty of Science & Technology, Cheikh Anta Diop University of Dakar',
        status: 'completed',
        certificateUrl: null,
        certificateName: null,
      },
      {
        id: 'edu-2024',
        period: '2023 – 2024',
        title: 'Licence 2 Physique-Chimie, Sciences de la Matière',
        titleEn: 'Bachelor Year 2 in Physics & Chemistry, Materials Science',
        institution: 'Faculté des Sciences et Techniques, Université Cheikh Anta Diop de Dakar',
        institutionEn: 'Faculty of Science & Technology, Cheikh Anta Diop University of Dakar',
        status: 'completed',
        certificateUrl: null,
        certificateName: null,
      },
      {
        id: 'edu-2026',
        period: '2025 – 2026',
        title: 'Licence professionnelle en Multimédia et Technologie du Web',
        titleEn: "Professional Bachelor's Degree in Multimedia & Web Technology",
        institution: 'IMI, Maroc',
        institutionEn: 'IMI, Morocco',
        status: 'completed',
        certificateUrl: null,
        certificateName: null,
      },
      {
        id: 'edu-master',
        period: 'Formation envisagée',
        title: 'Master en Ingénierie de conception, de développement et d’applications',
        titleEn: 'Master in Engineering of Design, Development & Applications',
        institution: 'Objectif académique supérieur',
        institutionEn: 'Planned graduate specialization',
        status: 'planned',
        certificateUrl: null,
        certificateName: null,
      },
    ],
    skills: [
      // A. Développement web
      { id: 'sk-html', category: 'web', name: 'HTML5', nameEn: 'HTML5', level: null, levelLabel: '', levelLabelEn: '' },
      { id: 'sk-css', category: 'web', name: 'CSS3', nameEn: 'CSS3', level: null, levelLabel: '', levelLabelEn: '' },
      { id: 'sk-js', category: 'web', name: 'JavaScript', nameEn: 'JavaScript', level: null, levelLabel: '', levelLabelEn: '' },
      { id: 'sk-resp', category: 'web', name: 'Responsive Design', nameEn: 'Responsive Design', level: null, levelLabel: '', levelLabelEn: '' },
      { id: 'sk-react', category: 'web', name: 'React', nameEn: 'React', level: null, levelLabel: '', levelLabelEn: '' },
      { id: 'sk-front', category: 'web', name: 'Développement Frontend', nameEn: 'Frontend Development', level: null, levelLabel: '', levelLabelEn: '' },
      { id: 'sk-back', category: 'web', name: 'Développement Backend', nameEn: 'Backend Development', level: null, levelLabel: '', levelLabelEn: '' },
      { id: 'sk-git', category: 'web', name: 'Git et GitHub', nameEn: 'Git & GitHub', level: null, levelLabel: '', levelLabelEn: '' },
      // B. Multimédia
      { id: 'sk-content', category: 'multimedia', name: 'Création de contenus numériques', nameEn: 'Digital Content Creation', level: null, levelLabel: '', levelLabelEn: '' },
      { id: 'sk-graphic', category: 'multimedia', name: 'Design graphique', nameEn: 'Graphic Design', level: null, levelLabel: '', levelLabelEn: '' },
      { id: 'sk-video', category: 'multimedia', name: 'Montage vidéo', nameEn: 'Video Editing', level: null, levelLabel: '', levelLabelEn: '' },
      { id: 'sk-visual', category: 'multimedia', name: 'Création de visuels', nameEn: 'Visual Creation', level: null, levelLabel: '', levelLabelEn: '' },
      { id: 'sk-ai', category: 'multimedia', name: 'Intelligence artificielle appliquée à la création numérique', nameEn: 'AI Applied to Digital Creation', level: null, levelLabel: '', levelLabelEn: '' },
      // C. Outils
      { id: 'sk-vscode', category: 'tools', name: 'Visual Studio Code', nameEn: 'Visual Studio Code', level: null, levelLabel: '', levelLabelEn: '' },
      { id: 'sk-github', category: 'tools', name: 'GitHub', nameEn: 'GitHub', level: null, levelLabel: '', levelLabelEn: '' },
      { id: 'sk-vercel', category: 'tools', name: 'Vercel', nameEn: 'Vercel', level: null, levelLabel: '', levelLabelEn: '' },
      { id: 'sk-aistudio', category: 'tools', name: 'Google AI Studio', nameEn: 'Google AI Studio', level: null, levelLabel: '', levelLabelEn: '' },
    ],
    projects: [
      {
        id: 'proj-elegance-africa',
        title: 'ÉLÉGANCE AFRICA',
        titleEn: 'ÉLÉGANCE AFRICA',
        description:
          'Concept de boutique de vêtements en ligne mettant en valeur une identité visuelle élégante et une expérience utilisateur moderne.',
        descriptionEn:
          'Online fashion boutique concept showcasing an elevated visual identity and modern shopping experience.',
        technologies: ['HTML5', 'CSS3', 'JavaScript', 'React', 'UI Design'],
        imageUrl: '/src/assets/images/project_elegance_africa_1795728268504.jpg',
        projectUrl: '',
        githubUrl: '',
        status: 'concept',
      },
      {
        id: 'proj-elegance-casa',
        title: 'ÉLÉGANCE CASA',
        titleEn: 'ÉLÉGANCE CASA',
        description:
          'Concept de plateforme e-commerce spécialisée dans la présentation et la vente de lunettes à Casablanca.',
        descriptionEn:
          'E-commerce platform concept dedicated to eyewear retail and curated collections in Casablanca.',
        technologies: ['React', 'Tailwind CSS', 'TypeScript', 'E-commerce UI'],
        imageUrl: '/src/assets/images/project_elegance_casa_1795728268587.jpg',
        projectUrl: '',
        githubUrl: '',
        status: 'concept',
      },
      {
        id: 'proj-event-pro',
        title: 'EVENT PRO',
        titleEn: 'EVENT PRO',
        description:
          'Concept de plateforme professionnelle dédiée à l’organisation, la planification et la réservation d’événements à Casablanca.',
        descriptionEn:
          'Professional platform concept for event planning, coordination, and booking in Casablanca.',
        technologies: ['React', 'TypeScript', 'Design System', 'Responsive'],
        imageUrl: '/src/assets/images/project_event_pro_1795728268895.jpg',
        projectUrl: '',
        githubUrl: '',
        status: 'concept',
      },
      {
        id: 'proj-niana-city',
        title: "NIANA'S CITY",
        titleEn: "NIANA'S CITY",
        description:
          'Concept de boutique en ligne et de vitrine digitale structurée pour la mise en avant de produits et collections.',
        descriptionEn:
          'Online store and digital showcase concept structured for curated product presentation.',
        technologies: ['HTML5', 'CSS3', 'JavaScript', 'Web Design'],
        imageUrl: '/src/assets/images/project_niana_city_1795728269277.jpg',
        projectUrl: '',
        githubUrl: '',
        status: 'concept',
      },
      {
        id: 'proj-personnels',
        title: 'MES PROJETS PERSONNELS',
        titleEn: 'PERSONAL PROJECTS',
        description:
          'Espace évolutif dédié à mes prochains développements d’applications web, interfaces interactives et créations multimédias.',
        descriptionEn:
          'Dedicated evolving space for upcoming web applications, interactive interfaces, and multimedia works.',
        technologies: ['React', 'TypeScript', 'Node.js', 'Multimédia'],
        imageUrl: '',
        projectUrl: '',
        githubUrl: '',
        status: 'upcoming',
      },
    ],
    experiences: [
      {
        id: 'exp-helpdesk',
        role: "Agent au centre d'appels au Maroc",
        roleEn: 'Call Center Agent in Morocco',
        department: 'Helpdesk',
        departmentEn: 'Helpdesk Support',
        location: 'Maroc',
        period: 'Expérience professionnelle',
        responsibilities: [
          'Assistance technique et accompagnement des utilisateurs.',
          'Diagnostic et résolution des incidents de premier niveau.',
          'Orientation et suivi des dossiers jusqu’à leur résolution.',
        ],
        responsibilitiesEn: [
          'Technical assistance and user guidance.',
          'First-level incident diagnostics and troubleshooting.',
          'Case routing and follow-through until full resolution.',
        ],
        softSkills: [
          'Communication professionnelle',
          'Relation client',
          'Écoute',
          'Travail en équipe',
          'Organisation',
          "Capacité d'adaptation",
        ],
        softSkillsEn: [
          'Professional Communication',
          'Customer Relations',
          'Active Listening',
          'Teamwork',
          'Organization',
          'Adaptability',
        ],
      },
    ],
    languages: [
      {
        id: 'lang-fr',
        name: 'Français',
        nameEn: 'French',
        proficiency: 'Parlé, lu et écrit',
        proficiencyEn: 'Spoken, read, and written',
      },
      {
        id: 'lang-en',
        name: 'Anglais',
        nameEn: 'English',
        proficiency: 'Lu et écrit',
        proficiencyEn: 'Read and written',
      },
      {
        id: 'lang-ff',
        name: 'Peulh',
        nameEn: 'Pulaar / Fulani',
        proficiency: 'Parlé, lu et écrit',
        proficiencyEn: 'Spoken, read, and written',
      },
      {
        id: 'lang-wo',
        name: 'Wolof',
        nameEn: 'Wolof',
        proficiency: 'Parlé',
        proficiencyEn: 'Spoken',
      },
    ],
    objectives: {
      title: "Construire aujourd'hui, innover demain",
      titleEn: 'Build Today, Innovate Tomorrow',
      quote: 'Chaque compétence acquise est une nouvelle opportunité de construire l’avenir.',
      quoteEn: 'Every skill acquired is a new opportunity to build the future.',
      items: [
        'Devenir un développeur web et applications compétent.',
        'Concevoir des solutions numériques modernes.',
        'Développer des applications utiles.',
        'Participer à des projets innovants.',
        'Continuer à me former aux nouvelles technologies.',
        'Travailler avec des entreprises et équipes internationales.',
      ],
      itemsEn: [
        'Become a proficient web and application developer.',
        'Design modern digital solutions.',
        'Build practical and impactful applications.',
        'Contribute to innovative projects.',
        'Continuously learn emerging technologies.',
        'Collaborate with international companies and teams.',
      ],
    },
    interests: [
      { id: 'int-tech', label: 'Technologie et innovation', labelEn: 'Technology & Innovation', icon: 'Cpu' },
      { id: 'int-growth', label: 'Développement personnel', labelEn: 'Personal Growth', icon: 'Compass' },
      { id: 'int-sport', label: 'Sport', labelEn: 'Sports', icon: 'Activity' },
      { id: 'int-travel', label: 'Voyages', labelEn: 'Travel', icon: 'Globe' },
      { id: 'int-read', label: 'Lecture', labelEn: 'Reading', icon: 'BookOpen' },
      { id: 'int-media', label: 'Création de contenus numériques', labelEn: 'Digital Content Creation', icon: 'Film' },
    ],
    gallery: [],
  };
}

let writeQueue: Promise<void> = Promise.resolve();

async function ensureDirs(): Promise<void> {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  await fsp.mkdir(UPLOADS_DIR, { recursive: true });
}

export async function readDatabase(): Promise<DatabaseState> {
  await ensureDirs();
  if (!fs.existsSync(DB_FILE)) {
    const initial: DatabaseState = {
      portfolio: createInitialPortfolio(),
      messages: [],
      adminCredential: null,
    };
    await writeDatabase(initial);
    return initial;
  }
  const raw = await fsp.readFile(DB_FILE, 'utf8');
  const parsed = JSON.parse(raw) as Partial<DatabaseState>;
  const defaults = createInitialPortfolio();
  return {
    portfolio: {
      ...defaults,
      ...(parsed.portfolio || {}),
      profile: {
        ...defaults.profile,
        ...(parsed.portfolio?.profile || {}),
        siteTexts: {
          ...defaults.profile.siteTexts,
          ...(parsed.portfolio?.profile?.siteTexts || {}),
        },
      },
      objectives: {
        ...defaults.objectives,
        ...(parsed.portfolio?.objectives || {}),
      },
    },
    messages: Array.isArray(parsed.messages) ? parsed.messages : [],
    adminCredential: parsed.adminCredential || null,
  };
}

export function writeDatabase(nextState: DatabaseState): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    await ensureDirs();
    const tmpFile = `${DB_FILE}.${crypto.randomBytes(6).toString('hex')}.tmp`;
    await fsp.writeFile(tmpFile, JSON.stringify(nextState, null, 2), 'utf8');
    await fsp.rename(tmpFile, DB_FILE);
  });
  return writeQueue;
}

export async function getPortfolio(): Promise<PortfolioData> {
  const db = await readDatabase();
  return db.portfolio;
}

export async function updatePortfolio(portfolio: PortfolioData): Promise<PortfolioData> {
  const db = await readDatabase();
  db.portfolio = portfolio;
  await writeDatabase(db);
  return db.portfolio;
}

export async function getAdminCredential(): Promise<AdminCredential | null> {
  const db = await readDatabase();
  return db.adminCredential;
}

export async function setAdminCredential(cred: AdminCredential): Promise<void> {
  const db = await readDatabase();
  db.adminCredential = cred;
  await writeDatabase(db);
}

export async function addContactMessage(msg: ContactMessage): Promise<void> {
  const db = await readDatabase();
  db.messages.unshift(msg);
  await writeDatabase(db);
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const db = await readDatabase();
  return db.messages;
}

export async function markMessageRead(id: string, read: boolean): Promise<boolean> {
  const db = await readDatabase();
  const target = db.messages.find((m) => m.id === id);
  if (!target) return false;
  target.read = read;
  await writeDatabase(db);
  return true;
}

export async function deleteContactMessage(id: string): Promise<boolean> {
  const db = await readDatabase();
  const next = db.messages.filter((m) => m.id !== id);
  if (next.length === db.messages.length) return false;
  db.messages = next;
  await writeDatabase(db);
  return true;
}

const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
};

function verifyMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;
  if (mimeType === 'image/jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (mimeType === 'image/png') {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  }
  if (mimeType === 'image/webp') {
    return (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  }
  if (mimeType === 'application/pdf') {
    return buffer.subarray(0, 5).toString('ascii') === '%PDF-';
  }
  return false;
}

export async function saveUploadedFile(
  dataBase64: string,
  mimeType: string
): Promise<{ filename: string; url: string }> {
  const ext = MIME_EXTENSIONS[mimeType];
  if (!ext) {
    throw new Error('Type de fichier non autorisé. Formats acceptés : JPG, PNG, WebP, PDF.');
  }
  const cleanBase64 = dataBase64.includes(',') ? dataBase64.split(',')[1] || '' : dataBase64;
  const buffer = Buffer.from(cleanBase64, 'base64');
  if (buffer.length === 0 || buffer.length > 10 * 1024 * 1024) {
    throw new Error('Taille du fichier invalide (maximum 10 Mo).');
  }
  if (!verifyMagicBytes(buffer, mimeType)) {
    throw new Error('Le contenu du fichier ne correspond pas au format déclaré.');
  }
  await ensureDirs();
  const safeFilename = `${Date.now()}-${crypto.randomUUID()}${ext}`;
  const targetPath = path.resolve(UPLOADS_DIR, safeFilename);
  if (!targetPath.startsWith(UPLOADS_DIR + path.sep)) {
    throw new Error('Chemin de stockage invalide.');
  }
  await fsp.writeFile(targetPath, buffer);
  return {
    filename: safeFilename,
    url: `/uploads/${safeFilename}`,
  };
}

export function resolveSafeUploadPath(filename: string): string | null {
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) return null;
  const resolved = path.resolve(UPLOADS_DIR, filename);
  if (!resolved.startsWith(UPLOADS_DIR + path.sep)) return null;
  return resolved;
}
