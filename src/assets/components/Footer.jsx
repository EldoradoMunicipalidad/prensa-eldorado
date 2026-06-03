import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { subscribeCategorias } from '../../data/prensaFirebase'

function FooterCategorias({ categorias }) {
  return (
    <ul className="space-y-2">
      {categorias.slice(0, 8).map(cat => (
        <li key={cat.id}>
          <Link to={`/categoria/${cat.id}`} className="text-sm text-slate-400 hover:text-sky-400 transition-colors">
            {cat.nombre}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default function Footer() {
  const [categorias, setCategorias] = useState([])

  useEffect(() => {
    const unsub = subscribeCategorias(setCategorias)
    return () => unsub()
  }, [])

  return (
    <footer className="bg-slate-800 text-slate-300 pt-12 pb-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V5" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-tight">Prensa Eldorado</p>
                <p className="text-sky-400 text-xs">Prensa Municipal</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Noticias, artículos y eventos de la Municipalidad de Eldorado. Información oficial de cada Secretaría.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Secretarías</h4>
            <FooterCategorias categorias={categorias} />
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Navegación</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-slate-400 hover:text-sky-400 transition-colors">Inicio</Link></li>
              <li><Link to="/eventos" className="text-sm text-slate-400 hover:text-sky-400 transition-colors">Eventos</Link></li>
              <li><a href="https://www.eldorado.gob.ar" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-400 hover:text-sky-400 transition-colors">Municipalidad</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>Simón J. Bolívar N° 73</li>
              <li>Eldorado, Misiones</li>
              <li>(+54) 03751 - 421787</li>
              <li>
                <a href="mailto:prensa@eldorado.gob.ar" className="text-sky-400 hover:text-sky-300 transition-colors">
                  prensa@eldorado.gob.ar
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-700 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">
            Copyright 2025 © Municipalidad de la ciudad de Eldorado. Dpto Desarrollo Tecnológico Robótica e Innovación.
          </p>
        </div>
      </div>
    </footer>
  )
}
