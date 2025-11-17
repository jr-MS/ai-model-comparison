import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ModelConfig, ChatMessage } from '@/lib/types'
import { getProviderName, getProviderColor } from '@/lib/api'
import { Copy, Check, Warning, User, Robot } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useState, useRef, useEffect } from 'react'

interface ChatPanelProps {
  model: ModelConfig
  messages: ChatMessage[]
}

export function ChatPanel({ model, messages }: ChatPanelProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      const scrollViewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight
      }
    }
  }, [messages])

  const handleCopy = async (messageId: string, content: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(messageId)
    toast.success('Message copied to clipboard')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const modelMessages = messages.filter(
    (msg) => msg.role === 'user' || msg.modelId === model.id
  )

  return (
    <Card className="flex flex-col h-[calc(100vh-200px)]">
      <div className="p-4 border-b flex items-center justify-between bg-card sticky top-0 z-10">
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
      </div>

      <div className="flex-1 overflow-hidden" ref={scrollRef}>
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {modelMessages.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p className="text-sm">No messages yet. Start a conversation!</p>
              </div>
            ) : (
              modelMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Robot size={18} className="text-primary" />
                      </div>
                    </div>
                  )}

                  <div
                    className={`flex flex-col max-w-[80%] min-w-0 ${
                      message.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`rounded-lg p-3 w-full overflow-hidden ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : message.status === 'error'
                          ? 'bg-destructive/10 border border-destructive/20'
                          : 'bg-muted'
                      }`}
                    >
                      {message.status === 'loading' ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm text-muted-foreground">
                            Generating response...
                          </span>
                        </div>
                      ) : message.status === 'error' ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Warning size={16} className="text-destructive" />
                            <span className="text-sm font-medium text-destructive">
                              Error
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground break-words">
                            {message.error || 'An unknown error occurred'}
                          </p>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                          {message.content}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 px-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                      {message.responseTime && (
                        <span className="text-xs text-muted-foreground">
                          • {(message.responseTime / 1000).toFixed(2)}s
                        </span>
                      )}
                      {message.tokenCount && (
                        <span className="text-xs text-muted-foreground">
                          • {message.tokenCount} tokens
                        </span>
                      )}
                      {message.role === 'assistant' &&
                        message.status === 'success' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 ml-1"
                            onClick={() =>
                              handleCopy(message.id, message.content)
                            }
                          >
                            {copiedId === message.id ? (
                              <Check size={12} />
                            ) : (
                              <Copy size={12} />
                            )}
                          </Button>
                        )}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                        <User size={18} className="text-accent-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </Card>
  )
}
