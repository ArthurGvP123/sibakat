// src/pages/PetunjukPenggunaan.tsx
import { useRef, useState, useEffect } from 'react'
import AppLayout from '../components/Navbar'
import { 
  UserPlus, Database, Activity, BarChart2, FileOutput, 
  Info, CheckCircle2, ChevronRight, BookOpen 
} from 'lucide-react'

export default function PetunjukPenggunaan() {
  const [activeSection, setActiveSection] = useState<string>('intro')

  // Refs untuk setiap section
  const sections = {
    intro: useRef<HTMLDivElement>(null),
    akun: useRef<HTMLDivElement>(null),
    data: useRef<HTMLDivElement>(null),
    analisis: useRef<HTMLDivElement>(null),
    komparasi: useRef<HTMLDivElement>(null),
    laporan: useRef<HTMLDivElement>(null),
  }

  // Fungsi scroll halus
  const scrollTo = (key: keyof typeof sections) => {
    const element = sections[key].current
    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset - 100 // Offset untuk header sticky
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  // Effect untuk Scrollspy (Deteksi posisi scroll)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -60% 0px' } // Trigger saat elemen berada di area baca (tengah layar)
    )

    Object.values(sections).forEach((ref) => {
      if (ref.current) observer.observe(ref.current)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <AppLayout title="Petunjuk Penggunaan">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative animate-fadeIn">
        
        {/* --- SIDEBAR DAFTAR ISI (STICKY & BOXED) --- */}
        <div className="lg:w-72 shrink-0">
          <div className="sticky top-24">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <BookOpen size={18} className="text-primary" />
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Daftar Isi</h3>
              </div>
              
              <nav className="space-y-1">
                <NavButton 
                  isActive={activeSection === 'akun'} 
                  onClick={() => scrollTo('akun')} 
                  label="1. Akun & Keamanan" 
                />
                <NavButton 
                  isActive={activeSection === 'data'} 
                  onClick={() => scrollTo('data')} 
                  label="2. Manajemen Data" 
                />
                <NavButton 
                  isActive={activeSection === 'analisis'} 
                  onClick={() => scrollTo('analisis')} 
                  label="3. Analisis Bakat" 
                />
                <NavButton 
                  isActive={activeSection === 'komparasi'} 
                  onClick={() => scrollTo('komparasi')} 
                  label="4. Komparasi Siswa" 
                />
                <NavButton 
                  isActive={activeSection === 'laporan'} 
                  onClick={() => scrollTo('laporan')} 
                  label="5. Laporan & Ekspor" 
                />
              </nav>
            </div>
          </div>
        </div>

        {/* --- KONTEN UTAMA --- */}
        <div className="flex-1 max-w-3xl space-y-16 pb-20">
          
          {/* Intro */}
          <div id="intro" ref={sections.intro} className="scroll-mt-28 prose text-slate-600">
            <p className="lead text-lg text-slate-700 leading-relaxed">
              Selamat datang di panduan lengkap <b>SiBakat.id</b>. Halaman ini berisi dokumentasi teknis tentang cara menggunakan seluruh fitur aplikasi untuk melakukan identifikasi bakat olahraga secara efektif dan terukur.
            </p>
          </div>

          {/* 1. Akun & Keamanan */}
          <section id="akun" ref={sections.akun} className="scroll-mt-28">
            <SectionHeader icon={UserPlus} title="1. Akun & Keamanan" />
            <div className="space-y-5 text-slate-700 leading-relaxed">
              <p>
                Untuk menjaga privasi dan keamanan data siswa, setiap pengguna (guru/pelatih) wajib memiliki akun pribadi. Data yang Anda masukkan bersifat privat dan hanya dapat diakses oleh akun Anda sendiri.
              </p>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                <div>
                  <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">A</span>
                    Pendaftaran (Sign Up)
                  </h4>
                  <ul className="list-disc pl-10 space-y-1 text-slate-600 text-sm">
                    <li>Buka halaman <b>Sign In</b> melalui tombol di halaman depan.</li>
                    <li>Isi <b>Nama Lengkap</b>, <b>Email</b> aktif, dan buat <b>Kata Sandi</b>.</li>
                    <li>Kata sandi harus terdiri dari minimal 6 karakter.</li>
                    <li>Klik tombol <b>Daftar Sekarang</b> untuk masuk ke Dashboard.</li>
                  </ul>
                </div>
                <div className="border-t border-slate-100 pt-5">
                  <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">B</span>
                    Masuk (Log In)
                  </h4>
                  <p className="text-sm text-slate-600 pl-10">
                    Gunakan email dan kata sandi yang telah terdaftar. Jika Anda mengalami masalah saat login, pastikan koneksi internet stabil dan email yang dimasukkan benar.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Manajemen Data */}
          <section id="data" ref={sections.data} className="scroll-mt-28">
            <SectionHeader icon={Database} title="2. Manajemen Data" color="text-blue-600" bg="bg-blue-50" />
            <div className="space-y-5 text-slate-700 leading-relaxed">
              <p>
                Inti dari aplikasi ini adalah pengelolaan database siswa. Anda dapat menambah, mengubah, dan menghapus data melalui menu <b>Tambah Data</b>.
              </p>

              {/* Tips Box */}
              <div className="flex gap-4 p-5 bg-blue-50 rounded-2xl border border-blue-100 text-blue-800 text-sm shadow-sm">
                <Info className="shrink-0 mt-0.5" size={20} />
                <div>
                  <strong className="block mb-1 text-base">Tips Alur Kerja Efektif</strong>
                  Disarankan untuk menambahkan <b>Data Sekolah</b> terlebih dahulu pada tab "Data Sekolah" sebelum menginput data siswa, agar nama sekolah muncul otomatis di pilihan formulir.
                </div>
              </div>

              <div className="pl-2">
                <h4 className="font-bold text-lg text-slate-800 mb-3">Langkah Input Data:</h4>
                <ol className="relative border-l border-slate-200 ml-3 space-y-6">
                  <li className="pl-6 relative">
                    <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-blue-500"></span>
                    <strong>Buka Menu Tambah Data</strong>
                    <p className="text-sm text-slate-600 mt-1">Akses melalui sidebar atau dashboard utama.</p>
                  </li>
                  <li className="pl-6 relative">
                    <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-slate-300"></span>
                    <strong>Isi Identitas</strong>
                    <p className="text-sm text-slate-600 mt-1">Lengkapi Nama, Gender, Usia, dan Asal Sekolah. Catat Minat & Bakat jika ada.</p>
                  </li>
                  <li className="pl-6 relative">
                    <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-slate-300"></span>
                    <strong>Isi Data Fisik & Tes</strong>
                    <p className="text-sm text-slate-600 mt-1">
                      Masukkan hasil pengukuran <b>Antropometri</b> (Tinggi, Berat) dan <b>6 Item Tes Sport Search</b>.
                    </p>
                    <p className="text-xs text-slate-500 mt-1 italic bg-slate-50 p-2 rounded border inline-block">
                      Catatan: Format Lari Multitahap menggunakan titik, misal <b>6.4</b> (Level 6 Shuttle 4).
                    </p>
                  </li>
                </ol>
              </div>
            </div>
          </section>

          {/* 3. Analisis Bakat */}
          <section id="analisis" ref={sections.analisis} className="scroll-mt-28">
            <SectionHeader icon={Activity} title="3. Analisis & Rekomendasi" color="text-purple-600" bg="bg-purple-50" />
            <div className="space-y-5 text-slate-700 leading-relaxed">
              <p>
                Setelah data tersimpan, sistem secara otomatis menghitung skor keberbakatan menggunakan algoritma <i>Sport Search</i> yang membandingkan profil fisik anak dengan norma standar usia dan gender.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-200 transition-colors">
                  <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <BarChart2 size={20} className="text-purple-500" /> Radar Chart
                  </h4>
                  <p className="text-sm text-slate-600">
                    Visualisasi grafis yang memetakan kekuatan fisik siswa dalam 6 aspek. Semakin luas area grafik, semakin baik potensi fisiknya secara umum.
                  </p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-purple-200 transition-colors">
                  <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-purple-500" /> Top Rekomendasi
                  </h4>
                  <p className="text-sm text-slate-600">
                    Daftar cabang olahraga yang paling cocok dengan profil fisik siswa, diurutkan berdasarkan persentase kecocokan (Match %) tertinggi.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 4. Komparasi */}
          <section id="komparasi" ref={sections.komparasi} className="scroll-mt-28">
            <SectionHeader icon={BarChart2} title="4. Komparasi Siswa" color="text-orange-600" bg="bg-orange-50" />
            <div className="space-y-4 text-slate-700 leading-relaxed">
              <p>
                Fitur ini berguna untuk membandingkan potensi dua orang siswa secara <i>head-to-head</i>. Sangat bermanfaat untuk seleksi tim inti atau evaluasi kemajuan atlet.
              </p>
              <ul className="space-y-3 text-sm text-slate-700 bg-orange-50/50 p-5 rounded-2xl border border-orange-100">
                <li className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-white text-orange-600 border border-orange-200 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <span>Buka menu <b>Komparasi Statistik</b> dari sidebar.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-white text-orange-600 border border-orange-200 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <span>Ketik nama siswa pertama pada kolom pencarian <b>"Anak A"</b> dan pilih dari daftar.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-white text-orange-600 border border-orange-200 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                  <span>Lakukan hal yang sama untuk <b>"Anak B"</b>.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-white text-orange-600 border border-orange-200 flex items-center justify-center text-xs font-bold shrink-0">4</div>
                  <span>Grafik Radar akan menumpuk (overlay) kedua profil siswa untuk memudahkan perbandingan visual kekuatan dan kelemahan masing-masing.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* 5. Laporan */}
          <section id="laporan" ref={sections.laporan} className="scroll-mt-28">
            <SectionHeader icon={FileOutput} title="5. Laporan & Ekspor" color="text-emerald-600" bg="bg-emerald-50" />
            <div className="space-y-4 text-slate-700 leading-relaxed">
              <p>
                Aplikasi SiBakat.id mendukung pelaporan administrasi yang mudah. Anda dapat mengunduh seluruh database siswa beserta hasil analisisnya ke dalam format <b>Microsoft Excel (.xlsx)</b>.
              </p>
              
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <FileOutput size={20} />
                  </div>
                  <h4 className="font-bold text-slate-800">Cara Ekspor Data</h4>
                </div>
                <p className="text-slate-600 text-sm mb-3">
                  Masuk ke halaman <b>Data Anak</b>, lalu klik tombol <b>Ekspor Excel</b> di pojok kanan atas tabel.
                </p>
                <div className="text-xs bg-slate-50 p-3 rounded-lg text-slate-500 border border-slate-100">
                  <strong>File Excel mencakup:</strong> Biodata lengkap, nilai tes mentah (raw data), skor terkonversi (1-5), klasifikasi potensi, dan rekomendasi cabang olahraga utama.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  )
}

// --- SUB-COMPONENTS ---

function NavButton({ label, onClick, isActive }: { label: string; onClick: () => void; isActive: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`
        w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between group
        ${isActive 
          ? 'bg-blue-50 text-primary shadow-sm border border-blue-100' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
        }
      `}
    >
      {label}
      {isActive && <ChevronRight size={16} className="text-primary animate-fadeIn" />}
    </button>
  )
}

function SectionHeader({ icon: Icon, title, color = "text-slate-800", bg = "bg-slate-100" }: any) {
  return (
    <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-200">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${bg} ${color}`}>
        <Icon size={24} />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
    </div>
  )
}