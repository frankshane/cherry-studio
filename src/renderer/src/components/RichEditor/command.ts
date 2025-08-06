import { computePosition, flip, shift } from '@floating-ui/dom'
import { loggerService } from '@logger'
import type { Editor } from '@tiptap/core'
import type { MentionNodeAttrs } from '@tiptap/extension-mention'
import { posToDOMRect, ReactRenderer } from '@tiptap/react'
import type { SuggestionOptions } from '@tiptap/suggestion'

import CommandListPopover from './CommandListPopover'

const logger = loggerService.withContext('RichEditor.Command')

export interface Command {
  id: string
  title: string
  description: string
  category: CommandCategory
  icon: string
  keywords: string[]
  handler: (editor: Editor) => void
  isAvailable?: (editor: Editor) => boolean
}

export enum CommandCategory {
  TEXT = 'text',
  LISTS = 'lists',
  BLOCKS = 'blocks'
}

export interface CommandSuggestion {
  query: string
  range: any
  clientRect?: () => DOMRect | null
}

// Command registry
export const COMMANDS: Command[] = [
  {
    id: 'paragraph',
    title: 'Text',
    description: 'Start writing with plain text',
    category: CommandCategory.TEXT,
    icon: '📝',
    keywords: ['text', 'paragraph', 'p'],
    handler: (editor: Editor) => {
      editor.chain().focus().setParagraph().run()
    }
  },
  {
    id: 'heading1',
    title: 'Heading 1',
    description: 'Big section heading',
    category: CommandCategory.TEXT,
    icon: 'H1',
    keywords: ['heading', 'h1', 'title', 'big'],
    handler: (editor: Editor) => {
      editor.chain().focus().toggleHeading({ level: 1 }).run()
    }
  },
  {
    id: 'heading2',
    title: 'Heading 2',
    description: 'Medium section heading',
    category: CommandCategory.TEXT,
    icon: 'H2',
    keywords: ['heading', 'h2', 'subtitle', 'medium'],
    handler: (editor: Editor) => {
      editor.chain().focus().toggleHeading({ level: 2 }).run()
    }
  },
  {
    id: 'heading3',
    title: 'Heading 3',
    description: 'Small section heading',
    category: CommandCategory.TEXT,
    icon: 'H3',
    keywords: ['heading', 'h3', 'small'],
    handler: (editor: Editor) => {
      editor.chain().focus().toggleHeading({ level: 3 }).run()
    }
  },
  {
    id: 'bulletList',
    title: 'Bulleted list',
    description: 'Create a simple bulleted list',
    category: CommandCategory.LISTS,
    icon: '•',
    keywords: ['bullet', 'list', 'ul', 'unordered'],
    handler: (editor: Editor) => {
      editor.chain().focus().toggleBulletList().run()
    }
  },
  {
    id: 'orderedList',
    title: 'Numbered list',
    description: 'Create a list with numbering',
    category: CommandCategory.LISTS,
    icon: '1.',
    keywords: ['number', 'list', 'ol', 'ordered'],
    handler: (editor: Editor) => {
      editor.chain().focus().toggleOrderedList().run()
    }
  },
  {
    id: 'codeBlock',
    title: 'Code',
    description: 'Capture a code snippet',
    category: CommandCategory.BLOCKS,
    icon: '{}',
    keywords: ['code', 'block', 'snippet', 'programming'],
    handler: (editor: Editor) => {
      editor.chain().focus().toggleCodeBlock().run()
    }
  },
  {
    id: 'blockquote',
    title: 'Quote',
    description: 'Capture a quote',
    category: CommandCategory.BLOCKS,
    icon: '"',
    keywords: ['quote', 'blockquote', 'citation'],
    handler: (editor: Editor) => {
      editor.chain().focus().toggleBlockquote().run()
    }
  }
]

export interface CommandFilterOptions {
  query?: string
  category?: CommandCategory
  maxResults?: number
}

// Filter commands based on search query and category
export function filterCommands(options: CommandFilterOptions = {}): Command[] {
  const { query = '', category, maxResults = 10 } = options

  let filtered = COMMANDS

  // Filter by category if specified
  if (category) {
    filtered = filtered.filter((cmd) => cmd.category === category)
  }

  // Filter by search query
  if (query) {
    const searchTerm = query.toLowerCase().trim()
    filtered = filtered.filter((cmd) => {
      const searchableText = [cmd.title, cmd.description, ...cmd.keywords].join(' ').toLowerCase()

      return searchableText.includes(searchTerm)
    })

    // Sort by relevance (exact matches first, then title matches, then keyword matches)
    filtered.sort((a, b) => {
      const aTitle = a.title.toLowerCase()
      const bTitle = b.title.toLowerCase()
      const aExactMatch = aTitle === searchTerm
      const bExactMatch = bTitle === searchTerm
      const aTitleMatch = aTitle.includes(searchTerm)
      const bTitleMatch = bTitle.includes(searchTerm)

      if (aExactMatch && !bExactMatch) return -1
      if (bExactMatch && !aExactMatch) return 1
      if (aTitleMatch && !bTitleMatch) return -1
      if (bTitleMatch && !aTitleMatch) return 1

      return a.title.localeCompare(b.title)
    })
  }

  return filtered.slice(0, maxResults)
}

const updatePosition = (editor: Editor, element: HTMLElement) => {
  const virtualElement = {
    getBoundingClientRect: () => posToDOMRect(editor.view, editor.state.selection.from, editor.state.selection.to)
  }

  computePosition(virtualElement, element, {
    placement: 'bottom-start',
    strategy: 'absolute',
    middleware: [shift(), flip()]
  }).then(({ x, y, strategy }) => {
    element.style.width = 'max-content'
    element.style.position = strategy
    element.style.left = `${x}px`
    element.style.top = `${y}px`
  })
}

// TipTap suggestion configuration
export const commandSuggestion: Omit<SuggestionOptions<Command, MentionNodeAttrs>, 'editor'> = {
  char: '/',
  startOfLine: true,
  items: ({ query }: { query: string }) => {
    try {
      return filterCommands({ query, maxResults: 8 })
    } catch (error) {
      logger.error('Error filtering commands:', error as Error)
      return []
    }
  },
  command: ({ editor, range, props }) => {
    editor.chain().focus().deleteRange(range).run()

    // Find the original command by id
    const command = COMMANDS.find((cmd) => cmd.id === props.id)
    if (command) {
      command.handler(editor)
    }
  },

  render: () => {
    let component

    return {
      onStart: (props) => {
        if (!props?.items || !props?.clientRect) {
          logger.warn('Invalid props in command suggestion onStart')
          return
        }

        component = new ReactRenderer(CommandListPopover, {
          props,
          editor: props.editor
        })
        component.element.style.position = 'absolute'

        document.body.appendChild(component.element)

        updatePosition(props.editor, component.element)
      },

      onUpdate: (props) => {
        if (!props?.items || !props.clientRect) return

        component.updateProps(props)
      },

      onKeyDown: (props) => {
        if (props.event.key === 'Escape') {
          component.destroy()

          return true
        }

        return component.ref?.onKeyDown(props.event)
      },

      onExit: () => {
        component.element.remove()
        component.destroy()
      }
    }
  }
}
