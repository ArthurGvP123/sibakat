// src/components/ChildTable.tsx
import { useEffect, useMemo, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { collection, onSnapshot, orderBy, query, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { Search, Plus, Filter, ChevronDown, X, AlertTriangle, Save } from 'lucide-react'
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

function labelFromTotalScore(score: number): string {
  if (score >= 27) return 'Sangat Potensial'
  if (score >= 23) return 'Potensial'
  if (score >= 19) return 'Cukup Potensial'
  if (score >= 15) return 'Kurang Potensial'
  return 'Tidak Potensial'
}

export default function ChildTable() {
  const { currentUser } = useAuth()
  const [items, setItems] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filterSekolah, setFilterSekolah] = useState<string>('')
  const [filterGender, setFilterGender] = useState<string>('')
  const [filterUsia, setFilterUsia] = useState<string>('')
  const [sortType, setSortType] = useState<'nama' | 'totalSkor' | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editChild, setEditChild] = useState<Child | null>(null)
  const [isSavingEdit, setIsSavingEdit] = useState(false)

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
    setSearch(''); setFilterSekolah(''); setFilterGender(''); setFilterUsia(''); setSortType(null); setSortOrder('asc');
  }

  const confirmDelete = async () => {
    if (!deleteId || !currentUser) return
    setIsDeleting(true)
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'children', deleteId))
      setToast('Data berhasil dihapus.'); setDeleteId(null)
    } catch (err) {
      console.error(err); setToast('Gagal menghapus data.')
    } finally { setIsDeleting(false) }
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editChild || !currentUser || !editChild.id) return
    setIsSavingEdit(true)
    try {
      const ref = doc(db, 'users', currentUser.uid, 'children', editChild.id)
      await updateDoc(ref, { ...editChild, updatedAt: new Date() })
      setToast('Perubahan data berhasil disimpan.'); setEditChild(null)
    } catch (err) {
      console.error(err); setToast('Gagal menyimpan perubahan.')
    } finally { setIsSavingEdit(false) }
  }

  function handleExportExcel() {
    try {
      const rows = filtered.map((r) => {
        const calc = calcForRow(r); const s = calc.scores
        const totalScore = (s.ltbt ?? 0) + (s.lbb ?? 0) + (s.lt ?? 0) + (s.lk ?? 0) + (s.l40m ?? 0) + (s.mft ?? 0)
        return {
          'Nama': r.nama, 'Asal Sekolah': r.asalSekolah || '—', 'Gender': r.gender, 'Usia': r.usia,
          'Total Skor': totalScore, 'Klasifikasi': labelFromTotalScore(totalScore), 
          'Tinggi Badan (cm)': fmt(r.tinggiBadan), 'Tinggi Duduk (cm)': fmt(r.tinggiDuduk),
          'Berat Badan (kg)': fmt(r.beratBadan), 'Rentang Langan (cm)': fmt(r.rentangLangan)
        }
      })
      const ws = XLSX.utils.json_to_sheet(rows); const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Data Sibakat'); XLSX.writeFile(wb, `data-sibakat-${Date.now()}.xlsx`)
      setToast('Unduh Data berhasil.')
    } catch (e) { setToast('Gagal mengunduh data.') }
  }

  const COLS = 18

  return (
    <div className="animate-fadeIn space-y-4">
      {/* Toolbar */}
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
          <button className="flex-1 lg:flex-none rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-blue-50 px-4 py-2.5 transition font-semibold text-sm whitespace-nowrap shadow-sm" onClick={handleExportExcel} disabled={loading || filtered.length === 0}>Unduh Data</button>
          <Link to="/tambah-data" className="flex-1 lg:flex-none btn-primary rounded-2xl px-4 py-2.5 shadow-md shadow-primary/20 hover:shadow-primary/40 transition flex items-center justify-center gap-2 font-semibold text-sm whitespace-nowrap"><Plus size={16} /> Tambah</Link>
        </div>
      </div>

      {/* Tabel */}
      <div className="card p-0 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-[13px] leading-relaxed">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr className="align-middle">
                <th className="px-4 py-4 text-center">Nama</th><th className="px-4 py-4 text-center">Asal Sekolah</th>
                <th className="px-4 py-4 text-center">Gender</th><th className="px-4 py-4 text-center">Usia</th>
                <th className="px-4 py-4 text-center">Tinggi Badan</th><th className="px-4 py-4 text-center">Tinggi Duduk</th>
                <th className="px-4 py-4 text-center">Berat Badan</th><th className="px-4 py-4 text-center">Rentang Langan</th>
                <th className="px-4 py-4 text-center">LTBT</th><th className="px-4 py-4 text-center">LBB</th>
                <th className="px-4 py-4 text-center">LT</th><th className="px-4 py-4 text-center">LK</th>
                <th className="px-4 py-4 text-center">L40M</th><th className="px-4 py-4 text-center">MFT</th>
                <th className="px-4 py-4 text-center">Minat & Bakat</th>
                <th className="px-4 py-4 text-center">Total Skor</th><th className="px-4 py-4 text-center">Klasifikasi</th>
                <th className="px-4 py-4 text-center sticky right-0 bg-slate-100 z-10 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.1)]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr><td colSpan={COLS} className="px-4 py-12 text-slate-400 animate-pulse text-center">Memuat data...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={COLS} className="px-4 py-12 text-slate-500 italic text-center">Data tidak ditemukan.</td></tr>
              ) : (
                filtered.map((row) => {
                  const calc = calcForRow(row); const s = calc.scores;
                  const totalScore = (s.ltbt ?? 0) + (s.lbb ?? 0) + (s.lt ?? 0) + (s.lk ?? 0) + (s.l40m ?? 0) + (s.mft ?? 0);
                  return (
                    <tr key={row.id} className="hover:bg-blue-50/40 transition-colors group text-center">
                      <td className="px-4 py-3 font-medium text-slate-900">{formatMultiLine(row.nama)}</td>
                      <td className="px-4 py-3">{formatMultiLine(row.asalSekolah)}</td>
                      <td className="px-4 py-3">{row.gender}</td><td className="px-4 py-3">{row.usia} Thn</td>
                      <td className="px-4 py-3">{fmt(row.tinggiBadan)}</td><td className="px-4 py-3">{fmt(row.tinggiDuduk)}</td>
                      <td className="px-4 py-3">{fmt(row.beratBadan)}</td><td className="px-4 py-3">{fmt(row.rentangLangan)}</td>
                      <td className="px-4 py-3">{fmt(row.ltbt)}</td><td className="px-4 py-3">{fmt(row.lbb)}</td>
                      <td className="px-4 py-3">{fmt(row.lt)}</td><td className="px-4 py-3">{fmt(row.lk)}</td>
                      <td className="px-4 py-3">{fmt(row.l40m)}</td><td className="px-4 py-3">{fmtMft(row.mftLevel, row.mftShuttle)}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-[120px]">{formatMultiLine(row.minatBakat)}</td>
                      <td className="px-4 py-3 font-bold text-slate-700 bg-slate-50/30">{totalScore}</td>
                      <td className="px-4 py-3"><PotentialClassification recCount={calc.meta?.recommendedCount ?? 0} scores={s} align="center" /></td>
                      <td className="px-4 py-3 sticky right-0 bg-white group-hover:bg-[#f8fbff] shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.1)] z-10">
                        <div className="grid grid-cols-2 gap-1.5 whitespace-nowrap px-1 w-fit mx-auto">
                          <Link to={`/statistik-anak/${row.id}`} className="text-[9px] px-2 py-1.5 font-black uppercase text-primary bg-blue-50 border border-blue-100 rounded-lg hover:bg-primary hover:text-white transition-all text-center">Lihat</Link>
                          <button onClick={() => setEditChild({...row})} className="text-[9px] px-2 py-1.5 font-black uppercase text-amber-600 bg-amber-50 border border-amber-100 rounded-lg hover:bg-amber-500 hover:text-white transition-all text-center">Ubah</button>
                          <button onClick={() => setDeleteId(row.id!)} className="col-span-2 text-[9px] px-2 py-1.5 font-black uppercase text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-600 hover:text-white transition-all text-center">Hapus</button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PORTALS (MODALS RENDERED DIRECTLY TO BODY TO OVERLAY NAVBAR) */}
      {editChild && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col animate-scaleInUp">
            <div className="p-6 md:p-8 border-b flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Edit Data Anak</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Pembaruan Profil & Hasil Tes Sport Search</p>
              </div>
              <button onClick={() => setEditChild(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X size={28} /></button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin">
              <div className="space-y-10">
                {/* 1. Informasi Dasar */}
                <section>
                  <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.2em] border-l-4 border-primary pl-3 mb-5">Informasi Dasar</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nama Lengkap</label><input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all" value={editChild.nama} onChange={e => setEditChild({...editChild, nama: e.target.value})} /></div>
                    <div><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Sekolah</label><input required type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none text-sm font-semibold focus:ring-4 focus:ring-primary/10 transition-all" value={editChild.asalSekolah} onChange={e => setEditChild({...editChild, asalSekolah: e.target.value})} /></div>
                    <div><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Gender</label><select className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm font-semibold" value={editChild.gender} onChange={e => setEditChild({...editChild, gender: e.target.value as Gender})}><option value="Putra">Putra</option><option value="Putri">Putri</option></select></div>
                    <div><label className="text-[10px] font-black text-slate-500 uppercase ml-1">Usia</label><select className="w-full px-3 py-3 rounded-xl border border-slate-200 text-sm font-semibold" value={editChild.usia} onChange={e => setEditChild({...editChild, usia: parseInt(e.target.value)})}>{[11,12,13,14,15].map(v => <option key={v} value={v}>{v} Thn</option>)}</select></div>
                  </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* 2. Data Antropometri */}
                  <section>
                    <h4 className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.2em] border-l-4 border-indigo-600 pl-3 mb-5">Data Antropometri</h4>
                    <div className="grid grid-cols-2 gap-5 p-5 bg-indigo-50/30 rounded-[1.5rem] border border-indigo-100/50">
                      {[
                        { l: 'Tinggi Badan (cm)', k: 'tinggiBadan' }, { l: 'Tinggi Duduk (cm)', k: 'tinggiDuduk' },
                        { l: 'Berat Badan (kg)', k: 'beratBadan' }, { l: 'Rentang Lengan (cm)', k: 'rentangLangan' }
                      ].map(f => (
                        <div key={f.k}><label className="text-[10px] font-black text-slate-500 uppercase ml-1">{f.l}</label><input type="number" step="0.01" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-mono font-bold focus:bg-white transition-colors" value={(editChild as any)[f.k] || ''} onChange={e => setEditChild({...editChild, [f.k]: parseFloat(e.target.value) || 0})} /></div>
                      ))}
                    </div>
                  </section>

                  {/* 3. Data Hasil Tes Sport Search */}
                  <section>
                    <h4 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] border-l-4 border-emerald-600 pl-3 mb-5">Data Hasil Tes Sport Search</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 p-5 bg-emerald-50/30 rounded-[1.5rem] border border-emerald-100/50">
                      {[
                        { l: 'LTBT (kali)', k: 'ltbt' }, { l: 'LBB (meter)', k: 'lbb' }, { l: 'LT (cm)', k: 'lt' },
                        { l: 'LK (detik)', k: 'lk' }, { l: 'L40M (detik)', k: 'l40m' }
                      ].map(f => (
                        <div key={f.k}><label className="text-[10px] font-black text-slate-500 uppercase ml-1">{f.l}</label><input type="number" step="0.01" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-mono font-bold focus:bg-white transition-colors" value={(editChild as any)[f.k] || ''} onChange={e => setEditChild({...editChild, [f.k]: parseFloat(e.target.value) || 0})} /></div>
                      ))}
                      <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-1">MFT (Lv.Sh)</label>
                        <div className="flex gap-2">
                          <input type="number" placeholder="Lv" className="w-1/2 px-2 py-3 rounded-xl border border-slate-200 text-sm text-center font-mono font-bold" value={editChild.mftLevel || ''} onChange={e => setEditChild({...editChild, mftLevel: parseInt(e.target.value) || 0})} />
                          <input type="number" placeholder="Sh" className="w-1/2 px-2 py-3 rounded-xl border border-slate-200 text-sm text-center font-mono font-bold" value={editChild.mftShuttle || ''} onChange={e => setEditChild({...editChild, mftShuttle: parseInt(e.target.value) || 0})} />
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                <section>
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Minat & Bakat Siswa (Opsional)</label>
                  <textarea rows={3} className="w-full mt-2 px-5 py-4 rounded-[1.5rem] border border-slate-200 outline-none text-sm font-medium resize-none focus:ring-4 focus:ring-primary/10 transition-all" value={editChild.minatBakat || ''} onChange={e => setEditChild({...editChild, minatBakat: e.target.value})} placeholder="Tuliskan minat atau pengalaman olahraga anak di sini..." />
                </section>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row gap-4">
                <button type="button" onClick={() => setEditChild(null)} className="flex-1 py-5 font-black uppercase tracking-widest text-slate-500 bg-slate-100 rounded-2xl text-xs hover:bg-slate-200 transition-all shadow-sm">Batal</button>
                <button type="submit" disabled={isSavingEdit} className="flex-1 py-5 font-black uppercase tracking-widest text-white bg-primary rounded-2xl text-xs hover:shadow-2xl hover:shadow-primary/40 transition-all flex items-center justify-center gap-4">
                  {isSavingEdit ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={20} /> Simpan Perubahan</>}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {deleteId && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl animate-scaleInUp text-center">
            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-red-100"><AlertTriangle size={40} /></div>
            <h3 className="text-2xl font-black text-slate-900 mb-3">Hapus Data?</h3><p className="text-slate-500 font-medium leading-relaxed mb-8 text-sm">Data anak akan dihapus secara permanen dari sistem.</p>
            <div className="flex gap-4"><button onClick={() => setDeleteId(null)} disabled={isDeleting} className="flex-1 py-3 px-4 rounded-xl font-black uppercase tracking-widest text-slate-400 bg-slate-50 text-[11px]">Batal</button><button onClick={confirmDelete} disabled={isDeleting} className="flex-1 py-3 px-4 rounded-xl font-black uppercase tracking-widest text-white bg-red-500 shadow-xl text-[11px]">{isDeleting ? "Proses..." : "Ya, Hapus"}</button></div>
          </div>
        </div>,
        document.body
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-8 bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl animate-slideInUp z-[100000] text-[10px] font-black uppercase tracking-[0.2em]">{toast}</div>
      )}
    </div>
  )
}