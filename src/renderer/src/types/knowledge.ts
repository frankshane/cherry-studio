import { ApiClient, Model } from '@types'

import { FileMetadata } from './file'

export type KnowledgeItemType = 'file' | 'url' | 'note' | 'sitemap' | 'directory' | 'memory' | 'video'

export type KnowledgeItem = {
  id: string
  baseId?: string
  uniqueId?: string
  uniqueIds?: string[]
  type: KnowledgeItemType
  content: string | FileMetadata | FileMetadata[]
  remark?: string
  created_at: number
  updated_at: number
  processingStatus?: ProcessingStatus
  processingProgress?: number
  processingError?: string
  retryCount?: number
  isPreprocessed?: boolean
}

export interface KnowledgeBase {
  id: string
  name: string
  model: Model
  dimensions?: number
  description?: string
  items: KnowledgeItem[]
  created_at: number
  updated_at: number
  version: number
  documentCount?: number
  chunkSize?: number
  chunkOverlap?: number
  threshold?: number
  rerankModel?: Model
  // topN?: number
  // preprocessing?: boolean
  preprocessOrOcrProvider?: {
    type: 'preprocess' | 'ocr'
    provider: PreprocessProvider | OcrProvider
  }
  framework: 'embedjs' | 'langchain'
  // default is vector
  retriever?: 'vector' | 'bm25' | 'hybrid'
}

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface PreprocessProvider {
  id: string
  name: string
  apiKey?: string
  apiHost?: string
  model?: string
  options?: any
}

export interface OcrProvider {
  id: string
  name: string
  apiKey?: string
  apiHost?: string
  model?: string
  options?: any
}

export type KnowledgeBaseParams = {
  id: string
  dimensions?: number
  chunkSize?: number
  chunkOverlap?: number
  embedApiClient: ApiClient
  rerankApiClient?: ApiClient
  documentCount?: number
  // preprocessing?: boolean
  preprocessOrOcrProvider?: {
    type: 'preprocess' | 'ocr'
    provider: PreprocessProvider | OcrProvider
  }
  framework: 'embedjs' | 'langchain'
  retriever?: 'vector' | 'bm25' | 'hybrid'
}

export type KnowledgeReference = {
  id: number
  content: string
  sourceUrl: string
  type: KnowledgeItemType
  file?: FileMetadata
  metadata?: Record<string, any>
}

export interface KnowledgeSearchResult {
  pageContent: string
  score: number
  metadata: Record<string, any>
}
