import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { subscribeCategorias } from '../../data/prensaFirebase'

export default function Footer() {
  const [categorias, setCategorias] = useState([])

  useEffect(() => {
    const unsub = subscribeCategorias(setCategorias)
    return () => unsub()
  }, [])

  return (
    <footer className="bg-slate-900 text-slate-300 pt-10 pb-6 px-6 border-t border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-sky-500 flex items-center justify-center" style={{ borderRadius: '5px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V5" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-base leading-tight">Prensa Eldorado</p>
                <p className="text-sky-400 text-[10px] uppercase tracking-wider">Prensa Municipal</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Noticias, artículos y eventos de la Municipalidad de Eldorado. Información oficial de cada Secretaría.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Secretarías</h4>
            <ul className="space-y-1.5">
              {categorias.slice(0, 8).map(cat => (
                <li key={cat.id}>
                  <Link to={`/categoria/${cat.id}`} className="text-xs text-slate-400 hover:text-sky-400 transition-colors">
                    {cat.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Navegación</h4>
            <ul className="space-y-1.5">
              <li><Link to="/" className="text-xs text-slate-400 hover:text-sky-400 transition-colors">Inicio</Link></li>
              <li><Link to="/eventos" className="text-xs text-slate-400 hover:text-sky-400 transition-colors">Eventos</Link></li>
              <li><a href="https://www.eldorado.gob.ar" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-400 hover:text-sky-400 transition-colors">Municipalidad</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Contacto</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>Simón J. Bolívar N° 73</li>
              <li>Eldorado, Misiones</li>
              <li>(+54) 03751 - 421787</li>
              <li><a href="mailto:prensa@eldorado.gob.ar" className="text-sky-400 hover:text-sky-300 transition-colors">prensa@eldorado.gob.ar</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-slate-600">
            © {new Date().getFullYear()} Municipalidad de Eldorado — Dpto. Desarrollo Tecnológico
          </p>
        </div>
      </div>
    </footer>
  )
}
