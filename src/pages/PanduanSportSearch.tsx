// src/pages/PanduanSportSearch.tsx
import { Download } from 'lucide-react'
import AppLayout from '../components/Navbar'

// --- IMPORT ASSETS ---
// Dokumen
const docFormulir = new URL('../assets/Formulir Catatan Pengukuran.docx', import.meta.url).href

// Gambar (Sesuai rincian ekstensi file)
const img1 = new URL('../assets/Gambar1.png', import.meta.url).href
const img2 = new URL('../assets/Gambar2.jpg', import.meta.url).href
const img3 = new URL('../assets/Gambar3.jpg', import.meta.url).href
const img4 = new URL('../assets/Gambar4.jpg', import.meta.url).href
const img5 = new URL('../assets/Gambar5.png', import.meta.url).href
const img6 = new URL('../assets/Gambar6.jpg', import.meta.url).href
const img7 = new URL('../assets/Gambar7.jpg', import.meta.url).href
const img8 = new URL('../assets/Gambar8.jpg', import.meta.url).href
const img9 = new URL('../assets/Gambar9.jpg', import.meta.url).href
const img10 = new URL('../assets/Gambar10.jpg', import.meta.url).href

export default function PanduanSportSearch() {
  return (
    <AppLayout title="">
      <div className="max-w-5xl mx-auto space-y-12 animate-fadeIn pb-16">
        
        {/* Header Judul Dokumen */}
        <div className="text-center border-b-2 border-slate-100 pb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            PETUNJUK PELAKSANAAN TES IDENTIFIKASI BAKAT
          </h1>
          <p className="text-2xl text-primary font-bold mt-3 tracking-wide">“SPORT SEARCH”</p>
        </div>

        {/* A. Petunjuk Umum */}
        <section className="card p-8 shadow-sm">
          <h2 className="section-title">A. Petunjuk Umum</h2>
          <ul className="list-disc pl-6 space-y-3 text-slate-700 leading-relaxed text-justify">
            <li>Seluruh peralatan dan fasilitas yang diperlukan, termasuk lembar pencatatan hasil, wajib dipersiapkan dengan lengkap.</li>
            <li>Pastikan seluruh peralatan berada dalam kondisi baik serta memenuhi persyaratan pelaksanaan tes.</li>
            <li>Peserta tes harus berada dalam kondisi sehat, dibuktikan melalui surat keterangan sehat yang diterbitkan oleh dokter pemerintah.</li>
            <li>Peserta perlu diatur agar tidak berkerumun pada salah satu pos tes sehingga pelaksanaan kegiatan dapat berlangsung tertib dan efisien.</li>
            <li>Urutan pelaksanaan tes dapat disesuaikan menurut kebutuhan, kecuali untuk tes lari bolak-balik dan lari multitahap, yang harus dilaksanakan pada bagian akhir.</li>
            <li>Petugas pelaksana tes wajib memiliki pengetahuan dan pengalaman dalam bidang tes dan pengukuran, atau sekurang-kurangnya telah memperoleh pelatihan yang memadai agar dapat melaksanakan tugas secara benar dan profesional.</li>
            <li>Peserta wajib mengenakan pakaian olahraga yang sesuai, yakni kaos, celana olahraga, dan sepatu olahraga. Pada beberapa jenis tes tertentu, seperti pengukuran tinggi dan berat badan, peserta dapat diminta melepas sepatu.</li>
            <li>Sebelum tes dimulai, peserta harus diberikan kesempatan untuk melakukan pemanasan, baik pemanasan statis maupun pemanasan dinamis, guna meminimalkan risiko cedera.</li>
            <li>Pelaksanaan tes harus diupayakan berlangsung dalam kondisi yang seragam bagi setiap peserta agar hasil tes dapat dinilai secara adil dan objektif.</li>
          </ul>

          {/* Tombol Download Formulir */}
          <div className="mt-8 p-5 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-blue-900 text-lg">Lembar Pencatatan Hasil</h4>
              <p className="text-sm text-blue-700 mt-1">Unduh formulir untuk mencatat skor manual di lapangan.</p>
            </div>
            <a 
              href={docFormulir} 
              download="Formulir Catatan Pengukuran.docx"
              className="btn-primary rounded-xl px-6 py-3 shadow-md flex items-center gap-2 text-sm font-bold transition-transform hover:-translate-y-0.5"
            >
              <Download size={20} />
              Unduh Formulir
            </a>
          </div>
        </section>

        {/* B - H: Prosedur Umum */}
        <section className="space-y-8">
          <div className="card p-8 shadow-sm">
            <h2 className="section-title">B. Urutan Pelaksanaan</h2>
            <div className="text-slate-700 leading-relaxed text-justify space-y-4">
              <p>Terdapat sepuluh butir tes dalam Sport Search. Pelaksanaan seluruh butir tes dalam satu sesi berdurasi kurang lebih 90 menit, dengan rasio ideal antara peserta tes (testi) dan pelaksana tes (tester) sebesar 10:1.</p>
              <p>Pengaturan urutan pelaksanaan tes dapat dibagi ke dalam dua bagian atau lebih agar proses berjalan efektif.</p>
              <p>Apabila tes dibagi menjadi dua bagian, disarankan menggunakan lima tester. Setiap tester menangani satu pos pengukuran, sedangkan peserta bergerak secara bergiliran dari satu pos ke pos berikutnya.</p>
              <p>Urutan pelaksanaan yang direkomendasikan adalah sebagai berikut:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Bagian pertama mencakup pengukuran tinggi badan, tinggi duduk, berat badan, rentang lengan, serta tes lempar–tangkap bola tenis.</li>
                <li>Bagian kedua mencakup tes lempar bola basket, loncat tegak, lari kelincahan, lari cepat 40 meter, dan lari multitahap.</li>
              </ul>
              <p>Perlu ditekankan bahwa tes lari multitahap harus dilaksanakan pada bagian paling akhir.</p>
              <p>Apabila peserta telah memperoleh pelatihan yang memadai, mereka dapat membantu proses pelaksanaan tes. Peserta senior bahkan dapat dilibatkan sebagai bagian dari pembelajaran pendidikan jasmani pada tingkat yang lebih tinggi.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="card p-8 shadow-sm">
              <h2 className="section-title">C. Tempat Pelaksanaan</h2>
              <p className="text-slate-700 leading-relaxed text-justify">
                Pelaksanaan tes dapat dilakukan di gedung olahraga atau ruang dalam aula olahraga yang memiliki permukaan lantai tidak licin, terutama untuk tes lari kelincahan. Tes lari cepat 40 meter harus dilakukan di area terbuka dengan lintasan yang lurus, rata, dan diupayakan berada dalam kondisi angin melintang (cross wind). Apabila lintasan menggunakan permukaan berumput, pilihlah area yang kering untuk mengurangi risiko tergelincir.
              </p>
            </div>
            <div className="card p-8 shadow-sm">
              <h2 className="section-title">D. Pakaian</h2>
              <p className="text-slate-700 leading-relaxed text-justify">
                Peserta wajib mengenakan pakaian olahraga yang layak, berupa kaos dan celana olahraga atau celana pendek, serta sepatu olahraga. Pakaian tersebut digunakan selama seluruh rangkaian tes, kecuali pada butir yang secara khusus mensyaratkan pengecualian (misalnya pelepasan sepatu pada pengukuran tinggi badan).
              </p>
            </div>
          </div>

          <div className="card p-8 shadow-sm">
            <h2 className="section-title">E. Persiapan (Pra-Tes)</h2>
            <p className="text-slate-700 leading-relaxed text-justify">
              Sebelum memulai tes, peserta harus melakukan pemanasan secara menyeluruh, mencakup aktivitas aerobik ringan serta peregangan pada tubuh bagian atas dan bawah. Pemanasan sangat dianjurkan terutama sebelum pelaksanaan tes melempar bola basket, loncat tegak, lari kelincahan, lari cepat 40 meter, dan lari multitahap.
            </p>
          </div>

          <div className="card p-8 shadow-sm">
            <h2 className="section-title">F. Instruksi kepada Peserta</h2>
            <p className="text-slate-700 leading-relaxed text-justify">
              Peserta harus diberikan penjelasan sebelumnya mengenai tugas-tugas yang harus dilakukan serta tujuan dari setiap pengukuran. Pada setiap kesempatan, peserta hendaknya didorong untuk menampilkan kemampuan terbaiknya.
            </p>
          </div>

          <div className="card p-8 shadow-sm">
            <h2 className="section-title">G. Percobaan</h2>
            <div className="text-slate-700 leading-relaxed text-justify space-y-3">
              <p>Kesempatan melakukan percobaan hanya diberikan pada tes lempar–tangkap bola tenis. Percobaan ini penting agar peserta memahami prosedur dan tuntutan tes sebelum penilaian resmi dilakukan.</p>
              <p>Untuk butir tes lainnya, percobaan tidak diperbolehkan karena setiap peserta akan diberi dua kali kesempatan pelaksanaan, dan hasil terbaik dari kedua kesempatan tersebut yang akan dicatat.</p>
              <p>Peserta sebaiknya diberikan waktu istirahat antarbutir tes. Idealnya, tester menyelesaikan putaran pertama untuk seluruh peserta terlebih dahulu, kemudian melanjutkan putaran kedua agar jarak waktu istirahat peserta memadai.</p>
            </div>
          </div>

          <div className="card p-8 shadow-sm bg-slate-50 border border-slate-200">
            <h2 className="section-title text-slate-800">H. Petunjuk Pelaksanaan</h2>
            <p className="text-slate-700 leading-relaxed text-justify">
              Setiap pelaksana tes harus menguasai pedoman pelaksanaan yang terdapat dalam Manual Metode Tes yang diterbitkan oleh The Laboratory Standards Assistance Scheme of the National Sport.
            </p>
          </div>
        </section>

        <div className="py-4">
          <div className="h-px bg-slate-200 w-full mb-8"></div>
          <h2 className="text-3xl font-extrabold text-center text-slate-900 mb-10">
            PROSEDUR TES (10 BUTIR)
          </h2>
        </div>

        {/* I. Tinggi Badan */}
        <TestItem 
          num="I" title="Tinggi Badan" 
          image={img1} caption="Gambar 1 Pelaksanaan Pengukuran Tinggi Badan"
        >
          <Detail label="A. Tujuan">
            Tinggi badan merupakan jarak vertikal dari lantai hingga puncak kepala ( vertex ). Pengukuran tinggi badan memiliki peranan penting dalam berbagai cabang olahraga. Sebagai contoh, atlet bola basket dan atlet dayung umumnya memiliki postur tubuh yang tinggi, sedangkan pesenam cenderung memiliki postur yang lebih kecil.
          </Detail>
          <Detail label="B. Perlengkapan">
            <ul className="list-disc pl-5 space-y-1">
              <li>Stadiometer atau pita ukur yang dipasang secara vertikal dan kuat pada dinding, dengan tingkat ketelitian hingga 0,1 cm.</li>
              <li>Dinding sebaiknya tidak terbuat dari papan atau material lain yang mudah melengkung atau mengerut.</li>
              <li>Apabila menggunakan pita ukur, siapkan pula segi tiga siku-siku untuk memastikan ketegakan bidang pengukuran.</li>
              <li>Permukaan lantai yang digunakan harus rata, keras, dan stabil.</li>
            </ul>
          </Detail>
          <Detail label="C. Prosedur">
            <ul className="list-decimal pl-5 space-y-1">
              <li>Peserta berdiri tegak tanpa alas kaki, dengan tumit, pantat, dan kedua bahu menempel pada stadiometer atau pita ukur.</li>
              <li>Kedua tumit berada sejajar, sementara kedua lengan dibiarkan menggantung bebas di sisi tubuh dengan telapak tangan menghadap ke paha.</li>
              <li>Tester dengan hati-hati menyesuaikan posisi kepala peserta dari bagian belakang telinga agar berada pada posisi tegak sehingga tubuh terentang secara maksimal.</li>
              <li>Pandangan peserta lurus ke depan, sambil menarik napas panjang dan mempertahankan posisi berdiri tegak.</li>
              <li>Pastikan tumit peserta tidak terangkat atau jinjit.</li>
              <li>Jika menggunakan stadiometer, turunkan bagian pengukur ( headpiece ) hingga menyentuh puncak kepala peserta.</li>
              <li>Apabila menggunakan pita ukur, tempatkan segi tiga siku-siku secara tegak lurus pada pita ukur di atas kepala, kemudian turunkan hingga menyentuh puncak kepala.</li>
            </ul>
          </Detail>
          <Detail label="D. Penilaian">
            Catat hasil pengukuran tinggi badan dalam posisi berdiri tersebut dengan ketelitian hingga 0,1 cm.
          </Detail>
        </TestItem>

        {/* II. Tinggi Duduk */}
        <TestItem 
          num="II" title="Tinggi Duduk" 
          image={img2} caption="Gambar 2 Pelaksanaan Pengukuran Tinggi Duduk"
        >
          <Detail label="A. Tujuan">
            Tinggi duduk merupakan jarak vertikal dari permukaan tempat duduk hingga puncak kepala ( vertex ). Pengukuran ini mencakup panjang togok, leher, dan kepala. Perbandingan antara tinggi duduk dan tinggi badan berdiri memiliki relevansi dalam berbagai cabang olahraga. Misalnya, pada cabang lompat tinggi, atlet umumnya memiliki proporsi tungkai yang lebih panjang dibandingkan togok.
          </Detail>
          <Detail label="B. Perlengkapan">
            <ul className="list-disc pl-5 space-y-1">
              <li>Stadiometer atau pita ukur yang dipasang secara vertikal pada dinding, dengan ketelitian 0,1 cm.</li>
              <li>Dinding tidak terbuat dari papan atau bahan lain yang mudah melengkung.</li>
              <li>Segi tiga siku-siku bila menggunakan pita ukur.</li>
              <li>Permukaan lantai yang rata dan stabil.</li>
              <li>Bangku kecil dengan tinggi sekitar 40 cm.</li>
            </ul>
          </Detail>
          <Detail label="C. Prosedur">
            <ul className="list-decimal pl-5 space-y-1">
              <li>Tempatkan bangku kecil di bawah stadiometer atau pita ukur.</li>
              <li>Peserta duduk di atas bangku dengan kedua lutut mengarah ke depan dan ditekuk, sementara kedua tangan diletakkan rileks di atas paha sejajar permukaan lantai.</li>
              <li>Pantat dan kedua bahu peserta menyentuh stadiometer atau pita ukur di belakangnya secara ringan.</li>
              <li>Tester menyesuaikan posisi kepala peserta dari belakang telinga agar tubuh terentang optimal.</li>
              <li>Peserta memandang lurus ke depan sambil menarik napas panjang dan mempertahankan posisi duduk tegak.</li>
              <li>Bila menggunakan stadiometer, turunkan headpiece hingga menyentuh puncak kepala.</li>
              <li>Bila menggunakan pita ukur, tempatkan segi tiga siku-siku tegak lurus pada pita ukur, lalu turunkan hingga menyentuh puncak kepala.</li>
            </ul>
          </Detail>
          <Detail label="D. Penilaian">
            <ul className="list-disc pl-5 space-y-1">
              <li>Catat hasil pengukuran tinggi duduk dengan ketelitian hingga 0,1 cm.</li>
              <li>Untuk memperoleh nilai tinggi duduk sebenarnya, kurangkan tinggi bangku dari hasil pengukuran total.</li>
              <li>Jika hasil pengukuran dimasukkan ke dalam software, tinggi duduk akan dikonversikan secara otomatis ke dalam persentase terhadap tinggi badan.</li>
            </ul>
          </Detail>
        </TestItem>

        {/* III. Berat Badan */}
        <TestItem 
          num="III" title="BERAT BADAN" 
          image={img3} caption="Gambar 3 Pelaksanaan Pengukuran Berat Badan"
        >
          <Detail label="A. Tujuan">
            Berat badan berkaitan erat dengan beberapa cabang olahraga yang membutuhkan tubuh yang ringan, seperti senam, dibandingkan dengan cabang olahraga yang memerlukan berat badan lebih berat, misalnya nomor lempar dalam atletik.
          </Detail>
          <Detail label="B. Perlengkapan">
            <ul className="list-disc pl-5 space-y-1">
              <li>Alat penimbang dengan ketelitian hingga 0,5 kg yang ditempatkan pada permukaan rata.</li>
              <li>Skala alat penimbang harus ditera terlebih dahulu agar memenuhi standar.</li>
            </ul>
          </Detail>
          <Detail label="C. Prosedur">
            <ul className="list-decimal pl-5 space-y-1">
              <li>Testi tidak memakai alas kaki dan hanya mengenakan pakaian renang atau pakaian yang ringan (misalnya T-shirt dan celana pendek/rok).</li>
              <li>Alat penimbang disetel pada angka nol.</li>
              <li>Testi berdiri tegak dengan berat tubuh terdistribusi secara merata pada bagian tengah alat penimbang.</li>
            </ul>
          </Detail>
          <Detail label="D. Penilaian">
            Catat berat badan testi hingga ketelitian 0,5 kg. Apabila diperlukan, tera ulang alat penimbang sebelum digunakan.
          </Detail>
        </TestItem>

        {/* IV. Rentang Lengan */}
        <TestItem 
          num="IV" title="RENTANG LENGAN" 
          image={img4} caption="Gambar 4 Pelaksanaan Pengukuran Rentang Lengan"
        >
          <Detail label="A. Tujuan">
            Rentang lengan adalah jarak horizontal antara ujung jari tengah lengan kiri dan kanan ketika kedua lengan direntangkan sejajar bahu. Rentang lengan mencakup lebar bahu dan panjang anggota gerak atas. Komponen ini berkaitan erat dengan cabang olahraga seperti dayung dan nomor lempar, yang memerlukan rentang lengan panjang sebagai keunggulan performa.
          </Detail>
          <Detail label="B. Perlengkapan">
            <ul className="list-disc pl-5 space-y-1">
              <li>Pita pengukur (setidaknya 3 meter) dengan ketelitian 0,1 cm, ditempatkan secara horizontal pada dinding setinggi ±1,5 meter dari permukaan tanah.</li>
              <li>Sudut dinding sebaiknya dijadikan titik nol.</li>
              <li>Penggaris.</li>
            </ul>
          </Detail>
          <Detail label="C. Prosedur">
            <ul className="list-decimal pl-5 space-y-1">
              <li>Testi berdiri tegak dengan punggung menempel pada dinding; kedua kaki merapat; tumit, pantat, dan kedua bahu menyentuh dinding.</li>
              <li>Kedua lengan direntangkan sejajar bahu. Ujung jari tengah menyentuh pita pengukur.</li>
              <li>Bila tinggi testi tidak sejajar dengan pita, gunakan penggaris untuk menarik garis lurus dari ujung jari ke pita pengukur.</li>
              <li>Ukur jarak antara ujung jari tengah dari kedua lengan.</li>
            </ul>
          </Detail>
          <Detail label="D. Penilaian">
            Catat rentang lengan hingga ketelitian 0,1 cm.
          </Detail>
        </TestItem>

        {/* V. Lempar-Tangkap Bola Tenis */}
        <TestItem 
          num="V" title="LEMPAR–TANGKAP BOLA TENIS" 
          image={img5} caption="Gambar 5 Pelaksanaan Pengukuran Lempar Tangkap Bola Tenis"
        >
          <Detail label="A. Tujuan">
            Tes lempar–tangkap bola tenis bertujuan mengukur kemampuan testi melempar bola tenis dengan ayunan bawah lengan ( underarm ) ke arah sasaran dan menangkapnya dengan satu tangan. Koordinasi tangan–mata merupakan komponen penting dalam berbagai permainan beregu.
          </Detail>
          <Detail label="B. Perlengkapan">
            <ul className="list-disc pl-5 space-y-1">
              <li>Bola tenis.</li>
              <li>Sarung tangan.</li>
              <li>Sasaran bundar berdiameter 30 cm.</li>
              <li>Pita pengukur (3 meter; ketelitian 1 cm).</li>
              <li>Untuk efisiensi, tester dapat menyiapkan 2–3 sasaran dan menugaskan testi untuk saling menilai dengan pengawasan tester.</li>
            </ul>
          </Detail>
          <Detail label="C. Prosedur">
            <ul className="list-decimal pl-5 space-y-1">
              <li>Tempelkan sasaran pada dinding dengan bagian bawah setinggi bahu testi.</li>
              <li>Beri tanda garis sejauh 2,5 meter dari dinding.</li>
              <li>Testi berdiri di belakang garis.</li>
              <li>Testi melempar bola dengan tangan dominan menggunakan underarm dan menangkapnya dengan tangan yang sama.</li>
              <li>Berikan percobaan awal agar testi memahami gerakan.</li>
              <li>Bola tidak boleh memantul di lantai sebelum ditangkap.</li>
              <li>Lemparan sah apabila bola mengenai sasaran dan berhasil ditangkap.</li>
              <li>Tangkapan sah apabila bola ditangkap bersih tanpa menyentuh badan.</li>
              <li>Testi tidak boleh melangkah melewati garis.</li>
              <li>Testi melakukan 10 lemparan dengan tangan dominan (lempar–tangkap), kemudian 10 lemparan dengan tangan dominan dan menangkap dengan tangan non-dominan.</li>
              <li>Testi boleh memakai kacamata jika diperlukan.</li>
            </ul>
          </Detail>
          <Detail label="D. Penilaian">
            <ul className="list-disc pl-5 space-y-1">
              <li>Setiap lemparan yang mengenai sasaran dan berhasil ditangkap bernilai 1.</li>
              <li>Syarat mendapatkan nilai:
                <ul className="list-disc pl-5 mt-1">
                  <li>bola dilempar dengan underarm</li>
                  <li>bola mengenai sasaran</li>
                  <li>bola ditangkap tanpa terhalang badan</li>
                  <li>testi tidak melewati garis</li>
                </ul>
              </li>
              <li>Jumlahkan skor dari 20 percobaan. Skor maksimal adalah 20.</li>
            </ul>
          </Detail>
        </TestItem>

        {/* VI. Lempar Bola Basket */}
        <TestItem 
          num="VI" title="LEMPAR BOLA BASKET" 
          image={img6} caption="Gambar 6 Pelaksanaan Lempar Bola Basket"
        >
          <Detail label="A. Tujuan">
            Tes lempar bola basket digunakan untuk mengukur kekuatan tubuh bagian atas, penting terutama dalam olahraga seperti gulat dan angkat besi.
          </Detail>
          <Detail label="B. Perlengkapan">
            <ul className="list-disc pl-5 space-y-1">
              <li>Bola basket ukuran 7.</li>
              <li>Pita pengukur sepanjang 15 meter (ketelitian 5 cm).</li>
            </ul>
          </Detail>
          <Detail label="C. Prosedur">
            <ul className="list-decimal pl-5 space-y-1">
              <li>Testi duduk dengan punggung, pantat, dan kepala menempel pada dinding; kedua kaki lurus ke depan.</li>
              <li>Testi memegang bola di atas dada dan mendorongnya secara horizontal. Tidak diperbolehkan melempar melebihi tinggi bahu.</li>
              <li>Kepala, bahu, dan pantat harus tetap menempel dinding.</li>
              <li>Testi mendapat dua kali kesempatan.</li>
            </ul>
          </Detail>
          <Detail label="D. Penilaian">
            Catat jarak lemparan terjauh hingga ketelitian 5 cm, dihitung dari titik jatuh pertama bola.
          </Detail>
        </TestItem>

        {/* VII. Loncat Tegak */}
        <TestItem 
          num="VII" title="LONCAT TEGAK" 
          image={img7} caption="Gambar 7 Pelaksanaan Pengukuran Loncat Tegak"
        >
          <Detail label="A. Tujuan">
            Tes loncat tegak mengukur kemampuan testi melakukan loncatan vertikal. Daya ledak tungkai sangat diperlukan dalam cabang olahraga seperti bola basket, bola voli, dan Australian football.
          </Detail>
          <Detail label="B. Perlengkapan">
            <ul className="list-disc pl-5 space-y-1">
              <li>Kapur bubuk.</li>
              <li>Papan yang dipasang pada dinding dengan rentang tinggi 150–350 cm (ketelitian 1 cm).</li>
            </ul>
          </Detail>
          <Detail label="C. Prosedur">
            <ul className="list-decimal pl-5 space-y-1">
              <li>Ujung jari testi dicelupkan ke dalam kapur bubuk.</li>
              <li>Testi berdiri dan meraih titik tertinggi dengan lengan dominan, lalu menandai papan.</li>
              <li>Tumit harus menapak penuh; lengan terentang maksimal.</li>
              <li>Catat tinggi jangkauan awal.</li>
              <li>Testi jongkok sesuai kedalaman yang diinginkan tanpa mengayun lengan.</li>
              <li>Testi meloncat ke atas dan menandai papan pada titik tertinggi.</li>
              <li>Testi mendapat dua kesempatan.</li>
            </ul>
          </Detail>
          <Detail label="D. Penilaian">
            <ul className="list-disc pl-5 space-y-1">
              <li>Catat tinggi loncatan hingga ketelitian 1 cm.</li>
              <li>Ambil nilai tertinggi dari dua percobaan.</li>
              <li>Selisihkan tinggi jangkauan loncat dengan tinggi jangkauan awal.</li>
            </ul>
          </Detail>
        </TestItem>

        {/* VIII. Lari Kelincahan */}
        <TestItem 
          num="VIII" title="LARI KELINCAHAN" 
          image={img8} caption="Gambar 8 Pelaksanaan Pengukuran Lari Kelincahan"
        >
          <div className="mb-4 font-medium text-slate-800">
            Kelincahan adalah kemampuan mengubah arah dengan cepat sambil bergerak, penting dalam olahraga seperti squash dan tenis.
          </div>
          <Detail label="A. Perlengkapan">
            <ul className="list-disc pl-5 space-y-1">
              <li>Stopwatch.</li>
              <li>Dua garis paralel sepanjang 1,2 meter yang berjarak 5 meter.</li>
              <li>Empat kerucut pembatas.</li>
              <li>Permukaan datar dan tidak licin (lantai berdebu harus dihindari).</li>
            </ul>
          </Detail>
          <Detail label="C. Prosedur">
            <ul className="list-decimal pl-5 space-y-1">
              <li>Testi start dari belakang garis.</li>
              <li>Pada aba-aba “Ya”, testi berlari bolak-balik antara dua garis.</li>
              <li>Satu siklus = sekali bolak-balik; testi melakukan lima siklus.</li>
              <li>Setiap kali sampai garis, kedua kaki harus menginjak belakang garis.</li>
              <li>Stopwatch dijalankan pada aba-aba dan dihentikan ketika dada melewati garis akhir.</li>
              <li>Dua kali kesempatan diberikan.</li>
              <li>Jika tergelincir, ulangi.</li>
            </ul>
          </Detail>
          <Detail label="D. Penilaian">
            Catat waktu terbaik hingga ketelitian 0,1 detik.
          </Detail>
        </TestItem>

        {/* IX. Lari Cepat 40 Meter */}
        <TestItem 
          num="IX" title="LARI CEPAT 40 METER" 
          image={img9} caption="Gambar 9 Pelaksanaan Pengukuran Lari Cepat 40 Meter"
        >
          <Detail label="A. Tujuan">
            Kemampuan sprint sangat dibutuhkan dalam permainan beregu dan cabang olahraga yang memerlukan ledakan intensitas tinggi dalam waktu singkat.
          </Detail>
          <Detail label="B. Perlengkapan">
            <ul className="list-disc pl-5 space-y-1">
              <li>Stopwatch.</li>
              <li>Sepuluh kerucut pembatas.</li>
              <li>Lintasan 40 meter yang lurus dan datar, ditempatkan pada cross wind. Rumput harus kering jika digunakan.</li>
            </ul>
          </Detail>
          <Detail label="C. Prosedur">
            <ul className="list-decimal pl-5 space-y-1">
              <li>Pasang tanda setiap 10 meter.</li>
              <li>Testi melakukan start berdiri dengan kaki depan di garis start.</li>
              <li>Pemberi aba-aba berdiri di garis akhir dan mengayunkan bendera sambil memulai stopwatch.</li>
              <li>Stopwatch dihentikan saat dada melewati garis akhir.</li>
              <li>Testi diminta berlari maksimal.</li>
              <li>Dua kali kesempatan diberikan.</li>
            </ul>
          </Detail>
          <Detail label="D. Penilaian">
            Catat waktu terbaik hingga ketelitian 0,1 detik.
          </Detail>
        </TestItem>

        {/* X. Lari Multitahap */}
        <TestItem 
          num="X" title="LARI MULTITAHAP" 
          image={img10} caption="Gambar 10 Pelaksanaan Pengukuran Lari Multitahap"
        >
          <Detail label="A. Tujuan">
            Lari Multitahap ( Multistage Fitness Test ) atau Shuttle Run digunakan untuk menilai kesegaran aerobik ( endurance ), penting dalam cabang olahraga jarak jauh maupun permainan beregu.
          </Detail>
          <Detail label="B. Perlengkapan">
            <ul className="list-disc pl-5 space-y-1">
              <li>Pita cadence untuk lari bolak-balik.</li>
              <li>Lintasan datar dan tidak licin.</li>
              <li>Tape recorder atau CD player.</li>
              <li>Stopwatch.</li>
              <li>Empat kerucut pembatas.</li>
              <li>Formulir penilaian.</li>
            </ul>
          </Detail>
          <Detail label="C. Prosedur">
            <ul className="list-decimal pl-5 space-y-1">
              <li>(Disederhanakan tetapi tetap akurat dan baku)</li>
              <li>Pastikan kecepatan pita cadence akurat 60 detik per menit. Bila berbeda lebih dari 0,5 detik, jarak lintasan harus disesuaikan (mengacu tabel).</li>
              <li>Tandai lintasan sesuai jarak yang telah dikoreksi.</li>
              <li>Jalankan pita cadence.</li>
              <li>Testi berlari menuju garis seberang dan menyentuhkan satu kaki tepat pada bunyi “ tuut ”.</li>
              <li>Jika tiba lebih awal, testi menunggu di titik putar.</li>
              <li>Interval antar “ tuut ” akan semakin singkat sehingga kecepatan meningkat setiap menit.</li>
              <li>Testi berhenti jika dua kali berturut-turut terlambat lebih dari dua langkah dari garis.</li>
            </ul>
          </Detail>
          <Detail label="D. Penilaian">
            Catat level dan shuttle terakhir yang berhasil diselesaikan.
          </Detail>
        </TestItem>

      </div>
    </AppLayout>
  )
}

// --- SUB-COMPONENT UNTUK BUTIR TES ---
function TestItem({ num, title, image, caption, children }: { num: string, title: string, image: string, caption: string, children: React.ReactNode }) {
  return (
    <div className="card overflow-hidden border border-slate-200 shadow-sm">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-800">{num}. {title}</h3>
      </div>
      <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-10">
        {/* Konten Teks */}
        <div className="flex-1 space-y-6 text-slate-700 text-sm leading-relaxed text-justify">
          {children}
        </div>
        
        {/* Gambar (Dibatasi ukurannya) */}
        <div className="lg:w-80 shrink-0 flex flex-col gap-3 mx-auto lg:mx-0">
          <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white p-1">
            <img 
              src={image} 
              alt={title} 
              className="w-full h-auto max-h-[300px] object-contain mx-auto" 
            />
          </div>
          <p className="text-xs text-center text-slate-500 italic font-medium px-2">{caption}</p>
        </div>
      </div>
    </div>
  )
}

function Detail({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div>
      <span className="font-bold text-slate-900 block mb-2">{label}</span>
      <div className="text-slate-600">{children}</div>
    </div>
  )
}