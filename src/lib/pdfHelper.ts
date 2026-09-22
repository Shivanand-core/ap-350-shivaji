import { ManuscriptSubmission } from '../types';

/**
 * Creates an authentic, viewable PDF Blob for a manuscript submission
 * Produces a genuine PDF 1.4 document with title, metadata, abstract, and sections.
 */
export function generateAcademicPdfBlob(submission: Partial<ManuscriptSubmission>): Blob {
  const title = submission.title || 'Academic Manuscript';
  const author = submission.authors || 'Author';
  const institution = submission.institution || 'Shivaji College, University of Delhi';
  const trackingId = submission.trackingId || 'SJ350-2026-SUB';
  const discipline = submission.discipline || 'Multidisciplinary';
  const abstract = submission.abstract || 'Abstract of the manuscript.';
  const keywords = submission.keywords?.join(', ') || 'Academic Research, Peer Review';
  const version = submission.files?.[submission.files.length - 1]?.versionLabel || 'Version 1 — Original Submission';

  // Sanitize text for standard ASCII PDF stream
  const clean = (str: string) => str.replace(/[^\x20-\x7E\n]/g, ' ').replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

  const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 5 0 R /Resources << /Font << /F1 7 0 R /F2 8 0 R /F3 9 0 R >> >> >>
endobj
4 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 6 0 R /Resources << /Font << /F1 7 0 R /F2 8 0 R /F3 9 0 R >> >> >>
endobj
7 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
8 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
9 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman >>
endobj
5 0 obj
<< /Length 1200 >>
stream
BT
/F2 10 Tf
50 800 Td
(SHIVRAJ 350: INTERNATIONAL PEER REVIEWED MULTIDISCIPLINARY JOURNAL) Tj
0 -14 Td
/F1 8 Tf
(SHIVAJI COLLEGE, UNIVERSITY OF DELHI | OFFICIAL EDITORIAL REVIEW DRAFT) Tj
0 -25 Td
/F2 9 Tf
(CONFIDENTIAL MANUSCRIPT UNDER PEER REVIEW) Tj
0 -12 Td
/F1 8 Tf
(Tracking ID: ${clean(trackingId)} | Disciplinary Category: ${clean(discipline)} | ${clean(version)}) Tj
0 -30 Td
/F2 16 Tf
(${clean(title.substring(0, 70))}) Tj
0 -20 Td
(${clean(title.substring(70, 140))}) Tj
0 -30 Td
/F2 11 Tf
(Author(s): ${clean(author)}) Tj
0 -15 Td
/F1 9 Tf
(${clean(institution)}) Tj
0 -25 Td
/F2 11 Tf
(ABSTRACT) Tj
0 -15 Td
/F3 10 Tf
(${clean(abstract.substring(0, 95))}) Tj
0 -14 Td
(${clean(abstract.substring(95, 190))}) Tj
0 -14 Td
(${clean(abstract.substring(190, 285))}) Tj
0 -14 Td
(${clean(abstract.substring(285, 380))}) Tj
0 -14 Td
(${clean(abstract.substring(380, 475))}) Tj
0 -14 Td
(${clean(abstract.substring(475, 570))}) Tj
0 -25 Td
/F2 9 Tf
(KEYWORDS: ) Tj
/F1 9 Tf
(${clean(keywords)}) Tj
0 -35 Td
/F2 12 Tf
(1. INTRODUCTION & BACKGROUND) Tj
0 -16 Td
/F3 10 Tf
(The research addresses pressing interdisciplinary questions aligned with contemporary scholarly discourse.) Tj
0 -14 Td
(Methodological rigor, reproducibility, and ethical adherence form the core pillars of this inquiry.) Tj
0 -14 Td
(Initial data collection was completed following institutional ethics clearances and institutional protocols.) Tj
0 -14 Td
(Theoretical frameworks are synthesized from seminal literature in ${clean(discipline)}.) Tj
0 -25 Td
/F2 12 Tf
(2. METHODOLOGY & EXPERIMENTAL DESIGN) Tj
0 -16 Td
/F3 10 Tf
(A multi-tiered evaluative framework was established to empirically test hypotheses.) Tj
0 -14 Td
(Statistical validation confirms statistical significance at p < 0.01 with robust reproducibility indices.) Tj
0 -30 Td
/F1 8 Tf
(Page 1 of 2 | Official Editorial Copy | Confidential - For Authorized Reviewers Only) Tj
ET
endstream
endobj
6 0 obj
<< /Length 950 >>
stream
BT
/F2 10 Tf
50 800 Td
(SHIVRAJ 350: INTERNATIONAL PEER REVIEWED MULTIDISCIPLINARY JOURNAL) Tj
0 -14 Td
/F1 8 Tf
(Tracking ID: ${clean(trackingId)} - Page 2) Tj
0 -30 Td
/F2 12 Tf
(3. RESULTS & DISCUSSION) Tj
0 -16 Td
/F3 10 Tf
(Empirical outcomes exhibit substantial divergence from standard baseline control values.) Tj
0 -14 Td
(Detailed multi-variable regression analysis indicates strong positive correlation across primary indicators.) Tj
0 -14 Td
(Analytical sensitivity tests demonstrate structural stability under varied operational assumptions.) Tj
0 -25 Td
/F2 12 Tf
(4. CONCLUSION & SCHOLARLY CONTRIBUTIONS) Tj
0 -16 Td
/F3 10 Tf
(This study offers foundational insights that significantly bridge empirical investigation and applied policy.) Tj
0 -14 Td
(Future extensions will focus on longitudinal cross-validation across wider demographic spectra.) Tj
0 -30 Td
/F2 11 Tf
(REFERENCES (SELECTED)) Tj
0 -15 Td
/F1 8 Tf
(1. Shivaji College Academic Proceedings, University of Delhi, Vol. 1, 2026.) Tj
0 -12 Td
(2. Sharma, R. K. et al., Journal of Interdisciplinary Advanced Studies, 2025.) Tj
0 -12 Td
(3. National Research Council Guidelines on Academic Integrity & Peer Review Ethics, 2024.) Tj
0 -40 Td
/F1 8 Tf
(Page 2 of 2 | End of Submitted Manuscript File | Shivaji College, University of Delhi) Tj
ET
endstream
endobj
xref
0 10
0000000000 65535 f 
0000000010 00000 n 
0000000067 00000 n 
0000000133 00000 n 
0000000287 00000 n 
0000000660 00000 n 
0000001920 00000 n 
0000000441 00000 n 
0000000514 00000 n 
0000000590 00000 n 
trailer
<< /Size 10 /Root 1 0 R >>
startxref
2930
%%EOF`;

  return new Blob([pdfContent], { type: 'application/pdf' });
}

/**
 * Downloads a manuscript PDF securely to the user's computer
 */
export function downloadManuscriptPdf(blobOrUrl: Blob | string, fileName: string): void {
  const url = typeof blobOrUrl === 'string' ? blobOrUrl : URL.createObjectURL(blobOrUrl);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (typeof blobOrUrl !== 'string') {
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}
