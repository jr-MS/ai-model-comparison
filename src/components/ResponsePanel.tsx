import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ModelConfig, ModelResponse } from '@/lib/types'
import { getProviderName, getProviderColor } from '@/lib/api'
import { Copy, ArrowClockwise, Check, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useState } from 'react'

interface ResponsePanelProps {
  model: ModelConfig
  response: ModelResponse
  onRetry: (modelId: string) => void
}

export function ResponsePanel({ model, response, onRetry }: ResponsePanelProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (response.content) {
      await navigator.clipboard.writeText(response.content)
      setCopied(true)
      toast.success('Response copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card className="flex flex-col h-[500px]">
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={`text-xs font-medium ${getProviderColor(model.provider)}`}
          >
            {getProviderName(model.provider)}
          </Badge>
          <div>
            <h3 className="font-medium text-sm">{model.name}</h3>
            <p className="text-xs text-muted-foreground">{model.modelName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {response.status === 'success' && response.responseTime && (
            <span className="text-xs text-muted-foreground">
              {(response.responseTime / 1000).toFixed(2)}s
            </span>
          )}
          {response.status === 'success' && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleCopy}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onRetry(model.id)}
              >
                <ArrowClockwise size={16} />
              </Button>
            </>
          )}
          {response.status === 'error' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onRetry(model.id)}
            >
              <ArrowClockwise size={16} />
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {response.status === 'idle' && (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <p className="text-sm">Ready to receive prompt</p>
          </div>
        )}

        {response.status === 'loading' && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground">
                Generating response...
              </p>
            </div>
          </div>
        )}

        {response.status === 'success' && response.content && (
          <ScrollArea className="h-full">
            <div className="p-4">
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {response.content}
                </pre>
              </div>
              {response.tokenCount && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    Tokens: {response.tokenCount.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {response.status === 'error' && (
          <div className="h-full flex items-center justify-center p-4">
            <div className="text-center space-y-3 max-w-md">
              <Warning size={32} className="text-destructive mx-auto" />
              <div>
                <p className="text-sm font-medium text-destructive mb-1">
                  Error
                </p>
                <p className="text-xs text-muted-foreground">
                  {response.error || 'An unknown error occurred'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
