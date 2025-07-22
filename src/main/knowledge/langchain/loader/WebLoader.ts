import { BaseDocumentLoader } from '@langchain/core/document_loaders/base'
import { Document } from '@langchain/core/documents'
import { convert } from 'html-to-text'

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

type getSafeResponsePartial = {
  headers: Headers
  statusCode: number
}

function isValidURL(candidateUrl: string) {
  try {
    const url = new URL(candidateUrl)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

async function getSafe(
  url: string,
  options: { headers?: Record<string, string>; format: 'text' }
): Promise<{ body: string } & getSafeResponsePartial> {
  const headers = options?.headers ?? {}
  headers['User-Agent'] = headers['User-Agent'] ?? DEFAULT_USER_AGENT

  const response = await fetch(url, { headers })
  if (response.status !== 200) throw new Error(`Failed to fetch URL '${url}'. Got status code ${response.status}.`)

  return {
    body: await response.text(),
    statusCode: response.status,
    headers: response.headers
  }
}

export class WebLoader extends BaseDocumentLoader {
  private readonly url: string
  constructor(public _url: string) {
    super()
    this.url = _url
  }

  /**
   * A protected method that takes a `raw` string as a parameter and returns
   * a promise that resolves to an array containing the raw text as a single
   * element.
   * @param raw The raw text to be parsed.
   * @returns A promise that resolves to an array containing the raw text as a single element.
   */
  protected async parse(raw: string): Promise<string[]> {
    return [raw]
  }

  public async load(): Promise<Document[]> {
    const metadata = { source: this.url }
    const data = isValidURL(this.url) ? (await getSafe(this.url, { format: 'text' })).body : this._url
    const text = convert(data, {
      wordwrap: false,
      preserveNewlines: false
    }).replace(/(?:https?|ftp):\/\/[\n\S]+/g, '')

    const parsed = await this.parse(text)
    parsed.forEach((pageContent, i) => {
      if (typeof pageContent !== 'string') {
        throw new Error(`Expected string, at position ${i} got ${typeof pageContent}`)
      }
    })

    return parsed.map(
      (pageContent, i) =>
        new Document({
          pageContent,
          metadata:
            parsed.length === 1
              ? metadata
              : {
                  ...metadata,
                  line: i + 1
                }
        })
    )
  }
}
