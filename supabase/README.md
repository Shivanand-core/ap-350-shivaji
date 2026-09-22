# Supabase Backend Setup Guide — Shivraj 350 Journal

This guide details all configuration steps, credentials, database schemas, and storage rules required to connect **Shivraj 350: International Peer Reviewed Multidisciplinary Journal** (Shivaji College, University of Delhi) to a live Supabase project.

---

## 1. Environment Variables Needed

In your Google AI Studio project settings (or in `.env` for local development), declare the following two variables:

```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Where to find these in Supabase:
1. Log in to [https://supabase.com](https://supabase.com) and select or create your project.
2. Go to **Project Settings** (gear icon in the left sidebar) → **API**.
3. Under **Project URL**, copy the URL string.
4. Under **Project API keys**, copy the `anon` / `public` key.

---

## 2. Execute Database Schema Migration (SQL Editor)

In your Supabase dashboard:
1. Navigate to the **SQL Editor** tab (left sidebar).
2. Click **New query**.
3. Copy the entire contents of `supabase/schema.sql` (located in this repository) and paste it into the query window.
4. Click **Run**.

### What this creates:
- `public.profiles`: Stores academic roles (`superadmin`, `editor`, `reviewer`, `author`), designations, and departmental affiliations.
- `public.submissions`: Tracks manuscript submissions, revisions, similarity scores, referee evaluations, and audit events.
- `public.articles`: Manages published articles with full bibliographic metadata, DOI, volume/issue numbers, and pagination.
- `public.journal_settings`: Stores central journal particulars and ISSN settings.
- **Row Level Security (RLS) Policies**: Restricts unpublished manuscripts and confidential evaluations to authorized editors and assigned reviewers.
- **Automatic Profile Trigger**: Automatically provisions a profile whenever a new user registers in Supabase Auth.

---

## 3. Storage Bucket Configuration (Private Manuscript Storage)

In your Supabase dashboard:
1. Navigate to **SQL Editor**.
2. Click **New query**.
3. Copy and run `supabase/storage_setup.sql`.

### Storage Specifications:
- **Bucket ID**: `manuscripts`
- **Public**: `false` (Private storage; strictly blocks anonymous public browsing)
- **Allowed MIME types**: `['application/pdf']` (Blocks executable files, scripts, or non-PDFs)
- **Max File Size**: `26214400` bytes (25 Megabytes)
- **Access Protocol**: Time-limited signed URLs (valid for 2 hours) generated on-demand for authorized referee and editorial review.

---

## 4. Provision Initial Editorial & Admin Accounts

In your Supabase dashboard, go to **Authentication** → **Users** → **Add User** (or use Invite User):

### 1. Super Admin / Developer Account:
- **Email**: `work.shivanand@gmail.com`
- **Password**: *(Create a secure password, e.g., your designated production secret)*
- **Role assigned**: `superadmin` (automatically set by trigger for this email)

### 2. Chief Editor & Institutional Accounts:
- **Email**: `principal@shivaji.du.ac.in` / `skawasthi@shivaji.du.ac.in`
- **Password**: *(Assign institutional password)*
- **Role assigned**: `editor` (automatically recognized by trigger for `@shivaji.du.ac.in` domains)

### 3. Reviewer Accounts:
- Associate Editors and Referees (e.g. `ruchiradhingra@shivaji.du.ac.in`, `preetisharma@shivaji.du.ac.in`, `bcsatapathy@shivaji.du.ac.in`, `sumankharbanda@shivaji.du.ac.in`).

---

## 5. Verification Checklist

Once configured:
- [x] Visiting the application with valid environment variables switches storage from local browser state to Supabase Cloud Storage.
- [x] Submitting an article generates a private PDF stored in `manuscripts/submissions/{id}/...`.
- [x] Logging in via the Editorial Gateway validates credentials directly through Supabase Auth (`supabase.auth.signInWithPassword`).
- [x] Row Level Security prevents unassigned reviewers or anonymous visitors from reading private referee evaluations.
