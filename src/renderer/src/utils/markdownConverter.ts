import { loggerService } from '@logger'
import { tables, TurndownPlugin } from '@truto/turndown-plugin-gfm'
import DOMPurify from 'dompurify'
import he from 'he'
import MarkdownIt from 'markdown-it'
import striptags from 'striptags'
import TurndownService from 'turndown'

const logger = loggerService.withContext('markdownConverter')

export interface TaskListOptions {
  label?: boolean
}

// Create markdown-it instance with task list plugin
const md = new MarkdownIt({
  html: true, // Enable HTML tags in source
  xhtmlOut: true, // Use '/' to close single tags (<br />)
  breaks: true, // Convert '\n' in paragraphs into <br>
  linkify: true, // Autoconvert URL-like text to links
  typographer: true // Enable smartypants and other sweet transforms
})

// Custom task list plugin for markdown-it
function taskListPlugin(md: MarkdownIt, options: TaskListOptions = {}) {
  const { label = false } = options
  md.core.ruler.after('inline', 'task_list', (state) => {
    const tokens = state.tokens
    let inside_task_list = false

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]

      if (token.type === 'bullet_list_open') {
        // Check if this list contains task items
        let hasTaskItems = false
        for (let j = i + 1; j < tokens.length && tokens[j].type !== 'bullet_list_close'; j++) {
          if (tokens[j].type === 'inline' && /^\s*\[[ x]\]\s/.test(tokens[j].content)) {
            hasTaskItems = true
            break
          }
        }

        if (hasTaskItems) {
          inside_task_list = true
          token.attrSet('data-type', 'taskList')
          token.attrSet('class', 'task-list')
        }
      } else if (token.type === 'bullet_list_close' && inside_task_list) {
        inside_task_list = false
      } else if (token.type === 'list_item_open' && inside_task_list) {
        token.attrSet('data-type', 'taskItem')
        token.attrSet('class', 'task-list-item')
      } else if (token.type === 'inline' && inside_task_list) {
        const match = token.content.match(/^(\s*)\[([x ])\]\s+(.*)/)
        if (match) {
          const [, , check, content] = match
          const isChecked = check.toLowerCase() === 'x'

          // Find the parent list item token
          for (let j = i - 1; j >= 0; j--) {
            if (tokens[j].type === 'list_item_open') {
              tokens[j].attrSet('data-checked', isChecked.toString())
              break
            }
          }

          // Replace content with checkbox HTML and text
          token.content = content

          // Create checkbox token
          const checkboxToken = new state.Token('html_inline', '', 0)

          if (label) {
            checkboxToken.content = `<label><input type="checkbox"${isChecked ? ' checked' : ''} disabled> ${content}</label>`
            token.children = [checkboxToken]
          } else {
            checkboxToken.content = `<input type="checkbox"${isChecked ? ' checked' : ''} disabled>`

            // Insert checkbox at the beginning of inline content
            const textToken = new state.Token('text', '', 0)
            textToken.content = ' ' + content

            token.children = [checkboxToken, textToken]
          }
        }
      }
    }
  })
}

md.use(taskListPlugin, {
  label: true
})

// Initialize turndown service
const turndownService = new TurndownService({
  headingStyle: 'atx', // Use # for headings
  hr: '---', // Use --- for horizontal rules
  bulletListMarker: '-', // Use - for bullet lists
  codeBlockStyle: 'fenced', // Use ``` for code blocks
  fence: '```', // Use ``` for code blocks
  emDelimiter: '*', // Use * for emphasis
  strongDelimiter: '**' // Use ** for strong
})

// Configure turndown rules for better conversion
turndownService.addRule('strikethrough', {
  filter: ['del', 's'],
  replacement: (content) => `~~${content}~~`
})

turndownService.addRule('underline', {
  filter: ['u'],
  replacement: (content) => `<u>${content}</u>`
})

// Keep math block containers intact so Turndown does not parse them
turndownService.keep((node: Node): boolean => {
  if (!(node instanceof Element)) return false
  return node.nodeName === 'DIV' && node.classList.contains('block-math-inner')
})

const taskListItemsPlugin: TurndownPlugin = (turndownService) => {
  turndownService.addRule('taskListItems', {
    filter: (node: Element) => {
      return node.nodeName === 'LI' && node.getAttribute && node.getAttribute('data-type') === 'taskItem'
    },
    replacement: (_content: string, node: Element) => {
      const checkbox = node.querySelector('input[type="checkbox"]') as HTMLInputElement | null
      const isChecked = checkbox?.checked || node.getAttribute('data-checked') === 'true'
      const textContent = node.textContent?.trim() || ''

      return '\n\n- ' + (isChecked ? '[x]' : '[ ]') + ' ' + textContent
    }
  })
  turndownService.addRule('taskList', {
    filter: (node: Element) => {
      return node.nodeName === 'UL' && node.getAttribute && node.getAttribute('data-type') === 'taskList'
    },
    replacement: (content: string) => {
      return content.trim()
    }
  })
}

turndownService.use([tables, taskListItemsPlugin])

/**
 * Converts HTML content to Markdown
 * @param html - HTML string to convert
 * @returns Markdown string
 */
export const htmlToMarkdown = (html: string | null | undefined): string => {
  if (!html || typeof html !== 'string') {
    return ''
  }

  try {
    return turndownService.turndown(html).trim()
  } catch (error) {
    logger.error('Error converting HTML to Markdown:', error as Error)
    return ''
  }
}

/**
 * Converts Markdown content to HTML
 * @param markdown - Markdown string to convert
 * @param options - Task list options
 * @returns HTML string
 */
export const markdownToHtml = (markdown: string | null | undefined): string => {
  if (!markdown || typeof markdown !== 'string') {
    return ''
  }

  try {
    return md.render(markdown)
  } catch (error) {
    logger.error('Error converting Markdown to HTML:', error as Error)
    return ''
  }
}

/**
 * Sanitizes HTML content using DOMPurify
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return ''
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'br',
      'hr',
      'strong',
      'b',
      'em',
      'i',
      'u',
      's',
      'del',
      'ul',
      'ol',
      'li',
      'blockquote',
      'code',
      'pre',
      'a',
      'img',
      'table',
      'thead',
      'tbody',
      'tfoot',
      'tr',
      'td',
      'th',
      'input',
      'label'
    ],
    ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'class', 'id', 'colspan', 'rowspan', 'type', 'checked', 'disabled'],
    ALLOW_DATA_ATTR: true,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\\-]+(?:[^a-z+.\-:]|$))/i
  })
}

/**
 * Converts Markdown to safe HTML (combines conversion and sanitization)
 * @param markdown - Markdown string to convert
 * @returns Safe HTML string
 */
export const markdownToSafeHtml = (markdown: string): string => {
  const html = markdownToHtml(markdown)
  logger.debug('Generated HTML from markdown', { html, markdown })
  return sanitizeHtml(html)
}

/**
 * Gets plain text preview from Markdown content
 * @param markdown - Markdown string
 * @param maxLength - Maximum length for preview
 * @returns Plain text preview
 */
export const markdownToPreviewText = (markdown: string, maxLength: number = 50): string => {
  if (!markdown) return ''

  // Convert to HTML first, then strip tags
  const html = markdownToHtml(markdown)
  const textContent = he.decode(striptags(html)).replace(/\s+/g, ' ').trim()

  return textContent.length > maxLength ? `${textContent.slice(0, maxLength)}...` : textContent
}

/**
 * Checks if content is Markdown (contains Markdown syntax)
 * @param content - Content to check
 * @returns True if content appears to be Markdown
 */
export const isMarkdownContent = (content: string): boolean => {
  if (!content) return false

  // Check for common Markdown syntax
  const markdownPatterns = [
    /^#{1,6}\s/, // Headers
    /^\*\s|^-\s|^\+\s/, // Unordered lists
    /^\d+\.\s/, // Ordered lists
    /\*\*.*\*\*/, // Bold
    /\*.*\*/, // Italic
    /`.*`/, // Inline code
    /```/, // Code blocks
    /^>/, // Blockquotes
    /\[.*\]\(.*\)/, // Links
    /!\[.*\]\(.*\)/ // Images
  ]

  return markdownPatterns.some((pattern) => pattern.test(content))
}
