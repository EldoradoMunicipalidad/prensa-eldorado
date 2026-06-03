import { directusGet, directusPost, directusPatch, directusDelete, getAssetUrl } from '../lib/directus'
import { DIRECTUS_URL, TOKEN } from '../lib/directus'

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
    imagen: getAssetUrl(n.imagen),
    imagen2: getAssetUrl(n.imagen2),
  }
}

export async function getArticulos(options = {}) {
  try {
    let url = '/items/noticias?fields=*,categoria.*&sort=-fecha_publicacion'
    if (options.limit) url += `&limit=${options.limit}`
    if (options.categoria) {
      // Convert slug to integer ID for Directus filter
      const cats = await getCategorias()
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
    contenido: articulo.contenido || '',
    autor: articulo.autor || 'Redacción Prensa Eldorado',
    destacada: !!articulo.destacado,
    status: 'published',
  }
  if (articulo.fecha) {
    data.fecha_publicacion = new Date(articulo.fecha + 'T12:00:00').toISOString()
  }
  // Map categoria slug → integer ID
  if (articulo.categoria) {
    const cats = await getCategorias()
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

export function subscribeArticulos(callback) {
  getArticulos().then(callback).catch(() => callback([]))
  return () => {}
}

// ─── EVENTOS (no hay en Directus) ────────────────────
export async function getEventos() { return [] }
export async function saveEvento(evento) { return null }
export async function deleteEvento(id) {}
export function subscribeEventos(callback) {
  // Keep events in localStorage for backward compat
  try {
    const raw = localStorage.getItem('prensa_eldorado_eventos')
    if (raw) callback(JSON.parse(raw))
  } catch (_) {}
  return () => {}
}

// ─── AUTH (local, unchanged) ────────────────────────
function hashPassword(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return hash.toString(36)
}

export function authenticateAdmin(username, password) {
  try {
    const stored = localStorage.getItem('prensa_eldorado_admin')
    const admins = stored ? JSON.parse(stored) : [{ username: 'admin', passwordHash: hashPassword('admin') }]
    return admins.some(a => a.username === username && a.passwordHash === hashPassword(password))
  } catch { return false }
}

export function changeAdminPassword(username, currentPassword, newPassword) {
  try {
    const stored = localStorage.getItem('prensa_eldorado_admin')
    const admins = stored ? JSON.parse(stored) : [{ username: 'admin', passwordHash: hashPassword('admin') }]
    const idx = admins.findIndex(a => a.username === username && a.passwordHash === hashPassword(currentPassword))
    if (idx === -1) return false
    admins[idx].passwordHash = hashPassword(newPassword)
    localStorage.setItem('prensa_eldorado_admin', JSON.stringify(admins))
    return true
  } catch { return false }
}

// ─── IMAGE UPLOAD → Directus ─────────────────────────
export async function uploadImage(file) {
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`${DIRECTUS_URL}/files`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${TOKEN}` },
      body: formData,
    })
    if (!res.ok) throw new Error(`Upload ${res.status}`)
    const json = await res.json()
    return getAssetUrl(json.data.id)
  } catch (e) {
    console.warn('Upload fallback:', e)
    return URL.createObjectURL(file)
  }
}

export function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export { getAssetUrl }
