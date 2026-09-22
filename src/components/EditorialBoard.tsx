import { JOURNAL_INFO } from '../data/journalData';
import { useJournal } from '../context/JournalContext';
import { 
  Award, 
  UserCheck, 
  GraduationCap, 
  Building, 
  Mail, 
  ExternalLink, 
  MapPin, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Users
} from 'lucide-react';

export default function EditorialBoard() {
  const { allProfessors, isDummyContentEnabled } = useJournal();

  return (
    <section id="editorial-board" className="py-16 sm:py-24 bg-white border-b border-slate-200 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#781D26]/10 text-[#781D26] text-xs font-bold uppercase tracking-wider mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            Scholarly Governance & Academic Stewardship
          </div>
          <h2 className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B192C]">
            Editorial Board & Academic Council
          </h2>
          <div className="w-20 h-1 bg-[#781D26] mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed">
            Distinguished senior faculty members of Shivaji College, University of Delhi, providing statutory governance, peer-review oversight, and academic stewardship for{' '}
            <strong className="text-[#0B192C]">{JOURNAL_INFO.name}</strong>.
          </p>
        </div>

        {/* ISSN India Compliance Callout Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-300 text-amber-950 flex flex-col sm:flex-row items-start gap-3.5">
          <ShieldCheck className="w-5 h-5 text-[#781D26] shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm space-y-1">
            <strong className="text-[#781D26] block font-serif text-sm sm:text-base">
              ISSN National Centre India Governance Standards
            </strong>
            <p className="text-slate-700 leading-relaxed text-xs">
              All listed members are senior permanent faculty members (Professors and Associate Professors). In accordance with ISSN guidelines, each profile displays their full name, formal designation, complete affiliated institutional postal address, official institutional email ID (<code className="font-mono text-slate-900 font-bold">@shivaji.du.ac.in</code>), and verified institutional webpage link hosted on the college domain.
            </p>
          </div>
        </div>

        {/* Board Members Grid */}
        {allProfessors.length === 0 ? (
          <div className="text-center py-12 p-8 bg-stone-50 rounded-2xl border border-stone-200 max-w-lg mx-auto">
            <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h4 className="font-cinzel text-lg font-bold text-slate-800">
              No Board Members Configured
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Dummy content is turned off. Use the Developer Portal to add newly appointed faculty members and editorial board professors.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allProfessors.map((member, index) => {
              const isLeadership = index < 2;
              return (
                <div
                  key={`${member.name}-${member.email}`}
                  id={`editorial-member-${index + 1}`}
                  className={`rounded-2xl p-6 transition-all border flex flex-col justify-between ${
                    isLeadership
                      ? 'bg-gradient-to-br from-amber-50/50 via-white to-slate-50 border-amber-300 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs hover:shadow-md'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Badge & Role */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="space-y-1">
                        <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#781D26]/10 text-[#781D26]">
                          {member.role}
                        </span>
                        <h3 className="font-cinzel text-base sm:text-lg font-bold text-[#0B192C]">
                          {member.name}
                        </h3>
                      </div>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isLeadership ? 'bg-[#781D26] text-amber-300 shadow-xs' : 'bg-[#0B192C]/5 text-[#0B192C]'
                      }`}>
                        {isLeadership ? <Award className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                      </div>
                    </div>

                  {/* Academic Rank & Department */}
                  <div className="space-y-1 text-xs">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{member.designation}</span>
                    </div>
                    <div className="text-slate-600 pl-5">
                      {member.department}
                    </div>
                  </div>

                  {/* Institutional Affiliation & Complete Address */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-700">
                    <div className="flex items-start gap-2">
                      <Building className="w-3.5 h-3.5 text-[#781D26] shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-900">{member.institution}</span>
                    </div>
                    <div className="flex items-start gap-2 text-[11px] text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{member.institutionalAddress}</span>
                    </div>
                  </div>

                  {/* Institutional Email (Mandatory: No personal gmail/yahoo) */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Institutional Email ID:</span>
                    <a
                      href={`mailto:${member.email}`}
                      className="inline-flex items-center gap-1.5 text-slate-800 hover:text-[#781D26] font-mono text-xs font-semibold transition-colors"
                      title={`Email ${member.name} at verified institutional address`}
                    >
                      <Mail className="w-3.5 h-3.5 text-[#781D26] shrink-0" />
                      <span>{member.email}</span>
                    </a>
                  </div>
                </div>

                {/* Footer: Official Institutional Faculty Profile Link */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col gap-1.5 text-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Official Institutional Profile:</span>
                  <a
                    href={member.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#781D26] hover:underline font-mono break-all"
                    title={`View official university faculty profile for ${member.name}`}
                  >
                    <span className="truncate">{member.profileUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

        {/* Editorial Independence & Confidential Verification Protocol */}
        <div className="bg-[#FAF8F5] rounded-2xl p-6 sm:p-8 border border-slate-200 max-w-4xl mx-auto space-y-3 text-left">
          <div className="flex items-center gap-2 text-[#781D26] font-bold text-xs sm:text-sm uppercase tracking-wider">
            <AlertCircle className="w-4 h-4" />
            <span>ISSN Verification &amp; Peer Review Protocol</span>
          </div>
          <h4 className="font-cinzel text-base sm:text-lg font-bold text-[#0B192C]">
            Statutory Editorial Verification Process
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            In accordance with standard ISSN National Centre protocols, the assigned scrutiny officers conduct independent email verification with selected Editorial Board members directly via their institutional email IDs (<code className="font-mono text-slate-800">@shivaji.du.ac.in</code>). Board members have formally consented to editorial stewardship and respond to verification inquiries within the statutory 3-day turnaround.
          </p>
        </div>

      </div>
    </section>
  );
}
