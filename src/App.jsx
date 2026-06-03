import { Routes, Route } from 'react-router-dom'
import Navbar from './assets/components/Navbar'
import Footer from './assets/components/Footer'
import HomePage from './pages/HomePage'
import CategoriaPage from './pages/CategoriaPage'
import ArticuloPage from './pages/ArticuloPage'
import EventosPage from './pages/EventosPage'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminArticulos from './pages/admin/AdminArticulos'
import AdminEventos from './pages/admin/AdminEventos'
import AdminCategorias from './pages/admin/AdminCategorias'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/categoria/:slug" element={<CategoriaPage />} />
          <Route path="/articulo/:slug" element={<ArticuloPage />} />
          <Route path="/eventos" element={<EventosPage />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/articulos" element={<AdminArticulos />} />
          <Route path="/admin/eventos" element={<AdminEventos />} />
          <Route path="/admin/categorias" element={<AdminCategorias />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
