const DIRECTUS_URL = import.meta.env.VITE_DIRECTUS_URL || 'https://panel-prensa.eldorado.gob.ar'
const TOKEN = import.meta.env.VITE_DIRECTUS_TOKEN || '8jJtvRO1o7xMqr8mAW9Qjdb_cmkfdjoS'

async function request(method, path, data = null) {
  const url = `${DIRECTUS_URL}${path}`
  const opts = {
    method,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
    },
  }
  if (data !== null) {
    if (data instanceof FormData) {
      // Don't set Content-Type for FormData (fetch sets it with boundary)
      opts.body = data
    } else {
      opts.headers['Content-Type'] = 'application/json'
      opts.body = JSON.stringify(data)
    }
  }
  const res = await fetch(url, opts)
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`Directus ${method} ${path} → ${res.status}: ${txt.slice(0, 200)}`)
  }
  if (res.status === 204) return true
  const json = await res.json()
  return json.data
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

export { DIRECTUS_URL, TOKEN }
