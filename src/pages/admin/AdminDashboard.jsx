import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { subscribeArticulos, subscribeEventos, subscribeCategorias } from '../../data/prensaFirebase'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [articulos, setArticulos] = useState([])
  const [eventos, setEventos] = useState([])
  const [categorias, setCategorias] = useState([])

  useEffect(() => {
    if (sessionStorage.getItem('prensa_admin_auth') !== 'true') {
      navigate('/admin')
      return
    }
    const unsubArts = subscribeArticulos(setArticulos)
    const unsubEves = subscribeEventos(setEventos)
    const unsubCats = subscribeCategorias(setCategorias)
    return () => { unsubArts(); unsubEves(); unsubCats() }
  }, [navigate])

  const handleLogout = () => {
    sessionStorage.removeItem('prensa_admin_auth')
    navigate('/admin')
  }

  const stats = [
    { label: 'Artículos', count: articulos.length, icon: 'newspaper', color: 'bg-sky-500', onClick: () => navigate('/admin/articulos') },
    { label: 'Eventos', count: eventos.length, icon: 'calendar', color: 'bg-amber-500', onClick: () => navigate('/admin/eventos') },
    { label: 'Categorías', count: categorias.length, icon: 'folder', color: 'bg-emerald-500', onClick: () => navigate('/admin/categorias') },
  ]

  const ultimosArticulos = [...articulos].sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '')).slice(0, 5)

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Panel de Administración</h1>
          <p className="text-sm text-slate-500">Gestioná el contenido de Prensa Eldorado</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-xl transition-colors"
        >
          Cerrar sesión
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(stat => (
          <button
            key={stat.label}
            onClick={stat.onClick}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-left group"
          >
            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {stat.icon === 'newspaper' && <><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V5"/><path d="M11 14h2"/><path d="M11 10h2"/><path d="M11 6h2"/></>}
                {stat.icon === 'calendar' && <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}
                {stat.icon === 'folder' && <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></>}
              </svg>
            </div>
            <p className="text-3xl font-bold text-slate-800">{stat.count}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </button>
        ))}
      </div>

      {/* Últimos artículos */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Últimos Artículos</h2>
        {ultimosArticulos.length === 0 ? (
          <p className="text-slate-400 text-sm py-4">No hay artículos publicados.</p>
        ) : (
          <div className="space-y-3">
            {ultimosArticulos.map(art => (
              <div key={art.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-800 text-sm truncate">{art.titulo}</p>
                  <p className="text-xs text-slate-400">{art.fecha} · {art.categoria}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${art.destacado ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                  {art.destacado ? 'Destacado' : 'Normal'}
                </span>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => navigate('/admin/articulos')}
          className="mt-4 w-full py-2.5 text-sm font-semibold text-sky-500 border border-sky-200 rounded-xl hover:bg-sky-50 transition-colors"
        >
          Gestionar Artículos
        </button>
      </div>
    </div>
  )
}
