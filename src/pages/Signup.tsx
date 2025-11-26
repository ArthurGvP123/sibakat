import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

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

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden {...props}>
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
    </svg>
  )
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
      color: level <= 1 ? 'red' : level === 2 ? 'yellow' : level === 3 ? 'green' : 'emerald'
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-cyan-500/20 blur-3xl animate-pulse" style={{ animationDelay: '250ms' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-pulse" style={{ animationDelay: '500ms' }} />
      </div>

      <div className="w-full max-w-md px-4 sm:px-6 relative z-10 animate-slideInUp">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-300" />
          <div className="relative rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-8 sm:p-10 shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
              <div className="space-y-6">
                <div className="text-center space-y-3">
                  <h2 className="text-3xl font-bold text-white">Buat Akun Baru</h2>
                  <p className="text-slate-300">Proses daftar hanya butuh 2 menit</p>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-500/20 text-red-200 border border-red-500/30 px-4 py-3 text-sm backdrop-blur">
                    <p className="font-medium flex items-center gap-2">
                      <span className="text-lg">⚠️</span>
                      {error}
                    </p>
                  </div>
                )}

                <form className="space-y-4" onSubmit={onSubmit} noValidate>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">Nama Lengkap (Opsional)</label>
                    <input
                      type="text"
                      className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-4 py-3 placeholder:text-slate-500 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition"
                      placeholder="Nama Anda"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">Email</label>
                    <input
                      type="email"
                      className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-4 py-3 placeholder:text-slate-500 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-slate-200">Kata Sandi</label>
                      {password && (
                        <span className={`text-xs font-semibold ${
                          passwordStrength.color === 'red' ? 'text-red-300' :
                          passwordStrength.color === 'yellow' ? 'text-yellow-300' :
                          passwordStrength.color === 'green' ? 'text-green-300' :
                          'text-emerald-300'
                        }`}>
                          {passwordStrength.text}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showPw ? 'text' : 'password'}
                        className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-4 py-3 pr-12 placeholder:text-slate-500 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition text-sm font-medium"
                        onClick={() => setShowPw(s => !s)}
                        aria-label={showPw ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {showPw ? 'Sembunyikan' : 'Tampilkan'}
                      </button>
                    </div>
                    {password && password.length < 6 && (
                      <p className="text-xs text-slate-300">Minimal 6 karakter</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-200">Konfirmasi Kata Sandi</label>
                    <div className="relative">
                      <input
                        type={showCf ? 'text' : 'password'}
                        className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-4 py-3 pr-12 placeholder:text-slate-500 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition"
                        placeholder="••••••••"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition text-sm font-medium"
                        onClick={() => setShowCf(s => !s)}
                        aria-label={showCf ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {showCf ? 'Sembunyikan' : 'Tampilkan'}
                      </button>
                    </div>
                    {confirm && password !== confirm && (
                      <p className="text-xs text-red-300">Kata sandi tidak cocok</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className={`w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold py-3 px-4 hover:from-blue-600 hover:to-cyan-600 transition duration-300 flex items-center justify-center gap-2 relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed ${busy ? 'opacity-70' : ''}`}
                    disabled={busy}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {busy ? (
                        <>
                          <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                          Membuat akun…
                        </>
                      ) : (
                        <>Daftar Sekarang</>
                      )}
                    </span>
                  </button>
                </form>

                <div className="pt-2 border-t border-white/10 text-center text-sm text-slate-300">
                  Sudah punya akun?{' '}
                  <Link to="/login" className="text-blue-300 font-semibold hover:text-blue-200 transition">
                    Masuk di sini
                  </Link>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}
