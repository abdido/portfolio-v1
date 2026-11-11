import DOMPurify from 'dompurify';

const getPurifier = () => {
  if (typeof DOMPurify?.sanitize === 'function') return DOMPurify;
  if (typeof window !== 'undefined') {
    return DOMPurify(window);
  }
  return null;
};

/**
 * Converts markdown-style formatting and raw HTML into sanitized rich HTML.
 * Handles headings, paragraphs, lists, bold, italic, code, and quotes safely.
 */
export function renderRichContent(content) {
  if (!content) return '';

  let text = String(content);

  // 1. Convert Markdown Headings
  text = text.replace(/^####[ \t]+(.*$)/gim, '<h4>$1</h4>');
  text = text.replace(/^###[ \t]+(.*$)/gim, '<h3>$1</h3>');
  text = text.replace(/^##[ \t]+(.*$)/gim, '<h2>$1</h2>');
  text = text.replace(/^#[ \t]+(.*$)/gim, '<h1>$1</h1>');

  // 2. Convert Bold (**text** or __text__)
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // 3. Convert Italic (*text*)
  text = text.replace(/(?<!\*)\*(?!\*)([^*\n]+)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  // 4. Convert Inline Code (`code`)
  text = text.replace(/`([^`\n]+)`/g, '<code>$1</code>');

  // 5. Convert Blockquotes (> quote)
  text = text.replace(/^(?:>[ \t]*([^\n]+)(?:\n|$))+/gim, (match) => {
    const lines = match.split('\n')
      .map(l => l.replace(/^>[ \t]*/, '').trim())
      .filter(Boolean)
      .join('<br/>');
    return `<blockquote>${lines}</blockquote>`;
  });

  // 6. Convert Numbered Lists (1. item \n 2. item)
  text = text.replace(/(?:^|\n)(\d+\.[ \t]+[^\n]+(?:\n\d+\.[ \t]+[^\n]+)*)/gim, (match) => {
    const items = match.trim().split('\n').map(line => {
      const itemText = line.replace(/^\d+\.[ \t]+/, '').trim();
      return `<li>${itemText}</li>`;
    }).join('');
    return `\n<ol>${items}</ol>\n`;
  });

  // 7. Convert Bullet Lists (- item \n - item or * item)
  text = text.replace(/(?:^|\n)([-*][ \t]+[^\n]+(?:\n[-*][ \t]+[^\n]+)*)/gim, (match) => {
    const items = match.trim().split('\n').map(line => {
      const itemText = line.replace(/^[-*][ \t]+/, '').trim();
      return `<li>${itemText}</li>`;
    }).join('');
    return `\n<ul>${items}</ul>\n`;
  });

  // 8. Convert loose text blocks to <p> tags
  const blocks = text.split(/\n{2,}/);
  const formattedBlocks = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (/^<(h[1-6]|ul|ol|blockquote|pre|p|div|table|hr|section|article)/i.test(trimmed)) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
  });

  const finalHtml = formattedBlocks.filter(Boolean).join('\n');

  // Sanitize with DOMPurify
  const purifier = getPurifier();
  if (purifier && typeof purifier.sanitize === 'function') {
    return purifier.sanitize(finalHtml, {
      ADD_ATTR: ['target', 'rel'],
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'hr',
        'strong', 'b', 'em', 'i', 'u', 's', 'mark',
        'ul', 'ol', 'li',
        'blockquote', 'code', 'pre',
        'a', 'span', 'div',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'img'
      ]
    });
  }

  return finalHtml;
}
