'use client'

import { useState, useEffect, useRef } from 'react'
import { TaskCard } from '@/components/task-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ListSkeleton } from '@/components/skeleton'
import { CATEGORIES, CATEGORY_GROUPS, getCategoryIcon } from '@/lib/utils'

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('latest')
  const [workType, setWorkType] = useState('all')
  const [jobGroup, setJobGroup] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  async function fetchTasks() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      if (search) params.set('search', search)
      if (sort) params.set('sort', sort)
      if (workType !== 'all') params.set('workType', workType)
      params.set('page', String(page))
      params.set('limit', '20')

      const res = await fetch(`/api/tasks?${params}`)
      const data = await res.json()
      setTasks(data.tasks || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [category, sort, workType, page])

  const filteredCategories = jobGroup === 'all'
    ? CATEGORIES
    : CATEGORIES.filter(c => c.group === jobGroup || c.group === 'both')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    fetchTasks()
  }

  return (
    <div className="min-h-screen">
      {/* Sticky header with search */}
      <div className="sticky top-14 sm:top-16 z-30 bg-background/95 backdrop-blur border-b">
        <div className="container py-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Input
                  placeholder="搜索任务..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
              <Button type="submit" variant="primary" size="sm" className="shrink-0">搜索</Button>
            </form>
            {/* Mobile filter toggle */}
            <button
              className="sm:hidden h-9 px-3 rounded-lg border border-input flex items-center gap-1 text-sm"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              筛选
            </button>
          </div>

          {/* Desktop filters */}
          <div className="hidden sm:block mt-3 space-y-3">
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(['all', 'remote', 'onsite'] as const).map(w => (
                <button key={w}
                  className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${workType === w ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
                  onClick={() => setWorkType(w)}
                >{w === 'all' ? '全部形式' : w === 'remote' ? '🌐 远程' : '📍 线下'}</button>
              ))}
              <div className="w-px bg-border mx-1" />
              {(['all', 'white', 'blue'] as const).map(g => (
                <button key={g}
                  className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-colors shrink-0 ${jobGroup === g ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
                  onClick={() => { setJobGroup(g); setCategory('') }}
                >{g === 'all' ? '全部' : g === 'white' ? '💻 白领' : '🔧 蓝领'}</button>
              ))}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" ref={scrollRef}>
              <button
                className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${!category ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
                onClick={() => setCategory('')}
              >全部分类</button>
              {filteredCategories.map((c) => (
                <button key={c.value}
                  className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${category === c.value ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
                  onClick={() => setCategory(c.value)}
                >{getCategoryIcon(c.value)} {c.label}</button>
              ))}
              <div className="shrink-0 w-4" />
            </div>
          </div>

          {/* Mobile expanded filters */}
          {filterOpen && (
            <div className="sm:hidden mt-3 pb-3 space-y-3 border-t pt-3">
              <div className="flex gap-1.5 overflow-x-auto">
                {(['all', 'remote', 'onsite'] as const).map(w => (
                  <button key={w}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${workType === w ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                    onClick={() => setWorkType(w)}
                  >{w === 'all' ? '全部' : w === 'remote' ? '🌐远程' : '📍线下'}</button>
                ))}
              </div>
              <div className="flex gap-1.5">
                {(['all', 'white', 'blue'] as const).map(g => (
                  <button key={g}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${jobGroup === g ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                    onClick={() => { setJobGroup(g); setCategory('') }}
                  >{g === 'all' ? '全部' : g === 'white' ? '💻白领' : '🔧蓝领'}</button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                <button
                  className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${!category ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                  onClick={() => setCategory('')}
                >全部分类</button>
                {filteredCategories.map((c) => (
                  <button key={c.value}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${category === c.value ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                    onClick={() => setCategory(c.value)}
                  >{getCategoryIcon(c.value)} {c.label}</button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <select className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-xs" value={sort}
                  onChange={(e) => setSort(e.target.value)}>
                  <option value="latest">最新发布</option>
                  <option value="budget_high">预算从高到低</option>
                  <option value="budget_low">预算从低到高</option>
                </select>
                <Button variant="ghost" size="sm" onClick={() => setFilterOpen(false)}>完成</Button>
              </div>
            </div>
          )}

          {/* Sort + results count (desktop) */}
          <div className="hidden sm:flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">{loading ? '搜索中...' : `共 ${tasks.length} 个任务`}</p>
            <select className="h-8 rounded-lg border border-input bg-background px-2 text-xs" value={sort}
              onChange={(e) => setSort(e.target.value)}>
              <option value="latest">最新发布</option>
              <option value="budget_high">预算从高到低</option>
              <option value="budget_low">预算从低到高</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Grid */}
      <div className="container py-4 sm:py-6 px-4 sm:px-6">
        <div className="sm:hidden flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground">{loading ? '搜索中...' : `共 ${tasks.length} 个任务`}</p>
        </div>

        {loading ? (
          <ListSkeleton count={6} />
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 sm:py-20 text-muted-foreground">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-base sm:text-lg font-medium">暂无任务</p>
            <p className="text-sm mt-1">换个筛选条件试试？</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => { setCategory(''); setSearch(''); setWorkType('all'); setJobGroup('all') }}>
              清除筛选
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6 sm:mt-8">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  上一页
                </Button>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const p = i + 1
                    return (
                      <button key={p}
                        className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${page === p ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                        onClick={() => setPage(p)}
                      >{p}</button>
                    )
                  })}
                  {totalPages > 5 && <span className="px-1">...</span>}
                </div>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  下一页
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
