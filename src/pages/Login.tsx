// src/pages/Login.tsx
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react'
import AnimatedBackground from '../components/AnimatedBackground'

// Import logo untuk watermark
const logoWatermark = new URL('../assets/Logo Sibakat (Transparent).png', import.meta.url).href

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

  if (currentUser) return <Navigate to="/" replace />

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      const redirectTo = (location.state as any)?.from?.pathname || '/'
      navigate(redirectTo, { replace: true })
    } catch (err: any) {
      console.error('Login error:', err)
      setError(mapFirebaseError(err?.code))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-white overflow-hidden font-sans">
      
      {/* 1. Background Animasi (Blobs) */}
      <AnimatedBackground />

      {/* 2. Watermark Logo Sibakat */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <img 
          src={logoWatermark} 
          alt="Watermark" 
          className="w-[80vw] max-w-[600px] opacity-[0.03] grayscale brightness-110 animate-pulse" 
          style={{ animationDuration: '4s' }}
        />
      </div>

      {/* 3. Konten Utama */}
      <div className="w-full max-w-md px-6 relative z-10 animate-slideInUp">
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-8 sm:p-10 ring-1 ring-slate-200/50">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 shadow-sm">
              <LogIn size={24} />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Selamat Datang</h2>
            <p className="text-slate-500 mt-2 text-sm">Masuk untuk mengelola data bakat siswa.</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-3 animate-fadeIn">
              <span className="text-lg">⚠️</span>
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={onSubmit} noValidate>
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-slate-700">Kata Sandi</label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={show ? 'text' : 'password'}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
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
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 ${busy ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={busy}
            >
              {busy ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>Masuk Sekarang <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 text-center text-sm text-slate-500">
            Belum punya akun?{' '}
            <Link to="/signup" className="text-primary font-bold hover:underline hover:text-blue-700 transition">
              Daftar di sini
            </Link>
          </div>
        </div>

        {/* Copyright kecil di bawah */}
        <div className="mt-6 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} SiBakat.id — Universitas Negeri Semarang
        </div>
      </div>
    </div>
  )
}