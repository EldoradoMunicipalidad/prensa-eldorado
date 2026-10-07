import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Drama,
  HeartPulse,
  HardHat,
  Leaf,
  MapPin,
  Newspaper,
} from 'lucide-react'
import { subscribeArticulos, subscribeCategorias, subscribeEventos } from '../data/prensaFirebase'
import { ArticleCard, LoadingSpinner } from '../assets/components/Layout'

const TOPIC_ORDER = ['obras', 'salud', 'ambiente', 'cultur']

function getLocalDateKey() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

function formatDay(date) {
  if (!date) return '--'
  return new Date(`${date}T12:00:00`).toLocaleDateString('es-AR', { day: '2-digit' })
}

function formatMonth(date) {
  if (!date) return ''
  return new Date(`${date}T12:00:00`).toLocaleDateString('es-AR', { month: 'short' }).replace('.', '').toUpperCase()
}

function categoryIcon(nombre = '') {
  const normalized = nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  if (normalized.includes('obra')) return HardHat
  if (normalized.includes('salud')) return HeartPulse
  if (normalized.includes('ambient')) return Leaf
  if (normalized.includes('cultur')) return Drama
  return Newspaper
}

function getTopicCategories(categorias) {
  const rank = (nombre = '') => {
    const normalized = nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    const index = TOPIC_ORDER.findIndex(topic => normalized.includes(topic))
    return index < 0 ? TOPIC_ORDER.length : index
  }
  return [...categorias].sort((a, b) => rank(a.nombre) - rank(b.nombre)).slice(0, 4)
}

function AgendaItem({ evento }) {
  return (
    <article className="flex gap-3 rounded-xl bg-white p-3.5 text-slate-800 shadow-sm">
      <div className="flex h-[58px] w-[54px] shrink-0 flex-col items-center justify-center rounded-lg bg-emerald-50 text-emerald-800">
        <span className="text-xl font-extrabold leading-none">{formatDay(evento.fecha)}</span>
        <span className="mt-1 text-[10px] font-bold tracking-wide">{formatMonth(evento.fecha)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-sm font-bold leading-snug">{evento.titulo}</h3>
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
          {evento.hora && <span className="inline-flex items-center gap-1"><Clock3 size={12} />{evento.hora}</span>}
          {evento.lugar && <span className="inline-flex items-center gap-1"><MapPin size={12} />{evento.lugar}</span>}
        </div>
      </div>
    </article>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const searchTerm = (searchParams.get('q') || '').trim()
  const [articulos, setArticulos] = useState([])
  const [eventos, setEventos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAllNews, setShowAllNews] = useState(false)

  useEffect(() => {
    setShowAllNews(false)
  }, [searchTerm])

  useEffect(() => {
    let articlesReady = false
    let eventsReady = false
    let categoriesReady = false
    const settleLoading = () => {
      if (articlesReady && eventsReady && categoriesReady) setLoading(false)
    }
    const unsubArts = subscribeArticulos(items => {
      setArticulos(items)
      articlesReady = true
      settleLoading()
    })
    const unsubEvents = subscribeEventos(items => {
      setEventos(items)
      eventsReady = true
      settleLoading()
    })
    const unsubCategories = subscribeCategorias(items => {
      setCategorias(items)
      categoriesReady = true
      settleLoading()
    })
    return () => { unsubArts(); unsubEvents(); unsubCategories() }
  }, [])

  const matchingArticles = useMemo(() => {
    if (!searchTerm) return articulos
    const needle = searchTerm.toLocaleLowerCase('es-AR')
    return articulos.filter(article =>
      [article.titulo, article.resumen, article.categoriaNombre]
        .filter(Boolean)
        .some(value => value.toLocaleLowerCase('es-AR').includes(needle)),
    )
  }, [articulos, searchTerm])

  const featured = matchingArticles.find(article => article.destacado) || matchingArticles[0]
  const noticias = matchingArticles.filter(article => article.id !== featured?.id)
  const noticiasVisibles = showAllNews ? noticias : noticias.slice(0, 3)
  const topics = useMemo(() => getTopicCategories(categorias), [categorias])
  const proximosEventos = useMemo(() => {
    const today = getLocalDateKey()
    return eventos
      .filter(evento => evento.fecha && evento.fecha >= today)
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
      .slice(0, 2)
  }, [eventos])

  if (loading) return <LoadingSpinner />

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10 pt-5 sm:px-6 lg:pt-7">
      {featured ? (
        <section
          aria-labelledby="home-featured-title"
          className="home-hero relative isolate flex min-h-[380px] items-end overflow-hidden rounded-2xl bg-slate-900 sm:min-h-[440px] lg:min-h-[490px]"
          style={featured.imagen ? { backgroundImage: `url("${featured.imagen}")` } : undefined}
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/90 via-slate-950/55 to-slate-950/10" />
          {!featured.imagen && <div className="absolute inset-0 -z-20 bg-gradient-to-br from-sky-900 via-emerald-800 to-slate-950" />}
          <div className="max-w-3xl p-6 text-white sm:p-9 lg:p-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {featured.categoriaNombre || 'Actualidad'}
            </span>
            <p className="mb-2 mt-5 text-sm font-semibold tracking-wide text-emerald-100">Lo que pasa en Eldorado</p>
            <h1 id="home-featured-title" className="max-w-3xl text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl">
              {featured.titulo}
            </h1>
            {featured.resumen && <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">{featured.resumen}</p>}
            <div className="mt-6 flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={() => navigate(`/articulo/${featured.slug}`)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-400 px-5 text-sm font-bold text-slate-950 transition hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              >
                Conocé la historia <ArrowRight size={17} />
              </button>
              {featured.fecha && <span className="text-xs font-medium text-white/75">{new Date(`${featured.fecha}T12:00:00`).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
            </div>
          </div>
        </section>
      ) : (
        <section className="rounded-2xl bg-gradient-to-br from-sky-900 via-emerald-800 to-slate-950 px-6 py-12 text-white sm:px-10">
          <p className="text-sm font-semibold text-emerald-100">Prensa Municipal</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">Lo que pasa en Eldorado</h1>
          <p className="mt-3 max-w-xl text-sm text-white/80">Noticias, actividades y propuestas de nuestra comunidad.</p>
        </section>
      )}

      {topics.length > 0 && (
        <nav aria-label="Explorar por tema" className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {topics.map((category, index) => {
            const Icon = categoryIcon(category.nombre)
            const accents = [
              'bg-amber-100 text-amber-700',
              'bg-rose-100 text-rose-600',
              'bg-emerald-100 text-emerald-700',
              'bg-violet-100 text-violet-700',
            ]
            return (
              <Link
                key={category.id}
                to={`/categoria/${category.id}`}
                className="group flex min-h-[76px] items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accents[index % accents.length]}`}>
                  <Icon size={22} strokeWidth={2.3} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-800">{category.nombre}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">Noticias y novedades</span>
                </span>
                <ArrowRight size={16} className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-700" />
              </Link>
            )
          })}
        </nav>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-7">
        <section id="noticias" aria-labelledby="today-news-title" className="scroll-mt-36">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Actualidad local</p>
              <h2 id="today-news-title" className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                {searchTerm ? `Resultados para “${searchTerm}”` : 'Noticias de hoy'}
              </h2>
            </div>
          </div>

          {noticias.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {noticiasVisibles.map(article => (
                <ArticleCard key={article.id} articulo={article} onClick={() => navigate(`/articulo/${article.slug}`)} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
              <Newspaper size={30} className="mx-auto text-slate-400" />
              <p className="mt-3 font-semibold text-slate-700">
                {searchTerm ? 'No encontramos noticias con esos términos.' : 'Pronto vas a encontrar nuevas noticias acá.'}
              </p>
            </div>
          )}
          {noticias.length > 3 && (
            <button
              type="button"
              onClick={() => setShowAllNews(value => !value)}
              className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-emerald-600 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              {showAllNews ? 'Mostrar menos' : 'Ver todas las noticias'} <ArrowRight size={15} />
            </button>
          )}
        </section>

        <aside aria-labelledby="agenda-title" className="self-start rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 p-4 text-white shadow-lg shadow-emerald-900/10 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 id="agenda-title" className="inline-flex items-center gap-2 text-xl font-extrabold sm:text-2xl"><CalendarDays size={22} /> Agenda</h2>
            <Link to="/eventos" className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-white/90 hover:text-white sm:text-sm">Ver eventos <ArrowRight size={14} /></Link>
          </div>
          {proximosEventos.length > 0 ? (
            <div className="space-y-3">
              {proximosEventos.map(evento => <AgendaItem key={evento.id} evento={evento} />)}
            </div>
          ) : (
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-6 text-center">
              <CalendarDays size={26} className="mx-auto text-emerald-100" />
              <p className="mt-2 text-sm font-semibold">Todavía no hay eventos próximos.</p>
              <p className="mt-1 text-xs text-white/80">Volvé a consultar la agenda de Eldorado.</p>
            </div>
          )}
          <Link to="/eventos" className="mt-4 flex min-h-10 items-center justify-center gap-2 rounded-lg bg-white/15 px-4 text-sm font-bold transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <CalendarDays size={16} /> Explorar agenda completa
          </Link>
        </aside>
      </div>

      <section className="mt-7 flex flex-col gap-4 rounded-2xl bg-sky-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div>
          <p className="font-extrabold text-slate-900">¿Tenés una noticia para compartir?</p>
          <p className="mt-1 text-sm text-slate-600">Acercá tu consulta al equipo de Prensa Eldorado.</p>
        </div>
        <a href="mailto:prensa@eldorado.gob.ar" className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-full bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2 sm:self-auto">
          Contactar a Prensa <ArrowRight size={16} />
        </a>
      </section>
    </div>
  )
}
