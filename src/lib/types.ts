export type ProviderType = 'openai' | 'azure' | 'gemini' | 'aws'

export interface ModelConfig {
  id: string
  name: string
  provider: ProviderType
  apiKey: string
  endpoint?: string
  modelName: string
}

export interface ModelResponse {
  modelId: string
  status: 'idle' | 'loading' | 'success' | 'error'
  content?: string
  error?: string
  responseTime?: number
  tokenCount?: number
}

export interface PromptHistory {
  id: string
  prompt: string
  timestamp: number
  responses: ModelResponse[]
}
