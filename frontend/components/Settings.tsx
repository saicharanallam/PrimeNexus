import { useState, useEffect } from 'react'
import { UserIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useUser } from '../src/hooks/useUser'
import { useSidebar } from '../src/hooks/useSidebar'
import SettingsSidebar from './sidebars/SettingsSidebar'

export default function Settings() {
  const { userId, userData, handleUserUpdate, fetchUserInfo } = useUser()
  const { registerSidebar, unregisterSidebar } = useSidebar()
  const [sidebarCollapsed, _setSidebarCollapsed] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    display_name: '',
    bio: '',
    avatar_url: '',
    phone: '',
    timezone: 'UTC',
  })

  // Register sidebar
  useEffect(() => {
    registerSidebar('settings', <SettingsSidebar collapsed={sidebarCollapsed} />)
    return () => unregisterSidebar('settings')
  }, [registerSidebar, unregisterSidebar, sidebarCollapsed])

  useEffect(() => {
    if (userData) {
      setEditForm({
        username: userData.username || '',
        email: userData.email || '',
        display_name: userData.display_name || '',
        bio: userData.bio || '',
        avatar_url: userData.avatar_url || '',
        phone: userData.phone || '',
        timezone: userData.timezone || 'UTC',
      })
    }
  }, [userData])

  const handleSave = async () => {
    if (!userData) return

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    const updates: any = {}
    if (editForm.username !== userData.username) updates.username = editForm.username
    if (editForm.email !== userData.email) updates.email = editForm.email || null
    if (editForm.display_name !== userData.display_name) updates.display_name = editForm.display_name || null
    if (editForm.bio !== userData.bio) updates.bio = editForm.bio || null
    if (editForm.avatar_url !== userData.avatar_url) updates.avatar_url = editForm.avatar_url || null
    if (editForm.phone !== userData.phone) updates.phone = editForm.phone || null
    if (editForm.timezone !== userData.timezone) updates.timezone = editForm.timezone || 'UTC'

    if (Object.keys(updates).length === 0) {
      setIsEditing(false)
      setIsSaving(false)
      return
    }

    const result = await handleUserUpdate(updates)

    if (result.success) {
      setSuccess('User details updated successfully')
      setIsEditing(false)
      fetchUserInfo()
      setTimeout(() => setSuccess(null), 3000)
    } else {
      setError(result.error || 'Failed to update user details')
    }
    
    setIsSaving(false)
  }

  const handleCancel = () => {
    if (userData) {
      setEditForm({
        username: userData.username || '',
        email: userData.email || '',
        display_name: userData.display_name || '',
        bio: userData.bio || '',
        avatar_url: userData.avatar_url || '',
        phone: userData.phone || '',
        timezone: userData.timezone || 'UTC',
      })
    }
    setIsEditing(false)
    setError(null)
    setSuccess(null)
  }

  if (!userId || !userData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4">
            Loading user data...
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors">
              Settings
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 transition-colors">
              Manage your account and preferences
            </p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <PencilIcon className="h-4 w-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors"
              >
                <CheckIcon className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-200 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* User Profile Card */}
        <div className="bg-white dark:bg-slate-800/60 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700/50 p-6 transition-colors">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {userData.avatar_url ? (
                <img
                  src={userData.avatar_url}
                  alt={userData.display_name || userData.username}
                  className="w-24 h-24 rounded-full object-cover border-4 border-slate-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 via-sky-500 to-emerald-400 flex items-center justify-center border-4 border-slate-200 dark:border-slate-700">
                  <UserIcon className="h-12 w-12 text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-4">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Username *</label>
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Display Name</label>
                      <input
                        type="text"
                        value={editForm.display_name}
                        onChange={(e) => setEditForm({...editForm, display_name: e.target.value})}
                        placeholder="Your friendly name"
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        placeholder="+1234567890"
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Avatar URL</label>
                      <input
                        type="url"
                        value={editForm.avatar_url}
                        onChange={(e) => setEditForm({...editForm, avatar_url: e.target.value})}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Timezone</label>
                      <input
                        type="text"
                        value={editForm.timezone}
                        onChange={(e) => setEditForm({...editForm, timezone: e.target.value})}
                        placeholder="UTC"
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      placeholder="Tell us about yourself"
                      rows={4}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 transition-colors">
                      {userData.display_name || userData.username}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 transition-colors">
                      @{userData.username}
                    </p>
                  </div>
                  {userData.bio && (
                    <p className="text-slate-700 dark:text-slate-300 transition-colors">
                      {userData.bio}
                    </p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Email</label>
                      <p className="text-sm text-slate-900 dark:text-slate-200 mt-1 transition-colors">
                        {userData.email || 'Not set'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Phone</label>
                      <p className="text-sm text-slate-900 dark:text-slate-200 mt-1 transition-colors">
                        {userData.phone || 'Not set'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Timezone</label>
                      <p className="text-sm text-slate-900 dark:text-slate-200 mt-1 transition-colors">
                        {userData.timezone || 'UTC'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">User ID</label>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-1 break-all transition-colors">
                        {userData.id}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

