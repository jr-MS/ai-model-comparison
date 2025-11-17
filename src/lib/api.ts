import { ModelConfig, ProviderType } from './types'

interface APIResponse {
  content: string
  tokenCount?: number
}

export async function callModel(
  config: ModelConfig,
  prompt: string
): Promise<APIResponse> {
  switch (config.provider) {
    case 'openai':
      return callOpenAI(config, prompt)
    case 'azure':
      return callAzureOpenAI(config, prompt)
    case 'gemini':
      return callGemini(config, prompt)
    case 'aws':
      return callAWSBedrock(config, prompt)
    default:
      throw new Error(`Unknown provider: ${config.provider}`)
  }
}

async function callOpenAI(
  config: ModelConfig,
  prompt: string
): Promise<APIResponse> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.modelName,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
    }),
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
  prompt: string
): Promise<APIResponse> {
  if (!config.endpoint) {
    throw new Error('Azure endpoint is required')
  }

  const endpoint = config.endpoint.endsWith('/')
    ? config.endpoint.slice(0, -1)
    : config.endpoint

  const url = `${endpoint}/openai/deployments/${config.modelName}/chat/completions?api-version=2024-02-15-preview`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.apiKey,
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000,
    }),
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
  prompt: string
): Promise<APIResponse> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.modelName}:generateContent?key=${config.apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
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
  prompt: string
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
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
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
      return 'bg-green-100 text-green-800 border-green-200'
    case 'azure':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'gemini':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'aws':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}
