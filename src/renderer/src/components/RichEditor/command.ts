import { computePosition, flip, shift } from '@floating-ui/dom'
import { loggerService } from '@logger'
import type { Editor } from '@tiptap/core'
import type { MentionNodeAttrs } from '@tiptap/extension-mention'
import { posToDOMRect, ReactRenderer } from '@tiptap/react'
import type { SuggestionOptions } from '@tiptap/suggestion'
import type { LucideIcon } from 'lucide-react'
import {
  Calculator,
  Calendar,
  CheckCircle,
  Code,
  FileCode,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Link,
  List,
  ListOrdered,
  Minus,
  Quote,
  Table,
  Type,
  X
} from 'lucide-react'

import CommandListPopover from './CommandListPopover'

const logger = loggerService.withContext('RichEditor.Command')

export interface Command {
  id: string
  title: string
  description: string
  category: CommandCategory
  icon: LucideIcon
  keywords: string[]
  handler: (editor: Editor) => void
  isAvailable?: (editor: Editor) => boolean
}

export enum CommandCategory {
  TEXT = 'text',
  LISTS = 'lists',
  BLOCKS = 'blocks',
  MEDIA = 'media',
  STRUCTURE = 'structure',
  SPECIAL = 'special'
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
    icon: Type,
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
    icon: Heading1,
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
    icon: Heading2,
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
    icon: Heading3,
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
    icon: List,
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
    icon: ListOrdered,
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
    icon: FileCode,
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
    icon: Quote,
    keywords: ['quote', 'blockquote', 'citation'],
    handler: (editor: Editor) => {
      editor.chain().focus().toggleBlockquote().run()
    }
  },
  {
    id: 'divider',
    title: 'Divider',
    description: 'Add a horizontal line',
    category: CommandCategory.STRUCTURE,
    icon: Minus,
    keywords: ['divider', 'hr', 'line', 'separator'],
    handler: (editor: Editor) => {
      editor.chain().focus().setHorizontalRule().run()
    }
  },
  {
    id: 'image',
    title: 'Image',
    description: 'Insert an image',
    category: CommandCategory.MEDIA,
    icon: Image,
    keywords: ['image', 'img', 'picture', 'photo'],
    handler: (editor: Editor) => {
      const url = window.prompt('Enter image URL')
      if (url) {
        editor.chain().focus().setImage({ src: url }).run()
      }
    }
  },
  {
    id: 'link',
    title: 'Link',
    description: 'Add a link',
    category: CommandCategory.SPECIAL,
    icon: Link,
    keywords: ['link', 'url', 'href'],
    handler: (editor: Editor) => {
      const url = window.prompt('Enter URL')
      if (url) {
        editor.chain().focus().setLink({ href: url }).run()
      }
    }
  },
  {
    id: 'table',
    title: 'Table',
    description: 'Insert a table',
    category: CommandCategory.STRUCTURE,
    icon: Table,
    keywords: ['table', 'grid', 'rows', 'columns'],
    handler: (editor: Editor) => {
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    }
  },
  {
    id: 'taskList',
    title: 'Task List',
    description: 'Create a checklist',
    category: CommandCategory.LISTS,
    icon: CheckCircle,
    keywords: ['task', 'todo', 'checklist', 'checkbox'],
    handler: (editor: Editor) => {
      editor.chain().focus().toggleTaskList().run()
    }
  },
  {
    id: 'inlineCode',
    title: 'Inline Code',
    description: 'Add inline code',
    category: CommandCategory.SPECIAL,
    icon: Code,
    keywords: ['code', 'inline', 'monospace'],
    handler: (editor: Editor) => {
      editor.chain().focus().toggleCode().run()
    }
  },
  {
    id: 'hardBreak',
    title: 'Line Break',
    description: 'Insert a line break',
    category: CommandCategory.STRUCTURE,
    icon: X,
    keywords: ['break', 'br', 'newline'],
    handler: (editor: Editor) => {
      editor.chain().focus().setHardBreak().run()
    }
  },
  {
    id: 'math',
    title: 'Math Formula',
    description: 'Insert mathematical formula',
    category: CommandCategory.SPECIAL,
    icon: Calculator,
    keywords: ['math', 'formula', 'equation', 'latex'],
    handler: (editor: Editor) => {
      const formula = window.prompt('Enter LaTeX formula')
      if (formula) {
        editor.chain().focus().insertContent(`$$${formula}$$`).run()
      }
    }
  },
  {
    id: 'date',
    title: 'Date',
    description: 'Insert current date',
    category: CommandCategory.SPECIAL,
    icon: Calendar,
    keywords: ['date', 'time', 'today'],
    handler: (editor: Editor) => {
      const today = new Date().toLocaleDateString()
      editor.chain().focus().insertContent(today).run()
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
    let component: ReactRenderer<any, any>

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
        const element = component.element as HTMLElement
        element.style.position = 'absolute'

        document.body.appendChild(element)

        updatePosition(props.editor, element)
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
        const element = component.element as HTMLElement
        element.remove()
        component.destroy()
      }
    }
  }
}
