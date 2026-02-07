import { ReactNode } from 'react'

export type MenuKey = 'chat' | 'settings' | 'database' | 'fractal'

export interface SidebarRegistration {
  menuKey: MenuKey
  content: ReactNode
}

export interface SidebarProps {
  collapsed: boolean
}
