import { DocxLoader } from '@langchain/community/document_loaders/fs/docx'
import { EPubLoader } from '@langchain/community/document_loaders/fs/epub'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { PPTXLoader } from '@langchain/community/document_loaders/fs/pptx'
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio'
import { SitemapLoader } from '@langchain/community/document_loaders/web/sitemap'
import { FaissStore } from '@langchain/community/vectorstores/faiss'
import { Document } from '@langchain/core/documents' // <-- 引入 Document 类型
import { loggerService } from '@logger'
import { UrlSource } from '@main/utils/knowledge'
import { LoaderReturn } from '@shared/config/types'
import { FileMetadata, FileTypes, KnowledgeBaseParams } from '@types'
import { randomUUID } from 'crypto'
import { JSONLoader } from 'langchain/document_loaders/fs/json'
import { MultiFileLoader } from 'langchain/document_loaders/fs/multi_file'
import { TextLoader } from 'langchain/document_loaders/fs/text'

import { SplitterFactory } from '../splitter'
import { NoteLoader } from './NoteLoader'
import { YoutubeLoader } from './YoutubeLoader'

const logger = loggerService.withContext('KnowledgeService File Loader')

/**
 * 为文档数组中的每个文档的 metadata 添加类型信息。
 * @param docs - 要格式化的 Document 数组。
 * @param type - 要添加到 metadata 中的类型字符串。
 * @returns 带有更新后 metadata 的新 Document 数组。
 */
function formatDocument(docs: Document[], type: string): Document[] {
  return docs.map((doc) => {
    return {
      ...doc,
      metadata: {
        ...doc.metadata,
        type: type
      }
    }
  })
}

export async function addFileLoader(
  base: KnowledgeBaseParams,
  vectorStore: FaissStore,
  file: FileMetadata
): Promise<LoaderReturn> {
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
      // .doc support might be limited and relies on external tools.
      // Assuming DocxLoader handles it or a specific setup exists.
      loaderInstance = new DocxLoader(file.path)
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
      let docs = await loaderInstance.load()

      docs = formatDocument(docs, specificLoaderType)
      const splitter = SplitterFactory.create({
        chunkSize: base.chunkSize,
        chunkOverlap: base.chunkOverlap
      })
      const splitterResults = await splitter.splitDocuments(docs)
      const ids = splitterResults.map(() => randomUUID())
      await vectorStore.addDocuments(splitterResults, { ids: ids })
      return {
        entriesAdded: docs.length,
        uniqueId: ids[0],
        uniqueIds: ids,
        loaderType: specificLoaderType
      }
    } catch (error) {
      logger.error(`Error loading or processing file ${file.path} with loader ${specificLoaderType}: ${error}`)
    }
  }

  return {
    entriesAdded: 0,
    uniqueId: '',
    uniqueIds: [],
    loaderType: specificLoaderType
  }
}

export async function addWebLoader(
  base: KnowledgeBaseParams,
  vectorStore: FaissStore,
  url: string,
  source: UrlSource
): Promise<LoaderReturn> {
  let loaderInstance: CheerioWebBaseLoader | YoutubeLoader | undefined
  switch (source) {
    case 'normal':
      loaderInstance = new CheerioWebBaseLoader(url)
      break
    case 'youtube':
      loaderInstance = YoutubeLoader.createFromUrl(url, {
        addVideoInfo: true,
        transcriptFormat: 'srt',
        language: 'zh'
      })
      break
    default:
      break
  }
  if (loaderInstance) {
    try {
      let docs = await loaderInstance.load()

      docs = formatDocument(docs, source)
      const splitter = SplitterFactory.create({
        chunkSize: base.chunkSize,
        chunkOverlap: base.chunkOverlap,
        type: source === 'youtube' ? 'srt' : 'recursive'
      })
      const splitterResults = await splitter.splitDocuments(docs)
      const ids = splitterResults.map(() => randomUUID())
      await vectorStore.addDocuments(splitterResults, { ids: ids })
      return {
        entriesAdded: docs.length,
        uniqueId: ids[0],
        uniqueIds: ids,
        loaderType: source
      }
    } catch (error) {
      logger.error(`Error loading or processing website ${url} with loader ${source}: ${error}`)
    }
  }

  return {
    entriesAdded: 0,
    uniqueId: '',
    uniqueIds: [],
    loaderType: source
  }
}

export async function addSitemapLoader(
  base: KnowledgeBaseParams,
  vectorStore: FaissStore,
  url: string
): Promise<LoaderReturn> {
  const loaderInstance = new SitemapLoader(url)
  try {
    let docs = await loaderInstance.load()

    docs = formatDocument(docs, 'sitemap')
    const splitter = SplitterFactory.create({ chunkSize: base.chunkSize, chunkOverlap: base.chunkOverlap })
    const splitterResults = await splitter.splitDocuments(docs)
    const ids = splitterResults.map(() => randomUUID())
    await vectorStore.addDocuments(splitterResults, { ids: ids })
    return {
      entriesAdded: docs.length,
      uniqueId: ids[0],
      uniqueIds: ids,
      loaderType: 'sitemap'
    }
  } catch (error) {
    logger.error(`Error loading or processing website ${url} with loader sitemap: ${error}`)
  }
  return {
    entriesAdded: 0,
    uniqueId: '',
    uniqueIds: [],
    loaderType: 'sitemap'
  }
}

export async function addNoteLoader(
  base: KnowledgeBaseParams,
  vectorStore: FaissStore,
  content: string,
  sourceUrl: string
): Promise<LoaderReturn> {
  const loaderInstance = new NoteLoader(content, sourceUrl)
  try {
    let docs = await loaderInstance.load()

    docs = formatDocument(docs, 'note')
    const splitter = SplitterFactory.create({ chunkSize: base.chunkSize, chunkOverlap: base.chunkOverlap })
    const splitterResults = await splitter.splitDocuments(docs)
    const ids = splitterResults.map(() => randomUUID())
    await vectorStore.addDocuments(splitterResults, { ids: ids })
    return {
      entriesAdded: docs.length,
      uniqueId: ids[0],
      uniqueIds: ids,
      loaderType: 'note'
    }
  } catch (error) {
    logger.error(`Error loading or processing note ${sourceUrl} with loader note: ${error}`)
  }
  return {
    entriesAdded: 0,
    uniqueId: '',
    uniqueIds: [],
    loaderType: 'note'
  }
}

export async function addVideoLoader(
  base: KnowledgeBaseParams,
  vectorStore: FaissStore,
  files: FileMetadata[]
): Promise<LoaderReturn> {
  const srtFile = files.find((f) => f.type === FileTypes.TEXT)
  const videoFile = files.find((f) => f.type === FileTypes.VIDEO)
  if (!srtFile || !videoFile) {
    return {
      entriesAdded: 0,
      uniqueId: '',
      uniqueIds: [],
      loaderType: 'unknown'
    }
  }

  const loaderInstance = new TextLoader(srtFile.path)
  try {
    const originalDocs: Document[] = await loaderInstance.load()
    const docsWithVideoMeta = originalDocs.map((doc) => {
      return new Document({
        ...doc,
        metadata: {
          ...doc.metadata,
          video: {
            path: videoFile.path,
            name: videoFile.origin_name
          }
        }
      })
    })
    const docs = formatDocument(docsWithVideoMeta, 'video')
    const splitter = SplitterFactory.create({
      chunkSize: base.chunkSize,
      chunkOverlap: base.chunkOverlap,
      type: 'srt'
    })
    const splitterResults = await splitter.splitDocuments(docs)
    const ids = splitterResults.map(() => randomUUID())
    await vectorStore.addDocuments(splitterResults, { ids: ids })
    return {
      entriesAdded: splitterResults.length,
      uniqueId: ids[0],
      uniqueIds: ids,
      loaderType: 'video'
    }
  } catch (error) {
    logger.error(`Error loading or processing file ${srtFile.path} with loader video: ${error}`)
  }
  return {
    entriesAdded: 0,
    uniqueId: '',
    uniqueIds: [],
    loaderType: 'unknown'
  }
}

export async function addDirectoryLoader(
  base: KnowledgeBaseParams,
  vectorStore: FaissStore,
  files: FileMetadata[]
): Promise<LoaderReturn> {
  try {
    // 根据文件扩展名配置不同的 loader
    const loaderMap = {
      '.txt': (path: string) => new TextLoader(path),
      '.md': (path: string) => new TextLoader(path),
      '.json': (path: string) => new JSONLoader(path),
      '.pdf': (path: string) => new PDFLoader(path),
      '.docx': (path: string) => new DocxLoader(path),
      '.doc': (path: string) => new DocxLoader(path),
      '.pptx': (path: string) => new PPTXLoader(path),
      '.epub': (path: string) => new EPubLoader(path)
    }

    const filePaths = files.map((file) => file.path)

    const multiFileLoader = new MultiFileLoader(filePaths, loaderMap)
    let docs = await multiFileLoader.load()

    // 为所有文档添加类型信息
    docs = formatDocument(docs, 'directory')

    const splitter = SplitterFactory.create({
      chunkSize: base.chunkSize,
      chunkOverlap: base.chunkOverlap
    })

    const splitterResults = await splitter.splitDocuments(docs)
    const ids = splitterResults.map(() => randomUUID())
    await vectorStore.addDocuments(splitterResults, { ids: ids })

    return {
      entriesAdded: docs.length,
      uniqueId: ids[0],
      uniqueIds: ids,
      loaderType: 'directory'
    }
  } catch (error) {
    logger.error(`Error loading or processing directory  ${error}`)
    return {
      entriesAdded: 0,
      uniqueId: '',
      uniqueIds: [],
      loaderType: 'directory'
    }
  }
}
