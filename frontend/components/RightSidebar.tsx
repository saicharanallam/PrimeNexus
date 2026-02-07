import { useState, useRef, useEffect } from 'react'
import { useSidebar } from '../src/hooks/useSidebar'

export interface ChatThread {
  id: string
  title: string
  timestamp: Date
  messageCount: number
}

type MenuKey = 'chat' | 'settings' | 'database' | 'fractal'

interface RightSidebarProps {
  activeMenu: MenuKey
}

export default function RightSidebar({ activeMenu }: RightSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const collapseTimeoutRef = useRef<number | null>(null)
  const { getSidebarContent } = useSidebar()

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

  const content = getSidebarContent(activeMenu)

  return (
    <aside
      className={`group fixed right-0 top-0 h-full z-20 flex flex-col border-l border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-950/80 backdrop-blur-xl transition-all duration-500 ease-in-out transition-colors ${
        collapsed ? 'w-16' : 'w-64'
      }`}
      style={{
        minWidth: collapsed ? '4rem' : '16rem',
        transition: 'width 0.5s ease-in-out, min-width 0.5s ease-in-out',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {content}
    </aside>
  )
}
