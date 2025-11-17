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
    opacity: isDragging ? 0.6 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    scale: isDragging ? '1.02' : '1',
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`transition-all ${isDragging ? 'z-50 shadow-2xl' : ''}`}
    >
      <ChatPanel model={model} messages={messages} />
    </div>
  )
}
