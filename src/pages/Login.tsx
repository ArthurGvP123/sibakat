// src/pages/Login.tsx
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react'
import AnimatedBackground from '../components/AnimatedBackground'

// Logo untuk watermark (background)
const logoWatermark = new URL('../assets/Logo Sibakat (Transparent).png', import.meta.url).href
// Logo untuk Splash Screen (Ikon Utama)
const logoSplash = new URL('../assets/Logo Sibakat (Transparent).png', import.meta.url).href

function mapFirebaseError(code?: string) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Email atau kata sandi salah.'
    case 'auth/user-not-found':
      return 'Akun tidak ditemukan.'
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan. Coba beberapa saat lagi.'
    case 'auth/network-request-failed':
      return 'Jaringan bermasalah. Periksa koneksi internet Anda.'
    default:
      return 'Gagal masuk. Periksa kembali data Anda.'
  }
}

export default function Login() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  
  // State khusus untuk menangani animasi sukses
  const [loginSuccess, setLoginSuccess] = useState(false)

  // Modifikasi Redirect
  if (currentUser && !loginSuccess) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      
      // LOGIN SUKSES: Aktifkan mode animasi
      setLoginSuccess(true) 
      setBusy(false)

      setTimeout(() => {
        const redirectTo = (location.state as any)?.from?.pathname || '/'
        navigate(redirectTo, { replace: true })
      }, 1600)

    } catch (err: any) {
      console.error('Login error:', err)
      setError(mapFirebaseError(err?.code))
      setBusy(false)
    }
  }

  // === TAMPILAN SPLASH SCREEN ===
  if (loginSuccess) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white animate-pulse" />
        <div className="relative z-10 flex flex-col items-center">
          <img 
            src={logoSplash} 
            alt="SiBakat Splash" 
            className="w-32 h-32 md:w-48 md:h-48 object-contain animate-splash"
          />
        </div>
      </div>
    )
  }

  // === TAMPILAN FORM LOGIN (Fullscreen & No Scroll) ===
  return (
    <div className="h-screen w-screen relative flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-white overflow-hidden font-sans">
      
      {/* 1. Background Animasi (Blobs) */}
      <AnimatedBackground />

      {/* 2. Watermark Logo Sibakat (Diperbaiki untuk Mobile) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1]">
        <img 
          src={logoWatermark} 
          alt="Watermark" 
          className="w-[120vw] sm:w-[70vw] max-w-[800px] opacity-[0.05] grayscale brightness-110 animate-pulse" 
          style={{ animationDuration: '4s' }}
        />
      </div>

      {/* 3. Konten Utama - Ringkas agar muat tanpa scroll */}
      <div className="w-full max-w-md px-6 relative z-10 animate-slideInUp flex flex-col items-center">
        <div className="bg-white/70 w-full backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-6 sm:p-8 ring-1 ring-slate-200/50">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary mb-3 shadow-sm">
              <LogIn size={20} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Selamat Datang</h2>
            <p className="text-slate-500 mt-1 text-xs">Masuk untuk mengelola data bakat siswa.</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs flex items-start gap-2 animate-fadeIn">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm text-sm"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Kata Sandi</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type={show ? 'text' : 'password'}
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 px-4 mt-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 text-sm ${busy ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={busy}
            >
              {busy ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>Masuk Sekarang <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Belum punya akun?{' '}
            <Link to="/signup" className="text-primary font-bold hover:underline transition">
              Daftar di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}