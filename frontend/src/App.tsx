import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import RightSidebar, { ChatThread } from '../components/RightSidebar'
import ChatInterface from '../components/ChatInterface'

type MenuKey = 'chat' | 'settings'

function App() {
  const [activeMenu, setActiveMenu] = useState<MenuKey>('chat')
  const [userId, setUserId] = useState<string | null>(null)
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) return savedTheme
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.setAttribute('data-theme', 'dark')
    } else {
      root.classList.remove('dark')
      root.setAttribute('data-theme', 'light')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  // Initialize user on mount
  useEffect(() => {
    initializeUser()
  }, [])

  // Load chat threads when user is set
  useEffect(() => {
    if (userId) {
      loadChatThreads()
    }
  }, [userId])

  const initializeUser = async () => {
    // For now, create/get a default user
    // In production, this would come from authentication
    try {
      // Try to get or create a default user
      const defaultUsername = 'default_user'
      
      // Check if user exists (simplified - in production use proper auth)
      // For now, we'll create a user if needed
      const response = await fetch(`${apiUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: defaultUsername,
          email: null,
        }),
      })

      if (response.ok) {
        const user = await response.json()
        console.log('User created/initialized:', user.id)
        setUserId(user.id)
      } else if (response.status === 400) {
        // User already exists, try to get it
        // In production, you'd have a proper endpoint for this
        // For now, we'll use a hardcoded UUID or create a new one
        // This is a simplified approach - in production use proper auth
        const error = await response.json()
        if (error.detail?.includes('already exists')) {
          // User exists, but we don't have a way to get it yet
          // For demo purposes, create a new user with timestamp
          const newUsername = `user_${Date.now()}`
          const createResponse = await fetch(`${apiUrl}/api/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: newUsername,
              email: null,
            }),
          })
          if (createResponse.ok) {
            const user = await createResponse.json()
            console.log('User created (fallback):', user.id)
            setUserId(user.id)
          }
        }
      }
    } catch (error) {
      console.error('Error initializing user:', error)
      // Fallback: use a placeholder user ID (won't work with backend, but UI will load)
      // In production, handle this properly
    }
  }

  const loadChatThreads = async () => {
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
  }

  const handleNewChat = async () => {
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
  }

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId)
  }

  const handleThemeToggle = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const renderMainContent = () => {
    if (activeMenu === 'chat') {
      if (!userId) {
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-300 mb-4">
                Initializing...
              </h2>
              <p className="text-slate-500">
                Setting up your account
              </p>
            </div>
          </div>
        )
      }

      return (
        <ChatInterface
          threadId={activeChatId}
          userId={userId}
          apiUrl={apiUrl}
          onThreadCreated={(threadId) => {
            // Update chat threads list and set as active
            const newChat: ChatThread = {
              id: threadId,
              title: `Chat ${chatThreads.length + 1}`,
              timestamp: new Date(),
              messageCount: 0,
            }
            setChatThreads(prev => [newChat, ...prev])
            setActiveChatId(threadId)
          }}
        />
      )
    } else if (activeMenu === 'settings') {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-300 mb-4">
              Settings
            </h2>
            <p className="text-slate-500">
              Settings panel coming soon...
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden">
      <Sidebar activeMenu={activeMenu} onSelect={setActiveMenu} />
      <main className="flex-1 min-w-0 pl-64 pr-64 transition-all duration-500">
        <div className="w-full h-full">
          {renderMainContent()}
        </div>
      </main>
      <RightSidebar
        activeMenu={activeMenu}
        chatThreads={chatThreads}
        activeChatId={activeChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />
    </div>
  )
}

export default App
