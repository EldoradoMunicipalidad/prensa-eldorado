import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  subscribeArticulos, subscribeCategorias,
  saveArticulo, deleteArticulo, uploadImage
} from '../../data/prensaFirebase'

function ArticuloForm({ articulo, categorias, onSave, onCancel }) {
  const [form, setForm] = useState({
    titulo: articulo?.titulo || '',
    resumen: articulo?.resumen || '',
    contenido: articulo?.contenido || '',
    categoria: articulo?.categoria || (categorias[0]?.id || ''),
    fecha: articulo?.fecha || new Date().toISOString().slice(0, 10),
    imagen: articulo?.imagen || '',
    autor: articulo?.autor || '',
    destacado: articulo?.destacado || false,
    slug: articulo?.slug || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [imagenPreview, setImagenPreview] = useState(articulo?.imagen || '')
  const fileInputRef = useRef(null)

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (field === 'titulo' && !articulo) {
      setForm(prev => ({
        ...prev,
        titulo: value,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80)
      }))
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImagenPreview(URL.createObjectURL(file))
    const url = await uploadImage(file)
    setForm(prev => ({ ...prev, imagen: url }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.titulo.trim()) { setError('El título es obligatorio'); return }
    if (!form.contenido.trim()) { setError('El contenido es obligatorio'); return }
    if (!form.fecha) { setError('La fecha es obligatoria'); return }
    setSaving(true)
    const id = await onSave({ ...form, id: articulo?.id })
    setSaving(false)
    if (id) onCancel()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-start justify-center pt-10 px-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-slate-800">
            {articulo ? 'Editar Artículo' : 'Nuevo Artículo'}
          </h3>
          <button onClick={onCancel} className="p-1 text-slate-400 hover:text-slate-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
              <input
                type="text"
                value={form.titulo}
                onChange={e => handleChange('titulo', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                placeholder="Título del artículo"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Resumen</label>
              <textarea
                value={form.resumen}
                onChange={e => handleChange('resumen', e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none resize-none"
                placeholder="Breve descripción que aparece en la tarjeta"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
              <select
                value={form.categoria}
                onChange={e => handleChange('categoria', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              >
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
              <input
                type="date"
                value={form.fecha}
                onChange={e => handleChange('fecha', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Autor</label>
              <input
                type="text"
                value={form.autor}
                onChange={e => handleChange('autor', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                placeholder="Nombre del autor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Destacado</label>
              <label className="flex items-center gap-3 mt-2 cursor-pointer">
                <div
                  onClick={() => handleChange('destacado', !form.destacado)}
                  className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${form.destacado ? 'bg-sky-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.destacado ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-slate-600">Mostrar en destacados</span>
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Imagen destacada</label>
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  {imagenPreview ? 'Cambiar imagen' : 'Subir imagen'}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                {form.imagen && (
                  <input
                    type="text"
                    value={form.imagen}
                    onChange={e => { handleChange('imagen', e.target.value); setImagenPreview(e.target.value) }}
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none"
                    placeholder="O pegá una URL de imagen"
                  />
                )}
              </div>
              {imagenPreview && (
                <div className="mt-3 h-36 rounded-xl overflow-hidden bg-slate-100">
                  <img src={imagenPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL)</label>
              <input
                type="text"
                value={form.slug}
                onChange={e => handleChange('slug', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none font-mono text-sm"
                placeholder="titulo-del-articulo"
              />
              <p className="text-xs text-slate-400 mt-1">URL amigable: prensa.eldorado.gob.ar/articulo/<strong>{form.slug || '...'}</strong></p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Contenido * (HTML)</label>
              <textarea
                value={form.contenido}
                onChange={e => handleChange('contenido', e.target.value)}
                rows={12}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none font-mono text-sm"
                placeholder="<p>Contenido del artículo...</p>"
              />
              <p className="text-xs text-slate-400 mt-1">Podés usar HTML: &lt;h2&gt;, &lt;p&gt;, &lt;img&gt;, &lt;ul&gt;, &lt;blockquote&gt;, etc.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onCancel} className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-sky-500 text-white rounded-xl font-semibold text-sm hover:bg-sky-600 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {articulo ? 'Guardar cambios' : 'Publicar artículo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminArticulos() {
  const navigate = useNavigate()
  const [articulos, setArticulos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [filtroCat, setFiltroCat] = useState('todas')

  useEffect(() => {
    if (sessionStorage.getItem('prensa_admin_auth') !== 'true') { navigate('/admin'); return }
    const unsubArt = subscribeArticulos(setArticulos)
    const unsubCat = subscribeCategorias(setCategorias)
    return () => { unsubArt(); unsubCat() }
  }, [navigate])

  const filtrados = filtroCat === 'todas'
    ? articulos
    : articulos.filter(a => a.categoria === filtroCat)

  const handleSave = async (data) => {
    return await saveArticulo(data)
  }

  const handleDelete = async (id) => {
    await deleteArticulo(id)
    setDeleteConfirm(null)
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Artículos</h1>
          <p className="text-sm text-slate-500">{articulos.length} artículo{articulos.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filtroCat}
            onChange={e => setFiltroCat(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 outline-none"
          >
            <option value="todas">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
          <button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="px-4 py-2 bg-sky-500 text-white rounded-xl font-semibold text-sm hover:bg-sky-600 transition-colors flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo Artículo
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filtrados.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>No hay artículos</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtrados.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '')).map(art => (
              <div key={art.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                {art.imagen ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                    <img src={art.imagen} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V5"/></svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-800 truncate">{art.titulo}</p>
                    {art.destacado && <span className="text-[10px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">Destacado</span>}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {art.fecha} · {art.categoriaNombre || categorias.find(c => c.id === art.categoria)?.nombre || art.categoria}
                    {art.autor && ` · ${art.autor}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditing(art); setShowForm(true) }}
                    className="p-2 text-slate-400 hover:text-sky-600 transition-colors"
                    title="Editar"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(art.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    title="Eliminar"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-2">¿Eliminar artículo?</h3>
            <p className="text-sm text-slate-500 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50">
                Cancelar
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <ArticuloForm
          articulo={editing}
          categorias={categorias}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}
