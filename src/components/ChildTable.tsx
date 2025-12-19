// src/components/ChildTable.tsx
import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { Search, Plus } from 'lucide-react'
import * as XLSX from 'xlsx'
import { computeScoresAndRecommend, DEFAULT_RECO_THRESHOLD, type Gender } from '../lib/norma'
import PotentialClassification from '../components/PotentialClassification'

type Child = {
  id?: string
  nama: string
  gender: Gender
  usia: number
  asalSekolah: string
  ltbt?: number; lbb?: number; lt?: number; lk?: number; l40m?: number;
  mftLevel?: number; mftShuttle?: number;
  tinggiBadan?: number; tinggiDuduk?: number; beratBadan?: number; rentangLangan?: number;
  minatBakat?: string;
  createdAt?: any; updatedAt?: any;
}

function fmt(v?: number) {
  if (v == null || v === 0) return '—'
  return String(v)
}
function fmtMft(level?: number, shuttle?: number) {
  if (!level || !shuttle) return '—'
  return `${level}.${shuttle}`
}

function formatMultiLine(value: string | number | undefined | null) {
  const str = String(value ?? '')
  if (!str || str === '—') return str || '—'
  if (!str.includes(' ')) return str
  return str.split(' ').map((word, i) => <div key={i}>{word}</div>)
}

// Helper klasifikasi label (untuk ekspor Excel)
function labelFromRecCount(n: number): string {
  if (n > 6) return 'Sangat Potensial'
  if (n >= 5) return 'Potensial'
  if (n >= 3) return 'Cukup Potensial'
  if (n >= 1) return 'Kurang Potensial'
  return 'Tidak Potensial'
}

export default function ChildTable() {
  const { currentUser } = useAuth()
  const [items, setItems] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  
  // Load children
  useEffect(() => {
    if (!currentUser) return
    setLoading(true)
    const colRef = collection(db, 'users', currentUser.uid, 'children')
    const qChildren = query(colRef, orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(qChildren, (snap) => {
      const rows: Child[] = []
      snap.forEach((docSnap) => rows.push({ id: docSnap.id, ...(docSnap.data() as any) }))
      setItems(rows)
      setLoading(false)
    }, (err) => { console.error(err); setLoading(false) })
    return () => unsub()
  }, [currentUser])

  // Filter tabel
  const filtered = useMemo(() => {
    const key = search.trim().toLowerCase()
    if (!key) return items
    return items.filter(it =>
      it.nama.toLowerCase().includes(key) ||
      (it.asalSekolah || '').toLowerCase().includes(key)
    )
  }, [items, search])

  // Helper kalkulasi per-row
  function calcForRow(row: Child) {
    return computeScoresAndRecommend({
      gender: row.gender, usia: row.usia,
      ltbt: row.ltbt, lbb: row.lbb, lt: row.lt, lk: row.lk, l40m: row.l40m,
      mftLevel: row.mftLevel, mftShuttle: row.mftShuttle,
    })
  }

  function renderKlasifikasi(row: Child) {
    const calc = calcForRow(row)
    const recCount = calc.meta?.recommendedCount ?? 0
    return <PotentialClassification recCount={recCount} scores={calc.scores} align="center" />
  }

  // Ekspor Excel
  function handleExportExcel() {
    try {
      const rows = filtered.map((r) => {
        const calc = calcForRow(r)
        const recCount = calc.meta?.recommendedCount ?? 0
        const label = labelFromRecCount(recCount)
        const thresholdPct = Math.round((calc.meta?.threshold ?? DEFAULT_RECO_THRESHOLD) * 100)
        const topNames = (calc.top ?? []).map(t => t.sport).join(', ')
        const s = calc.scores
        // const breakdown = `${s.ltbt ?? '–'}-${s.lbb ?? '–'}-${s.lt ?? '–'}-${s.lk ?? '–'}-${s.l40m ?? '–'}-${s.mft ?? '–'}`

        return {
          'Nama': r.nama, 'Asal Sekolah': r.asalSekolah || '—', 'Gender': r.gender, 'Usia': r.usia,
          'Tinggi Badan (cm)': fmt(r.tinggiBadan), 'Tinggi Duduk (cm)': fmt(r.tinggiDuduk),
          'Berat Badan (kg)': fmt(r.beratBadan), 'Rentang Langan (cm)': fmt(r.rentangLangan),
          
          // Data Nilai Asli
          'Lempar Tangkap Bola Tenis (kali)': fmt(r.ltbt), 
          'Lempar Bola Basket (m)': fmt(r.lbb),
          'Loncat Tegak (cm)': fmt(r.lt), 
          'Lari Kelincahan (dt)': fmt(r.lk),
          'Lari 40 Meter (dt)': fmt(r.l40m), 
          'Lari Multitahap (Lv.Sh)': fmtMft(r.mftLevel, r.mftShuttle),

          // ✅ NEW: Skor Hasil Perhitungan Keberbakatan (1-5)
          'Skor Lempar Tangkap Bola Tenis': s.ltbt ?? 0,
          'Skor Lempar Bola Basket': s.lbb ?? 0,
          'Skor Loncat Tegak': s.lt ?? 0,
          'Skor Lari Kelincahan': s.lk ?? 0,
          'Skor Lari 40 Meter': s.l40m ?? 0,
          'Skor Lari Multitahap': s.mft ?? 0,

          // ✅ Minat & Bakat dan Klasifikasi
          'Minat & Bakat': r.minatBakat || '—',
          'Klasifikasi': label, 
          'Jumlah Rekomendasi': recCount,
          'Top Rekomendasi': topNames || '—',
          'Ambang Rekomendasi (%)': thresholdPct,
        }
      })
      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Data Anak')
      const now = new Date()
      const fname = `data-anak-${now.getTime()}.xlsx`
      XLSX.writeFile(wb, fname)
      setToast('Unduh Data berhasil.')
    } catch (e) { setToast('Gagal mengunduh data.') }
  }

  // Total kolom tabel
  const COLS = 18

  return (
    <div className="animate-fadeIn">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
        <div className="relative w-full sm:max-w-xs">
          <input
            className="w-full rounded-2xl border border-slate-300 bg-slate-100 pl-9 pr-4 py-2 outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Cari nama atau sekolah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol Ekspor */}
          <button
            className="rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-blue-50 px-4 py-2 disabled:opacity-50 transition font-medium text-sm whitespace-nowrap"
            onClick={handleExportExcel}
            disabled={loading || filtered.length === 0}
          >
            Unduh Data
          </button>

          {/* Tombol Tambah Data */}
          <Link 
            to="/tambah-data" 
            className="btn-primary rounded-2xl px-4 py-2 shadow-md shadow-primary/20 hover:shadow-primary/40 transition flex items-center gap-2 font-medium text-sm whitespace-nowrap"
          >
            <Plus size={16} />
            Tambah Data
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 rounded-2xl overflow-x-auto border border-slate-200 shadow-sm">
        <table className="w-full min-w-max text-[13px] leading-relaxed">
          {/* HEADER WARNA ABU-ABU MUDA */}
          <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
            <tr className="align-middle">
              <th className="px-4 py-4 text-center align-middle">Nama</th>
              <th className="px-4 py-4 text-center align-middle">Asal Sekolah</th>
              <th className="px-4 py-4 text-center align-middle">Gender</th>
              <th className="px-4 py-4 text-center align-middle">Usia</th>
              <th className="px-4 py-4 text-center align-middle">Tinggi<br/>Badan<br/>(cm)</th>
              <th className="px-4 py-4 text-center align-middle">Tinggi<br/>Duduk<br/>(cm)</th>
              <th className="px-4 py-4 text-center align-middle">Berat<br/>Badan<br/>(kg)</th>
              <th className="px-4 py-4 text-center align-middle">Rentang<br/>Langan<br/>(cm)</th>
              <th className="px-4 py-4 text-center align-middle">Lempar Tangkap<br/>Bola Tenis (kali)</th>
              <th className="px-4 py-4 text-center align-middle">Lempar Bola<br/>Basket (m)</th>
              <th className="px-4 py-4 text-center align-middle">Loncat Tegak<br/>(cm)</th>
              <th className="px-4 py-4 text-center align-middle">Lari Kelincahan<br/>(dt)</th>
              <th className="px-4 py-4 text-center align-middle">Lari 40 Meter<br/>(dt)</th>
              <th className="px-4 py-4 text-center align-middle">Lari Multitahap<br/>(Lv.Sh)</th>
              <th className="px-4 py-4 text-center align-middle">Minat &<br/>Bakat</th>
              <th className="px-4 py-4 text-center align-middle">Klasifikasi</th>
              {/* Header Aksi Sticky */}
              <th className="px-4 py-4 text-center align-middle sticky right-0 bg-slate-100 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] z-10">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!currentUser && (
              <tr><td colSpan={COLS} className="px-4 py-8 text-center text-slate-500">Silakan login.</td></tr>
            )}
            {currentUser && loading && (
              <tr><td colSpan={COLS} className="px-4 py-8 text-center text-slate-500">Memuat data...</td></tr>
            )}
            {currentUser && !loading && filtered.length === 0 && (
              <tr><td colSpan={COLS} className="px-4 py-8 text-center text-slate-500">Belum ada data.</td></tr>
            )}
            {currentUser && filtered.map((row) => (
              <tr key={row.id} className="hover:bg-blue-50/50 transition-colors">
                <td className="px-4 py-3"><div className="flex flex-col items-center justify-center h-full font-medium text-slate-900">{formatMultiLine(row.nama)}</div></td>
                <td className="px-4 py-3"><div className="flex flex-col items-center justify-center h-full">{formatMultiLine(row.asalSekolah)}</div></td>
                <td className="px-4 py-3"><div className="flex flex-col items-center justify-center h-full">{formatMultiLine(row.gender)}</div></td>
                <td className="px-4 py-3"><div className="flex flex-col items-center justify-center h-full">{formatMultiLine(row.usia + ' Tahun')}</div></td>
                <td className="px-4 py-3"><div className="flex flex-col items-center justify-center h-full">{fmt(row.tinggiBadan)}</div></td>
                <td className="px-4 py-3"><div className="flex flex-col items-center justify-center h-full">{fmt(row.tinggiDuduk)}</div></td>
                <td className="px-4 py-3"><div className="flex flex-col items-center justify-center h-full">{fmt(row.beratBadan)}</div></td>
                <td className="px-4 py-3"><div className="flex flex-col items-center justify-center h-full">{fmt(row.rentangLangan)}</div></td>
                <td className="px-4 py-3"><div className="flex flex-col items-center justify-center h-full">{fmt(row.ltbt)}</div></td>
                <td className="px-4 py-3"><div className="flex flex-col items-center justify-center h-full">{fmt(row.lbb)}</div></td>
                <td className="px-4 py-3"><div className="flex flex-col items-center justify-center h-full">{fmt(row.lt)}</div></td>
                <td className="px-4 py-3"><div className="flex flex-col items-center justify-center h-full">{fmt(row.lk)}</div></td>
                <td className="px-4 py-3"><div className="flex flex-col items-center justify-center h-full">{fmt(row.l40m)}</div></td>
                <td className="px-4 py-3"><div className="flex flex-col items-center justify-center h-full">{fmtMft(row.mftLevel, row.mftShuttle)}</div></td>
                <td className="px-4 py-3"><div className="flex flex-col items-center justify-center h-full text-xs text-slate-500 max-w-[120px]">{formatMultiLine(row.minatBakat)}</div></td>
                <td className="px-4 py-3"><div className="flex flex-col items-center justify-center h-full">{renderKlasifikasi(row)}</div></td>
                
                {/* Kolom Aksi Sticky */}
                <td className="px-4 py-3 sticky right-0 bg-white group-hover:bg-blue-50/50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] align-middle z-10">
                  <div className="flex items-center justify-center h-full">
                    <Link
                      to={`/data-anak/${row.id}`}
                      className="btn-ghost text-[11px] px-3 py-1.5 h-auto text-primary border border-blue-100 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium"
                    >
                      View
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl animate-fadeIn z-[100]">
          {toast}
        </div>
      )}
    </div>
  )
}