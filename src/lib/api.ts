import { ModelConfig, ProviderType, Message } from './types'

interface APIResponse {
  content: string
  tokenCount?: number
}

export async function callModel(
  config: ModelConfig,
  messages: Message[]
): Promise<APIResponse> {
  switch (config.provider) {
    case 'openai':
      return callOpenAI(config, messages)
    case 'azure':
      return callAzureOpenAI(config, messages)
    case 'gemini':
      return callGemini(config, messages)
    case 'aws':
      return callAWSBedrock(config, messages)
    default:
      throw new Error(`Unknown provider: ${config.provider}`)
  }
}

async function callOpenAI(
  config: ModelConfig,
  messages: Message[]
): Promise<APIResponse> {
  const isNewerModel = config.modelName.includes('2024-11-20') || 
                       config.modelName.includes('gpt-4o-mini-2024-07-18') ||
                       config.modelName.includes('o1') ||
                       config.modelName.includes('o3')

  const requestBody: Record<string, unknown> = {
    model: config.modelName,
    messages: messages,
  }

  if (isNewerModel) {
    requestBody.max_completion_tokens = 2000
  } else {
    requestBody.max_tokens = 2000
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      error.error?.message || `OpenAI API error: ${response.statusText}`
    )
  }

  const data = await response.json()
  return {
    content: data.choices[0]?.message?.content || '',
    tokenCount: data.usage?.total_tokens,
  }
}

async function callAzureOpenAI(
  config: ModelConfig,
  messages: Message[]
): Promise<APIResponse> {
  if (!config.endpoint) {
    throw new Error('Azure endpoint is required')
  }

  const endpoint = config.endpoint.endsWith('/')
    ? config.endpoint.slice(0, -1)
    : config.endpoint

  const url = `${endpoint}/openai/deployments/${config.modelName}/chat/completions?api-version=2024-02-15-preview`

  const isNewerModel = config.modelName.includes('2024-11-20') || 
                       config.modelName.includes('gpt-4o-mini-2024-07-18') ||
                       config.modelName.includes('o1') ||
                       config.modelName.includes('o3') ||
                       config.modelName.includes('gpt-4o') ||
                       config.modelName.includes('gpt-5')

  const requestBody: Record<string, unknown> = {
    messages: messages,
  }

  if (isNewerModel) {
    requestBody.max_completion_tokens = 2000
  } else {
    requestBody.max_tokens = 2000
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.apiKey,
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      error.error?.message || `Azure OpenAI API error: ${response.statusText}`
    )
  }

  const data = await response.json()
  return {
    content: data.choices[0]?.message?.content || '',
    tokenCount: data.usage?.total_tokens,
  }
}

async function callGemini(
  config: ModelConfig,
  messages: Message[]
): Promise<APIResponse> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.modelName}:generateContent?key=${config.apiKey}`

  const contents = messages.map((msg) => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }))

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: contents,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      error.error?.message || `Gemini API error: ${response.statusText}`
    )
  }

  const data = await response.json()
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  return {
    content,
    tokenCount: data.usageMetadata?.totalTokenCount,
  }
}

async function callAWSBedrock(
  config: ModelConfig,
  messages: Message[]
): Promise<APIResponse> {
  if (!config.endpoint) {
    throw new Error('AWS Bedrock endpoint is required')
  }

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: config.apiKey,
    },
    body: JSON.stringify({
      modelId: config.modelName,
      contentType: 'application/json',
      accept: '*/*',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 2000,
        messages: messages,
      }),
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(
      error.message || `AWS Bedrock API error: ${response.statusText}`
    )
  }

  const data = await response.json()
  
  let content = ''
  let tokenCount: number | undefined

  if (data.body) {
    const bodyData = JSON.parse(data.body)
    content = bodyData.content?.[0]?.text || ''
    tokenCount = bodyData.usage?.total_tokens
  } else if (data.content) {
    content = data.content?.[0]?.text || ''
    tokenCount = data.usage?.total_tokens
  }

  return {
    content,
    tokenCount,
  }
}

export function getProviderName(provider: ProviderType): string {
  switch (provider) {
    case 'openai':
      return 'OpenAI'
    case 'azure':
      return 'Azure OpenAI'
    case 'gemini':
      return 'Google Gemini'
    case 'aws':
      return 'AWS Bedrock'
    default:
      return provider
  }
}

export function getProviderColor(provider: ProviderType): string {
  switch (provider) {
    case 'openai':
      return 'bg-gradient-to-br from-emerald-50 to-green-100 text-emerald-700 border-emerald-300'
    case 'azure':
      return 'bg-gradient-to-br from-blue-50 to-cyan-100 text-blue-700 border-blue-300'
    case 'gemini':
      return 'bg-gradient-to-br from-purple-50 to-fuchsia-100 text-purple-700 border-purple-300'
    case 'aws':
      return 'bg-gradient-to-br from-orange-50 to-amber-100 text-orange-700 border-orange-300'
    default:
      return 'bg-gradient-to-br from-gray-50 to-slate-100 text-gray-700 border-gray-300'
  }
}
