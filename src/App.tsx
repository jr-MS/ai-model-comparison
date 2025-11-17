import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { ModelConfig, ChatMessage, Conversation, Message } from './lib/types'
import { callModel } from './lib/api'
import { ModelConfigDialog } from './components/ModelConfigDialog'
import { ModelCard } from './components/ModelCard'
import { ChatPanel } from './components/ChatPanel'
import { Button } from './components/ui/button'
import { Textarea } from './components/ui/textarea'
import { ScrollArea } from './components/ui/scroll-area'
import { Plus, PaperPlaneRight, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Toaster } from './components/ui/sonner'

function App() {
  const [models, setModels] = useKV<ModelConfig[]>('ai-models', [])
  const [conversations, setConversations] = useKV<Conversation[]>(
    'conversations',
    []
  )
  const [prompt, setPrompt] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<ModelConfig | undefined>()
  const [isRunning, setIsRunning] = useState(false)

  const modelList = models || []
  const conversationList = conversations || []

  const handleSaveModel = (config: ModelConfig) => {
    setModels((currentModels) => {
      const safeModels = currentModels || []
      const existingIndex = safeModels.findIndex((m) => m.id === config.id)
      if (existingIndex >= 0) {
        const updated = [...safeModels]
        updated[existingIndex] = config
        return updated
      }
      return [...safeModels, config]
    })

    setConversations((currentConvs) => {
      const safeConvs = currentConvs || []
      const existingConv = safeConvs.find((c) => c.modelId === config.id)
      if (!existingConv) {
        return [...safeConvs, { modelId: config.id, messages: [] }]
      }
      return safeConvs
    })

    toast.success(
      editingModel ? 'Model updated successfully' : 'Model added successfully'
    )
  }

  const handleDeleteModel = (id: string) => {
    setModels((currentModels) => (currentModels || []).filter((m) => m.id !== id))
    setConversations((currentConvs) =>
      (currentConvs || []).filter((c) => c.modelId !== id)
    )
    toast.success('Model deleted')
  }

  const handleEditModel = (model: ModelConfig) => {
    setEditingModel(model)
    setDialogOpen(true)
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingModel(undefined)
    }
    setDialogOpen(open)
  }

  const handleClearChat = () => {
    setConversations((currentConvs) => {
      return (currentConvs || []).map((conv) => ({
        ...conv,
        messages: [],
      }))
    })
    toast.success('All conversations cleared')
  }

  const getAllMessages = (modelId: string): ChatMessage[] => {
    const conversation = conversationList.find((c) => c.modelId === modelId)
    return conversation?.messages || []
  }

  const getConversationHistory = (modelId: string): Message[] => {
    const allMessages = getAllMessages(modelId)
    return allMessages
      .filter((msg) => msg.status === 'success')
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))
  }

  const runModel = async (model: ModelConfig, userPrompt: string) => {
    const userMessageId = `msg-${Date.now()}-${model.id}`
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: userPrompt,
      timestamp: Date.now(),
    }

    const assistantMessageId = `msg-${Date.now() + 1}-${model.id}`
    const loadingMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      modelId: model.id,
      status: 'loading',
    }

    setConversations((currentConvs) => {
      const safeConvs = currentConvs || []
      return safeConvs.map((conv) => {
        if (conv.modelId === model.id) {
          return {
            ...conv,
            messages: [...conv.messages, userMessage, loadingMessage],
          }
        }
        return conv
      })
    })

    const startTime = Date.now()
    try {
      const history = getConversationHistory(model.id)
      const messages: Message[] = [...history, { role: 'user', content: userPrompt }]
      
      const result = await callModel(model, messages)
      const endTime = Date.now()

      const successMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: result.content,
        timestamp: Date.now(),
        modelId: model.id,
        status: 'success',
        responseTime: endTime - startTime,
        tokenCount: result.tokenCount,
      }

      setConversations((currentConvs) => {
        const safeConvs = currentConvs || []
        return safeConvs.map((conv) => {
          if (conv.modelId === model.id) {
            const updatedMessages = conv.messages.map((msg) =>
              msg.id === assistantMessageId ? successMessage : msg
            )
            return {
              ...conv,
              messages: updatedMessages,
            }
          }
          return conv
        })
      })
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        modelId: model.id,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }

      setConversations((currentConvs) => {
        const safeConvs = currentConvs || []
        return safeConvs.map((conv) => {
          if (conv.modelId === model.id) {
            const updatedMessages = conv.messages.map((msg) =>
              msg.id === assistantMessageId ? errorMessage : msg
            )
            return {
              ...conv,
              messages: updatedMessages,
            }
          }
          return conv
        })
      })
    }
  }

  const handleSendToAll = async () => {
    if (!prompt.trim() || modelList.length === 0) {
      return
    }

    const userPrompt = prompt.trim()
    setPrompt('')
    setIsRunning(true)

    await Promise.all(modelList.map((model) => runModel(model, userPrompt)))

    setIsRunning(false)
    toast.success('All models responded')
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendToAll()
    }
  }

  const hasModels = modelList.length > 0

  return (
    <div className="min-h-screen bg-background">
      <Toaster />

      <div className="flex h-screen">
        <aside className="w-80 border-r bg-card flex flex-col">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold tracking-tight">
              AI Model Comparator
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Multi-turn conversations across providers
            </p>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {modelList.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    No models configured yet. Add your first model to get
                    started.
                  </p>
                </div>
              ) : (
                modelList.map((model) => (
                  <ModelCard
                    key={model.id}
                    model={model}
                    onEdit={handleEditModel}
                    onDelete={handleDeleteModel}
                  />
                ))
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t space-y-2">
            {hasModels && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleClearChat}
              >
                <Trash size={16} className="mr-2" />
                Clear All Chats
              </Button>
            )}
            <Button
              className="w-full"
              onClick={() => {
                setEditingModel(undefined)
                setDialogOpen(true)
              }}
            >
              <Plus size={16} className="mr-2" />
              Add Model
            </Button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col">
          <div className="flex-1 overflow-hidden">
            {!hasModels ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <h2 className="text-lg font-semibold mb-2">
                    Welcome to AI Model Comparator
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Add AI models from different providers to start comparing
                    their responses in multi-turn conversations. Your API
                    credentials are stored locally.
                  </p>
                  <Button
                    size="lg"
                    onClick={() => {
                      setEditingModel(undefined)
                      setDialogOpen(true)
                    }}
                  >
                    <Plus size={18} className="mr-2" />
                    Add Your First Model
                  </Button>
                </div>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {modelList.map((model) => (
                      <ChatPanel
                        key={model.id}
                        model={model}
                        messages={getAllMessages(model.id)}
                      />
                    ))}
                  </div>
                </div>
              </ScrollArea>
            )}
          </div>

          <div className="p-4 border-t bg-card">
            <div className="max-w-4xl mx-auto space-y-3">
              <Textarea
                placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyPress}
                className="min-h-[80px] resize-none"
                disabled={isRunning || !hasModels}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSendToAll}
                  disabled={!prompt.trim() || isRunning || !hasModels}
                  size="lg"
                >
                  <PaperPlaneRight size={18} className="mr-2" />
                  {isRunning ? 'Sending...' : 'Send to All Models'}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <ModelConfigDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSave={handleSaveModel}
        editingModel={editingModel}
      />
    </div>
  )
}

export default App