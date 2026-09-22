import { 
  BookOpen, 
  Building2, 
  Mail, 
  Globe, 
  Calendar, 
  Languages, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Hash, 
  Layers, 
  MapPin, 
  Clock, 
  Phone, 
  Scale, 
  Upload, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { JOURNAL_INFO } from '../data/journalData';

interface JournalInformationSectionProps {
  onOpenGuidelines?: () => void;
  onOpenArchives?: () => void;
  onOpenSubmit?: () => void;
}

export default function JournalInformationSection({
  onOpenGuidelines,
  onOpenArchives,
  onOpenSubmit,
}: JournalInformationSectionProps) {
  // Exact 2-Column Table Data adhering strictly to ISSN India Inspection Guidelines
  const mandatoryTableRows = [
    {
      parameter: 'Title of the Journal / Serial',
      value: JOURNAL_INFO.name,
      highlight: true,
      subtext: 'Title is registered verbatim across all web pages, cover archives, and official university documentation.',
    },
    {
      parameter: 'Frequency of Publication',
      value: JOURNAL_INFO.frequency,
      subtext: 'Biannual publication cycle (Issue 1: January–June | Issue 2: July–December).',
    },
    {
      parameter: 'ISSN Status',
      value: `Online: ${JOURNAL_INFO.issn}`,
      badge: 'Application in Process',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      subtext: 'Under formal evaluation by the ISSN National Centre, National Science Library, CSIR-NIScPR, New Delhi.',
    },
    {
      parameter: 'Publisher Name & Complete Address',
      value: `${JOURNAL_INFO.publisher}, ${JOURNAL_INFO.address}`,
      subtext: 'Official institutional publishing body. Personal addresses are strictly prohibited under ISSN rules.',
    },
    {
      parameter: 'Starting Year of Publication',
      value: `${JOURNAL_INFO.startingYear}`,
      subtext: 'Volume 1, Issue 1 commenced in January 2026.',
    },
    {
      parameter: 'Subject / Aims and Scope',
      value: JOURNAL_INFO.subject,
      subtext: 'Fostering interdisciplinary research and empirical discovery across Sciences, Social Sciences, Humanities, and Professional Studies.',
    },
    {
      parameter: 'Language(s) Used',
      value: JOURNAL_INFO.language,
      subtext: 'All titles, abstracts, references, and full text manuscripts are published in English.',
    },
    {
      parameter: 'Publication Format',
      value: `${JOURNAL_INFO.publicationFormat} (Open Access)`,
      subtext: 'Digital serial repository with individual article PDF and full-text access.',
    },
    {
      parameter: 'Contact Email ID',
      value: JOURNAL_INFO.email,
      href: `mailto:${JOURNAL_INFO.email}`,
      isEmail: true,
      subtext: 'Primary institutional email for editorial correspondence and ISSN communications.',
    },
    {
      parameter: 'Contact Telephone & Mobile Number',
      value: `Phone: ${JOURNAL_INFO.phone} | Mobile: ${JOURNAL_INFO.mobileNumber}`,
      subtext: 'Official EPABX and journal editorial desk direct mobile contact line.',
    },
    {
      parameter: 'Peer Review Methodology',
      value: JOURNAL_INFO.peerReviewType,
      subtext: 'External double-blind peer review by qualified subject matter specialists.',
    },
    {
      parameter: 'Publication Charges (APC)',
      value: JOURNAL_INFO.publicationFee,
      subtext: 'Diamond Open Access model — completely free for both authors and readers.',
    },
    {
      parameter: 'Official Journal Serial URL',
      value: JOURNAL_INFO.canonicalUrl || `https://${JOURNAL_INFO.website}/journal/shivraj350`,
      href: JOURNAL_INFO.canonicalUrl || `https://${JOURNAL_INFO.website}/journal/shivraj350`,
      isUrl: true,
      subtext: 'Specific individual serial webpage URL submitted for ISSN assignment and scrutiny.',
    },
  ];

  return (
    <section id="journal-info" className="py-16 sm:py-24 bg-[#FAF8F5] border-b border-slate-200 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#781D26]/10 text-[#781D26] text-xs font-bold uppercase tracking-wider mb-3">
            <BookOpen className="w-3.5 h-3.5 text-[#781D26]" />
            Official Serial Registry
          </div>
          <h2 className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B192C]">
            Journal Information & Particulars
          </h2>
          <div className="w-20 h-1 bg-[#781D26] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed">
            Statutory journal credentials, institutional stewardship particulars, and publication parameters for{' '}
            <strong className="text-[#0B192C]">{JOURNAL_INFO.name}</strong> as per ISSN National Centre India criteria.
          </p>
        </div>

        {/* 1. Mandatory Two-Column Table Format (Matching ISSN India Demo Layout) */}
        <div className="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden mb-12">
          <div className="bg-[#0B192C] px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block">
                Statutory Table of Serial Particulars
              </span>
              <h3 className="font-cinzel text-lg sm:text-xl font-bold text-white">
                Basic Journal Information
              </h3>
            </div>
            <div className="text-xs font-mono text-slate-300 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15 self-start sm:self-auto">
              ISSN Application Ref: <span className="text-amber-300 font-bold">2026/CSIR-NIScPR</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-xs uppercase font-bold text-slate-700 tracking-wider">
                  <th scope="col" className="w-1/3 sm:w-2/5 p-3.5 sm:p-4 font-serif">
                    Particulars / Parameter
                  </th>
                  <th scope="col" className="w-2/3 sm:w-3/5 p-3.5 sm:p-4 font-serif">
                    Official Registered Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs sm:text-sm font-sans">
                {mandatoryTableRows.map((row, idx) => (
                  <tr 
                    key={idx}
                    className={`transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF8F5]/60'
                    } hover:bg-amber-50/40`}
                  >
                    {/* Left Column: Parameter */}
                    <td className="p-3.5 sm:p-4 font-semibold text-slate-900 align-top border-r border-slate-200">
                      <div className="flex items-start gap-2">
                        <span className="text-[#781D26] font-bold">•</span>
                        <span>{row.parameter}</span>
                      </div>
                    </td>

                    {/* Right Column: Value */}
                    <td className="p-3.5 sm:p-4 text-slate-800 align-top">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {row.isEmail ? (
                            <a
                              href={row.href}
                              className="font-mono font-semibold text-[#781D26] hover:underline break-all"
                            >
                              {row.value}
                            </a>
                          ) : row.isUrl ? (
                            <a
                              href={row.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono font-semibold text-[#781D26] hover:underline inline-flex items-center gap-1 break-all"
                            >
                              <span>{row.value}</span>
                              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                            </a>
                          ) : (
                            <span className={`font-medium ${row.highlight ? 'font-serif font-bold text-[#0B192C] text-sm sm:text-base' : ''}`}>
                              {row.value}
                            </span>
                          )}

                          {row.badge && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${row.badgeColor}`}>
                              {row.badge}
                            </span>
                          )}
                        </div>

                        {row.subtext && (
                          <p className="text-[11px] text-slate-500 leading-normal">
                            {row.subtext}
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Mandatory Submission Details & Policy Links Bar */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#781D26] mb-1">
                <Scale className="w-4 h-4" />
                Editorial Mandates & Direct Links
              </div>
              <h3 className="font-cinzel text-lg sm:text-xl font-bold text-[#0B192C]">
                Statutory Author Guidelines & Policies
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Mandatory criteria required for ISSN scrutiny: author rules, peer review policies, and UGC anti-plagiarism compliance.
              </p>
            </div>

            {onOpenSubmit && (
              <button
                type="button"
                onClick={onOpenSubmit}
                className="px-5 py-2.5 rounded-xl bg-[#781D26] hover:bg-[#5a141b] text-white font-semibold text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm transition-colors cursor-pointer shrink-0"
              >
                <Upload className="w-4 h-4 text-amber-300" />
                <span>Submit Manuscript</span>
              </button>
            )}
          </div>

          {/* 4 Cards Grid linking to exact sections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
            {/* 1. Author Guidelines */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-slate-200 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#781D26] font-bold text-xs">
                  <FileText className="w-4 h-4" />
                  <span>Author Guidelines</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Scope criteria, word count limits (5,000–8,000 words), and title page requirements.
                </p>
              </div>
              {onOpenGuidelines && (
                <button
                  type="button"
                  onClick={onOpenGuidelines}
                  className="text-xs font-semibold text-[#781D26] hover:underline inline-flex items-center gap-1 pt-2 cursor-pointer"
                >
                  <span>View Guidelines</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 2. Manuscript Preparation */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-slate-200 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#781D26] font-bold text-xs">
                  <Languages className="w-4 h-4" />
                  <span>Formatting & APA 7th</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  IMRAD structure, high-resolution figures (300 DPI), and APA 7th referencing format.
                </p>
              </div>
              {onOpenGuidelines && (
                <button
                  type="button"
                  onClick={onOpenGuidelines}
                  className="text-xs font-semibold text-[#781D26] hover:underline inline-flex items-center gap-1 pt-2 cursor-pointer"
                >
                  <span>View Style Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 3. Review Policy */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-slate-200 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#781D26] font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Double-Blind Review</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Independent external evaluation by at least two domain referees with a 4–6 week turnaround.
                </p>
              </div>
              {onOpenGuidelines && (
                <button
                  type="button"
                  onClick={onOpenGuidelines}
                  className="text-xs font-semibold text-[#781D26] hover:underline inline-flex items-center gap-1 pt-2 cursor-pointer"
                >
                  <span>Review Workflow</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 4. Plagiarism Policy */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-slate-200 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#781D26] font-bold text-xs">
                  <Scale className="w-4 h-4" />
                  <span>UGC Plagiarism Rules</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Strict compliance with UGC 2018 regulations; similarity index capped below 10%.
                </p>
              </div>
              {onOpenGuidelines && (
                <button
                  type="button"
                  onClick={onOpenGuidelines}
                  className="text-xs font-semibold text-[#781D26] hover:underline inline-flex items-center gap-1 pt-2 cursor-pointer"
                >
                  <span>Anti-Plagiarism Policy</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 3. Aims & Scope & Publisher Coordinates */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#781D26]/10 text-[#781D26] text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              Verbatim Aims & Scope
            </div>
            <h3 className="font-cinzel text-xl font-bold text-[#0B192C]">
              Statement of Purpose & Academic Mission
            </h3>
            <blockquote className="p-4 sm:p-5 rounded-xl bg-amber-50/50 border-l-4 border-[#781D26] text-slate-700 text-xs sm:text-sm md:text-base leading-relaxed italic">
              &ldquo;{JOURNAL_INFO.verbatimScope}&rdquo;
            </blockquote>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {JOURNAL_INFO.aimsAndScope}
            </p>
          </div>

          {/* Publisher Coordinates Block */}
          <div className="lg:col-span-4 bg-[#0B192C] text-white rounded-2xl p-6 sm:p-8 border border-white/10 shadow-lg space-y-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
              <Building2 className="w-4 h-4" />
              Official Institutional Publisher
            </div>
            <h4 className="font-cinzel text-lg font-bold text-white">
              {JOURNAL_INFO.publisher}
            </h4>
            <div className="space-y-3 pt-1 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{JOURNAL_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{JOURNAL_INFO.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${JOURNAL_INFO.email}`} className="text-white hover:text-amber-300 underline font-mono">
                  {JOURNAL_INFO.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                <a 
                  href={`https://${JOURNAL_INFO.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white hover:text-amber-300 underline"
                >
                  {JOURNAL_INFO.website}
                </a>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10 text-[11px] text-slate-400 leading-relaxed">
              Published under the statutory academic auspices of Shivaji College, accredited NAAC Grade &quot;A&quot;, University of Delhi.
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
