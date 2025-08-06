export interface RichEditorProps {
  /** Initial content for the editor (can be markdown or HTML) */
  initialContent?: string
  /** Placeholder text when editor is empty */
  placeholder?: string
  /** Callback when content changes (plain text) */
  onContentChange?: (content: string) => void
  /** Callback when HTML content changes */
  onHtmlChange?: (html: string) => void
  /** Callback when Markdown content changes */
  onMarkdownChange?: (markdown: string) => void
  /** Whether the editor is editable */
  editable?: boolean
  /** Custom CSS class name */
  className?: string
  /** Whether to show the toolbar */
  showToolbar?: boolean
  /** Minimum height of the editor */
  minHeight?: number
  /** Maximum height of the editor */
  maxHeight?: number
  /** Available toolbar tools */
  toolbarItems?: ToolbarItem[]
  /** Whether initial content is markdown (default: auto-detect) */
  isMarkdown?: boolean
}

export interface ToolbarItem {
  /** Unique identifier for the toolbar item */
  id: string
  /** Type of toolbar item */
  type: 'button' | 'divider' | 'dropdown'
  /** Display label */
  label?: string
  /** Icon component or icon name */
  icon?: React.ComponentType | string
  /** Click handler for buttons */
  onClick?: () => void
  /** Whether the item is active/pressed */
  active?: boolean
  /** Whether the item is disabled */
  disabled?: boolean
  /** Dropdown options (for dropdown type) */
  options?: ToolbarDropdownOption[]
}

export interface ToolbarDropdownOption {
  /** Option value */
  value: string
  /** Option label */
  label: string
  /** Option icon */
  icon?: React.ComponentType | string
  /** Click handler */
  onClick: () => void
}

export interface RichEditorRef {
  /** Get current editor content as plain text */
  getContent: () => string
  /** Get current editor content as HTML */
  getHtml: () => string
  /** Get current editor content as Markdown */
  getMarkdown: () => string
  /** Set editor content (plain text) */
  setContent: (content: string) => void
  /** Set editor HTML content */
  setHtml: (html: string) => void
  /** Set editor Markdown content */
  setMarkdown: (markdown: string) => void
  /** Focus the editor */
  focus: () => void
  /** Clear all content */
  clear: () => void
  /** Insert text at current cursor position */
  insertText: (text: string) => void
  /** Execute a formatting command */
  executeCommand: (command: string, value?: any) => void
  /** Get preview text from current content */
  getPreviewText: (maxLength?: number) => string
}

export interface FormattingState {
  /** Whether bold is active */
  isBold: boolean
  /** Whether bold command can be executed */
  canBold: boolean
  /** Whether italic is active */
  isItalic: boolean
  /** Whether italic command can be executed */
  canItalic: boolean
  /** Whether underline is active */
  isUnderline: boolean
  /** Whether underline command can be executed */
  canUnderline: boolean
  /** Whether strike is active */
  isStrike: boolean
  /** Whether strike command can be executed */
  canStrike: boolean
  /** Whether code is active */
  isCode: boolean
  /** Whether code command can be executed */
  canCode: boolean
  /** Whether marks can be cleared */
  canClearMarks: boolean
  /** Whether paragraph is active */
  isParagraph: boolean
  /** Whether heading level 1 is active */
  isHeading1: boolean
  /** Whether heading level 2 is active */
  isHeading2: boolean
  /** Whether heading level 3 is active */
  isHeading3: boolean
  /** Whether heading level 4 is active */
  isHeading4: boolean
  /** Whether heading level 5 is active */
  isHeading5: boolean
  /** Whether heading level 6 is active */
  isHeading6: boolean
  /** Whether bullet list is active */
  isBulletList: boolean
  /** Whether ordered list is active */
  isOrderedList: boolean
  /** Whether code block is active */
  isCodeBlock: boolean
  /** Whether blockquote is active */
  isBlockquote: boolean
  /** Whether undo can be executed */
  canUndo: boolean
  /** Whether redo can be executed */
  canRedo: boolean
}

export type FormattingCommand =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strike'
  | 'code'
  | 'clearMarks'
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'heading4'
  | 'heading5'
  | 'heading6'
  | 'bulletList'
  | 'orderedList'
  | 'codeBlock'
  | 'blockquote'
  | 'undo'
  | 'redo'

export interface ToolbarProps {
  /** Editor instance ref */
  editor: any // TipTap Editor instance
  /** Custom toolbar items */
  items?: ToolbarItem[]
  /** Current formatting state */
  formattingState: FormattingState
  /** Callback when formatting command is executed */
  onCommand: (command: FormattingCommand) => void
}

// Command System Types for Slash Commands

export interface Command {
  /** Unique identifier for the command */
  id: string
  /** Display title for the command */
  title: string
  /** Description of what the command does */
  description: string
  /** Search keywords for filtering */
  keywords: string[]
  /** Command category for grouping */
  category: CommandCategory
  /** Icon component or icon name */
  icon?: React.ComponentType | string
  /** Handler function to execute the command */
  handler: (editor: any) => void
  /** Whether the command is available in current context */
  isAvailable?: (editor: any) => boolean
}

export interface CommandCategory {
  /** Category identifier */
  id: string
  /** Display label for the category */
  label: string
  /** Category priority for sorting */
  priority: number
}

export interface CommandSuggestion {
  /** Range where the suggestion was triggered */
  range: Range
  /** Current query text after the trigger character */
  query: string
  /** Text content of the suggestion */
  text: string
  /** Whether suggestion is active */
  active: boolean
}

export interface CommandListProps {
  /** List of filtered commands to display */
  commands: Command[]
  /** Currently selected command index */
  selectedIndex: number
  /** Callback when command is selected */
  onSelect: (command: Command) => void
  /** Callback when selection changes via keyboard */
  onSelectionChange: (index: number) => void
}

export interface CommandFilterOptions {
  /** Query string to filter commands */
  query: string
  /** Category to filter by */
  category?: string
  /** Current editor state for availability checks */
  editor?: any
}
