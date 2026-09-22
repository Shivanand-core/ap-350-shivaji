import React, { useState, useMemo } from 'react';
import { 
  Archive, 
  Calendar, 
  BookOpen, 
  FileText, 
  Download, 
  Quote, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  Search, 
  Building2, 
  CheckCircle2, 
  Eye, 
  Copy,
  Check,
  Filter,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { JOURNAL_INFO, CURRENT_ISSUE } from '../data/journalData';
import { JournalArticle, ArchiveYear, ArchiveIssue } from '../types';
import { useJournal } from '../context/JournalContext';

interface UnifiedArchivesRepositorySectionProps {
  onSelectArticle: (article: JournalArticle) => void;
  onOpenCitationModal: (article: JournalArticle) => void;
  onOpenSubmitModal?: () => void;
  initialDiscipline?: string;
}

export default function UnifiedArchivesRepositorySection({
  onSelectArticle,
  onOpenCitationModal,
  onOpenSubmitModal,
  initialDiscipline = 'All',
}: UnifiedArchivesRepositorySectionProps) {
  const { allArticles, isDummyContentEnabled } = useJournal();

  const [selectedDiscipline, setSelectedDiscipline] = useState<string>(initialDiscipline);
  const [selectedVolume, setSelectedVolume] = useState<string>('Volume 1');
  const [selectedIssue, setSelectedIssue] = useState<string>('Issue 1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedAbstracts, setExpandedAbstracts] = useState<Record<string, boolean>>({});
  const [copiedDoi, setCopiedDoi] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialDiscipline) {
      setSelectedDiscipline(initialDiscipline);
    }
  }, [initialDiscipline]);

  const disciplines = ['All', 'Sciences', 'Social Sciences', 'Humanities', 'Professional Studies'];

  const toggleAbstract = (id: string) => {
    setExpandedAbstracts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyDoi = (doi: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://doi.org/${doi}`);
    setCopiedDoi(doi);
    setTimeout(() => setCopiedDoi(null), 2000);
  };

  // Standalone individual article PDF generator with mandatory running headers and pagination
  const handleDownloadPDF = (article: JournalArticle, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingPdf(article.id);

    setTimeout(() => {
      setDownloadingPdf(null);
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const authorsStr = article.authors.join(', ');
      const sectionsHtml = article.sections?.map((s) => `
        <section style="margin-bottom: 22px;">
          <h3 style="font-size: 15px; font-weight: 700; color: #0B192C; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; font-family: 'Times New Roman', serif;">
            ${s.heading}
          </h3>
          <p style="font-size: 12.5px; line-height: 1.75; color: #1e293b; text-align: justify; margin: 0; font-family: 'Times New Roman', serif;">
            ${s.content}
          </p>
        </section>
      `).join('') || `<div style="white-space: pre-wrap; font-size: 12.5px; line-height: 1.75; color: #1e293b; font-family: 'Times New Roman', serif;">${article.htmlContent || article.fullText || article.abstract}</div>`;

      const referencesHtml = article.references?.map((r) => `
        <li style="margin-bottom: 6px; font-size: 11px; line-height: 1.5; color: #334155;">${r}</li>
      `).join('') || '';

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${article.title} | ${JOURNAL_INFO.name}</title>
            <style>
              @page { 
                size: A4; 
                margin: 20mm 15mm 20mm 15mm; 
                @bottom-right {
                  content: "Page " counter(page);
                  font-size: 9pt;
                  font-family: 'Times New Roman', serif;
                }
              }
              body { 
                font-family: 'Times New Roman', Times, serif; 
                color: #0f172a; 
                margin: 0; 
                padding: 10px; 
                line-height: 1.6; 
              }
              .header-banner { 
                border-bottom: 2.5px solid #781D26; 
                padding-bottom: 12px; 
                margin-bottom: 18px; 
                display: flex; 
                justify-content: space-between; 
                align-items: flex-end; 
              }
              .serial-title { 
                font-size: 14px; 
                font-weight: bold; 
                color: #0B192C; 
                text-transform: uppercase; 
                letter-spacing: 0.5px; 
              }
              .bibliographic-box { 
                background: #f8fafc; 
                border: 1px solid #e2e8f0; 
                padding: 10px 14px; 
                border-radius: 4px; 
                font-size: 11px; 
                margin-bottom: 18px; 
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 6px;
              }
              .article-title { 
                font-size: 20px; 
                font-weight: bold; 
                color: #0B192C; 
                line-height: 1.35; 
                margin: 10px 0 8px 0; 
              }
              .authors-line { 
                font-size: 13px; 
                font-weight: bold; 
                color: #1e293b; 
                margin-bottom: 4px; 
              }
              .affiliation-line { 
                font-size: 11px; 
                color: #475569; 
                font-style: italic; 
                margin-bottom: 16px; 
              }
              .abstract-container { 
                background: #fafaf9; 
                border-left: 3px solid #781D26; 
                padding: 12px 16px; 
                margin-bottom: 22px; 
              }
              .abstract-heading { 
                font-weight: bold; 
                text-transform: uppercase; 
                font-size: 11px; 
                color: #781D26; 
                margin-bottom: 6px; 
                letter-spacing: 0.5px; 
              }
              .keywords-line { 
                margin-top: 10px; 
                font-size: 11px; 
                color: #334155; 
              }
              .references-block { 
                border-top: 1px solid #cbd5e1; 
                padding-top: 14px; 
                margin-top: 30px; 
              }
            </style>
          </head>
          <body>
            <div class="header-banner">
              <div>
                <div class="serial-title">${JOURNAL_INFO.name}</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Published by Shivaji College, University of Delhi, Ring Road, Raja Garden, New Delhi - 110027</div>
              </div>
              <div style="text-align: right; font-size: 11px; color: #475569;">
                <div><strong>ISSN:</strong> ${JOURNAL_INFO.issn}</div>
                <div>Biannual Peer-Reviewed Academic Serial</div>
              </div>
            </div>

            <div class="bibliographic-box">
              <div><strong>Publication:</strong> ${article.volume}, ${article.issue} (${article.monthYear || 'Jan–June 2026'})</div>
              <div><strong>Article Identifier:</strong> ${article.articleNumber || article.id}</div>
              <div><strong>Consecutive Pages:</strong> pp. ${article.pages}</div>
              <div><strong>Permanent DOI:</strong> https://doi.org/${article.doi}</div>
            </div>

            <h1 class="article-title">${article.title}</h1>
            <div class="authors-line">${authorsStr}</div>
            <div class="affiliation-line">${article.affiliations || article.affiliation}</div>

            <div class="abstract-container">
              <div class="abstract-heading">Structured Abstract</div>
              <p style="margin: 0; font-size: 12px; line-height: 1.7; text-align: justify; color: #1e293b;">${article.abstract}</p>
              <div class="keywords-line"><strong>Keywords:</strong> ${article.keywords.join(', ')}</div>
            </div>

            ${sectionsHtml}

            ${referencesHtml ? `
              <div class="references-block">
                <h3 style="font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #0B192C;">References</h3>
                <ol style="margin: 0; padding-left: 20px;">
                  ${referencesHtml}
                </ol>
              </div>
            ` : ''}

            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                }, 250);
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }, 250);
  };

  // Filter articles by discipline and search query
  const filteredArticles = useMemo(() => {
    return allArticles.filter((article) => {
      const disciplineMatch =
        selectedDiscipline === 'All' ||
        article.category === selectedDiscipline ||
        article.discipline === selectedDiscipline;

      const q = searchQuery.trim().toLowerCase();
      if (!q) return disciplineMatch;

      const matchesSearch =
        article.title.toLowerCase().includes(q) ||
        article.authors.some((a) => a.toLowerCase().includes(q)) ||
        article.keywords.some((k) => k.toLowerCase().includes(q)) ||
        article.doi.toLowerCase().includes(q) ||
        (article.affiliation && article.affiliation.toLowerCase().includes(q));

      return disciplineMatch && matchesSearch;
    });
  }, [allArticles, selectedDiscipline, searchQuery]);

  return (
    <section 
      id="archives" 
      className="py-14 sm:py-20 bg-[#FAF8F5] text-slate-800 scroll-mt-24 border-b border-stone-200"
    >
      {/* Anchor alias so links to #repository also land here seamlessly */}
      <div id="repository" className="scroll-mt-24" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#781D26]/10 text-[#781D26] text-xs font-semibold uppercase tracking-wider mb-3">
            <Archive className="w-3.5 h-3.5" />
            <span>Official Scholarly Record</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#0B192C] tracking-tight">
            Archives & Research Repository
          </h2>

          <p className="text-sm sm:text-base text-slate-600 font-sans mt-3 leading-relaxed">
            Consolidated archive of double-blind peer-reviewed contributions across Sciences, Social Sciences, Humanities, and Professional Studies published by Shivaji College, University of Delhi.
          </p>
        </div>

        {/* Issue Information & Statutory Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#781D26] text-white">
                  Volume 1 • Issue 1
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Biannual • Period: January–June 2026
                </span>
                <span className="text-xs font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  ISSN: {JOURNAL_INFO.issn}
                </span>
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0B192C] mt-2">
                Inaugural Issue — 350th Coronation Commemorative Volume
              </h3>
            </div>

            <div className="text-left lg:text-right shrink-0">
              <span className="text-xs text-slate-500 block">Total Published Articles</span>
              <span className="font-serif text-2xl font-bold text-[#781D26]">
                {filteredArticles.length} / {allArticles.length}
              </span>
            </div>
          </div>

          {/* Unified Controls: Disciplinary Tabs & Real-time Search */}
          <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Discipline Pills */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {disciplines.map((disc) => (
                <button
                  key={disc}
                  type="button"
                  onClick={() => setSelectedDiscipline(disc)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    selectedDiscipline === disc
                      ? 'bg-[#781D26] text-white shadow-xs'
                      : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                  }`}
                >
                  {disc}
                </button>
              ))}
            </div>

            {/* Live Search Bar */}
            <div className="relative w-full md:w-72 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search author, keyword, DOI..."
                className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#781D26] outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Articles List / Table of Contents */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 shadow-xs">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-slate-800">
              No Articles Found in this Filter
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              {!isDummyContentEnabled && allArticles.length === 0 ? (
                <span>
                  Dummy content mode is currently <strong>OFF</strong>. The repository is in scratchpad mode awaiting newly approved peer-reviewed manuscripts or custom articles added via the Developer Portal.
                </span>
              ) : (
                <span>No articles matched your search query or discipline filter. Clear search or select &apos;All&apos; disciplines.</span>
              )}
            </p>
            {onOpenSubmitModal && (
              <button
                type="button"
                onClick={onOpenSubmitModal}
                className="mt-4 px-4 py-2 rounded-xl bg-[#781D26] hover:bg-[#8E222D] text-white text-xs font-semibold shadow cursor-pointer transition-colors"
              >
                Submit a Manuscript for Peer Review
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredArticles.map((article, index) => {
              const isAbstractExpanded = expandedAbstracts[article.id];
              return (
                <article
                  key={article.id}
                  className="bg-white rounded-2xl border border-stone-200 hover:border-stone-300 shadow-xs hover:shadow-md transition-all p-5 sm:p-6"
                >
                  {/* Top Bar: Consecutive Number, Discipline, Page Range & DOI */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-stone-100 text-[#781D26] border border-stone-200">
                        {article.articleNumber || `ARTICLE ${String(index + 1).padStart(2, '0')}`}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600 bg-stone-100 px-2 py-0.5 rounded">
                        {article.discipline || article.category}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        pp. {article.pages || article.pageRange}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
                      <span>DOI:</span>
                      <span className="text-slate-700">{article.doi}</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyDoi(article.doi, e)}
                        className="p-1 hover:bg-stone-100 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="Copy DOI URL"
                      >
                        {copiedDoi === article.doi ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Title & Authors */}
                  <h3 
                    onClick={() => onSelectArticle(article)}
                    className="font-serif text-base sm:text-xl font-bold text-[#0B192C] hover:text-[#781D26] cursor-pointer transition-colors leading-snug mt-1"
                  >
                    {article.title}
                  </h3>

                  <div className="mt-1.5 text-xs text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-semibold text-slate-800">
                      {article.authors.join(', ')}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 italic">
                      {article.affiliations || article.affiliation}
                    </span>
                  </div>

                  {/* Inline Abstract Accordion */}
                  {isAbstractExpanded && (
                    <div className="mt-3.5 p-4 bg-[#FBF9F6] border-l-3 border-[#781D26] rounded-r-xl text-xs sm:text-[13px] text-slate-700 leading-relaxed space-y-2 animate-in fade-in duration-150">
                      <div>
                        <strong className="text-[#781D26] uppercase text-[10px] tracking-wider block mb-1">
                          Structured Abstract
                        </strong>
                        <p className="text-justify">{article.abstract}</p>
                      </div>
                      <div className="pt-2 border-t border-stone-200/80 text-[11px]">
                        <strong className="text-slate-900">Keywords: </strong>
                        <span className="text-slate-600">{article.keywords.join(', ')}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons Row */}
                  <div className="mt-4 pt-3.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2.5">
                    
                    {/* Left: Abstract Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleAbstract(article.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-stone-100 transition-colors cursor-pointer"
                    >
                      <span>{isAbstractExpanded ? 'Hide Abstract' : 'Abstract'}</span>
                      {isAbstractExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </button>

                    {/* Right: Full-Text, PDF & Cite */}
                    <div className="flex items-center gap-2">
                      {/* Full-Text HTML */}
                      <button
                        type="button"
                        onClick={() => onSelectArticle(article)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-semibold cursor-pointer transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#781D26]" />
                        <span>Full-Text</span>
                      </button>

                      {/* Full-Text PDF */}
                      <button
                        type="button"
                        onClick={(e) => handleDownloadPDF(article, e)}
                        disabled={downloadingPdf === article.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#781D26] hover:bg-[#8E222D] text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-300" />
                        <span>{downloadingPdf === article.id ? 'Generating...' : 'Full-Text PDF'}</span>
                      </button>

                      {/* Cite */}
                      <button
                        type="button"
                        onClick={() => onOpenCitationModal(article)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-stone-100 text-xs font-medium cursor-pointer transition-colors"
                        title="Generate citation"
                      >
                        <Quote className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Cite</span>
                      </button>
                    </div>

                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
