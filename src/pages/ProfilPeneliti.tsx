// src/pages/ProfilPeneliti.tsx
import AppLayout from '../components/Navbar'

// Import foto profil
const imgSeptian = new URL('../assets/Septian Dwi Yusdiantara.png', import.meta.url).href
const imgTommy = new URL('../assets/Dr. Tommy Soenyoto.jpg', import.meta.url).href

export default function ProfilPeneliti() {
  return (
    <AppLayout title="Profil Peneliti">
      <div className="space-y-8 animate-fadeIn">
        
        {/* --- Profil 1: Peneliti --- */}
        <div className="card overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col md:flex-row">
            {/* Foto */}
            <div className="md:w-1/3 lg:w-1/4 bg-slate-50 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-100">
              <div className="w-48 h-64 relative rounded-xl overflow-hidden shadow-lg ring-4 ring-white">
                <img 
                  src={imgSeptian} 
                  alt="Septian Dwi Yusdiantara, S. Pd." 
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
            
            {/* Teks */}
            <div className="md:w-2/3 lg:w-3/4 p-6 md:p-8 flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Septian Dwi Yusdiantara, S. Pd.</h2>
              <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold w-fit mb-4">
                Peneliti / Mahasiswa Magister
              </span>
              
              <div className="space-y-3 text-slate-600 text-sm leading-relaxed text-justify">
                <p>
                  Septian Dwi Yusdiantara, S.Pd. merupakan mahasiswa Magister Pendidikan Olahraga di Universitas Negeri Semarang (UNNES) 
                  sekaligus guru Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK) di tingkat sekolah dasar. Sebagai akademisi dan dan
                  praktisi pendidikan, Septian memiliki minat yang kuat terhadap inovasi pembelajaran, pengembangan permainan edukatif,
                  serta pemanfaatan teknologi untuk meningkatkan efektivitas dan kualitas proses pembelajaran pendidikan jasmani.
                </p>
                <p>
                  Salah satu hasil karyanya adalah permainan <i>Bolgeb</i>, sebuah media pembelajaran alternatif yang dirancang 
                  untuk menciptakan pengalaman belajar yang lebih menarik, adaptif, dan bermakna bagi peserta didik. Berbekal
                  pengalaman sebagai pendidik dan peneliti, Septian berkomitmen untuk terus mengembangkan karya-karya 
                  yang relevan dan memberikan kontribusi nyata bagi kemajuan pendidikan jasmani dan olahraga.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- Profil 2: Pembimbing --- */}
        <div className="card overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col md:flex-row">
             {/* Foto (Order diubah di mobile agar konsisten, tapi di coding tetap struktur sama) */}
             <div className="md:w-1/3 lg:w-1/4 bg-slate-50 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-100">
              <div className="w-48 h-64 relative rounded-xl overflow-hidden shadow-lg ring-4 ring-white">
                <img 
                  src={imgTommy} 
                  alt="Dr. Tommy Soenyoto, M. Pd." 
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            {/* Teks */}
            <div className="md:w-2/3 lg:w-3/4 p-6 md:p-8 flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">Dr. Tommy Soenyoto, M. Pd.</h2>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold w-fit mb-4">
                Dosen Pembimbing
              </span>
              
              <div className="space-y-3 text-slate-600 text-sm leading-relaxed text-justify">
                <p>
                  Dr. Tommy Soenyoto, M.Pd. merupakan dosen di Universitas Negeri Semarang (UNNES) yang memiliki keahlian utama 
                  dalam bidang <i>gymnastics</i> serta pengembangan pembelajaran olahraga. Beliau dikenal sebagai akademisi yang 
                  responsif terhadap perkembangan ilmu pengetahuan, inovasi, serta penerapan teknologi dalam pendidikan maupun 
                  dalam konteks pembinaan prestasi olahraga.
                </p>
                <p>
                  Sebagai dosen pembimbing dan pengajar pada jenjang S1 dan S2 bagi Septian Dwi Yusdiantara, Dr. Tommy berperan 
                  signifikan dalam membentuk landasan keilmuan, arah penelitian, serta penguatan pendekatan metodologis yang 
                  digunakan penulis. Dedikasinya dalam pengembangan model dan media pembelajaran menjadikan beliau salah satu
                  figur akademik yang konsisten mendorong lahirnya karya-karya inovatif dan aplikatif di bidang pendidikan jasmani dan olahraga.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  )
}