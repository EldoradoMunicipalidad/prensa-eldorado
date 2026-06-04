import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { subscribeCategorias } from '../../data/prensaFirebase'

export default function Navbar() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  const [categorias, setCategorias] = useState([])

  useEffect(() => {
    const unsub = subscribeCategorias(setCategorias)
    return () => unsub()
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top bar with gradient */}
      <div className="h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-orange-400" />

      <div className="max-w-7xl mx-auto px-6 h-14 md:h-16 flex items-center justify-between">
        {/* Logo + Brand */}
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <img
            src="/logo.jpg"
            alt="Eldorado"
            className="h-8 md:h-9 w-auto object-contain"
          />
          <div className="hidden sm:block">
            <span className="font-bold text-slate-800 text-sm md:text-base leading-tight block group-hover:text-sky-600 transition-colors">
              Prensa Eldorado
            </span>
            <span className="text-[10px] text-slate-400 tracking-wider uppercase -mt-0.5 block font-medium">
              Municipalidad
            </span>
          </div>
        </Link>

        {/* Right section */}
        <div className="flex items-center gap-1">
          {!isAdmin ? (
            <>
              <Link
                to="/"
                className="hidden sm:inline-flex px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
              >
                Inicio
              </Link>
              <Link
                to="/eventos"
                className="hidden sm:inline-flex px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
              >
                Eventos
              </Link>
              {/* Mobile menu dots */}
              <Link
                to="/eventos"
                className="sm:hidden p-2 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-sky-50 transition-colors"
                title="Eventos"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </Link>
            </>
          ) : (
            <Link
              to="/"
              className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-sky-600 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Volver
            </Link>
          )}
        </div>
      </div>

      {/* Categories bar */}
      {!isAdmin && categorias.length > 0 && (
        <div className="border-t border-gray-100 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none whitespace-nowrap">
              {categorias.map(cat => (
                <Link
                  key={cat.id}
                  to={`/categoria/${cat.id}`}
                  className="inline-flex px-3 py-1 text-xs font-medium rounded-lg transition-colors flex-shrink-0"
                  style={{
                    backgroundColor: 'transparent',
                    color: cat.color,
                  }}
                  onMouseEnter={e => { e.target.style.backgroundColor = cat.color; e.target.style.color = 'white' }}
                  onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = cat.color }}
                >
                  {cat.nombre}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
