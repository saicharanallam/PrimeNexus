import { useState, useRef, useEffect } from 'react'
import {
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline'

type MenuKey = 'chat' | 'settings' | 'database'

interface SidebarProps {
  activeMenu: MenuKey
  onSelect: (menu: MenuKey) => void
}

const menuItems: {
  key: MenuKey
  label: string
  description: string
  icon: (props: { className?: string }) => any
}[] = [
  {
    key: 'chat',
    label: 'Chat Bot',
    description: 'Talk to LLM',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    key: 'database',
    label: 'Database',
    description: 'Browse tables',
    icon: TableCellsIcon,
  },
  {
    key: 'settings',
    label: 'Settings',
    description: 'App settings',
    icon: Cog6ToothIcon,
  },
]

export default function Sidebar({ activeMenu, onSelect }: SidebarProps) {
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

  return (
    <aside
      className={`group fixed left-0 top-0 h-full z-20 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-950/80 backdrop-blur-xl transition-all duration-500 ease-in-out transition-colors ${
        collapsed ? 'w-16' : 'w-64'
      }`}
      style={{ 
        minWidth: collapsed ? '4rem' : '16rem',
        transition: 'width 0.5s ease-in-out, min-width 0.5s ease-in-out'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-center px-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 via-sky-500 to-emerald-400 shadow-lg shadow-sky-500/40 transition-all duration-300">
          <svg className="h-6 w-6" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Nexus symbol - interconnected nodes */}
            <circle cx="50" cy="50" r="8" fill="white" opacity="0.95"/>
            <circle cx="50" cy="25" r="5" fill="white" opacity="0.9"/>
            <circle cx="75" cy="50" r="5" fill="white" opacity="0.9"/>
            <circle cx="50" cy="75" r="5" fill="white" opacity="0.9"/>
            <circle cx="25" cy="50" r="5" fill="white" opacity="0.9"/>
            <line x1="50" y1="50" x2="50" y2="25" stroke="white" strokeWidth="2" opacity="0.7"/>
            <line x1="50" y1="50" x2="75" y2="50" stroke="white" strokeWidth="2" opacity="0.7"/>
            <line x1="50" y1="50" x2="50" y2="75" stroke="white" strokeWidth="2" opacity="0.7"/>
            <line x1="50" y1="50" x2="25" y2="50" stroke="white" strokeWidth="2" opacity="0.7"/>
          </svg>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-3 mb-2 border-t border-slate-200 dark:border-slate-800/80 transition-colors" />

      {/* Nav Items */}
      <nav className="flex-1 space-y-1 px-2 py-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = activeMenu === item.key

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={`group/item relative flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-sm transition-all duration-150 transition-colors ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500/80 via-sky-500/70 to-emerald-500/60 text-white dark:text-slate-50 shadow-md shadow-sky-500/30'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                  isActive
                    ? 'border-white/0 bg-white/20 dark:bg-slate-950/30'
                    : 'border-slate-300/80 dark:border-slate-700/80 bg-slate-100/60 dark:bg-slate-900/60'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>

              {/* Label / Description */}
              {!collapsed && (
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate font-medium">
                    {item.label}
                  </span>
                  <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {item.description}
                  </span>
                </div>
              )}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
