// src/components/Navbar.tsx
import { useState, type ReactNode } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from './Sidebar'
import AnimatedBackground from './AnimatedBackground'
import { ArrowLeft, Menu } from 'lucide-react'

const logoSibakat = new URL('../assets/Logo Sibakat (ST Transparent).png', import.meta.url).href

export default function AppLayout({ children, title }: { children: ReactNode; title?: string }) {
  const { currentUser, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  // Logika untuk menampilkan Back Button
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/'
  const showBackButton = !isDashboard

  // Nama tampilan pengguna
  const displayName =
    currentUser?.displayName ||
    currentUser?.email ||
    currentUser?.phoneNumber ||
    'Pengguna'

  return (
    <div className="min-h-screen relative bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* Background Animasi Global */}
      <AnimatedBackground />

      {/* --- MAIN NAVBAR (Sticky Top) --- */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm transition-all h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            
            {/* KIRI: Menu & Logo */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setOpen(true)}
                className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-label="Buka menu sidebar"
              >
                <Menu size={24} strokeWidth={2.5} />
              </button>

              {/* Logo Desktop (Klik untuk ke Home / Root) */}
              <Link to="/" className="hidden sm:flex items-center group">
                <img 
                  src={logoSibakat} 
                  alt="Talenta Sport Logo" 
                  className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
                />
              </Link>
            </div>

            {/* TENGAH: Logo Mobile (Klik untuk ke Home / Root) */}
            <Link to="/" className="sm:hidden flex items-center">
              <img 
                src={logoSibakat} 
                alt="Talenta Sport Logo" 
                className="h-9 w-auto object-contain" 
              />
            </Link>

            {/* KANAN: User Name (Teks Saja, Tanpa Avatar) */}
            <div className="hidden sm:flex items-center pl-5 border-l border-slate-200 ml-2">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">
                  Masuk sebagai
                </p>
                <p className="text-sm font-bold text-slate-800 leading-none">
                  {loading ? '...' : displayName}
                </p>
              </div>
            </div>

            {/* KANAN: Mobile (Kosong atau Placeholder jika diperlukan) */}
            <div className="sm:hidden w-8" /> 

          </div>
        </div>
      </header>

      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* --- SUB-NAVBAR: TOMBOL KEMBALI (Sticky & Transparan) --- */}
      {/* MODIFIKASI:
          - sticky top-16 : Menempel tepat di bawah navbar (h-16)
          - bg-transparent : Tidak ada background box
          - pointer-events-none : Container transparan tidak menghalangi klik ke konten di bawahnya
      */}
      {showBackButton && (
        <div className="sticky top-16 z-30 animate-slideInDown hidden sm:block pointer-events-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <button
              onClick={() => navigate(-1)}
              className="
                pointer-events-auto 
                group inline-flex items-center gap-2 px-5 py-2 
                bg-white border border-slate-200 rounded-full shadow-sm 
                text-sm font-semibold text-slate-600 
                hover:text-primary hover:border-primary/40 hover:shadow-md hover:-translate-x-1 
                transition-all duration-300 active:scale-95
              "
            >
              <ArrowLeft size={16} strokeWidth={2.5} className="transition-transform duration-300 group-hover:-translate-x-1" />
              <span>Kembali</span>
            </button>
          </div>
        </div>
      )}

      {/* --- KONTEN HALAMAN --- */}
      <div className="relative z-10 flex-1">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
          {title && (
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {title}
              </h1>
              {/* Garis dekoratif di bawah judul */}
              <div className="h-1.5 w-20 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full mt-3 shadow-sm opacity-80"></div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}