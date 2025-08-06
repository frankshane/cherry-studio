import { fireEvent, render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { Command, CommandCategory } from '../command'
import CommandListPopover, { type CommandListPopoverRef } from '../CommandListPopover'

// Mock commands for testing
const mockCommands: Command[] = [
  {
    id: 'paragraph',
    title: 'Text',
    description: 'Start writing with plain text',
    category: 'text' as CommandCategory,
    icon: '📝',
    keywords: ['text', 'paragraph', 'p'],
    handler: vi.fn()
  },
  {
    id: 'heading1',
    title: 'Heading 1',
    description: 'Big section heading',
    category: 'text' as CommandCategory,
    icon: 'H1',
    keywords: ['heading', 'h1', 'title', 'big'],
    handler: vi.fn()
  }
]

describe('CommandListPopover', () => {
  it('renders command list when visible', () => {
    const onSelect = vi.fn()
    const onClose = vi.fn()

    render(
      <CommandListPopover visible={true} items={mockCommands} selectedIndex={0} onSelect={onSelect} onClose={onClose} />
    )

    expect(screen.getByText('Text')).toBeInTheDocument()
    expect(screen.getByText('Start writing with plain text')).toBeInTheDocument()
    expect(screen.getByText('Heading 1')).toBeInTheDocument()
    expect(screen.getByText('Big section heading')).toBeInTheDocument()
  })

  it('does not render when not visible', () => {
    const onSelect = vi.fn()
    const onClose = vi.fn()

    render(
      <CommandListPopover
        visible={false}
        items={mockCommands}
        selectedIndex={0}
        onSelect={onSelect}
        onClose={onClose}
      />
    )

    expect(screen.queryByText('Text')).not.toBeInTheDocument()
  })

  it('calls onSelect when item is clicked', () => {
    const onSelect = vi.fn()
    const onClose = vi.fn()

    render(
      <CommandListPopover visible={true} items={mockCommands} selectedIndex={0} onSelect={onSelect} onClose={onClose} />
    )

    fireEvent.click(screen.getByText('Text'))
    expect(onSelect).toHaveBeenCalledWith(mockCommands[0])
  })

  it('handles keyboard navigation correctly', () => {
    const onSelect = vi.fn()
    const onClose = vi.fn()
    const ref = useRef<CommandListPopoverRef>(null)

    render(
      <CommandListPopover
        ref={ref}
        visible={true}
        items={mockCommands}
        selectedIndex={0}
        onSelect={onSelect}
        onClose={onClose}
      />
    )

    // Test Enter key
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' })
    const result = ref.current?.onKeyDown(enterEvent)
    expect(result).toBe(true)
    expect(onSelect).toHaveBeenCalledWith(mockCommands[0])
  })

  it('shows empty state when no items', () => {
    const onSelect = vi.fn()
    const onClose = vi.fn()

    render(<CommandListPopover visible={true} items={[]} selectedIndex={0} onSelect={onSelect} onClose={onClose} />)

    expect(screen.getByText('No commands found')).toBeInTheDocument()
  })
})
