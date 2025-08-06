import { describe, expect, it, vi } from 'vitest'

import { htmlToMarkdown, markdownToHtml, sanitizeHtml } from '../markdownConverter'

// Mock dependencies
vi.mock('turndown', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      turndown: vi.fn().mockReturnValue('# Mocked Markdown'),
      addRule: vi.fn()
    }))
  }
})

vi.mock('markdown-it', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      render: vi.fn().mockReturnValue('<h1>Mocked HTML</h1>')
    }))
  }
})

vi.mock('dompurify', () => ({
  default: {
    sanitize: vi.fn().mockImplementation((html) => `sanitized: ${html}`)
  }
}))

describe('markdownConverter', () => {
  describe('htmlToMarkdown', () => {
    it('should convert HTML to Markdown', () => {
      const html = '<h1>Hello World</h1>'
      const result = htmlToMarkdown(html)
      expect(result).toBe('# Mocked Markdown')
    })

    it('should handle empty HTML', () => {
      const result = htmlToMarkdown('')
      expect(result).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(htmlToMarkdown(null as any)).toBe('')
      expect(htmlToMarkdown(undefined as any)).toBe('')
    })
  })

  describe('markdownToHtml', () => {
    it('should convert Markdown to HTML', () => {
      const markdown = '# Hello World'
      const result = markdownToHtml(markdown)
      expect(result).toBe('<h1>Mocked HTML</h1>')
    })

    it('should handle empty Markdown', () => {
      const result = markdownToHtml('')
      expect(result).toBe('')
    })

    it('should handle null/undefined input', () => {
      expect(markdownToHtml(null as any)).toBe('')
      expect(markdownToHtml(undefined as any)).toBe('')
    })
  })

  describe('sanitizeHtml', () => {
    it('should sanitize HTML content', () => {
      const html = '<h1>Hello</h1><script>alert("xss")</script>'
      const result = sanitizeHtml(html)
      expect(result).toBe('sanitized: <h1>Hello</h1><script>alert("xss")</script>')
    })

    it('should handle empty HTML', () => {
      const result = sanitizeHtml('')
      expect(result).toBe('')
    })
  })
})
