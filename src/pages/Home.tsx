// src/pages/Home.tsx
import { Link } from 'react-router-dom'
import { 
  BarChart2, Scale, Search, BookOpen, User, 
  ArrowRight, FilePlus2, Activity, FileOutput, Database 
} from 'lucide-react'
import AppLayout from '../components/Navbar'

// --- IMPORT LOGO ---
const logoSibakat = new URL('../assets/Logo Sibakat (Transparent).png', import.meta.url).href
const logoUnnes = new URL('../assets/Logo UNNES.png', import.meta.url).href

export default function Home() {
  // Data Menu Utama
  const menuItems = [
    { 
      to: '/data-anak', 
      label: 'Data Anak', 
      desc: 'Tabel data siswa & asesmen', 
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      Icon: Database 
    },
    { 
      to: '/komparasi-statistik', 
      label: 'Komparasi', 
      desc: 'Bandingkan hasil antar siswa', 
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      Icon: BarChart2 
    },
    { 
      to: '/norma-penilaian', 
      label: 'Norma Penilaian', 
      desc: 'Standar nilai & kategori usia', 
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      Icon: Scale 
    },
    { 
      to: '/panduan-sport-search', 
      label: 'Panduan Sport Search', 
      desc: 'Cara melakukan tes fisik', 
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      Icon: Search 
    },
    { 
      to: '/petunjuk-penggunaan', 
      label: 'Petunjuk', 
      desc: 'Cara menggunakan aplikasi', 
      color: 'text-pink-600',
      bg: 'bg-pink-50',
      Icon: BookOpen 
    },
    { 
      to: '/profil-peneliti', 
      label: 'Profil Peneliti', 
      desc: 'Tentang pengembang', 
      color: 'text-slate-600',
      bg: 'bg-slate-100',
      Icon: User 
    },
  ]

  return (
    <AppLayout>
      {/* --- HEADER LOGO SECTION (LEBIH RAPAT) --- */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 mb-10 pt-4">
        {/* Logo UNNES di Kiri */}
        <img
          src={logoUnnes}
          alt="Logo UNNES"
          className="h-16 sm:h-24 w-auto object-contain p-1" 
        />
        
        {/* Logo SiBakat di Kanan */}
        <img
          src={logoSibakat}
          alt="Logo SiBakat"
          className="h-16 sm:h-24 w-auto object-contain"
        />
      </div>

      {/* --- HERO SECTION --- */}
      <div className="text-center mb-12 animate-fadeIn">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
          Selamat Datang di <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">SiBakat.id</span>
        </h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          Platform identifikasi bakat olahraga berbasis IPTEK untuk membantu pelatih dan guru menemukan potensi terbaik anak.
        </p>
      </div>

      {/* --- PANDUAN SINGKAT (QUICK START) --- */}
      <div className="mb-12 animate-fadeIn animation-delay-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px flex-1 bg-slate-200"></div>
          <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Cara Menggunakan</span>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>

        {/* Grid 4 Kolom (Responsif: 1 -> 2 -> 4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Step 1 */}
          <div className="card p-5 relative overflow-hidden group hover:shadow-md transition-all border-l-4 border-l-blue-500">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FilePlus2 size={64} />
            </div>
            <div className="relative z-10">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mb-3">1</div>
              <h3 className="font-bold text-base text-slate-800 mb-1">Input Data</h3>
              <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                Masuk ke menu <b>Tambah Data</b> untuk memasukkan biodata anak, data sekolah, dan hasil tes fisik.
              </p>
              <Link to="/tambah-data" className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
                Mulai Input <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Step 2 */}
          <div className="card p-5 relative overflow-hidden group hover:shadow-md transition-all border-l-4 border-l-purple-500">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Activity size={64} />
            </div>
            <div className="relative z-10">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm mb-3">2</div>
              <h3 className="font-bold text-base text-slate-800 mb-1">Lihat Analisis</h3>
              <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                Buka <b>Data Anak</b> lalu klik tombol <b>View</b>. Sistem otomatis menghitung potensi dan rekomendasi cabang.
              </p>
              <Link to="/data-anak" className="text-xs font-semibold text-purple-600 flex items-center gap-1 hover:gap-2 transition-all">
                Lihat Data <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Step 3: Komparasi (BARU) */}
          <div className="card p-5 relative overflow-hidden group hover:shadow-md transition-all border-l-4 border-l-orange-500">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <BarChart2 size={64} />
            </div>
            <div className="relative z-10">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm mb-3">3</div>
              <h3 className="font-bold text-base text-slate-800 mb-1">Komparasi</h3>
              <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                Bandingkan statistik antar anak di menu <b>Komparasi</b> untuk melihat perbedaan potensi secara visual.
              </p>
              <Link to="/komparasi-statistik" className="text-xs font-semibold text-orange-600 flex items-center gap-1 hover:gap-2 transition-all">
                Mulai Bandingkan <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Step 4 */}
          <div className="card p-5 relative overflow-hidden group hover:shadow-md transition-all border-l-4 border-l-emerald-500">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <FileOutput size={64} />
            </div>
            <div className="relative z-10">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm mb-3">4</div>
              <h3 className="font-bold text-base text-slate-800 mb-1">Ekspor Laporan</h3>
              <p className="text-slate-600 text-xs mb-3 leading-relaxed">
                Unduh hasil analisis dalam format <b>Excel</b> melalui tabel Data Anak untuk kebutuhan pelaporan.
              </p>
              <span className="text-xs font-medium text-slate-400 cursor-default">
                Tersedia di Tabel Data
              </span>
            </div>
          </div>
        </div>

        {/* Ajakan ke halaman lain */}
        <div className="mt-8 text-center animate-fadeIn animation-delay-300">
          <p className="text-slate-600 text-sm">
            Ingin mempelajari dasar teori dan metode? Silakan baca <Link to="/norma-penilaian" className="text-primary font-semibold hover:underline">Norma Penilaian</Link> atau <Link to="/panduan-sport-search" className="text-primary font-semibold hover:underline">Panduan Sport Search</Link>.
          </p>
        </div>
      </div>

      {/* --- MENU GRID UTAMA --- */}
      <div className="animate-fadeIn animation-delay-500">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Menu Utama</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group card p-5 flex items-start gap-4 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
            >
              <div className={`p-3 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                <item.Icon size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 group-hover:text-primary transition-colors">
                  {item.label}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="ml-auto self-center opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                <ArrowRight size={16} className="text-slate-400" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}