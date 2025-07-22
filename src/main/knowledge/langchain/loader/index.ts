import { DocxLoader } from '@langchain/community/document_loaders/fs/docx'
import { EPubLoader } from '@langchain/community/document_loaders/fs/epub'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { PPTXLoader } from '@langchain/community/document_loaders/fs/pptx'
import { SitemapLoader } from '@langchain/community/document_loaders/web/sitemap'
import { LibSQLVectorStore } from '@langchain/community/vectorstores/libsql'
import { loggerService } from '@main/services/LoggerService'
import { LoaderReturn } from '@shared/config/types'
import { FileMetadata } from '@types'
import { JSONLoader } from 'langchain/document_loaders/fs/json'
import { TextLoader } from 'langchain/document_loaders/fs/text'

import { NoteLoader } from './NoteLoader'
import { WebLoader } from './WebLoader'

const logger = loggerService.withContext('KnowledgeService File Loader')

export async function addFileLoader(vectorStore: LibSQLVectorStore, file: FileMetadata): Promise<LoaderReturn> {
  const fileExt = file.ext.toLowerCase()
  let loaderInstance: TextLoader | PDFLoader | PPTXLoader | DocxLoader | JSONLoader | EPubLoader | undefined
  let specificLoaderType: string = 'unknown'

  switch (fileExt) {
    case '.pdf':
      loaderInstance = new PDFLoader(file.path)
      specificLoaderType = 'pdf'
      break
    case '.txt':
      loaderInstance = new TextLoader(file.path)
      specificLoaderType = 'text'
      break
    case '.pptx':
      loaderInstance = new PPTXLoader(file.path)
      specificLoaderType = 'pptx'
      break
    case '.docx':
      loaderInstance = new DocxLoader(file.path)
      specificLoaderType = 'docx'
      break
    case '.doc':
      loaderInstance = new DocxLoader(file.path, { type: 'doc' })
      specificLoaderType = 'doc'
      break
    case '.json':
      loaderInstance = new JSONLoader(file.path)
      specificLoaderType = 'json'
      break
    case '.epub':
      loaderInstance = new EPubLoader(file.path)
      specificLoaderType = 'epub'
      break
    case '.md':
      loaderInstance = new TextLoader(file.path)
      specificLoaderType = 'markdown'
      break
    default:
      loaderInstance = new TextLoader(file.path)
      specificLoaderType = fileExt.replace('.', '') || 'unknown'
      break
  }

  if (loaderInstance) {
    try {
      const docs = await loaderInstance.load()
      const ids = await vectorStore.addDocuments(docs)
      return {
        entriesAdded: docs.length,
        uniqueId: ids && ids.length > 0 ? ids[0] : '',
        uniqueIds: ids || [],
        loaderType: specificLoaderType
      }
    } catch (error) {
      logger.error(`Error loading or processing file ${file.path} with loader ${specificLoaderType}:`, error)
    }
  }

  return {
    entriesAdded: 0,
    uniqueId: '',
    uniqueIds: [],
    loaderType: specificLoaderType
  }
}

export async function addWebLoader(vectorStore: LibSQLVectorStore, url: string, source: string): Promise<LoaderReturn> {
  let loaderInstance: WebLoader | undefined
  switch (source) {
    case 'normal':
      loaderInstance = new WebLoader(url)
  }
  if (loaderInstance) {
    try {
      const docs = await loaderInstance.load()
      const ids = await vectorStore.addDocuments(docs)
      return {
        entriesAdded: docs.length,
        uniqueId: ids && ids.length > 0 ? ids[0] : '',
        uniqueIds: ids || [],
        loaderType: source
      }
    } catch (error) {
      logger.error(`Error loading or processing website ${url} with loader ${source}:`, error)
    }
  }

  return {
    entriesAdded: 0,
    uniqueId: '',
    uniqueIds: [],
    loaderType: source
  }
}

export async function addSitemapLoader(vectorStore: LibSQLVectorStore, url: string): Promise<LoaderReturn> {
  const loaderInstance = new SitemapLoader(url)
  try {
    const docs = await loaderInstance.load()
    const ids = await vectorStore.addDocuments(docs)
    return {
      entriesAdded: docs.length,
      uniqueId: ids && ids.length > 0 ? ids[0] : '',
      uniqueIds: ids || [],
      loaderType: 'sitemap'
    }
  } catch (error) {
    logger.error(`Error loading or processing website ${url} with loader sitemap:`, error)
  }
  return {
    entriesAdded: 0,
    uniqueId: '',
    uniqueIds: [],
    loaderType: 'sitemap'
  }
}

export async function addNoteLoader(
  vectorStore: LibSQLVectorStore,
  content: string,
  sourceUrl: string
): Promise<LoaderReturn> {
  const loaderInstance = new NoteLoader(content, sourceUrl)
  try {
    const docs = await loaderInstance.load()
    logger.info('addNoteLoader', docs)
    const ids = await vectorStore.addDocuments(docs)
    logger.info('addNoteLoader ids', ids)
    return {
      entriesAdded: docs.length,
      uniqueId: ids && ids.length > 0 ? ids[0] : '',
      uniqueIds: ids || [],
      loaderType: 'note'
    }
  } catch (error) {
    logger.error(`Error loading or processing note ${sourceUrl} with loader note:`, error)
  }
  return {
    entriesAdded: 0,
    uniqueId: '',
    uniqueIds: [],
    loaderType: 'note'
  }
}
