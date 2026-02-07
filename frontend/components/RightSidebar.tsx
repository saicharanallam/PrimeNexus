import { useState, useRef, useEffect } from 'react'
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  SunIcon,
  MoonIcon,
  UserIcon,
} from '@heroicons/react/24/outline'

export interface ChatThread {
  id: string
  title: string
  timestamp: Date
  messageCount: number
}

type MenuKey = 'chat' | 'settings' | 'database' | 'fractal'

interface RightSidebarProps {
  activeMenu: MenuKey
  chatThreads: ChatThread[]
  activeChatId: string | null
  onSelectChat: (chatId: string) => void
  onNewChat: () => void
  theme: 'light' | 'dark'
  onThemeToggle: () => void
  userId: string | null
  currentUsername: string | null
  userData: any | null
  onUserIdChange: (newUserId: string) => Promise<{ success: boolean; error?: string }>
}

export default function RightSidebar({
  activeMenu,
  chatThreads,
  activeChatId,
  onSelectChat,
  onNewChat,
  theme,
  onThemeToggle,
  userId,
  currentUsername,
  userData,
  onUserIdChange,
}: RightSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const collapseTimeoutRef = useRef<number | null>(null)

  const handleMouseEnter = () => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current)
      collapseTimeoutRef.current = null
    }
    setCollapsed(false)
  }

  const handleMouseLeave = () => {
    // Delay collapse by 500ms to prevent premature closing
    collapseTimeoutRef.current = window.setTimeout(() => {
      setCollapsed(true)
    }, 500)
  }

  useEffect(() => {
    return () => {
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current)
      }
    }
  }, [])

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  const SettingsContent = ({
    collapsed,
    theme,
    onThemeToggle,
    userId,
    currentUsername,
    userData,
    onUserIdChange,
  }: {
    collapsed: boolean
    theme: 'light' | 'dark'
    onThemeToggle: () => void
    userId: string | null
    currentUsername: string | null
    userData: any | null
    onUserIdChange: (newUserId: string) => Promise<{ success: boolean; error?: string }>
  }) => {
    const [newUserId, setNewUserId] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isChanging, setIsChanging] = useState(false)

    const handleSwitchUser = async () => {
      if (!newUserId.trim()) {
        setError('Please enter a User ID')
        return
      }

      setIsChanging(true)
      setError(null)
      setSuccess(null)

      const result = await onUserIdChange(newUserId.trim())
      
      if (result.success) {
        setSuccess('User switched successfully')
        setNewUserId('')
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(result.error || 'Failed to switch user')
      }
      
      setIsChanging(false)
    }

    return (
      <>
        {/* Header */}
          <div className="flex h-16 items-center justify-center px-3 border-b border-slate-200 dark:border-slate-800/80 transition-colors">
            {!collapsed && (
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 transition-colors">Settings</h2>
            )}
          </div>

        {/* Settings Content */}
        <div className="flex-1 px-2 py-4 overflow-y-auto">
          {!collapsed && (
            <div className="space-y-4">
              {/* User Info - Read Only */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <UserIcon className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 transition-colors">Current User</h3>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800/60 rounded-lg p-3 space-y-3 transition-colors border border-slate-200 dark:border-slate-700/50">
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors">User ID</label>
                    <div className="text-xs text-slate-900 dark:text-slate-200 font-mono break-all mt-1.5 transition-colors">
                      {userId || 'Not set'}
                    </div>
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-700/50 pt-3">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors">Username</label>
                    <div className="text-xs text-slate-900 dark:text-slate-200 mt-1.5 transition-colors">
                      {currentUsername || 'Loading...'}
                    </div>
                  </div>
                  {userData?.display_name && (
                    <div className="border-t border-slate-200 dark:border-slate-700/50 pt-3">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors">Display Name</label>
                      <div className="text-xs text-slate-900 dark:text-slate-200 mt-1.5 transition-colors">
                        {userData.display_name}
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 text-center transition-colors">
                  Go to Settings menu to edit your profile
                </p>
              </div>

              {/* Change User ID Section */}
              <div className="space-y-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700/50">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors">Switch User</label>
                <input
                  type="text"
                  value={newUserId}
                  onChange={(e) => {
                    setNewUserId(e.target.value)
                    setError(null)
                    setSuccess(null)
                  }}
                  placeholder="Enter User ID (UUID)"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                />
                {error && (
                  <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/50 rounded px-2 py-1">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="text-xs text-green-400 bg-green-500/10 border border-green-500/50 rounded px-2 py-1">
                    {success}
                  </div>
                )}
                <button
                  onClick={handleSwitchUser}
                  disabled={isChanging || !newUserId.trim()}
                  className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <UserIcon className="h-4 w-4" />
                  {isChanging ? 'Switching...' : 'Switch User'}
                </button>
              </div>

              {/* Appearance */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 transition-colors">Appearance</h3>
                <button
                  onClick={onThemeToggle}
                  className="group/item relative flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition-all duration-150 text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-300/80 dark:border-slate-700/80 bg-slate-100/60 dark:bg-slate-900/60 transition-colors">
                    {theme === 'dark' ? (
                      <SunIcon className="h-5 w-5" />
                    ) : (
                      <MoonIcon className="h-5 w-5" />
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </>
    )
  }

  const renderContent = () => {
    if (activeMenu === 'chat') {
      return (
        <>
          {/* Header */}
          <div className="flex h-16 items-center justify-center px-3 border-b border-slate-200 dark:border-slate-800/80 transition-colors">
            {!collapsed ? (
              <div className="flex items-center justify-between w-full">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 transition-colors">Chat History</h2>
                <button
                  onClick={onNewChat}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200/60 dark:bg-slate-800/60 hover:bg-slate-300/60 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                  title="New Chat"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onNewChat}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200/60 dark:bg-slate-800/60 hover:bg-slate-300/60 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                title="New Chat"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Chat Threads List */}
          <nav className="flex-1 space-y-1 px-2 py-2 overflow-y-auto">
            {chatThreads.length === 0 ? (
              <div className="px-2 py-8 text-center">
                {!collapsed && (
                  <p className="text-xs text-slate-600 dark:text-slate-500 transition-colors">
                    No chat history yet. Start a new chat to begin.
                  </p>
                )}
              </div>
            ) : (
              [...chatThreads]
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .map((thread) => {
                const isActive = activeChatId === thread.id

                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => onSelectChat(thread.id)}
                    className={`group/item relative flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition-all duration-150 transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500/80 via-sky-500/70 to-emerald-500/60 text-white dark:text-slate-50 shadow-md shadow-sky-500/30'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                        isActive
                          ? 'border-white/0 bg-white/20 dark:bg-slate-950/30'
                          : 'border-slate-300/80 dark:border-slate-700/80 bg-slate-100/60 dark:bg-slate-900/60'
                      }`}
                    >
                      <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    </div>

                    {/* Thread Info */}
                    {!collapsed && (
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-medium text-sm">
                          {thread.title}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="truncate text-xs text-slate-400">
                            {formatDate(thread.timestamp)}
                          </span>
                          {thread.messageCount > 0 && (
                            <>
                              <span className="text-slate-600">•</span>
                              <span className="text-xs text-slate-400">
                                {thread.messageCount} {thread.messageCount === 1 ? 'msg' : 'msgs'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </nav>
        </>
      )
    } else if (activeMenu === 'settings') {
      return (
        <SettingsContent
          collapsed={collapsed}
          theme={theme}
          onThemeToggle={onThemeToggle}
          userId={userId}
          currentUsername={currentUsername}
          userData={userData}
          onUserIdChange={onUserIdChange}
        />
      )
    }
    return null
  }

  return (
    <aside
      className={`group fixed right-0 top-0 h-full z-20 flex flex-col border-l border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-950/80 backdrop-blur-xl transition-all duration-500 ease-in-out transition-colors ${
        collapsed ? 'w-16' : 'w-64'
      }`}
      style={{ 
        minWidth: collapsed ? '4rem' : '16rem',
        transition: 'width 0.5s ease-in-out, min-width 0.5s ease-in-out'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {renderContent()}
    </aside>
  )
}
