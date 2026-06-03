import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="h-1 bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-500" />
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-sky-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V5" />
              <path d="M11 14h2" />
              <path d="M11 10h2" />
              <path d="M11 6h2" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-slate-800 text-lg leading-tight block">Prensa</span>
            <span className="text-sky-500 font-semibold text-xs tracking-wider uppercase -mt-1 block">Eldorado</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {!isAdmin ? (
            <>
              <Link to="/" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors">
                Inicio
              </Link>
              <Link to="/eventos" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors">
                Eventos
              </Link>
              <Link to="/admin" className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-sky-600 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </Link>
            </>
          ) : (
            <Link to="/" className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-sky-600 transition-colors flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Volver al sitio
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
