import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { subscribeEventos, subscribeCategorias, saveEvento, deleteEvento } from '../../data/prensaFirebase'

function EventoForm({ evento, categorias, onSave, onCancel }) {
  const [form, setForm] = useState({
    titulo: evento?.titulo || '',
    descripcion: evento?.descripcion || '',
    fecha: evento?.fecha || '',
    hora: evento?.hora || '',
    lugar: evento?.lugar || '',
    categoria: evento?.categoria || (categorias[0]?.id || ''),
    imagen: evento?.imagen || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.titulo.trim()) { setError('El título es obligatorio'); return }
    if (!form.fecha) { setError('La fecha es obligatoria'); return }
    setSaving(true)
    const id = await onSave({ ...form, id: evento?.id })
    setSaving(false)
    if (id) onCancel()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-start justify-center pt-10 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">{evento ? 'Editar Evento' : 'Nuevo Evento'}</h3>
          <button onClick={onCancel} className="p-1 text-slate-400 hover:text-slate-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
            <input type="text" value={form.titulo} onChange={e => setForm(prev => ({ ...prev, titulo: e.target.value }))}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
            <textarea value={form.descripcion} onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
              rows={2} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha *</label>
              <input type="date" value={form.fecha} onChange={e => setForm(prev => ({ ...prev, fecha: e.target.value }))}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hora</label>
              <input type="time" value={form.hora} onChange={e => setForm(prev => ({ ...prev, hora: e.target.value }))}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lugar</label>
            <input type="text" value={form.lugar} onChange={e => setForm(prev => ({ ...prev, lugar: e.target.value }))}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              placeholder="Salón de Actos, Palacio Municipal" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label>
            <select value={form.categoria} onChange={e => setForm(prev => ({ ...prev, categoria: e.target.value }))}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none">
              {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onCancel} className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-50">Cancelar</button>
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 bg-sky-500 text-white rounded-xl font-semibold text-sm hover:bg-sky-600 disabled:opacity-50 flex items-center gap-2">
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {evento ? 'Guardar cambios' : 'Crear evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminEventos() {
  const navigate = useNavigate()
  const [eventos, setEventos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [filtro, setFiltro] = useState('todos')

  useEffect(() => {
    if (sessionStorage.getItem('prensa_admin_auth') !== 'true') { navigate('/admin'); return }
    const unsubEve = subscribeEventos(setEventos)
    const unsubCat = subscribeCategorias(setCategorias)
    return () => { unsubEve(); unsubCat() }
  }, [navigate])

  const today = new Date().toISOString().slice(0, 10)
  const filtrados = filtro === 'todos' ? eventos
    : filtro === 'proximos' ? eventos.filter(e => e.fecha >= today)
    : eventos.filter(e => e.fecha < today)

  const handleSave = async (data) => await saveEvento(data)
  const handleDelete = async (id) => { await deleteEvento(id); setDeleteConfirm(null) }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Eventos</h1>
          <p className="text-sm text-slate-500">{eventos.length} evento{eventos.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white rounded-xl border border-slate-200 p-1">
            {['todos', 'proximos', 'pasados'].map(f => (
              <button key={f} onClick={() => setFiltro(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filtro === f ? 'bg-sky-500 text-white' : 'text-slate-500 hover:text-slate-700'}`}>
                {f === 'todos' ? 'Todos' : f === 'proximos' ? 'Próximos' : 'Pasados'}
              </button>
            ))}
          </div>
          <button onClick={() => { setEditing(null); setShowForm(true) }}
            className="px-4 py-2 bg-sky-500 text-white rounded-xl font-semibold text-sm hover:bg-sky-600 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo Evento
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {filtrados.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-100">
            <p>No hay eventos</p>
          </div>
        ) : (
          filtrados.sort((a, b) => a.fecha.localeCompare(b.fecha)).map(ev => (
            <div key={ev.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex flex-col items-center justify-center border border-slate-100 flex-shrink-0">
                <span className="text-lg font-bold text-slate-800 leading-none">{ev.fecha ? new Date(ev.fecha + 'T12:00:00').getDate() : '?'}</span>
                <span className="text-[8px] font-semibold text-slate-400 uppercase">{ev.fecha ? new Date(ev.fecha + 'T12:00:00').toLocaleDateString('es-AR', { month: 'short' }) : ''}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800">{ev.titulo}</p>
                <p className="text-xs text-slate-400">
                  {ev.fecha} {ev.hora && `· ${ev.hora}`} {ev.lugar && `· ${ev.lugar}`}
                  {ev.categoria && ` · ${categorias.find(c => c.id === ev.categoria)?.nombre || ev.categoria}`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setEditing(ev); setShowForm(true) }} className="p-2 text-slate-400 hover:text-sky-600" title="Editar">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button onClick={() => setDeleteConfirm(ev.id)} className="p-2 text-slate-400 hover:text-red-500" title="Eliminar">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-2">¿Eliminar evento?</h3>
            <p className="text-sm text-slate-500 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <EventoForm evento={editing} categorias={categorias} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null) }} />
      )}
    </div>
  )
}
