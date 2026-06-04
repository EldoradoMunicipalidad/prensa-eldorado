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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* ─── FEATURED ARTICLE ─── */}
      {featured && (
        <section className="mb-6">
          <ArticleCard articulo={featured} variant="featured" onClick={() => navigate(`/articulo/${featured.slug}`)} />
        </section>
      )}

      {/* ─── ARTÍCULOS + EVENTOS SIDEBAR ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-3">
          {siguientes.length > 0 && (
            <section>
              <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-200 pb-2.5">
                <span className="w-1 h-4 bg-sky-500 rounded-sm" />
                Últimas Noticias
              </h2>

              {siguientes.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 opacity-50">
                    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V5" />
                  </svg>
                  <p className="font-medium text-sm">No hay artículos publicados todavía</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Fila 1: wide + regular */}
                  {siguientes.length >= 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {siguientes[0] && (
                        <div className="md:col-span-2">
                          <ArticleCard articulo={siguientes[0]} variant="wide" onClick={() => navigate(`/articulo/${siguientes[0].slug}`)} />
                        </div>
                      )}
                      {siguientes[1] && (
                        <ArticleCard articulo={siguientes[1]} onClick={() => navigate(`/articulo/${siguientes[1].slug}`)} />
                      )}
                    </div>
                  )}

                  {/* Fila 2: 3 cards regulares */}
                  {siguientes.slice(2, 5).length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                      {siguientes.slice(2, 5).map(art => (
                        <ArticleCard key={art.id} articulo={art} onClick={() => navigate(`/articulo/${art.slug}`)} />
                      ))}
                    </div>
                  )}

                  {/* Fila 3: wide + regular alternado */}
                  {siguientes.length > 5 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
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

        {/* ─── SIDEBAR EVENTOS ─── */}
        <aside className="lg:col-span-1">
          {proximosEventos.length > 0 && (
            <div className="lg:sticky lg:top-20">
              <h3 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2 border-b border-slate-200 pb-2 uppercase tracking-wider">
                <span className="w-1 h-3 bg-amber-500 rounded-sm" />
                Próximos Eventos
              </h3>
              <div className="space-y-2">
                {proximosEventos.map(ev => (
                  <EventoCard key={ev.id} evento={ev} />
                ))}
              </div>
              <button
                onClick={() => navigate('/eventos')}
                className="mt-2 w-full py-2 text-xs font-semibold text-sky-500 border border-sky-200 hover:bg-sky-50 transition-colors rounded-lg"
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
