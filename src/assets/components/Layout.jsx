import React from 'react'

export function ArticleCard({ articulo, onClick, variant = 'default' }) {
  const catColor = articulo.categoriaColor || '#0EA5E9'

  if (variant === 'compact') {
    return (
      <article
        onClick={onClick}
        className="group bg-white border border-slate-200 overflow-hidden flex flex-col hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
        style={{ borderRadius: '5px' }}
      >
        {articulo.imagen && (
          <div className="h-40 w-full overflow-hidden bg-slate-100">
            <img src={articulo.imagen} alt={articulo.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        )}
        <div className="p-4 flex flex-col grow">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="text-[10px] font-bold px-2 py-0.5 text-white"
              style={{ backgroundColor: catColor, borderRadius: '3px' }}
            >
              {articulo.categoriaNombre || articulo.categoria || 'General'}
            </span>
            <span className="text-[11px] text-slate-400">
              {articulo.fecha ? new Date(articulo.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) : ''}
            </span>
          </div>
          <h3 className="text-[15px] font-bold text-slate-800 mb-1.5 line-clamp-2 leading-snug group-hover:text-sky-600 transition-colors">
            {articulo.titulo}
          </h3>
          <p className="text-[13px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
            {articulo.resumen}
          </p>
          <span className="mt-auto text-[11px] font-semibold text-sky-500 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
            Leer más <span>→</span>
          </span>
        </div>
      </article>
    )
  }

  return (
    <article
      onClick={onClick}
      className="group bg-white border border-slate-200 overflow-hidden flex flex-col hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
      style={{ borderRadius: '5px' }}
    >
      <div className="h-48 w-full overflow-hidden bg-slate-100">
        {articulo.imagen ? (
          <img src={articulo.imagen} alt={articulo.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V5" /></svg>
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col grow">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-[10px] font-bold px-2.5 py-1 text-white"
            style={{ backgroundColor: catColor, borderRadius: '3px' }}
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
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-slate-100">
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
      className="bg-white border border-slate-200 shadow-sm p-4 flex items-start gap-3 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
      style={{ borderRadius: '5px' }}
    >
      <div className="w-12 h-12 flex-shrink-0 bg-slate-50 flex flex-col items-center justify-center border border-slate-200" style={{ borderRadius: '5px' }}>
        <span className="text-base font-bold text-slate-800 leading-none">
          {evento.fecha ? new Date(evento.fecha + 'T12:00:00').getDate() : '?'}
        </span>
        <span className="text-[8px] font-semibold text-slate-400 uppercase">
          {evento.fecha ? new Date(evento.fecha + 'T12:00:00').toLocaleDateString('es-AR', { month: 'short' }) : ''}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 flex-shrink-0" style={{ backgroundColor: evento.categoriaColor || '#94A3B8', borderRadius: '50%' }} />
          <h3 className="font-semibold text-slate-800 text-sm group-hover:text-sky-600 transition-colors truncate">{evento.titulo}</h3>
        </div>
        {evento.descripcion && <p className="text-xs text-slate-500 line-clamp-1">{evento.descripcion}</p>}
        {(evento.hora || evento.lugar) && (
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
            {evento.hora && <span>🕐 {evento.hora}</span>}
            {evento.lugar && <span>📍 {evento.lugar}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-[3px] border-sky-200 border-t-sky-500 animate-spin" style={{ borderRadius: '50%' }} />
    </div>
  )
}

export function PageHero({ titulo, descripcion, color }) {
  return (
    <div className="bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-14">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2" style={{ color: color || undefined }}>{titulo}</h1>
        {descripcion && <p className="text-base text-slate-500 max-w-2xl">{descripcion}</p>}
      </div>
    </div>
  )
}
