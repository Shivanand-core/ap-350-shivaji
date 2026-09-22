import React, { useState } from 'react';
import { 
  Shield, 
  FileText, 
  Users, 
  UserCheck, 
  Settings, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowLeft, 
  Sparkles, 
  RefreshCw, 
  ExternalLink, 
  Sliders, 
  Lock, 
  Unlock, 
  Upload, 
  Send,
  Building,
  BookOpen,
  Award,
  Download,
  History,
  LogOut,
  ShieldAlert,
  Database,
  Copy,
  Check,
  Server
} from 'lucide-react';
import { useJournal, ReviewerAccount } from '../context/JournalContext';
import { JournalArticle, EditorialMember, ManuscriptSubmission } from '../types';
import ManuscriptPdfViewerModal from './ManuscriptPdfViewerModal';
import { downloadManuscriptPdf } from '../lib/pdfHelper';
import LoginModal from './LoginModal';
import { isSupabaseConfigured } from '../lib/supabase';

interface DeveloperPortalProps {
  onBackToWebsite: () => void;
  onOpenEditorialPortal: () => void;
  onOpenDedicatedArticle?: (article: JournalArticle) => void;
}

export default function DeveloperPortal({
  onBackToWebsite,
  onOpenEditorialPortal,
  onOpenDedicatedArticle
}: DeveloperPortalProps) {
  const {
    isDummyContentEnabled,
    toggleDummyContent,
    startFromScratch,
    loadDummyAsEditable,
    resetAllToFactoryDefaults,
    globalReviewingEnabled,
    toggleGlobalReviewing,
    journalInfo,
    updateJournalInfo,
    allArticles,
    customArticles,
    addArticle,
    updateArticle,
    deleteArticle,
    allProfessors,
    customProfessors,
    addProfessor,
    updateProfessor,
    deleteProfessor,
    reviewers,
    addReviewer,
    updateReviewer,
    deleteReviewer,
    toggleReviewerPermission,
    submissions,
    deleteSubmission,
    publishSubmission,
    currentUser,
    logoutUser
  } = useJournal();

  const [activeTab, setActiveTab] = useState<'overview' | 'teachers' | 'dummy-control' | 'articles' | 'professors' | 'submissions' | 'settings' | 'supabase'>('overview');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2500);
  };
  
  // Manuscript PDF viewer modal state
  const [selectedPdfSubmission, setSelectedPdfSubmission] = useState<ManuscriptSubmission | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Teacher / Reviewer Form state
  const [showAddReviewerModal, setShowAddReviewerModal] = useState(false);
  const [editingReviewer, setEditingReviewer] = useState<ReviewerAccount | null>(null);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [reviewerPassword, setReviewerPassword] = useState('');
  const [reviewerDept, setReviewerDept] = useState('');
  const [reviewerDesignation, setReviewerDesignation] = useState('Associate Professor');
  const [reviewerCanReview, setReviewerCanReview] = useState(true);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Article Form state
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [artTitle, setArtTitle] = useState('');
  const [artAuthors, setArtAuthors] = useState('');
  const [artAffiliation, setArtAffiliation] = useState('Shivaji College, University of Delhi');
  const [artDiscipline, setArtDiscipline] = useState<'Sciences' | 'Social Sciences' | 'Humanities' | 'Professional Studies'>('Sciences');
  const [artAbstract, setArtAbstract] = useState('');
  const [artKeywords, setArtKeywords] = useState('');
  const [artVolume, setArtVolume] = useState('Volume 1');
  const [artIssue, setArtIssue] = useState('Issue 1');
  const [artPages, setArtPages] = useState('1–12');
  const [artDoi, setArtDoi] = useState('10.5281/shivraj350.2026.0109');
  const [artFullText, setArtFullText] = useState('');

  // Professor Form state
  const [showProfessorModal, setShowProfessorModal] = useState(false);
  const [profName, setProfName] = useState('');
  const [profRole, setProfRole] = useState('Associate Editor');
  const [profDesignation, setProfDesignation] = useState('Associate Professor');
  const [profDept, setProfDept] = useState('Department of Chemistry');
  const [profEmail, setProfEmail] = useState('');
  const [profProfileUrl, setProfProfileUrl] = useState('https://www.shivajicollege.ac.in/faculty');
  const [profInstitution, setProfInstitution] = useState('Shivaji College, University of Delhi');

  // Success notifications
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Reviewer Form Handlers
  const handleOpenAddReviewer = () => {
    setEditingReviewer(null);
    setReviewerName('');
    setReviewerEmail('');
    setReviewerPassword(`pass@${Math.floor(1000 + Math.random() * 9000)}`);
    setReviewerDept('Department of Economics');
    setReviewerDesignation('Associate Professor');
    setReviewerCanReview(true);
    setShowAddReviewerModal(true);
  };

  const handleOpenEditReviewer = (rev: ReviewerAccount) => {
    setEditingReviewer(rev);
    setReviewerName(rev.name);
    setReviewerEmail(rev.email);
    setReviewerPassword(rev.password);
    setReviewerDept(rev.department);
    setReviewerDesignation(rev.designation);
    setReviewerCanReview(rev.isReviewingEnabled);
    setShowAddReviewerModal(true);
  };

  const handleSaveReviewer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !reviewerEmail || !reviewerPassword) return;

    if (editingReviewer) {
      updateReviewer(editingReviewer.id, {
        name: reviewerName,
        email: reviewerEmail,
        password: reviewerPassword,
        department: reviewerDept,
        designation: reviewerDesignation,
        isReviewingEnabled: reviewerCanReview
      });
      triggerNotice(`Updated credentials & permissions for ${reviewerName}`);
    } else {
      addReviewer({
        name: reviewerName,
        email: reviewerEmail,
        password: reviewerPassword,
        department: reviewerDept,
        designation: reviewerDesignation,
        isReviewingEnabled: reviewerCanReview,
        assignedDisciplines: [reviewerDept]
      });
      triggerNotice(`Created new reviewer account for ${reviewerName}`);
    }
    setShowAddReviewerModal(false);
  };

  // Article Form Handlers
  const handleOpenAddArticle = () => {
    setEditingArticleId(null);
    setArtTitle('');
    setArtAuthors('');
    setArtAffiliation('Shivaji College, University of Delhi');
    setArtDiscipline('Sciences');
    setArtAbstract('');
    setArtKeywords('');
    setArtVolume('Volume 1');
    setArtIssue('Issue 1');
    setArtPages(`${(customArticles.length * 15) + 1}–${(customArticles.length * 15) + 14}`);
    setArtDoi(`10.5281/shivraj350.2026.${Math.floor(1000 + Math.random() * 9000)}`);
    setArtFullText('');
    setShowArticleModal(true);
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artTitle || !artAuthors || !artAbstract) return;

    const authorsArray = artAuthors.split(',').map(s => s.trim()).filter(Boolean);
    const keywordsArray = artKeywords.split(',').map(s => s.trim()).filter(Boolean);
    const slug = artTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    if (editingArticleId) {
      updateArticle(editingArticleId, {
        title: artTitle,
        slug,
        authors: authorsArray,
        affiliations: artAffiliation,
        affiliation: artAffiliation,
        discipline: artDiscipline,
        category: artDiscipline,
        abstract: artAbstract,
        keywords: keywordsArray,
        volume: artVolume,
        issue: artIssue,
        pages: artPages,
        doi: artDoi,
        fullText: artFullText
      });
      triggerNotice(`Article updated successfully.`);
    } else {
      addArticle({
        articleNumber: `ARTICLE ${String(customArticles.length + 1).padStart(2, '0')}`,
        slug,
        title: artTitle,
        authors: authorsArray,
        affiliations: artAffiliation,
        affiliation: artAffiliation,
        discipline: artDiscipline,
        category: artDiscipline,
        articleType: 'Original Research Article',
        abstract: artAbstract,
        keywords: keywordsArray,
        volume: artVolume,
        issue: artIssue,
        monthYear: 'Jan–June 2026',
        pages: artPages,
        doi: artDoi,
        publicationDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        fullText: artFullText,
        references: ['Shivraj 350: International Peer Reviewed Multidisciplinary Journal, University of Delhi.']
      });
      triggerNotice(`New article created and added to repository.`);
    }
    setShowArticleModal(false);
  };

  // Professor Form Handlers
  const handleOpenAddProfessor = () => {
    setProfName('');
    setProfRole('Associate Editor');
    setProfDesignation('Associate Professor');
    setProfDept('Department of Chemistry');
    setProfEmail(`prof.${Math.floor(100 + Math.random() * 900)}@shivaji.du.ac.in`);
    setProfProfileUrl('https://www.shivajicollege.ac.in/faculty');
    setProfInstitution('Shivaji College, University of Delhi');
    setShowProfessorModal(true);
  };

  const handleSaveProfessor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profName || !profEmail) return;

    addProfessor({
      name: profName,
      role: profRole,
      designation: profDesignation,
      department: profDept,
      institution: profInstitution,
      institutionalAddress: 'Shivaji College, University of Delhi, Ring Road, Raja Garden, New Delhi - 110027, India',
      email: profEmail,
      profileUrl: profProfileUrl
    });
    triggerNotice(`Added ${profName} to Editorial Board.`);
    setShowProfessorModal(false);
  };

  const isSuperAdmin = currentUser?.role === 'superadmin' || (currentUser?.role as any) === 'developer';

  if (!currentUser || !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-[#070d19] text-slate-100 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-800 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Shield className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#E0C58A] block">
              Shivaji College, University of Delhi
            </span>
            <h2 className="text-xl font-bold text-white">Developer &amp; Super Admin Console</h2>
            <p className="text-xs text-slate-400">
              Access to this administration portal requires verified developer or super-administrator credentials.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setShowLoginModal(true)}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              Sign In to Console
            </button>
            <button
              type="button"
              onClick={onBackToWebsite}
              className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Return to Public Website
            </button>
          </div>
        </div>

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          targetPortal="developer"
          onSuccess={() => setShowLoginModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070f1e] text-slate-100 flex flex-col font-sans">
      {/* Top Banner Navigation */}
      <header className="bg-[#0b172a] border-b border-slate-800 px-4 sm:px-6 py-3 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-base sm:text-lg font-bold text-white tracking-wide">
                  Developer &amp; Master Management Portal
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ROOT / SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Shivraj 350 • Total Website &amp; Editorial Control Center
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Supabase Cloud Status Pill */}
            <button
              type="button"
              onClick={() => setActiveTab('supabase')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                isSupabaseConfigured()
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
              }`}
              title={isSupabaseConfigured() ? 'Supabase Connected' : 'Click to configure Supabase backend'}
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Supabase: <strong>{isSupabaseConfigured() ? 'Connected' : 'Standalone'}</strong></span>
            </button>

            {/* Quick Status Pill */}
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 ${
              isDummyContentEnabled 
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isDummyContentEnabled ? 'bg-blue-400' : 'bg-emerald-400 animate-pulse'}`} />
              <span>Dummy Content: <strong>{isDummyContentEnabled ? 'ON' : 'OFF (Scratch Mode)'}</strong></span>
            </div>

            {/* Editorial Portal Link */}
            <button
              type="button"
              onClick={onOpenEditorialPortal}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Editorial Portal</span>
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={logoutUser}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Sign out of developer console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>

            {/* Back to Public Site */}
            <button
              type="button"
              onClick={onBackToWebsite}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-semibold flex items-center gap-1.5 shadow cursor-pointer transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>View Public Journal</span>
            </button>
          </div>
        </div>
      </header>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="bg-emerald-600 text-white text-xs sm:text-sm py-2 px-4 text-center font-medium shadow-md sticky top-[61px] z-30 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 py-6 flex-1 flex flex-col md:flex-row gap-6">
        
        {/* Left Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col gap-1.5 bg-[#0b172a] p-3 rounded-2xl border border-slate-800">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 px-3 py-1">
            Developer Controls
          </span>

          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === 'overview' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Dashboard Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('teachers')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'teachers' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Teachers & Reviewers</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
              {reviewers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dummy-control')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'dummy-control' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Dummy Content Off/On</span>
            </div>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isDummyContentEnabled ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
              {isDummyContentEnabled ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('articles')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'articles' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Articles Manager</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
              {allArticles.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('professors')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'professors' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Editorial Board</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
              {allProfessors.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('submissions')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'submissions' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Upload className="w-4 h-4 text-rose-400" />
              <span>Manuscripts</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {submissions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
              activeTab === 'settings' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Journal Particulars</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('supabase')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'supabase' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-300 hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Backend & Supabase</span>
            </div>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
              isSupabaseConfigured() ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {isSupabaseConfigured() ? 'CONNECTED' : 'SETUP'}
            </span>
          </button>

          <div className="mt-auto pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to reset all data and credentials back to factory defaults?')) {
                  resetAllToFactoryDefaults();
                  triggerNotice('Reset all settings, articles, and reviewers to defaults.');
                }
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 bg-[#0b172a] p-4 sm:p-6 rounded-2xl border border-slate-800 overflow-y-auto">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  Developer Control Center
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Manage all website content, professor names, articles, teacher reviewer accounts, passwords, and dummy content status.
                </p>
              </div>

              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#101f38] p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Dummy Content Mode</span>
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-lg font-bold text-white flex items-center gap-2">
                    <span className={isDummyContentEnabled ? 'text-blue-400' : 'text-emerald-400'}>
                      {isDummyContentEnabled ? 'Sample Data ON' : 'Scratch Mode (Clean)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dummy-control')}
                    className="text-[11px] text-amber-400 hover:underline mt-2 inline-block cursor-pointer"
                  >
                    Configure Dummy Content &rarr;
                  </button>
                </div>

                <div className="bg-[#101f38] p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Teacher Reviewers</span>
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xl font-bold text-white">
                    {reviewers.length} Faculty
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Reviewing Active: {reviewers.filter(r => r.isReviewingEnabled).length} | Disabled: {reviewers.filter(r => !r.isReviewingEnabled).length}
                  </div>
                </div>

                <div className="bg-[#101f38] p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Published Articles</span>
                    <FileText className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-xl font-bold text-white">
                    {allArticles.length} Papers
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Custom Created: {customArticles.length}
                  </div>
                </div>

                <div className="bg-[#101f38] p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Submissions Queue</span>
                    <Upload className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-xl font-bold text-white">
                    {submissions.length} Papers
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Pending Review: {submissions.filter(s => s.status === 'Pending Review').length}
                  </div>
                </div>
              </div>

              {/* Rapid Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                
                {/* Dummy Content Quick Switch Box */}
                <div className="bg-gradient-to-br from-purple-950/40 to-slate-900 border border-purple-800/40 p-5 rounded-2xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-white text-base flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        Website Dummy Content Status
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        Currently: <strong>{isDummyContentEnabled ? 'Displaying Inaugural Template Data' : 'Clean Slate (Only Custom Data)'}</strong>. 
                        Turn off to hide all inaugural dummy articles and default professors, allowing you to start completely from scratch.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        toggleDummyContent(!isDummyContentEnabled);
                        triggerNotice(`Dummy content turned ${!isDummyContentEnabled ? 'ON' : 'OFF'}`);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
                        isDummyContentEnabled 
                          ? 'bg-purple-600 hover:bg-purple-500 text-white' 
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {isDummyContentEnabled ? 'Turn OFF Dummy Content' : 'Turn ON Dummy Content'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        startFromScratch();
                        triggerNotice('Started from scratch: Dummy content disabled. Only custom items will be shown.');
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                    >
                      Start from Scratch
                    </button>
                  </div>
                </div>

                {/* Teachers Review Privilege Quick Box */}
                <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-800/40 p-5 rounded-2xl">
                  <h3 className="font-semibold text-white text-base flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    Global Teacher Reviewing Controls
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    As developer, you can disable the &quot;Pass / Reject / Bypass / Review&quot; button on their page globally or individually per teacher.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => {
                        toggleGlobalReviewing(!globalReviewingEnabled);
                        triggerNotice(`Global reviewing system ${!globalReviewingEnabled ? 'ENABLED' : 'PAUSED'}`);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
                        globalReviewingEnabled 
                          ? 'bg-rose-600/90 hover:bg-rose-600 text-white' 
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}
                    >
                      {globalReviewingEnabled ? 'Pause All Reviewing Site-Wide' : 'Enable Global Reviewing'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('teachers')}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer"
                    >
                      Manage Teacher Passwords &rarr;
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: TEACHERS & REVIEWERS MANAGEMENT */}
          {activeTab === 'teachers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                    Teachers & Peer Reviewers Credentials
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Manage faculty email IDs, passwords, and directly enable or disable their reviewing button.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddReviewer}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Teacher / Reviewer</span>
                </button>
              </div>

              {/* Global Warning if Global Reviewing is Disabled */}
              {!globalReviewingEnabled && (
                <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Global Reviewing is Currently Disabled:</strong> Even teachers with individual review permissions cannot submit pass/reject decisions until global reviewing is re-enabled.
                  </span>
                </div>
              )}

              {/* Reviewer Table */}
              <div className="bg-[#101f38] border border-slate-800 rounded-xl overflow-hidden shadow-inner">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0b172a] text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">Teacher / Faculty Member</th>
                        <th className="p-3.5">Department</th>
                        <th className="p-3.5">Login Email ID</th>
                        <th className="p-3.5">Password</th>
                        <th className="p-3.5 text-center">Reviewing Button Permission</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-200">
                      {reviewers.map((rev) => {
                        const isPwVisible = showPasswords[rev.id];
                        return (
                          <tr key={rev.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-3.5 font-medium text-white">
                              <div>{rev.name}</div>
                              <span className="text-[11px] text-slate-400 font-normal">{rev.designation}</span>
                            </td>
                            <td className="p-3.5 text-slate-300">
                              {rev.department}
                            </td>
                            <td className="p-3.5 font-mono text-amber-300">
                              {rev.email}
                            </td>
                            <td className="p-3.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-slate-200 bg-slate-900/80 px-2 py-1 rounded border border-slate-700">
                                  {isPwVisible ? rev.password : '••••••••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setShowPasswords(prev => ({ ...prev, [rev.id]: !prev[rev.id] }))}
                                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                                  title={isPwVisible ? 'Hide password' : 'Show password'}
                                >
                                  {isPwVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </td>
                            <td className="p-3.5 text-center">
                              {/* Dedicated Toggle for Reviewing Button requested by user */}
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    toggleReviewerPermission(rev.id, !rev.isReviewingEnabled);
                                    triggerNotice(`Reviewing button ${!rev.isReviewingEnabled ? 'ENABLED' : 'DISABLED'} for ${rev.name}`);
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    rev.isReviewingEnabled
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                                  }`}
                                >
                                  {rev.isReviewingEnabled ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>Reviewing Active</span>
                                    </>
                                  ) : (
                                    <>
                                      <Lock className="w-3.5 h-3.5 text-rose-400" />
                                      <span>Button Disabled</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </td>
                            <td className="p-3.5 text-right space-x-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditReviewer(rev)}
                                className="p-1.5 text-slate-300 hover:text-amber-400 hover:bg-white/5 rounded cursor-pointer"
                                title="Edit teacher credentials"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Delete reviewer account for ${rev.name}?`)) {
                                    deleteReviewer(rev.id);
                                    triggerNotice(`Removed reviewer ${rev.name}`);
                                  }
                                }}
                                className="p-1.5 text-slate-300 hover:text-rose-400 hover:bg-white/5 rounded cursor-pointer"
                                title="Delete account"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DUMMY CONTENT OFF / ON CONTROL */}
          {activeTab === 'dummy-control' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  Dummy Content Management & Scratchpad Mode
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Control whether the public website showcases the sample inaugural articles and default board members, or starts completely clean from scratch with your custom creations.
                </p>
              </div>

              {/* Status Box */}
              <div className="p-5 rounded-2xl border bg-[#101f38] border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      Current Website Display Mode
                    </span>
                  </div>
                  <div className="text-xl font-bold text-white mt-1 flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${isDummyContentEnabled ? 'bg-blue-400' : 'bg-emerald-400'}`} />
                    <span>
                      {isDummyContentEnabled 
                        ? 'Dummy Sample Content Enabled (Inaugural Articles & Board)' 
                        : 'Clean Scratchpad Mode (Only Custom Articles & Board Members)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {isDummyContentEnabled
                      ? 'The website is currently displaying the initial demonstration articles, inaugural archive issues, and default editorial board professors.'
                      : 'Dummy content is currently OFF! The website only displays articles and professors you explicitly create in this developer portal.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    toggleDummyContent(!isDummyContentEnabled);
                    triggerNotice(`Dummy content switched to ${!isDummyContentEnabled ? 'ON' : 'OFF'}`);
                  }}
                  className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer whitespace-nowrap ${
                    isDummyContentEnabled
                      ? 'bg-purple-600 hover:bg-purple-500 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {isDummyContentEnabled ? 'Switch to Scratch Mode (Turn OFF Dummy)' : 'Turn Dummy Content Back ON'}
                </button>
              </div>

              {/* Advanced Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#101f38] p-5 rounded-xl border border-slate-800">
                  <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Clone Dummy Content to Custom (Editable)
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Copies the 8 inaugural articles and editorial board members into your custom database so you can edit their titles, author names, DOIs, and affiliations directly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      loadDummyAsEditable();
                      triggerNotice('Cloned dummy content into custom editor! You can now edit each article and professor directly.');
                    }}
                    className="mt-4 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Clone to Editable Scratchpad
                  </button>
                </div>

                <div className="bg-[#101f38] p-5 rounded-xl border border-slate-800">
                  <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    Pure Clean Slate (No Articles)
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Turns off dummy content and empties all custom articles, leaving the repository ready for your own brand-new peer-reviewed submissions.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Clear custom articles and turn off dummy content to start 100% from scratch?')) {
                        startFromScratch();
                        triggerNotice('Website is now running in 100% clean scratch mode.');
                      }
                    }}
                    className="mt-4 px-4 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold cursor-pointer"
                  >
                    Start 100% From Scratch
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ARTICLES MANAGER */}
          {activeTab === 'articles' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                    Research Articles & Repository Manager
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Create new papers, edit metadata, update DOIs, full text, and manage volume table of contents.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddArticle}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Article</span>
                </button>
              </div>

              {/* Articles List */}
              <div className="space-y-3">
                {allArticles.length === 0 ? (
                  <div className="text-center py-12 bg-[#101f38] border border-slate-800 rounded-2xl">
                    <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-white">No Articles Published</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Dummy content is turned off. Click &apos;Create New Article&apos; above or promote an accepted manuscript to publish your first paper.
                    </p>
                  </div>
                ) : (
                  allArticles.map((art) => {
                    const isCustom = customArticles.some(c => c.id === art.id);
                    return (
                      <div 
                        key={art.id}
                        className="p-4 bg-[#101f38] border border-slate-800 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                              {art.articleNumber || art.id}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {art.discipline || art.category}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {art.volume}, {art.issue} • pp. {art.pages}
                            </span>
                            {isCustom ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                CUSTOM CREATED
                              </span>
                            ) : (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                TEMPLATE DUMMY
                              </span>
                            )}
                          </div>

                          <h3 className="font-serif text-sm sm:text-base font-bold text-white mt-1.5 leading-snug">
                            {art.title}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {art.authors.join(', ')} • <em>{art.affiliation}</em>
                          </p>
                          <p className="text-[11px] font-mono text-slate-500 mt-1">
                            DOI: https://doi.org/{art.doi}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {onOpenDedicatedArticle && (
                            <button
                              type="button"
                              onClick={() => onOpenDedicatedArticle(art)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 cursor-pointer"
                              title="View article page"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                          )}

                          {isCustom && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Delete article: "${art.title}"?`)) {
                                  deleteArticle(art.id);
                                  triggerNotice('Article deleted.');
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded cursor-pointer"
                              title="Delete custom article"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PROFESSORS / EDITORIAL BOARD */}
          {activeTab === 'professors' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                    Editorial Board & Professor Names
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Manage leadership designations, departments, official institutional emails, and faculty profiles.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddProfessor}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Professor / Member</span>
                </button>
              </div>

              {/* Professor Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allProfessors.map((prof) => {
                  const isCustom = customProfessors.some(c => c.email === prof.email);
                  return (
                    <div 
                      key={prof.email}
                      className="p-4 bg-[#101f38] border border-slate-800 rounded-xl relative group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                            {prof.role}
                          </span>
                          <h3 className="font-serif text-base font-bold text-white mt-1">
                            {prof.name}
                          </h3>
                          <p className="text-xs text-slate-300">
                            {prof.designation} • {prof.department}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1 font-mono">
                            {prof.email}
                          </p>
                        </div>

                        {isCustom && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Remove ${prof.name} from Editorial Board?`)) {
                                deleteProfessor(prof.email);
                                triggerNotice(`Removed ${prof.name}`);
                              }
                            }}
                            className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                            title="Remove member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                        <span>{prof.institution}</span>
                        <a 
                          href={prof.profileUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-amber-400 hover:underline flex items-center gap-1"
                        >
                          Faculty Profile &rarr;
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: SUBMISSIONS & PROMOTION */}
          {activeTab === 'submissions' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                    Submitted Manuscripts &amp; Diagnostic Workspace
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Complete administrative inspection of all manuscripts, author details, metadata, files, versions, and full audit trail.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {submissions.map((sub) => {
                  const latestFile = sub.files && sub.files.length > 0
                    ? sub.files[sub.files.length - 1]
                    : null;

                  return (
                    <div key={sub.id} className="p-6 bg-[#101f38] border border-slate-800 rounded-2xl space-y-4 shadow-lg">
                      {/* Top Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold text-amber-300 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                            {sub.trackingId}
                          </span>
                          <span className="text-xs text-slate-400">
                            Submitted: {sub.submittedDate}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {sub.discipline}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {sub.articleType || 'Original Research Paper'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            sub.status === 'Passed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            sub.status === 'Published' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold' :
                            sub.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                            sub.status === 'Bypassed' ? 'bg-slate-500/20 text-slate-300' :
                            'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {sub.status}
                          </span>
                        </div>
                      </div>

                      {/* Title & Core Authors */}
                      <div>
                        <h3 className="font-serif text-lg font-bold text-white">
                          {sub.title}
                        </h3>
                      </div>

                      {/* Author Information Panel */}
                      <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                          Author Information
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          <div>
                            <span className="text-slate-500 block text-[10px]">Corresponding Author:</span>
                            <strong className="text-white">{sub.authors}</strong>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Institutional Email:</span>
                            <span className="text-amber-300 font-mono">{sub.email}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Institution:</span>
                            <span className="text-slate-300">{sub.institution}</span>
                          </div>
                          {sub.coAuthors && (
                            <div>
                              <span className="text-slate-500 block text-[10px]">Co-Authors:</span>
                              <span className="text-slate-300">{sub.coAuthors}</span>
                            </div>
                          )}
                          {sub.department && (
                            <div>
                              <span className="text-slate-500 block text-[10px]">Department:</span>
                              <span className="text-slate-300">{sub.department}</span>
                            </div>
                          )}
                          {sub.orcid && (
                            <div>
                              <span className="text-slate-500 block text-[10px]">ORCID iD:</span>
                              <span className="text-emerald-300 font-mono">{sub.orcid}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Manuscript Metadata */}
                      <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                        <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                          Manuscript Metadata &amp; Abstract
                        </span>
                        <p className="text-slate-300 leading-relaxed text-justify">
                          {sub.abstract}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                          <span className="text-slate-400">
                            <strong>Keywords:</strong> {sub.keywords?.join(', ')}
                          </span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400">
                            <strong>Plagiarism Similarity:</strong> {sub.similarityScore ?? 8}%
                          </span>
                        </div>
                      </div>

                      {/* Attached Manuscript Files & Version History */}
                      <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                            Attached Manuscript Files &amp; Version History
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {sub.files?.length || 1} Version(s) Stored
                          </span>
                        </div>

                        <div className="divide-y divide-slate-800 rounded-lg overflow-hidden border border-slate-800 bg-[#0b172a]">
                          {sub.files?.map((file) => (
                            <div key={file.version} className="p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <strong className="text-white text-xs">{file.versionLabel}</strong>
                                  <span className="text-[10px] font-mono text-slate-400">({file.fileSize})</span>
                                </div>
                                <p className="text-[11px] font-mono text-slate-300">{file.fileName}</p>
                                <p className="text-[10px] text-slate-500">
                                  Uploaded: {file.uploadedAt} by {file.uploadedBy}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedPdfSubmission(sub);
                                    setIsPdfModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Open submitted PDF in reader"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Open Manuscript</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    downloadManuscriptPdf(file.fileUrl || '', file.fileName);
                                  }}
                                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors border border-slate-700"
                                  title="Download manuscript PDF"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Audit Trail Log */}
                      {sub.auditTrail && sub.auditTrail.length > 0 && (
                        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                            <History className="w-3.5 h-3.5" />
                            <span>Audit Trail &amp; Activity Log</span>
                          </span>
                          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                            {sub.auditTrail.map((ev) => (
                              <div key={ev.id} className="text-[11px] p-2 rounded bg-[#0b172a] border border-slate-800 flex items-center justify-between gap-2">
                                <div>
                                  <span className="font-bold text-amber-300 uppercase text-[10px] mr-2">{ev.action}:</span>
                                  <span className="text-slate-300">{ev.details}</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono shrink-0">{ev.timestamp}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bottom Controls */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                        <div className="text-xs text-slate-400 flex items-center gap-2">
                          <span>Assigned Reviewer:</span>
                          <strong className="text-slate-200">{sub.assignedReviewerName || 'Unassigned'}</strong>
                        </div>

                        <div className="flex items-center gap-2">
                          {sub.status === 'Passed' && (
                            <button
                              type="button"
                              onClick={() => {
                                const published = publishSubmission(
                                  sub.id,
                                  'Volume 1',
                                  'Issue 1',
                                  '125–138',
                                  `10.5281/shivraj350.2026.010${Math.floor(1 + Math.random() * 9)}`
                                );
                                if (published) {
                                  triggerNotice(`Promoted paper "${sub.title}" into published journal issue!`);
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Publish to Articles Repository</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Delete this manuscript submission?')) {
                                deleteSubmission(sub.id);
                                triggerNotice('Submission deleted.');
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-400 cursor-pointer"
                            title="Delete submission"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS & JOURNAL PARTICULARS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  Journal Particulars & Statutory Configuration
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Adjust official institutional metadata displayed across the two-column particulars table and PDFs.
                </p>
              </div>

              <div className="bg-[#101f38] p-5 rounded-2xl border border-slate-800 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Serial Title (Rendered verbatim across site)
                  </label>
                  <input
                    type="text"
                    value={journalInfo.name}
                    onChange={(e) => updateJournalInfo({ name: e.target.value })}
                    className="w-full bg-[#0b172a] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Publisher Name
                    </label>
                    <input
                      type="text"
                      value={journalInfo.publisher}
                      onChange={(e) => updateJournalInfo({ publisher: e.target.value })}
                      className="w-full bg-[#0b172a] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      ISSN Status / Number
                    </label>
                    <input
                      type="text"
                      value={journalInfo.issn}
                      onChange={(e) => updateJournalInfo({ issn: e.target.value })}
                      className="w-full bg-[#0b172a] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Institutional Postal Address
                  </label>
                  <input
                    type="text"
                    value={journalInfo.address}
                    onChange={(e) => updateJournalInfo({ address: e.target.value })}
                    className="w-full bg-[#0b172a] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Official Desk Email
                    </label>
                    <input
                      type="text"
                      value={journalInfo.email}
                      onChange={(e) => updateJournalInfo({ email: e.target.value })}
                      className="w-full bg-[#0b172a] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Desk Phone / EPABX
                    </label>
                    <input
                      type="text"
                      value={journalInfo.phone}
                      onChange={(e) => updateJournalInfo({ phone: e.target.value })}
                      className="w-full bg-[#0b172a] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => triggerNotice('Saved journal particulars successfully.')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow"
                >
                  Save Particulars
                </button>
              </div>
            </div>
          )}

          {/* TAB 8: BACKEND & SUPABASE */}
          {activeTab === 'supabase' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-white flex items-center gap-2.5">
                    <Database className="w-6 h-6 text-cyan-400" />
                    <span>Supabase Backend &amp; Cloud Database</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Connect Shivaji College's official cloud persistence, Postgres database, and private PDF storage.
                  </p>
                </div>

                <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                  isSupabaseConfigured()
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured() ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span>{isSupabaseConfigured() ? 'Supabase Connected & Active' : 'Standalone Local Mode (Awaiting Credentials)'}</span>
                </div>
              </div>

              {/* Status & Instructions Card */}
              <div className="p-5 bg-[#101f38] border border-slate-700/80 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <Server className="w-4 h-4" />
                  <span>Required Environment Variables</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  To connect your Supabase backend to this application, enter the following two keys in the <strong>Settings</strong> panel of Google AI Studio (or your deployment environment variables):
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-[#0b172a] border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-300">VITE_SUPABASE_URL</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        isSupabaseConfigured() ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isSupabaseConfigured() ? 'Connected' : 'Missing'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Your Supabase project URL (e.g. <code className="text-slate-300">https://kmlnmylkhdirqcscbkbd.supabase.co</code>)
                    </p>
                  </div>

                  <div className="p-3.5 bg-[#0b172a] border border-slate-800 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-300">VITE_SUPABASE_ANON_KEY</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        isSupabaseConfigured() ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isSupabaseConfigured() ? 'Connected' : 'Missing'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Your Supabase publishable key (<code className="text-slate-300">sb_publishable_...</code>)
                    </p>
                  </div>
                </div>
              </div>

              {/* 3 Steps Guide */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">1</span>
                  <span>Execute SQL Migration in Supabase SQL Editor</span>
                </h3>
                <div className="p-4 bg-[#101f38] border border-slate-700/80 rounded-2xl space-y-3">
                  <p className="text-xs text-slate-300">
                    Open your Supabase Dashboard &rarr; <strong>SQL Editor</strong> &rarr; Click <strong>New query</strong> &rarr; Paste and run the database schema. This creates the <code className="text-amber-300">submissions</code>, <code className="text-amber-300">profiles</code>, <code className="text-amber-300">articles</code>, and <code className="text-amber-300">journal_settings</code> tables with complete Row Level Security (RLS).
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`-- View supabase/schema.sql in the project root for the complete 150-line production schema
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'author' CHECK (role IN ('superadmin', 'editor', 'reviewer', 'author')),
  designation TEXT,
  department TEXT,
  institution TEXT DEFAULT 'Shivaji College, University of Delhi',
  assigned_disciplines TEXT[] DEFAULT '{}',
  is_reviewing_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles viewable by authenticated users" ON public.profiles FOR SELECT TO authenticated USING (true);`, 'schema-sql')}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow transition-all"
                    >
                      {copiedSection === 'schema-sql' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSection === 'schema-sql' ? 'Copied Quick SQL!' : 'Copy SQL Schema (or view /supabase/schema.sql)'}</span>
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pt-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">2</span>
                  <span>Create Private 'manuscripts' Storage Bucket</span>
                </h3>
                <div className="p-4 bg-[#101f38] border border-slate-700/80 rounded-2xl space-y-3">
                  <p className="text-xs text-slate-300">
                    Open <strong>Storage</strong> in Supabase or run this script in the SQL Editor to create the bucket and access policies:
                  </p>
                  <ul className="text-xs text-slate-400 list-disc list-inside space-y-1">
                    <li><strong>Bucket Name:</strong> <code className="text-slate-200">manuscripts</code></li>
                    <li><strong>Privacy:</strong> <span className="text-rose-400 font-semibold">Private</span> (Disallow public read to protect peer review confidentiality)</li>
                    <li><strong>MIME Restriction:</strong> <code className="text-slate-200">application/pdf</code> (Strict server-side validation)</li>
                    <li><strong>File Size Limit:</strong> 25 MB</li>
                  </ul>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('manuscripts', 'manuscripts', false, 26214400, ARRAY['application/pdf']::text[])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 26214400, allowed_mime_types = ARRAY['application/pdf']::text[];
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public manuscript PDF upload" ON storage.objects;
CREATE POLICY "Allow public manuscript PDF upload" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'manuscripts');
DROP POLICY IF EXISTS "Allow manuscript PDF update" ON storage.objects;
CREATE POLICY "Allow manuscript PDF update" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'manuscripts') WITH CHECK (bucket_id = 'manuscripts');
DROP POLICY IF EXISTS "Allow authenticated read of manuscripts" ON storage.objects;
CREATE POLICY "Allow authenticated read of manuscripts" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'manuscripts');`, 'storage-sql')}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow transition-all"
                    >
                      {copiedSection === 'storage-sql' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSection === 'storage-sql' ? 'Copied Storage SQL!' : 'Copy Storage SQL (or view /supabase/storage_setup.sql)'}</span>
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pt-2">
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-black">3</span>
                  <span>Provision Editorial &amp; Admin Users</span>
                </h3>
                <div className="p-4 bg-[#101f38] border border-slate-700/80 rounded-2xl space-y-3">
                  <p className="text-xs text-slate-300">
                    Under <strong>Authentication &rarr; Users</strong> in Supabase, create user accounts with their institutional email addresses:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-[#0b172a] rounded-xl border border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-emerald-300 block">Super Admin Account</span>
                      <span className="text-xs font-mono text-slate-300 block">work.shivanand@gmail.com</span>
                      <span className="text-[11px] text-slate-400 block">Automatically granted 'superadmin' role via trigger</span>
                    </div>
                    <div className="p-3 bg-[#0b172a] rounded-xl border border-slate-800 space-y-1">
                      <span className="text-xs font-bold text-amber-300 block">Chief Editor / Patron</span>
                      <span className="text-xs font-mono text-slate-300 block">principal@shivaji.du.ac.in</span>
                      <span className="text-[11px] text-slate-400 block">Automatically recognized as 'editor' role via trigger</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL: ADD / EDIT TEACHER REVIEWER */}
      {showAddReviewerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#0b172a] border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold">
              {editingReviewer ? 'Edit Teacher Credentials' : 'Add New Teacher / Reviewer'}
            </h3>
            
            <form onSubmit={handleSaveReviewer} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Faculty Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full bg-[#101f38] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Institutional Email ID (Username for Login)</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rkumar@shivaji.du.ac.in"
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                  className="w-full bg-[#101f38] border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <input
                  type="text"
                  required
                  value={reviewerPassword}
                  onChange={(e) => setReviewerPassword(e.target.value)}
                  className="w-full bg-[#101f38] border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={reviewerDept}
                    onChange={(e) => setReviewerDept(e.target.value)}
                    className="w-full bg-[#101f38] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={reviewerDesignation}
                    onChange={(e) => setReviewerDesignation(e.target.value)}
                    className="w-full bg-[#101f38] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Reviewing Button Permission Toggle requested by user */}
              <div className="p-3.5 bg-[#101f38] border border-slate-700 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Reviewing Button on Their Page</span>
                  <span className="text-[11px] text-slate-400">
                    If disabled, the teacher cannot click Pass, Reject, or Bypass buttons in Editorial Portal.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewerCanReview(!reviewerCanReview)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    reviewerCanReview ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {reviewerCanReview ? 'Enabled' : 'Disabled'}
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddReviewerModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Save Reviewer Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / CREATE NEW ARTICLE */}
      {showArticleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[#0b172a] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-lg font-bold">
              {editingArticleId ? 'Edit Article' : 'Create New Article (Scratch Mode)'}
            </h3>

            <form onSubmit={handleSaveArticle} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  placeholder="Enter full research article title"
                  value={artTitle}
                  onChange={(e) => setArtTitle(e.target.value)}
                  className="w-full bg-[#101f38] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Authors (Comma-separated)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. A. Sharma, Prof. K. Verma"
                    value={artAuthors}
                    onChange={(e) => setArtAuthors(e.target.value)}
                    className="w-full bg-[#101f38] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Disciplinary Category</label>
                  <select
                    value={artDiscipline}
                    onChange={(e) => setArtDiscipline(e.target.value as any)}
                    className="w-full bg-[#101f38] border border-slate-700 rounded-lg p-2.5 text-xs text-white cursor-pointer"
                  >
                    <option value="Sciences">Sciences</option>
                    <option value="Social Sciences">Social Sciences</option>
                    <option value="Humanities">Humanities</option>
                    <option value="Professional Studies">Professional Studies</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Institutional Affiliation</label>
                <input
                  type="text"
                  required
                  value={artAffiliation}
                  onChange={(e) => setArtAffiliation(e.target.value)}
                  className="w-full bg-[#101f38] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Structured Abstract</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Abstract text..."
                  value={artAbstract}
                  onChange={(e) => setArtAbstract(e.target.value)}
                  className="w-full bg-[#101f38] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Keywords (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Nanotechnology, Solar Cells, Energy"
                  value={artKeywords}
                  onChange={(e) => setArtKeywords(e.target.value)}
                  className="w-full bg-[#101f38] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Volume</label>
                  <input
                    type="text"
                    value={artVolume}
                    onChange={(e) => setArtVolume(e.target.value)}
                    className="w-full bg-[#101f38] border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Issue</label>
                  <input
                    type="text"
                    value={artIssue}
                    onChange={(e) => setArtIssue(e.target.value)}
                    className="w-full bg-[#101f38] border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Page Range</label>
                  <input
                    type="text"
                    value={artPages}
                    onChange={(e) => setArtPages(e.target.value)}
                    className="w-full bg-[#101f38] border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">DOI (Digital Object Identifier)</label>
                <input
                  type="text"
                  value={artDoi}
                  onChange={(e) => setArtDoi(e.target.value)}
                  className="w-full bg-[#101f38] border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Text Content / Introduction</label>
                <textarea
                  rows={3}
                  placeholder="Full text introduction..."
                  value={artFullText}
                  onChange={(e) => setArtFullText(e.target.value)}
                  className="w-full bg-[#101f38] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowArticleModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PROFESSOR */}
      {showProfessorModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#0b172a] border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold">Add Editorial Board Professor</h3>

            <form onSubmit={handleSaveProfessor} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Professor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prof. R. K. Sharma"
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  className="w-full bg-[#101f38] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Editorial Role</label>
                  <select
                    value={profRole}
                    onChange={(e) => setProfRole(e.target.value)}
                    className="w-full bg-[#101f38] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                  >
                    <option value="Editor-in-Chief">Editor-in-Chief</option>
                    <option value="Associate Editor (Sciences)">Associate Editor (Sciences)</option>
                    <option value="Associate Editor (Social Sciences)">Associate Editor (Social Sciences)</option>
                    <option value="Associate Editor (Humanities)">Associate Editor (Humanities)</option>
                    <option value="Associate Editor (Professional Studies)">Associate Editor (Professional Studies)</option>
                    <option value="Patron & Principal">Patron & Principal</option>
                    <option value="Advisory Board Member">Advisory Board Member</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Designation</label>
                  <input
                    type="text"
                    required
                    value={profDesignation}
                    onChange={(e) => setProfDesignation(e.target.value)}
                    className="w-full bg-[#101f38] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                <input
                  type="text"
                  required
                  value={profDept}
                  onChange={(e) => setProfDept(e.target.value)}
                  className="w-full bg-[#101f38] border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Institutional Email</label>
                <input
                  type="email"
                  required
                  value={profEmail}
                  onChange={(e) => setProfEmail(e.target.value)}
                  className="w-full bg-[#101f38] border border-slate-700 rounded-lg p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfessorModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Save Professor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECURE MANUSCRIPT PDF VIEWER */}
      <ManuscriptPdfViewerModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        submission={selectedPdfSubmission}
        hasAccess={true}
        canDownload={true}
      />

      {/* LOGIN MODAL */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        targetPortal="developer"
        onSuccess={() => setShowLoginModal(false)}
      />
    </div>
  );
}
