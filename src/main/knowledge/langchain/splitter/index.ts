import { RecursiveCharacterTextSplitter, TextSplitter } from '@langchain/textsplitters'

export type SplitterConfig = {
  chunkSize?: number
  chunkOverlap?: number
}
export class SplitterFactory {
  /**
   * Creates a TextSplitter instance based on the provided configuration.
   * @param config - The configuration object specifying the splitter type and its parameters.
   * @returns An instance of a TextSplitter, or null if no splitting is required.
   */
  public static create(config: SplitterConfig): TextSplitter {
    return new RecursiveCharacterTextSplitter({
      chunkSize: config.chunkSize,
      chunkOverlap: config.chunkOverlap
    })
  }
}
