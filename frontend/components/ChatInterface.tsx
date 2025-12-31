import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent, MouseEvent } from 'react'
import { PaperAirplaneIcon } from '@heroicons/react/24/outline'

// Minimal JSX typing
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  streaming?: boolean
}

interface ChatInterfaceProps {
  threadId: string | null
  userId: string
  apiUrl?: string
  onThreadCreated?: (threadId: string) => void
}

export default function ChatInterface({ threadId, userId, apiUrl = 'http://localhost:8000', onThreadCreated }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Load messages when thread changes
  useEffect(() => {
    if (threadId) {
      loadMessages()
    } else {
      setMessages([])
    }
  }, [threadId])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    if (!threadId) return

    try {
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
    }
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
        if (onThreadCreated) {
          onThreadCreated(newThreadId)
        }
        return newThreadId
      } else {
        console.error('Failed to create chat thread')
        return null
      }
    } catch (error) {
      console.error('Error creating chat thread:', error)
      return null
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) {
      console.log('Cannot send:', { hasInput: !!inputValue.trim(), isLoading, inputValue })
      return
    }

    if (!userId) {
      console.error('No userId provided')
      alert('User not initialized. Please refresh the page.')
      return
    }

    console.log('Sending message:', { threadId, userId, content: inputValue.substring(0, 50) })

    // Auto-create thread if none exists
    let currentThreadId = threadId
    if (!currentThreadId) {
      console.log('No threadId, creating new thread...')
      currentThreadId = await createThread()
      if (!currentThreadId) {
        // Failed to create thread, show error
        const errorMsg = 'Failed to create chat thread. Please check the console and try again.'
        console.error('Thread creation failed')
        alert(errorMsg)
        return
      }
      console.log('Thread created:', currentThreadId)
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev: Message[]) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

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
      console.log('Fetching stream from:', streamUrl)
      
      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: userMessage.content }),
        signal: abortControllerRef.current.signal,
      })

      console.log('Stream response status:', response.status, response.statusText)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Stream error response:', errorText)
        throw new Error(`Failed to stream response: ${response.status} ${response.statusText}`)
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
          if (line.startsWith('data: ')) {
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
        console.log('Request aborted')
      } else {
        console.error('Error streaming response:', error)
        // Update message with error
        setMessages((prev: Message[]) =>
          prev.map((msg: Message) =>
            msg.id === streamingMessageId
              ? { ...msg, content: `Error: ${error.message}`, streaming: false }
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

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-slate-300 mb-2">
                Start a conversation
              </h3>
              <p className="text-sm text-slate-500">
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
                className={`max-w-3xl rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-500/80 to-sky-500/70 text-white'
                    : 'bg-slate-800/60 text-slate-100'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                  {message.streaming && (
                    <span className="inline-block w-2 h-4 ml-1 bg-slate-400 animate-pulse" />
                  )}
                </div>
                <div className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-800 px-4 py-4">
        <div className="flex items-end gap-2">
          <textarea
            value={inputValue}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
              setInputValue(e.target.value)
              console.log('Input changed:', e.target.value)
            }}
            onKeyDown={handleKeyDown}
            placeholder={threadId ? "Type your message..." : "Type your message to start a new chat..."}
            disabled={isLoading}
            className="flex-1 min-h-[60px] max-h-[200px] px-4 py-3 bg-slate-900/60 border-2 border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            rows={1}
          />
          <button
            onClick={(e: MouseEvent<HTMLButtonElement>) => {
              e.preventDefault()
              e.stopPropagation()
              console.log('Send button clicked', { 
                inputValue: inputValue.substring(0, 20), 
                inputLength: inputValue.length,
                hasTrimmedInput: !!inputValue.trim(),
                isLoading, 
                userId, 
                threadId 
              })
              handleSend()
            }}
            disabled={!inputValue.trim() || isLoading}
            className="flex items-center justify-center h-[60px] w-[60px] rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 text-white hover:from-indigo-600 hover:to-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
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

