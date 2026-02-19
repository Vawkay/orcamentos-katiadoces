import { cn } from '@/lib/utils'
import { LABELS_STATUS, CORES_STATUS, type StatusOrcamento } from '@/lib/types'

interface StatusBadgeProps {
  status: StatusOrcamento
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        CORES_STATUS[status],
        className
      )}
    >
      {LABELS_STATUS[status]}
    </span>
  )
}
