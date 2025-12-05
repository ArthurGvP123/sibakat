// src/components/Navbar.tsx
import { useState, type ReactNode } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from './Sidebar'
import AnimatedBackground from './AnimatedBackground'

const logoSibakat = new URL('../assets/Logo Sibakat (ST Transparent).png', import.meta.url).href

export default function AppLayout({ children, title }: { children: ReactNode; title?: string }) {
  const { currentUser, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  // Helper untuk cek jika bukan home page
  const isNotHomePage = location.pathname !== '/'

  // Nama tampilan yang rapi (fallback ke email/telepon)
  const displayName =
    currentUser?.displayName ||
    currentUser?.email ||
    currentUser?.phoneNumber ||
    'Pengguna'

  return (
    <div className="min-h-screen relative bg-gradient-to-b from-blue-50 to-white">
      {/* background animasi di layer bawah */}
      <AnimatedBackground />

      {/* seluruh UI (konten) di atas background */}
      <div className="relative z-10">
        {/* header */}
        <header className="border-b bg-white/70 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            
            {/* --- GROUP KIRI (Menu & Back & Logo Desktop) --- */}
            <div className="inline-flex items-center gap-3">
              {/* Back Button: Hanya tampil di Desktop (sm ke atas) */}
              {isNotHomePage && (
                <button
                  aria-label="Kembali ke halaman sebelumnya"
                  onClick={() => navigate(-1)}
                  className="hidden sm:block p-2 rounded-lg hover:bg-blue-50 transition group"
                  title="Kembali"
                >
                  <svg className="w-5 h-5 text-slate-600 group-hover:text-primary transition" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              
              {/* Hamburger Menu: Selalu tampil */}
              <button
                aria-label="Buka menu"
                className="btn-ghost text-xl px-3 py-2"
                onClick={() => setOpen(true)}
              >
                ☰
              </button>

              {/* Logo Desktop: Sembunyi di HP, Tampil di PC - BISA DIKLIK */}
              <Link to="/" className="hidden sm:block ml-2 hover:opacity-80 transition-opacity">
                <img 
                  src={logoSibakat} 
                  alt="SiBakat Logo" 
                  className="h-12 w-auto object-contain" 
                />
              </Link>
            </div>

            {/* --- LOGO MOBILE (Tampil di Kanan pada HP) - BISA DIKLIK --- */}
            {/* Karena parent pakai justify-between, elemen ini akan didorong ke kanan saat User Info hidden */}
            <Link to="/" className="block sm:hidden hover:opacity-80 transition-opacity">
              <img 
                src={logoSibakat} 
                alt="SiBakat Logo" 
                className="h-10 w-auto object-contain" 
              />
            </Link>

            {/* --- GROUP KANAN (User Info - Desktop Only) --- */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-sm muted">
                {loading
                  ? 'Memuat…'
                  : currentUser
                    ? <>Masuk sebagai <span className="font-semibold text-slate-700">{displayName}</span></>
                    : '—'}
              </div>
            </div>
          </div>
        </header>

        {/* sidebar (fixed) + overlay (z-50) */}
        <Sidebar open={open} onClose={() => setOpen(false)} />

        {/* content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-fadeIn">
          {title && <h1 className="text-xl sm:text-2xl font-bold mb-6">{title}</h1>}
          {children}
        </main>
      </div>
    </div>
  )
}