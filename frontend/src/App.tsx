import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import RightSidebar, { ChatThread } from '../components/RightSidebar'
import ChatInterface from '../components/ChatInterface'
import DatabaseBrowser from '../components/DatabaseBrowser'
import Settings from '../components/Settings'
import FractalViewer from '../components/FractalViewer'

type MenuKey = 'chat' | 'settings' | 'database' | 'fractal'

function App() {
  const [activeMenu, setActiveMenu] = useState<MenuKey>('chat')
  const [userId, setUserId] = useState<string | null>(null)
  const [currentUsername, setCurrentUsername] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)
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
      // Restore active chat from localStorage if available
      const savedActiveChatId = localStorage.getItem('activeChatId')
      if (savedActiveChatId) {
        setActiveChatId(savedActiveChatId)
      }
      // Fetch username for display
      fetchUserInfo()
    }
  }, [userId])

  // Fetch user info when userId changes
  const fetchUserInfo = async () => {
    if (!userId) return
    try {
      const response = await fetch(`${apiUrl}/api/users/${userId}`)
      if (response.ok) {
        const user = await response.json()
        setCurrentUsername(user.username)
        setUserData(user)
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
    }
  }

  // Update user information
  const handleUserUpdate = async (updates: any) => {
    if (!userId) return { success: false, error: 'No user ID' }
    
    try {
      const response = await fetch(`${apiUrl}/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to update user')
      }
      
      const updatedUser = await response.json()
      setUserData(updatedUser)
      setCurrentUsername(updatedUser.username)
      
      return { success: true }
    } catch (error: any) {
      console.error('Error updating user:', error)
      return { success: false, error: error.message || 'Failed to update user' }
    }
  }

  // Save activeChatId to localStorage when it changes
  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem('activeChatId', activeChatId)
    } else {
      localStorage.removeItem('activeChatId')
    }
  }, [activeChatId])

  const initializeUser = async () => {
    // Check localStorage first for persisted userId
    const storedUserId = localStorage.getItem('userId')
    const defaultUsername = 'default_user'
    
    try {
      // If we have a stored userId, verify it with the backend
      if (storedUserId) {
        try {
          const verifyResponse = await fetch(`${apiUrl}/api/users/${storedUserId}`)
          if (verifyResponse.ok) {
            const user = await verifyResponse.json()
            console.log('User verified from localStorage:', user.id)
            setUserId(user.id)
            setCurrentUsername(user.username)
            return
          } else {
            // User doesn't exist, clear localStorage
            localStorage.removeItem('userId')
          }
        } catch (error) {
          console.error('Error verifying user:', error)
          localStorage.removeItem('userId')
        }
      }
      
      // No valid stored userId, try to get default_user by username
      try {
        const getByUsernameResponse = await fetch(`${apiUrl}/api/users/by-username/${defaultUsername}`)
        if (getByUsernameResponse.ok) {
          const user = await getByUsernameResponse.json()
          console.log('Retrieved existing default_user:', user.id)
          setUserId(user.id)
          setCurrentUsername(user.username)
          localStorage.setItem('userId', user.id)
          return
        }
      } catch (error) {
        // User doesn't exist, will create it below
        console.log('default_user not found, will create new user')
      }
      
      // default_user doesn't exist, create it
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
        setCurrentUsername(user.username)
        // Persist userId to localStorage
        localStorage.setItem('userId', user.id)
      } else {
        console.error('Failed to create user:', response.status)
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

  const handleUserIdChange = async (newUserId: string) => {
    try {
      // Validate the user ID by fetching it from the backend
      const response = await fetch(`${apiUrl}/api/users/${newUserId}`)
      if (!response.ok) {
        throw new Error('User not found')
      }
      
      const user = await response.json()
      // Update userId and localStorage
      setUserId(user.id)
      localStorage.setItem('userId', user.id)
      setCurrentUsername(user.username)
      
      // Clear active chat and reload threads for the new user
      setActiveChatId(null)
      localStorage.removeItem('activeChatId')
      await loadChatThreads()
      
      return { success: true }
    } catch (error: any) {
      console.error('Error changing user ID:', error)
      return { success: false, error: error.message || 'Failed to change user ID' }
    }
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
            // Reload chat threads to get updated list from backend
            loadChatThreads()
          }}
          onMessageSent={() => {
            // Reload chat threads after message is sent to update message counts
            loadChatThreads()
          }}
        />
      )
    } else if (activeMenu === 'database') {
      return <DatabaseBrowser apiUrl={apiUrl} />
    } else if (activeMenu === 'settings') {
      return (
        <Settings
          userId={userId}
          userData={userData}
          onUserUpdate={handleUserUpdate}
          onRefreshUser={fetchUserInfo}
        />
      )
    } else if (activeMenu === 'fractal') {
      const rustServiceUrl = import.meta.env.VITE_RUST_SERVICE_URL || 'http://localhost:8001'
      return <FractalViewer rustServiceUrl={rustServiceUrl} />
    }
    return null
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-white via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-50 overflow-hidden transition-all duration-300">
      <Sidebar activeMenu={activeMenu} onSelect={setActiveMenu} />
      <main className="flex-1 min-w-0 pl-64 pr-64 transition-all duration-500 ease-in-out">
        <div className="w-full h-full transition-opacity duration-300">
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
        userId={userId}
        currentUsername={currentUsername}
        userData={userData}
        onUserIdChange={handleUserIdChange}
      />
    </div>
  )
}

export default App
