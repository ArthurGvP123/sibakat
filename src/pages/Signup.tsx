// src/pages/Signup.tsx
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, Eye, EyeOff, UserPlus, ArrowRight, User, CheckCircle, AlertCircle } from 'lucide-react'
import AnimatedBackground from '../components/AnimatedBackground'

const logoWatermark = new URL('../assets/Logo Sibakat (Transparent).png', import.meta.url).href

function mapFirebaseError(code?: string) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Email sudah terdaftar.'
    case 'auth/weak-password':
      return 'Kata sandi terlalu lemah (minimal 6 karakter).'
    case 'auth/invalid-email':
      return 'Format email tidak valid.'
    case 'auth/network-request-failed':
      return 'Jaringan bermasalah. Periksa koneksi internet Anda.'
    default:
      return 'Gagal membuat akun. Coba lagi.'
  }
}

export default function Signup() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [showCf, setShowCf] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (currentUser) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Nama lengkap wajib diisi.')
      return
    }
    if (password !== confirm) {
      setError('Konfirmasi kata sandi tidak cocok.')
      return
    }

    setBusy(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
      await updateProfile(cred.user, { displayName: name.trim() })
      navigate('/', { replace: true })
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(mapFirebaseError(err?.code))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="h-screen w-screen relative flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-white overflow-hidden font-sans">
      
      {/* 1. Background Animasi (Blobs) */}
      <AnimatedBackground />

      {/* 2. Watermark Logo Sibakat (Tampil di Mobile) */}
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
        <div className="bg-white/70 w-full backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-5 sm:p-7 ring-1 ring-slate-200/50">
          
          {/* Header */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary mb-2 shadow-sm">
              <UserPlus size={20} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Daftar Akun</h2>
            <p className="text-slate-500 text-xs">Mulai kelola data identifikasi bakat sekarang.</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs flex items-start gap-2 animate-fadeIn">
              <AlertCircle size={16} />
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Form - Tight Spacing */}
          <form className="space-y-3" onSubmit={onSubmit} noValidate>
            
            {/* Name Field */}
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Nama Lengkap</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm text-sm"
                  placeholder="Nama Lengkap"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm text-sm"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Password */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Kata Sandi</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <Lock size={16} />
                  </div>
                  <input
                    type={show ? 'text' : 'password'}
                    className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm text-sm"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setShow(!show)}
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-500 ml-1">Konfirmasi</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                    <CheckCircle size={16} />
                  </div>
                  <input
                    type={showCf ? 'text' : 'password'}
                    className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm text-sm"
                    placeholder="••••••"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setShowCf(!showCf)}
                  >
                    {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-3 px-4 mt-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 ${busy ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={busy}
            >
              {busy ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>Daftar Sekarang <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-5 text-center text-xs text-slate-500">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline transition">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}