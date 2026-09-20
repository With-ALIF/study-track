import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Save, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
    } else {
      setMessage('Password updated successfully.')
      setPassword('')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account settings.</p>
      </div>

      {message && (
        <div className="bg-green-50 text-green-700 text-sm rounded-lg p-3">{message}</div>
      )}
      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3">{error}</div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Account</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <div className="mb-6 pb-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Email</h3>
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-700 flex-1">{user?.email}</span>
            <Lock className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Email cannot be changed.</p>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Update Password</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            Update Password
          </button>
        </form>
      </div>
    </div>
  )
}
