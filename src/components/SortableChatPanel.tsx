import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChatPanel } from './ChatPanel'
import { ModelConfig, ChatMessage } from '../lib/types'

interface SortableChatPanelProps {
  model: ModelConfig
  messages: ChatMessage[]
}

export function SortableChatPanel({ model, messages }: SortableChatPanelProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: model.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ChatPanel model={model} messages={messages} />
    </div>
  )
}
