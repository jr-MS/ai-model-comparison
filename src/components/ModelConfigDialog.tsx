import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ModelConfig, ProviderType } from '@/lib/types'
import { Eye, EyeSlash } from '@phosphor-icons/react'

interface ModelConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (config: ModelConfig) => void
  editingModel?: ModelConfig
}

export function ModelConfigDialog({
  open,
  onOpenChange,
  onSave,
  editingModel,
}: ModelConfigDialogProps) {
  const [provider, setProvider] = useState<ProviderType>(
    editingModel?.provider || 'openai'
  )
  const [name, setName] = useState(editingModel?.name || '')
  const [apiKey, setApiKey] = useState(editingModel?.apiKey || '')
  const [endpoint, setEndpoint] = useState(editingModel?.endpoint || '')
  const [modelName, setModelName] = useState(editingModel?.modelName || '')
  const [showApiKey, setShowApiKey] = useState(false)

  const requiresEndpoint = provider === 'azure' || provider === 'aws'

  const handleSave = () => {
    if (!name || !apiKey || !modelName) {
      return
    }

    if (requiresEndpoint && !endpoint) {
      return
    }

    const config: ModelConfig = {
      id: editingModel?.id || `model-${Date.now()}`,
      name,
      provider,
      apiKey,
      endpoint: requiresEndpoint ? endpoint : undefined,
      modelName,
    }

    onSave(config)
    handleClose()
  }

  const handleClose = () => {
    if (!editingModel) {
      setName('')
      setApiKey('')
      setEndpoint('')
      setModelName('')
      setProvider('openai')
    }
    setShowApiKey(false)
    onOpenChange(false)
  }

  const getModelNamePlaceholder = () => {
    switch (provider) {
      case 'openai':
        return 'gpt-4, gpt-3.5-turbo, etc.'
      case 'azure':
        return 'Deployment name'
      case 'gemini':
        return 'gemini-pro, gemini-1.5-pro, etc.'
      case 'aws':
        return 'anthropic.claude-v2, etc.'
      default:
        return 'Model identifier'
    }
  }

  const getEndpointPlaceholder = () => {
    switch (provider) {
      case 'azure':
        return 'https://your-resource.openai.azure.com'
      case 'aws':
        return 'https://bedrock-runtime.region.amazonaws.com'
      default:
        return ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingModel ? 'Edit Model' : 'Add New Model'}
          </DialogTitle>
          <DialogDescription>
            Configure your AI model connection. Your credentials are stored
            locally and never sent to any server except the provider you
            specify.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select
              value={provider}
              onValueChange={(value) => setProvider(value as ProviderType)}
            >
              <SelectTrigger id="provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="azure">Azure OpenAI</SelectItem>
                <SelectItem value="gemini">Google Gemini</SelectItem>
                <SelectItem value="aws">AWS Bedrock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              placeholder="e.g., GPT-4 Production"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showApiKey ? 'text' : 'password'}
                placeholder="Your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showApiKey ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {requiresEndpoint && (
            <div className="space-y-2">
              <Label htmlFor="endpoint">Endpoint</Label>
              <Input
                id="endpoint"
                placeholder={getEndpointPlaceholder()}
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="model-name">Model Name</Label>
            <Input
              id="model-name"
              placeholder={getModelNamePlaceholder()}
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              !name ||
              !apiKey ||
              !modelName ||
              (requiresEndpoint && !endpoint)
            }
          >
            {editingModel ? 'Save Changes' : 'Add Model'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
