import type { Embeddings } from '@langchain/core/embeddings'
import { OllamaEmbeddings } from '@langchain/ollama'
import { AzureOpenAIEmbeddings, OpenAIEmbeddings } from '@langchain/openai'
import { ApiClient } from '@types'

export default class EmbeddingsFactory {
  static create({ embedApiClient, dimensions }: { embedApiClient: ApiClient; dimensions?: number }): Embeddings {
    const batchSize = 10
    const { model, provider, apiKey, apiVersion, baseURL } = embedApiClient
    if (provider === 'ollama') {
      return new OllamaEmbeddings({
        model,
        baseUrl: baseURL
      })
    }
    if (apiVersion !== undefined) {
      return new AzureOpenAIEmbeddings({
        azureOpenAIApiKey: apiKey,
        azureOpenAIApiVersion: apiVersion,
        azureOpenAIApiDeploymentName: model,
        azureOpenAIEndpoint: baseURL,
        dimensions,
        batchSize
      })
    }
    return new OpenAIEmbeddings({
      model,
      apiKey,
      dimensions,
      batchSize,
      configuration: { baseURL }
    })
  }
}
