import { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  ShieldAlert, 
  Upload, 
  Mail, 
  HelpCircle, 
  Clock, 
  ListChecks, 
  FileCheck2, 
  Scale, 
  AlertCircle 
} from 'lucide-react';
import { JOURNAL_INFO, AUTHOR_GUIDELINES_DATA } from '../data/journalData';

interface ForAuthorsSectionProps {
  onOpenSubmitModal: () => void;
}

export default function ForAuthorsSection({ onOpenSubmitModal }: ForAuthorsSectionProps) {
  const [activeTab, setActiveTab] = useState<'guidelines' | 'preparation' | 'process' | 'ethics'>('guidelines');

  return (
    <section id="authors" className="py-16 sm:py-24 bg-[#FAF8F5] border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#781D26]/10 text-[#781D26] text-xs font-bold uppercase tracking-wider mb-3">
            <ListChecks className="w-3.5 h-3.5" />
            Author Instructions & Policies
          </div>
          <h2 className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B192C]">
            Information for Authors
          </h2>
          <div className="w-20 h-1 bg-[#781D26] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
            Comprehensive editorial guidelines, manuscript preparation protocols, publication ethics, and submission procedures for publishing in{' '}
            <strong className="text-[#0B192C]">{JOURNAL_INFO.name}</strong>.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-center gap-2 pb-8 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('guidelines')}
            className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'guidelines'
                ? 'bg-[#0B192C] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Author Guidelines & Requirements
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preparation')}
            className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'preparation'
                ? 'bg-[#0B192C] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Manuscript Preparation
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('process')}
            className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'process'
                ? 'bg-[#0B192C] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Submission & Peer Review Process
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ethics')}
            className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ethics'
                ? 'bg-[#0B192C] text-white shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Publication Ethics & Plagiarism
          </button>
        </div>

        {/* Tab Content Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            
            {/* 1. Guidelines & Requirements Tab */}
            {activeTab === 'guidelines' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <FileCheck2 className="w-5 h-5 text-[#781D26]" />
                  <h3 className="font-cinzel text-lg sm:text-xl font-bold text-[#0B192C]">
                    Core Submission Requirements
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {AUTHOR_GUIDELINES_DATA.scopeAndFocus}
                </p>

                <div className="space-y-4 pt-2">
                  {AUTHOR_GUIDELINES_DATA.submissionRequirements.map((req, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#FAF8F5] border border-slate-200 space-y-1">
                      <div className="font-bold text-xs sm:text-sm text-[#0B192C] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#781D26] shrink-0" />
                        <span>{req.title}</span>
                      </div>
                      <p className="text-xs text-slate-600 pl-6 leading-relaxed">
                        {req.detail}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Editorial Confirmation Note */}
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-[#781D26] shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Editorial Board Notice:</strong> {AUTHOR_GUIDELINES_DATA.pendingNotice}
                  </div>
                </div>
              </div>
            )}

            {/* 2. Manuscript Preparation Tab */}
            {activeTab === 'preparation' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <BookOpen className="w-5 h-5 text-[#781D26]" />
                  <h3 className="font-cinzel text-lg sm:text-xl font-bold text-[#0B192C]">
                    Manuscript Formatting & Standards
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {AUTHOR_GUIDELINES_DATA.manuscriptPreparation.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#FAF8F5] border border-slate-200 space-y-1.5">
                      <h4 className="font-bold text-xs sm:text-sm text-[#0B192C] uppercase tracking-wider">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
                  <span className="font-bold uppercase tracking-wider text-[#781D26] block">
                    Author Anonymization for Double-Blind Review
                  </span>
                  <p className="leading-relaxed">
                    To preserve anonymous peer-review integrity, manuscripts must be blinded by omitting author names, institutional affiliations, and direct acknowledgments from the main document file. A separate Title Page containing all author particulars must be uploaded concurrently.
                  </p>
                </div>
              </div>
            )}

            {/* 3. Submission & Peer Review Process Tab */}
            {activeTab === 'process' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Clock className="w-5 h-5 text-[#781D26]" />
                  <h3 className="font-cinzel text-lg sm:text-xl font-bold text-[#0B192C]">
                    Step-by-Step Editorial & Peer Review Workflow
                  </h3>
                </div>

                <div className="space-y-4">
                  {AUTHOR_GUIDELINES_DATA.submissionProcess.map((step, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#FAF8F5] border border-slate-200 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#0B192C] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-xs sm:text-sm text-[#0B192C]">
                          {step.step}
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Ethics & Plagiarism Tab */}
            {activeTab === 'ethics' && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Scale className="w-5 h-5 text-[#781D26]" />
                  <h3 className="font-cinzel text-lg sm:text-xl font-bold text-[#0B192C]">
                    Publication Ethics & Anti-Plagiarism Policy
                  </h3>
                </div>

                {/* Plagiarism Box */}
                <div className="p-4 sm:p-5 rounded-xl bg-red-50/70 border border-red-200 space-y-3">
                  <div className="flex items-center gap-2 text-[#781D26] font-bold text-xs sm:text-sm uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4" />
                    <span>UGC Statutory Anti-Plagiarism Regulations (2018)</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {AUTHOR_GUIDELINES_DATA.plagiarismPolicy}
                  </p>

                  {/* Mandatory UGC Plagiarism Penalties Table */}
                  <div className="overflow-x-auto pt-2">
                    <table className="w-full text-left text-xs border-collapse bg-white rounded-lg border border-red-200 overflow-hidden">
                      <thead>
                        <tr className="bg-red-100/70 text-slate-900 border-b border-red-200 font-bold">
                          <th className="p-2.5 sm:p-3 w-24">Classification</th>
                          <th className="p-2.5 sm:p-3 w-36">Similarity Index</th>
                          <th className="p-2.5 sm:p-3">Statutory Editorial Penalty / Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-[11px] sm:text-xs">
                        {AUTHOR_GUIDELINES_DATA.ugcPlagiarismLevels?.map((row, idx) => (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-red-50/30'}>
                            <td className="p-2.5 sm:p-3 font-bold text-[#781D26] whitespace-nowrap align-top">
                              {row.level}
                            </td>
                            <td className="p-2.5 sm:p-3 font-semibold text-slate-800 align-top">
                              {row.status}
                            </td>
                            <td className="p-2.5 sm:p-3 text-slate-700 align-top leading-relaxed">
                              {row.action}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Language & Translation Safeguards */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
                  <span className="font-bold uppercase tracking-wider text-[#781D26] block">
                    Statutory Language & Translation Safeguards
                  </span>
                  <p className="leading-relaxed">
                    All manuscripts in <em>{JOURNAL_INFO.name}</em> are peer-reviewed and published in English. When research discusses indigenous, regional, or historical source material containing non-English text (such as Marathi, Sanskrit, Persian, or Hindi), authors must provide verified English translations alongside the original vernacular extracts. Article titles, keywords, and abstracts must be rendered in English. In bilingual archival sections, titles must appear in both original script and English.
                  </p>
                </div>

                {/* Ethics Guidelines Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {AUTHOR_GUIDELINES_DATA.publicationEthics.map((eth, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#FAF8F5] border border-slate-200 space-y-1">
                      <div className="font-bold text-xs sm:text-sm text-[#0B192C]">
                        {eth.title}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {eth.desc}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950">
                  <span className="font-bold block mb-0.5">Author Fee Policy (No APC):</span>
                  {AUTHOR_GUIDELINES_DATA.feesPolicy}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onOpenSubmitModal}
                className="px-6 py-3 rounded-xl bg-[#781D26] hover:bg-[#5a141b] text-white font-semibold text-xs sm:text-sm inline-flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4 text-amber-300" />
                <span>Submit Manuscript Online</span>
              </button>

              <a
                href={`mailto:${JOURNAL_INFO.email}?subject=Manuscript%20Submission%20-%20Shivraj%20350`}
                className="px-5 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Mail className="w-4 h-4 text-slate-500" />
                <span>Email Editorial Desk</span>
              </a>
            </div>

          </div>

          {/* Right Sidebar: Publisher Coordinates & Desk Queries */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Publisher Block */}
            <div className="bg-[#0B192C] text-white rounded-2xl p-6 shadow-lg border border-white/10 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 block">
                Publisher Information
              </span>
              <h4 className="font-cinzel text-lg font-bold text-white">
                {JOURNAL_INFO.publisher}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {JOURNAL_INFO.address}
              </p>

              <div className="space-y-2 pt-2 text-xs border-t border-white/10 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Editorial Desk:</span>
                  <a href={`mailto:${JOURNAL_INFO.email}`} className="text-amber-300 hover:underline font-mono">
                    {JOURNAL_INFO.email}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Official Portal:</span>
                  <a href={`https://${JOURNAL_INFO.website}`} target="_blank" rel="noopener noreferrer" className="text-white hover:underline">
                    {JOURNAL_INFO.website}
                  </a>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ISSN Status:</span>
                  <span className="font-mono text-amber-300">{JOURNAL_INFO.issn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">APC / Fees:</span>
                  <span className="text-emerald-400 font-semibold">Zero APC</span>
                </div>
              </div>
            </div>

            {/* Quick Author Checklist */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-[#781D26] text-xs font-bold uppercase tracking-wider">
                <ListChecks className="w-4 h-4" />
                <span>Pre-Submission Checklist</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Manuscript is fully anonymized for double-blind review</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Separate Title Page with full author credentials & emails</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Abstract of 200–250 words and 4–6 keywords included</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>DOIs verified for all cited literature</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Similarity index checked under certified 10% threshold</span>
                </li>
              </ul>
            </div>

            {/* Help / Queries Box */}
            <div className="bg-[#FAF8F5] rounded-2xl p-6 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-slate-700 text-xs font-bold uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-[#781D26]" />
                <span>Editorial Queries</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                For questions regarding scope suitability, thematic special issues, or submission formatting, write directly to:
              </p>
              <div className="p-3 rounded-lg bg-white border border-slate-200 font-mono text-xs text-[#781D26] font-semibold select-all text-center">
                {JOURNAL_INFO.email}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
