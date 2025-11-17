import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { ModelConfig, ModelResponse } from './lib/types'
import { callModel } from './lib/api'
import { ModelConfigDialog } from './components/ModelConfigDialog'
import { ModelCard } from './components/ModelCard'
import { ResponsePanel } from './components/ResponsePanel'
import { Button } from './components/ui/button'
import { Textarea } from './components/ui/textarea'
import { Separator } from './components/ui/separator'
import { ScrollArea } from './components/ui/scroll-area'
import { Plus, PaperPlaneRight } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Toaster } from './components/ui/sonner'

function App() {
  const [models, setModels] = useKV<ModelConfig[]>('ai-models', [])
  const [prompt, setPrompt] = useState('')
  const [responses, setResponses] = useState<Record<string, ModelResponse>>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingModel, setEditingModel] = useState<ModelConfig | undefined>()
  const [isRunning, setIsRunning] = useState(false)

  const modelList = models || []

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
    toast.success(
      editingModel ? 'Model updated successfully' : 'Model added successfully'
    )
  }

  const handleDeleteModel = (id: string) => {
    setModels((currentModels) => (currentModels || []).filter((m) => m.id !== id))
    setResponses((currentResponses) => {
      const updated = { ...currentResponses }
      delete updated[id]
      return updated
    })
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

  const initializeResponses = () => {
    const initialResponses: Record<string, ModelResponse> = {}
    modelList.forEach((model) => {
      initialResponses[model.id] = {
        modelId: model.id,
        status: 'loading',
      }
    })
    setResponses(initialResponses)
  }

  const runModel = async (model: ModelConfig, promptText: string) => {
    const startTime = Date.now()
    try {
      const result = await callModel(model, promptText)
      const endTime = Date.now()

      setResponses((current) => ({
        ...current,
        [model.id]: {
          modelId: model.id,
          status: 'success',
          content: result.content,
          tokenCount: result.tokenCount,
          responseTime: endTime - startTime,
        },
      }))
    } catch (error) {
      setResponses((current) => ({
        ...current,
        [model.id]: {
          modelId: model.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      }))
    }
  }

  const handleSendToAll = async () => {
    if (!prompt.trim() || modelList.length === 0) {
      return
    }

    setIsRunning(true)
    initializeResponses()

    await Promise.all(modelList.map((model) => runModel(model, prompt)))

    setIsRunning(false)
    toast.success('All models completed')
  }

  const handleRetry = async (modelId: string) => {
    if (!prompt.trim()) {
      return
    }

    const model = modelList.find((m) => m.id === modelId)
    if (!model) {
      return
    }

    setResponses((current) => ({
      ...current,
      [modelId]: {
        modelId,
        status: 'loading',
      },
    }))

    await runModel(model, prompt)
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
              Compare responses across providers
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

          <div className="p-4 border-t">
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
          <div className="p-6 border-b bg-card">
            <div className="space-y-3">
              <Textarea
                placeholder="Enter your prompt here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] resize-none"
                disabled={isRunning || !hasModels}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleSendToAll}
                  disabled={!prompt.trim() || isRunning || !hasModels}
                  size="lg"
                >
                  <PaperPlaneRight size={18} className="mr-2" />
                  {isRunning ? 'Running...' : 'Send to All Models'}
                </Button>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6">
              {!hasModels ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-center max-w-md">
                    <h2 className="text-lg font-semibold mb-2">
                      Welcome to AI Model Comparator
                    </h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Add AI models from different providers to start comparing
                      their responses side by side. Your API credentials are
                      stored locally and only used to call the providers you
                      configure.
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {modelList.map((model) => (
                    <ResponsePanel
                      key={model.id}
                      model={model}
                      response={
                        responses[model.id] || {
                          modelId: model.id,
                          status: 'idle',
                        }
                      }
                      onRetry={handleRetry}
                    />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
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