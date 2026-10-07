const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://panel-prensa.eldorado.gob.ar'
const PUBLIC_ASSET_FOLDER_ID = import.meta.env.VITE_DIRECTUS_PUBLIC_FOLDER_ID || ''
const AUTH_STORAGE_KEY = 'prensa_directus_auth'
let refreshPromise = null

function getAuthSession() {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function storeAuthSession(data) {
  sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expires: data.expires,
  }))
}

function clearAuthSession() {
  sessionStorage.removeItem(AUTH_STORAGE_KEY)
}

export function isDirectusAuthenticated() {
  const session = getAuthSession()
  return Boolean(session?.accessToken || session?.refreshToken)
}

function refreshAuthSession() {
  if (refreshPromise) return refreshPromise
  refreshPromise = performAuthRefresh().finally(() => { refreshPromise = null })
  return refreshPromise
}

async function performAuthRefresh() {
  const session = getAuthSession()
  if (!session?.refreshToken) return false

  try {
    const res = await fetch(`${DIRECTUS_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: session.refreshToken, mode: 'json' }),
    })
    if (!res.ok) throw new Error('La sesión expiró')
    const json = await res.json()
    if (!json?.data?.access_token) throw new Error('Directus no devolvió un token válido')
    storeAuthSession(json.data)
    return true
  } catch {
    clearAuthSession()
    return false
  }
}

async function request(method, path, data = null, { authenticated = true, retry = true } = {}) {
  const opts = { method, headers: {} }
  if (authenticated) {
    const accessToken = getAuthSession()?.accessToken
    if (accessToken) opts.headers.Authorization = `Bearer ${accessToken}`
  }
  if (data !== null) {
    if (data instanceof FormData) {
      opts.body = data
    } else {
      opts.headers['Content-Type'] = 'application/json'
      opts.body = JSON.stringify(data)
    }
  }

  const res = await fetch(`${DIRECTUS_URL}${path}`, opts)
  if (res.status === 401 && authenticated && retry && await refreshAuthSession()) {
    return request(method, path, data, { authenticated, retry: false })
  }
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`Directus ${method} ${path} → ${res.status}: ${txt.slice(0, 200)}`)
  }
  if (res.status === 204) return true
  const json = await res.json()
  return json.data
}

export async function directusLogin(email, password) {
  const data = await request('POST', '/auth/login', { email, password, mode: 'json' }, { authenticated: false })
  if (!data?.access_token || !data?.refresh_token) {
    throw new Error('Directus no devolvió una sesión válida')
  }
  storeAuthSession(data)
  return data
}

export async function directusLogout() {
  const session = getAuthSession()
  try {
    if (session?.refreshToken) {
      await request('POST', '/auth/logout', { refresh_token: session.refreshToken, mode: 'json' }, { authenticated: false })
    }
  } finally {
    clearAuthSession()
  }
}

export function directusGet(path) {
  return request('GET', path)
}

export function directusPost(path, data) {
  return request('POST', path, data)
}

export function directusPatch(path, data) {
  return request('PATCH', path, data)
}

export function directusDelete(path) {
  return request('DELETE', path)
}

export function getAssetUrl(uuid) {
  if (!uuid) return null
  return `${DIRECTUS_URL}/assets/${uuid}`
}

export { DIRECTUS_URL, PUBLIC_ASSET_FOLDER_ID }
