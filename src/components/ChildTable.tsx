// src/components/ChildTable.tsx
import { useEffect, useMemo, useState, useRef } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { Search, Plus, Filter, ChevronDown} from 'lucide-react'
import * as XLSX from 'xlsx'
import { computeScoresAndRecommend, type Gender } from '../lib/norma'
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const schoolOptions = useMemo(() => {
    const schools = items.map(it => it.asalSekolah).filter(Boolean)
    return Array.from(new Set(schools)).sort()
  }, [items])

  function calcForRow(row: Child) {
    return computeScoresAndRecommend({
      gender: row.gender, usia: row.usia,
      ltbt: row.ltbt, lbb: row.lbb, lt: row.lt, lk: row.lk, l40m: row.l40m,
      mftLevel: row.mftLevel, mftShuttle: row.mftShuttle,
    })
  }

  const filtered = useMemo(() => {
    let result = [...items]
    const key = search.trim().toLowerCase()
    if (key) {
      result = result.filter(it =>
        it.nama.toLowerCase().includes(key) ||
        (it.asalSekolah || '').toLowerCase().includes(key)
      )
    }
    if (filterSekolah) result = result.filter(it => it.asalSekolah === filterSekolah)
    if (filterGender) result = result.filter(it => it.gender === filterGender)
    if (filterUsia) result = result.filter(it => it.usia === parseInt(filterUsia))

    if (sortType === 'nama') {
      result.sort((a, b) => {
        const cmp = a.nama.localeCompare(b.nama)
        return sortOrder === 'asc' ? cmp : -cmp
      })
    } else if (sortType === 'totalSkor') {
      result.sort((a, b) => {
        const cA = calcForRow(a).scores
        const tA = (cA.ltbt ?? 0) + (cA.lbb ?? 0) + (cA.lt ?? 0) + (cA.lk ?? 0) + (cA.l40m ?? 0) + (cA.mft ?? 0)
        const cB = calcForRow(b).scores
        const tB = (cB.ltbt ?? 0) + (cB.lbb ?? 0) + (cB.lt ?? 0) + (cB.lk ?? 0) + (cB.l40m ?? 0) + (cB.mft ?? 0)
        return sortOrder === 'asc' ? tA - tB : tB - tA
      })
    } else {
      result.sort((a, b) => {
        const sA = (a.asalSekolah || '').toLowerCase()
        const sB = (b.asalSekolah || '').toLowerCase()
        if (sA !== sB) return sA.localeCompare(sB)
        return a.nama.toLowerCase().localeCompare(b.nama.toLowerCase())
      })
    }
    return result
  }, [items, search, filterSekolah, filterGender, filterUsia, sortType, sortOrder])

  const handleReset = () => {
    setSearch('')
    setFilterSekolah('')
    setFilterGender('')
    setFilterUsia('')
    setSortType(null)
    setSortOrder('asc')
  }

  // --- LOGIKA UNDUH DATA PENUH (DIPERBARUI) ---
  function handleExportExcel() {
    try {
      const rows = filtered.map((r) => {
        const calc = calcForRow(r)
        const recCount = calc.meta?.recommendedCount ?? 0
        const label = labelFromRecCount(recCount)
        const s = calc.scores
        
        // Perhitungan Total Skor Keberbakatan
        const totalScore = (s.ltbt ?? 0) + (s.lbb ?? 0) + (s.lt ?? 0) + (s.lk ?? 0) + (s.l40m ?? 0) + (s.mft ?? 0)

        return {
          'Nama': r.nama,
          'Asal Sekolah': r.asalSekolah || '—',
          'Gender': r.gender,
          'Usia': r.usia,
          'Tinggi Badan (cm)': fmt(r.tinggiBadan),
          'Tinggi Duduk (cm)': fmt(r.tinggiDuduk),
          'Berat Badan (kg)': fmt(r.beratBadan),
          'Rentang Langan (cm)': fmt(r.rentangLangan),
          'LTBT (Lempar Tangkap)': fmt(r.ltbt),
          'LBB (Lempar Bola Basket)': fmt(r.lbb),
          'LT (Loncat Tegak)': fmt(r.lt),
          'LK (Lari Kelincahan)': fmt(r.lk),
          'L40M (Lari 40 Meter)': fmt(r.l40m),
          'MFT (Lari Multitahap)': fmtMft(r.mftLevel, r.mftShuttle),
          'Minat & Bakat': r.minatBakat || '—',
          'Total Skor': totalScore,
          'Klasifikasi': label
        }
      })

      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Data Anak Sibakat')
      XLSX.writeFile(wb, `data-sibakat-full-${Date.now()}.xlsx`)
      setToast('Unduh Data Berhasil.')
    } catch (e) { 
      console.error(e)
      setToast('Gagal mengunduh data.') 
    }
  }

  const COLS = 19

  return (
    <div className="animate-fadeIn space-y-4">
      {/* Toolbar Responsif */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 flex-1">
          <div className="relative flex-1 md:max-w-xs">
            <input
              className="w-full rounded-2xl border border-slate-300 bg-slate-100 pl-9 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/30 text-sm"
              placeholder="Cari nama siswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border transition-all font-semibold text-sm shadow-sm ${
                isFilterOpen || filterSekolah || filterGender || filterUsia || sortType 
                ? 'bg-primary text-white border-primary' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Filter size={16} />
              Filter & Sort
              <ChevronDown size={14} className={`transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-slate-200 shadow-2xl z-[110] p-4 animate-fadeIn">
                <div className="flex items-center justify-between mb-4 border-b pb-2">
                  <span className="font-bold text-slate-800 text-sm">Opsi Tampilan</span>
                  <button onClick={handleReset} className="text-[10px] uppercase font-bold text-primary hover:underline">Reset</button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Sekolah</label>
                    <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none" value={filterSekolah} onChange={(e) => setFilterSekolah(e.target.value)}>
                      <option value="">Semua Sekolah</option>
                      {schoolOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Gender</label>
                      <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs" value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
                        <option value="">Semua</option><option value="Putra">Putra</option><option value="Putri">Putri</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Usia</label>
                      <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs" value={filterUsia} onChange={(e) => setFilterUsia(e.target.value)}>
                        <option value="">Semua</option>{[11, 12, 13, 14, 15].map(u => <option key={u} value={u}>{u} Thn</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="pt-2 border-t space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Urutan</label>
                    <button onClick={() => { setSortType('nama'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc') }} className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium ${sortType === 'nama' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-slate-50 text-slate-600 border border-transparent'}`}>
                      Nama Anak {sortType === 'nama' && (sortOrder === 'asc' ? '(A-Z)' : '(Z-A)')}
                    </button>
                    <button onClick={() => { setSortType('totalSkor'); setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc') }} className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium ${sortType === 'totalSkor' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-slate-50 text-slate-600 border border-transparent'}`}>
                      Total Skor {sortType === 'totalSkor' && (sortOrder === 'desc' ? '(Tinggi)' : '(Rendah)')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex-1 lg:flex-none rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-blue-50 px-4 py-2.5 transition font-semibold text-sm whitespace-nowrap shadow-sm" onClick={handleExportExcel} disabled={loading || filtered.length === 0}>
            Unduh Data
          </button>
          <Link to="/tambah-data" className="flex-1 lg:flex-none btn-primary rounded-2xl px-4 py-2.5 shadow-md shadow-primary/20 hover:shadow-primary/40 transition flex items-center justify-center gap-2 font-semibold text-sm whitespace-nowrap">
            <Plus size={16} /> Tambah
          </Link>
        </div>
      </div>

      {/* Tabel dengan Scroll Horizontal dan Kolom Aksi Sticky */}
      <div className="card p-0 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
          <table className="w-full min-w-max text-[13px] leading-relaxed">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr className="align-middle">
                <th className="px-4 py-4 text-center">Nama</th><th className="px-4 py-4 text-center">Asal Sekolah</th>
                <th className="px-4 py-4 text-center">Gender</th><th className="px-4 py-4 text-center">Usia</th>
                <th className="px-4 py-4 text-center">Tinggi<br/>Badan</th><th className="px-4 py-4 text-center">Tinggi<br/>Duduk</th>
                <th className="px-4 py-4 text-center">Berat<br/>Badan</th><th className="px-4 py-4 text-center">Rentang<br/>Langan</th>
                <th className="px-4 py-4 text-center">LTBT</th><th className="px-4 py-4 text-center">LBB</th>
                <th className="px-4 py-4 text-center">LT</th><th className="px-4 py-4 text-center">LK</th>
                <th className="px-4 py-4 text-center">L40M</th><th className="px-4 py-4 text-center">MFT</th>
                <th className="px-4 py-4 text-center">Minat & Bakat</th>
                <th className="px-4 py-4 text-center">Total Skor</th>
                <th className="px-4 py-4 text-center">Klasifikasi</th>
                <th className="px-4 py-4 text-center sticky right-0 bg-slate-100 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.1)] z-10">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={COLS} className="px-4 py-12 text-center text-slate-400 animate-pulse">Memuat data anak...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={COLS} className="px-4 py-12 text-center text-slate-500 italic">Data tidak ditemukan.</td></tr>
              ) : filtered.map((row) => {
                const calc = calcForRow(row); const s = calc.scores;
                const totalScore = (s.ltbt ?? 0) + (s.lbb ?? 0) + (s.lt ?? 0) + (s.lk ?? 0) + (s.l40m ?? 0) + (s.mft ?? 0);
                return (
                  <tr key={row.id} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-4 py-3 font-medium text-slate-900 text-center">{formatMultiLine(row.nama)}</td>
                    <td className="px-4 py-3 text-center">{formatMultiLine(row.asalSekolah)}</td>
                    <td className="px-4 py-3 text-center">{row.gender}</td>
                    <td className="px-4 py-3 text-center">{row.usia} Thn</td>
                    <td className="px-4 py-3 text-center">{fmt(row.tinggiBadan)}</td><td className="px-4 py-3 text-center">{fmt(row.tinggiDuduk)}</td>
                    <td className="px-4 py-3 text-center">{fmt(row.beratBadan)}</td><td className="px-4 py-3 text-center">{fmt(row.rentangLangan)}</td>
                    <td className="px-4 py-3 text-center">{fmt(row.ltbt)}</td><td className="px-4 py-3 text-center">{fmt(row.lbb)}</td>
                    <td className="px-4 py-3 text-center">{fmt(row.lt)}</td><td className="px-4 py-3 text-center">{fmt(row.lk)}</td>
                    <td className="px-4 py-3 text-center">{fmt(row.l40m)}</td><td className="px-4 py-3 text-center">{fmtMft(row.mftLevel, row.mftShuttle)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[120px] text-center">{formatMultiLine(row.minatBakat)}</td>
                    <td className="px-4 py-3 font-bold text-slate-700 text-center bg-slate-50/30">{totalScore}</td>
                    <td className="px-4 py-3 text-center"><PotentialClassification recCount={calc.meta?.recommendedCount ?? 0} scores={s} align="center" /></td>
                    <td className="px-4 py-3 sticky right-0 bg-white group-hover:bg-[#f8fbff] shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.1)] z-10 text-center">
                      <Link to={`/statistik-anak/${row.id}`} className="inline-block btn-ghost text-[11px] px-4 py-2 text-primary border border-blue-100 bg-blue-50 hover:bg-blue-100 rounded-xl font-bold transition-all">View</Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl animate-slideInUp z-[200] text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  )
}