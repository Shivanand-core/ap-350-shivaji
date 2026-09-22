import { useState, useMemo } from 'react';
import { 
  FileText, 
  ArrowLeft, 
  LogOut, 
  Search, 
  Filter, 
  ShieldAlert, 
  Eye, 
  UserCheck, 
  CheckCircle, 
  Clock, 
  Layers, 
  Sparkles,
  ChevronRight,
  Shield,
  BookOpen
} from 'lucide-react';
import { useJournal } from '../context/JournalContext';
import { ManuscriptSubmission, SubmissionStatus } from '../types';
import SubmissionWorkspace from './SubmissionWorkspace';
import LoginModal from './LoginModal';
import ManuscriptPdfViewerModal from './ManuscriptPdfViewerModal';

interface EditorialPortalProps {
  onBackToWebsite: () => void;
  onOpenDeveloperPortal?: () => void;
  initialSubmissionId?: string | null;
}

export default function EditorialPortal({
  onBackToWebsite,
  onOpenDeveloperPortal,
  initialSubmissionId
}: EditorialPortalProps) {
  const {
    currentUser,
    logoutUser,
    submissions,
    reviewers,
    assignReviewer,
    submitEvaluation,
    makeEditorialDecision,
    uploadRevision,
    publishSubmission,
    evaluationMode,
    toggleEvaluationMode
  } = useJournal();

  // Selected submission for full workspace view
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(initialSubmissionId || null);

  // Quick PDF reader modal directly from list view
  const [quickViewerSubmission, setQuickViewerSubmission] = useState<ManuscriptSubmission | null>(null);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [disciplineFilter, setDisciplineFilter] = useState<string>('All');

  // Login modal if session expired or unauthenticated
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Check authentication
  const isAuth = Boolean(currentUser);
  const isReviewer = currentUser?.role === 'reviewer';
  const isEditor = currentUser?.role === 'editor' || currentUser?.role === 'superadmin';

  // Submissions filtered by user permissions and search/filters
  const visibleSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      // 1. Role separation rule: Reviewer ONLY sees submissions assigned to them!
      if (isReviewer) {
        const isAssigned = sub.assignedReviewerId === currentUser?.id || sub.assignedReviewerEmail === currentUser?.email;
        if (!isAssigned) return false;
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = sub.title.toLowerCase().includes(q);
        const matchesAuthor = sub.authors.toLowerCase().includes(q);
        const matchesId = sub.trackingId.toLowerCase().includes(q);
        if (!matchesTitle && !matchesAuthor && !matchesId) return false;
      }

      // 3. Status filter
      if (statusFilter !== 'All' && sub.status !== statusFilter) {
        return false;
      }

      // 4. Discipline filter
      if (disciplineFilter !== 'All' && sub.discipline !== disciplineFilter) {
        return false;
      }

      return true;
    });
  }, [submissions, isReviewer, currentUser, searchQuery, statusFilter, disciplineFilter]);

  // If user is not authenticated: display access gate
  if (!isAuth) {
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
            <h2 className="text-xl font-bold text-white">Editorial &amp; Referee Portal</h2>
            <p className="text-xs text-slate-400">
              Authentication is required to access confidential manuscripts, peer reviews, and editorial decisions.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setShowLoginModal(true)}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              Sign In to Editorial Portal
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
          targetPortal="editorial"
          onSuccess={() => setShowLoginModal(false)}
        />
      </div>
    );
  }

  // If active user is an author (unauthorized role)
  if (currentUser?.role === 'author') {
    return (
      <div className="min-h-screen bg-[#070d19] text-slate-100 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-rose-900/60 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Access Denied</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your account does not have permission to access the Editorial and Referee Portal.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={logoutUser}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer"
            >
              Sign Out
            </button>
            <button
              type="button"
              onClick={onBackToWebsite}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If viewing a specific submission in the dedicated workspace
  const selectedSubmission = selectedSubmissionId 
    ? submissions.find((s) => s.id === selectedSubmissionId)
    : null;

  return (
    <div className="min-h-screen bg-[#070d19] text-slate-100 flex flex-col">
      {/* Top Editorial Bar */}
      <header className="bg-[#0f172a] border-b border-slate-800 px-4 sm:px-8 py-3.5 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToWebsite}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              title="Return to Public Website"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                  SHIVRAJ 350
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs font-semibold text-slate-300">
                  Editorial &amp; Reviewer Gateway
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-white">
                Shivaji College, University of Delhi
              </h1>
            </div>
          </div>

          {/* User Profile & Navigation */}
          <div className="flex items-center gap-3">
            {/* User Pill */}
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white flex items-center gap-1.5 justify-end">
                <span>{currentUser.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                  {currentUser.role === 'superadmin' ? 'Super Admin' : currentUser.role === 'editor' ? 'Editor' : 'Reviewer'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {currentUser.email}
              </p>
            </div>

            {/* If Superadmin, link to Developer portal */}
            {currentUser.role === 'superadmin' && onOpenDeveloperPortal && (
              <button
                type="button"
                onClick={onOpenDeveloperPortal}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Dev Console</span>
              </button>
            )}

            {/* Logout Button */}
            <button
              type="button"
              onClick={logoutUser}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-rose-900/60 hover:text-rose-200 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {selectedSubmission ? (
          /* Detailed Single-Submission Workspace View */
          <SubmissionWorkspace
            submission={selectedSubmission}
            currentUser={currentUser}
            onBack={() => setSelectedSubmissionId(null)}
            onAssignReviewer={assignReviewer}
            onSubmitEvaluation={submitEvaluation}
            onMakeDecision={makeEditorialDecision}
            onUploadRevision={uploadRevision}
            onPublishSubmission={publishSubmission}
            availableReviewers={reviewers}
            evaluationMode={evaluationMode}
            onToggleEvaluationMode={isEditor ? toggleEvaluationMode : undefined}
          />
        ) : (
          /* Submissions Queue & Overview List */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Welcome & Metrics Banner */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {isReviewer ? 'Assigned Peer Review Portfolio' : 'Editorial Manuscript Queue'}
                  </h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                    {visibleSubmissions.length} Manuscript{visibleSubmissions.length === 1 ? '' : 's'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300">
                  {isReviewer 
                    ? 'Confidential papers assigned to your peer review docket for academic assessment.'
                    : 'Manage submissions, assign faculty referees, record statutory decisions, and publish verified papers.'}
                </p>
              </div>

              {/* Editorial Mode Switcher (For Editors) */}
              {isEditor && (
                <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/90 p-2 rounded-xl text-xs shrink-0">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Workflow Mode:
                    </span>
                    <span className="font-semibold text-amber-300">
                      {evaluationMode === 'evaluation_required' 
                        ? 'Mode A (Evaluation Required)' 
                        : 'Mode B (Direct Decision)'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleEvaluationMode}
                    className="ml-2 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold rounded-lg border border-slate-600 transition-colors cursor-pointer"
                  >
                    Switch
                  </button>
                </div>
              )}
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title, author name, or tracking ID..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full sm:w-auto text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-hidden focus:border-amber-400"
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending Review">Pending Review</option>
                  <option value="Under Evaluation">Under Evaluation</option>
                  <option value="Evaluation Submitted">Evaluation Submitted</option>
                  <option value="Passed">Passed</option>
                  <option value="Revision Requested">Revision Requested</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Published">Published</option>
                </select>

                <select
                  value={disciplineFilter}
                  onChange={(e) => setDisciplineFilter(e.target.value)}
                  className="w-full sm:w-auto text-xs px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-hidden focus:border-amber-400"
                >
                  <option value="All">All Disciplines</option>
                  <option value="Sciences">Sciences</option>
                  <option value="Social Sciences">Social Sciences</option>
                  <option value="Humanities">Humanities</option>
                  <option value="Professional Studies">Professional Studies</option>
                </select>
              </div>
            </div>

            {/* Submissions List */}
            {visibleSubmissions.length === 0 ? (
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-12 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-base font-bold text-white">No submissions found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {isReviewer
                    ? 'You currently have no manuscripts assigned for peer review evaluation.'
                    : 'No manuscripts match the selected search query and filter criteria.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {visibleSubmissions.map((sub) => {
                  const latestFile = sub.files && sub.files.length > 0 
                    ? sub.files[sub.files.length - 1] 
                    : null;

                  return (
                    <div
                      key={sub.id}
                      className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-md transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                              {sub.trackingId}
                            </span>
                            <span className={`text-[11px] px-2 py-0.5 rounded-full border font-semibold ${
                              sub.status === 'Passed' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                              sub.status === 'Published' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold' :
                              sub.status === 'Rejected' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' :
                              sub.status === 'Under Evaluation' || sub.status === 'Evaluation Submitted' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                              'bg-slate-500/20 text-slate-300 border-slate-500/40'
                            }`}>
                              {sub.status}
                            </span>
                            <span className="text-[11px] text-slate-400 bg-slate-700/60 px-2 py-0.5 rounded border border-slate-600/60">
                              {sub.discipline}
                            </span>
                            {sub.files && sub.files.length > 1 && (
                              <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                                {sub.files.length} Versions
                              </span>
                            )}
                          </div>

                          <h3 
                            onClick={() => setSelectedSubmissionId(sub.id)}
                            className="text-base sm:text-lg font-bold text-white hover:text-amber-300 cursor-pointer transition-colors leading-snug"
                          >
                            {sub.title}
                          </h3>

                          <p className="text-xs text-slate-300">
                            <strong>{sub.authors}</strong> — {sub.institution}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                          {latestFile && (
                            <button
                              type="button"
                              onClick={() => setQuickViewerSubmission(sub)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-700/80 hover:bg-slate-600 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                              title="Quickly preview manuscript PDF"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-400" />
                              <span>View PDF</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedSubmissionId(sub.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow transition-colors cursor-pointer"
                          >
                            <span>Manage / Review</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Bottom Quick Metadata */}
                      <div className="pt-3 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                        <div className="flex flex-wrap items-center gap-4">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>Submitted: {sub.submittedDate}</span>
                          </span>

                          <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span>File: {latestFile?.fileName || 'Standard Draft'}</span>
                          </span>
                        </div>

                        <div>
                          {sub.assignedReviewerName ? (
                            <span className="text-indigo-300 flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Assigned to: <strong>{sub.assignedReviewerName}</strong></span>
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">No reviewer assigned</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* QUICK MANUSCRIPT VIEWER MODAL */}
      <ManuscriptPdfViewerModal
        isOpen={Boolean(quickViewerSubmission)}
        onClose={() => setQuickViewerSubmission(null)}
        submission={quickViewerSubmission}
        hasAccess={true}
        canDownload={true}
      />
    </div>
  );
}
