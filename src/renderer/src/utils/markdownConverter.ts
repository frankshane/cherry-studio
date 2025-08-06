import { loggerService } from '@logger'
import DOMPurify from 'dompurify'
import he from 'he'
import MarkdownIt from 'markdown-it'
import striptags from 'striptags'
import TurndownService from 'turndown'

const logger = loggerService.withContext('markdownConverter')
// Initialize markdown-it with common plugins
const md = new MarkdownIt({
  html: true, // Enable HTML tags in source
  xhtmlOut: true, // Use '/' to close single tags (<br />)
  breaks: true, // Convert '\n' in paragraphs into <br>
  linkify: true, // Autoconvert URL-like text to links
  typographer: true // Enable smartypants and other sweet transforms
})

// Initialize turndown service
const turndownService = new TurndownService({
  headingStyle: 'atx', // Use # for headings
  hr: '---', // Use --- for horizontal rules
  bulletListMarker: '-', // Use - for bullet lists
  codeBlockStyle: 'fenced', // Use ``` for code blocks
  fence: '```', // Use ``` for code blocks
  emDelimiter: '*', // Use * for emphasis
  strongDelimiter: '**' // Use ** for strong
})

// Configure turndown rules for better conversion
turndownService.addRule('strikethrough', {
  filter: ['del', 's'],
  replacement: (content) => `~~${content}~~`
})

/**
 * Converts HTML content to Markdown
 * @param html - HTML string to convert
 * @returns Markdown string
 */
export const htmlToMarkdown = (html: string | null | undefined): string => {
  if (!html || typeof html !== 'string') {
    return ''
  }

  try {
    return turndownService.turndown(html).trim()
  } catch (error) {
    logger.error('Error converting HTML to Markdown:', error as Error)
    return ''
  }
}

/**
 * Converts Markdown content to HTML
 * @param markdown - Markdown string to convert
 * @returns HTML string
 */
export const markdownToHtml = (markdown: string | null | undefined): string => {
  if (!markdown || typeof markdown !== 'string') {
    return ''
  }

  try {
    return md.render(markdown)
  } catch (error) {
    logger.error('Error converting Markdown to HTML:', error as Error)
    return ''
  }
}

/**
 * Sanitizes HTML content using DOMPurify
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return ''
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'br',
      'hr',
      'strong',
      'b',
      'em',
      'i',
      'u',
      's',
      'del',
      'ul',
      'ol',
      'li',
      'blockquote',
      'code',
      'pre',
      'a',
      'img'
    ],
    ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'class', 'id'],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\\-]+(?:[^a-z+.\-:]|$))/i
  })
}

/**
 * Converts Markdown to safe HTML (combines conversion and sanitization)
 * @param markdown - Markdown string to convert
 * @returns Safe HTML string
 */
export const markdownToSafeHtml = (markdown: string): string => {
  const html = markdownToHtml(markdown)
  return sanitizeHtml(html)
}

/**
 * Gets plain text preview from Markdown content
 * @param markdown - Markdown string
 * @param maxLength - Maximum length for preview
 * @returns Plain text preview
 */
export const markdownToPreviewText = (markdown: string, maxLength: number = 50): string => {
  if (!markdown) return ''

  // Convert to HTML first, then strip tags
  const html = markdownToHtml(markdown)
  const textContent = he.decode(striptags(html)).replace(/\s+/g, ' ').trim()

  return textContent.length > maxLength ? `${textContent.slice(0, maxLength)}...` : textContent
}

/**
 * Checks if content is Markdown (contains Markdown syntax)
 * @param content - Content to check
 * @returns True if content appears to be Markdown
 */
export const isMarkdownContent = (content: string): boolean => {
  if (!content) return false

  // Check for common Markdown syntax
  const markdownPatterns = [
    /^#{1,6}\s/, // Headers
    /^\*\s|^-\s|^\+\s/, // Unordered lists
    /^\d+\.\s/, // Ordered lists
    /\*\*.*\*\*/, // Bold
    /\*.*\*/, // Italic
    /`.*`/, // Inline code
    /```/, // Code blocks
    /^>/, // Blockquotes
    /\[.*\]\(.*\)/, // Links
    /!\[.*\]\(.*\)/ // Images
  ]

  return markdownPatterns.some((pattern) => pattern.test(content))
}
