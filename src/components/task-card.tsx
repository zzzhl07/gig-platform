'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { formatDate, formatPrice, getCategoryLabel, TASK_STATUS_LABELS } from '@/lib/utils'

interface TaskCardProps {
  task: {
    id: string
    title: string
    description: string
    budgetMin?: number | null
    budgetMax?: number | null
    deadline?: string | null
    status: string
    category?: string | null
    skills: string[]
    isRemote?: boolean
    location?: string | null
    isConfidential?: boolean
    user: { name: string; rating: number; completedTasks: number; avatar?: string | null }
    createdAt: string
    applicantCount?: number
  }
}

export function TaskCard({ task }: TaskCardProps) {
  const budgetStr = task.budgetMin || task.budgetMax
    ? `${task.budgetMin ? formatPrice(task.budgetMin) : ''} ~ ${task.budgetMax ? formatPrice(task.budgetMax) : formatPrice(task.budgetMin || 0)}`
    : '面议'

  return (
    <Link href={`/tasks/${task.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Avatar name={task.user.name} src={task.user.avatar} size="sm" />
              <div>
                <p className="text-sm font-medium">{task.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  ⭐ {task.user.rating.toFixed(1)} · {task.user.completedTasks}单
                </p>
              </div>
            </div>
            <Badge variant={task.status === 'OPEN' ? 'success' : 'secondary'}>
              {TASK_STATUS_LABELS[task.status] || task.status}
            </Badge>
          </div>

          <h3 className="font-semibold mb-1 line-clamp-2">{task.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{task.description}</p>

          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {task.category && (
              <Badge variant="secondary" className="text-xs">
                {getCategoryLabel(task.category)}
              </Badge>
            )}
            {/* 工作方式标识 */}
            {task.isRemote ? (
              <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded">🌐 远程</span>
            ) : (
              <span className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-1.5 py-0.5 rounded">📍 {task.location || '线下'}</span>
            )}
            {task.isConfidential && (
              <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-1.5 py-0.5 rounded">🔒 保密</span>
            )}
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {task.skills.slice(0, 3).map((skill) => (
              <span key={skill} className="text-xs bg-muted px-2 py-0.5 rounded">
                {skill}
              </span>
            ))}
            {task.skills.length > 3 && (
              <span className="text-xs text-muted-foreground">+{task.skills.length - 3}</span>
            )}
          </div>

          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <span className="font-semibold text-primary">{budgetStr}</span>
            <span className="text-muted-foreground">
              {formatDate(task.createdAt)}
              {task.applicantCount !== undefined && ` · ${task.applicantCount}人申请`}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
