export type EducationStatus = 'completed' | 'planned';

export type SkillCategory = 'web' | 'multimedia' | 'tools';

export type ProjectStatus = 'completed' | 'in_progress' | 'concept' | 'upcoming';

export type GalleryCategory =
  | 'portrait'
  | 'professional'
  | 'workspace'
  | 'presentation'
  | 'event'
  | 'other';

export interface SocialLinkItem {
  id: string;
  label: string;
  url: string;
}

export interface SiteTexts {
  heroEyebrow: string;
  heroEyebrowEn: string;
  aboutHeading: string;
  aboutHeadingEn: string;
  educationHeading: string;
  educationHeadingEn: string;
  skillsHeading: string;
  skillsHeadingEn: string;
  projectsHeading: string;
  projectsHeadingEn: string;
  experienceHeading: string;
  experienceHeadingEn: string;
  languagesHeading: string;
  languagesHeadingEn: string;
  interestsHeading: string;
  interestsHeadingEn: string;
  galleryHeading: string;
  galleryHeadingEn: string;
  contactHeading: string;
  contactHeadingEn: string;
}

export interface ProfileData {
  fullName: string;
  title: string;
  titleEn: string;
  tagline: string;
  taglineEn: string;
  shortBio: string;
  shortBioEn: string;
  aboutParagraphs: string[];
  aboutParagraphsEn: string[];
  location: string;
  locationEn: string;
  availability: string;
  availabilityEn: string;
  email: string;
  phone: string;
  whatsapp: string;
  website: string;
  githubUrl: string;
  tiktokUrl: string;
  linkedinUrl: string;
  otherSocials: SocialLinkItem[];
  heroPhotoId: string | null;
  aboutPhotoId: string | null;
  cvFileUrl: string | null;
  cvFileName: string | null;
  analyticsId: string;
  siteTexts: SiteTexts;
}

export interface EducationItem {
  id: string;
  period: string;
  title: string;
  titleEn: string;
  institution: string;
  institutionEn: string;
  status: EducationStatus;
  certificateUrl: string | null;
  certificateName: string | null;
}

export interface SkillItem {
  id: string;
  category: SkillCategory;
  name: string;
  nameEn: string;
  level: number | null;
  levelLabel: string;
  levelLabelEn: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  technologies: string[];
  imageUrl: string;
  projectUrl: string;
  githubUrl: string;
  status: ProjectStatus;
}

export interface ExperienceItem {
  id: string;
  role: string;
  roleEn: string;
  department: string;
  departmentEn: string;
  location: string;
  period: string;
  responsibilities: string[];
  responsibilitiesEn: string[];
  softSkills: string[];
  softSkillsEn: string[];
}

export interface LanguageItem {
  id: string;
  name: string;
  nameEn: string;
  proficiency: string;
  proficiencyEn: string;
}

export interface ObjectivesData {
  title: string;
  titleEn: string;
  quote: string;
  quoteEn: string;
  items: string[];
  itemsEn: string[];
}

export interface InterestItem {
  id: string;
  label: string;
  labelEn: string;
  icon: string;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  caption: string;
  captionEn: string;
  category: GalleryCategory;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
  emailDelivered: boolean;
}

export interface AdminCredential {
  salt: string;
  hash: string;
  updatedAt: string;
}

export interface PortfolioData {
  profile: ProfileData;
  education: EducationItem[];
  skills: SkillItem[];
  projects: ProjectItem[];
  experiences: ExperienceItem[];
  languages: LanguageItem[];
  objectives: ObjectivesData;
  interests: InterestItem[];
  gallery: GalleryPhoto[];
}

export interface DatabaseState {
  portfolio: PortfolioData;
  messages: ContactMessage[];
  adminCredential: AdminCredential | null;
}
