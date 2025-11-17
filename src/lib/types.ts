export type ProviderType = 'openai' | 'azure' | 'gemini' | 'aws'

export interface ModelConfig {
  id: string
  name: string
  provider: ProviderType
  apiKey: string
  endpoint?: string
  modelName: string
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  modelId?: string
  responseTime?: number
  tokenCount?: number
  error?: string
  status?: 'loading' | 'success' | 'error'
}

export interface Conversation {
  modelId: string
  messages: ChatMessage[]
}
