// src/components/ChildTable.tsx
import { useEffect, useMemo, useState, useRef } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { Search, Plus, Filter, ChevronDown, X } from 'lucide-react'
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
  if (!level || !shuttle || (level === 0 && shuttle === 0)) return '—'
  return `${level}.${shuttle}`
}

function formatMultiLine(value: string | number | undefined | null) {
  const str = String(value ?? '')
  if (!str || str === '—') return str || '—'
  if (!str.includes(' ')) return str
  return str.split(' ').map((word, i) => <div key={i}>{word}</div>)
}

function labelFromRecCount(n: number): string {
  if (n >= 6) return 'Sangat Potensial'
  if (n === 5) return 'Potensial'
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

  // --- STATE FILTER & SORT ---
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filterSekolah, setFilterSekolah] = useState<string>('')
  const [filterGender, setFilterGender] = useState<string>('')
  const [filterUsia, setFilterUsia] = useState<string>('')
  const [sortType, setSortType] = useState<'nama' | 'totalSkor' | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Menutup dropdown saat klik di luar area
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load data
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

  // Opsi sekolah unik untuk filter
  const schoolOptions = useMemo(() => {
    const schools = items.map(it => it.asalSekolah).filter(Boolean)
    return Array.from(new Set(schools)).sort()
  }, [items])

  // Helper kalkulasi per-row
  function calcForRow(row: Child) {
    return computeScoresAndRecommend({
      gender: row.gender, usia: row.usia,
      ltbt: row.ltbt, lbb: row.lbb, lt: row.lt, lk: row.lk, l40m: row.l40m,
      mftLevel: row.mftLevel, mftShuttle: row.mftShuttle,
    })
  }

  // --- LOGIKA FILTER & SORT UTAMA ---
  const filtered = useMemo(() => {
    let result = [...items]

    // 1. Filter Pencarian Teks
    const key = search.trim().toLowerCase()
    if (key) {
      result = result.filter(it =>
        it.nama.toLowerCase().includes(key) ||
        (it.asalSekolah || '').toLowerCase().includes(key)
      )
    }

    // 2. Filter Kategori (Sekolah, Gender, Usia)
    if (filterSekolah) result = result.filter(it => it.asalSekolah === filterSekolah)
    if (filterGender) result = result.filter(it => it.gender === filterGender)
    if (filterUsia) result = result.filter(it => it.usia === parseInt(filterUsia))

    // 3. Logika Sorting
    if (sortType === 'nama') {
      result.sort((a, b) => {
        const cmp = a.nama.localeCompare(b.nama)
        return sortOrder === 'asc' ? cmp : -cmp
      })
    } else if (sortType === 'totalSkor') {
      result.sort((a, b) => {
        const calcA = calcForRow(a).scores
        const totalA = (calcA.ltbt ?? 0) + (calcA.lbb ?? 0) + (calcA.lt ?? 0) + (calcA.lk ?? 0) + (calcA.l40m ?? 0) + (calcA.mft ?? 0)
        const calcB = calcForRow(b).scores
        const totalB = (calcB.ltbt ?? 0) + (calcB.lbb ?? 0) + (calcB.lt ?? 0) + (calcB.lk ?? 0) + (calcB.l40m ?? 0) + (calcB.mft ?? 0)
        return sortOrder === 'asc' ? totalA - totalB : totalB - totalA
      })
    } else {
      // DEFAULT SORT: Urut Sekolah (A-Z) kemudian Nama (A-Z)
      result.sort((a, b) => {
        const schoolA = (a.asalSekolah || '').toLowerCase()
        const schoolB = (b.asalSekolah || '').toLowerCase()
        if (schoolA !== schoolB) return schoolA.localeCompare(schoolB)
        return a.nama.toLowerCase().localeCompare(b.nama.toLowerCase())
      })
    }

    return result
  }, [items, search, filterSekolah, filterGender, filterUsia, sortType, sortOrder])

  // Fungsi Reset (DIKOREKSI: Mengosongkan semua aturan filter, sortir, dan pencarian)
  const handleReset = () => {
    setSearch('')
    setFilterSekolah('')
    setFilterGender('')
    setFilterUsia('')
    setSortType(null)
    setSortOrder('asc')
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
        const totalScore = (s.ltbt ?? 0) + (s.lbb ?? 0) + (s.lt ?? 0) + (s.lk ?? 0) + (s.l40m ?? 0) + (s.mft ?? 0)

        return {
          'Nama': r.nama, 'Asal Sekolah': r.asalSekolah || '—', 'Gender': r.gender, 'Usia': r.usia,
          'Tinggi Badan (cm)': fmt(r.tinggiBadan), 'Tinggi Duduk (cm)': fmt(r.tinggiDuduk),
          'Berat Badan (kg)': fmt(r.beratBadan), 'Rentang Langan (cm)': fmt(r.rentangLangan),
          'Lempar Tangkap Bola Tenis (kali)': fmt(r.ltbt), 
          'Lempar Bola Basket (m)': fmt(r.lbb),
          'Loncat Tegak (cm)': fmt(r.lt), 
          'Lari Kelincahan (dt)': fmt(r.lk),
          'Lari 40 Meter (dt)': fmt(r.l40m), 
          'Lari Multitahap (Lv.Sh)': fmtMft(r.mftLevel, r.mftShuttle),
          'Total Skor': totalScore,
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
      XLSX.writeFile(wb, `data-anak-${new Date().getTime()}.xlsx`)
      setToast('Unduh Data berhasil.')
    } catch (e) { setToast('Gagal mengunduh data.') }
  }

  const COLS = 19

  return (
    <div className="animate-fadeIn">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative w-full sm:max-w-xs">
            <input
              className="w-full rounded-2xl border border-slate-300 bg-slate-100 pl-9 pr-4 py-2 outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              placeholder="Cari nama atau sekolah..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          {/* BUTTON FILTER & SORT */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all font-medium text-sm whitespace-nowrap shadow-sm ${
                isFilterOpen || filterSekolah || filterGender || filterUsia || sortType 
                ? 'bg-primary text-white border-primary' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Filter size={16} />
              Filter & Sort
              <ChevronDown size={14} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* DROPDOWN MENU */}
            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl z-[110] p-4 animate-fadeIn">
                <div className="flex items-center justify-between mb-4 border-b pb-2">
                  <span className="font-bold text-slate-800 text-sm">Opsi Tampilan</span>
                  <button 
                    onClick={handleReset}
                    className="text-[10px] uppercase font-bold text-primary hover:underline"
                  >
                    Reset
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Filter Sekolah */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Sekolah</label>
                    <select 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                      value={filterSekolah}
                      onChange={(e) => setFilterSekolah(e.target.value)}
                    >
                      <option value="">Semua Sekolah</option>
                      {schoolOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Filter Gender & Usia Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Gender</label>
                      <select 
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                        value={filterGender}
                        onChange={(e) => setFilterGender(e.target.value)}
                      >
                        <option value="">Semua</option>
                        <option value="Putra">Putra</option>
                        <option value="Putri">Putri</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Usia</label>
                      <select 
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                        value={filterUsia}
                        onChange={(e) => setFilterUsia(e.target.value)}
                      >
                        <option value="">Semua</option>
                        {[11, 12, 13, 14, 15].map(u => <option key={u} value={u}>{u} Thn</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Sorting Section */}
                  <div className="pt-2 border-t space-y-3">
                    <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Urutkan Berdasarkan</label>
                    
                    {/* Sort Nama */}
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => { 
                          const newOrder = sortType === 'nama' && sortOrder === 'asc' ? 'desc' : 'asc';
                          setSortType('nama'); 
                          setSortOrder(newOrder); 
                        }}
                        className={`flex-1 text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${sortType === 'nama' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-slate-50 text-slate-600 border border-transparent hover:bg-slate-100'}`}
                      >
                        Nama Anak {sortType === 'nama' && (sortOrder === 'asc' ? '(A-Z)' : '(Z-A)')}
                      </button>
                      {sortType === 'nama' && <button onClick={() => setSortType(null)} className="p-2 text-slate-400 hover:text-red-500"><X size={14}/></button>}
                    </div>

                    {/* Sort Skor */}
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => { 
                          const newOrder = sortType === 'totalSkor' && sortOrder === 'desc' ? 'asc' : 'desc';
                          setSortType('totalSkor'); 
                          setSortOrder(newOrder); 
                        }}
                        className={`flex-1 text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors ${sortType === 'totalSkor' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-slate-50 text-slate-600 border border-transparent hover:bg-slate-100'}`}
                      >
                        Total Skor {sortType === 'totalSkor' && (sortOrder === 'desc' ? '(Tertinggi)' : '(Terendah)')}
                      </button>
                      {sortType === 'totalSkor' && <button onClick={() => setSortType(null)} className="p-2 text-slate-400 hover:text-red-500"><X size={14}/></button>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <button
            className="rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-blue-50 px-4 py-2 disabled:opacity-50 transition font-medium text-sm whitespace-nowrap shadow-sm"
            onClick={handleExportExcel}
            disabled={loading || filtered.length === 0}
          >
            Unduh Data
          </button>
          <Link to="/tambah-data" className="btn-primary rounded-2xl px-4 py-2 shadow-md shadow-primary/20 hover:shadow-primary/40 transition flex items-center gap-2 font-medium text-sm whitespace-nowrap">
            <Plus size={16} />
            Tambah Data
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 rounded-2xl overflow-x-auto border border-slate-200 shadow-sm relative z-0">
        <table className="w-full min-w-max text-[13px] leading-relaxed">
          <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
            <tr className="align-middle">
              <th className="px-4 py-4 text-center">Nama</th>
              <th className="px-4 py-4 text-center">Asal Sekolah</th>
              <th className="px-4 py-4 text-center">Gender</th>
              <th className="px-4 py-4 text-center">Usia</th>
              <th className="px-4 py-4 text-center">Tinggi<br/>Badan</th>
              <th className="px-4 py-4 text-center">Tinggi<br/>Duduk</th>
              <th className="px-4 py-4 text-center">Berat<br/>Badan</th>
              <th className="px-4 py-4 text-center">Rentang<br/>Langan</th>
              <th className="px-4 py-4 text-center">LTBT</th>
              <th className="px-4 py-4 text-center">LBB</th>
              <th className="px-4 py-4 text-center">LT</th>
              <th className="px-4 py-4 text-center">LK</th>
              <th className="px-4 py-4 text-center">L40M</th>
              <th className="px-4 py-4 text-center">MFT</th>
              <th className="px-4 py-4 text-center">Minat &<br/>Bakat</th>
              <th className="px-4 py-4 text-center">Total<br/>Skor</th>
              <th className="px-4 py-4 text-center">Klasifikasi</th>
              <th className="px-4 py-4 text-center sticky right-0 bg-slate-100 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] z-10">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!currentUser && (<tr><td colSpan={COLS} className="px-4 py-8 text-center text-slate-500">Silakan login.</td></tr>)}
            {currentUser && loading && (<tr><td colSpan={COLS} className="px-4 py-8 text-center text-slate-500">Memuat data...</td></tr>)}
            {currentUser && !loading && filtered.length === 0 && (<tr><td colSpan={COLS} className="px-4 py-8 text-center text-slate-500">Belum ada data.</td></tr>)}
            {currentUser && filtered.map((row) => {
              const calc = calcForRow(row)
              const s = calc.scores
              const totalScore = (s.ltbt ?? 0) + (s.lbb ?? 0) + (s.lt ?? 0) + (s.lk ?? 0) + (s.l40m ?? 0) + (s.mft ?? 0)

              return (
                <tr key={row.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900"><div className="flex flex-col items-center justify-center">{formatMultiLine(row.nama)}</div></td>
                  <td className="px-4 py-3"><div className="flex flex-col items-center justify-center">{formatMultiLine(row.asalSekolah)}</div></td>
                  <td className="px-4 py-3"><div className="flex flex-col items-center justify-center">{row.gender}</div></td>
                  <td className="px-4 py-3"><div className="flex flex-col items-center justify-center">{row.usia} Thn</div></td>
                  <td className="px-4 py-3 text-center">{fmt(row.tinggiBadan)}</td>
                  <td className="px-4 py-3 text-center">{fmt(row.tinggiDuduk)}</td>
                  <td className="px-4 py-3 text-center">{fmt(row.beratBadan)}</td>
                  <td className="px-4 py-3 text-center">{fmt(row.rentangLangan)}</td>
                  <td className="px-4 py-3 text-center">{fmt(row.ltbt)}</td>
                  <td className="px-4 py-3 text-center">{fmt(row.lbb)}</td>
                  <td className="px-4 py-3 text-center">{fmt(row.lt)}</td>
                  <td className="px-4 py-3 text-center">{fmt(row.lk)}</td>
                  <td className="px-4 py-3 text-center">{fmt(row.l40m)}</td>
                  <td className="px-4 py-3 text-center">{fmtMft(row.mftLevel, row.mftShuttle)}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-[120px]"><div className="flex flex-col items-center justify-center">{formatMultiLine(row.minatBakat)}</div></td>
                  <td className="px-4 py-3 font-bold text-slate-700 text-center">{totalScore}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-center justify-center">
                      <PotentialClassification recCount={calc.meta?.recommendedCount ?? 0} scores={s} align="center" />
                    </div>
                  </td>
                  <td className="px-4 py-3 sticky right-0 bg-white group-hover:bg-blue-50/50 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] z-10 text-center">
                    <Link to={`/statistik-anak/${row.id}`} className="btn-ghost text-[11px] px-3 py-1.5 text-primary border border-blue-100 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium">View</Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {toast && <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-6 py-3 rounded-xl shadow-2xl animate-fadeIn z-[100]">{toast}</div>}
    </div>
  )
}