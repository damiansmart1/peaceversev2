import DOMPurify from 'dompurify';

interface SafeHTMLProps {
  html: string;
  className?: string;
  allowedTags?: string[];
}

export default function SafeHTML({ html, className = '', allowedTags }: SafeHTMLProps) {
  const config = allowedTags
    ? { ALLOWED_TAGS: allowedTags }
    : {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
      };

  const sanitized = DOMPurify.sanitize(html, config);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
