/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Header, { NavTab } from './components/Header';
import Hero from './components/Hero';
import JournalInformationSection from './components/JournalInformationSection';
import AboutSection from './components/AboutSection';
import CurrentIssueSection from './components/CurrentIssueSection';
import UnifiedArchivesRepositorySection from './components/UnifiedArchivesRepositorySection';
import EditorialBoard from './components/EditorialBoard';
import ForAuthorsSection from './components/ForAuthorsSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import IssueReaderModal from './components/IssueReaderModal';
import CitationModal from './components/CitationModal';
import SubmitManuscriptModal from './components/SubmitManuscriptModal';
import DedicatedArticlePage from './components/DedicatedArticlePage';
import DeveloperPortal from './components/DeveloperPortal';
import EditorialPortal from './components/EditorialPortal';
import { JournalArticle } from './types';
import { INAUGURAL_ARTICLES, getArticleBySlug } from './data/journalData';
import { useJournal } from './context/JournalContext';

export default function App() {
  const { allArticles } = useJournal();
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [dedicatedArticle, setDedicatedArticle] = useState<JournalArticle | null>(null);
  const [portalMode, setPortalMode] = useState<'none' | 'developer' | 'editorial'>('none');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('All');

  const [readerModalOpen, setReaderModalOpen] = useState(false);
  const [selectedArticleForReader, setSelectedArticleForReader] = useState<JournalArticle | null>(null);

  const [citationModalOpen, setCitationModalOpen] = useState(false);
  const [selectedArticleForCitation, setSelectedArticleForCitation] = useState<JournalArticle | null>(null);

  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);

  // Smooth scroll to target section accounting for fixed/sticky header offset
  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(sectionId);
    if (el) {
      const header = document.querySelector('header');
      const headerHeight = header ? header.getBoundingClientRect().height : 95;
      const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
      // Section aligns naturally below fixed header with clear margin
      const offsetPosition = Math.max(0, elementPosition - headerHeight - 8);
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Sync URL for dedicated article routing, portals, and back/forward browser history
  useEffect(() => {
    const parseRouteFromLocation = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;

      // Portal routing (supports pathnames and hash routes for /admin and /editorial-dashboard)
      if (
        hash === '#/dev-portal' || 
        hash === '#/developer' || 
        hash === '#developer' || 
        hash === '#/admin' || 
        hash === '#admin' ||
        path === '/admin'
      ) {
        setPortalMode('developer');
        setDedicatedArticle(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (
        hash === '#/editorial-portal' || 
        hash === '#/editorial' || 
        hash === '#editorial' || 
        hash === '#/editorial-dashboard' || 
        hash === '#editorial-dashboard' ||
        path === '/editorial-dashboard'
      ) {
        setPortalMode('editorial');
        setDedicatedArticle(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      setPortalMode('none');

      let slug: string | null = null;
      if (hash.startsWith('#/articles/')) {
        slug = hash.replace('#/articles/', '').split('/')[0].split('?')[0];
      } else if (path.includes('/articles/')) {
        const parts = path.split('/articles/');
        slug = parts[1]?.split('/')[0].split('?')[0] || null;
      }

      if (slug) {
        const found = allArticles.find(a => a.slug === slug) || getArticleBySlug(slug);
        if (found) {
          setDedicatedArticle(found);
          setReaderModalOpen(false);
          return;
        }
      }

      // If no article in path/hash, or navigating back home
      if (!path.includes('/articles/') && !hash.startsWith('#/articles/')) {
        setDedicatedArticle(null);
      }
    };

    parseRouteFromLocation();

    window.addEventListener('popstate', parseRouteFromLocation);
    window.addEventListener('hashchange', parseRouteFromLocation);
    return () => {
      window.removeEventListener('popstate', parseRouteFromLocation);
      window.removeEventListener('hashchange', parseRouteFromLocation);
    };
  }, [allArticles]);

  // Handle hash scrolling on direct load
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && !hash.startsWith('#/articles/') && !hash.includes('portal') && !hash.includes('developer') && !hash.includes('editorial')) {
      const targetId = hash.replace('#', '');
      const timer = setTimeout(() => {
        scrollToSection(targetId);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Track scroll position to update active navbar link gracefully
  useEffect(() => {
    if (dedicatedArticle || portalMode !== 'none') return;

    const handleScroll = () => {
      if (window.scrollY < 200) {
        setActiveTab('home');
        return;
      }

      const sectionIds: NavTab[] = [
        'contact',
        'authors',
        'editorial-board',
        'repository',
        'archives',
        'current-issue',
        'about'
      ];
      const header = document.querySelector('header');
      const headerHeight = header ? header.getBoundingClientRect().height : 95;
      const scrollPos = window.scrollY + headerHeight + 100;

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.pageYOffset;
          if (scrollPos >= top) {
            setActiveTab(id);
            return;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dedicatedArticle, portalMode]);

  // Handlers
  const handleOpenInauguralIssue = () => {
    setSelectedArticleForReader(null); // Shows volume cover / preface
    setReaderModalOpen(true);
  };

  const handleOpenDigitalReaderForArticle = (article?: JournalArticle) => {
    if (article) {
      setSelectedArticleForReader(article);
    }
    setReaderModalOpen(true);
  };

  const handleOpenDedicatedArticle = (article: JournalArticle) => {
    setDedicatedArticle(article);
    setPortalMode('none');
    setReaderModalOpen(false);
    window.location.hash = `#/articles/${article.slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToRepository = () => {
    setDedicatedArticle(null);
    setPortalMode('none');
    setActiveTab('archives');
    if (window.location.hash.startsWith('#/articles')) {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
    setTimeout(() => {
      scrollToSection('archives');
    }, 60);
  };

  const handleBackToArchives = () => {
    setDedicatedArticle(null);
    setPortalMode('none');
    setActiveTab('archives');
    if (window.location.hash.startsWith('#/articles')) {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
    setTimeout(() => {
      scrollToSection('archives');
    }, 60);
  };

  const handleSelectTab = (tab: NavTab) => {
    const wasOnDedicatedArticle = !!dedicatedArticle || portalMode !== 'none';
    setDedicatedArticle(null);
    setPortalMode('none');
    setActiveTab(tab);
    if (window.location.hash.startsWith('#/articles') || window.location.hash.includes('portal')) {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }

    if (wasOnDedicatedArticle) {
      setTimeout(() => {
        scrollToSection(tab);
      }, 60);
    } else {
      scrollToSection(tab);
    }
  };

  const handleSelectDiscipline = (discipline: string) => {
    setPortalMode('none');
    setSelectedDiscipline(discipline);
    scrollToSection('archives');
  };

  const handleOpenCitation = (article: JournalArticle) => {
    setSelectedArticleForCitation(article);
    setCitationModalOpen(true);
  };

  const handleOpenDeveloperPortal = () => {
    setDedicatedArticle(null);
    setPortalMode('developer');
    window.location.hash = '#/dev-portal';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenEditorialPortal = () => {
    setDedicatedArticle(null);
    setPortalMode('editorial');
    window.location.hash = '#/editorial-portal';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in Developer Portal mode
  if (portalMode === 'developer') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
        <DeveloperPortal
          onBackToWebsite={() => {
            setPortalMode('none');
            window.location.hash = '';
          }}
          onOpenEditorialPortal={handleOpenEditorialPortal}
          onOpenDedicatedArticle={handleOpenDedicatedArticle}
        />
        <SubmitManuscriptModal
          isOpen={submissionModalOpen}
          onClose={() => setSubmissionModalOpen(false)}
        />
      </div>
    );
  }

  // If in Editorial Peer Review Portal mode
  if (portalMode === 'editorial') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
        <EditorialPortal
          onBackToWebsite={() => {
            setPortalMode('none');
            window.location.hash = '';
          }}
          onOpenDeveloperPortal={handleOpenDeveloperPortal}
        />
        <SubmitManuscriptModal
          isOpen={submissionModalOpen}
          onClose={() => setSubmissionModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 font-sans flex flex-col selection:bg-amber-100 selection:text-amber-900">
      {/* 1. Institutional Top Bar & 2. Main Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenReaderModal={handleOpenInauguralIssue}
        onOpenDeveloperPortal={handleOpenDeveloperPortal}
        onOpenEditorialPortal={handleOpenEditorialPortal}
      />

      <main className="flex-1">
        {/* Dedicated Article Page (Rendered when an article is open via /articles/[slug]) */}
        {dedicatedArticle ? (
          <DedicatedArticlePage
            article={dedicatedArticle}
            onBackToRepository={handleBackToRepository}
            onBackToArchives={handleBackToArchives}
            onSelectArticle={handleOpenDedicatedArticle}
            onOpenCitationModal={handleOpenCitation}
            onOpenDigitalReader={handleOpenDigitalReaderForArticle}
          />
        ) : (
          /* Unified Single-Page Academic Layout */
          <div className="space-y-0">
            {/* 3. Hero Section & Commemoration Badge */}
            <Hero
              onReadInauguralClick={handleOpenInauguralIssue}
              onExploreIssueClick={() => scrollToSection('archives')}
            />

            {/* Official Journal Particulars, Scope & Publisher Overview */}
            <JournalInformationSection
              onOpenGuidelines={() => scrollToSection('authors')}
              onOpenArchives={() => scrollToSection('archives')}
              onOpenSubmit={() => setSubmissionModalOpen(true)}
            />

            {/* About the Journal, Academic Pillars & Disciplinary Scope */}
            <AboutSection
              isStandalonePage={false}
              onSelectDiscipline={handleSelectDiscipline}
            />

            {/* Current Issue (Inaugural Issue Vol. 1, Issue 1, Jan-June 2026) */}
            <CurrentIssueSection
              isStandalonePage={false}
              onOpenVolumeReader={handleOpenInauguralIssue}
            />

            {/* Unified Archives & Research Repository Section (Combined as requested) */}
            <UnifiedArchivesRepositorySection
              onSelectArticle={handleOpenDedicatedArticle}
              onOpenCitationModal={handleOpenCitation}
              onOpenSubmitModal={() => setSubmissionModalOpen(true)}
              initialDiscipline={selectedDiscipline}
            />

            {/* Editorial Board & Academic Council with Full Institutional Profiles */}
            <EditorialBoard />

            {/* Information For Authors (Guidelines, Ethics, Formatting & Plagiarism) */}
            <ForAuthorsSection
              onOpenSubmitModal={() => setSubmissionModalOpen(true)}
            />

            {/* Institutional Contact & Publisher Inquiries */}
            <ContactSection isStandalonePage={false} />
          </div>
        )}
      </main>

      {/* Institutional Footer */}
      <Footer
        onSelectTab={handleSelectTab}
        onOpenDeveloperPortal={handleOpenDeveloperPortal}
        onOpenEditorialPortal={handleOpenEditorialPortal}
      />

      {/* Interactive Modals */}
      <IssueReaderModal
        isOpen={readerModalOpen}
        onClose={() => setReaderModalOpen(false)}
        initialArticle={selectedArticleForReader}
        onOpenCitation={(article) => {
          setSelectedArticleForCitation(article);
          setCitationModalOpen(true);
        }}
        onOpenDedicatedArticle={handleOpenDedicatedArticle}
      />

      <CitationModal
        isOpen={citationModalOpen}
        onClose={() => setCitationModalOpen(false)}
        article={selectedArticleForCitation || INAUGURAL_ARTICLES[0]}
      />

      <SubmitManuscriptModal
        isOpen={submissionModalOpen}
        onClose={() => setSubmissionModalOpen(false)}
      />
    </div>
  );
}
