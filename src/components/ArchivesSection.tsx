import { useState } from 'react';
import { 
  Archive, 
  Calendar, 
  BookOpen, 
  FileText, 
  Download, 
  Quote, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Building2, 
  CheckCircle2, 
  Eye, 
  ShieldCheck,
  Printer
} from 'lucide-react';
import { ARCHIVE_DATA, JOURNAL_INFO } from '../data/journalData';
import { JournalArticle, ArchiveYear, ArchiveIssue } from '../types';

interface ArchivesSectionProps {
  onSelectArticle: (article: JournalArticle) => void;
  onOpenCitationModal: (article: JournalArticle) => void;
}

export default function ArchivesSection({
  onSelectArticle,
  onOpenCitationModal,
}: ArchivesSectionProps) {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedVolumeIssue, setSelectedVolumeIssue] = useState<string>("vol-1-iss-1");
  const [expandedAbstracts, setExpandedAbstracts] = useState<Record<string, boolean>>({});
  const [archiveSearchQuery, setArchiveSearchQuery] = useState<string>('');

  const currentYearData = ARCHIVE_DATA.find((y) => y.year === selectedYear) || ARCHIVE_DATA[0];
  const activeIssue = currentYearData.issues[0];

  const toggleAbstract = (articleId: string) => {
    setExpandedAbstracts((prev) => ({
      ...prev,
      [articleId]: !prev[articleId]
    }));
  };

  const handleDownloadPDF = (article: JournalArticle) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const authorsStr = article.authors.join(', ');
    const sectionsHtml = article.sections?.map((s, idx) => `
      <section style="margin-bottom: 22px;">
        <h3 style="font-size: 15px; font-weight: 700; color: #0B192C; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; font-family: 'Times New Roman', serif;">
          ${s.heading}
        </h3>
        <p style="font-size: 12.5px; line-height: 1.75; color: #1e293b; text-align: justify; margin: 0; font-family: 'Times New Roman', serif;">
          ${s.content}
        </p>
      </section>
    `).join('') || `<div style="white-space: pre-wrap; font-size: 12.5px; line-height: 1.75; color: #1e293b; font-family: 'Times New Roman', serif;">${article.htmlContent || article.fullText || article.abstract}</div>`;

    const referencesHtml = article.references?.map((r, i) => `
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
              font-size: 12px; 
              color: #781D26; 
              margin-bottom: 6px; 
              letter-spacing: 0.5px;
            }
            .abstract-text { 
              font-size: 12px; 
              color: #1e293b; 
              line-height: 1.65; 
              text-align: justify; 
              margin-bottom: 8px; 
            }
            .keywords-line { 
              font-size: 11px; 
              color: #334155; 
            }
            .page-counter {
              text-align: right;
              font-size: 10px;
              color: #64748b;
              margin-top: 30px;
              border-top: 1px solid #e2e8f0;
              padding-top: 8px;
            }
            .running-footer { 
              margin-top: 30px; 
              border-top: 1px solid #cbd5e1; 
              padding-top: 10px; 
              font-size: 10px; 
              color: #64748b; 
              text-align: center; 
            }
            @media print {
              .page-break { page-break-before: always; }
            }
          </style>
        </head>
        <body>
          <!-- Mandatory First Page Bibliographic Header -->
          <div class="header-banner">
            <div>
              <div class="serial-title">${JOURNAL_INFO.name}</div>
              <div style="font-size: 11px; color: #475569; margin-top: 2px;">
                ${JOURNAL_INFO.publisher} • ISSN: ${JOURNAL_INFO.issn}
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 11px; font-weight: bold; color: #781D26; text-transform: uppercase;">
                ${article.articleNumber}
              </div>
              <div style="font-size: 11px; font-weight: 600; color: #0B192C;">
                Volume 1, Issue 1 (January–June 2026)
              </div>
              <div style="font-size: 11px; color: #64748b;">
                Pages: pp. ${article.pages || article.pageRange}
              </div>
            </div>
          </div>

          <!-- Bibliographic Particulars Box -->
          <div class="bibliographic-box">
            <div><strong>Serial:</strong> ${JOURNAL_INFO.name}</div>
            <div><strong>Volume & Issue:</strong> Volume 1, Issue 1 (2026)</div>
            <div><strong>Publication Date:</strong> ${article.publicationDate || article.publishedDate || 'January 2026'}</div>
            <div><strong>Pagination:</strong> pp. ${article.pages || article.pageRange}</div>
            <div><strong>DOI:</strong> https://doi.org/${article.doi}</div>
            <div><strong>Discipline:</strong> ${article.discipline} (Peer-Reviewed)</div>
          </div>

          <!-- Article Title, Authors & Affiliation -->
          <div class="article-title">${article.title}</div>
          <div class="authors-line">${authorsStr}</div>
          <div class="affiliation-line">${article.affiliations || article.affiliation}</div>

          <!-- Structured Abstract & Keywords -->
          <div class="abstract-container">
            <div class="abstract-heading">Abstract</div>
            <div class="abstract-text">${article.abstract}</div>
            <div class="keywords-line"><strong>Keywords:</strong> ${article.keywords.join(', ')}</div>
          </div>

          <!-- Full Text Content Sections -->
          <div>
            ${sectionsHtml}
          </div>

          <!-- References -->
          ${referencesHtml ? `
            <div style="margin-top: 30px; border-top: 1.5px solid #cbd5e1; padding-top: 14px;">
              <h3 style="font-size: 13.5px; font-weight: bold; color: #0B192C; text-transform: uppercase; margin-bottom: 8px;">
                References
              </h3>
              <ol style="padding-left: 18px; margin: 0;">
                ${referencesHtml}
              </ol>
            </div>
          ` : ''}

          <!-- Institutional Footer -->
          <div class="running-footer">
            <strong>Shivraj 350: International Peer Reviewed Multidisciplinary Journal</strong><br/>
            Published by Shivaji College, University of Delhi, Ring Road, Raja Garden, New Delhi - 110027, India.<br/>
            Official Portal: https://${JOURNAL_INFO.website} | Inquiries: ${JOURNAL_INFO.email} | Individual Article PDF
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 400);
  };

  const filteredArticles = activeIssue.articles.filter((art) => {
    if (!archiveSearchQuery.trim()) return true;
    const query = archiveSearchQuery.toLowerCase();
    return (
      art.title.toLowerCase().includes(query) ||
      art.authors.some(a => a.toLowerCase().includes(query)) ||
      art.discipline.toLowerCase().includes(query) ||
      art.keywords.some(k => k.toLowerCase().includes(query)) ||
      art.doi.toLowerCase().includes(query)
    );
  });

  return (
    <section id="archives" className="py-16 sm:py-24 bg-white border-b border-slate-200 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#781D26]/10 text-[#781D26] text-xs font-bold uppercase tracking-wider mb-3">
            <Archive className="w-3.5 h-3.5" />
            Publication Repository &amp; Archives
          </div>
          <h2 className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B192C]">
            Journal Volume &amp; Issue Archives
          </h2>
          <div className="w-20 h-1 bg-[#781D26] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed">
            Statutory serial archive for <strong className="text-[#0B192C]">{JOURNAL_INFO.name}</strong>.
            Browse each issue&apos;s formatted Table of Contents with individual article links, abstracts, and standalone full-text PDFs.
          </p>
        </div>

        {/* Year & Volume Selection Hierarchy */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Navigation: Year -> Volume -> Issue Tree */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Year Selector Card */}
            <div className="bg-[#FAF8F5] rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-3">
                Publication Timeline / Years
              </span>

              <div className="space-y-2">
                {ARCHIVE_DATA.map((yr) => (
                  <div key={yr.year} className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setSelectedYear(yr.year)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl font-cinzel font-bold text-sm transition-all cursor-pointer ${
                        selectedYear === yr.year
                          ? 'bg-[#0B192C] text-white shadow-md'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Calendar className={`w-4 h-4 ${selectedYear === yr.year ? 'text-amber-400' : 'text-slate-400'}`} />
                        <span>Year {yr.year}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-md ${selectedYear === yr.year ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {yr.issues.length} {yr.issues.length === 1 ? 'Volume' : 'Volumes'}
                      </span>
                    </button>

                    {/* Nested Volume & Issue List */}
                    {selectedYear === yr.year && (
                      <div className="pl-4 space-y-1.5 pt-1 border-l-2 border-[#781D26] ml-4">
                        {yr.issues.map((iss) => (
                          <button
                            key={`${iss.volume}-${iss.issue}`}
                            type="button"
                            onClick={() => setSelectedVolumeIssue(`vol-${iss.volumeNumber}-iss-${iss.issueNumber}`)}
                            className="w-full text-left p-2.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:border-[#781D26] text-[#0B192C] flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <div>
                              <div className="font-bold text-[#781D26]">{iss.volume}, {iss.issue}</div>
                              <div className="text-[11px] text-slate-500">{iss.period}</div>
                            </div>
                            <span className="text-[10px] bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.5 rounded font-mono">
                              {iss.articleCount} papers
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Future Volumes Architecture Placeholder */}
                <div className="pt-3 border-t border-slate-200">
                  <div className="p-3 rounded-xl bg-slate-100/70 border border-dashed border-slate-300 text-slate-500 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-semibold block text-slate-700">Year 2027 (Volume 2)</span>
                      <span className="text-[11px]">Issue 1 &amp; Issue 2 (Scheduled)</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">
                      Upcoming
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata Box for Selected Issue */}
            <div className="bg-[#0B192C] text-white rounded-2xl p-5 sm:p-6 border border-white/10 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  Issue Metadata
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold">
                  Published
                </span>
              </div>

              <div>
                <h3 className="font-cinzel text-lg font-bold text-white">
                  {activeIssue.volume}, {activeIssue.issue}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {activeIssue.period} ({activeIssue.year})
                </p>
              </div>

              <div className="space-y-2 pt-2 text-xs border-t border-white/10 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Serial Title:</span>
                  <span className="font-semibold text-right text-white truncate max-w-[180px]" title={JOURNAL_INFO.name}>
                    {JOURNAL_INFO.shortName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ISSN Status:</span>
                  <span className="font-mono text-amber-300">{JOURNAL_INFO.issn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Published Content:</span>
                  <span className="font-semibold text-white">{activeIssue.articleCount} Peer-Reviewed Articles</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Publisher:</span>
                  <span className="text-white text-right">Shivaji College, DU</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 leading-relaxed border-t border-white/10">
                <strong>ISSN Requirement Notice:</strong> In strict compliance with ISSN criteria, every article is linked individually with its own standalone PDF.
              </div>
            </div>

          </div>

          {/* Right: Article Table of Contents */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header with Search and Issue Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#781D26]">
                  Table of Contents
                </span>
                <h3 className="font-cinzel text-lg sm:text-xl font-bold text-[#0B192C]">
                  {activeIssue.volume}, {activeIssue.issue} ({activeIssue.period})
                </h3>
              </div>

              {/* Filter Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter articles in issue..."
                  value={archiveSearchQuery}
                  onChange={(e) => setArchiveSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white border border-slate-300 focus:outline-none focus:border-[#781D26] text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Articles List with Exact 'Abstract', 'Full-Text', 'Full-Text PDF' Buttons */}
            <div className="space-y-4">
              {filteredArticles.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-[#FAF8F5] border border-dashed border-slate-300 text-slate-500 text-sm">
                  No articles matched your search query in this issue.
                </div>
              ) : (
                filteredArticles.map((article) => {
                  const isAbstractOpen = expandedAbstracts[article.id];
                  return (
                    <article
                      key={article.id}
                      id={`archive-article-${article.id}`}
                      className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md transition-all space-y-3"
                    >
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {article.articleNumber}
                          </span>
                          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#781D26]/10 text-[#781D26]">
                            {article.discipline}
                          </span>
                          <span className="text-[10px] font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            Pages: {article.pages}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-500 text-xs">
                          DOI: <a href={`https://doi.org/${article.doi}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#781D26] hover:underline">{article.doi}</a>
                        </span>
                      </div>

                      {/* Article Title */}
                      <h4 
                        onClick={() => onSelectArticle(article)}
                        className="font-cinzel text-base sm:text-lg font-bold text-[#0B192C] hover:text-[#781D26] transition-colors cursor-pointer leading-snug"
                      >
                        {article.title}
                      </h4>

                      {/* Authors & Affiliation */}
                      <div>
                        <div className="text-xs font-semibold text-slate-700">
                          {article.authors.join(' • ')}
                        </div>
                        <div className="text-[11px] text-slate-500 italic mt-0.5">
                          {article.affiliations || article.affiliation}
                        </div>
                      </div>

                      {/* Expandable Abstract Preview Container */}
                      {isAbstractOpen && (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed space-y-2.5">
                          <div className="flex items-center gap-1.5 text-[#781D26] font-bold uppercase tracking-wider text-[11px]">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Structured Abstract</span>
                          </div>
                          <p>{article.abstract}</p>
                          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Keywords:</span>
                            {article.keywords.map((kw, ki) => (
                              <span key={ki} className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* EXACT THREE ACTION BUTTONS: [Abstract], [Full-Text], [Full-Text PDF] */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          
                          {/* 1. Abstract Button */}
                          <button
                            type="button"
                            onClick={() => toggleAbstract(article.id)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer border ${
                              isAbstractOpen 
                                ? 'bg-slate-200 text-slate-800 border-slate-300' 
                                : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5 text-[#781D26]" />
                            <span>{isAbstractOpen ? 'Hide Abstract' : 'Abstract'}</span>
                          </button>

                          {/* 2. Full-Text Button */}
                          <button
                            type="button"
                            onClick={() => onSelectArticle(article)}
                            className="px-3.5 py-1.5 rounded-lg bg-[#0B192C] hover:bg-[#1E3E62] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-300" />
                            <span>Full-Text</span>
                          </button>

                          {/* 3. Full-Text PDF Button */}
                          <button
                            type="button"
                            onClick={() => handleDownloadPDF(article)}
                            className="px-3.5 py-1.5 rounded-lg bg-[#781D26] hover:bg-[#5a141b] text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-amber-300" />
                            <span>Full-Text PDF</span>
                          </button>

                        </div>

                        {/* Cite Button */}
                        <button
                          type="button"
                          onClick={() => onOpenCitationModal(article)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Quote className="w-3.5 h-3.5 text-slate-500" />
                          <span>Cite</span>
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
