import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { subscribeArticulos, subscribeEventos } from '../data/prensaFirebase'
import { ArticleCard, EventoCard, LoadingSpinner } from '../assets/components/Layout'

export default function HomePage() {
  const navigate = useNavigate()
  const [articulos, setArticulos] = useState([])
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubArts = subscribeArticulos(setArticulos)
    const unsubEves = subscribeEventos(setEventos)
    Promise.all([unsubArts, unsubEves]).then(() => setLoading(false))
    return () => { unsubArts(); unsubEves() }
  }, [])

  useEffect(() => {
    if (articulos.length) setLoading(false)
  }, [articulos])

  const ultimo = articulos[0]
  const destacados = useMemo(() => articulos.filter(a => a.destacado).slice(1, 4), [articulos])
  const secundarios = useMemo(() => articulos.slice(1, 5), [articulos])
  const resto = useMemo(() => articulos.slice(4), [articulos])
  const proximosEventos = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return eventos.filter(e => e.fecha >= today).slice(0, 3)
  }, [eventos])

  if (loading) return <LoadingSpinner />

  return (
    <>
      {/* ─── FULL-WIDTH HERO ─── */}
      {ultimo && (
        <section className="relative w-full overflow-hidden bg-slate-900" style={{ minHeight: 'min(70vh, 520px)' }}>
          {/* Background image */}
          {ultimo.imagen ? (
            <div className="absolute inset-0">
              <img src={ultimo.imagen} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/60 to-slate-900/30" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-sky-900 via-slate-800 to-slate-900" />
          )}

          {/* Content overlay */}
          <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-14 pt-28">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-3">
                <span
                  className="text-[11px] font-bold px-2.5 py-1 text-white"
                  style={{ backgroundColor: ultimo.categoriaColor || '#0EA5E9', borderRadius: '3px' }}
                >
                  {ultimo.categoriaNombre || ultimo.categoria || 'General'}
                </span>
                <span className="text-xs text-white/60">
                  {ultimo.fecha ? new Date(ultimo.fecha + 'T12:00:00').toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-3">
                {ultimo.titulo}
              </h1>
              {ultimo.resumen && (
                <p className="text-base md:text-lg text-white/80 leading-relaxed mb-6 line-clamp-2 max-w-2xl">
                  {ultimo.resumen}
                </p>
              )}
              <button
                onClick={() => navigate(`/articulo/${ultimo.slug}`)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold text-sm transition-colors"
                style={{ borderRadius: '5px' }}
              >
                Leer noticia
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 animate-bounce">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="opacity-50"><path d="M7 13l5 5 5-5M7 6l5 5 5-5"/></svg>
          </div>
        </section>
      )}

      {/* ─── ARTÍCULOS DESTACADOS (grid 2x2) ─── */}
      {secundarios.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 -mt-4 relative z-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {secundarios.slice(0, 4).map(art => (
              <ArticleCard key={art.id} articulo={art} onClick={() => navigate(`/articulo/${art.slug}`)} />
            ))}
          </div>
        </section>
      )}

      {/* ─── CONTENEDOR PRINCIPAL ─── */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

          {/* Columna principal */}
          <div className="lg:col-span-3">
            {/* Destacados */}
            {destacados.length > 0 && (
              <section className="mb-10">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-3">
                  <span className="w-1 h-5 bg-sky-500" style={{ borderRadius: '2px' }} />
                  Destacados
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {destacados.map(art => (
                    <ArticleCard key={art.id} articulo={art} variant="compact" onClick={() => navigate(`/articulo/${art.slug}`)} />
                  ))}
                </div>
              </section>
            )}

            {/* Últimas noticias */}
            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-3">
                <span className="w-1 h-5 bg-sky-500" style={{ borderRadius: '2px' }} />
                Últimas Noticias
              </h2>
              {resto.length === 0 && secundarios.length === 0 && !ultimo ? (
                <div className="text-center py-12 text-slate-400">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 opacity-50">
                    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V5" />
                  </svg>
                  <p className="font-medium">No hay artículos publicados todavía</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {resto.map(art => (
                    <ArticleCard key={art.id} articulo={art} variant="compact" onClick={() => navigate(`/articulo/${art.slug}`)} />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Eventos próximos */}
            {proximosEventos.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
                  <span className="w-1 h-4 bg-amber-500" style={{ borderRadius: '2px' }} />
                  Próximos Eventos
                </h3>
                <div className="space-y-2">
                  {proximosEventos.map(ev => (
                    <EventoCard key={ev.id} evento={ev} />
                  ))}
                </div>
                <button
                  onClick={() => navigate('/eventos')}
                  className="mt-3 w-full py-2 text-xs font-semibold text-sky-500 border border-sky-200 hover:bg-sky-50 transition-colors"
                  style={{ borderRadius: '5px' }}
                >
                  Ver todos →
                </button>
              </div>
            )}

            {/* Stats card */}
            <div className="bg-sky-50 border border-sky-200 p-4" style={{ borderRadius: '5px' }}>
              <h3 className="text-sm font-bold text-slate-800 mb-2">Prensa Eldorado</h3>
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-2xl font-bold text-sky-600">{articulos.length}</span>
                  <p className="text-[11px] text-slate-500">artículos</p>
                </div>
                <div>
                  <span className="text-2xl font-bold text-sky-600">{eventos.length}</span>
                  <p className="text-[11px] text-slate-500">eventos</p>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </>
  )
}
