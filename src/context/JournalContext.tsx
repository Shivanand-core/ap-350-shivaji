import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  JournalArticle, 
  EditorialMember, 
  JournalInfo, 
  ManuscriptSubmission, 
  ManuscriptFile, 
  AuditEvent, 
  SubmissionStatus, 
  AuthUser, 
  UserRole 
} from '../types';
import { 
  JOURNAL_INFO as DEFAULT_JOURNAL_INFO, 
  INAUGURAL_ARTICLES, 
  EDITORIAL_BOARD as DEFAULT_EDITORIAL_BOARD,
  ARCHIVE_DATA as DEFAULT_ARCHIVE_DATA 
} from '../data/journalData';
import { 
  uploadManuscriptFile, 
  isSupabaseConfigured, 
  signInWithSupabase, 
  signOutWithSupabase,
  fetchSubmissionsFromSupabase,
  saveSubmissionToSupabase,
  fetchArticlesFromSupabase,
  saveArticleToSupabase
} from '../lib/supabase';

export interface ReviewerAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  department: string;
  designation: string;
  isReviewingEnabled: boolean;
  assignedDisciplines: string[];
  dateAdded: string;
}

interface JournalContextType {
  // Master dummy content toggle (internal state for data management)
  isDummyContentEnabled: boolean;
  toggleDummyContent: (enabled: boolean) => void;
  startFromScratch: () => void;
  loadDummyAsEditable: () => void;
  resetAllToFactoryDefaults: () => void;

  // Global settings & Editorial mode
  globalReviewingEnabled: boolean;
  toggleGlobalReviewing: (enabled: boolean) => void;
  evaluationMode: 'evaluation_required' | 'direct_editorial';
  toggleEvaluationMode: () => void;
  journalInfo: JournalInfo;
  updateJournalInfo: (info: Partial<JournalInfo>) => void;

  // Articles
  allArticles: JournalArticle[];
  customArticles: JournalArticle[];
  addArticle: (article: Omit<JournalArticle, 'id'>) => JournalArticle;
  updateArticle: (id: string, article: Partial<JournalArticle>) => void;
  deleteArticle: (id: string) => void;

  // Editorial Board / Professors
  allProfessors: EditorialMember[];
  customProfessors: EditorialMember[];
  addProfessor: (prof: EditorialMember) => void;
  updateProfessor: (email: string, prof: Partial<EditorialMember>) => void;
  deleteProfessor: (email: string) => void;

  // Peer Reviewers / Teachers
  reviewers: ReviewerAccount[];
  addReviewer: (reviewer: Omit<ReviewerAccount, 'id' | 'dateAdded'>) => void;
  updateReviewer: (id: string, reviewer: Partial<ReviewerAccount>) => void;
  deleteReviewer: (id: string) => void;
  toggleReviewerPermission: (id: string, isEnabled: boolean) => void;

  // Submissions & Workflows
  submissions: ManuscriptSubmission[];
  addSubmission: (submission: Omit<ManuscriptSubmission, 'id' | 'trackingId' | 'submittedDate' | 'status' | 'files' | 'auditTrail'> & {
    initialFile?: File | Blob;
    fileName?: string;
    fileSize?: string;
    fileUrl?: string;
  }) => Promise<ManuscriptSubmission>;
  uploadRevision: (submissionId: string, file: File, uploaderName: string) => Promise<void>;
  assignReviewer: (submissionId: string, reviewerId: string, reviewerName: string, reviewerEmail: string) => void;
  submitEvaluation: (submissionId: string, recommendation: any, notes: string) => void;
  makeEditorialDecision: (submissionId: string, status: SubmissionStatus, notes?: string, similarityScore?: number) => void;
  publishSubmission: (submissionId: string, volume: string, issue: string, pages: string, doi: string) => JournalArticle | null;
  deleteSubmission: (id: string) => void;

  // Authentication & Session
  currentUser: AuthUser | null;
  loginUser: (email: string, pass: string) => Promise<{ success: boolean; user?: AuthUser; error?: string }>;
  logoutUser: () => void;

  // Backwards compatibility alias
  activeReviewer: ReviewerAccount | null;
}

const DEFAULT_REVIEWERS: ReviewerAccount[] = [
  {
    id: 'rev-01',
    name: 'Dr. Ruchira Dhingra',
    email: 'ruchiradhingra@shivaji.du.ac.in',
    password: 'Shivaji@350',
    department: 'Department of Chemistry',
    designation: 'Associate Professor & Associate Editor (Sciences)',
    isReviewingEnabled: true,
    assignedDisciplines: ['Sciences', 'Chemical Sciences'],
    dateAdded: '2026-01-10'
  },
  {
    id: 'rev-02',
    name: 'Dr. Preeti Sharma',
    email: 'preetisharma@shivaji.du.ac.in',
    password: 'Shivaji@350',
    department: 'Department of Economics',
    designation: 'Associate Professor & Associate Editor (Social Sciences)',
    isReviewingEnabled: true,
    assignedDisciplines: ['Social Sciences', 'Economics'],
    dateAdded: '2026-01-12'
  },
  {
    id: 'rev-03',
    name: 'Dr. Bishnu Charan Satapathy',
    email: 'bcsatapathy@shivaji.du.ac.in',
    password: 'Shivaji@350',
    department: 'Department of Political Science',
    designation: 'Associate Professor & Associate Editor (Humanities)',
    isReviewingEnabled: true,
    assignedDisciplines: ['Humanities', 'Political Science'],
    dateAdded: '2026-01-15'
  },
  {
    id: 'rev-04',
    name: 'Dr. Suman Kharbanda',
    email: 'sumankharbanda@shivaji.du.ac.in',
    password: 'Shivaji@350',
    department: 'Department of Commerce',
    designation: 'Associate Professor & Associate Editor (Professional Studies)',
    isReviewingEnabled: false,
    assignedDisciplines: ['Professional Studies', 'Commerce & Management'],
    dateAdded: '2026-01-18'
  }
];

const INITIAL_SUBMISSIONS: ManuscriptSubmission[] = [
  {
    id: 'sub-01',
    trackingId: 'SJ350-2026-0001',
    title: 'Biomimetic Nanomaterials for Clean Industrial Effluent Remediation: A Green Synthesis Approach',
    articleType: 'Original Research Paper',
    authors: 'Dr. Alok Verma',
    coAuthors: 'Priya Nambiar, Prof. R. K. Singhania',
    email: 'alok.verma@iitd.ac.in',
    institution: 'Department of Biochemical Engineering, Indian Institute of Technology Delhi',
    department: 'Biochemical Engineering',
    designation: 'Assistant Professor',
    orcid: '0000-0002-1823-4491',
    discipline: 'Sciences',
    abstract: 'This research develops green-synthesized zinc oxide nanoparticles derived from neem leaf extracts to catalytically degrade carcinogenic azo dyes in industrial wastewater. Spectrophotometric analysis demonstrates 94.2% dye mineralization within 120 minutes of solar exposure.',
    keywords: ['Green Nanotechnology', 'Effluent Remediation', 'Solar Photocatalysis', 'Environmental Biotechnology'],
    submittedDate: '2026-02-14',
    status: 'Pending Review',
    similarityScore: 6,
    files: [
      {
        version: 1,
        versionLabel: 'Version 1 — Original Submission',
        fileName: 'Verma_Nanomaterials_GreenSynthesis_2026.pdf',
        fileSize: '2.4 MB',
        uploadedAt: '2026-02-14 10:30 IST',
        uploadedBy: 'Author (Dr. Alok Verma)'
      }
    ],
    auditTrail: [
      {
        id: 'aud-101',
        timestamp: '2026-02-14 10:30 IST',
        action: 'Submitted',
        performedBy: 'Dr. Alok Verma',
        userRole: 'author',
        details: 'Initial manuscript registered with tracking ID SJ350-2026-0001'
      },
      {
        id: 'aud-102',
        timestamp: '2026-02-14 10:31 IST',
        action: 'File uploaded',
        performedBy: 'Dr. Alok Verma',
        userRole: 'author',
        details: 'Version 1 — Original Submission (Verma_Nanomaterials_GreenSynthesis_2026.pdf) stored securely'
      }
    ]
  },
  {
    id: 'sub-02',
    trackingId: 'SJ350-2026-0002',
    title: 'Fiscal Decentralization and Urban Governance: Case Study of Municipal Fiscal Health in Delhi NCR',
    articleType: 'Empirical Study',
    authors: 'Dr. Kavita Narang',
    coAuthors: 'Siddharth Rao',
    email: 'kavita.narang@jnu.ac.in',
    institution: 'School of Social Sciences, Jawaharlal Nehru University, New Delhi',
    department: 'Center for Economic Studies',
    designation: 'Associate Professor',
    orcid: '0000-0003-9122-3810',
    discipline: 'Social Sciences',
    abstract: 'An empirical examination of municipal bond issuances and property tax mobilization across the National Capital Region. The econometric panel indicates that digital tax administration reforms increased revenue collections by 27.4% while enhancing civic infrastructure capital expenditures.',
    keywords: ['Fiscal Federalism', 'Municipal Finance', 'Urban Governance', 'Public Economics'],
    submittedDate: '2026-02-18',
    status: 'Under Evaluation',
    assignedReviewerId: 'rev-02',
    assignedReviewerName: 'Dr. Preeti Sharma',
    assignedReviewerEmail: 'preetisharma@shivaji.du.ac.in',
    assignedDate: '2026-02-20',
    similarityScore: 8,
    files: [
      {
        version: 1,
        versionLabel: 'Version 1 — Original Submission',
        fileName: 'Narang_Municipal_Fiscal_Health_NCR.pdf',
        fileSize: '3.1 MB',
        uploadedAt: '2026-02-18 14:15 IST',
        uploadedBy: 'Author (Dr. Kavita Narang)'
      }
    ],
    auditTrail: [
      {
        id: 'aud-201',
        timestamp: '2026-02-18 14:15 IST',
        action: 'Submitted',
        performedBy: 'Dr. Kavita Narang',
        userRole: 'author',
        details: 'Initial submission registered with tracking ID SJ350-2026-0002'
      },
      {
        id: 'aud-202',
        timestamp: '2026-02-20 11:00 IST',
        action: 'Reviewer assigned',
        performedBy: 'Managing Editor',
        userRole: 'editor',
        details: 'Assigned to Dr. Preeti Sharma (preetisharma@shivaji.du.ac.in)'
      }
    ]
  },
  {
    id: 'sub-03',
    trackingId: 'SJ350-2026-0003',
    title: 'Epistemic Sovereignty and Archival Reinterpretations of Maratha Maritime Strategy under Chhatrapati Shivaji',
    articleType: 'Historical Research',
    authors: 'Dr. Sudhir Shinde',
    coAuthors: 'Meera Deshpande',
    email: 'sudhir.shinde@unipune.ac.in',
    institution: 'Department of History, Savitribai Phule Pune University',
    department: 'History',
    designation: 'Professor',
    orcid: '0000-0001-7729-1990',
    discipline: 'Humanities',
    abstract: 'Re-evaluating primary Modi-script naval documents from the 17th century, this paper documents the strategic naval architecture of the Maratha fleet under Chhatrapati Shivaji Maharaj. The paper argues for an indigenous Indian maritime doctrine that challenged European merchant monopolies along the Konkan littoral.',
    keywords: ['Shivaji Maharaj', 'Maratha Navy', 'Maritime History', 'Indian Historiography', 'Archival Research'],
    submittedDate: '2026-02-22',
    status: 'Passed',
    assignedReviewerId: 'rev-03',
    assignedReviewerName: 'Dr. Bishnu Charan Satapathy',
    assignedReviewerEmail: 'bcsatapathy@shivaji.du.ac.in',
    assignedDate: '2026-02-24',
    similarityScore: 4,
    decisionNotes: 'Rigorous historiographical contribution with exceptional archival primary sources. Recommended unconditionally for publication in upcoming Volume.',
    recommendation: 'Accept',
    reviewDate: '2026-03-01',
    files: [
      {
        version: 1,
        versionLabel: 'Version 1 — Original Submission',
        fileName: 'Shinde_Maratha_Maritime_Strategy.pdf',
        fileSize: '4.8 MB',
        uploadedAt: '2026-02-22 09:20 IST',
        uploadedBy: 'Author (Dr. Sudhir Shinde)'
      },
      {
        version: 2,
        versionLabel: 'Version 2 — First Revision',
        fileName: 'Shinde_Maratha_Maritime_Strategy_Rev2.pdf',
        fileSize: '5.0 MB',
        uploadedAt: '2026-02-28 16:40 IST',
        uploadedBy: 'Author (Dr. Sudhir Shinde)'
      }
    ],
    auditTrail: [
      {
        id: 'aud-301',
        timestamp: '2026-02-22 09:20 IST',
        action: 'Submitted',
        performedBy: 'Dr. Sudhir Shinde',
        userRole: 'author',
        details: 'Initial submission registered with tracking ID SJ350-2026-0003'
      },
      {
        id: 'aud-302',
        timestamp: '2026-02-24 10:00 IST',
        action: 'Reviewer assigned',
        performedBy: 'Managing Editor',
        userRole: 'editor',
        details: 'Assigned to Dr. Bishnu Charan Satapathy'
      },
      {
        id: 'aud-303',
        timestamp: '2026-02-28 16:40 IST',
        action: 'Revision uploaded',
        performedBy: 'Dr. Sudhir Shinde',
        userRole: 'author',
        details: 'Version 2 — First Revision uploaded incorporating preliminary feedback'
      },
      {
        id: 'aud-304',
        timestamp: '2026-03-01 15:30 IST',
        action: 'Evaluation submitted',
        performedBy: 'Dr. Bishnu Charan Satapathy',
        userRole: 'reviewer',
        details: 'Recommendation: Accept unconditionally'
      },
      {
        id: 'aud-305',
        timestamp: '2026-03-02 11:20 IST',
        action: 'Accepted',
        performedBy: 'Managing Editor',
        userRole: 'editor',
        details: 'Editorial decision: Passed for publication'
      }
    ]
  }
];

const JournalContext = createContext<JournalContextType | undefined>(undefined);

const STORAGE_KEYS = {
  DUMMY_ENABLED: 'shivraj350_dummy_content_enabled',
  CUSTOM_ARTICLES: 'shivraj350_custom_articles',
  CUSTOM_PROFESSORS: 'shivraj350_custom_professors',
  REVIEWERS: 'shivraj350_reviewers_accounts',
  SUBMISSIONS: 'shivraj350_manuscript_submissions_v2',
  GLOBAL_REVIEWING: 'shivraj350_global_reviewing_enabled',
  EVALUATION_MODE: 'shivraj350_evaluation_workflow_mode',
  JOURNAL_INFO: 'shivraj350_journal_info_overrides',
  CURRENT_USER: 'shivraj350_auth_user_session'
};

export const JournalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Internal Dummy Content State
  const [isDummyContentEnabled, setIsDummyContentEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DUMMY_ENABLED);
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  // 2. Global reviewing toggle
  const [globalReviewingEnabled, setGlobalReviewingEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.GLOBAL_REVIEWING);
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  // 3. Evaluation Workflow Mode: Mode A (Evaluation Required) vs Mode B (Direct Editorial)
  const [evaluationMode, setEvaluationMode] = useState<'evaluation_required' | 'direct_editorial'>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EVALUATION_MODE);
      return (stored as any) || 'evaluation_required';
    } catch {
      return 'evaluation_required';
    }
  });

  // 4. Custom articles
  const [customArticles, setCustomArticles] = useState<JournalArticle[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_ARTICLES);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // 5. Custom professors
  const [customProfessors, setCustomProfessors] = useState<EditorialMember[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_PROFESSORS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // 6. Reviewer accounts
  const [reviewers, setReviewers] = useState<ReviewerAccount[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REVIEWERS);
      return stored ? JSON.parse(stored) : DEFAULT_REVIEWERS;
    } catch {
      return DEFAULT_REVIEWERS;
    }
  });

  // 7. Submissions
  const [submissions, setSubmissions] = useState<ManuscriptSubmission[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      return stored ? JSON.parse(stored) : INITIAL_SUBMISSIONS;
    } catch {
      return INITIAL_SUBMISSIONS;
    }
  });

  // 8. Journal Info
  const [journalInfo, setJournalInfo] = useState<JournalInfo>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.JOURNAL_INFO);
      return stored ? { ...DEFAULT_JOURNAL_INFO, ...JSON.parse(stored) } : DEFAULT_JOURNAL_INFO;
    } catch {
      return DEFAULT_JOURNAL_INFO;
    }
  });

  // 9. Current Authenticated User Session
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DUMMY_ENABLED, JSON.stringify(isDummyContentEnabled));
    } catch (e) {
      console.error(e);
    }
  }, [isDummyContentEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GLOBAL_REVIEWING, JSON.stringify(globalReviewingEnabled));
    } catch (e) {
      console.error(e);
    }
  }, [globalReviewingEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EVALUATION_MODE, evaluationMode);
    } catch (e) {
      console.error(e);
    }
  }, [evaluationMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_ARTICLES, JSON.stringify(customArticles));
    } catch (e) {
      console.error(e);
    }
  }, [customArticles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_PROFESSORS, JSON.stringify(customProfessors));
    } catch (e) {
      console.error(e);
    }
  }, [customProfessors]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REVIEWERS, JSON.stringify(reviewers));
    } catch (e) {
      console.error(e);
    }
  }, [reviewers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    } catch (e) {
      console.error(e);
    }
  }, [submissions]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Synchronize remote data if Supabase is connected
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // Fetch remote submissions
    fetchSubmissionsFromSupabase().then((remoteSubs) => {
      if (remoteSubs && remoteSubs.length > 0) {
        setSubmissions((prev) => {
          const map = new Map(prev.map((s) => [s.id, s]));
          for (const s of remoteSubs) {
            map.set(s.id, s);
          }
          return Array.from(map.values());
        });
      }
    });

    // Fetch remote custom published articles
    fetchArticlesFromSupabase().then((remoteArticles) => {
      if (remoteArticles && remoteArticles.length > 0) {
        setCustomArticles((prev) => {
          const map = new Map(prev.map((a) => [a.id, a]));
          for (const a of remoteArticles) {
            map.set(a.id, a);
          }
          return Array.from(map.values());
        });
      }
    });
  }, []);

  // Derived collections
  const allArticles: JournalArticle[] = isDummyContentEnabled
    ? [...INAUGURAL_ARTICLES, ...customArticles]
    : customArticles;

  const allProfessors: EditorialMember[] = isDummyContentEnabled
    ? [...DEFAULT_EDITORIAL_BOARD, ...customProfessors]
    : customProfessors;

  // Master switches
  const toggleDummyContent = (enabled: boolean) => {
    setIsDummyContentEnabled(enabled);
  };

  const startFromScratch = () => {
    setIsDummyContentEnabled(false);
    setCustomArticles([]);
    setCustomProfessors([]);
  };

  const loadDummyAsEditable = () => {
    setIsDummyContentEnabled(false);
    setCustomArticles([...INAUGURAL_ARTICLES]);
    setCustomProfessors([...DEFAULT_EDITORIAL_BOARD]);
  };

  const resetAllToFactoryDefaults = () => {
    setIsDummyContentEnabled(true);
    setCustomArticles([]);
    setCustomProfessors([]);
    setReviewers(DEFAULT_REVIEWERS);
    setSubmissions(INITIAL_SUBMISSIONS);
    setJournalInfo(DEFAULT_JOURNAL_INFO);
    setGlobalReviewingEnabled(true);
    setEvaluationMode('evaluation_required');
  };

  const toggleGlobalReviewing = (enabled: boolean) => {
    setGlobalReviewingEnabled(enabled);
  };

  const toggleEvaluationMode = () => {
    setEvaluationMode((prev) => 
      prev === 'evaluation_required' ? 'direct_editorial' : 'evaluation_required'
    );
  };

  const updateJournalInfo = (info: Partial<JournalInfo>) => {
    setJournalInfo((prev) => ({ ...prev, ...info }));
  };

  // Articles
  const addArticle = (article: Omit<JournalArticle, 'id'>): JournalArticle => {
    const newArt: JournalArticle = {
      ...article,
      id: `art-custom-${Date.now()}`
    };
    setCustomArticles((prev) => [newArt, ...prev]);
    if (isSupabaseConfigured()) {
      saveArticleToSupabase(newArt).catch(console.warn);
    }
    return newArt;
  };

  const updateArticle = (id: string, updated: Partial<JournalArticle>) => {
    setCustomArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
    );
  };

  const deleteArticle = (id: string) => {
    setCustomArticles((prev) => prev.filter((a) => a.id !== id));
  };

  // Professors
  const addProfessor = (prof: EditorialMember) => {
    setCustomProfessors((prev) => [...prev, prof]);
  };

  const updateProfessor = (email: string, prof: Partial<EditorialMember>) => {
    setCustomProfessors((prev) =>
      prev.map((p) => (p.email === email ? { ...p, ...prof } : p))
    );
  };

  const deleteProfessor = (email: string) => {
    setCustomProfessors((prev) => prev.filter((p) => p.email !== email));
  };

  // Reviewers
  const addReviewer = (rev: Omit<ReviewerAccount, 'id' | 'dateAdded'>) => {
    const newRev: ReviewerAccount = {
      ...rev,
      id: `rev-${Date.now()}`,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    setReviewers((prev) => [...prev, newRev]);
  };

  const updateReviewer = (id: string, updated: Partial<ReviewerAccount>) => {
    setReviewers((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
    );
  };

  const deleteReviewer = (id: string) => {
    setReviewers((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleReviewerPermission = (id: string, isEnabled: boolean) => {
    setReviewers((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isReviewingEnabled: isEnabled } : r))
    );
  };

  // Submissions
  const addSubmission = async (
    data: Omit<ManuscriptSubmission, 'id' | 'trackingId' | 'submittedDate' | 'status' | 'files' | 'auditTrail'> & {
      initialFile?: File | Blob;
      fileName?: string;
      fileSize?: string;
      fileUrl?: string;
    }
  ): Promise<ManuscriptSubmission> => {
    const id = `sub-${Date.now()}`;
    const year = new Date().getFullYear();
    const trackingId = `SJ350-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const submittedDate = now.toISOString().split('T')[0];
    const timestampStr = `${submittedDate} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST`;

    let fileUrl = data.fileUrl;
    let fileSize = data.fileSize || '1.8 MB';
    const fileName = data.fileName || `${trackingId}_Manuscript.pdf`;

    if (data.initialFile) {
      try {
        const uploadResult = await uploadManuscriptFile(data.initialFile, id, 1, fileName);
        fileUrl = uploadResult.fileUrl;
        fileSize = uploadResult.sizeFormatted;
      } catch (err) {
        console.warn('File upload fallback:', err);
      }
    }

    const firstFile: ManuscriptFile = {
      version: 1,
      versionLabel: 'Version 1 — Original Submission',
      fileName,
      fileSize,
      uploadedAt: timestampStr,
      uploadedBy: `Author (${data.authors})`,
      fileUrl
    };

    const initialAudit: AuditEvent[] = [
      {
        id: `aud-${Date.now()}-1`,
        timestamp: timestampStr,
        action: 'Submitted',
        performedBy: data.authors,
        userRole: 'author',
        details: `Initial manuscript submitted by author with tracking ID ${trackingId}`
      },
      {
        id: `aud-${Date.now()}-2`,
        timestamp: timestampStr,
        action: 'File uploaded',
        performedBy: data.authors,
        userRole: 'author',
        details: `Version 1 — Original Submission (${fileName}) stored securely`
      }
    ];

    const newSubmission: ManuscriptSubmission = {
      ...data,
      id,
      trackingId,
      submittedDate,
      status: 'Pending Review',
      files: [firstFile],
      auditTrail: initialAudit
    };

    setSubmissions((prev) => [newSubmission, ...prev]);
    if (isSupabaseConfigured()) {
      saveSubmissionToSupabase(newSubmission).catch(console.warn);
    }
    return newSubmission;
  };

  const uploadRevision = async (submissionId: string, file: File, uploaderName: string) => {
    const sub = submissions.find((s) => s.id === submissionId);
    if (!sub) return;

    const nextVer = (sub.files?.length || 0) + 1;
    const now = new Date();
    const timestampStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST`;

    let fileUrl: string | undefined;
    let fileSize = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;

    try {
      const uploadRes = await uploadManuscriptFile(file, submissionId, nextVer, file.name);
      fileUrl = uploadRes.fileUrl;
      fileSize = uploadRes.sizeFormatted;
    } catch {
      fileUrl = URL.createObjectURL(file);
    }

    const newFile: ManuscriptFile = {
      version: nextVer,
      versionLabel: `Version ${nextVer} — Revision ${nextVer - 1}`,
      fileName: file.name,
      fileSize,
      uploadedAt: timestampStr,
      uploadedBy: uploaderName,
      fileUrl
    };

    const auditEntry: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: timestampStr,
      action: 'Revision uploaded',
      performedBy: uploaderName,
      userRole: currentUser?.role || 'author',
      details: `${newFile.versionLabel} (${file.name}) uploaded and preserved`
    };

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              files: [...(s.files || []), newFile],
              auditTrail: [auditEntry, ...(s.auditTrail || [])],
              status: 'Under Evaluation'
            }
          : s
      )
    );
  };

  const assignReviewer = (
    submissionId: string,
    reviewerId: string,
    reviewerName: string,
    reviewerEmail: string
  ) => {
    const now = new Date();
    const timestampStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST`;

    const auditEntry: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: timestampStr,
      action: 'Reviewer assigned',
      performedBy: currentUser?.name || 'Managing Editor',
      userRole: currentUser?.role || 'editor',
      details: `Assigned to referee ${reviewerName} (${reviewerEmail}) for confidential evaluation`
    };

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              assignedReviewerId: reviewerId,
              assignedReviewerName: reviewerName,
              assignedReviewerEmail: reviewerEmail,
              assignedDate: now.toISOString().split('T')[0],
              status: 'Under Evaluation',
              auditTrail: [auditEntry, ...(s.auditTrail || [])]
            }
          : s
      )
    );
  };

  const submitEvaluation = (
    submissionId: string,
    recommendation: any,
    notes: string
  ) => {
    const now = new Date();
    const timestampStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST`;

    const auditEntry: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: timestampStr,
      action: 'Evaluation submitted',
      performedBy: currentUser?.name || 'Assigned Reviewer',
      userRole: 'reviewer',
      details: `Recommendation: ${recommendation}`
    };

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              recommendation,
              evaluationNotes: notes,
              reviewDate: now.toISOString().split('T')[0],
              status: 'Evaluation Submitted',
              auditTrail: [auditEntry, ...(s.auditTrail || [])]
            }
          : s
      )
    );
  };

  const makeEditorialDecision = (
    submissionId: string,
    status: SubmissionStatus,
    notes?: string,
    similarityScore?: number
  ) => {
    const now = new Date();
    const timestampStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST`;

    const auditEntry: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: timestampStr,
      action: status === 'Passed' ? 'Accepted' : status === 'Rejected' ? 'Rejected' : 'Revision requested',
      performedBy: currentUser?.name || 'Managing Editor',
      userRole: currentUser?.role || 'editor',
      details: notes ? `Decision: ${status} — "${notes}"` : `Decision: ${status}`
    };

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              status,
              decisionNotes: notes,
              decisionDate: now.toISOString().split('T')[0],
              similarityScore: similarityScore ?? s.similarityScore,
              auditTrail: [auditEntry, ...(s.auditTrail || [])]
            }
          : s
      )
    );
  };

  const publishSubmission = (
    submissionId: string,
    volume: string,
    issue: string,
    pages: string,
    doi: string
  ): JournalArticle | null => {
    const sub = submissions.find((s) => s.id === submissionId);
    if (!sub) return null;

    const now = new Date();
    const timestampStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} IST`;

    // 1. Promote to published article in repository
    const publishedArticle: JournalArticle = {
      id: `art-pub-${Date.now()}`,
      articleNumber: `ARTICLE ${String(allArticles.length + 1).padStart(2, '0')}`,
      slug: sub.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      title: sub.title,
      authors: [sub.authors, ...(sub.coAuthors ? sub.coAuthors.split(',').map((c) => c.trim()) : [])],
      affiliations: sub.institution,
      discipline: sub.discipline,
      articleType: sub.articleType || 'Original Research Paper',
      abstract: sub.abstract,
      keywords: sub.keywords,
      volume,
      issue,
      monthYear: 'January–June 2026',
      pages,
      doi,
      publicationDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      references: [
        'National Research Council Protocols on Academic Ethics, 2024.',
        'Shivaji College Academic Proceedings, University of Delhi, Vol. 1, 2026.'
      ]
    };

    setCustomArticles((prev) => [publishedArticle, ...prev]);

    // 2. Mark submission as published
    const auditEntry: AuditEvent = {
      id: `aud-${Date.now()}`,
      timestamp: timestampStr,
      action: 'Published',
      performedBy: currentUser?.name || 'Managing Editor',
      userRole: currentUser?.role || 'editor',
      details: `Published in ${volume}, ${issue}, Pages ${pages}, DOI: ${doi}`
    };

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              status: 'Published',
              auditTrail: [auditEntry, ...(s.auditTrail || [])]
            }
          : s
      )
    );

    return publishedArticle;
  };

  const deleteSubmission = (id: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
  };

  // Authentication & Session
  const loginUser = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
    const cleanEmail = email.toLowerCase().trim();
    const cleanPass = pass.trim();

    // 0. Primary: Verify with Supabase Auth when configured
    if (isSupabaseConfigured()) {
      const supaResult = await signInWithSupabase(cleanEmail, cleanPass);
      if (supaResult.success && supaResult.user) {
        setCurrentUser(supaResult.user);
        return { success: true, user: supaResult.user };
      }
    }

    // 1. Developer Admin account verification (work.shivanand@gmail.com / shivanand@350)
    if (
      cleanEmail === 'work.shivanand@gmail.com' ||
      cleanEmail === 'try.shivanand@gmail.com' ||
      cleanEmail === 'dev@shivaji.du.ac.in' ||
      cleanEmail === 'admin@shivaji.du.ac.in'
    ) {
      if (cleanPass === 'shivanand@350' || cleanPass === 'admin@shivaji350' || cleanPass === 'shivraj@2026') {
        const user: AuthUser = {
          id: 'usr-dev-shivanand',
          name: 'Shivanand',
          email: cleanEmail,
          role: 'superadmin',
          designation: 'Lead System Developer & Super Administrator',
          department: 'System Architecture & Web Operations',
          institution: 'Shivaji College, University of Delhi',
          isReviewingEnabled: true
        };
        setCurrentUser(user);
        return { success: true, user };
      } else {
        return { success: false, error: 'Incorrect developer password. Please verify your credentials.' };
      }
    }

    // 2. Editor & Editorial Member account verification (password: Shivaji@350)
    // Institutional email of the member
    const isEditorPassword = cleanPass === 'Shivaji@350' || cleanPass.toLowerCase() === 'shivaji@350';

    // A) Check Editorial Board (allProfessors)
    const matchingProf = allProfessors.find(
      (p) => p.email.toLowerCase().trim() === cleanEmail
    );

    if (matchingProf) {
      if (isEditorPassword) {
        const user: AuthUser = {
          id: `usr-prof-${matchingProf.email.replace(/[^a-zA-Z0-9]/g, '_')}`,
          name: matchingProf.name,
          email: matchingProf.email,
          role: 'editor',
          designation: `${matchingProf.designation} (${matchingProf.role})`,
          department: matchingProf.department,
          institution: matchingProf.institution || 'Shivaji College, University of Delhi',
          isReviewingEnabled: true
        };
        setCurrentUser(user);
        return { success: true, user };
      } else {
        return { success: false, error: 'Incorrect institutional password. Password must be Shivaji@350.' };
      }
    }

    // B) Check Registered Reviewers
    const matchingReviewer = reviewers.find(
      (r) => r.email.toLowerCase().trim() === cleanEmail
    );

    if (matchingReviewer) {
      if (isEditorPassword || matchingReviewer.password === cleanPass) {
        const user: AuthUser = {
          id: matchingReviewer.id,
          name: matchingReviewer.name,
          email: matchingReviewer.email,
          role: 'reviewer',
          designation: matchingReviewer.designation,
          department: matchingReviewer.department,
          institution: 'Shivaji College, University of Delhi',
          assignedDisciplines: matchingReviewer.assignedDisciplines,
          isReviewingEnabled: matchingReviewer.isReviewingEnabled
        };
        setCurrentUser(user);
        return { success: true, user };
      } else {
        return { success: false, error: 'Incorrect password for reviewer account.' };
      }
    }

    // C) Check generic Shivaji College institutional email domain
    if (
      cleanEmail.endsWith('@shivaji.du.ac.in') ||
      cleanEmail.endsWith('.du.ac.in') ||
      cleanEmail === 'editor@shivaji.du.ac.in' ||
      cleanEmail === 'journal@shivaji.du.ac.in' ||
      cleanEmail === 'principal@shivaji.du.ac.in'
    ) {
      if (isEditorPassword) {
        const namePart = cleanEmail.split('@')[0].replace(/[._]/g, ' ');
        const capitalizedName = namePart
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        const user: AuthUser = {
          id: `usr-inst-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
          name: capitalizedName ? `Dr. ${capitalizedName}` : 'Editorial Board Member',
          email: cleanEmail,
          role: 'editor',
          designation: 'Editorial Member',
          department: 'Academic Faculty',
          institution: 'Shivaji College, University of Delhi',
          isReviewingEnabled: true
        };
        setCurrentUser(user);
        return { success: true, user };
      } else {
        return { success: false, error: 'Incorrect institutional password.' };
      }
    }

    return { 
      success: false, 
      error: 'Invalid email address or credentials. Please use your official institutional email or developer account.' 
    };
  };

  const logoutUser = () => {
    signOutWithSupabase();
    setCurrentUser(null);
  };

  const activeReviewer = currentUser?.role === 'reviewer'
    ? reviewers.find((r) => r.id === currentUser.id) || null
    : null;

  return (
    <JournalContext.Provider
      value={{
        isDummyContentEnabled,
        toggleDummyContent,
        startFromScratch,
        loadDummyAsEditable,
        resetAllToFactoryDefaults,

        globalReviewingEnabled,
        toggleGlobalReviewing,
        evaluationMode,
        toggleEvaluationMode,
        journalInfo,
        updateJournalInfo,

        allArticles,
        customArticles,
        addArticle,
        updateArticle,
        deleteArticle,

        allProfessors,
        customProfessors,
        addProfessor,
        updateProfessor,
        deleteProfessor,

        reviewers,
        addReviewer,
        updateReviewer,
        deleteReviewer,
        toggleReviewerPermission,

        submissions,
        addSubmission,
        uploadRevision,
        assignReviewer,
        submitEvaluation,
        makeEditorialDecision,
        publishSubmission,
        deleteSubmission,

        currentUser,
        loginUser,
        logoutUser,

        activeReviewer
      }}
    >
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
};
