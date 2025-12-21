// src/pages/TambahData.tsx
import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  addDoc, collection, doc, getDoc, serverTimestamp, updateDoc, query, orderBy, onSnapshot, deleteDoc, writeBatch, where, getDocs
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import AppLayout from '../components/Navbar'
import type { Gender } from '../lib/norma'
import { Save, Plus, Trash2, Edit2, CheckCircle, AlertCircle, Search, UserPlus, School as IconSchool } from 'lucide-react'

// Tipe Data
type Child = {
  nama: string; gender: Gender; usia: number; asalSekolah: string;
  ltbt?: number; lbb?: number; lt?: number; lk?: number; l40m?: number;
  mftLevel?: number; mftShuttle?: number;
  tinggiBadan?: number; tinggiDuduk?: number; beratBadan?: number; rentangLangan?: number;
  minatBakat?: string;
}
type School = { id: string; nama: string; }
type ChildOption = { id: string; nama: string; asalSekolah: string; }

// Helper konversi
const n0 = (v?: number) => (v == null || Number.isNaN(v) ? 0 : Number(v))
const zeroToUndef = (v?: number) => (v == null || v === 0 ? undefined : v)

// Helper Parsing MFT
function parseMft(text: string): { level?: number; shuttle?: number; error?: string } {
  const raw = (text || '').trim()
  if (!raw) return { level: undefined, shuttle: undefined }
  const norm = raw.replace(',', '.').replace(/\s+/g, '')
  const m = norm.match(/^(\d{1,2})\.(\d{1,2})$/)
  if (!m) return { error: 'Format: Level.Shuttle (cth: 5.3)' }
  const level = Number(m[1]); const shuttle = Number(m[2])
  if (!(level >= 1 && level <= 21)) return { error: 'Level tidak valid.' }
  if (!(shuttle >= 1 && shuttle <= 15)) return { error: 'Shuttle tidak valid.' }
  return { level, shuttle }
}

export default function TambahData() {
  const { id } = useParams() 
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  
  // State Tab: 'add' (Tambah Anak), 'school' (Data Sekolah), 'edit' (Edit Data)
  const [activeTab, setActiveTab] = useState<'add' | 'school' | 'edit'>('add')
  
  const [loadingData, setLoadingData] = useState(false)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null)

  // --- STATE DATA ANAK ---
  const [schools, setSchools] = useState<School[]>([])
  
  // State khusus Tab Edit (Pencarian)
  const [childList, setChildList] = useState<ChildOption[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [selectedEditId, setSelectedEditId] = useState<string | null>(null)
  
  const [form, setForm] = useState<Child>({
    nama: '', gender: 'Putra', usia: 11, asalSekolah: '', minatBakat: ''
  })
  const [mftText, setMftText] = useState('')
  
  // --- STATE DATA SEKOLAH ---
  const [newSchoolName, setNewSchoolName] = useState('')
  const [schoolEdits, setSchoolEdits] = useState<Record<string, string>>({})

  // Helper Toast
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Reset Form
  const resetForm = () => {
    setForm({ nama: '', gender: 'Putra', usia: 11, asalSekolah: '', minatBakat: '' })
    setMftText('')
    setSelectedEditId(null)
    setSearchQuery('')
  }

  // Effect: Handle URL Params (jika akses via /edit-data/:id)
  useEffect(() => {
    if (id) {
      setActiveTab('edit')
      setSelectedEditId(id)
    }
  }, [id])

  // Effect: Reset form saat ganti tab
  useEffect(() => {
    if (activeTab === 'add') {
      resetForm()
      // Hapus ID dari URL jika ada, agar bersih (opsional)
      if (id) navigate('/tambah-data')
    }
  }, [activeTab])

  // 1. Load Daftar Sekolah & Daftar Anak (Untuk Search)
  useEffect(() => {
    if (!currentUser) return
    
    // Load Schools
    const qSchools = query(collection(db, 'users', currentUser.uid, 'schools'), orderBy('nama', 'asc'))
    const unsubSchools = onSnapshot(qSchools, (snap) => {
      const rows: School[] = []
      snap.forEach(d => rows.push({ id: d.id, ...(d.data() as any) }))
      setSchools(rows)
      const edits: Record<string,string> = {}
      rows.forEach(r => edits[r.id] = r.nama)
      setSchoolEdits(edits)
    })

    // Load Children List (Hanya field penting untuk search agar ringan)
    const qChildren = query(collection(db, 'users', currentUser.uid, 'children'), orderBy('nama', 'asc'))
    const unsubChildren = onSnapshot(qChildren, (snap) => {
      const rows: ChildOption[] = []
      snap.forEach(d => {
        const data = d.data()
        rows.push({ id: d.id, nama: data.nama, asalSekolah: data.asalSekolah })
      })
      setChildList(rows)
    })

    return () => { unsubSchools(); unsubChildren() }
  }, [currentUser])

  // 2. Load Data Anak Detail (Triggered by selectedEditId)
  useEffect(() => {
    if (!currentUser || !selectedEditId) return

    setLoadingData(true)
    getDoc(doc(db, 'users', currentUser.uid, 'children', selectedEditId))
      .then((snap) => {
        if (snap.exists()) {
          const data = snap.data() as Child
          setForm({
            nama: data.nama, gender: data.gender, usia: data.usia, asalSekolah: data.asalSekolah,
            ltbt: zeroToUndef(data.ltbt), lbb: zeroToUndef(data.lbb),
            lt: zeroToUndef(data.lt), lk: zeroToUndef(data.lk),
            l40m: zeroToUndef(data.l40m), mftLevel: zeroToUndef(data.mftLevel),
            mftShuttle: zeroToUndef(data.mftShuttle),
            tinggiBadan: zeroToUndef(data.tinggiBadan), tinggiDuduk: zeroToUndef(data.tinggiDuduk),
            beratBadan: zeroToUndef(data.beratBadan), rentangLangan: zeroToUndef(data.rentangLangan),
            minatBakat: data.minatBakat || ''
          })
          if (data.mftLevel && data.mftShuttle) setMftText(`${data.mftLevel}.${data.mftShuttle}`)
          // Set search query agar user tau siapa yg diedit
          setSearchQuery(data.nama)
        } else {
          showToast('Data tidak ditemukan', 'error')
          setSelectedEditId(null)
        }
      })
      .finally(() => setLoadingData(false))
  }, [currentUser, selectedEditId])

  // Filter Pencarian
  const filteredChildren = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    return childList.filter(c => c.nama.toLowerCase().includes(q) || c.asalSekolah.toLowerCase().includes(q)).slice(0, 8)
  }, [searchQuery, childList])

  // --- LOGIKA SIMPAN (ADD / UPDATE) ---
  async function handleSaveChild(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUser) return

    // ✅ VALIDASI USIA (11 - 15 TAHUN)
    if (form.usia < 11 || form.usia > 15) {
      showToast('Usia harus antara 11 - 15 tahun (sesuai norma penilaian).', 'error')
      return
    }

    // Validasi MFT
    let mftL = form.mftLevel, mftS = form.mftShuttle
    if (mftText.trim()) {
      const p = parseMft(mftText)
      if (p.error) { showToast(p.error, 'error'); return }
      mftL = p.level; mftS = p.shuttle
    }

    const payload = {
      ...form,
      ltbt: n0(form.ltbt), lbb: n0(form.lbb), lt: n0(form.lt),
      lk: n0(form.lk), l40m: n0(form.l40m),
      mftLevel: n0(mftL), mftShuttle: n0(mftS),
      tinggiBadan: n0(form.tinggiBadan), tinggiDuduk: n0(form.tinggiDuduk),
      beratBadan: n0(form.beratBadan), rentangLangan: n0(form.rentangLangan),
      updatedAt: serverTimestamp()
    }

    setBusy(true)
    try {
      if (activeTab === 'edit' && selectedEditId) {
        // MODE EDIT
        await updateDoc(doc(db, 'users', currentUser.uid, 'children', selectedEditId), payload)
        showToast('Data berhasil diperbarui!')
      } else {
        // MODE TAMBAH
        await addDoc(collection(db, 'users', currentUser.uid, 'children'), {
          ...payload, createdAt: serverTimestamp()
        })
        showToast('Data baru berhasil ditambahkan!')
        resetForm() // Bersihkan form setelah tambah
      }
    } catch (err) {
      console.error(err)
      showToast('Gagal menyimpan data.', 'error')
    } finally {
      setBusy(false)
    }
  }

  // --- LOGIKA HAPUS ANAK ---
  async function handleDeleteChild() {
    if (activeTab !== 'edit' || !selectedEditId || !currentUser) return
    if (!window.confirm(`Yakin ingin menghapus data "${form.nama}"?`)) return

    setBusy(true)
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'children', selectedEditId))
      showToast('Data anak dihapus.')
      resetForm()
    } catch (e) {
      showToast('Gagal menghapus data.', 'error')
    } finally {
      setBusy(false)
    }
  }

  // --- LOGIKA SEKOLAH ---
  async function addSchool() {
    if (!newSchoolName.trim() || !currentUser) return
    setBusy(true)
    try {
      await addDoc(collection(db, 'users', currentUser.uid, 'schools'), {
        nama: newSchoolName.trim(), createdAt: serverTimestamp()
      })
      setNewSchoolName('')
      showToast('Sekolah ditambahkan.')
    } catch (e) { showToast('Gagal menambah sekolah.', 'error') }
    setBusy(false)
  }

  async function updateSchool(sId: string) {
    if (!currentUser) return
    const newName = schoolEdits[sId]?.trim()
    if (!newName) return
    const oldSchool = schools.find(s => s.id === sId)
    if (!oldSchool || oldSchool.nama === newName) return

    setBusy(true)
    try {
      await updateDoc(doc(db, 'users', currentUser.uid, 'schools', sId), { nama: newName })
      const qChildren = query(collection(db, 'users', currentUser.uid, 'children'), where('asalSekolah', '==', oldSchool.nama))
      const snap = await getDocs(qChildren)
      const batch = writeBatch(db)
      snap.docs.forEach(d => batch.update(d.ref, { asalSekolah: newName }))
      await batch.commit()
      showToast('Nama sekolah & data anak terkait diperbarui.')
    } catch (e) { showToast('Gagal update sekolah.', 'error') }
    setBusy(false)
  }

  async function deleteSchool(sId: string, sName: string) {
    if(!currentUser || !window.confirm(`Hapus sekolah "${sName}"?`)) return
    setBusy(true)
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'schools', sId))
      showToast('Sekolah dihapus.')
    } catch(e) { showToast('Gagal hapus.', 'error') }
    setBusy(false)
  }

  // --- UI COMPONENTS ---
  const inputCls = "w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition placeholder:text-slate-400"
  const labelCls = "block text-sm font-semibold text-slate-700 mb-1.5"
  
  const pageTitle = activeTab === 'add' ? "Tambah Data Baru" : activeTab === 'edit' ? "Edit / Hapus Data" : "Kelola Sekolah"

  return (
    <AppLayout title={pageTitle}>
      {/* Header & Navigation */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* 3 Tab Switcher Modern */}
        <div className="flex p-1 bg-slate-100 rounded-xl self-start md:self-center border border-slate-200 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('add')}
            className={`
              flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap
              ${activeTab === 'add' 
                ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }
            `}
          >
            <UserPlus size={16} />
            Data Anak
          </button>
          <button
            onClick={() => setActiveTab('school')}
            className={`
              flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap
              ${activeTab === 'school' 
                ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }
            `}
          >
            <IconSchool size={16} />
            Data Sekolah
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`
              flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 whitespace-nowrap
              ${activeTab === 'edit' 
                ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }
            `}
          >
            <Edit2 size={16} />
            Edit Data
          </button>
        </div>

        {/* Tombol Lihat Tabel (Tanpa Ikon, Rata Tengah) */}
        <Link 
          to="/data-anak" 
          className="
            group flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl 
            border border-slate-300 bg-white text-slate-700 
            text-sm font-semibold shadow-sm 
            hover:bg-slate-50 hover:border-slate-400 hover:text-primary 
            transition-all duration-200 whitespace-nowrap
          "
        >
          Lihat Tabel
        </Link>
      </div>

      {/* =======================
          SECTION 1: DATA ANAK (ADD ONLY)
         ======================= */}
      {activeTab === 'add' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
          <div className="lg:col-span-1 space-y-6">
            <IdentitasCard form={form} setForm={setForm} schools={schools} labelCls={labelCls} inputCls={inputCls} />
            <div className="hidden lg:block sticky top-6">
              <SaveButton busy={busy} isEdit={false} onClick={handleSaveChild} />
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <AntropometriCard form={form} setForm={setForm} />
            <HasilTesCard form={form} setForm={setForm} mftText={mftText} setMftText={setMftText} labelCls={labelCls} inputCls={inputCls} />
            <div className="block lg:hidden pt-4">
              <SaveButton busy={busy} isEdit={false} onClick={handleSaveChild} />
            </div>
          </div>
        </div>
      )}

      {/* =======================
          SECTION 2: DATA SEKOLAH
         ======================= */}
      {activeTab === 'school' && (
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
          <div className="card p-8 bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-sm">
            <h3 className="font-bold text-lg mb-4 text-blue-900 flex items-center gap-2">
              <Plus size={20} className="text-blue-600" />
              Tambah Sekolah Baru
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                className="w-full rounded-xl border border-blue-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition"
                placeholder="Masukkan nama sekolah baru..."
                value={newSchoolName}
                onChange={e => setNewSchoolName(e.target.value)}
              />
              <button 
                onClick={addSchool}
                disabled={!newSchoolName.trim() || busy}
                className="btn-primary rounded-xl px-8 py-3 shrink-0 font-bold shadow-blue-200 hover:shadow-blue-300"
              >
                Tambah
              </button>
            </div>
          </div>

          <div className="card overflow-hidden shadow-sm">
            <div className="p-5 border-b bg-slate-50 font-semibold flex justify-between items-center text-slate-700">
              <span>Daftar Sekolah Terdaftar</span>
              <span className="bg-white px-2 py-1 rounded-md border text-xs shadow-sm">{schools.length} sekolah</span>
            </div>
            <div className="divide-y max-h-[60vh] overflow-y-auto bg-white">
              {schools.map((s, idx) => (
                <div key={s.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-slate-50 transition group">
                  <div className="text-slate-400 w-8 font-mono text-sm text-center">{idx + 1}.</div>
                  <div className="grow relative">
                    <input 
                      className="w-full bg-transparent border border-transparent rounded-lg px-3 py-2 text-slate-800 font-medium focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition"
                      value={schoolEdits[s.id] || ''}
                      onChange={e => setSchoolEdits({...schoolEdits, [s.id]: e.target.value})}
                    />
                    <Edit2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-slate-400 transition-colors" />
                  </div>
                  <div className="flex gap-2 shrink-0 sm:opacity-50 group-hover:opacity-100 transition-opacity">
                    {schoolEdits[s.id] !== s.nama && (
                      <button 
                        onClick={() => updateSchool(s.id)}
                        className="flex items-center gap-1 px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200 transition"
                      >
                        <CheckCircle size={14} /> Simpan
                      </button>
                    )}
                    <button 
                      onClick={() => deleteSchool(s.id, s.nama)}
                      className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition"
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  </div>
                </div>
              ))}
              {schools.length === 0 && (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                    <AlertCircle size={32} />
                  </div>
                  <p>Belum ada data sekolah.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =======================
          SECTION 3: EDIT DATA (SEARCH & EDIT)
         ======================= */}
      {activeTab === 'edit' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* SEARCH BAR - FIXED Z-INDEX */}
          <div className="card p-4 bg-blue-50 border-blue-100 relative z-50">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input 
                className="w-full rounded-xl border border-blue-200 pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                placeholder="Cari nama anak untuk diedit..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); setSelectedEditId(null); }}
                onFocus={() => setSearchOpen(true)}
              />
              
              {/* Dropdown Search Results - Menumpuk Form di Bawah */}
              {searchOpen && searchQuery && !selectedEditId && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl z-[100] max-h-60 overflow-auto divide-y">
                  {filteredChildren.length > 0 ? (
                    filteredChildren.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setSelectedEditId(c.id)
                          setSearchQuery(c.nama) // Update input text
                          setSearchOpen(false)
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition flex flex-col group"
                      >
                        <span className="font-medium text-slate-800 group-hover:text-primary">{c.nama}</span>
                        <span className="text-xs text-slate-500">{c.asalSekolah}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500">Tidak ditemukan.</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* FORM EDIT - Hanya muncul jika selectedEditId ada */}
          {selectedEditId && !loadingData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn relative z-0">
              {/* Kolom Kiri */}
              <div className="lg:col-span-1 space-y-6">
                <IdentitasCard form={form} setForm={setForm} schools={schools} labelCls={labelCls} inputCls={inputCls} />
                <div className="hidden lg:block sticky top-6 space-y-3">
                  <SaveButton busy={busy} isEdit={true} onClick={handleSaveChild} />
                  <button 
                    onClick={handleDeleteChild}
                    className="w-full flex items-center justify-center gap-2 py-3.5 text-base rounded-xl font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 transition-all"
                  >
                    <Trash2 size={20} /> Hapus Data
                  </button>
                </div>
              </div>
              {/* Kolom Kanan */}
              <div className="lg:col-span-2 space-y-6">
                <AntropometriCard form={form} setForm={setForm} />
                <HasilTesCard form={form} setForm={setForm} mftText={mftText} setMftText={setMftText} labelCls={labelCls} inputCls={inputCls} />
                
                <div className="block lg:hidden pt-4 space-y-3">
                  <SaveButton busy={busy} isEdit={true} onClick={handleSaveChild} />
                  <button 
                    onClick={handleDeleteChild}
                    className="w-full flex items-center justify-center gap-2 py-3.5 text-base rounded-xl font-bold text-red-600 bg-red-50 border border-red-100 hover:bg-red-100"
                  >
                    <Trash2 size={20} /> Hapus Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Empty State untuk Tab Edit */}
          {!selectedEditId && !loadingData && (
            <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Cari nama anak di atas untuk mulai mengedit.</p>
            </div>
          )}
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl animate-fadeIn z-[100] flex items-center gap-3 border font-medium ${
          toast.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {toast.msg}
        </div>
      )}
    </AppLayout>
  )
}

// --- SUB COMPONENTS AGAR KODE LEBIH RAPI ---

function IdentitasCard({ form, setForm, schools, labelCls, inputCls }: any) {
  return (
    <div className="card p-6 border-t-4 border-t-primary shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-primary font-bold text-sm">1</div>
        <h3 className="text-lg font-bold text-slate-800">Identitas Diri</h3>
      </div>
      <div className="space-y-5">
        <div>
          <label className={labelCls}>Nama Lengkap</label>
          <input className={inputCls} placeholder="Masukkan nama siswa..." value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} />
        </div>
        <div>
          <label className={labelCls}>Asal Sekolah</label>
          <select className={inputCls} value={form.asalSekolah} onChange={e => setForm({...form, asalSekolah: e.target.value})}>
            <option value="">-- Pilih Sekolah --</option>
            {schools.map((s: any) => <option key={s.id} value={s.nama}>{s.nama}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Gender</label>
            <select className={inputCls} value={form.gender} onChange={e => setForm({...form, gender: e.target.value as Gender})}>
              <option value="Putra">Putra</option>
              <option value="Putri">Putri</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Usia (Tahun)</label>
            <input 
              type="number" 
              min={11} 
              max={15} 
              className={inputCls} 
              value={form.usia} 
              onChange={e => setForm({...form, usia: Number(e.target.value)})} 
              placeholder="11-15"
            />
            {/* Helper Text untuk Rentang Usia */}
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <AlertCircle size={10} /> Rentang: 11 - 15 tahun
            </p>
          </div>
        </div>
        <div>
          <label className={labelCls}>Minat & Bakat</label>
          <textarea rows={4} className={inputCls} placeholder="Contoh: Tertarik pada sepak bola..." value={form.minatBakat} onChange={e => setForm({...form, minatBakat: e.target.value})} />
        </div>
      </div>
    </div>
  )
}

function AntropometriCard({ form, setForm }: any) {
  return (
    <div className="card p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-sm">2</div>
        <h3 className="text-lg font-bold text-slate-800">Data Antropometri</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <InputGroup label="Tinggi Badan (cm)" val={form.tinggiBadan} setVal={v => setForm({...form, tinggiBadan: v})} />
        <InputGroup label="Tinggi Duduk (cm)" val={form.tinggiDuduk} setVal={v => setForm({...form, tinggiDuduk: v})} />
        <InputGroup label="Berat Badan (kg)" val={form.beratBadan} setVal={v => setForm({...form, beratBadan: v})} />
        <InputGroup label="Rentang Lengan (cm)" val={form.rentangLangan} setVal={v => setForm({...form, rentangLangan: v})} />
      </div>
    </div>
  )
}

function HasilTesCard({ form, setForm, mftText, setMftText, labelCls, inputCls }: any) {
  return (
    <div className="card p-6 border-t-4 border-t-accent shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
        <div className="w-8 h-8 rounded-full bg-cyan-50 flex items-center justify-center text-accent font-bold text-sm">3</div>
        <h3 className="text-lg font-bold text-slate-800">Hasil Tes Sport Search</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
        <InputGroup label="Lempar Tangkap Bola Tenis (kali)" val={form.ltbt} setVal={v => setForm({...form, ltbt: v})} />
        <InputGroup label="Lempar Bola Basket (m)" val={form.lbb} setVal={v => setForm({...form, lbb: v})} />
        <InputGroup label="Loncat Tegak (cm)" val={form.lt} setVal={v => setForm({...form, lt: v})} />
        <InputGroup label="Lari Kelincahan (detik)" val={form.lk} setVal={v => setForm({...form, lk: v})} />
        <InputGroup label="Lari 40 Meter (detik)" val={form.l40m} setVal={v => setForm({...form, l40m: v})} />
        <div>
          <label className={labelCls}>Lari Multitahap (Level.Shuttle)</label>
          <input type="text" placeholder="Cth: 6.2" className={inputCls} value={mftText} onChange={e => setMftText(e.target.value)} />
          <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1"><AlertCircle size={12} /> Format: Level titik Shuttle</p>
        </div>
      </div>
    </div>
  )
}

function SaveButton({ busy, isEdit, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      disabled={busy}
      className={`
        w-full flex items-center justify-center gap-2 py-3.5 text-base rounded-xl font-bold text-white shadow-lg transition-all duration-200
        ${busy ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-blue-700 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0'}
      `}
    >
      {busy ? 'Menyimpan...' : <><Save size={20} /> {isEdit ? 'Simpan Perubahan' : 'Simpan Data Baru'}</>}
    </button>
  )
}

function InputGroup({ label, val, setVal }: { label: string, val?: number, setVal: (v: number) => void }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <input 
          type="number" step="0.01"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-accent focus:ring-4 focus:ring-accent/10 transition placeholder:text-slate-300"
          value={val ?? ''}
          onChange={e => setVal(e.target.value === '' ? 0 : Number(e.target.value))}
          placeholder="0"
        />
      </div>
    </div>
  )
}