import React from 'react'

export function SectionLayout({ title, highlight, description, children }) {
  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen">
      <main className="max-w-7xl mx-auto px-6 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12 md:mb-20">
          <div>
            <h1 className="text-3xl md:text-5xl font-light text-sky-500 leading-tight">
              {title} <br />
              <span className="text-4xl md:text-6xl text-sky-500 font-semibold">{highlight}</span>
            </h1>
          </div>
          <div>
            <p className="text-lg md:text-slate-600 pl-6">
              {description}
            </p>
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}

export function Section({ children, className = '' }) {
  return (
    <section className={`px-4 py-8 md:px-16 md:py-12 max-w-7xl mx-auto ${className}`}>
      {children}
    </section>
  )
}

export function ArticleCard({ articulo, onClick }) {
  const catColor = articulo.categoriaColor || '#0EA5E9'

  return (
    <article
      onClick={onClick}
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      <div className="h-48 w-full overflow-hidden bg-slate-100">
        {articulo.imagen ? (
          <img src={articulo.imagen} alt={articulo.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V5" /><path d="M11 14h2" /><path d="M11 10h2" /><path d="M11 6h2" /></svg>
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col grow">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider text-white"
            style={{ backgroundColor: catColor }}
          >
            {articulo.categoriaNombre || articulo.categoria || 'General'}
          </span>
          <span className="text-xs text-slate-400">
            {articulo.fecha ? new Date(articulo.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) : ''}
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 leading-tight group-hover:text-sky-600 transition-colors">
          {articulo.titulo}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-3">
          {articulo.resumen}
        </p>
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-50">
          {articulo.autor && <span className="text-xs text-slate-400">Por {articulo.autor}</span>}
          <span className="text-xs font-semibold text-sky-500 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            Leer más <span>→</span>
          </span>
        </div>
      </div>
    </article>
  )
}

export function EventoCard({ evento, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
    >
      <div className="w-14 h-14 flex-shrink-0 bg-slate-50 rounded-xl flex flex-col items-center justify-center border border-slate-100">
        <span className="text-lg font-bold text-slate-800 leading-none">
          {evento.fecha ? new Date(evento.fecha + 'T12:00:00').getDate() : '?'}
        </span>
        <span className="text-[9px] font-semibold text-slate-400 uppercase">
          {evento.fecha ? new Date(evento.fecha + 'T12:00:00').toLocaleDateString('es-AR', { month: 'short' }) : ''}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: evento.categoriaColor || '#94A3B8' }} />
          <h3 className="font-semibold text-slate-800 group-hover:text-sky-600 transition-colors truncate">{evento.titulo}</h3>
        </div>
        <p className="text-sm text-slate-500 line-clamp-1">{evento.descripcion}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
          {evento.hora && (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {evento.hora}
            </span>
          )}
          {evento.lugar && (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {evento.lugar}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
    </div>
  )
}

export function PageHero({ titulo, descripcion }) {
  return (
    <div className="bg-slate-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <h1 className="text-3xl md:text-5xl font-bold text-slate-800 mb-3">{titulo}</h1>
        {descripcion && <p className="text-lg text-slate-500 max-w-2xl">{descripcion}</p>}
      </div>
    </div>
  )
}
