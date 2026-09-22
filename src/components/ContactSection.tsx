import { useState, FormEvent } from 'react';
import { 
  MapPin, 
  Mail, 
  Globe, 
  FileText, 
  Send, 
  CheckCircle2, 
  Building2, 
  UserCheck, 
  Phone, 
  Smartphone,
  ExternalLink 
} from 'lucide-react';
import { JOURNAL_INFO } from '../data/journalData';

interface ContactSectionProps {
  isStandalonePage?: boolean;
}

export default function ContactSection({ isStandalonePage = false }: ContactSectionProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }, 600);
  };

  return (
    <section id="contact" className="scroll-mt-24 sm:scroll-mt-28">
      {/* Top Banner if Standalone Page */}
      {isStandalonePage && (
        <div className="relative bg-[#071322] text-white py-12 sm:py-16 overflow-hidden border-b border-slate-800">
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2.5">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
              Institutional Contact & Editorial Desk
            </h1>
            <div className="w-16 h-0.5 bg-[#C5A059] mx-auto" />
            <p className="text-xs sm:text-sm font-sans tracking-[0.25em] uppercase text-[#E0C58A] font-medium pt-1">
              OFFICIAL PUBLISHER & CHIEF EDITOR DETAILS
            </p>
          </div>
        </div>
      )}

      {/* Main Section Content */}
      <div className="py-12 sm:py-16 bg-[#FAF8F5] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#781D26]/10 text-[#781D26] text-xs font-bold uppercase tracking-wider mb-3">
              <Building2 className="w-3.5 h-3.5" />
              Statutory Communication Coordinates
            </div>
            <h2 className="font-cinzel text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B192C]">
              Publisher & Chief Editor Contact Details
            </h2>
            <div className="w-20 h-1 bg-[#781D26] mx-auto mt-3 rounded-full" />
            <p className="mt-3 text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed">
              Official institutional addresses and contact coordinates for <strong className="text-[#0B192C]">{JOURNAL_INFO.name}</strong> as required by ISSN National Centre India.
            </p>
          </div>

          {/* 1. SIDE-BY-SIDE PATTERN: Publisher Information & Chief-Editor Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-stretch">
            
            {/* Left Card: Publisher Information */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-300 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#781D26] block">
                      Publishing Body
                    </span>
                    <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#0B192C] mt-0.5">
                      Publisher Information
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-[#781D26]">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-3.5 text-xs sm:text-sm text-slate-700">
                  {/* Institutional Name */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Organization Name:</span>
                    <strong className="text-slate-900 font-serif text-base block mt-0.5">
                      {JOURNAL_INFO.publisher}
                    </strong>
                    <span className="text-[11px] text-emerald-800 font-medium inline-block bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-1">
                      Accredited NAAC Grade &quot;A&quot; • Constituent College of University of Delhi
                    </span>
                  </div>

                  {/* Address */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Complete Institutional Address:</span>
                    <div className="flex items-start gap-2 mt-0.5">
                      <MapPin className="w-4 h-4 text-[#781D26] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{JOURNAL_INFO.address}</span>
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Official Telephone / EPABX:</span>
                    <div className="flex items-center gap-2 mt-0.5 font-mono text-slate-900 font-semibold">
                      <Phone className="w-4 h-4 text-[#781D26] shrink-0" />
                      <span>{JOURNAL_INFO.phone}</span>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Institutional Email:</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Mail className="w-4 h-4 text-[#781D26] shrink-0" />
                      <a href="mailto:principal@shivaji.du.ac.in" className="text-[#781D26] hover:underline font-mono font-medium">
                        principal@shivaji.du.ac.in
                      </a>
                    </div>
                  </div>

                  {/* Website */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Official Portal:</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Globe className="w-4 h-4 text-[#781D26] shrink-0" />
                      <a 
                        href={`https://${JOURNAL_INFO.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-slate-900 hover:text-[#781D26] hover:underline inline-flex items-center gap-1 font-mono font-medium"
                      >
                        <span>https://{JOURNAL_INFO.website}</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                <strong>Stewardship Note:</strong> Shivaji College is a premier constituent institution of the University of Delhi. All academic serials are governed strictly under official college statutory oversight.
              </div>
            </div>

            {/* Right Card: Chief-Editor & Editorial Desk Details */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-300 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#781D26] block">
                      Editorial Leadership
                    </span>
                    <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-[#0B192C] mt-0.5">
                      Chief-Editor & Editorial Desk
                    </h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#0B192C] text-amber-300 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                </div>

                <div className="space-y-3.5 text-xs sm:text-sm text-slate-700">
                  {/* Name & Role */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Editor-in-Chief:</span>
                    <strong className="text-slate-900 font-serif text-base block mt-0.5">
                      Prof. S. K. Awasthi
                    </strong>
                    <span className="text-[11px] text-slate-600 block mt-0.5">
                      Professor, Department of Chemistry &amp; Convenor, Multidisciplinary Research Cell
                    </span>
                  </div>

                  {/* Affiliated Address */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Complete Affiliated Address:</span>
                    <div className="flex items-start gap-2 mt-0.5">
                      <MapPin className="w-4 h-4 text-[#781D26] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        Shivaji College, University of Delhi, Ring Road, Raja Garden, New Delhi - 110027, India
                      </span>
                    </div>
                  </div>

                  {/* Editorial Desk Email */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Journal Editorial Email:</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Mail className="w-4 h-4 text-[#781D26] shrink-0" />
                      <a href={`mailto:${JOURNAL_INFO.email}`} className="text-[#781D26] hover:underline font-mono font-semibold">
                        {JOURNAL_INFO.email}
                      </a>
                    </div>
                  </div>

                  {/* Mobile & Desk Contact */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Editorial Desk Telephone &amp; Mobile:</span>
                    <div className="flex items-center gap-2 mt-0.5 font-mono text-slate-900 font-semibold">
                      <Smartphone className="w-4 h-4 text-[#781D26] shrink-0" />
                      <span>Direct Mobile: {JOURNAL_INFO.mobileNumber}</span>
                    </div>
                  </div>

                  {/* Faculty Profile Link */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Official Institutional Profile:</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Globe className="w-4 h-4 text-[#781D26] shrink-0" />
                      <a 
                        href="https://www.shivajicollege.ac.in/faculty" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[#781D26] hover:underline font-mono text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <span>https://www.shivajicollege.ac.in/faculty</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-950">
                <strong>ISSN Communication Desk:</strong> Official editorial inquiries, ISSN documentation submissions, and author communications are monitored daily at <code className="font-mono font-bold text-[#781D26]">journal@shivaji.du.ac.in</code>.
              </div>
            </div>

          </div>

          {/* 2. Interactive Inquiry Form */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-4xl mx-auto">
            <h3 className="font-serif text-lg sm:text-2xl font-bold text-slate-900 mb-2 text-center">
              Send an Inquiry to the Editorial Desk
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 text-center mb-6">
              Have questions regarding manuscript submissions, indexing, or the upcoming publication cycle? Send us a direct message.
            </p>

            {submitted && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  Thank you. Your message has been routed to the Editorial Secretariat at {JOURNAL_INFO.email}.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Prof. / Dr. / Researcher"
                    className="w-full min-h-[42px] px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#781D26] focus:border-[#781D26]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Institutional Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="author@institution.edu"
                    className="w-full min-h-[42px] px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#781D26] focus:border-[#781D26]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Subject of Inquiry
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g., Manuscript Submission / Plagiarism Check / ISSN Query"
                  className="w-full min-h-[42px] px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#781D26] focus:border-[#781D26]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Message / Details *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Write your detailed inquiry here..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#781D26] focus:border-[#781D26] resize-y"
                />
              </div>

              <div className="text-center pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-[44px] py-2.5 px-8 rounded-full bg-[#781D26] hover:bg-[#8E222D] text-white font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md disabled:opacity-50"
                >
                  <span>{loading ? 'Transmitting...' : 'Transmit Message to Editorial Desk'}</span>
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
