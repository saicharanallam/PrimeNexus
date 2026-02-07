import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import RightSidebar from '../components/RightSidebar'
import ChatInterface from '../components/ChatInterface'
import DatabaseBrowser from '../components/DatabaseBrowser'
import Settings from '../components/Settings'
import FractalSelector from '../components/fractal/FractalSelector'
import { ThemeProvider } from './contexts/ThemeContext'
import { UserProvider } from './contexts/UserContext'
import { ChatProvider } from './contexts/ChatContext'
import { SidebarProvider } from './contexts/SidebarContext'
import { useUser } from './hooks/useUser'

type MenuKey = 'chat' | 'settings' | 'database' | 'fractal'

function AppContent() {
  const [activeMenu, setActiveMenu] = useState<MenuKey>('chat')
  const { userId, apiUrl } = useUser()

  const renderMainContent = () => {
    if (activeMenu === 'chat') {
      if (!userId) {
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-300 mb-4">
                Initializing...
              </h2>
              <p className="text-slate-500">Setting up your account</p>
            </div>
          </div>
        )
      }
      return <ChatInterface />
    } else if (activeMenu === 'database') {
      return <DatabaseBrowser apiUrl={apiUrl} />
    } else if (activeMenu === 'settings') {
      return <Settings />
    } else if (activeMenu === 'fractal') {
      const rustServiceUrl = import.meta.env.VITE_RUST_SERVICE_URL || 'http://localhost:8001'
      return <FractalSelector rustServiceUrl={rustServiceUrl} />
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
      <RightSidebar activeMenu={activeMenu} />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <ChatProvider>
          <SidebarProvider>
            <AppContent />
          </SidebarProvider>
        </ChatProvider>
      </UserProvider>
    </ThemeProvider>
  )
}

export default App
