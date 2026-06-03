import React from 'react'

export function ArticleCard({ articulo, onClick, variant = 'default' }) {
  const catColor = articulo.categoriaColor || '#0EA5E9'

  // ─── FEATURED: horizontal, image left + text right ───
  if (variant === 'featured') {
    return (
      <article
        onClick={onClick}
        className="group bg-white border border-slate-200 overflow-hidden flex flex-col md:flex-row hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
        style={{ borderRadius: '5px' }}
      >
        <div className="md:w-[45%] w-full bg-slate-100 flex-shrink-0">
          {articulo.imagen ? (
            <img src={articulo.imagen} alt={articulo.titulo} className="w-full h-full object-cover" style={{ minHeight: '280px' }} />
          ) : (
            <div className="w-full h-[280px] flex items-center justify-center text-slate-300">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V5" /></svg>
            </div>
          )}
        </div>
        <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-[11px] font-bold px-2.5 py-1 text-white"
              style={{ backgroundColor: catColor, borderRadius: '3px' }}
            >
              {articulo.categoriaNombre || articulo.categoria || 'General'}
            </span>
            <span className="text-xs text-slate-400">
              {articulo.fecha ? new Date(articulo.fecha + 'T12:00:00').toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight mb-3 group-hover:text-sky-600 transition-colors">
            {articulo.titulo}
          </h2>
          {articulo.resumen && (
            <p className="text-sm md:text-base text-slate-500 leading-relaxed mb-4 line-clamp-3">
              {articulo.resumen}
            </p>
          )}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
            {articulo.autor && <span className="text-xs text-slate-400">Por {articulo.autor}</span>}
            <span className="text-sm font-semibold text-sky-500 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Leer más <span>→</span>
            </span>
          </div>
        </div>
      </article>
    )
  }

  // ─── WIDE: spans 2 cols, compact with bigger image ───
  if (variant === 'wide') {
    return (
      <article
        onClick={onClick}
        className="group bg-white border border-slate-200 overflow-hidden flex flex-col sm:flex-row hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
        style={{ borderRadius: '5px' }}
      >
        <div className="sm:w-[40%] w-full bg-slate-100 flex-shrink-0">
          {articulo.imagen ? (
            <img src={articulo.imagen} alt={articulo.titulo} className="w-full h-full object-cover" style={{ minHeight: '180px' }} />
          ) : (
            <div className="w-full h-[180px] flex items-center justify-center text-slate-300">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V5" /></svg>
            </div>
          )}
        </div>
        <div className="flex-1 p-4 flex flex-col">
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
          <h3 className="text-base font-bold text-slate-800 mb-1.5 line-clamp-2 leading-snug group-hover:text-sky-600 transition-colors">
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

  // ─── DEFAULT: vertical card ───
  return (
    <article
      onClick={onClick}
      className="group bg-white border border-slate-200 overflow-hidden flex flex-col hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
      style={{ borderRadius: '5px' }}
    >
      <div className="h-40 w-full overflow-hidden bg-slate-100">
        {articulo.imagen ? (
          <img src={articulo.imagen} alt={articulo.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V5" /></svg>
          </div>
        )}
      </div>
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

export function EventoCard({ evento, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-slate-200 p-3.5 flex items-start gap-3 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
      style={{ borderRadius: '5px' }}
    >
      <div className="w-10 h-10 flex-shrink-0 bg-slate-50 flex flex-col items-center justify-center border border-slate-200" style={{ borderRadius: '5px' }}>
        <span className="text-sm font-bold text-slate-800 leading-none">
          {evento.fecha ? new Date(evento.fecha + 'T12:00:00').getDate() : '?'}
        </span>
        <span className="text-[7px] font-semibold text-slate-400 uppercase">
          {evento.fecha ? new Date(evento.fecha + 'T12:00:00').toLocaleDateString('es-AR', { month: 'short' }) : ''}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-slate-800 text-sm group-hover:text-sky-600 transition-colors truncate">{evento.titulo}</h3>
        {evento.descripcion && <p className="text-[11px] text-slate-500 line-clamp-1">{evento.descripcion}</p>}
        {(evento.hora || evento.lugar) && (
          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
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
