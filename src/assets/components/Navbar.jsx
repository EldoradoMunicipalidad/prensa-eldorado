import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { CalendarDays, Menu, Search, X } from 'lucide-react'
import { subscribeCategorias } from '../../data/prensaFirebase'

const MUNICIPALITY_URL = 'https://www.eldorado.gob.ar'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isAdmin = location.pathname.startsWith('/admin')
  const [categorias, setCategorias] = useState([])
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const unsub = subscribeCategorias(setCategorias)
    return () => unsub()
  }, [])

  useEffect(() => {
    setSearch(searchParams.get('q') || '')
  }, [searchParams])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname, location.search])

  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const isActive = path => {
    if (path === '/') return location.pathname === '/' && !location.hash
    if (path === '/#noticias') return location.pathname === '/' && location.hash === '#noticias'
    return location.pathname.startsWith(path)
  }

  function submitSearch(event) {
    event.preventDefault()
    const query = search.trim()
    navigate(query ? `/?q=${encodeURIComponent(query)}#noticias` : '/')
    setMenuOpen(false)
  }

  const navLinkClass = path => `rounded-full px-3 py-2 text-sm font-semibold transition ${isActive(path) ? 'bg-amber-100 text-slate-900' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`

  if (isAdmin) {
    return (
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Eldorado" className="h-9 w-auto object-contain" />
            <span className="text-sm font-bold text-slate-800">Prensa Eldorado</span>
          </Link>
          <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-emerald-700">Volver al sitio</Link>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm shadow-slate-900/[0.03] backdrop-blur">
      <div className="bg-slate-950 text-slate-100">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 text-[11px] sm:px-6">
          <span className="font-medium">Eldorado, Misiones</span>
          <span className="hidden capitalize text-slate-300 sm:block">{today}</span>
          <a href={MUNICIPALITY_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-amber-300 transition hover:text-amber-200">Municipalidad ↗</a>
        </div>
      </div>

      <div className="mx-auto flex min-h-[68px] max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:min-h-[76px]">
        <Link to="/" aria-label="Prensa Eldorado, inicio" className="flex min-w-0 items-center gap-2.5">
          <img src="/logo.jpg" alt="" className="h-9 w-auto shrink-0 object-contain sm:h-10" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-extrabold leading-tight text-slate-900 sm:text-base">Prensa Eldorado</span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700 sm:block">Información municipal</span>
          </span>
        </Link>

        <nav aria-label="Navegación principal" className="hidden items-center gap-1 lg:flex">
          <Link to="/" className={navLinkClass('/')}>Inicio</Link>
          <Link to="/#noticias" className={navLinkClass('/#noticias')}>Noticias</Link>
          <Link to="/eventos" className={navLinkClass('/eventos')}>Eventos</Link>
          <a href={MUNICIPALITY_URL} target="_blank" rel="noopener noreferrer" className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">Servicios</a>
        </nav>

        <form onSubmit={submitSearch} role="search" className="hidden w-52 items-center gap-2 rounded-full bg-slate-100 px-3 py-2 lg:flex xl:w-64">
          <Search size={16} className="shrink-0 text-slate-500" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Buscar noticias"
            aria-label="Buscar noticias"
            className="min-w-0 flex-1 bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-500"
          />
          <button type="submit" aria-label="Enviar búsqueda" className="rounded-full p-1 text-slate-600 transition hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
            <Search size={14} />
          </button>
        </form>

        <div className="flex items-center gap-1 lg:hidden">
          <Link to="/eventos" aria-label="Ver eventos" className="rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-emerald-700">
            <CalendarDays size={19} />
          </Link>
          <button
            type="button"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="mobile-site-menu"
            onClick={() => setMenuOpen(value => !value)}
            className="rounded-full p-2 text-slate-700 hover:bg-slate-100"
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-site-menu" className="border-t border-slate-100 bg-white px-4 pb-4 pt-3 lg:hidden">
          <nav aria-label="Navegación móvil" className="grid grid-cols-2 gap-2">
            <Link to="/" className={navLinkClass('/')}>Inicio</Link>
            <Link to="/#noticias" className={navLinkClass('/#noticias')}>Noticias</Link>
            <Link to="/eventos" className={navLinkClass('/eventos')}>Eventos</Link>
            <a href={MUNICIPALITY_URL} target="_blank" rel="noopener noreferrer" className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">Servicios ↗</a>
          </nav>
          <form onSubmit={submitSearch} role="search" className="mt-3 flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5">
            <Search size={17} className="shrink-0 text-slate-500" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Buscar noticias"
              aria-label="Buscar noticias"
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-500"
            />
            <button type="submit" aria-label="Enviar búsqueda" className="rounded-lg bg-emerald-700 p-2 text-white hover:bg-emerald-800"><Search size={15} /></button>
          </form>
        </div>
      )}

      {categorias.length > 0 && (
        <div className="border-t border-slate-100 bg-white">
          <nav aria-label="Categorías de noticias" className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2.5 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="mr-1 flex shrink-0 items-center rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white">Todas las noticias</span>
            {categorias.map(category => (
              <Link
                key={category.id}
                to={`/categoria/${category.id}`}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold transition ${location.pathname === `/categoria/${category.id}` ? 'bg-emerald-100 text-emerald-900' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
              >
                {category.nombre}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
