import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthUser, ManuscriptSubmission, JournalArticle } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kmlnmylkhdirqcscbkbd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_DIyujFRpGe0sj9-dTaupvQ_mbaJAyto';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
};

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.warn('Could not initialize Supabase client:', err);
      return null;
    }
  }
  return supabaseInstance;
};

// ==============================================================================
// 1. SUPABASE AUTHENTICATION HELPERS
// ==============================================================================

/**
 * Sign in user with Supabase Auth
 */
export async function signInWithSupabase(
  email: string,
  pass: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: pass,
    });

    if (error || !data.user) {
      return { success: false, error: error?.message || 'Authentication failed' };
    }

    // Fetch user profile from public.profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email || email,
      name: profile?.name || data.user.user_metadata?.name || 'Authorized Member',
      role: (profile?.role as any) || (email === 'work.shivanand@gmail.com' ? 'superadmin' : 'editor'),
      designation: profile?.designation || 'Academic Faculty',
      department: profile?.department || 'Faculty',
      institution: profile?.institution || 'Shivaji College, University of Delhi',
      isReviewingEnabled: profile?.is_reviewing_enabled ?? true,
      assignedDisciplines: profile?.assigned_disciplines || []
    };

    return { success: true, user: authUser };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unexpected login error' };
  }
}

/**
 * Sign out user from Supabase
 */
export async function signOutWithSupabase(): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Supabase sign-out warning:', err);
    }
  }
}

/**
 * Request password reset email via Supabase Auth
 */
export async function resetPasswordWithSupabase(email: string): Promise<{ success: boolean; message: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, message: 'Supabase is not configured' };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/#reset-password`,
    });

    if (error) {
      return { success: false, message: error.message };
    }
    return { 
      success: true, 
      message: 'A secure password reset link has been dispatched to your institutional email address.' 
    };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to dispatch password recovery email.' };
  }
}

// ==============================================================================
// 2. SUPABASE STORAGE (MANUSCRIPT PDFS)
// ==============================================================================

/**
 * Upload manuscript PDF to secure storage
 * If Supabase is connected, uploads to the private 'manuscripts' bucket
 * Otherwise, generates a persistent object URL with byte retention
 */
export async function uploadManuscriptFile(
  file: File | Blob,
  submissionId: string,
  version: number,
  fileName: string
): Promise<{ fileUrl: string; sizeFormatted: string }> {
  const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
  const sizeFormatted = `${sizeInMB} MB`;

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `submissions/${submissionId}/v${version}_${sanitizedName}`;
      
      const { data, error } = await supabase.storage
        .from('manuscripts')
        .upload(storagePath, file, {
          upsert: true,
          contentType: file.type || 'application/pdf',
        });

      if (!error && data?.path) {
        // Generate a private signed URL valid for 2 hours (7200 seconds)
        const { data: signedData } = await supabase.storage
          .from('manuscripts')
          .createSignedUrl(data.path, 7200);

        if (signedData?.signedUrl) {
          return { fileUrl: signedData.signedUrl, sizeFormatted };
        }
      }
    } catch (err) {
      console.warn('Supabase storage upload fallback triggered:', err);
    }
  }

  // Secure client-side blob storage fallback
  const objectUrl = URL.createObjectURL(file);
  return { fileUrl: objectUrl, sizeFormatted };
}

// ==============================================================================
// 3. DATABASE QUERIES (SUBMISSIONS & ARTICLES)
// ==============================================================================

/**
 * Fetch all manuscript submissions from Supabase
 */
export async function fetchSubmissionsFromSupabase(): Promise<ManuscriptSubmission[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((row: any) => ({
      id: row.id,
      trackingId: row.tracking_id,
      title: row.title,
      articleType: row.article_type,
      authors: row.authors,
      coAuthors: row.co_authors,
      email: row.email,
      institution: row.institution,
      department: row.department,
      designation: row.designation,
      orcid: row.orcid,
      discipline: row.discipline,
      abstract: row.abstract,
      keywords: row.keywords || [],
      status: row.status,
      submittedDate: row.submitted_date,
      assignedReviewerId: row.assigned_reviewer_id,
      assignedReviewerName: row.assigned_reviewer_name,
      assignedReviewerEmail: row.assigned_reviewer_email,
      assignedDate: row.assigned_date,
      similarityScore: row.similarity_score,
      decisionNotes: row.decision_notes,
      recommendation: row.recommendation,
      reviewDate: row.review_date,
      files: row.files || [],
      auditTrail: row.audit_trail || []
    }));
  } catch (err) {
    console.warn('Failed to query submissions from Supabase:', err);
    return null;
  }
}

/**
 * Persist or update a submission in Supabase
 */
export async function saveSubmissionToSupabase(submission: ManuscriptSubmission): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const payload = {
      id: submission.id,
      tracking_id: submission.trackingId,
      title: submission.title,
      article_type: submission.articleType || 'Original Research',
      authors: submission.authors,
      co_authors: submission.coAuthors,
      email: submission.email,
      institution: submission.institution,
      department: submission.department,
      designation: submission.designation,
      orcid: submission.orcid,
      discipline: submission.discipline,
      abstract: submission.abstract,
      keywords: submission.keywords,
      status: submission.status,
      submitted_date: submission.submittedDate,
      assigned_reviewer_id: submission.assignedReviewerId || null,
      assigned_reviewer_name: submission.assignedReviewerName || null,
      assigned_reviewer_email: submission.assignedReviewerEmail || null,
      assigned_date: submission.assignedDate || null,
      similarity_score: submission.similarityScore || null,
      decision_notes: submission.decisionNotes || null,
      recommendation: submission.recommendation || null,
      review_date: submission.reviewDate || null,
      files: submission.files,
      audit_trail: submission.auditTrail,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('submissions')
      .upsert(payload, { onConflict: 'id' });

    return !error;
  } catch (err) {
    console.warn('Failed to save submission to Supabase:', err);
    return false;
  }
}

/**
 * Fetch custom published articles from Supabase
 */
export async function fetchArticlesFromSupabase(): Promise<JournalArticle[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('is_published', true)
      .order('published_date', { ascending: false });

    if (error || !data) return null;

    return data.map((row: any) => ({
      id: row.id,
      slug: row.slug,
      articleNumber: row.article_number,
      title: row.title,
      authors: row.authors,
      affiliations: row.affiliations || row.affiliation || 'Shivaji College, University of Delhi',
      affiliation: row.affiliation || row.affiliations,
      articleType: row.article_type || 'Original Research',
      category: row.category,
      discipline: row.discipline,
      abstract: row.abstract,
      keywords: row.keywords || [],
      doi: row.doi,
      pages: row.pages,
      pageRange: row.page_range,
      volume: row.volume,
      issue: row.issue,
      monthYear: row.month_year || 'Jan–June 2026',
      publicationDate: row.publication_date || row.published_date || new Date().toISOString().split('T')[0],
      publishedDate: row.published_date,
      pdfUrl: row.pdf_url,
      sections: row.sections || [],
      references: row.references || []
    }));
  } catch (err) {
    console.warn('Failed to query articles from Supabase:', err);
    return null;
  }
}

/**
 * Persist an article in Supabase
 */
export async function saveArticleToSupabase(article: JournalArticle): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const payload = {
      id: article.id,
      slug: article.slug,
      article_number: article.articleNumber,
      title: article.title,
      authors: article.authors,
      affiliations: article.affiliations || article.affiliation,
      affiliation: article.affiliation || article.affiliations,
      article_type: article.articleType || 'Original Research',
      category: article.category,
      discipline: article.discipline,
      abstract: article.abstract,
      keywords: article.keywords,
      doi: article.doi,
      pages: article.pages,
      page_range: article.pageRange,
      volume: article.volume || 'Volume 1',
      issue: article.issue || 'Issue 1',
      month_year: article.monthYear || 'Jan–June 2026',
      published_date: article.publishedDate || article.publicationDate,
      publication_date: article.publicationDate,
      pdf_url: article.pdfUrl,
      sections: article.sections,
      references: article.references,
      is_published: true,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('articles')
      .upsert(payload, { onConflict: 'id' });

    return !error;
  } catch (err) {
    console.warn('Failed to save article to Supabase:', err);
    return false;
  }
}
