import { createContext, useState, useEffect, ReactNode, useCallback, useContext } from 'react'
import { UserContext } from './UserContext'

export interface ChatThread {
  id: string
  title: string
  timestamp: Date
  messageCount: number
}

interface ChatContextType {
  chatThreads: ChatThread[]
  activeChatId: string | null
  setActiveChatId: (chatId: string | null) => void
  loadChatThreads: () => Promise<void>
  handleNewChat: () => Promise<void>
  handleSelectChat: (chatId: string) => void
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)

  const userContext = useContext(UserContext)
  if (!userContext) {
    throw new Error('ChatProvider must be used within UserProvider')
  }

  const { userId, apiUrl } = userContext

  const loadChatThreads = useCallback(async () => {
    if (!userId) return

    try {
      const response = await fetch(`${apiUrl}/api/chat/threads?user_id=${userId}`)
      if (!response.ok) throw new Error('Failed to load chat threads')

      const data = await response.json()
      const threads: ChatThread[] = data.threads.map((t: any) => ({
        id: t.thread_id,
        title: t.title,
        timestamp: new Date(t.updated_at),
        messageCount: t.message_count || 0,
      }))
      setChatThreads(threads)
    } catch (error) {
      console.error('Error loading chat threads:', error)
    }
  }, [userId, apiUrl])

  const handleNewChat = useCallback(async () => {
    if (!userId) return

    const threadId = `chat-${Date.now()}`
    const title = `Chat ${chatThreads.length + 1}`

    try {
      const response = await fetch(`${apiUrl}/api/chat/threads?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          thread_id: threadId,
          title,
        }),
      })

      if (response.ok) {
        const newChat: ChatThread = {
          id: threadId,
          title,
          timestamp: new Date(),
          messageCount: 0,
        }
        setChatThreads(prev => [newChat, ...prev])
        setActiveChatId(threadId)
      } else {
        console.error('Failed to create chat thread')
      }
    } catch (error) {
      console.error('Error creating chat thread:', error)
    }
  }, [userId, apiUrl, chatThreads.length])

  const handleSelectChat = useCallback((chatId: string) => {
    setActiveChatId(chatId)
  }, [])

  useEffect(() => {
    if (userId) {
      loadChatThreads()
      const savedActiveChatId = localStorage.getItem('activeChatId')
      if (savedActiveChatId) {
        setActiveChatId(savedActiveChatId)
      }
    }
  }, [userId, loadChatThreads])

  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem('activeChatId', activeChatId)
    } else {
      localStorage.removeItem('activeChatId')
    }
  }, [activeChatId])

  return (
    <ChatContext.Provider
      value={{
        chatThreads,
        activeChatId,
        setActiveChatId,
        loadChatThreads,
        handleNewChat,
        handleSelectChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}
