import { describe, expect, it } from 'vitest'

import { htmlToPreviewText, isHtmlContent, sanitizeHtml, textToHtml } from '../richTextUtils'

describe('richTextUtils', () => {
  describe('htmlToPreviewText', () => {
    it('should convert HTML to plain text', () => {
      const html = '<p><strong>Bold text</strong> and <em>italic text</em></p>'
      const result = htmlToPreviewText(html)
      expect(result).toBe('Bold text and italic text')
    })

    it('should handle HTML entities', () => {
      const html = '<p>Hello &amp; goodbye &lt;world&gt;</p>'
      const result = htmlToPreviewText(html)
      expect(result).toBe('Hello & goodbye <world>')
    })

    it('should truncate to specified length', () => {
      const html = '<p>This is a very long piece of text that should be truncated</p>'
      const result = htmlToPreviewText(html, 20)
      expect(result).toBe('This is a very long ...')
    })

    it('should handle empty content', () => {
      const result = htmlToPreviewText('')
      expect(result).toBe('')
    })

    it('should normalize whitespace', () => {
      const html = '<p>Text   with\n\n  multiple\tspaces</p>'
      const result = htmlToPreviewText(html)
      expect(result).toBe('Text with multiple spaces')
    })
  })

  describe('isHtmlContent', () => {
    it('should detect HTML content', () => {
      expect(isHtmlContent('<p>Hello</p>')).toBe(true)
      expect(isHtmlContent('<div><span>Test</span></div>')).toBe(true)
      expect(isHtmlContent('<strong>Bold</strong>')).toBe(true)
    })

    it('should not detect plain text as HTML', () => {
      expect(isHtmlContent('Plain text')).toBe(false)
      expect(isHtmlContent('Text with < and > symbols')).toBe(false)
      expect(isHtmlContent('')).toBe(false)
    })

    it('should handle edge cases', () => {
      expect(isHtmlContent('<>')).toBe(false)
      expect(isHtmlContent('< >')).toBe(false)
      expect(isHtmlContent('<br>')).toBe(true)
      expect(isHtmlContent('<img src="test.jpg">')).toBe(true)
    })
  })

  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const html = '<p>Safe content</p><script>alert("dangerous")</script><p>More content</p>'
      const result = sanitizeHtml(html)
      expect(result).toBe('<p>Safe content</p><p>More content</p>')
    })

    it('should remove event handlers', () => {
      const html = '<button onclick="alert(\'click\')">Click me</button>'
      const result = sanitizeHtml(html)
      expect(result).toBe('<button>Click me</button>')
    })

    it('should remove javascript URLs', () => {
      const html = '<a href="javascript:alert(\'xss\')">Link</a>'
      const result = sanitizeHtml(html)
      expect(result).toBe('<a href="">Link</a>')
    })

    it('should handle empty content', () => {
      const result = sanitizeHtml('')
      expect(result).toBe('')
    })
  })

  describe('textToHtml', () => {
    it('should convert plain text to HTML paragraphs', () => {
      const text = 'First line\nSecond line\nThird line'
      const result = textToHtml(text)
      expect(result).toBe('<p>First line</p><p>Second line</p><p>Third line</p>')
    })

    it('should handle empty lines', () => {
      const text = 'First line\n\nThird line'
      const result = textToHtml(text)
      expect(result).toBe('<p>First line</p><p>Third line</p>')
    })

    it('should handle single line', () => {
      const text = 'Single line'
      const result = textToHtml(text)
      expect(result).toBe('<p>Single line</p>')
    })

    it('should handle empty content', () => {
      const result = textToHtml('')
      expect(result).toBe('')
    })

    it('should handle whitespace-only lines', () => {
      const text = 'First line\n   \nThird line'
      const result = textToHtml(text)
      expect(result).toBe('<p>First line</p><p>Third line</p>')
    })
  })
})
