import { directusGet, directusPost, directusPatch, directusDelete, getAssetUrl, PUBLIC_ASSET_FOLDER_ID } from '../lib/directus'
import { sanitizeArticleHtml } from '../lib/sanitizeHtml'

// ─── HELPERS ─────────────────────────────────────────
function normalizeSlug(slug) {
  if (!slug) return ''
  return slug.trim().replace(/\s+/g, '-').toLowerCase()
}

function extractDate(isoStr) {
  if (!isoStr) return ''
  return isoStr.slice(0, 10)
}

let slugToIntId = {}

export function formatFecha(dateStr) {
  try {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return dateStr
  }
}

export function formatFechaCorta(dateStr) {
  try {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

// ─── CATEGORÍAS ─────────────────────────────────────
let categoriasPromise = null

export async function getCategorias() {
  if (categoriasPromise) return categoriasPromise
  categoriasPromise = _fetchCategorias()
  return categoriasPromise
}

async function _fetchCategorias() {
  try {
    const data = await directusGet('/items/categorias?sort=sort')
    const mapped = (data || []).map(c => {
      const s = normalizeSlug(c.slug)
      return {
        id: s,
        _id: c.id,
        nombre: c.nombre,
        slug: s,
        color: c.color || '#0EA5E9',
        descripcion: '',
        orden: c.sort || 99,
      }
    })
    // Build lookup: normalized slug → integer ID
    mapped.forEach(c => { slugToIntId[c.id] = c._id })
    return mapped
  } catch (e) {
    console.warn('Error fetching categorias:', e)
    return []
  }
}

export async function saveCategoria(cat) {
  const data = {}
  if (cat.nombre) data.nombre = cat.nombre
  if (cat.slug) data.slug = cat.slug
  if (cat.color) data.color = cat.color
  if (cat.orden) data.sort = typeof cat.orden === 'number' ? cat.orden : 99
  if (cat._id) {
    await directusPatch(`/items/categorias/${cat._id}`, data)
  } else {
    if (!data.slug) data.slug = normalizeSlug(cat.nombre || '')
    await directusPost('/items/categorias', data)
  }
  categoriasPromise = null // Force refresh
}

export async function deleteCategoria(id) {
  const cats = await getCategorias()
  const cat = cats.find(c => c.id === id)
  if (cat && cat._id) {
    await directusDelete(`/items/categorias/${cat._id}`)
    categoriasPromise = null
  }
}

export function subscribeCategorias(callback) {
  getCategorias().then(callback).catch(() => callback([]))
  return () => {} // No-op cleanup (Directus REST, no real-time)
}

// ─── ARTÍCULOS ──────────────────────────────────────
let articulosCache = null

function mapArticulo(n) {
  const cat = n.categoria
  const catSlug = cat ? normalizeSlug(cat.slug) : ''
  const imagenId = typeof n.imagen === 'object' ? (n.imagen?.id || null) : (n.imagen || null)
  const imagen2Id = typeof n.imagen2 === 'object' ? (n.imagen2?.id || null) : (n.imagen2 || null)
  return {
    id: n.id,
    titulo: n.titulo || '',
    slug: (n.slug || '').trim(),
    resumen: n.resumen || '',
    contenido: n.contenido || '',
    autor: n.autor || 'Redacción Prensa Eldorado',
    fecha: extractDate(n.fecha_publicacion),
    destacado: !!n.destacada,
    categoria: catSlug,
    categoriaNombre: cat ? (cat.nombre || '') : '',
    categoriaColor: cat ? (cat.color || '#0EA5E9') : '#0EA5E9',
    imagen: getAssetUrl(imagenId),
    imagenId,
    imagen2: getAssetUrl(imagen2Id),
    imagen2Id,
  }
}

export async function getArticulos(options = {}) {
  try {
    let url = '/items/noticias?fields=*,categoria.*&sort=-fecha_publicacion'
    if (options.limit) url += `&limit=${options.limit}`
    if (options.categoria) {
      // Convert slug to integer ID for Directus filter
      await getCategorias()
      const catIntId = slugToIntId[options.categoria]
      if (catIntId) {
        url += `&filter[categoria][_eq]=${catIntId}`
      }
    }
    // Only published articles for the public site
    if (!options.admin) {
      url += `&filter[status][_eq]=published`
    }
    
    const data = await directusGet(url)
    let result = (data || []).map(mapArticulo)
    articulosCache = result

    if (options.destacado) {
      result = result.filter(a => a.destacado)
    }
    return result
  } catch (e) {
    console.warn('Error fetching articulos:', e)
    return []
  }
}

export async function getArticuloBySlug(slug) {
  try {
    const data = await directusGet(
      `/items/noticias?filter[slug][_eq]=${encodeURIComponent(slug)}&fields=*,categoria.*&limit=1`
    )
    if (!data || data.length === 0) return null
    const n = data[0]
    if (n.status !== 'published') return null
    return mapArticulo(n)
  } catch (e) {
    console.warn('Error fetching articulo by slug:', e)
    return null
  }
}

export async function getArticuloById(id) {
  try {
    const n = await directusGet(`/items/noticias/${id}?fields=*,categoria.*`)
    if (!n || n.status !== 'published') return null
    return mapArticulo(n)
  } catch (e) {
    console.warn('Error fetching articulo by id:', e)
    return null
  }
}

export async function saveArticulo(articulo) {
  const data = {
    titulo: articulo.titulo || '',
    slug: articulo.slug || '',
    resumen: articulo.resumen || '',
    contenido: sanitizeArticleHtml(articulo.contenido || ''),
    autor: articulo.autor || 'Redacción Prensa Eldorado',
    destacada: !!articulo.destacado,
    status: 'published',
    imagen: articulo.imagen || null,
  }
  if (articulo.fecha) {
    data.fecha_publicacion = new Date(articulo.fecha + 'T12:00:00').toISOString()
  }
  // Map categoria slug → integer ID
  if (articulo.categoria) {
    await getCategorias()
    const catIntId = slugToIntId[articulo.categoria]
    if (catIntId) data.categoria = catIntId
  }

  if (articulo.id && typeof articulo.id === 'number') {
    await directusPatch(`/items/noticias/${articulo.id}`, data)
    return articulo.id
  } else {
    const result = await directusPost('/items/noticias', data)
    articulosCache = null
    categoriasPromise = null // refresh slug → int map
    return result.id
  }
}

export async function deleteArticulo(id) {
  await directusDelete(`/items/noticias/${id}`)
  articulosCache = null
}

export function subscribeArticulos(callback, options = {}) {
  getArticulos(options).then(callback).catch(() => callback([]))
  return () => {}
}

// ─── EVENTOS ─────────────────────────────────────────
function mapEvento(evento) {
  const cat = evento.categoria
  const catSlug = typeof cat === 'object' ? normalizeSlug(cat?.slug) : ''
  const categoryId = typeof cat === 'object' ? cat?.id : cat
  const catId = Object.keys(slugToIntId).find(slug => String(slugToIntId[slug]) === String(categoryId))
  return {
    id: evento.id,
    titulo: evento.titulo || '',
    descripcion: evento.descripcion || '',
    fecha: extractDate(evento.fecha),
    hora: evento.hora || '',
    lugar: evento.lugar || '',
    categoria: catSlug || catId || '',
    imagen: getAssetUrl(typeof evento.imagen === 'object' ? evento.imagen?.id : evento.imagen),
    imagenId: typeof evento.imagen === 'object' ? (evento.imagen?.id || '') : (evento.imagen || ''),
  }
}

export async function getEventos(options = {}) {
  try {
    await getCategorias()
    let url = '/items/eventos?fields=*,categoria.*&sort=fecha'
    if (!options.admin) url += '&filter[status][_eq]=published'
    const data = await directusGet(url)
    return (data || []).map(mapEvento)
  } catch (e) {
    console.warn('Error fetching eventos:', e)
    if (options.admin) throw e
    return []
  }
}

export async function saveEvento(evento) {
  const data = {
    titulo: evento.titulo || '',
    descripcion: evento.descripcion || '',
    fecha: evento.fecha || null,
    hora: evento.hora || null,
    lugar: evento.lugar || '',
    status: 'published',
    imagen: evento.imagen || null,
  }
  if (evento.categoria) {
    await getCategorias()
    const catIntId = slugToIntId[evento.categoria]
    if (catIntId) data.categoria = catIntId
  } else {
    data.categoria = null
  }

  if (evento.id) {
    await directusPatch(`/items/eventos/${evento.id}`, data)
    return evento.id
  }
  const result = await directusPost('/items/eventos', data)
  return result.id
}

export async function deleteEvento(id) {
  await directusDelete(`/items/eventos/${id}`)
}

export function subscribeEventos(callback, options = {}) {
  getEventos(options).then(callback).catch(() => callback([]))
  return () => {}
}

// ─── IMAGE UPLOAD → Directus ─────────────────────────
export async function uploadImage(file) {
  if (!PUBLIC_ASSET_FOLDER_ID) {
    throw new Error('Falta configurar VITE_DIRECTUS_PUBLIC_FOLDER_ID para subir imágenes públicas.')
  }
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', PUBLIC_ASSET_FOLDER_ID)
  const result = await directusPost('/files', formData)
  if (!result?.id) throw new Error('Directus no devolvió el identificador del archivo subido')
  return { id: result.id, url: getAssetUrl(result.id) }
}

export function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export { getAssetUrl }
