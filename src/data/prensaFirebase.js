import {
  doc, getDoc, getDocs, setDoc, deleteDoc, collection, query,
  orderBy, where, onSnapshot, serverTimestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../lib/firebase'

// ─── DEFAULTS ────────────────────────────────────────
const DEFAULT_CATEGORIES = [
  { id: 'gobierno', nombre: 'Secretaría de Gobierno', descripcion: 'Gestión política y administrativa del municipio', color: 'bg-sky-500', icon: 'building2', orden: 1 },
  { id: 'hacienda', nombre: 'Secretaría de Hacienda', descripcion: 'Finanzas, rentas y contabilidad municipal', color: 'bg-emerald-500', icon: 'landmark', orden: 2 },
  { id: 'obras-publicas', nombre: 'Secretaría de Obras y Servicios Públicos', descripcion: 'Obras, planeamiento y servicios urbanos', color: 'bg-amber-500', icon: 'hardHat', orden: 3 },
  { id: 'ambiente', nombre: 'Secretaría de Ambiente', descripcion: 'Gestión ambiental, parques y espacios verdes', color: 'bg-green-500', icon: 'leaf', orden: 4 },
  { id: 'produccion', nombre: 'Secretaría de Producción', descripcion: 'Desarrollo productivo, industria y comercio', color: 'bg-violet-500', icon: 'factory', orden: 5 },
  { id: 'accion-social', nombre: 'Secretaría de Acción Social', descripcion: 'Desarrollo social, niñez, adultos mayores', color: 'bg-rose-500', icon: 'heart', orden: 6 },
]

const DEFAULT_ADMIN = { username: 'admin', passwordHash: hashPassword('admin') }

function hashPassword(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return hash.toString(36)
}

// ─── LOCALSTORAGE FALLBACK ───────────────────────────
const LS_KEY = 'prensa_eldorado'
let firebaseReady = true

function lsLoad() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return null
}

function lsSave(data) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(data)) } catch (_) {}
}

function lsInit() {
  const existing = lsLoad()
  if (existing) return existing
  const initial = { categorias: DEFAULT_CATEGORIES, articulos: [], eventos: [], admins: [DEFAULT_ADMIN] }
  lsSave(initial)
  return initial
}

function isPermissionError(err) {
  return err?.code === 'permission-denied' || err?.message?.includes('permission-denied')
}

// ─── HELPERS ─────────────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

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

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// ─── CATEGORÍAS ─────────────────────────────────────
export async function getCategorias() {
  if (!firebaseReady) return lsInit().categorias || DEFAULT_CATEGORIES
  try {
    const snap = await getDocs(query(collection(db, 'categorias'), orderBy('orden')))
    if (snap.empty) {
      for (const cat of DEFAULT_CATEGORIES) await setDoc(doc(db, 'categorias', cat.id), cat)
      return DEFAULT_CATEGORIES
    }
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    if (isPermissionError(e)) { firebaseReady = false }
    return lsInit().categorias || DEFAULT_CATEGORIES
  }
}

export async function saveCategoria(cat) {
  if (!firebaseReady) { const d = lsInit(); const idx = d.categorias.findIndex(c => c.id === cat.id); if (idx >= 0) d.categorias[idx] = cat; else d.categorias.push(cat); lsSave(d); return }
  try { await setDoc(doc(db, 'categorias', cat.id), cat, { merge: true }) }
  catch (e) { if (isPermissionError(e)) firebaseReady = false }
}

export async function deleteCategoria(id) {
  if (!firebaseReady) { const d = lsInit(); d.categorias = d.categorias.filter(c => c.id !== id); lsSave(d); return }
  try { await deleteDoc(doc(db, 'categorias', id)) }
  catch (e) { if (isPermissionError(e)) firebaseReady = false }
}

export function subscribeCategorias(callback) {
  if (!firebaseReady) { callback(lsInit().categorias || DEFAULT_CATEGORIES); return () => {} }
  const unsub = onSnapshot(
    query(collection(db, 'categorias'), orderBy('orden')),
    snap => callback(snap.empty ? DEFAULT_CATEGORIES : snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => { if (isPermissionError(err)) { firebaseReady = false; callback(lsInit().categorias || DEFAULT_CATEGORIES) } }
  )
  return unsub
}

// ─── ARTÍCULOS ──────────────────────────────────────
export async function getArticulos(options = {}) {
  if (!firebaseReady) return lsInit().articulos || []
  try {
    let q = query(collection(db, 'articulos'), orderBy('fecha', 'desc'))
    if (options.categoria) q = query(q, where('categoria', '==', options.categoria))
    if (options.destacado) q = query(q, where('destacado', '==', true))
    if (options.limit) q = query(q, ...(options.categoria ? [where('categoria', '==', options.categoria)] : []), orderBy('fecha', 'desc'))
    
    // Rebuild query properly for multiple conditions
    const constraints = []
    if (options.categoria) constraints.push(where('categoria', '==', options.categoria))
    if (options.destacado) constraints.push(where('destacado', '==', true))
    constraints.push(orderBy('fecha', 'desc'))
    
    q = query(collection(db, 'articulos'), ...constraints)
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    if (isPermissionError(e)) { firebaseReady = false }
    return lsInit().articulos || []
  }
}

export async function getArticuloBySlug(slug) {
  if (!firebaseReady) return (lsInit().articulos || []).find(a => a.slug === slug) || null
  try {
    const q = query(collection(db, 'articulos'), where('slug', '==', slug))
    const snap = await getDocs(q)
    if (!snap.empty) return { id: snap.docs[0].id, ...snap.docs[0].data() }
    return null
  } catch (e) {
    if (isPermissionError(e)) firebaseReady = false
    return (lsInit().articulos || []).find(a => a.slug === slug) || null
  }
}

export async function getArticuloById(id) {
  if (!firebaseReady) return (lsInit().articulos || []).find(a => a.id === id) || null
  try {
    const snap = await getDoc(doc(db, 'articulos', id))
    if (snap.exists()) return { id: snap.id, ...snap.data() }
    return null
  } catch (e) {
    if (isPermissionError(e)) firebaseReady = false
    return (lsInit().articulos || []).find(a => a.id === id) || null
  }
}

export async function saveArticulo(articulo) {
  const id = articulo.id || generateId()
  const data = {
    ...articulo,
    id,
    slug: articulo.slug || slugify(articulo.titulo),
    updatedAt: serverTimestamp(),
    createdAt: articulo.createdAt || serverTimestamp(),
  }
  if (!firebaseReady) {
    const d = lsInit()
    const idx = d.articulos.findIndex(a => a.id === id)
    if (idx >= 0) d.articulos[idx] = { ...data, createdAt: d.articulos[idx].createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() }
    else d.articulos.push({ ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    lsSave(d)
    return id
  }
  try {
    await setDoc(doc(db, 'articulos', id), data, { merge: true })
    return id
  } catch (e) {
    if (isPermissionError(e)) firebaseReady = false
    return null
  }
}

export async function deleteArticulo(id) {
  if (!firebaseReady) { const d = lsInit(); d.articulos = d.articulos.filter(a => a.id !== id); lsSave(d); return }
  try { await deleteDoc(doc(db, 'articulos', id)) }
  catch (e) { if (isPermissionError(e)) firebaseReady = false }
}

export function subscribeArticulos(callback) {
  if (!firebaseReady) { callback(lsInit().articulos || []); return () => {} }
  const unsub = onSnapshot(
    query(collection(db, 'articulos'), orderBy('fecha', 'desc')),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => { if (isPermissionError(err)) { firebaseReady = false; callback(lsInit().articulos || []) } }
  )
  return unsub
}

// ─── EVENTOS ─────────────────────────────────────────
export async function getEventos() {
  if (!firebaseReady) return lsInit().eventos || []
  try {
    const snap = await getDocs(query(collection(db, 'eventos'), orderBy('fecha', 'asc')))
    return snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    if (isPermissionError(e)) firebaseReady = false
    return lsInit().eventos || []
  }
}

export async function saveEvento(evento) {
  const id = evento.id || generateId()
  if (!firebaseReady) {
    const d = lsInit()
    const idx = d.eventos.findIndex(e => e.id === id)
    if (idx >= 0) d.eventos[idx] = { ...evento, id }
    else d.eventos.push({ ...evento, id })
    lsSave(d)
    return id
  }
  try {
    await setDoc(doc(db, 'eventos', id), { ...evento, id, updatedAt: serverTimestamp(), createdAt: evento.createdAt || serverTimestamp() }, { merge: true })
    return id
  } catch (e) {
    if (isPermissionError(e)) firebaseReady = false
    return null
  }
}

export async function deleteEvento(id) {
  if (!firebaseReady) { const d = lsInit(); d.eventos = d.eventos.filter(e => e.id !== id); lsSave(d); return }
  try { await deleteDoc(doc(db, 'eventos', id)) }
  catch (e) { if (isPermissionError(e)) firebaseReady = false }
}

export function subscribeEventos(callback) {
  if (!firebaseReady) { callback(lsInit().eventos || []); return () => {} }
  const unsub = onSnapshot(
    query(collection(db, 'eventos'), orderBy('fecha', 'asc')),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
    err => { if (isPermissionError(err)) { firebaseReady = false; callback(lsInit().eventos || []) } }
  )
  return unsub
}

// ─── AUTH ────────────────────────────────────────────
export function authenticateAdmin(username, password) {
  const d = lsInit()
  const admins = d.admins || [DEFAULT_ADMIN]
  const hash = hashPassword(password)
  return admins.some(a => a.username === username && a.passwordHash === hash)
}

export function changeAdminPassword(username, currentPassword, newPassword) {
  const d = lsInit()
  const admins = d.admins || [DEFAULT_ADMIN]
  const idx = admins.findIndex(a => a.username === username && a.passwordHash === hashPassword(currentPassword))
  if (idx === -1) return false
  admins[idx].passwordHash = hashPassword(newPassword)
  d.admins = admins
  lsSave(d)
  return true
}

// ─── IMAGE UPLOAD ────────────────────────────────────
export async function uploadImage(file) {
  if (!firebaseReady) return URL.createObjectURL(file)
  try {
    const ext = file.name.split('.').pop()
    const path = `prensa/${generateId()}.${ext}`
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, file)
    return await getDownloadURL(storageRef)
  } catch (e) {
    console.warn('Upload fallback to object URL:', e)
    return URL.createObjectURL(file)
  }
}

export { DEFAULT_CATEGORIES, generateId, slugify }
