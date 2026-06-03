import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authenticateAdmin } from '../../data/prensaFirebase'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // Check if already authenticated
  React.useEffect(() => {
    if (sessionStorage.getItem('prensa_admin_auth') === 'true') {
      navigate('/admin/dashboard')
    }
  }, [navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!username.trim() || !password.trim()) {
      setError('Completá usuario y contraseña')
      return
    }
    if (authenticateAdmin(username.trim(), password)) {
      sessionStorage.setItem('prensa_admin_auth', 'true')
      navigate('/admin/dashboard')
    } else {
      setError('Usuario o contraseña incorrectos')
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Panel de Administración</h1>
            <p className="text-sm text-slate-500 mt-1">Ingresá para gestionar Prensa Eldorado</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Usuario</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                placeholder="admin"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
                placeholder="••••••"
              />
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
            )}
            <button
              type="submit"
              className="w-full px-6 py-3 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 transition-colors"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
