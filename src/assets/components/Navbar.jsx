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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      {/* Top bar */}
      <div className="h-1 bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-500" />
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-9 h-9 bg-sky-500 rounded-[5px] flex items-center justify-center shadow-sm group-hover:bg-sky-600 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V5" />
              <path d="M11 14h2" /><path d="M11 10h2" /><path d="M11 6h2" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-slate-800 text-base leading-tight block">Prensa</span>
            <span className="text-sky-500 font-semibold text-[10px] tracking-wider uppercase -mt-0.5 block">Eldorado</span>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          {!isAdmin ? (
            <>
              <Link to="/" className="hidden sm:inline-flex px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-[5px] transition-colors">
                Inicio
              </Link>
              <Link to="/eventos" className="hidden sm:inline-flex px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-[5px] transition-colors">
                Eventos
              </Link>
              <Link to="/admin" className="p-2 text-slate-400 hover:text-sky-600 rounded-[5px] hover:bg-sky-50 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </Link>
            </>
          ) : (
            <Link to="/" className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-sky-600 rounded-[5px] transition-colors flex items-center gap-1.5">
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
        <div className="border-t border-slate-100 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none whitespace-nowrap">
              {categorias.map(cat => (
                <Link
                  key={cat.id}
                  to={`/categoria/${cat.id}`}
                  className="inline-flex px-3 py-1 text-xs font-medium text-slate-600 hover:text-white rounded-[5px] transition-colors flex-shrink-0"
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
