// src/pages/Home.tsx
import { Link } from 'react-router-dom'
import { 
  BarChart2, Search, BookOpen, User, 
  ArrowRight, FilePlus2, Activity, FileOutput 
} from 'lucide-react'
import AppLayout from '../components/Navbar'

// --- IMPORT LOGO ---
const logoSibakat = new URL('../assets/Logo Sibakat (Transparent).png', import.meta.url).href
const logoUnnes = new URL('../assets/Logo UNNES.png', import.meta.url).href

export default function Home() {
  return (
    <AppLayout>
      {/* --- BACKGROUND WATERMARK (Logo Opacity 50%) --- */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <img 
          src={logoSibakat} 
          alt="Watermark Background" 
          className="w-[80%] max-w-[600px] object-contain opacity-10"
        />
      </div>

      {/* WRAPPER KONTEN UTAMA */}
      <div className="relative z-10">
        {/* --- HEADER LOGO SECTION --- */}
        <div className="flex items-center justify-center gap-4 sm:gap-8 mb-10 pt-4">
          <img
            src={logoUnnes}
            alt="Logo UNNES"
            className="h-24 sm:h-36 w-auto object-contain p-1" 
          />
          <img
            src={logoSibakat}
            alt="Logo SiBakat"
            className="h-24 sm:h-36 w-auto object-contain"
          />
        </div>

        {/* --- HERO SECTION --- */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-3">
            Selamat Datang di <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">SIBAKAT ID</span>
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Platform analisis identifikasi bakat olahraga berbasis IPTEK untuk membantu pelatih dan guru menemukan potensi terbaik anak.
          </p>
        </div>

        {/* --- ALUR PENGGUNAAN --- */}
        <div className="mb-12 animate-fadeIn animation-delay-200">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-slate-200"></div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Alur Penggunaan</span>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Panduan Tes */}
            <Link 
              to="/panduan-sport-search"
              className="card p-6 relative overflow-hidden group hover:shadow-lg transition-all border border-orange-200 border-l-[6px] border-l-orange-500 block cursor-pointer bg-white hover:bg-orange-50/30"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-orange-500">
                <Search size={80} />
              </div>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg mb-4 shadow-sm">1</div>
                <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-orange-600 transition-colors">Panduan Tes</h3>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                  Pelajari prosedur pelaksanaan tes fisik (Sport Search) yang benar sebelum mengambil data.
                </p>
                <div className="text-sm font-semibold text-orange-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Baca Panduan <ArrowRight size={16} />
                </div>
              </div>
            </Link>

            {/* 2. Petunjuk Aplikasi */}
            <Link 
              to="/petunjuk-penggunaan"
              className="card p-6 relative overflow-hidden group hover:shadow-lg transition-all border border-emerald-200 border-l-[6px] border-l-emerald-500 block cursor-pointer bg-white hover:bg-emerald-50/30"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-emerald-500">
                <BookOpen size={80} />
              </div>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg mb-4 shadow-sm">2</div>
                <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">Petunjuk Aplikasi</h3>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                  Pahami fitur-fitur aplikasi SiBakat.id untuk memaksimalkan proses manajemen data.
                </p>
                <div className="text-sm font-semibold text-emerald-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Lihat Petunjuk <ArrowRight size={16} />
                </div>
              </div>
            </Link>

            {/* 3. Input Data */}
            <Link 
              to="/tambah-data" 
              className="card p-6 relative overflow-hidden group hover:shadow-lg transition-all border border-blue-200 border-l-[6px] border-l-blue-500 block cursor-pointer bg-white hover:bg-blue-50/30"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-blue-500">
                <FilePlus2 size={80} />
              </div>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mb-4 shadow-sm">3</div>
                <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">Input Data</h3>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                  Masukkan biodata anak, data sekolah, dan hasil pengukuran tes fisik ke dalam sistem.
                </p>
                <div className="text-sm font-semibold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Mulai Input <ArrowRight size={16} />
                </div>
              </div>
            </Link>

            {/* 4. Lihat Analisis (DIPERBARUI KE STATISTIK ANAK) */}
            <Link 
              to="/statistik-anak"
              className="card p-6 relative overflow-hidden group hover:shadow-lg transition-all border border-purple-200 border-l-[6px] border-l-purple-500 block cursor-pointer bg-white hover:bg-purple-50/30"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-purple-500">
                <Activity size={80} />
              </div>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg mb-4 shadow-sm">4</div>
                <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-purple-600 transition-colors">Lihat Analisis</h3>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                  Analisis profil fisik anak dan temukan rekomendasi cabang olahraga yang sesuai secara instan.
                </p>
                <div className="text-sm font-semibold text-purple-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Analisis Statistik <ArrowRight size={16} />
                </div>
              </div>
            </Link>

            {/* 5. Komparasi */}
            <Link 
              to="/komparasi-statistik"
              className="card p-6 relative overflow-hidden group hover:shadow-lg transition-all border border-red-200 border-l-[6px] border-l-red-500 block cursor-pointer bg-white hover:bg-red-50/30"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-red-500">
                <BarChart2 size={80} />
              </div>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg mb-4 shadow-sm">5</div>
                <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-red-600 transition-colors">Komparasi</h3>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                  Bandingkan statistik antar anak secara <i>head-to-head</i> untuk melihat perbedaan potensi.
                </p>
                <div className="text-sm font-semibold text-red-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Mulai Bandingkan <ArrowRight size={16} />
                </div>
              </div>
            </Link>

            {/* 6. Ekspor Laporan */}
            <Link 
              to="/data-anak"
              className="card p-6 relative overflow-hidden group hover:shadow-lg transition-all border border-yellow-200 border-l-[6px] border-l-yellow-500 block cursor-pointer bg-white hover:bg-yellow-50/30"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-yellow-500">
                <FileOutput size={80} />
              </div>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold text-lg mb-4 shadow-sm">6</div>
                <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-yellow-700 transition-colors">Ekspor Laporan</h3>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                  Unduh hasil analisis dalam format <b>Excel</b> melalui tabel Data Anak untuk pelaporan.
                </p>
                <div className="text-sm font-semibold text-yellow-700 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Buka Tabel Data <ArrowRight size={16} />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* --- SECTION PROFIL PENELITI --- */}
        <div className="mt-16 mb-10 animate-fadeIn animation-delay-300">
          <Link
            to="/profil-peneliti"
            className="card p-8 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group hover:shadow-lg transition-all border border-slate-200 border-l-[6px] border-l-slate-600 bg-white hover:bg-slate-50"
          >
            <div className="shrink-0 w-16 h-16 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <User size={32} />
            </div>
            <div className="flex-1 text-center md:text-left z-10">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 group-hover:text-slate-700 transition-colors">Kenali Tim Peneliti & Pengembang</h2>
              <p className="text-slate-600 text-sm leading-relaxed max-w-3xl mx-auto md:mx-0">Aplikasi ini dikembangkan berdasarkan riset akademik Universitas Negeri Semarang (UNNES) untuk mendukung kemajuan <i>Sport Science</i> di Indonesia.</p>
            </div>
            <div className="shrink-0 flex items-center gap-2 text-sm font-bold text-slate-600 group-hover:text-primary transition-colors">
              Lihat Profil <ArrowRight size={20} />
            </div>
          </Link>
        </div>
      </div>
    </AppLayout>
  )
}