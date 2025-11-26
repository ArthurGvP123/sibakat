import { Link } from 'react-router-dom'
import AppLayout from '../components/Navbar'

/* Ikon monokrom (inline SVG) */
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

/* Ukuran judul tombol (sudah dikurangi 1 tingkat) */
function titleSize() { return 'text-lg lg:text-xl' }
function descSize() { return 'text-sm' }
function iconSize() { return 'w-8 h-8' }

export default function Home() {
  const items = [
    { to: '/data-anak',            label: 'Data Anak',            desc: 'Kelola data siswa & asesmen',      span: 'sm:col-span-6 sm:row-span-1', Icon: IconUsers },
    { to: '/komparasi-statistik',  label: 'Komparasi Statistik',  desc: 'Bandingkan hasil antar indikator', span: 'sm:col-span-6 sm:row-span-1', Icon: IconChart },
    { to: '/norma-penilaian',      label: 'Norma Penilaian',      desc: 'Atur norma & rentang usia/gender', span: 'sm:col-span-4 sm:row-span-1', Icon: IconScale },
    { to: '/panduan-sport-search', label: 'Panduan Sport Search', desc: 'Cara memilih cabang olahraga',     span: 'sm:col-span-4 sm:row-span-1', Icon: IconSearch },
    { to: '/petunjuk-penggunaan',  label: 'Petunjuk Penggunaan',  desc: 'Langkah-langkah memakai aplikasi', span: 'sm:col-span-4 sm:row-span-1', Icon: IconBook },
    { to: '/profil-peneliti',      label: 'Profil Peneliti',      desc: 'Tentang peneliti & kontak',        span: 'sm:col-span-12 sm:row-span-1', Icon: IconUser },
  ] as const

  return (
    <AppLayout>
      <div className="text-center">
        {/* Judul halaman (shimmer) */}
        <h1
          className="
            text-4xl sm:text-5xl font-extrabold tracking-tight
            bg-[linear-gradient(90deg,#0f172a,#2563eb,#0f172a)]
            bg-[length:200%_100%] bg-clip-text text-transparent
            animate-shimmer
          "
        >
          SELAMAT DATANG DI APLIKASI<span className="text-primary"> SIBAKAT.ID</span>
        </h1>
      </div>

      {/* Tambahkan jarak ekstra antara judul dan grid */}
      <div
        className="
          mt-10 sm:mt-10 grid gap-6
          grid-cols-1
          sm:grid-cols-12
          auto-rows-[140px] lg:auto-rows-[160px]
        "
      >
        {items.map(({ to, label, desc, span, Icon }) => (
          <Link
            key={to}
            to={to}
            className={[
              'group relative overflow-hidden h-full',
              'card glass p-5',
              'hover:shadow-lg hover:ring-2 ring-primary/20 transition',
              span
            ].join(' ')}
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-70" />
            <div className="pointer-events-none absolute -left-6 -bottom-6 h-20 w-20 rounded-full bg-accent/10 blur-2xl" />

            <div className="relative flex h-full flex-col">
              <div className="flex items-start justify-between">
                <div className={`font-semibold ${titleSize()}`}>{label}</div>
                <Icon className={`${iconSize()} text-slate-400 group-hover:text-primary transition`} />
              </div>

              <div className="mt-auto">
                <div className={`text-slate-600 ${descSize()}`}>{desc}</div>
              </div>
            </div>

            <div className="absolute right-4 bottom-4 text-slate-400 group-hover:text-primary transition">
              →
            </div>
          </Link>
        ))}
      </div>
    </AppLayout>
  )
}
