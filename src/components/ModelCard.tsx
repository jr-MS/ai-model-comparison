import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ModelConfig } from '@/lib/types'
import { getProviderName, getProviderColor } from '@/lib/api'
import { PencilSimple, Trash } from '@phosphor-icons/react'

interface ModelCardProps {
  model: ModelConfig
  onEdit: (model: ModelConfig) => void
  onDelete: (id: string) => void
}

export function ModelCard({ model, onEdit, onDelete }: ModelCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className={`text-xs font-medium ${getProviderColor(model.provider)}`}
            >
              {getProviderName(model.provider)}
            </Badge>
          </div>
          <h3 className="font-medium text-sm truncate mb-1">{model.name}</h3>
          <p className="text-xs text-muted-foreground truncate">
            {model.modelName}
          </p>
        </div>

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(model)}
          >
            <PencilSimple size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete(model.id)}
          >
            <Trash size={16} />
          </Button>
        </div>
      </div>
    </Card>
  )
}
