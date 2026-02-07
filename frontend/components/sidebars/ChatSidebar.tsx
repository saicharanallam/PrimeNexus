import { ChatBubbleLeftRightIcon, PlusIcon } from '@heroicons/react/24/outline'
import { useChat } from '../../src/hooks/useChat'

interface ChatSidebarProps {
  collapsed: boolean
}

export default function ChatSidebar({ collapsed }: ChatSidebarProps) {
  const { chatThreads, activeChatId, handleNewChat, handleSelectChat } = useChat()

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  return (
    <>
      {/* Header */}
      <div className="flex h-16 items-center justify-center px-3 border-b border-slate-200 dark:border-slate-800/80 transition-colors">
        {!collapsed ? (
          <div className="flex items-center justify-between w-full">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50 transition-colors">
              Chat History
            </h2>
            <button
              onClick={handleNewChat}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200/60 dark:bg-slate-800/60 hover:bg-slate-300/60 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="New Chat"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleNewChat}
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
                  onClick={() => handleSelectChat(thread.id)}
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
                      <span className="truncate font-medium text-sm">{thread.title}</span>
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
}
