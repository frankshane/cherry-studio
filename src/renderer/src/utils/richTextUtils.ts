/**
 * Rich text content utilities for handling HTML content in knowledge notes
 */

/**
 * Converts HTML content to plain text for preview display
 * @param htmlContent - HTML string content
 * @param maxLength - Maximum length for preview (default 50)
 * @returns Plain text preview
 */
export const htmlToPreviewText = (htmlContent: string, maxLength: number = 50): string => {
  if (!htmlContent) return ''

  // Remove HTML tags and decode entities
  const textContent = htmlContent
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&amp;/g, '&') // Decode ampersands
    .replace(/&lt;/g, '<') // Decode less than
    .replace(/&gt;/g, '>') // Decode greater than
    .replace(/&quot;/g, '"') // Decode quotes
    .replace(/&#39;/g, "'") // Decode apostrophes
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()

  return textContent.length > maxLength ? `${textContent.slice(0, maxLength)}...` : textContent
}

/**
 * Checks if content is HTML (contains HTML tags)
 * @param content - Content to check
 * @returns True if content appears to be HTML
 */
export const isHtmlContent = (content: string): boolean => {
  if (!content) return false

  // Check for HTML tags - must have proper tag structure
  const htmlTagRegex = /<[a-zA-Z][a-zA-Z0-9]*[^<>]*>/
  return htmlTagRegex.test(content)
}

/**
 * Sanitizes HTML content for safe display
 * @param htmlContent - HTML content to sanitize
 * @returns Sanitized HTML content
 */
export const sanitizeHtml = (htmlContent: string): string => {
  if (!htmlContent) return ''

  // Basic sanitization - remove script tags and dangerous attributes
  return htmlContent
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/\s*on\w+="[^"]*"/gi, '') // Remove event handlers with whitespace
    .replace(/href="javascript:[^"]*"/gi, 'href=""') // Remove javascript: URLs
    .replace(/\s+>/g, '>') // Clean up extra spaces before closing bracket
}

/**
 * Converts plain text to HTML for rich editor
 * @param plainText - Plain text content
 * @returns HTML formatted content
 */
export const textToHtml = (plainText: string): string => {
  if (!plainText) return ''

  // Convert line breaks to HTML paragraphs
  return plainText
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => `<p>${line}</p>`)
    .join('')
}
