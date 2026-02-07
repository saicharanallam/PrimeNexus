import { createContext, useState, ReactNode, useCallback } from 'react'

type MenuKey = 'chat' | 'settings' | 'database' | 'fractal'

interface SidebarContextType {
  registerSidebar: (menuKey: MenuKey, content: ReactNode) => void
  unregisterSidebar: (menuKey: MenuKey) => void
  getSidebarContent: (menuKey: MenuKey) => ReactNode | null
}

export const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [registrations, setRegistrations] = useState<Map<MenuKey, ReactNode>>(new Map())

  const registerSidebar = useCallback((menuKey: MenuKey, content: ReactNode) => {
    setRegistrations(prev => {
      const next = new Map(prev)
      next.set(menuKey, content)
      return next
    })
  }, [])

  const unregisterSidebar = useCallback((menuKey: MenuKey) => {
    setRegistrations(prev => {
      const next = new Map(prev)
      next.delete(menuKey)
      return next
    })
  }, [])

  const getSidebarContent = useCallback((menuKey: MenuKey) => {
    return registrations.get(menuKey) || null
  }, [registrations])

  return (
    <SidebarContext.Provider value={{ registerSidebar, unregisterSidebar, getSidebarContent }}>
      {children}
    </SidebarContext.Provider>
  )
}
