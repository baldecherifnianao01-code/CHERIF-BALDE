import { AppProvider, useApp } from './context/AppContext.tsx';
import { Footer } from './components/Footer.tsx';
import { Navbar } from './components/Navbar.tsx';
import { UtilityDock } from './components/UtilityDock.tsx';
import { AboutSection } from './components/sections/AboutSection.tsx';
import { ContactSection } from './components/sections/ContactSection.tsx';
import { EducationSection } from './components/sections/EducationSection.tsx';
import { ExperienceSection } from './components/sections/ExperienceSection.tsx';
import { GallerySection } from './components/sections/GallerySection.tsx';
import { HeroSection } from './components/sections/HeroSection.tsx';
import { InterestsSection } from './components/sections/InterestsSection.tsx';
import { LanguagesSection } from './components/sections/LanguagesSection.tsx';
import { ObjectivesSection } from './components/sections/ObjectivesSection.tsx';
import { ProjectsSection } from './components/sections/ProjectsSection.tsx';
import { SkillsSection } from './components/sections/SkillsSection.tsx';
import { AdminPage } from './pages/AdminPage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';

function PortfolioRouter() {
  const { currentPath, loading, error, refreshPortfolio } = useApp();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] dark:bg-[#0B0B0D]">
        <div className="text-center space-y-3">
          <div className="mx-auto h-10 w-10 rounded-full border-2 border-[#C8A45D] border-t-transparent animate-spin" />
          <p className="font-display text-xl text-[#0B0B0D] dark:text-white">Cherif Balde</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] dark:bg-[#0B0B0D] px-6">
        <div className="max-w-md rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#131317] p-8 text-center">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">{error}</p>
          <button
            type="button"
            onClick={() => void refreshPortfolio()}
            className="mt-4 rounded-lg bg-[#0B0B0D] dark:bg-[#C8A45D] px-4 py-2 text-xs font-semibold text-white dark:text-[#0B0B0D] cursor-pointer"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const renderRoute = () => {
    switch (currentPath) {
      case '/':
        return (
          <main>
            <HeroSection />
            <AboutSection />
            <EducationSection />
            <SkillsSection />
            <ProjectsSection />
            <ExperienceSection />
            <LanguagesSection />
            <ObjectivesSection />
            <InterestsSection />
            <GallerySection />
            <ContactSection />
          </main>
        );
      case '/a-propos':
        return (
          <main>
            <AboutSection />
          </main>
        );
      case '/parcours':
        return (
          <main>
            <EducationSection />
          </main>
        );
      case '/competences':
        return (
          <main>
            <SkillsSection />
          </main>
        );
      case '/projets':
        return (
          <main>
            <ProjectsSection />
          </main>
        );
      case '/experiences':
        return (
          <main>
            <ExperienceSection />
          </main>
        );
      case '/langues':
        return (
          <main>
            <LanguagesSection />
          </main>
        );
      case '/objectifs':
        return (
          <main>
            <ObjectivesSection />
          </main>
        );
      case '/centres-interet':
        return (
          <main>
            <InterestsSection />
          </main>
        );
      case '/galerie':
        return (
          <main>
            <GallerySection />
          </main>
        );
      case '/contact':
        return (
          <main>
            <ContactSection />
          </main>
        );
      case '/admin':
        return <AdminPage />;
      default:
        return <NotFoundPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#0B0B0D] dark:bg-[#0B0B0D] dark:text-white transition-colors duration-200">
      <Navbar />
      <div className="flex-1">{renderRoute()}</div>
      <Footer />
      <UtilityDock />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <PortfolioRouter />
    </AppProvider>
  );
}
