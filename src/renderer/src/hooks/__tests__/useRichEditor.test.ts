import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useRichEditor } from '../../components/RichEditor/useRichEditor'

// Mock the markdown converter
vi.mock('@renderer/utils/markdownConverter', () => ({
  htmlToMarkdown: vi.fn().mockReturnValue('# Mocked Markdown'),
  markdownToHtml: vi.fn().mockReturnValue('<h1>Mocked HTML</h1>'),
  markdownToSafeHtml: vi.fn().mockReturnValue('<h1>Safe HTML</h1>'),
  sanitizeHtml: vi.fn().mockImplementation((html) => `sanitized: ${html}`),
  markdownToPreviewText: vi.fn().mockReturnValue('Preview text'),
  isMarkdownContent: vi.fn().mockReturnValue(true)
}))

describe('useRichEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Functionality', () => {
    it('should initialize with empty content by default', () => {
      const { result } = renderHook(() => useRichEditor())

      expect(result.current.markdown).toBe('')
      expect(result.current.html).toBe('')
      expect(result.current.previewText).toBe('')
    })

    it('should initialize with provided markdown content', () => {
      const initialContent = '# Hello World'
      const { result } = renderHook(() => useRichEditor({ initialContent }))

      expect(result.current.markdown).toBe(initialContent)
    })

    it('should provide content type detection', () => {
      const { result } = renderHook(() => useRichEditor())

      expect(typeof result.current.isMarkdown).toBe('boolean')
    })
  })

  describe('Content Management', () => {
    it('should update markdown content', () => {
      const { result } = renderHook(() => useRichEditor())

      act(() => {
        result.current.setMarkdown('# New Content')
      })

      expect(result.current.markdown).toBe('# New Content')
    })

    it('should update HTML content and convert to markdown', () => {
      const { result } = renderHook(() => useRichEditor())

      act(() => {
        result.current.setHtml('<h1>HTML Content</h1>')
      })

      expect(result.current.markdown).toBe('# Mocked Markdown')
    })

    it('should clear all content', () => {
      const { result } = renderHook(() => useRichEditor({ initialContent: '# Test' }))

      act(() => {
        result.current.clear()
      })

      expect(result.current.markdown).toBe('')
    })
  })

  describe('Conversion Methods', () => {
    it('should provide markdown to HTML conversion', () => {
      const { result } = renderHook(() => useRichEditor())

      const html = result.current.toHtml('# Test')
      expect(html).toBe('<h1>Mocked HTML</h1>')
    })

    it('should provide markdown to safe HTML conversion', () => {
      const { result } = renderHook(() => useRichEditor())

      const safeHtml = result.current.toSafeHtml('# Test')
      expect(safeHtml).toBe('<h1>Safe HTML</h1>')
    })

    it('should provide HTML to markdown conversion', () => {
      const { result } = renderHook(() => useRichEditor())

      const markdown = result.current.toMarkdown('<h1>Test</h1>')
      expect(markdown).toBe('# Mocked Markdown')
    })

    it('should provide preview text generation', () => {
      const { result } = renderHook(() => useRichEditor())

      const preview = result.current.getPreviewText('# Test', 20)
      expect(preview).toBe('Preview text')
    })
  })

  describe('Callbacks', () => {
    it('should call onChange when markdown changes', () => {
      const onChange = vi.fn()
      const { result } = renderHook(() => useRichEditor({ onChange }))

      act(() => {
        result.current.setMarkdown('# New Content')
      })

      expect(onChange).toHaveBeenCalledWith('# New Content')
    })

    it('should call onHtmlChange when HTML changes', () => {
      const onHtmlChange = vi.fn()
      const { result } = renderHook(() => useRichEditor({ onHtmlChange }))

      act(() => {
        result.current.setHtml('<h1>HTML Content</h1>')
      })

      expect(onHtmlChange).toHaveBeenCalledWith('sanitized: <h1>HTML Content</h1>')
    })
  })

  describe('Error Handling', () => {
    it('should handle conversion errors gracefully', () => {
      // Just test that errors don't crash the app
      const { result } = renderHook(() => useRichEditor())

      // Should not crash when setting content
      act(() => {
        result.current.setHtml('<h1>Test</h1>')
      })

      expect(result.current.markdown).toBeDefined()
    })
  })

  describe('Configuration Options', () => {
    it('should support custom preview length', () => {
      const { result } = renderHook(() =>
        useRichEditor({
          previewLength: 100
        })
      )

      const preview = result.current.getPreviewText('# Long content', 100)
      expect(preview).toBe('Preview text')
    })

    it('should support disabled state', () => {
      const { result } = renderHook(() =>
        useRichEditor({
          disabled: true
        })
      )

      expect(result.current.disabled).toBe(true)
    })
  })
})
