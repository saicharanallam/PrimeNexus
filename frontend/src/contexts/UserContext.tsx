import { createContext, useState, useEffect, ReactNode, useCallback } from 'react'

interface UserContextType {
  userId: string | null
  currentUsername: string | null
  userData: any | null
  setUserId: (userId: string | null) => void
  setCurrentUsername: (username: string | null) => void
  setUserData: (data: any) => void
  initializeUser: () => Promise<void>
  fetchUserInfo: () => Promise<void>
  handleUserUpdate: (updates: any) => Promise<{ success: boolean; error?: string }>
  handleUserIdChange: (newUserId: string) => Promise<{ success: boolean; error?: string }>
  apiUrl: string
}

export const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null)
  const [currentUsername, setCurrentUsername] = useState<string | null>(null)
  const [userData, setUserData] = useState<any>(null)

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

  const fetchUserInfo = useCallback(async () => {
    if (!userId) return
    try {
      const response = await fetch(`${apiUrl}/api/users/${userId}`)
      if (response.ok) {
        const user = await response.json()
        setCurrentUsername(user.username)
        setUserData(user)
      }
    } catch (error) {
      console.error('Error fetching user info:', error)
    }
  }, [userId, apiUrl])

  const handleUserUpdate = useCallback(async (updates: any) => {
    if (!userId) return { success: false, error: 'No user ID' }

    try {
      const response = await fetch(`${apiUrl}/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to update user')
      }

      const updatedUser = await response.json()
      setUserData(updatedUser)
      setCurrentUsername(updatedUser.username)

      return { success: true }
    } catch (error: any) {
      console.error('Error updating user:', error)
      return { success: false, error: error.message || 'Failed to update user' }
    }
  }, [userId, apiUrl])

  const handleUserIdChange = useCallback(async (newUserId: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/users/${newUserId}`)
      if (!response.ok) {
        throw new Error('User not found')
      }

      const user = await response.json()
      setUserId(user.id)
      localStorage.setItem('userId', user.id)
      setCurrentUsername(user.username)

      localStorage.removeItem('activeChatId')

      return { success: true }
    } catch (error: any) {
      console.error('Error changing user ID:', error)
      return { success: false, error: error.message || 'Failed to change user ID' }
    }
  }, [apiUrl])

  const initializeUser = useCallback(async () => {
    const storedUserId = localStorage.getItem('userId')
    const defaultUsername = 'default_user'

    try {
      if (storedUserId) {
        try {
          const verifyResponse = await fetch(`${apiUrl}/api/users/${storedUserId}`)
          if (verifyResponse.ok) {
            const user = await verifyResponse.json()
            console.log('User verified from localStorage:', user.id)
            setUserId(user.id)
            setCurrentUsername(user.username)
            return
          } else {
            localStorage.removeItem('userId')
          }
        } catch (error) {
          console.error('Error verifying user:', error)
          localStorage.removeItem('userId')
        }
      }

      try {
        const getByUsernameResponse = await fetch(`${apiUrl}/api/users/by-username/${defaultUsername}`)
        if (getByUsernameResponse.ok) {
          const user = await getByUsernameResponse.json()
          console.log('Retrieved existing default_user:', user.id)
          setUserId(user.id)
          setCurrentUsername(user.username)
          localStorage.setItem('userId', user.id)
          return
        }
      } catch (error) {
        console.log('default_user not found, will create new user')
      }

      const response = await fetch(`${apiUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: defaultUsername,
          email: null,
        }),
      })

      if (response.ok) {
        const user = await response.json()
        console.log('User created/initialized:', user.id)
        setUserId(user.id)
        setCurrentUsername(user.username)
        localStorage.setItem('userId', user.id)
      } else {
        console.error('Failed to create user:', response.status)
      }
    } catch (error) {
      console.error('Error initializing user:', error)
    }
  }, [apiUrl])

  useEffect(() => {
    initializeUser()
  }, [initializeUser])

  useEffect(() => {
    if (userId) {
      fetchUserInfo()
    }
  }, [userId, fetchUserInfo])

  return (
    <UserContext.Provider
      value={{
        userId,
        currentUsername,
        userData,
        setUserId,
        setCurrentUsername,
        setUserData,
        initializeUser,
        fetchUserInfo,
        handleUserUpdate,
        handleUserIdChange,
        apiUrl,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}
