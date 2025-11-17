import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ModelConfig, ChatMessage } from '@/lib/types'
import { getProviderName, getProviderColor } from '@/lib/api'
import { Copy, Check, Warning, User, Robot } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
    <Card className="flex flex-col h-[calc(100vh-200px)] shadow-xl border-2 hover:border-primary/20 transition-all overflow-hidden p-0">
      <div className="p-4 border-b flex items-center justify-between bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={`text-xs font-semibold ${getProviderColor(model.provider)} shadow-sm`}
          >
            {getProviderName(model.provider)}
          </Badge>
          <div>
            <h3 className="font-semibold text-sm">{model.name}</h3>
            <p className="text-xs text-muted-foreground">{model.modelName}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden" ref={scrollRef}>
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {modelMessages.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <Robot size={32} className="text-primary/60" weight="duotone" />
                  </div>
                  <p className="text-sm text-muted-foreground">No messages yet. Start a conversation!</p>
                </div>
              </div>
            ) : (
              modelMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-md">
                        <Robot size={18} className="text-primary" weight="duotone" />
                      </div>
                    </div>
                  )}

                  <div
                    className={`flex flex-col max-w-[80%] min-w-0 ${
                      message.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`rounded-2xl p-4 w-full overflow-hidden transition-all ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-blue-50 to-blue-100/80 border border-blue-200/50 shadow-md'
                          : message.status === 'error'
                          ? 'bg-destructive/10 border-2 border-destructive/20 shadow-sm'
                          : 'bg-gradient-to-br from-muted/50 to-muted/30 border border-border shadow-md'
                      }`}
                    >
                      {message.status === 'loading' ? (
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-5 h-5 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                          </div>
                          <span className="text-sm text-muted-foreground animate-pulse">
                            Generating response...
                          </span>
                        </div>
                      ) : message.status === 'error' ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Warning size={18} className="text-destructive" weight="fill" />
                            <span className="text-sm font-semibold text-destructive">
                              Error
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground break-words leading-relaxed">
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
                            className="h-6 w-6 ml-1 hover:bg-primary/10 transition-colors"
                            onClick={() =>
                              handleCopy(message.id, message.content)
                            }
                          >
                            {copiedId === message.id ? (
                              <Check size={12} className="text-primary" weight="bold" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </Button>
                        )}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent shadow-md flex items-center justify-center">
                        <User size={18} className="text-white" weight="duotone" />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </Card>
  )
}
