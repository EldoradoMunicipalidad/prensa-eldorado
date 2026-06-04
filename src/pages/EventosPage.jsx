import React, { useState, useEffect, useMemo } from 'react'
import { subscribeEventos, subscribeCategorias } from '../data/prensaFirebase'
import { EventoCard, LoadingSpinner } from '../assets/components/Layout'

export default function EventosPage() {
  const [eventos, setEventos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [filtroEstado, setFiltroEstado] = useState('proximos')

  useEffect(() => {
    const unsubEve = subscribeEventos(setEventos)
    const unsubCat = subscribeCategorias((cats) => {
      setCategorias(cats)
      setLoading(false)
    })
    return () => { unsubEve(); unsubCat() }
  }, [])

  const today = new Date().toISOString().slice(0, 10)

  const filtrados = useMemo(() => {
    let items = [...eventos]
    if (filtroCategoria !== 'todas') items = items.filter(e => e.categoria === filtroCategoria)
    if (filtroEstado === 'proximos') items = items.filter(e => e.fecha >= today)
    else if (filtroEstado === 'pasados') items = items.filter(e => e.fecha < today)
    return items.sort((a, b) => a.fecha.localeCompare(b.fecha))
  }, [eventos, filtroCategoria, filtroEstado, today])

  if (loading) return <LoadingSpinner />

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8 md:py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Eventos</h1>
          <p className="text-sm text-slate-500 mt-1">Calendario de eventos, actividades y fechas importantes de la Municipalidad de Eldorado.</p>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-6 py-8">
        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-8">
          <select
            value={filtroCategoria}
            onChange={e => setFiltroCategoria(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-sky-500 outline-none"
            style={{ borderRadius: '5px' }}
          >
            <option value="todas">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
          <div className="flex bg-white border border-slate-200 p-0.5" style={{ borderRadius: '5px' }}>
            <button
              onClick={() => setFiltroEstado('proximos')}
              className={`px-3.5 py-1.5 text-xs font-semibold transition-colors ${filtroEstado === 'proximos' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              style={{ borderRadius: '4px' }}
            >
              Próximos
            </button>
            <button
              onClick={() => setFiltroEstado('pasados')}
              className={`px-3.5 py-1.5 text-xs font-semibold transition-colors ${filtroEstado === 'pasados' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              style={{ borderRadius: '4px' }}
            >
              Pasados
            </button>
            <button
              onClick={() => setFiltroEstado('todos')}
              className={`px-3.5 py-1.5 text-xs font-semibold transition-colors ${filtroEstado === 'todos' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              style={{ borderRadius: '4px' }}
            >
              Todos
            </button>
          </div>
        </div>

        {/* Lista */}
        {filtrados.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4 opacity-30">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <p className="text-lg font-medium">No hay eventos {filtroEstado === 'proximos' ? 'próximos' : filtroEstado === 'pasados' ? 'pasados' : ''}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtrados.map(ev => (
              <EventoCard key={ev.id} evento={ev} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
