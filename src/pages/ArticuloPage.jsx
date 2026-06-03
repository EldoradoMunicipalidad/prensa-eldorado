import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { subscribeArticulos, subscribeCategorias, formatFecha } from '../data/prensaFirebase'
import { LoadingSpinner } from '../assets/components/Layout'

export default function ArticuloPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [articulos, setArticulos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubArt = subscribeArticulos(setArticulos)
    const unsubCat = subscribeCategorias((cats) => {
      setCategorias(cats)
    })
    Promise.all([unsubArt, unsubCat]).then(() => setLoading(false))
    return () => { unsubArt(); unsubCat() }
  }, [])

  useEffect(() => {
    if (articulos.length && categorias.length) setLoading(false)
  }, [articulos, categorias])

  const articulo = useMemo(() => articulos.find(a => a.slug === slug), [articulos, slug])
  const categoria = articulo ? categorias.find(c => c.id === articulo.categoria) : null

  const relacionados = useMemo(() => {
    if (!articulo) return []
    return articulos
      .filter(a => a.categoria === articulo.categoria && a.id !== articulo.id)
      .slice(0, 3)
  }, [articulos, articulo])

  if (loading) return <LoadingSpinner />

  if (!articulo) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4 text-slate-300">
          <circle cx="12" cy="12" r="10" /><path d="M16 16s-1.5-2-4-2-4 2-4 2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Artículo no encontrado</h1>
        <p className="text-slate-500 mb-6">El artículo que buscás no existe o fue eliminado.</p>
        <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 transition-colors">
          Volver al inicio
        </button>
      </div>
    )
  }

  const catColors = {
    gobierno: 'bg-sky-100 text-sky-700',
    hacienda: 'bg-emerald-100 text-emerald-700',
    'obras-publicas': 'bg-amber-100 text-amber-700',
    ambiente: 'bg-green-100 text-green-700',
    produccion: 'bg-violet-100 text-violet-700',
    'accion-social': 'bg-rose-100 text-rose-700',
  }

  return (
    <article className="max-w-4xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-8">
        <button onClick={() => navigate('/')} className="hover:text-sky-500 transition-colors">Inicio</button>
        <span>/</span>
        {categoria && (
          <>
            <button onClick={() => navigate(`/categoria/${categoria.id}`)} className="hover:text-sky-500 transition-colors">{categoria.nombre}</button>
            <span>/</span>
          </>
        )}
        <span className="text-slate-600 truncate max-w-[200px]">{articulo.titulo}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        {categoria && (
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider inline-block mb-4 ${catColors[articulo.categoria] || 'bg-slate-100 text-slate-600'}`}>
            {categoria.nombre}
          </span>
        )}
        <h1 className="text-3xl md:text-5xl font-bold text-slate-800 leading-tight mb-4">{articulo.titulo}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
          {articulo.fecha && (
            <span className="flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {formatFecha(articulo.fecha)}
            </span>
          )}
          {articulo.autor && (
            <span className="flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Por {articulo.autor}
            </span>
          )}
        </div>
      </div>

      {/* Imagen destacada */}
      {articulo.imagen && (
        <div className="rounded-2xl overflow-hidden mb-10 shadow-sm">
          <img src={articulo.imagen} alt={articulo.titulo} className="w-full h-auto max-h-[500px] object-cover" />
        </div>
      )}

      {/* Contenido */}
      <div className="article-content text-base leading-relaxed max-w-3xl" dangerouslySetInnerHTML={{ __html: articulo.contenido }} />

      {/* Compartir */}
      <div className="mt-12 pt-8 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-500">Compartir:</span>
          <button
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(articulo.titulo + ' ' + window.location.href)}`, '_blank')}
            className="w-9 h-9 bg-green-100 text-green-600 rounded-xl flex items-center justify-center hover:bg-green-200 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </button>
          <button
            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
            className="w-9 h-9 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-200 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </button>
        </div>
      </div>

      {/* Artículos Relacionados */}
      {relacionados.length > 0 && (
        <section className="mt-16 pt-8 border-t border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Artículos Relacionados</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relacionados.map(art => {
              const catColor = catColors[art.categoria] || 'bg-slate-100 text-slate-600'
              return (
                <div
                  key={art.id}
                  onClick={() => navigate(`/articulo/${art.slug}`)}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group"
                >
                  {art.imagen && (
                    <div className="h-36 rounded-xl overflow-hidden mb-4">
                      <img src={art.imagen} alt={art.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${catColor}`}>
                    {categoria?.nombre || art.categoria}
                  </span>
                  <h3 className="font-semibold text-slate-800 mt-2 line-clamp-2 group-hover:text-sky-600 transition-colors">{art.titulo}</h3>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </article>
  )
}
