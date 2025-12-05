// src/pages/Signup.tsx
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, Eye, EyeOff, UserPlus, ArrowRight, User, CheckCircle } from 'lucide-react'
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
  const [showPw, setShowPw] = useState(false)
  const [showCf, setShowCf] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (currentUser) return <Navigate to="/" replace />

  const passwordStrength = (() => {
    if (!password) return { level: 0, text: '', color: '' }
    let level = 0
    if (password.length >= 6) level++
    if (/[A-Z]/.test(password)) level++
    if (/[0-9]/.test(password)) level++
    if (/[^A-Za-z0-9]/.test(password)) level++

    return {
      level,
      text: level <= 1 ? 'Lemah' : level === 2 ? 'Sedang' : level === 3 ? 'Kuat' : 'Sangat Kuat',
      color: level <= 1 ? 'text-red-500' : level === 2 ? 'text-amber-500' : level === 3 ? 'text-emerald-500' : 'text-blue-600'
    }
  })()

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (password !== confirm) {
      setError('Kata sandi tidak cocok')
      return
    }

    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter')
      return
    }

    setBusy(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
      await updateProfile(cred.user, { displayName: name || 'Pengguna' })
      navigate('/', { replace: true })
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(mapFirebaseError(err?.code))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-white overflow-hidden font-sans py-10">
      
      <AnimatedBackground />

      {/* Watermark Logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <img 
          src={logoWatermark} 
          alt="Watermark" 
          className="w-[80vw] max-w-[600px] opacity-[0.03] grayscale brightness-110 animate-pulse" 
          style={{ animationDuration: '4s' }}
        />
      </div>

      <div className="w-full max-w-md px-6 relative z-10 animate-slideInUp">
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl p-8 sm:p-10 ring-1 ring-slate-200/50 max-h-[85vh] overflow-y-auto hide-scrollbar">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 shadow-sm">
              <UserPlus size={24} />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Buat Akun Baru</h2>
            <p className="text-slate-500 mt-2 text-sm">Bergabung bersama SiBakat.id</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-3 animate-fadeIn">
              <span className="text-lg">⚠️</span>
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={onSubmit} noValidate>
            
            {/* Nama */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Nama Lengkap</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                  placeholder="Nama Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-slate-700">Kata Sandi</label>
                {password && (
                  <span className={`text-xs font-bold ${passwordStrength.color}`}>
                    {passwordStrength.text}
                  </span>
                )}
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPw ? 'text' : 'password'}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Password requirements hint */}
              <div className="flex gap-2 mt-1">
                <span className={`h-1 flex-1 rounded-full transition-all duration-300 ${passwordStrength.level >= 1 ? 'bg-red-500' : 'bg-slate-200'}`} />
                <span className={`h-1 flex-1 rounded-full transition-all duration-300 ${passwordStrength.level >= 2 ? 'bg-amber-500' : 'bg-slate-200'}`} />
                <span className={`h-1 flex-1 rounded-full transition-all duration-300 ${passwordStrength.level >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                <span className={`h-1 flex-1 rounded-full transition-all duration-300 ${passwordStrength.level >= 4 ? 'bg-blue-600' : 'bg-slate-200'}`} />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Konfirmasi Kata Sandi</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <CheckCircle size={18} />
                </div>
                <input
                  type={showCf ? 'text' : 'password'}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShowCf(!showCf)}
                >
                  {showCf ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirm && password !== confirm && (
                <p className="text-xs text-red-500 font-medium mt-1 ml-1">Kata sandi tidak cocok</p>
              )}
            </div>

            <button
              type="submit"
              className={`w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 ${busy ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={busy}
            >
              {busy ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Membuat akun...
                </>
              ) : (
                <>Daftar Sekarang <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline hover:text-blue-700 transition">
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}