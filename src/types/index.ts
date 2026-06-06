export interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  phone?: string | null
  avatar?: string | null
  bio?: string | null
  skills: string[]
  rating: number
  completedTasks: number
  walletBalance: number
  createdAt: string
}

export interface TaskItem {
  id: string
  title: string
  description: string
  budgetMin?: number | null
  budgetMax?: number | null
  deadline?: string | null
  status: string
  category?: string | null
  skills: string[]
  userId: string
  workerId?: string | null
  user: {
    name: string
    rating: number
    completedTasks: number
    avatar?: string | null
  }
  createdAt: string
}

export interface OrderItem {
  id: string
  taskId: string
  enterpriseId: string
  workerId: string
  status: string
  agreedPrice?: number | null
  workerSubmit?: string | null
  enterpriseFeedback?: string | null
  createdAt: string
  task: {
    title: string
    category?: string | null
  }
  enterprise: {
    id: string
    name: string
    avatar?: string | null
  }
  worker: {
    id: string
    name: string
    avatar?: string | null
  }
}
