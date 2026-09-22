import React, { useState } from 'react';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Eye, 
  Upload, 
  UserCheck, 
  CheckCircle, 
  XCircle, 
  RotateCcw, 
  BookOpen, 
  Clock, 
  Shield, 
  AlertTriangle, 
  Sparkles,
  Send,
  History,
  FileCheck2,
  ExternalLink,
  Layers
} from 'lucide-react';
import { ManuscriptSubmission, ManuscriptFile, AuthUser, SubmissionStatus } from '../types';
import { downloadManuscriptPdf } from '../lib/pdfHelper';
import ManuscriptPdfViewerModal from './ManuscriptPdfViewerModal';

interface SubmissionWorkspaceProps {
  submission: ManuscriptSubmission;
  currentUser: AuthUser | null;
  onBack: () => void;
  onAssignReviewer: (submissionId: string, reviewerId: string, reviewerName: string, reviewerEmail: string) => void;
  onSubmitEvaluation: (submissionId: string, recommendation: any, notes: string) => void;
  onMakeDecision: (submissionId: string, status: SubmissionStatus, notes?: string, similarityScore?: number) => void;
  onUploadRevision: (submissionId: string, file: File, uploaderName: string) => void;
  onPublishSubmission: (submissionId: string, volume: string, issue: string, pages: string, doi: string) => void;
  availableReviewers: { id: string; name: string; email: string; department: string; designation: string; isReviewingEnabled: boolean }[];
  evaluationMode: 'evaluation_required' | 'direct_editorial';
  onToggleEvaluationMode?: () => void;
}

export default function SubmissionWorkspace({
  submission,
  currentUser,
  onBack,
  onAssignReviewer,
  onSubmitEvaluation,
  onMakeDecision,
  onUploadRevision,
  onPublishSubmission,
  availableReviewers,
  evaluationMode,
  onToggleEvaluationMode
}: SubmissionWorkspaceProps) {
  const [selectedFileForViewer, setSelectedFileForViewer] = useState<ManuscriptFile | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Assignment state
  const [selectedReviewerId, setSelectedReviewerId] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Reviewer evaluation state
  const [recommendation, setRecommendation] = useState<'Accept' | 'Accept with Minor Revisions' | 'Major Revisions' | 'Reject' | 'Bypass'>('Accept');
  const [evaluationNotes, setEvaluationNotes] = useState('');
  const [isSubmittingEvaluation, setIsSubmittingEvaluation] = useState(false);

  // Editor decision modal
  const [showDecisionModal, setShowDecisionModal] = useState<SubmissionStatus | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [plagiarismScore, setPlagiarismScore] = useState<number>(submission.similarityScore || 8);

  // Publish modal state
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishVolume, setPublishVolume] = useState('Volume 1');
  const [publishIssue, setPublishIssue] = useState('Issue 1');
  const [publishPages, setPublishPages] = useState('115–128');
  const [publishDoi, setPublishDoi] = useState(`10.5281/shivraj350.2026.010${Math.floor(1 + Math.random() * 9)}`);

  // Revision upload state
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionFile, setRevisionFile] = useState<File | null>(null);

  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isEditor = currentUser?.role === 'editor' || isSuperAdmin;
  const isReviewer = currentUser?.role === 'reviewer';
  const isAssignedReviewer = isReviewer && (
    submission.assignedReviewerId === currentUser?.id || 
    submission.assignedReviewerEmail === currentUser?.email
  );

  const hasAccessToManuscript = isEditor || isAssignedReviewer;

  const handleOpenFile = (file: ManuscriptFile) => {
    setSelectedFileForViewer(file);
    setIsViewerOpen(true);
  };

  const handleDownloadFile = (file: ManuscriptFile) => {
    if (!hasAccessToManuscript) return;
    const url = file.fileUrl || '';
    downloadManuscriptPdf(url, file.fileName);
  };

  const handleConfirmAssignment = () => {
    if (!selectedReviewerId) return;
    const rev = availableReviewers.find(r => r.id === selectedReviewerId);
    if (rev) {
      onAssignReviewer(submission.id, rev.id, rev.name, rev.email);
      setShowAssignModal(false);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEvaluation(true);
    setTimeout(() => {
      onSubmitEvaluation(submission.id, recommendation, evaluationNotes);
      setIsSubmittingEvaluation(false);
    }, 400);
  };

  const handleConfirmDecision = () => {
    if (showDecisionModal) {
      onMakeDecision(submission.id, showDecisionModal, decisionNotes, plagiarismScore);
      setShowDecisionModal(null);
      setDecisionNotes('');
    }
  };

  const handleConfirmPublish = () => {
    onPublishSubmission(submission.id, publishVolume, publishIssue, publishPages, publishDoi);
    setShowPublishModal(false);
  };

  const handleUploadRevisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionFile) return;
    const uploader = currentUser ? `${currentUser.name} (${currentUser.role})` : 'Author';
    onUploadRevision(submission.id, revisionFile, uploader);
    setShowRevisionModal(false);
    setRevisionFile(null);
  };

  // Status badge styling
  const getStatusBadge = (status: SubmissionStatus) => {
    switch (status) {
      case 'Passed':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Published':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold';
      case 'Rejected':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'Revision Requested':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Under Evaluation':
      case 'Evaluation Submitted':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header / Navigation Bar */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Submissions Queue</span>
            </button>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-sm font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800/60">
                {submission.trackingId}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${getStatusBadge(submission.status)}`}>
                {submission.status}
              </span>
              <span className="text-xs text-slate-400 bg-slate-700/60 px-2.5 py-1 rounded border border-slate-600/60">
                {submission.discipline}
              </span>
              <span className="text-xs text-slate-400 bg-slate-700/60 px-2.5 py-1 rounded border border-slate-600/60">
                {submission.articleType || 'Original Research Paper'}
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl font-bold text-white leading-snug pt-1">
              {submission.title}
            </h1>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:self-start shrink-0">
            {submission.files && submission.files.length > 0 && (
              <button
                type="button"
                onClick={() => handleOpenFile(submission.files[submission.files.length - 1])}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-colors cursor-pointer"
                title="Open and read the submitted manuscript in secure PDF viewer"
              >
                <Eye className="w-4 h-4" />
                <span>Open Manuscript</span>
              </button>
            )}

            {isEditor && (
              <button
                type="button"
                onClick={() => setShowRevisionModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-600 transition-colors cursor-pointer"
                title="Upload updated revision without overwriting earlier versions"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Upload Revision</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide on desktop): Manuscript Details & Author Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Manuscript Files & Historical Versioning */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>Manuscript Files &amp; Version History</span>
              </div>
              <span className="text-xs text-slate-400">
                {submission.files?.length || 1} Version(s) Preserved
              </span>
            </div>

            <div className="divide-y divide-slate-700/60 border border-slate-700/80 rounded-xl overflow-hidden bg-slate-900/60">
              {submission.files?.map((file, idx) => {
                const isLatest = idx === submission.files.length - 1;
                return (
                  <div key={file.version} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">
                          {file.versionLabel}
                        </span>
                        {isLatest && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Latest Version
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-300 font-mono flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-slate-400" />
                        <span className="break-all">{file.fileName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3 pt-0.5">
                        <span>Size: <strong>{file.fileSize}</strong></span>
                        <span>•</span>
                        <span>Uploaded: {file.uploadedAt}</span>
                        <span>•</span>
                        <span>By: {file.uploadedBy}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => handleOpenFile(file)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        title="Open this version in manuscript viewer"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Open</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadFile(file)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-700/70 hover:bg-slate-600 text-slate-300 hover:text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        title="Download file"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Structured Abstract & Keywords */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>Structured Abstract</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed text-justify bg-slate-900/60 p-4 rounded-xl border border-slate-700/60">
              {submission.abstract}
            </p>

            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Index Keywords
              </span>
              <div className="flex flex-wrap gap-1.5">
                {submission.keywords?.map((kw, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-700/70 text-slate-200 border border-slate-600/80"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Comprehensive Author & Institutional Profile */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              <span>Author Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Corresponding Author
                </span>
                <p className="text-sm font-bold text-white">{submission.authors}</p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Official Email
                </span>
                <p className="text-sm font-mono text-amber-300 break-all">{submission.email}</p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 space-y-1 sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Affiliated Institution &amp; Department
                </span>
                <p className="text-xs text-slate-200">
                  {submission.institution}
                  {submission.department ? ` • ${submission.department}` : ''}
                </p>
              </div>

              {submission.coAuthors && (
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 space-y-1 sm:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Co-Authors
                  </span>
                  <p className="text-xs text-slate-300">{submission.coAuthors}</p>
                </div>
              )}

              {submission.orcid && (
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    ORCID iD
                  </span>
                  <p className="text-xs font-mono text-emerald-300">{submission.orcid}</p>
                </div>
              )}

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Similarity Index (Plagiarism)
                </span>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-sm font-bold ${
                    (submission.similarityScore || 0) <= 10 ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {submission.similarityScore ?? 8}%
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ((Level 0: &lt; 10% permissible per UGC-CARE)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col wide on desktop): Editorial Actions, Reviewer Controls & Audit Trail */}
        <div className="space-y-6">
          {/* Editorial Actions Desk */}
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <Shield className="w-5 h-5 text-amber-400" />
                <span>Editorial Desk Actions</span>
              </h3>
              {isEditor && onToggleEvaluationMode && (
                <button
                  type="button"
                  onClick={onToggleEvaluationMode}
                  className="text-[10px] font-semibold text-slate-400 hover:text-amber-300 transition-colors"
                  title="Toggle between Mode A (Reviewer required) and Mode B (Direct Evaluation)"
                >
                  {evaluationMode === 'evaluation_required' ? 'Mode A: Eval Req' : 'Mode B: Direct'}
                </button>
              )}
            </div>

            {/* If Current User is an Editor or Super Admin */}
            {isEditor && (
              <div className="space-y-3">
                {/* Reviewer Assignment Status */}
                <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-700/60 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Assigned Evaluator
                  </span>
                  {submission.assignedReviewerName ? (
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-white">
                        {submission.assignedReviewerName}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">
                        {submission.assignedReviewerEmail}
                      </p>
                      {submission.recommendation && (
                        <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-slate-300">
                          <span className="text-slate-400">Reviewer Recommendation: </span>
                          <strong className="text-amber-300">{submission.recommendation}</strong>
                          {submission.evaluationNotes && (
                            <p className="text-[11px] text-slate-400 italic mt-1 bg-slate-800/80 p-2 rounded">
                              &ldquo;{submission.evaluationNotes}&rdquo;
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No evaluator assigned yet.</p>
                  )}

                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAssignModal(true)}
                      className="w-full py-2 px-3 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{submission.assignedReviewerName ? 'Transfer for Evaluation' : 'Assign Reviewer'}</span>
                    </button>
                  </div>
                </div>

                {/* Primary Decision Buttons */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Statutory Editorial Decision
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDecisionModal('Passed')}
                      className="py-2 px-3 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Accept / Pass</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowDecisionModal('Revision Requested')}
                      className="py-2 px-3 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Req. Revision</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDecisionModal('Rejected')}
                      className="py-2 px-3 bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowDecisionModal('Bypassed')}
                      className="py-2 px-3 bg-slate-700/60 hover:bg-slate-700 border border-slate-600/60 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Bypass</span>
                    </button>
                  </div>

                  {/* Publish Button: Enabled if Passed or Ready */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowPublishModal(true)}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-200" />
                      <span>Publish in Journal Issue</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* If Current User is an Assigned Reviewer */}
            {isReviewer && isAssignedReviewer && (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="p-3 bg-indigo-950/40 border border-indigo-800/60 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">
                    Assigned Referee Workspace
                  </span>
                  <p className="text-xs text-slate-300">
                    You have been granted confidential reviewer access to evaluate this manuscript.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Formal Recommendation *
                  </label>
                  <select
                    value={recommendation}
                    onChange={(e) => setRecommendation(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="Accept">Accept for Publication</option>
                    <option value="Accept with Minor Revisions">Accept with Minor Revisions</option>
                    <option value="Major Revisions">Major Revisions Required</option>
                    <option value="Reject">Reject</option>
                    <option value="Bypass">Bypass to Specialist Referee</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Confidential Evaluation Notes for Editor *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={evaluationNotes}
                    onChange={(e) => setEvaluationNotes(e.target.value)}
                    placeholder="Enter methodological critiques, theoretical validity, literature sufficiency, and editorial feedback..."
                    className="w-full text-xs px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingEvaluation}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingEvaluation ? 'Submitting...' : 'Submit Evaluation to Editor'}</span>
                </button>
              </form>
            )}

            {/* If Current User is an Unassigned Reviewer */}
            {isReviewer && !isAssignedReviewer && (
              <div className="p-4 bg-slate-900 border border-slate-700 rounded-xl text-center space-y-2 text-xs text-slate-400">
                <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto" />
                <p className="font-semibold text-slate-300">Unassigned Submission</p>
                <p>You cannot evaluate or alter this paper until the editor assigns it to your portfolio.</p>
              </div>
            )}
          </div>

          {/* Audit Trail & Chronological Activity Log */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-md space-y-3">
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              <History className="w-5 h-5 text-slate-400" />
              <span>Audit Trail &amp; Activity Log</span>
            </h3>

            <div className="space-y-3 text-xs max-h-72 overflow-y-auto pr-1">
              {submission.auditTrail && submission.auditTrail.length > 0 ? (
                submission.auditTrail.map((ev) => (
                  <div key={ev.id} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-amber-300 uppercase">{ev.action}</span>
                      <span className="font-mono">{ev.timestamp}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {ev.details || `${ev.action} recorded by ${ev.performedBy}`}
                    </p>
                    <span className="text-[9px] text-slate-500 font-mono block">
                      Actor: {ev.performedBy} ({ev.userRole})
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-slate-900/40 rounded-lg text-slate-400 text-center text-[11px]">
                  <span>Initial submission recorded on {submission.submittedDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Assign Reviewer Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              <span>Assign Referee / Reviewer</span>
            </h3>
            <p className="text-xs text-slate-300">
              Select an internal referee from Shivaji College academic faculty. The assigned reviewer will receive private access to evaluate the manuscript.
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Select Referee:
              </label>
              <select
                value={selectedReviewerId}
                onChange={(e) => setSelectedReviewerId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:border-amber-400"
              >
                <option value="">-- Choose Faculty Reviewer --</option>
                {availableReviewers.map((rev) => (
                  <option key={rev.id} value={rev.id} disabled={!rev.isReviewingEnabled}>
                    {rev.name} — {rev.department} {!rev.isReviewingEnabled ? '(Reviewing Disabled)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssignment}
                disabled={!selectedReviewerId}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Decision Confirmation Modal */}
      {showDecisionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <span>Record Editorial Decision: {showDecisionModal}</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Editorial Decision Rationale &amp; Author Notes:
              </label>
              <textarea
                rows={3}
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                placeholder="Formal notes to be recorded in audit log..."
                className="w-full text-xs px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Verified Similarity Score (%):
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={plagiarismScore}
                onChange={(e) => setPlagiarismScore(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-hidden font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDecisionModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDecision}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Record Decision
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Publish to Journal Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Publish in Journal Issue</span>
            </h3>
            <p className="text-xs text-slate-300">
              This will officially publish the approved manuscript into the public repository and current/archival issues.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Volume
                </label>
                <input
                  type="text"
                  value={publishVolume}
                  onChange={(e) => setPublishVolume(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Issue
                </label>
                <input
                  type="text"
                  value={publishIssue}
                  onChange={(e) => setPublishIssue(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Assigned Page Range
              </label>
              <input
                type="text"
                value={publishPages}
                onChange={(e) => setPublishPages(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Official Digital Object Identifier (DOI)
              </label>
              <input
                type="text"
                value={publishDoi}
                onChange={(e) => setPublishDoi(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPublish}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Confirm &amp; Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Upload Revision Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleUploadRevisionSubmit} className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-400" />
              <span>Upload Manuscript Revision</span>
            </h3>
            <p className="text-xs text-slate-300">
              Upload Version {(submission.files?.length || 0) + 1}. All previous versions remain preserved in the audit trail.
            </p>

            <div className="border-2 border-dashed border-slate-700 hover:border-amber-400 p-6 rounded-xl text-center bg-slate-800/60 cursor-pointer">
              <input
                type="file"
                accept=".pdf,.docx"
                required
                onChange={(e) => setRevisionFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-400"
              />
              {revisionFile && (
                <p className="text-xs text-emerald-400 font-mono font-bold mt-2">
                  Selected: {revisionFile.name} ({(revisionFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowRevisionModal(false);
                  setRevisionFile(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!revisionFile}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Upload Revision
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PDF VIEWER MODAL */}
      <ManuscriptPdfViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        submission={submission}
        activeFile={selectedFileForViewer}
        hasAccess={hasAccessToManuscript}
        canDownload={hasAccessToManuscript}
      />
    </div>
  );
}
