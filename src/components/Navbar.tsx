// src/components/AppLayout.tsx
import { useState, type ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from './Sidebar'
import AnimatedBackground from './AnimatedBackground'

const logoSibakat = new URL('../assets/Logo Sibakat (ST Transparent).png', import.meta.url).href

export default function AppLayout({ children, title }: { children: ReactNode; title?: string }) {
  const { currentUser, loading } = useAuth()      // ← gunakan currentUser dari AuthContext
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
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="inline-flex items-center gap-3">
              {isNotHomePage && (
                <button
                  aria-label="Kembali ke halaman sebelumnya"
                  onClick={() => navigate(-1)}
                  className="p-2 rounded-lg hover:bg-blue-50 transition group"
                  title="Kembali"
                >
                  <svg className="w-5 h-5 text-slate-600 group-hover:text-primary transition" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              <button
                aria-label="Buka menu"
                className="btn-ghost"
                onClick={() => setOpen(true)}
              >
                ☰
              </button>
              <img src={logoSibakat} alt="SiBakat Logo" className="h-12 w-auto object-contain" />
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm muted hidden sm:block">
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
        <main className="max-w-6xl mx-auto px-6 py-10 animate-fadeIn">
          {title && <h1 className="text-2xl font-bold mb-6">{title}</h1>}
          {children}
        </main>
      </div>
    </div>
  )
}
