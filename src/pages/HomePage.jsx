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
    if (articulos.length || loading === false) setLoading(false)
  }, [articulos])

  const featured = articulos[0]
  const siguientes = articulos.slice(1)
  const proximosEventos = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return eventos.filter(e => e.fecha >= today).slice(0, 4)
  }, [eventos])

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* ─── FEATURED ARTICLE ─── */}
      {featured && (
        <section className="mb-8">
          <ArticleCard articulo={featured} variant="featured" onClick={() => navigate(`/articulo/${featured.slug}`)} />
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* ─── COLUMNA PRINCIPAL ─── */}
        <div className="lg:col-span-3 space-y-8">

          {/* Mixed grid: wide + regular alternados */}
          {siguientes.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-3">
                <span className="w-1 h-5 bg-sky-500" style={{ borderRadius: '2px' }} />
                Últimas Noticias
              </h2>

              {siguientes.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 opacity-50">
                    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V5" />
                  </svg>
                  <p className="font-medium">No hay artículos publicados todavía</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Fila 1: wide + regular */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {siguientes[0] && (
                      <div className="md:col-span-2">
                        <ArticleCard articulo={siguientes[0]} variant="wide" onClick={() => navigate(`/articulo/${siguientes[0].slug}`)} />
                      </div>
                    )}
                    {siguientes[1] && (
                      <ArticleCard articulo={siguientes[1]} onClick={() => navigate(`/articulo/${siguientes[1].slug}`)} />
                    )}
                  </div>

                  {/* Fila 2: 3 cards regulares */}
                  {siguientes.slice(2, 5).length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {siguientes.slice(2, 5).map(art => (
                        <ArticleCard key={art.id} articulo={art} onClick={() => navigate(`/articulo/${art.slug}`)} />
                      ))}
                    </div>
                  )}

                  {/* Fila 3: wide + regular (alternado) */}
                  {siguientes.length > 5 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {siguientes[5] && (
                        <ArticleCard articulo={siguientes[5]} onClick={() => navigate(`/articulo/${siguientes[5].slug}`)} />
                      )}
                      {siguientes[6] && (
                        <div className="md:col-span-2">
                          <ArticleCard articulo={siguientes[6]} variant="wide" onClick={() => navigate(`/articulo/${siguientes[6].slug}`)} />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Resto: grid 3 columnas */}
                  {siguientes.length > 7 && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {siguientes.slice(7).map(art => (
                        <ArticleCard key={art.id} articulo={art} onClick={() => navigate(`/articulo/${art.slug}`)} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}
        </div>

        {/* ─── SIDEBAR: solo eventos ─── */}
        <aside className="lg:col-span-1 space-y-5">
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
        </aside>
      </div>
    </div>
  )
}
