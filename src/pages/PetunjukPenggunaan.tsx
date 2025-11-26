import { Link } from 'react-router-dom'
import AppLayout from '../components/Navbar'

/* ===== Ikon monokrom (inline SVG) ===== */
function IconUserPlus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" strokeWidth="1.6" />
      <path strokeWidth="1.6" strokeLinecap="round" d="M16 11h6M19 8v6" />
    </svg>
  )
}
function IconKey(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="7" cy="17" r="3" strokeWidth="1.6" />
      <path strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M10 17h10l-2-2 2-2" />
    </svg>
  )
}
function IconUsers(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" strokeWidth="1.6" />
      <path strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
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
      <path strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M12 3v3m0 0l7 4-7 4-7-4 7-4Zm0 7v8" />
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
function IconHelp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <path strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        d="M9.5 9a2.5 2.5 0 1 1 3.9 2 3 3 0 0 0-1.4 2.5V14" />
      <circle cx="12" cy="12" r="9" strokeWidth="1.6" />
      <circle cx="12" cy="18" r="1" fill="currentColor" />
    </svg>
  )
}
function IconUser(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
      <circle cx="12" cy="7" r="4" strokeWidth="1.6" />
      <path strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" d="M5 21a7 7 0 0 1 14 0" />
    </svg>
  )
}

/* Kartu panduan dengan animasi fade-in berurutan */
function GuideCard({
  title,
  desc,
  to,
  Icon,
  delay = 0
}: {
  title: string
  desc: string
  to: string
  Icon: (p: React.SVGProps<SVGSVGElement>) => JSX.Element
  delay?: number
}) {
  return (
    <Link
      to={to}
      className="
        group relative card glass p-5 h-full overflow-hidden
        hover:shadow-lg hover:ring-2 ring-primary/20 transition
        animate-fadeIn
      "
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* accent blob */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-80" />
      <div className="pointer-events-none absolute -left-8 -bottom-8 h-20 w-20 rounded-full bg-accent/10 blur-2xl" />
      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg lg:text-xl">{title}</h3>
          <Icon className="w-7 h-7 text-slate-400 group-hover:text-primary transition" />
        </div>
        <p className="mt-2 text-slate-600 text-sm">{desc}</p>
        <div className="mt-auto pt-4 text-primary font-medium">
          Lihat halaman →
        </div>
      </div>
    </Link>
  )
}

export default function PetunjukPenggunaan() {
  const guides = [
    {
      title: 'Halaman Sign In',
      desc: 'Daftar untuk membuat akun baru menggunakan email dan kata sandi.',
      to: '/signup',
      Icon: IconUserPlus,
    },
    {
      title: 'Halaman Log In',
      desc: 'Masuk ke aplikasi dengan akun yang sudah dibuat sebelumnya.',
      to: '/login',
      Icon: IconKey,
    },
    {
      title: 'Halaman Data Anak',
      desc: 'Kelola data anak: tambah, lihat, perbarui, hapus, dan unduh data.',
      to: '/data-anak',
      Icon: IconUsers,
    },
    {
      title: 'Halaman Komparasi Statistik',
      desc: 'Bandingkan statistik dua anak untuk analisis per indikator.',
      to: '/komparasi-statistik',
      Icon: IconChart,
    },
    {
      title: 'Halaman Norma Penilaian',
      desc: 'Lihat norma hasil Tes Sport Search, komponen kebutuhan cabang olahraga, dan klasifikasi potensi anak.',
      to: '/norma-penilaian',
      Icon: IconScale,
    },
    {
      title: 'Halaman Panduan Sport Search',
      desc: 'Materi panduan pelaksanaan Tes Identifikasi Bakat (Sport Search).',
      to: '/panduan-sport-search',
      Icon: IconSearch,
    },
    {
      title: 'Halaman Petunjuk Penggunaan',
      desc: 'Ringkasan cara menggunakan aplikasi SiBakat.id.',
      to: '/petunjuk-penggunaan',
      Icon: IconHelp,
    },
    {
      title: 'Halaman Profil Peneliti',
      desc: 'Informasi tentang pengembang dan pembimbing.',
      to: '/profil-peneliti',
      Icon: IconUser,
    },
  ] as const

  return (
    <AppLayout title="Petunjuk Penggunaan">
      {/* Judul dekoratif kecil di bawah title dari AppLayout */}
      <div
        className="
          mb-8 h-1 w-32 rounded-full 
          bg-[linear-gradient(90deg,#2563eb,#06b6d4,#2563eb)]
          bg-[length:200%_100%] animate-shimmer
        "
      />

      <p className="text-slate-700 max-w-3xl">
        Halaman ini berisi ringkasan fitur dan navigasi utama pada aplikasi SiBakat.id.
        Pilih salah satu kartu di bawah untuk langsung menuju halaman terkait.
      </p>

      {/* Grid kartu panduan */}
      <div
        className="
          mt-8 grid gap-6
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
        "
      >
        {guides.map((g, i) => (
          <GuideCard key={g.title} {...g} delay={100 + i * 80} />
        ))}
      </div>

      {/* Langkah cepat penggunaan */}
      <section className="mt-12">
        <h2 className="text-xl lg:text-2xl font-bold">Langkah Cepat Menggunakan Aplikasi</h2>
        <ol className="mt-4 space-y-3">
          <li className="card p-4 animate-fadeIn" style={{animationDelay:'120ms'}}>
            <span className="font-semibold">1) Daftar akun</span> melalui <Link to="/signup" className="text-primary underline">Sign In</Link>.
          </li>
          <li className="card p-4 animate-fadeIn" style={{animationDelay:'200ms'}}>
            <span className="font-semibold">2) Masuk</span> melalui <Link to="/login" className="text-primary underline">Log In</Link>.
          </li>
          <li className="card p-4 animate-fadeIn" style={{animationDelay:'280ms'}}>
            <span className="font-semibold">3) Tambah data anak</span> di <Link to="/data-anak" className="text-primary underline">Data Anak</Link>.
          </li>
          <li className="card p-4 animate-fadeIn" style={{animationDelay:'360ms'}}>
            <span className="font-semibold">4) Lakukan analisis</span> dan <span className="font-semibold">komparasi</span> di <Link to="/komparasi-statistik" className="text-primary underline">Komparasi Statistik</Link>.
          </li>
          <li className="card p-4 animate-fadeIn" style={{animationDelay:'440ms'}}>
            <span className="font-semibold">5) Rujuk Norma Penilaian</span> untuk interpretasi hasil di <Link to="/norma-penilaian" className="text-primary underline">Norma Penilaian</Link>.
          </li>
          <li className="card p-4 animate-fadeIn" style={{animationDelay:'520ms'}}>
            <span className="font-semibold">6) Baca materi</span> pelaksanaan tes di <Link to="/panduan-sport-search" className="text-primary underline">Panduan Sport Search</Link>.
          </li>
        </ol>
      </section>
    </AppLayout>
  )
}
