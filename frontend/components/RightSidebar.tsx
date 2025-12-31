import { useState, useRef, useEffect } from 'react'
import {
  ChatBubbleLeftRightIcon,
  PlusIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline'

// Minimal JSX typing so this component works even if React type
// declarations are not picked up by the TypeScript server.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}

export interface ChatThread {
  id: string
  title: string
  timestamp: Date
  messageCount: number
}

type MenuKey = 'chat' | 'settings'

interface RightSidebarProps {
  activeMenu: MenuKey
  chatThreads: ChatThread[]
  activeChatId: string | null
  onSelectChat: (chatId: string) => void
  onNewChat: () => void
  theme: 'light' | 'dark'
  onThemeToggle: () => void
}

export default function RightSidebar({
  activeMenu,
  chatThreads,
  activeChatId,
  onSelectChat,
  onNewChat,
  theme,
  onThemeToggle,
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

  const renderContent = () => {
    if (activeMenu === 'chat') {
      return (
        <>
          {/* Header */}
          <div className="flex h-16 items-center justify-center px-3 border-b border-slate-800/80">
            {!collapsed ? (
              <div className="flex items-center justify-between w-full">
                <h2 className="text-sm font-semibold text-slate-50">Chat History</h2>
                <button
                  onClick={onNewChat}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors"
                  title="New Chat"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onNewChat}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white transition-colors"
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
                  <p className="text-xs text-slate-500">
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
                    className={`group/item relative flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500/80 via-sky-500/70 to-emerald-500/60 text-slate-50 shadow-md shadow-sky-500/30'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                        isActive
                          ? 'border-white/0 bg-slate-950/30'
                          : 'border-slate-700/80 bg-slate-900/60'
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
        <>
          {/* Header */}
          <div className="flex h-16 items-center justify-center px-3 border-b border-slate-800/80">
            {!collapsed && (
              <h2 className="text-sm font-semibold text-slate-50">Settings</h2>
            )}
          </div>

          {/* Settings Content */}
          <div className="flex-1 px-2 py-4 overflow-y-auto">
            {!collapsed && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Appearance</h3>
                  <button
                    onClick={onThemeToggle}
                    className="group/item relative flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition-all duration-150 text-slate-300 hover:bg-slate-800/60 hover:text-white"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/60">
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
    return null
  }

  return (
    <aside
      className={`group fixed right-0 top-0 h-full z-20 flex flex-col border-l border-slate-800 bg-slate-950/80 backdrop-blur-xl transition-all duration-500 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
      style={{ minWidth: collapsed ? '4rem' : '16rem' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {renderContent()}

      {/* Footer with theme toggle (always visible when collapsed) */}
      {collapsed && (
        <div className="border-t border-slate-800/80 px-3 py-3">
          <button
            onClick={onThemeToggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/60 text-slate-300 hover:text-white transition-colors"
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      )}
    </aside>
  )
}
