import DOMPurify from 'dompurify'

const ARTICLE_TAGS = [
  'p', 'br', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li',
  'blockquote', 'a', 'img', 'figure', 'figcaption', 'hr', 'table', 'thead', 'tbody',
  'tr', 'th', 'td', 'div', 'span',
]

const ARTICLE_ATTRIBUTES = ['href', 'src', 'alt', 'title', 'width', 'height']

export function sanitizeArticleHtml(html = '') {
  return DOMPurify.sanitize(String(html), {
    ALLOWED_TAGS: ARTICLE_TAGS,
    ALLOWED_ATTR: ARTICLE_ATTRIBUTES,
  })
}
