import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Toolbar } from '../toolbar'
import type { FormattingState } from '../types'

// Mock Lucide React icons
vi.mock('lucide-react', () => ({
  Bold: () => <div data-testid="bold-icon">B</div>,
  Italic: () => <div data-testid="italic-icon">I</div>,
  Underline: () => <div data-testid="underline-icon">U</div>,
  Type: () => <div data-testid="heading-icon">H</div>,
  List: () => <div data-testid="bullet-list-icon">•</div>,
  ListOrdered: () => <div data-testid="ordered-list-icon">1.</div>
}))

describe('Toolbar', () => {
  const mockEditor = {
    isActive: vi.fn(),
    chain: vi.fn(() => ({
      focus: vi.fn(() => ({
        toggleBold: vi.fn(() => ({ run: vi.fn() })),
        toggleItalic: vi.fn(() => ({ run: vi.fn() })),
        toggleUnderline: vi.fn(() => ({ run: vi.fn() }))
      }))
    }))
  }

  const defaultFormattingState: FormattingState = {
    bold: false,
    italic: false,
    underline: false,
    headingLevel: 0,
    bulletList: false,
    orderedList: false
  }

  const mockOnCommand = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render toolbar with all default buttons', () => {
      render(<Toolbar editor={mockEditor} formattingState={defaultFormattingState} onCommand={mockOnCommand} />)

      expect(screen.getByTestId('rich-editor-toolbar')).toBeInTheDocument()
      expect(screen.getByTestId('toolbar-bold')).toBeInTheDocument()
      expect(screen.getByTestId('toolbar-italic')).toBeInTheDocument()
      expect(screen.getByTestId('toolbar-underline')).toBeInTheDocument()
      expect(screen.getByTestId('toolbar-heading')).toBeInTheDocument()
      expect(screen.getByTestId('toolbar-bulletList')).toBeInTheDocument()
      expect(screen.getByTestId('toolbar-orderedList')).toBeInTheDocument()
    })

    it('should render correct icons for each button', () => {
      render(<Toolbar editor={mockEditor} formattingState={defaultFormattingState} onCommand={mockOnCommand} />)

      expect(screen.getByTestId('bold-icon')).toBeInTheDocument()
      expect(screen.getByTestId('italic-icon')).toBeInTheDocument()
      expect(screen.getByTestId('underline-icon')).toBeInTheDocument()
      expect(screen.getByTestId('heading-icon')).toBeInTheDocument()
      expect(screen.getByTestId('bullet-list-icon')).toBeInTheDocument()
      expect(screen.getByTestId('ordered-list-icon')).toBeInTheDocument()
    })

    it('should render dividers between button groups', () => {
      render(<Toolbar editor={mockEditor} formattingState={defaultFormattingState} onCommand={mockOnCommand} />)

      // There should be dividers separating the button groups
      const toolbar = screen.getByTestId('rich-editor-toolbar')
      const dividers = toolbar.querySelectorAll('.toolbar-divider, [class*="ToolbarDivider"]')
      expect(dividers.length).toBeGreaterThan(0)
    })

    it('should not render when editor is null', () => {
      render(<Toolbar editor={null} formattingState={defaultFormattingState} onCommand={mockOnCommand} />)

      expect(screen.queryByTestId('rich-editor-toolbar')).not.toBeInTheDocument()
    })
  })

  describe('Button States', () => {
    it('should show bold button as active when bold is true', () => {
      const activeFormattingState: FormattingState = {
        ...defaultFormattingState,
        bold: true
      }

      render(<Toolbar editor={mockEditor} formattingState={activeFormattingState} onCommand={mockOnCommand} />)

      const boldButton = screen.getByTestId('toolbar-bold')
      expect(boldButton).toHaveAttribute('data-active', 'true')
    })

    it('should show italic button as active when italic is true', () => {
      const activeFormattingState: FormattingState = {
        ...defaultFormattingState,
        italic: true
      }

      render(<Toolbar editor={mockEditor} formattingState={activeFormattingState} onCommand={mockOnCommand} />)

      const italicButton = screen.getByTestId('toolbar-italic')
      expect(italicButton).toHaveAttribute('data-active', 'true')
    })

    it('should show heading button as active when headingLevel > 0', () => {
      const activeFormattingState: FormattingState = {
        ...defaultFormattingState,
        headingLevel: 2
      }

      render(<Toolbar editor={mockEditor} formattingState={activeFormattingState} onCommand={mockOnCommand} />)

      const headingButton = screen.getByTestId('toolbar-heading')
      expect(headingButton).toHaveAttribute('data-active', 'true')
    })

    it('should show bullet list button as active when bulletList is true', () => {
      const activeFormattingState: FormattingState = {
        ...defaultFormattingState,
        bulletList: true
      }

      render(<Toolbar editor={mockEditor} formattingState={activeFormattingState} onCommand={mockOnCommand} />)

      const bulletListButton = screen.getByTestId('toolbar-bulletList')
      expect(bulletListButton).toHaveAttribute('data-active', 'true')
    })
  })

  describe('Button Interactions', () => {
    it('should call onCommand with bold when bold button is clicked', async () => {
      render(<Toolbar editor={mockEditor} formattingState={defaultFormattingState} onCommand={mockOnCommand} />)

      const boldButton = screen.getByTestId('toolbar-bold')
      await userEvent.click(boldButton)

      expect(mockOnCommand).toHaveBeenCalledWith('bold')
    })

    it('should call onCommand with italic when italic button is clicked', async () => {
      render(<Toolbar editor={mockEditor} formattingState={defaultFormattingState} onCommand={mockOnCommand} />)

      const italicButton = screen.getByTestId('toolbar-italic')
      await userEvent.click(italicButton)

      expect(mockOnCommand).toHaveBeenCalledWith('italic')
    })

    it('should call onCommand with underline when underline button is clicked', async () => {
      render(<Toolbar editor={mockEditor} formattingState={defaultFormattingState} onCommand={mockOnCommand} />)

      const underlineButton = screen.getByTestId('toolbar-underline')
      await userEvent.click(underlineButton)

      expect(mockOnCommand).toHaveBeenCalledWith('underline')
    })

    it('should call onCommand with heading when heading button is clicked', async () => {
      render(<Toolbar editor={mockEditor} formattingState={defaultFormattingState} onCommand={mockOnCommand} />)

      const headingButton = screen.getByTestId('toolbar-heading')
      await userEvent.click(headingButton)

      expect(mockOnCommand).toHaveBeenCalledWith('heading')
    })

    it('should call onCommand with bulletList when bullet list button is clicked', async () => {
      render(<Toolbar editor={mockEditor} formattingState={defaultFormattingState} onCommand={mockOnCommand} />)

      const bulletListButton = screen.getByTestId('toolbar-bulletList')
      await userEvent.click(bulletListButton)

      expect(mockOnCommand).toHaveBeenCalledWith('bulletList')
    })

    it('should call onCommand with orderedList when ordered list button is clicked', async () => {
      render(<Toolbar editor={mockEditor} formattingState={defaultFormattingState} onCommand={mockOnCommand} />)

      const orderedListButton = screen.getByTestId('toolbar-orderedList')
      await userEvent.click(orderedListButton)

      expect(mockOnCommand).toHaveBeenCalledWith('orderedList')
    })
  })

  describe('Button Accessibility', () => {
    it('should have proper titles for accessibility', () => {
      render(<Toolbar editor={mockEditor} formattingState={defaultFormattingState} onCommand={mockOnCommand} />)

      expect(screen.getByTestId('toolbar-bold')).toHaveAttribute('title', 'bold')
      expect(screen.getByTestId('toolbar-italic')).toHaveAttribute('title', 'italic')
      expect(screen.getByTestId('toolbar-underline')).toHaveAttribute('title', 'underline')
      expect(screen.getByTestId('toolbar-heading')).toHaveAttribute('title', 'heading')
      expect(screen.getByTestId('toolbar-bulletList')).toHaveAttribute('title', 'bulletList')
      expect(screen.getByTestId('toolbar-orderedList')).toHaveAttribute('title', 'orderedList')
    })

    it('should be keyboard accessible', async () => {
      render(<Toolbar editor={mockEditor} formattingState={defaultFormattingState} onCommand={mockOnCommand} />)

      const boldButton = screen.getByTestId('toolbar-bold')
      boldButton.focus()

      await userEvent.keyboard('{Enter}')
      expect(mockOnCommand).toHaveBeenCalledWith('bold')
    })
  })
})
