import { useState } from 'react';
import { Menu, X, BookOpen, Shield, Award, Sparkles } from 'lucide-react';
import ShivajiCollegeLogo from './ShivajiCollegeLogo';
import DelhiUniversityLogo from './DelhiUniversityLogo';
import { JOURNAL_INFO } from '../data/journalData';
import { useJournal } from '../context/JournalContext';

export type NavTab = 
  | 'home' 
  | 'about' 
  | 'journal-info'
  | 'current-issue' 
  | 'archives' 
  | 'repository' 
  | 'editorial-board' 
  | 'authors' 
  | 'contact';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenReaderModal: () => void;
  onOpenDeveloperPortal?: () => void;
  onOpenEditorialPortal?: () => void;
}

export default function Header({ 
  activeTab, 
  onSelectTab, 
  onOpenReaderModal,
  onOpenDeveloperPortal,
  onOpenEditorialPortal
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDummyContentEnabled } = useJournal();

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About & Scope' },
    { id: 'current-issue', label: 'Current Issue' },
    { id: 'archives', label: 'Archives & Repository' },
    { id: 'editorial-board', label: 'Editorial Board' },
    { id: 'authors', label: 'For Authors' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (tab: NavTab) => {
    setMobileMenuOpen(false);
    onSelectTab(tab);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0B192C] text-white border-b border-slate-800 shadow-lg">
      {/* 1. Institutional Top Bar */}
      <div className="bg-[#050D18] text-slate-300 border-b border-slate-800/80 text-[10px] sm:text-xs py-1.5 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 sm:gap-2 tracking-wide font-sans font-medium text-slate-300">
            <span className="text-[#E0C58A] font-semibold">SHIVAJI COLLEGE, UNIVERSITY OF DELHI</span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="text-slate-400 hidden md:inline">NAAC ACCREDITED GRADE &apos;A&apos;</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-slate-400 text-[10px] sm:text-[11px] font-sans">
            <span className="font-mono text-amber-300 font-medium">ISSN: {JOURNAL_INFO.issn}</span>
            <span className="text-slate-600">•</span>
            <span>Biannual Peer-Reviewed Academic Serial</span>

            {/* Quick Portal Switchers */}
            {onOpenEditorialPortal && (
              <>
                <span className="text-slate-600 hidden sm:inline">•</span>
                <button
                  type="button"
                  onClick={onOpenEditorialPortal}
                  className="inline-flex items-center gap-1 text-indigo-300 hover:text-white px-2 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-colors cursor-pointer"
                  title="Internal Peer Review and Referee Desk"
                >
                  <Award className="w-3 h-3 text-indigo-400" />
                  <span className="font-medium">Editorial Portal</span>
                </button>
              </>
            )}

            {onOpenDeveloperPortal && isDummyContentEnabled && (
              <button
                type="button"
                onClick={onOpenDeveloperPortal}
                className="inline-flex items-center gap-1.5 text-amber-300 hover:text-white px-2 py-0.5 rounded bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 transition-colors cursor-pointer"
                title="Dummy Mode is currently active (Click to manage or turn off in Developer Console)"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="font-medium">Dummy Mode</span>
                <span className="text-[9px] px-1 rounded bg-amber-400/20 text-amber-200 font-bold uppercase tracking-wider">
                  ON
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Navigation */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[4.5rem] sm:min-h-[5.5rem] py-2 sm:py-2.5">
          
          {/* Left: Dual Crests (Shivaji College + University of Delhi) & Institutional Identity */}
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 sm:gap-3 group text-left cursor-pointer focus:outline-none min-w-0"
          >
            <div className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 bg-white/10 rounded-xl sm:rounded-2xl border border-white/20 shadow-md group-hover:border-amber-400/50 transition-all shrink-0">
              <div className="block sm:hidden">
                <ShivajiCollegeLogo size={36} className="group-hover:scale-105 transition-transform" />
              </div>
              <div className="hidden sm:block">
                <ShivajiCollegeLogo size={62} className="group-hover:scale-105 transition-transform" />
              </div>

              <div className="block sm:hidden">
                <DelhiUniversityLogo size={36} className="group-hover:scale-105 transition-transform" />
              </div>
              <div className="hidden sm:block">
                <DelhiUniversityLogo size={62} className="group-hover:scale-105 transition-transform" />
              </div>
            </div>

            <div className="flex flex-col pl-2 sm:pl-3 border-l-2 border-amber-400/35 min-w-0">
              <span className="font-serif text-sm sm:text-lg md:text-xl font-bold tracking-tight text-white leading-tight truncate">
                Shivaji College
              </span>
              <span className="text-[11px] sm:text-xs text-amber-300 font-sans tracking-wide font-medium truncate">
                University of Delhi
              </span>
              <span className="text-[9px] sm:text-[10px] md:text-[11px] text-[#E0C58A] font-serif tracking-wider font-semibold uppercase mt-0.5 truncate" title={JOURNAL_INFO.name}>
                {JOURNAL_INFO.name}
              </span>
            </div>
          </button>

          {/* Center: Primary Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center justify-center gap-0.5 xl:gap-1 text-xs xl:text-sm font-medium">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`relative inline-flex items-center justify-center whitespace-nowrap py-2 px-2.5 xl:px-3 rounded-lg transition-colors cursor-pointer text-xs xl:text-[13px] font-medium ${
                    isActive ? 'text-amber-300 font-semibold bg-white/10' : 'text-slate-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-2.5 right-2.5 h-0.5 bg-[#C5A059] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Read Inaugural Issue Crimson Pill Button (Desktop) */}
          <div className="hidden lg:flex items-center shrink-0 ml-2">
            <button
              type="button"
              id="header-read-inaugural-btn"
              onClick={onOpenReaderModal}
              className="inline-flex items-center justify-center px-4 h-[40px] rounded-full bg-[#781D26] hover:bg-[#8E222D] text-white text-xs font-semibold tracking-wide shadow-md transition-all transform hover:scale-[1.02] cursor-pointer whitespace-nowrap"
            >
              <span>Read Issue 1</span>
            </button>
          </div>

          {/* Mobile Hamburger Menu Button */}
          <div className="flex lg:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-[44px] min-w-[44px] p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 focus:outline-none flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-amber-300" /> : <Menu className="w-6 h-6 text-white" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#071322] border-t border-slate-800 px-4 pt-3 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full min-h-[44px] text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-white/10 text-amber-300 font-semibold border-l-4 border-[#C5A059]'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile CTA inside Hamburger Drawer */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenReaderModal();
              }}
              className="w-full min-h-[46px] py-3 px-4 rounded-full bg-[#781D26] hover:bg-[#8E222D] text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>Read Inaugural Issue (Vol. 1, Issue 1)</span>
            </button>

            <div className={`grid ${onOpenDeveloperPortal && isDummyContentEnabled ? 'grid-cols-2' : 'grid-cols-1'} gap-2 pt-1`}>
              {onOpenEditorialPortal && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenEditorialPortal();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Editorial Desk</span>
                </button>
              )}

              {onOpenDeveloperPortal && isDummyContentEnabled && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenDeveloperPortal();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dummy Mode ON</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
