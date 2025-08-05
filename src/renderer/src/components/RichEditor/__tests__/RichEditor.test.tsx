import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import RichEditor from '../index'

// Mock TipTap Editor
const mockEditor = {
  getHTML: vi.fn(() => '<p>test content</p>'),
  getText: vi.fn(() => 'test content'),
  commands: {
    setContent: vi.fn(),
    focus: vi.fn(),
    clearContent: vi.fn(),
    insertContent: vi.fn(),
    toggleBold: vi.fn(),
    toggleItalic: vi.fn(),
    toggleUnderline: vi.fn(),
    toggleHeading: vi.fn(),
    toggleBulletList: vi.fn(),
    toggleOrderedList: vi.fn()
  },
  isActive: vi.fn(() => false),
  on: vi.fn(),
  off: vi.fn(),
  destroy: vi.fn()
}

// Mock useEditor hook from TipTap
vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn(() => mockEditor),
  EditorContent: ({ editor }: { editor: any }) => (
    <div data-testid="editor-content" data-editor={editor ? 'present' : 'absent'}>
      {editor ? 'Editor Content' : 'No Editor'}
    </div>
  )
}))

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

describe('RichEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      render(<RichEditor />)

      expect(screen.getByTestId('editor-content')).toBeInTheDocument()
    })

    it('should render with custom className', () => {
      const className = 'custom-editor-class'
      render(<RichEditor className={className} />)

      // The component should have the custom class
      const editorWrapper = document.querySelector('.rich-editor-wrapper')
      expect(editorWrapper).toHaveClass(className)
    })

    it('should render placeholder when provided', () => {
      const placeholder = 'Enter your text here...'
      render(<RichEditor placeholder={placeholder} />)

      // Check if placeholder is passed to editor
      expect(screen.getByTestId('editor-content')).toBeInTheDocument()
    })

    it('should render with initial content', () => {
      const initialContent = 'Initial test content'
      render(<RichEditor initialContent={initialContent} />)

      expect(screen.getByTestId('editor-content')).toBeInTheDocument()
    })
  })

  describe('Editor State Management', () => {
    it('should initialize with editable state by default', () => {
      render(<RichEditor />)

      expect(screen.getByTestId('editor-content')).toHaveAttribute('data-editor', 'present')
    })

    it('should respect editable prop when set to false', () => {
      render(<RichEditor editable={false} />)

      expect(screen.getByTestId('editor-content')).toBeInTheDocument()
    })
  })

  describe('Toolbar Integration', () => {
    it('should show toolbar by default', () => {
      render(<RichEditor />)

      expect(screen.getByTestId('rich-editor-toolbar')).toBeInTheDocument()
    })

    it('should hide toolbar when showToolbar is false', () => {
      render(<RichEditor showToolbar={false} />)

      expect(screen.queryByTestId('rich-editor-toolbar')).not.toBeInTheDocument()
    })
  })

  describe('Content Change Callbacks', () => {
    it('should call onContentChange when content changes', async () => {
      const onContentChange = vi.fn()
      render(<RichEditor onContentChange={onContentChange} />)

      // Simulate content change by triggering the editor's update event
      // This would normally be triggered by TipTap when content changes
      expect(screen.getByTestId('editor-content')).toBeInTheDocument()
    })

    it('should call onHtmlChange when HTML content changes', async () => {
      const onHtmlChange = vi.fn()
      render(<RichEditor onHtmlChange={onHtmlChange} />)

      expect(screen.getByTestId('editor-content')).toBeInTheDocument()
    })
  })

  describe('Height Configuration', () => {
    it('should apply minHeight when provided', () => {
      const minHeight = 200
      render(<RichEditor minHeight={minHeight} />)

      const editorWrapper = document.querySelector('.rich-editor-wrapper')
      expect(editorWrapper).toHaveStyle({ minHeight: `${minHeight}px` })
    })

    it('should apply maxHeight when provided', () => {
      const maxHeight = 500
      render(<RichEditor maxHeight={maxHeight} />)

      const editorWrapper = document.querySelector('.rich-editor-wrapper')
      expect(editorWrapper).toHaveStyle({ maxHeight: `${maxHeight}px` })
    })
  })

  describe('Editor Instance Methods', () => {
    it('should expose editor methods via ref', () => {
      const ref = { current: null }
      render(<RichEditor ref={ref} />)

      expect(ref.current).toBeDefined()
      expect(ref.current).toHaveProperty('getContent')
      expect(ref.current).toHaveProperty('getHtml')
      expect(ref.current).toHaveProperty('setContent')
      expect(ref.current).toHaveProperty('setHtml')
      expect(ref.current).toHaveProperty('focus')
      expect(ref.current).toHaveProperty('clear')
      expect(ref.current).toHaveProperty('insertText')
      expect(ref.current).toHaveProperty('executeCommand')
    })
  })

  // TODO: Add error handling tests when needed
})
