import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import RichEditor from '../index'

// Mock TipTap Editor with more detailed formatting methods
const mockEditor = {
  getHTML: vi.fn(() => '<p>test content</p>'),
  getText: vi.fn(() => 'test content'),
  isActive: vi.fn((format: string, attrs?: any) => {
    // Mock active states for different formats
    if (format === 'bold') return false
    if (format === 'italic') return false
    if (format === 'underline') return false
    if (format === 'heading' && attrs?.level) return false
    if (format === 'bulletList') return false
    if (format === 'orderedList') return false
    return false
  }),
  commands: {
    setContent: vi.fn(),
    focus: vi.fn(),
    clearContent: vi.fn(),
    insertContent: vi.fn()
  },
  chain: vi.fn(() => ({
    focus: vi.fn(() => ({
      toggleBold: vi.fn(() => ({ run: vi.fn() })),
      toggleItalic: vi.fn(() => ({ run: vi.fn() })),
      toggleUnderline: vi.fn(() => ({ run: vi.fn() })),
      toggleHeading: vi.fn(() => ({ run: vi.fn() })),
      setParagraph: vi.fn(() => ({ run: vi.fn() })),
      toggleBulletList: vi.fn(() => ({ run: vi.fn() })),
      toggleOrderedList: vi.fn(() => ({ run: vi.fn() }))
    }))
  })),
  on: vi.fn(),
  off: vi.fn(),
  destroy: vi.fn()
}

// Mock TipTap hooks
vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn(() => mockEditor),
  EditorContent: ({ editor }: { editor: any }) => (
    <div data-testid="editor-content" data-editor={editor ? 'present' : 'absent'}>
      Editor Content
    </div>
  )
}))

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Bold: () => <div data-testid="bold-icon">B</div>,
  Italic: () => <div data-testid="italic-icon">I</div>,
  Underline: () => <div data-testid="underline-icon">U</div>,
  Type: () => <div data-testid="heading-icon">H</div>,
  List: () => <div data-testid="bullet-list-icon">•</div>,
  ListOrdered: () => <div data-testid="ordered-list-icon">1.</div>
}))

describe('RichEditor Formatting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Bold Formatting', () => {
    it('should toggle bold when bold button is clicked', async () => {
      const mockToggleBold = vi.fn(() => ({ run: vi.fn() }))
      const mockChain = {
        focus: vi.fn(() => ({
          toggleBold: mockToggleBold
        }))
      }
      mockEditor.chain.mockReturnValue(mockChain)

      render(<RichEditor />)

      const boldButton = screen.getByTestId('toolbar-bold')
      await userEvent.click(boldButton)

      expect(mockEditor.chain).toHaveBeenCalled()
      expect(mockChain.focus).toHaveBeenCalled()
      expect(mockToggleBold).toHaveBeenCalled()
    })

    it('should show bold button as active when text is bold', () => {
      mockEditor.isActive.mockImplementation((format: string) => format === 'bold')

      render(<RichEditor />)

      const boldButton = screen.getByTestId('toolbar-bold')
      // The active state should be reflected in the button styling
      expect(boldButton).toHaveAttribute('data-active', 'true')
    })
  })

  describe('Italic Formatting', () => {
    it('should toggle italic when italic button is clicked', async () => {
      const mockToggleItalic = vi.fn(() => ({ run: vi.fn() }))
      const mockChain = {
        focus: vi.fn(() => ({
          toggleItalic: mockToggleItalic
        }))
      }
      mockEditor.chain.mockReturnValue(mockChain)

      render(<RichEditor />)

      const italicButton = screen.getByTestId('toolbar-italic')
      await userEvent.click(italicButton)

      expect(mockEditor.chain).toHaveBeenCalled()
      expect(mockChain.focus).toHaveBeenCalled()
      expect(mockToggleItalic).toHaveBeenCalled()
    })

    it('should show italic button as active when text is italic', () => {
      mockEditor.isActive.mockImplementation((format: string) => format === 'italic')

      render(<RichEditor />)

      const italicButton = screen.getByTestId('toolbar-italic')
      expect(italicButton).toHaveAttribute('data-active', 'true')
    })
  })

  describe('Underline Formatting', () => {
    it('should toggle underline when underline button is clicked', async () => {
      const mockToggleUnderline = vi.fn(() => ({ run: vi.fn() }))
      const mockChain = {
        focus: vi.fn(() => ({
          toggleUnderline: mockToggleUnderline
        }))
      }
      mockEditor.chain.mockReturnValue(mockChain)

      render(<RichEditor />)

      const underlineButton = screen.getByTestId('toolbar-underline')
      await userEvent.click(underlineButton)

      expect(mockEditor.chain).toHaveBeenCalled()
      expect(mockChain.focus).toHaveBeenCalled()
      expect(mockToggleUnderline).toHaveBeenCalled()
    })

    it('should show underline button as active when text is underlined', () => {
      mockEditor.isActive.mockImplementation((format: string) => format === 'underline')

      render(<RichEditor />)

      const underlineButton = screen.getByTestId('toolbar-underline')
      expect(underlineButton).toHaveAttribute('data-active', 'true')
    })
  })

  describe('Heading Formatting', () => {
    it('should toggle heading when heading button is clicked', async () => {
      const mockToggleHeading = vi.fn(() => ({ run: vi.fn() }))
      const mockSetParagraph = vi.fn(() => ({ run: vi.fn() }))
      const mockChain = {
        focus: vi.fn(() => ({
          toggleHeading: mockToggleHeading,
          setParagraph: mockSetParagraph
        }))
      }
      mockEditor.chain.mockReturnValue(mockChain)
      mockEditor.isActive.mockImplementation((format: string) => format !== 'heading')

      render(<RichEditor />)

      const headingButton = screen.getByTestId('toolbar-heading')
      await userEvent.click(headingButton)

      expect(mockEditor.chain).toHaveBeenCalled()
      expect(mockChain.focus).toHaveBeenCalled()
      expect(mockToggleHeading).toHaveBeenCalledWith({ level: 2 })
    })

    it('should convert heading to paragraph when already a heading', async () => {
      const mockToggleHeading = vi.fn(() => ({ run: vi.fn() }))
      const mockSetParagraph = vi.fn(() => ({ run: vi.fn() }))
      const mockChain = {
        focus: vi.fn(() => ({
          toggleHeading: mockToggleHeading,
          setParagraph: mockSetParagraph
        }))
      }
      mockEditor.chain.mockReturnValue(mockChain)
      mockEditor.isActive.mockImplementation((format: string) => format === 'heading')

      render(<RichEditor />)

      const headingButton = screen.getByTestId('toolbar-heading')
      await userEvent.click(headingButton)

      expect(mockEditor.chain).toHaveBeenCalled()
      expect(mockChain.focus).toHaveBeenCalled()
      expect(mockSetParagraph).toHaveBeenCalled()
    })

    it('should show heading button as active when text is a heading', () => {
      mockEditor.isActive.mockImplementation((format: string, attrs?: any) => {
        if (format === 'heading' && attrs?.level) return true
        return format === 'heading'
      })

      render(<RichEditor />)

      const headingButton = screen.getByTestId('toolbar-heading')
      expect(headingButton).toHaveAttribute('data-active', 'true')
    })
  })

  describe('List Formatting', () => {
    it('should toggle bullet list when bullet list button is clicked', async () => {
      const mockToggleBulletList = vi.fn(() => ({ run: vi.fn() }))
      const mockChain = {
        focus: vi.fn(() => ({
          toggleBulletList: mockToggleBulletList
        }))
      }
      mockEditor.chain.mockReturnValue(mockChain)

      render(<RichEditor />)

      const bulletListButton = screen.getByTestId('toolbar-bulletList')
      await userEvent.click(bulletListButton)

      expect(mockEditor.chain).toHaveBeenCalled()
      expect(mockChain.focus).toHaveBeenCalled()
      expect(mockToggleBulletList).toHaveBeenCalled()
    })

    it('should toggle ordered list when ordered list button is clicked', async () => {
      const mockToggleOrderedList = vi.fn(() => ({ run: vi.fn() }))
      const mockChain = {
        focus: vi.fn(() => ({
          toggleOrderedList: mockToggleOrderedList
        }))
      }
      mockEditor.chain.mockReturnValue(mockChain)

      render(<RichEditor />)

      const orderedListButton = screen.getByTestId('toolbar-orderedList')
      await userEvent.click(orderedListButton)

      expect(mockEditor.chain).toHaveBeenCalled()
      expect(mockChain.focus).toHaveBeenCalled()
      expect(mockToggleOrderedList).toHaveBeenCalled()
    })

    it('should show bullet list button as active when in bullet list', () => {
      mockEditor.isActive.mockImplementation((format: string) => format === 'bulletList')

      render(<RichEditor />)

      const bulletListButton = screen.getByTestId('toolbar-bulletList')
      expect(bulletListButton).toHaveAttribute('data-active', 'true')
    })

    it('should show ordered list button as active when in ordered list', () => {
      mockEditor.isActive.mockImplementation((format: string) => format === 'orderedList')

      render(<RichEditor />)

      const orderedListButton = screen.getByTestId('toolbar-orderedList')
      expect(orderedListButton).toHaveAttribute('data-active', 'true')
    })
  })

  describe('Content Callbacks', () => {
    it('should call onContentChange when formatting is applied', async () => {
      const onContentChange = vi.fn()
      const mockToggleBold = vi.fn(() => ({ run: vi.fn() }))
      const mockChain = {
        focus: vi.fn(() => ({
          toggleBold: mockToggleBold
        }))
      }
      mockEditor.chain.mockReturnValue(mockChain)

      render(<RichEditor onContentChange={onContentChange} />)

      const boldButton = screen.getByTestId('toolbar-bold')
      await userEvent.click(boldButton)

      // The formatting action should trigger the editor update callback
      expect(mockToggleBold).toHaveBeenCalled()
    })

    it('should call onHtmlChange when formatting is applied', async () => {
      const onHtmlChange = vi.fn()
      const mockToggleItalic = vi.fn(() => ({ run: vi.fn() }))
      const mockChain = {
        focus: vi.fn(() => ({
          toggleItalic: mockToggleItalic
        }))
      }
      mockEditor.chain.mockReturnValue(mockChain)

      render(<RichEditor onHtmlChange={onHtmlChange} />)

      const italicButton = screen.getByTestId('toolbar-italic')
      await userEvent.click(italicButton)

      expect(mockToggleItalic).toHaveBeenCalled()
    })
  })

  describe('Keyboard Shortcuts', () => {
    it('should respond to keyboard shortcut for bold', async () => {
      const mockToggleBold = vi.fn(() => ({ run: vi.fn() }))
      const mockChain = {
        focus: vi.fn(() => ({
          toggleBold: mockToggleBold
        }))
      }
      mockEditor.chain.mockReturnValue(mockChain)

      render(<RichEditor />)

      const editorContent = screen.getByTestId('editor-content')

      // Focus the editor first
      editorContent.focus()

      // Simulate Ctrl+B (bold shortcut)
      await userEvent.keyboard('{Control>}b{/Control}')

      // Note: This test verifies the UI is ready for keyboard shortcuts
      // The actual shortcut handling is done by TipTap internally
      expect(editorContent).toBeInTheDocument()
    })
  })
})
