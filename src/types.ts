export interface ArticleSection {
  heading: string;
  content: string;
}

export interface JournalArticle {
  id: string;
  articleNumber: string;
  title: string;
  slug: string;
  authors: string[];
  affiliations: string;
  affiliation?: string; // alias for backwards compatibility
  discipline: string;
  category?: 'Sciences' | 'Social Sciences' | 'Humanities' | 'Professional Studies' | string;
  articleType: string;
  abstract: string;
  keywords: string[];
  volume: string;
  issue: string;
  monthYear: string;
  pages: string;
  pageRange?: string;
  doi: string;
  publicationDate: string;
  publishedDate?: string;
  pdfUrl?: string;
  htmlContent?: string;
  fullText?: string;
  sections?: ArticleSection[];
  references: string[];
}

export interface EditorialMember {
  name: string;
  role: string;
  designation: string;
  department: string;
  institution: string;
  institutionalAddress: string;
  email: string;
  profileUrl: string;
  image?: string;
}

export interface IssueMetadata {
  title: string;
  volume: string;
  issue: string;
  period: string;
  year: number;
  issn: string;
  totalArticles: number;
  editorNote: string;
}

export interface JournalInfo {
  name: string;
  shortName?: string;
  issn: string;
  publisher: string;
  address: string;
  frequency: string;
  startingYear: number;
  subject: string;
  language: string;
  publicationFormat: string;
  email: string;
  phone: string;
  mobileNumber?: string;
  website: string;
  canonicalUrl?: string;
  verbatimScope: string;
  aimsAndScope: string;
  currentIssueString: string;
  peerReviewType: string;
  indexingStatus: string;
  impactFactorStatus: string;
  publicationFee: string;
}

export interface ArchiveIssue {
  volume: string;
  volumeNumber: number;
  issue: string;
  issueNumber: number;
  period: string;
  year: number;
  date: string;
  articleCount: number;
  articles: JournalArticle[];
}

export interface ArchiveYear {
  year: number;
  issues: ArchiveIssue[];
}

export type UserRole = 'superadmin' | 'editor' | 'reviewer' | 'author';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation?: string;
  department?: string;
  institution?: string;
  assignedDisciplines?: string[];
  isReviewingEnabled?: boolean;
}

export interface ManuscriptFile {
  version: number;
  versionLabel: string; // e.g. "Version 1 — Original Submission"
  fileName: string;
  fileSize: string; // e.g. "2.4 MB"
  uploadedAt: string;
  uploadedBy: string; // e.g. "Author (Dr. Priya Verma)" or "Editor"
  fileUrl?: string; // Blob URL, Data URL, or Supabase Storage URL
  mimeType?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  userRole: UserRole;
  details?: string;
}

export type SubmissionStatus = 
  | 'Pending Review' 
  | 'Under Screening'
  | 'Under Evaluation' 
  | 'Evaluation Submitted'
  | 'Passed' 
  | 'Rejected' 
  | 'Bypassed' 
  | 'Revision Requested'
  | 'Published';

export interface ManuscriptSubmission {
  id: string;
  trackingId: string;
  title: string;
  articleType: string;
  discipline: string;
  authors: string; // Corresponding author
  coAuthors?: string;
  email: string;
  institution: string;
  department?: string;
  designation?: string;
  orcid?: string;
  abstract: string;
  keywords: string[];
  submittedDate: string;
  status: SubmissionStatus;
  
  // Manuscript files with full version history
  files: ManuscriptFile[];
  
  // Reviewer assignment
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  assignedReviewerEmail?: string;
  assignedDate?: string;
  
  // Evaluation & decisions
  similarityScore?: number;
  recommendation?: 'Accept' | 'Accept with Minor Revisions' | 'Major Revisions' | 'Reject' | 'Bypass';
  evaluationNotes?: string;
  reviewDate?: string;
  internalRemarks?: string;
  decisionNotes?: string;
  decisionDate?: string;

  // Complete audit trail
  auditTrail: AuditEvent[];

  // Backwards compatibility aliases
  fileName?: string;
  fileUrl?: string;
  manuscriptText?: string;
}
