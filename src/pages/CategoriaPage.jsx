import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { subscribeArticulos, subscribeCategorias } from '../data/prensaFirebase'
import { ArticleCard, LoadingSpinner } from '../assets/components/Layout'

export default function CategoriaPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [articulos, setArticulos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubArt = subscribeArticulos(setArticulos)
    const unsubCat = subscribeCategorias((cats) => {
      setCategorias(cats)
      setLoading(false)
    })
    return () => { unsubArt(); unsubCat() }
  }, [])

  const categoria = categorias.find(c => c.id === slug)
  const filtrados = useMemo(() => articulos.filter(a => a.categoria === slug), [articulos, slug])

  if (loading) return <LoadingSpinner />

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8 md:py-10">
          <div className="flex items-center gap-3 mb-1">
            {categoria && (
              <span
                className="text-[11px] font-bold px-2.5 py-1 text-white"
                style={{ backgroundColor: categoria.color || '#0EA5E9', borderRadius: '3px' }}
              >
                {categoria.nombre}
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            {categoria?.nombre || 'Categoría no encontrada'}
          </h1>
          {categoria && (
            <p className="text-sm text-slate-500 mt-1">
              {filtrados.length} artículo{filtrados.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {!categoria ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-lg font-medium">La secretaría que buscas no existe.</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4 opacity-30">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V5" />
            </svg>
            <p className="text-lg font-medium">No hay artículos en esta categoría todavía</p>
            <p className="text-sm mt-1">Pronto estaremos publicando novedades de {(categoria.nombre || '').toLowerCase()}.</p>
          </div>
        ) : (
          <>
            {/* Featured first article */}
            {filtrados[0] && (
              <div className="mb-6">
                <ArticleCard articulo={filtrados[0]} variant="wide" onClick={() => navigate(`/articulo/${filtrados[0].slug}`)} />
              </div>
            )}
            {/* Rest in grid */}
            {filtrados.length > 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtrados.slice(1).map(art => (
                  <ArticleCard key={art.id} articulo={art} onClick={() => navigate(`/articulo/${art.slug}`)} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
