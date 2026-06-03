import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { subscribeArticulos, subscribeCategorias } from '../data/prensaFirebase'
import { ArticleCard, PageHero, LoadingSpinner } from '../assets/components/Layout'

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

  if (!categoria) {
    return (
      <PageHero titulo="Categoría no encontrada" descripcion="La secretaría que buscas no existe." />
    )
  }

  return (
    <>
      <PageHero
        titulo={categoria.nombre}
        descripcion={`Noticias y artículos de ${categoria.nombre}`}
      />
      <section className="max-w-7xl mx-auto px-6 py-12">
        {filtrados.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-4 opacity-30">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V5" />
            </svg>
            <p className="text-lg font-medium">No hay artículos en esta categoría todavía</p>
            <p className="text-sm mt-1">Pronto estaremos publicando novedades de {categoria.nombre.toLowerCase()}.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-400 mb-6">{filtrados.length} artículo{filtrados.length !== 1 ? 's' : ''} publicado{filtrados.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtrados.map(art => (
                <ArticleCard key={art.id} articulo={art} onClick={() => navigate(`/articulo/${art.slug}`)} />
              ))}
            </div>
          </>
        )}
      </section>
    </>
  )
}
