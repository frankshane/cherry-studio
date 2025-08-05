export interface RichEditorProps {
  /** Initial content for the editor */
  initialContent?: string
  /** Placeholder text when editor is empty */
  placeholder?: string
  /** Callback when content changes */
  onContentChange?: (content: string) => void
  /** Callback when HTML content changes */
  onHtmlChange?: (html: string) => void
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
  /** Set editor content */
  setContent: (content: string) => void
  /** Set editor HTML content */
  setHtml: (html: string) => void
  /** Focus the editor */
  focus: () => void
  /** Clear all content */
  clear: () => void
  /** Insert text at current cursor position */
  insertText: (text: string) => void
  /** Execute a formatting command */
  executeCommand: (command: string, value?: any) => void
}

export interface FormattingState {
  /** Whether bold is active */
  bold: boolean
  /** Whether italic is active */
  italic: boolean
  /** Whether underline is active */
  underline: boolean
  /** Current heading level (0 for paragraph) */
  headingLevel: number
  /** Whether bullet list is active */
  bulletList: boolean
  /** Whether ordered list is active */
  orderedList: boolean
}

export type FormattingCommand = 'bold' | 'italic' | 'underline' | 'heading' | 'bulletList' | 'orderedList' | 'paragraph'

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
