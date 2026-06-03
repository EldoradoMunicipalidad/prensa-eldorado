import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { subscribeCategorias, saveCategoria, deleteCategoria } from '../../data/prensaFirebase'

export default function AdminCategorias() {
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState([])
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    if (sessionStorage.getItem('prensa_admin_auth') !== 'true') { navigate('/admin'); return }
    const unsub = subscribeCategorias(setCategorias)
    return () => unsub()
  }, [navigate])

  const handleSave = async (data) => {
    await saveCategoria(data)
    setShowForm(false)
    setEditing(null)
  }

  const handleDelete = async (id) => {
    await deleteCategoria(id)
    setDeleteConfirm(null)
  }

  const PRESET_COLORS = [
    '#0EA5E9', '#2563EB', '#7C3AED', '#D946EF',
    '#F43F5E', '#EF4444', '#F97316', '#F59E0B',
    '#10B981', '#22C55E', '#14B8A6', '#06B6D4',
    '#6366F1', '#8B5CF6', '#EC4899', '#E11D48',
  ]

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Categorías</h1>
          <p className="text-sm text-slate-500">Administrá las Secretarías del municipio</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="px-4 py-2 bg-sky-500 text-white rounded-xl font-semibold text-sm hover:bg-sky-600 flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Nueva Categoría
        </button>
      </div>

      <div className="space-y-3">
        {categorias.sort((a, b) => (a.orden || 99) - (b.orden || 99)).map(cat => (
          <div key={cat.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
              style={{ backgroundColor: cat.color || '#0EA5E9' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V5"/></svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-800">{cat.nombre}</p>
              <p className="text-xs text-slate-400">Orden {cat.orden} · {cat.slug}</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => { setEditing(cat); setShowForm(true) }} className="p-2 text-slate-400 hover:text-sky-600" title="Editar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button onClick={() => setDeleteConfirm(cat.id)} className="p-2 text-slate-400 hover:text-red-500" title="Eliminar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <CategoriaForm
          categoria={editing}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null) }}
          colors={PRESET_COLORS}
        />
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-2">¿Eliminar categoría?</h3>
            <p className="text-sm text-slate-500 mb-6">Los artículos de esta categoría se mostrarán sin categoría asignada.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CategoriaForm({ categoria, onSave, onCancel, colors }) {
  const [form, setForm] = useState({
    nombre: categoria?.nombre || '',
    slug: categoria?.slug || '',
    color: categoria?.color || '#0EA5E9',
    orden: categoria?.orden || 99,
    _id: categoria?._id || null,
  })
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return }
    const slug = form.slug || form.nombre.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/g, '-').replace(/(^-|-$)/g, '')
    onSave({ ...form, slug, _id: categoria?._id || null })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-start justify-center pt-10 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">{categoria ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
          <button onClick={onCancel} className="p-1 text-slate-400 hover:text-slate-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
            <input type="text" value={form.nombre} onChange={e => {
              const v = e.target.value
              setForm(prev => ({ ...prev, nombre: v, slug: categoria ? prev.slug : v.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/g, '-').replace(/(^-|-$)/g, '') }))
            }}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Slug (URL)</label>
            <input type="text" value={form.slug} onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none font-mono text-sm" />
            <p className="text-xs text-slate-400 mt-1">Identificador único para la URL</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
            <div className="flex flex-wrap gap-2">
              {colors.map(c => (
                <button key={c} type="button" onClick={() => setForm(prev => ({ ...prev, color: c }))}
                  className={`w-8 h-8 rounded-xl ${form.color === c ? 'ring-2 ring-offset-2 ring-sky-400' : 'opacity-60 hover:opacity-100'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Orden</label>
            <input type="number" value={form.orden} onChange={e => setForm(prev => ({ ...prev, orden: Number(e.target.value) }))}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" min={1} max={99} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onCancel} className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50">Cancelar</button>
            <button type="submit" className="px-6 py-2.5 bg-sky-500 text-white rounded-xl font-semibold text-sm hover:bg-sky-600">
              {categoria ? 'Guardar cambios' : 'Crear categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
