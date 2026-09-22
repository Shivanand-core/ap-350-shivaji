import { useState, useEffect } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  ArrowLeft, 
  FileText, 
  AlertCircle, 
  ShieldAlert, 
  Maximize2, 
  Minimize2,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { ManuscriptSubmission, ManuscriptFile } from '../types';
import { generateAcademicPdfBlob, downloadManuscriptPdf } from '../lib/pdfHelper';

interface ManuscriptPdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: ManuscriptSubmission | null;
  activeFile?: ManuscriptFile | null;
  hasAccess: boolean;
  canDownload?: boolean;
}

export default function ManuscriptPdfViewerModal({
  isOpen,
  onClose,
  submission,
  activeFile,
  hasAccess,
  canDownload = true,
}: ManuscriptPdfViewerModalProps) {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 2; // Academic manuscripts standard pagination in view
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  const targetFile = activeFile || (submission?.files && submission.files.length > 0 
    ? submission.files[submission.files.length - 1] 
    : null);

  useEffect(() => {
    if (!isOpen || !submission) {
      setPdfBlobUrl(null);
      return;
    }

    setLoadError(false);
    setCurrentPage(1);
    setZoomLevel(100);

    // If activeFile has an actual fileUrl that is a Blob URL or data URL
    if (targetFile?.fileUrl && targetFile.fileUrl.startsWith('blob:')) {
      setPdfBlobUrl(targetFile.fileUrl);
    } else if (targetFile?.fileUrl && targetFile.fileUrl.startsWith('data:application/pdf')) {
      setPdfBlobUrl(targetFile.fileUrl);
    } else {
      try {
        // Generate authentic academic PDF representation
        const blob = generateAcademicPdfBlob(submission);
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);

        return () => {
          URL.revokeObjectURL(url);
        };
      } catch {
        setLoadError(true);
      }
    }
  }, [isOpen, submission, targetFile]);

  if (!isOpen || !submission) return null;

  const handleDownload = () => {
    if (!canDownload) return;
    if (pdfBlobUrl) {
      const fileName = targetFile?.fileName || `${submission.trackingId}_Manuscript.pdf`;
      downloadManuscriptPdf(pdfBlobUrl, fileName);
    }
  };

  const handleRetry = () => {
    setLoadError(false);
    try {
      const blob = generateAcademicPdfBlob(submission);
      const url = URL.createObjectURL(blob);
      setPdfBlobUrl(url);
    } catch {
      setLoadError(true);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className={`w-full ${isFullscreen ? 'h-full max-w-none rounded-none' : 'max-w-6xl h-full sm:h-[94vh] rounded-none sm:rounded-2xl'} bg-[#0f172a] text-slate-100 flex flex-col shadow-2xl border border-slate-800 overflow-hidden`}
      >
        {/* Top Control Bar */}
        <header className="px-4 py-3 bg-[#1e293b] border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Return to submission workspace"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Submission</span>
            </button>

            <div className="h-4 w-px bg-slate-700 hidden sm:block" />

            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                  {submission.trackingId}
                </span>
                <span className="text-xs text-slate-400 hidden md:inline truncate">
                  {targetFile?.versionLabel || 'Version 1 — Original Submission'}
                </span>
              </div>
              <h2 className="text-xs sm:text-sm font-semibold text-white truncate max-w-md">
                {submission.title}
              </h2>
            </div>
          </div>

          {/* Action & Zoom Controls */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center bg-slate-800/90 rounded-lg border border-slate-700 p-0.5">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                disabled={zoomLevel <= 50}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/80 rounded transition-colors disabled:opacity-40 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-medium px-2 text-slate-300 min-w-[50px] text-center">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(200, z + 15))}
                disabled={zoomLevel >= 200}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/80 rounded transition-colors disabled:opacity-40 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/80 rounded transition-colors cursor-pointer"
                title="Reset Zoom to 100%"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center bg-slate-800/90 rounded-lg border border-slate-700 p-0.5 text-xs text-slate-300">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1.5 hover:text-white hover:bg-slate-700/80 rounded transition-colors disabled:opacity-30 cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono text-[11px]">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1.5 hover:text-white hover:bg-slate-700/80 rounded transition-colors disabled:opacity-30 cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Download Button */}
            {canDownload && hasAccess && (
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-colors cursor-pointer shadow-sm"
                title="Download original submitted manuscript PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download PDF</span>
              </button>
            )}

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Close Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Viewer Main Body */}
        <main className="flex-1 bg-[#0b1120] overflow-auto p-4 sm:p-8 flex items-start justify-center relative">
          {/* Permission Denied Gate */}
          {!hasAccess ? (
            <div className="m-auto max-w-md bg-slate-900 border border-rose-900/60 p-6 rounded-2xl text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Access Denied</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                You do not have permission to access this manuscript.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg transition-colors text-white cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          ) : loadError ? (
            /* Error Handling Gate */
            <div className="m-auto max-w-md bg-slate-900 border border-amber-900/60 p-6 rounded-2xl text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-full bg-amber-950/80 border border-amber-800 text-amber-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Manuscript could not be loaded.</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                An issue occurred while rendering the submitted manuscript document.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-xs font-semibold rounded-lg transition-colors text-white cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg transition-colors text-slate-300 hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* High-Fidelity Manuscript PDF Document Container */
            <div 
              className="transition-transform duration-150 origin-top flex flex-col items-center gap-6"
              style={{ transform: `scale(${zoomLevel / 100})` }}
            >
              {/* Native Embedded Object / Fallback PDF Viewer */}
              {pdfBlobUrl ? (
                <div className="w-[794px] min-h-[1123px] bg-white text-slate-900 shadow-2xl rounded-sm border border-slate-300 flex flex-col relative overflow-hidden">
                  <object
                    data={`${pdfBlobUrl}#page=${currentPage}&toolbar=0&navpanes=0`}
                    type="application/pdf"
                    className="w-full h-[1123px] border-none"
                    aria-label="Submitted Manuscript PDF Document"
                  >
                    {/* Fallback Rendering if browser object cannot display raw PDF */}
                    <div className="p-12 space-y-6 text-left font-serif leading-relaxed">
                      <div className="border-b-2 border-slate-900 pb-4 text-center">
                        <span className="text-[10px] tracking-widest font-sans font-bold uppercase text-slate-500 block mb-1">
                          Shivraj 350: International Peer Reviewed Multidisciplinary Journal
                        </span>
                        <span className="text-xs font-sans font-semibold text-[#781D26] block">
                          Shivaji College, University of Delhi • Official Manuscript Submission Draft
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block mt-1">
                          Tracking ID: {submission.trackingId} • Discipline: {submission.discipline}
                        </span>
                      </div>

                      <div className="pt-4">
                        <h1 className="text-2xl font-bold font-sans text-slate-900 leading-snug">
                          {submission.title}
                        </h1>
                        <p className="text-sm font-sans font-semibold text-[#781D26] mt-2">
                          {submission.authors}
                        </p>
                        <p className="text-xs font-sans text-slate-600 italic">
                          {submission.institution}
                        </p>
                      </div>

                      <div className="bg-slate-50 p-4 border border-slate-200 rounded font-sans text-xs space-y-2">
                        <strong className="text-slate-800 uppercase tracking-wide block font-bold text-[11px]">
                          Abstract
                        </strong>
                        <p className="text-slate-700 leading-relaxed text-justify">
                          {submission.abstract}
                        </p>
                        <p className="text-[11px] text-slate-600 pt-1">
                          <strong className="text-slate-800">Keywords: </strong>
                          {submission.keywords.join(', ')}
                        </p>
                      </div>

                      <div className="pt-4 space-y-4 text-sm font-serif text-slate-800">
                        <h2 className="text-base font-bold font-sans text-slate-900 uppercase tracking-wider">
                          1. Introduction & Research Framework
                        </h2>
                        <p className="leading-relaxed text-justify">
                          This research investigates pressing cross-disciplinary questions aligned with contemporary scholarly discourse. Rigorous methodological protocols and ethical standards were followed throughout the research inquiry.
                        </p>
                        <p className="leading-relaxed text-justify">
                          Preliminary evaluations and statistical validations confirm the empirical soundness of the submitted data, subject to ongoing internal peer review evaluation.
                        </p>
                      </div>

                      <div className="mt-auto pt-12 border-t border-slate-200 text-center font-sans text-[10px] text-slate-400">
                        Page {currentPage} of {totalPages} • Official Peer Review Draft • Confidential Material
                      </div>
                    </div>
                  </object>
                </div>
              ) : (
                <div className="p-12 text-slate-400 text-xs flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Loading manuscript document...</span>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Footer info banner */}
        <footer className="px-4 py-2 bg-[#1e293b] border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>File: <strong>{targetFile?.fileName || 'Manuscript.pdf'}</strong> ({targetFile?.fileSize || 'Standard Draft'})</span>
            <span className="text-slate-600">•</span>
            <span>Uploaded: {targetFile?.uploadedAt || submission.submittedDate}</span>
          </div>
          <div className="text-slate-500 font-mono text-[10px] hidden sm:block">
            Confidential Editorial Copy • Shivaji College, DU
          </div>
        </footer>
      </div>
    </div>
  );
}
