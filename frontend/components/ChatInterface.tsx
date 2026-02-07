import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent, MouseEvent, useCallback } from 'react'
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'
import { useUser } from '../src/hooks/useUser'
import { useChat } from '../src/hooks/useChat'
import { useSidebar } from '../src/hooks/useSidebar'
import ChatSidebar from './sidebars/ChatSidebar'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  streaming?: boolean
}

export default function ChatInterface() {
  const { userId, apiUrl } = useUser()
  const { activeChatId: threadId, loadChatThreads, setActiveChatId } = useChat()
  const { registerSidebar, unregisterSidebar } = useSidebar()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const threadJustCreatedRef = useRef<string | null>(null)

  // Register sidebar
  useEffect(() => {
    registerSidebar('chat', <ChatSidebar collapsed={sidebarCollapsed} />)
    return () => unregisterSidebar('chat')
  }, [registerSidebar, unregisterSidebar, sidebarCollapsed])

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [])

  // Adjust textarea height when input changes
  useEffect(() => {
    adjustTextareaHeight()
  }, [inputValue, adjustTextareaHeight])

  // Load messages when thread changes
  const loadMessages = useCallback(async () => {
    if (!threadId || !userId) return
    if (!apiUrl) return

    try {
      setError(null)
      const response = await fetch(`${apiUrl}/api/chat/threads/${threadId}?user_id=${userId}`)
      if (!response.ok) throw new Error('Failed to load messages')
      
      const data = await response.json()
      const loadedMessages: Message[] = data.messages.map((msg: any) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.created_at),
      }))
      setMessages(loadedMessages)
    } catch (error) {
      console.error('Error loading messages:', error)
      setError('Failed to load messages. Please try again.')
    }
  }, [threadId, userId, apiUrl])

  useEffect(() => {
    if (threadId) {
      // Only load messages if this thread wasn't just created
      // This prevents overwriting local messages before they're saved to DB
      if (threadJustCreatedRef.current !== threadId) {
        loadMessages()
      } else {
        // Clear the flag after a short delay to allow for future loads
        setTimeout(() => {
          threadJustCreatedRef.current = null
        }, 1000)
      }
    } else {
      setMessages([])
      setError(null)
      threadJustCreatedRef.current = null
    }
  }, [threadId, loadMessages])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const createThread = async (): Promise<string | null> => {
    const newThreadId = `chat-${Date.now()}`
    const title = inputValue.substring(0, 30) + (inputValue.length > 30 ? '...' : '')
    
    try {
      const response = await fetch(`${apiUrl}/api/chat/threads?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          thread_id: newThreadId,
          title,
        }),
      })

      if (response.ok) {
        // Mark this thread as just created to prevent loading messages immediately
        threadJustCreatedRef.current = newThreadId
        setActiveChatId(newThreadId)
        loadChatThreads()
        return newThreadId
      } else {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || 'Failed to create chat thread')
      }
    } catch (error: any) {
      console.error('Error creating chat thread:', error)
      setError(error.message || 'Failed to create chat thread')
      return null
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    if (!userId) {
      setError('User not initialized. Please refresh the page.')
      return
    }

    // Auto-create thread if none exists
    let currentThreadId = threadId
    if (!currentThreadId) {
      currentThreadId = await createThread()
      if (!currentThreadId) {
        return
      }
      // Mark thread as just created to prevent loading messages
      threadJustCreatedRef.current = currentThreadId
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    }

    setMessages((prev: Message[]) => [...prev, userMessage])
    setInputValue('')
    setError(null)
    setIsLoading(true)

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = '60px'
    }

    // Create streaming message placeholder
    const streamingMessageId = `assistant-${Date.now()}`
    const streamingMessage: Message = {
      id: streamingMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      streaming: true,
    }
    setMessages((prev: Message[]) => [...prev, streamingMessage])

    // Abort controller for cancellation
    abortControllerRef.current = new AbortController()

    try {
      const streamUrl = `${apiUrl}/api/chat/threads/${currentThreadId}/stream?user_id=${userId}`
      
      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: userMessage.content }),
        signal: abortControllerRef.current.signal,
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to stream response: ${response.status} ${response.statusText}. ${errorText}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No response body')

      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.trim() && line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                fullContent += data.content
                // Update streaming message
                setMessages((prev: Message[]) =>
                  prev.map((msg: Message) =>
                    msg.id === streamingMessageId
                      ? { ...msg, content: fullContent }
                      : msg
                  )
                )
              }
              if (data.done) {
                // Remove streaming flag
                setMessages((prev: Message[]) =>
                  prev.map((msg: Message) =>
                    msg.id === streamingMessageId
                      ? { ...msg, streaming: false }
                      : msg
                  )
                )
                // Clear the threadJustCreated flag after streaming completes
                // This allows messages to be reloaded from DB if needed
                threadJustCreatedRef.current = null
                // Reload chat threads to update message counts
                loadChatThreads()
              }
              if (data.error) {
                throw new Error(data.error)
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Request was aborted, remove streaming message
        setMessages((prev: Message[]) => prev.filter(msg => msg.id !== streamingMessageId))
      } else {
        console.error('Error streaming response:', error)
        setError(error.message || 'Failed to get response')
        // Update message with error
        setMessages((prev: Message[]) =>
          prev.map((msg: Message) =>
            msg.id === streamingMessageId
              ? { ...msg, content: `Error: ${error.message || 'Failed to get response'}`, streaming: false }
              : msg
          )
        )
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    adjustTextareaHeight()
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white via-slate-50/50 to-white dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-950 overflow-hidden transition-all duration-300">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 min-h-0">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}
        
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2 transition-colors">
                Start a conversation
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-500 transition-colors">
                Send a message to begin chatting with the LLM
              </p>
            </div>
          </div>
        ) : (
          messages.map((message: Message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-lg px-4 py-3 shadow-sm transition-colors ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-500/90 to-sky-500/80 text-white'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700/50'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                  {message.content || (message.streaming ? 'Thinking...' : '')}
                  {message.streaming && (
                    <span className="inline-block w-2 h-4 ml-1 bg-slate-400 animate-pulse" />
                  )}
                </div>
                <div className="text-xs mt-2 opacity-70">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm px-4 py-4 flex-shrink-0 transition-colors">
        <div className="flex items-end gap-2 max-w-5xl mx-auto">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={threadId ? "Type your message..." : "Type your message to start a new chat..."}
            disabled={isLoading}
            className="flex-1 min-h-[60px] max-h-[200px] px-4 py-3 bg-slate-50 dark:bg-slate-900/80 border-2 border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
          />
          <button
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              e.preventDefault()
              e.stopPropagation()
              handleSend()
            }}
            disabled={!inputValue.trim() || isLoading}
            className="flex items-center justify-center h-[60px] w-[60px] rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 text-white hover:from-indigo-600 hover:to-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg shadow-indigo-500/30"
            type="button"
            title={!inputValue.trim() ? 'Type a message to send' : isLoading ? 'Sending...' : 'Send message'}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <PaperAirplaneIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
