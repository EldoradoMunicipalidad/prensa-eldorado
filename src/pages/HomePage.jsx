import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { subscribeArticulos, subscribeEventos, subscribeCategorias } from '../data/prensaFirebase'
import { ArticleCard, EventoCard, LoadingSpinner } from '../assets/components/Layout'

export default function HomePage() {
  const navigate = useNavigate()
  const [articulos, setArticulos] = useState([])
  const [eventos, setEventos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubArts = subscribeArticulos(setArticulos)
    const unsubEves = subscribeEventos(setEventos)
    const unsubCats = subscribeCategorias((cats) => {
      setCategorias(cats)
      setLoading(false)
    })
    return () => { unsubArts(); unsubEves(); unsubCats() }
  }, [])

  const destacados = useMemo(() => articulos.filter(a => a.destacado).slice(0, 3), [articulos])
  const ultimos = useMemo(() => articulos.slice(0, 6), [articulos])
  const proximosEventos = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return eventos.filter(e => e.fecha >= today).slice(0, 4)
  }, [eventos])

  if (loading) return <LoadingSpinner />

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-sky-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 text-xs font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
                <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
                Noticias Municipales
              </div>
              <h1 className="text-4xl md:text-6xl font-light text-slate-800 leading-tight mb-4">
                Bienvenidos a <br />
                <span className="font-bold text-sky-500">Prensa Eldorado</span>
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed max-w-xl">
                Información oficial, novedades y eventos de la Municipalidad de Eldorado, 
                organizados por cada Secretaría municipal.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                {categorias.slice(0, 4).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => navigate(`/categoria/${cat.id}`)}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all ${
                      cat.id === 'gobierno' ? 'bg-sky-500 text-white border-sky-500 hover:bg-sky-600' :
                      cat.id === 'obras-publicas' ? 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600' :
                      cat.id === 'ambiente' ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' :
                      'bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-600'
                    }`}
                  >
                    {cat.nombre.replace('Secretaría de ', '')}
                  </button>
                ))}
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="w-72 h-72 bg-sky-100 rounded-[40px] rotate-12 absolute -top-6 -left-6" />
                <div className="w-72 h-72 bg-amber-100 rounded-[40px] -rotate-6 absolute top-3 left-3" />
                <div className="w-72 h-72 bg-white rounded-[40px] shadow-lg relative z-10 flex items-center justify-center border border-slate-100">
                  <div className="text-center p-8">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="1.5" className="mx-auto mb-4">
                      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V5" />
                      <path d="M11 14h2" /><path d="M11 10h2" /><path d="M11 6h2" />
                    </svg>
                    <p className="text-slate-400 text-sm">Últimas noticias</p>
                    <p className="text-3xl font-bold text-sky-500 mt-1">{articulos.length}</p>
                    <p className="text-xs text-slate-400">artículos publicados</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destacados */}
      {destacados.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-500 rounded-full" />
            Destacados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {destacados.map(art => (
              <ArticleCard key={art.id} articulo={art} onClick={() => navigate(`/articulo/${art.slug}`)} />
            ))}
          </div>
        </section>
      )}

      {/* Últimos Artículos */}
      <section className="bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-500 rounded-full" />
            Últimas Noticias
          </h2>
          {ultimos.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 opacity-50">
                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V5" />
              </svg>
              <p className="font-medium">No hay artículos publicados todavía</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ultimos.map(art => (
                <ArticleCard key={art.id} articulo={art} onClick={() => navigate(`/articulo/${art.slug}`)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Eventos próximos */}
      {proximosEventos.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
              Próximos Eventos
            </h2>
            <button
              onClick={() => navigate('/eventos')}
              className="text-sm font-semibold text-sky-500 hover:text-sky-600 transition-colors"
            >
              Ver todos →
            </button>
          </div>
          <div className="space-y-3">
            {proximosEventos.map(ev => (
              <EventoCard key={ev.id} evento={ev} />
            ))}
          </div>
        </section>
      )}

      {/* Categorías */}
      <section className="bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-sky-500 rounded-full" />
            Noticias por Secretaría
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorias.map(cat => (
              <button
                key={cat.id}
                onClick={() => navigate(`/categoria/${cat.id}`)}
                className="group bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-left flex items-center gap-4"
              >
                <div className={`w-12 h-12 ${cat.color || 'bg-sky-500'} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V5" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-sky-600 transition-colors">
                    {cat.nombre.replace('Secretaría de ', '')}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{cat.descripcion}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
