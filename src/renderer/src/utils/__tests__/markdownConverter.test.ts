import { describe, expect, it } from 'vitest'

import { htmlToMarkdown, markdownToHtml, sanitizeHtml } from '../markdownConverter'

describe('markdownConverter', () => {
  describe('htmlToMarkdown', () => {
    it('should convert HTML to Markdown', () => {
      const html = '<h1>Hello World</h1>'
      const result = htmlToMarkdown(html)
      expect(result).toBe('# Hello World')
    })

    it('should convert task list HTML back to Markdown', () => {
      const html =
        '<ul data-type="taskList" class="task-list"><li data-type="taskItem" class="task-list-item" data-checked="false"><input type="checkbox" disabled> abcd</li><li data-type="taskItem" class="task-list-item" data-checked="true"><input type="checkbox" checked disabled> efgh</li></ul>'
      const result = htmlToMarkdown(html)
      expect(result).toContain('- [ ] abcd')
      expect(result).toContain('- [x] efgh')
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
      expect(result).toContain('<h1>Hello World</h1>')
    })

    it('should convert task list syntax to proper HTML', () => {
      const markdown = '- [ ] abcd\n- [x] efgh'
      const result = markdownToHtml(markdown)
      expect(result).toContain('data-type="taskList"')
      expect(result).toContain('data-type="taskItem"')
      expect(result).toContain('data-checked="false"')
      expect(result).toContain('data-checked="true"')
      expect(result).toContain('<input type="checkbox" disabled>')
      expect(result).toContain('<input type="checkbox" checked disabled>')
      expect(result).toContain('abcd')
      expect(result).toContain('efgh')
    })

    it('should convert mixed task list with checked and unchecked items', () => {
      const markdown = '- [ ] First task\n- [x] Second task\n- [ ] Third task'
      const result = markdownToHtml(markdown)
      expect(result).toContain('data-type="taskList"')
      expect(result).toContain('First task')
      expect(result).toContain('Second task')
      expect(result).toContain('Third task')
      expect(result.match(/data-checked="false"/g)).toHaveLength(2)
      expect(result.match(/data-checked="true"/g)).toHaveLength(1)
    })

    it('should NOT convert standalone task syntax to task list', () => {
      const markdown = '[x] abcd'
      const result = markdownToHtml(markdown)
      expect(result).toContain('<p>[x] abcd</p>')
      expect(result).not.toContain('data-type="taskList"')
    })

    it('should handle regular list items alongside task lists', () => {
      const markdown = '- Regular item\n- [ ] Task item\n- Another regular item'
      const result = markdownToHtml(markdown)
      expect(result).toContain('data-type="taskList"')
      expect(result).toContain('Regular item')
      expect(result).toContain('Task item')
      expect(result).toContain('Another regular item')
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
    it('should sanitize HTML content and remove scripts', () => {
      const html = '<h1>Hello</h1><script>alert("xss")</script>'
      const result = sanitizeHtml(html)
      expect(result).toContain('<h1>Hello</h1>')
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('alert')
    })

    it('should preserve task list HTML elements', () => {
      const html =
        '<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><input type="checkbox" checked disabled> Task item</li></ul>'
      const result = sanitizeHtml(html)
      expect(result).toContain('data-type="taskList"')
      expect(result).toContain('data-type="taskItem"')
      expect(result).toContain('data-checked="true"')
      expect(result).toContain('<input type="checkbox"')
      expect(result).toContain('checked')
      expect(result).toContain('disabled')
    })

    it('should handle empty HTML', () => {
      const result = sanitizeHtml('')
      expect(result).toBe('')
    })
  })

  describe('Task List with Labels', () => {
    it('should wrap task items with labels when label option is true', () => {
      const markdown = '- [ ] abcd\n- [x] efgh'
      const result = markdownToHtml(markdown)
      expect(result).toContain('<label><input type="checkbox" disabled> abcd</label>')
      expect(result).toContain('<label><input type="checkbox" checked disabled> efgh</label>')
      expect(result).toContain('data-type="taskList"')
      expect(result).toContain('data-type="taskItem"')
    })

    it('should not wrap task items with labels by default', () => {
      const markdown = '- [ ] abcd\n- [x] efgh'
      const result = markdownToHtml(markdown)
      expect(result).not.toContain('<label>')
      expect(result).toContain('<input type="checkbox" disabled>')
      expect(result).toContain('<input type="checkbox" checked disabled>')
    })

    it('should preserve labels in sanitized HTML', () => {
      const html =
        '<ul data-type="taskList"><li data-type="taskItem"><label><input type="checkbox" checked disabled> Task with label</label></li></ul>'
      const result = sanitizeHtml(html)
      expect(result).toContain('<label>')
      expect(result).toContain('<input type="checkbox" checked')
      expect(result).toContain('Task with label')
    })
  })

  describe('Task List Round Trip', () => {
    it('should maintain task list structure through markdown → html → markdown conversion', () => {
      const originalMarkdown = '- [ ] abcd\n\n- [x] efgh'
      const html = markdownToHtml(originalMarkdown)
      const backToMarkdown = htmlToMarkdown(html)

      expect(backToMarkdown).toContain('- [ ] abcd')
      expect(backToMarkdown).toContain('- [x] efgh')
    })

    it('should handle complex task lists with multiple items', () => {
      const originalMarkdown =
        '- [ ] First unchecked task\n- [x] First checked task\n- [ ] Second unchecked task\n- [x] Second checked task'
      const html = markdownToHtml(originalMarkdown)
      const backToMarkdown = htmlToMarkdown(html)

      expect(backToMarkdown).toContain('- [ ] First unchecked task')
      expect(backToMarkdown).toContain('- [x] First checked task')
      expect(backToMarkdown).toContain('- [ ] Second unchecked task')
      expect(backToMarkdown).toContain('- [x] Second checked task')
    })
  })
})
