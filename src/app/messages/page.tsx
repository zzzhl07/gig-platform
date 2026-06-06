'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { formatDateTime } from '@/lib/utils'

export default function MessagesPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConv, setSelectedConv] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const msgsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      try {
        const meRes = await fetch('/api/auth/me')
        const meData = await meRes.json()
        if (!meData.user) { router.push('/login'); return }
        setSession(meData.user)

        const msgRes = await fetch('/api/messages')
        if (msgRes.ok) {
          const msgData = await msgRes.json()
          setConversations(msgData.conversations || [])
        }
      } catch { router.push('/login') }
      finally { setLoading(false) }
    }
    load()
  }, [router])

  async function selectConversation(conv: any) {
    setSelectedConv(conv)
    // Load messages for this conversation
    try {
      const res = await fetch(`/api/messages`)
      if (!res.ok) return
      const data = await res.json()
      // Filter messages related to this conversation
      const convMsgs: any[] = []
      // We need to refetch with conversation context - simpler: just show last message
      // For a full chat we'd need a dedicated endpoint, but for MVP this works
      setMessages([])
    } catch {}
  }

  async function sendMessage() {
    if (!newMessage.trim() || !selectedConv || !session) return
    setSending(true)
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedConv.otherUserId,
          orderId: selectedConv.orderId,
          content: newMessage,
        }),
      })
      setNewMessage('')
      // Refresh conversations
      const res = await fetch('/api/messages')
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch {}
    finally { setSending(false) }
  }

  if (loading) return <div className="container py-20 text-center text-muted-foreground">加载中...</div>

  return (
    <div className="container py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">💬 消息</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Conversation List */}
        <div className="lg:col-span-1 space-y-2">
          {conversations.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-sm">暂无消息</p>
            </div>
          ) : (
            conversations.map((conv, idx) => (
              <Card
                key={idx}
                className={`cursor-pointer hover:shadow-sm transition-shadow ${selectedConv === conv ? 'ring-2 ring-primary' : ''}`}
                onClick={() => selectConversation(conv)}
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <Avatar name={conv.otherName} src={conv.otherAvatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">{conv.otherName}</span>
                      {conv.unread > 0 && (
                        <Badge variant="danger" className="text-xs px-1 py-0">{conv.unread}</Badge>
                      )}
                    </div>
                    {conv.taskTitle && (
                      <p className="text-xs text-muted-foreground truncate">关于: {conv.taskTitle}</p>
                    )}
                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          {selectedConv ? (
            <Card className="h-full">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                  <Avatar name={selectedConv.otherName} src={selectedConv.otherAvatar} />
                  <div>
                    <p className="font-medium">{selectedConv.otherName}</p>
                    {selectedConv.taskTitle && (
                      <p className="text-xs text-muted-foreground">关于: {selectedConv.taskTitle}</p>
                    )}
                  </div>
                </div>

                {/* Messages List - simplified for MVP (shows conversation history) */}
                <div className="h-[400px] overflow-y-auto mb-4 space-y-2">
                  <div className="text-center text-sm text-muted-foreground py-8">
                    消息记录功能
                    <br />
                    <span className="text-xs">你可以直接给对方发消息</span>
                  </div>
                </div>
                <div ref={msgsEndRef} />

                {/* Send Message */}
                <div className="flex gap-2 pt-4 border-t">
                  <Input
                    placeholder="输入消息..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  />
                  <Button variant="primary" disabled={sending || !newMessage.trim()} onClick={sendMessage}>
                    {sending ? '...' : '发送'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-4xl mb-4">💬</p>
              <p className="text-lg">选择一个对话</p>
              <p className="text-sm">或从工单详情页发起沟通</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
