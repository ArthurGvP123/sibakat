import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

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

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden {...props}>
      <path strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
    </svg>
  )
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
          <div className="relative rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-8 sm:p-10 shadow-2xl">
              <div className="space-y-6">
                <div className="text-center space-y-3">
                  <h2 className="text-3xl font-bold text-white">Masuk ke Akun</h2>
                  <p className="text-slate-300">Lanjutkan ke dashboard Anda</p>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-500/20 text-red-200 border border-red-500/30 px-4 py-3 text-sm backdrop-blur">
                    <p className="font-medium flex items-center gap-2">
                      <span className="text-lg">⚠️</span>
                      {error}
                    </p>
                  </div>
                )}

                <form className="space-y-5" onSubmit={onSubmit} noValidate>
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
                    <label className="block text-sm font-medium text-slate-200">Kata Sandi</label>
                    <div className="relative">
                      <input
                        type={show ? 'text' : 'password'}
                        className="w-full rounded-xl bg-white/5 border border-white/10 text-white px-4 py-3 pr-12 placeholder:text-slate-500 focus:outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition text-sm font-medium"
                        onClick={() => setShow(s => !s)}
                        aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      >
                        {show ? 'Sembunyikan' : 'Tampilkan'}
                      </button>
                    </div>
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
                          Memproses…
                        </>
                      ) : (
                        <>Masuk</>
                      )}
                    </span>
                  </button>
                </form>

                <div className="pt-2 border-t border-white/10 text-center text-sm text-slate-300">
                  Belum punya akun?{' '}
                  <Link to="/signup" className="text-blue-300 font-semibold hover:text-blue-200 transition">
                    Daftar sekarang
                  </Link>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}
