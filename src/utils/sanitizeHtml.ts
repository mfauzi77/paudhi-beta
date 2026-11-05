import DOMPurify from 'dompurify';

// Sanitize immediately before rendering, including content saved before this fix.
export const sanitizeHtml = (html: string | null | undefined): string =>
  DOMPurify.sanitize(html ?? '', {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select'],
    FORBID_ATTR: ['style'],
  });
