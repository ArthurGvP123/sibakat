import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { useAuth } from '../contexts/AuthContext'

const logoSibakat = new URL('../assets/Logo Sibakat (ST Transparent).png', import.meta.url).href

const linkBase =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-primary transition'

/* ==== Ikon monokrom ==== */
function IconHome(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-5H9v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z" />
    </svg>
  )
}
function IconUsers(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" strokeWidth="1.6" />
      <path strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function IconChart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
      <path strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M7 16l3-4 4 3 5-7" />
      <circle cx="10" cy="12" r="1.2" fill="currentColor" />
      <circle cx="14" cy="15" r="1.2" fill="currentColor" />
      <circle cx="19" cy="8" r="1.2" fill="currentColor" />
    </svg>
  )
}
function IconScale(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        d="M12 3v3m0 0l7 4-7 4-7-4 7-4Zm0 7v8" />
      <path strokeWidth="1.6" d="M5 17a3 3 0 1 0 6 0H5Zm8 0a3 3 0 1 0 6 0h-6Z" />
    </svg>
  )
}
function IconSearch(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="11" cy="11" r="7" strokeWidth="1.6" />
      <path strokeWidth="1.6" strokeLinecap="round" d="M21 21l-3.5-3.5" />
    </svg>
  )
}
function IconBook(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4Z" />
      <path strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M8 4v13a3 3 0 0 0 3 3" />
    </svg>
  )
}
function IconUser(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="7" r="4" strokeWidth="1.6" />
      <path strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        d="M5 21a7 7 0 0 1 14 0" />
    </svg>
  )
}

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { currentUser } = useAuth()
  const [confirmOpen, setConfirmOpen] = useState(false)

  // tutup saat ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const handleLogoutClick = () => {
    setConfirmOpen(true)
  }

  const handleConfirmLogout = async () => {
    try {
      await signOut(auth)
      setConfirmOpen(false)
      onClose()
    } catch (e) {
      console.error(e)
    }
  }

  const handleCancelLogout = () => {
    setConfirmOpen(false)
  }

  const link = (isActive: boolean) =>
    `${linkBase} ${isActive ? 'bg-blue-50 text-primary' : ''}`

  const iconCls = 'w-5 h-5 text-slate-400 group-hover:text-primary transition'

  return (
    <>
      {/* overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] transition-opacity z-50 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      {/* panel kiri */}
      <aside
        role="dialog"
        aria-modal="true"
        className={`fixed left-0 top-0 h-full w-80 bg-white shadow-xl border-r z-50 transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-4 py-5 border-b-2 border-slate-200">
          <img src={logoSibakat} alt="SiBakat Logo" className="h-10 w-auto object-contain" />
        </div>

        <nav className="p-4 space-y-1">
          <NavLink to="/" className={({isActive}) => `group ${link(isActive)}`} onClick={onClose}>
            <IconHome className={iconCls} />
            <span>Beranda</span>
          </NavLink>

          <NavLink to="/data-anak" className={({isActive}) => `group ${link(isActive)}`} onClick={onClose}>
            <IconUsers className={iconCls} />
            <span>Data Anak</span>
          </NavLink>

          <NavLink to="/komparasi-statistik" className={({isActive}) => `group ${link(isActive)}`} onClick={onClose}>
            <IconChart className={iconCls} />
            <span>Komparasi Statistik</span>
          </NavLink>

          <NavLink to="/norma-penilaian" className={({isActive}) => `group ${link(isActive)}`} onClick={onClose}>
            <IconScale className={iconCls} />
            <span>Norma Penilaian</span>
          </NavLink>

          <NavLink to="/panduan-sport-search" className={({isActive}) => `group ${link(isActive)}`} onClick={onClose}>
            <IconSearch className={iconCls} />
            <span>Panduan Sport Search</span>
          </NavLink>

          <NavLink to="/petunjuk-penggunaan" className={({isActive}) => `group ${link(isActive)}`} onClick={onClose}>
            <IconBook className={iconCls} />
            <span>Petunjuk Penggunaan</span>
          </NavLink>

          <NavLink to="/profil-peneliti" className={({isActive}) => `group ${link(isActive)}`} onClick={onClose}>
            <IconUser className={iconCls} />
            <span>Profil Peneliti</span>
          </NavLink>
        </nav>

        {currentUser && (
          <div className="absolute bottom-4 left-0 right-0 px-4">
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-slate-700 hover:bg-red-50 hover:text-red-600 transition border border-slate-200 hover:border-red-300"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1" />
              </svg>
              <span className="text-sm font-medium">Keluar</span>
            </button>
          </div>
        )}
      </aside>

      {/* Confirmation Dialog - di luar Sidebar */}
      {confirmOpen && (
        <>
          <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-[2px]" onClick={handleCancelLogout} />
          <div className="fixed inset-0 z-[71] flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl animate-fadeIn overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="font-semibold text-slate-800">Konfirmasi Keluar</div>
                <button className="text-slate-400 hover:text-slate-600 text-xl font-bold" onClick={handleCancelLogout}>×</button>
              </div>
              <div className="px-5 py-4 text-slate-700">
                Apakah Anda yakin ingin keluar dari akun ini?
              </div>
              <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50">
                <button className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition" onClick={handleCancelLogout}>
                  Batal
                </button>
                <button className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition" onClick={handleConfirmLogout}>
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
