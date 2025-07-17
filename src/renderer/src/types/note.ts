export type NoteType = 'note' | 'folder'

export interface Note {
  id: string
  title: string
  content: string
  type: NoteType
  parentId?: string // For folder hierarchy
  tags?: string[]
  created_at: number
  updated_at: number
  isStarred?: boolean
  isArchived?: boolean
  wordCount?: number
  readingTime?: number // in minutes
  metadata?: {
    lastCursorPosition?: number
    isFullscreen?: boolean
    fontSize?: number
    theme?: string
  }
}

export interface NoteFolder {
  id: string
  name: string
  type: 'folder'
  parentId?: string
  created_at: number
  updated_at: number
  isExpanded?: boolean
  color?: string
}

export interface NoteFilter {
  search?: string
  tags?: string[]
  isStarred?: boolean
  isArchived?: boolean
  parentId?: string
  dateRange?: {
    start: number
    end: number
  }
}

export interface NoteSortOption {
  field: 'title' | 'created_at' | 'updated_at' | 'wordCount'
  order: 'asc' | 'desc'
}

export interface NoteExportOptions {
  format: 'markdown' | 'html' | 'pdf' | 'json'
  includeMetadata?: boolean
  includeTags?: boolean
  includeArchived?: boolean
}

export interface NoteImportOptions {
  format: 'markdown' | 'html' | 'json'
  targetFolderId?: string
  preserveStructure?: boolean
  mergeTags?: boolean
}

export interface NoteStats {
  totalNotes: number
  totalFolders: number
  totalWords: number
  totalReadingTime: number
  recentActivity: {
    date: string
    count: number
  }[]
}

export interface NoteEditorConfig {
  theme: 'light' | 'dark' | 'auto'
  fontSize: number
  fontFamily: string
  lineHeight: number
  tabSize: number
  wordWrap: boolean
  showLineNumbers: boolean
  enableVim: boolean
  enableEmmet: boolean
  autoSave: boolean
  autoSaveInterval: number // in milliseconds
  spellCheck: boolean
  typewriterMode: boolean
  focusMode: boolean
  previewMode: 'split' | 'preview' | 'source'
}