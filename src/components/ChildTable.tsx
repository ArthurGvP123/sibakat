// src/components/ChildTable.tsx
import { useEffect, useMemo, useState, useRef } from 'react'
import {
  addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query,
  serverTimestamp, updateDoc, getDocs, where, writeBatch
} from 'firebase/firestore'
import { Link } from 'react-router-dom'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { Search } from 'lucide-react'
import * as XLSX from 'xlsx'

// ✅ NEW: pakai mesin norma + rekomendasi untuk klasifikasi berbasis jumlah rekomendasi
import {
  computeScoresAndRecommend,
  // DEFAULT_RECO_LIMIT,
  DEFAULT_RECO_THRESHOLD,
  type Gender,
} from '../lib/norma'

// ✅ NEW: gunakan komponen badge klasifikasi yang sudah mendukung recCount
import PotentialClassification from '../components/PotentialClassification'

type Child = {
  id?: string
  nama: string
  gender: Gender
  usia: number
  asalSekolah: string

  // Indikator (opsional)
  ltbt?: number
  lbb?: number
  lt?: number
  lk?: number
  l40m?: number
  mftLevel?: number
  mftShuttle?: number

  // Biodata tambahan (opsional)
  tinggiBadan?: number
  tinggiDuduk?: number
  beratBadan?: number
  rentangLangan?: number

  // Minat dan Bakat (opsional)
  minatBakat?: string

  createdAt?: any
  updatedAt?: any
}

type School = {
  id: string
  nama: string
  createdAt?: any
}

type ModalMode = 'addChild' | 'addSchool' | 'editByName' | 'editSchool' | null

function clsx(...xs: (string | false | undefined | null)[]) {
  return xs.filter(Boolean).join(' ')
}

// -------- util parsing VO₂ Max "L.S" --------
function parseMft(text: string): { level?: number; shuttle?: number; error?: string } {
  const raw = (text || '').trim()
  if (!raw) return { level: undefined, shuttle: undefined }
  const norm = raw.replace(',', '.').replace(/\s+/g, '')
  const m = norm.match(/^(\d{1,2})\.(\d{1,2})$/)
  if (!m) return { error: 'Format VO₂ Max harus L.S, contoh 5.3' }
  const level = Number(m[1])
  const shuttle = Number(m[2])
  if (!(level >= 1 && level <= 11)) return { error: 'Level VO₂ Max harus 1–11.' }
  if (!(shuttle >= 1 && shuttle <= 11)) return { error: 'Shuttle VO₂ Max harus 1–11.' }
  return { level, shuttle }
}

// --- Format tampilan tabel
function fmt(v?: number) {
  if (v == null || v === 0) return '—'
  return String(v)
}
function fmtMft(level?: number, shuttle?: number) {
  if (!level || !shuttle) return '—'
  return `${level}.${shuttle}`
}

const n0 = (v?: number) => (v == null || Number.isNaN(v) ? 0 : Number(v))
const zeroToUndef = (v?: number) => (v == null || v === 0 ? undefined : v)

// === NEW: helper klasifikasi label dari jumlah rekomendasi (untuk ekspor Excel)
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
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState<ModalMode>(null)
  const [editing, setEditing] = useState<Child | null>(null)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Helper boolean
  const isAddSchool = mode === 'addSchool'
  const isAddChild = mode === 'addChild'
  const isEditByName = mode === 'editByName'
  const isEditSchool = mode === 'editSchool'

  // Popover "Tambah Data"
  const [addMenuOpen, setAddMenuOpen] = useState(false)
  const addMenuRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    function onDocClick(ev: MouseEvent) {
      if (!addMenuRef.current) return
      if (!addMenuRef.current.contains(ev.target as Node)) setAddMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  // Popover "Edit Data"
  const [editMenuOpen, setEditMenuOpen] = useState(false)
  const editMenuRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    function onDocClick(ev: MouseEvent) {
      if (!editMenuRef.current) return
      if (!editMenuRef.current.contains(ev.target as Node)) setEditMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  // state form anak
  const [form, setForm] = useState<Child>({
    nama: '',
    gender: 'Putra',
    usia: 11,
    asalSekolah: '',
    minatBakat: '',
  })
  const [mftText, setMftText] = useState('')
  const [mftError, setMftError] = useState<string | null>(null)

  // state form sekolah (add)
  const [schoolName, setSchoolName] = useState('')
  const [schoolDupError, setSchoolDupError] = useState<string | null>(null)

  // state edit sekolah (inline)
  const [schoolEdits, setSchoolEdits] = useState<Record<string, string>>({})
  const [schoolBusyId, setSchoolBusyId] = useState<string | null>(null)
  useEffect(() => {
    const m: Record<string, string> = {}
    schools.forEach(s => { m[s.id] = s.nama })
    setSchoolEdits(m)
  }, [schools])

  // Edit-by-name helper + saran
  const [nameQuery, setNameQuery] = useState('')
  const [suggestOpen, setSuggestOpen] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const suggestRef = useRef<HTMLDivElement | null>(null)
  const nameInputRef = useRef<HTMLInputElement | null>(null)

  // close suggestion on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!suggestRef.current) return
      if (!suggestRef.current.contains(e.target as Node) && e.target !== nameInputRef.current) {
        setSuggestOpen(false)
        setActiveSuggestion(-1)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  // Validasi nama unik (hint realtime)
  const [nameDupError, setNameDupError] = useState<string | null>(null)

  const inputCls =
    'w-full rounded-2xl border border-slate-300 bg-slate-100 px-3 py-2 text-slate-800 ' +
    'placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50'

  // Kunci scroll body saat modal/confirm terbuka
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmMsg, setConfirmMsg] = useState<string>('')

  // Konfirmasi khusus hapus sekolah
  const [confirmSchoolOpen, setConfirmSchoolOpen] = useState(false)
  const [confirmSchoolMsg, setConfirmSchoolMsg] = useState<string>('')
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null)

  useEffect(() => {
    if (mode || confirmOpen || confirmSchoolOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [mode, confirmOpen, confirmSchoolOpen])

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
    }, (err) => {
      console.error(err); setLoading(false)
    })
    return () => unsub()
  }, [currentUser])

  // Load schools
  useEffect(() => {
    if (!currentUser) return
    const colRef = collection(db, 'users', currentUser.uid, 'schools')
    const qSchools = query(colRef, orderBy('nama', 'asc'))
    const unsub = onSnapshot(qSchools, (snap) => {
      const rows: School[] = []
      snap.forEach((d) => rows.push({ id: d.id, ...(d.data() as any) }))
      setSchools(rows)
    }, (err) => {
      console.error(err)
    })
    return () => unsub()
  }, [currentUser])

  // Daftar nama utk saran (urut alfabet)
  const nameOptions = useMemo(() => {
    return [...items].sort((a, b) =>
      a.nama.localeCompare(b.nama, 'id', { sensitivity: 'base' })
    )
  }, [items])

  const nameHints = useMemo(() => {
    const q = nameQuery.trim().toLowerCase()
    const src = nameOptions
    const filtered = q
      ? src.filter(it => it.nama.toLowerCase().startsWith(q))
      : src
    return filtered.slice(0, 10)
  }, [nameOptions, nameQuery])

  // Filter tabel (pencarian by nama, sekolah)
  const filtered = useMemo(() => {
    const key = search.trim().toLowerCase()
    if (!key) return items
    return items.filter(it =>
      it.nama.toLowerCase().includes(key) ||
      (it.asalSekolah || '').toLowerCase().includes(key)
    )
  }, [items, search])

  function nameExists(name: string, excludeId?: string) {
    const n = name.trim().toLowerCase()
    return items.some(it => it.nama.trim().toLowerCase() === n && it.id !== excludeId)
  }

  function schoolExists(nm: string) {
    const n = nm.trim().toLowerCase()
    return schools.some(s => (s.nama || '').trim().toLowerCase() === n)
  }

  // Update hint nama unik
  useEffect(() => {
    if (!mode) return
    const dup = form.nama.trim()
      ? nameExists(form.nama, editing?.id)
      : false
    setNameDupError(dup ? 'Nama anak sudah terdaftar. Gunakan nama yang berbeda.' : null)
  }, [form.nama, editing, items, mode])

  // Update hint duplikasi sekolah
  useEffect(() => {
    if (!isAddSchool) return
    const dup = schoolName.trim() && schoolExists(schoolName)
    setSchoolDupError(dup ? 'Nama sekolah sudah ada.' : null)
  }, [schoolName, isAddSchool, schools])

  function resetForm() {
    setForm({
      nama: '',
      gender: 'Putra',
      usia: 11,
      asalSekolah: '',
      ltbt: undefined,
      lbb: undefined,
      lt: undefined,
      lk: undefined,
      l40m: undefined,
      mftLevel: undefined,
      mftShuttle: undefined,
      tinggiBadan: undefined,
      tinggiDuduk: undefined,
      beratBadan: undefined,
      rentangLangan: undefined,
      minatBakat: undefined,
    })
    setMftText('')
    setMftError(null)
    setNameDupError(null)
  }

  // Menus
  function openAddMenu() { setAddMenuOpen(v => !v) }
  function chooseAddSchool() {
    setAddMenuOpen(false)
    setMode('addSchool')
    setSchoolName('')
    setSchoolDupError(null)
  }
  function chooseAddChild() {
    setAddMenuOpen(false)
    setMode('addChild')
    setEditing(null)
    resetForm()
  }

  function openEditMenu() { setEditMenuOpen(v => !v) }
  function chooseEditSchool() {
    setEditMenuOpen(false)
    setMode('editSchool')
  }
  function chooseEditChild() {
    setEditMenuOpen(false)
    setMode('editByName')
    setEditing(null)
    setNameQuery('')
    resetForm()
  }

  function loadByExactName(targetName: string) {
    const q = targetName.trim().toLowerCase()
    if (!q) { setToast('Masukkan nama anak terlebih dahulu.'); return }
    const found = items.find(it => it.nama.trim().toLowerCase() === q)
    if (!found) { setToast('Nama tidak ditemukan. Pastikan ejaannya tepat.'); return }
    setEditing(found)
    setForm({
      nama: found.nama ?? '',
      gender: found.gender ?? 'Putra',
      usia: found.usia ?? 11,
      asalSekolah: found.asalSekolah ?? '',
      ltbt: zeroToUndef(found.ltbt),
      lbb: zeroToUndef(found.lbb),
      lt: zeroToUndef(found.lt),
      lk: zeroToUndef(found.lk),
      l40m: zeroToUndef(found.l40m),
      mftLevel: zeroToUndef(found.mftLevel),
      mftShuttle: zeroToUndef(found.mftShuttle),
      tinggiBadan: zeroToUndef(found.tinggiBadan),
      tinggiDuduk: zeroToUndef(found.tinggiDuduk),
      beratBadan: zeroToUndef(found.beratBadan),
      rentangLangan: zeroToUndef(found.rentangLangan),
        minatBakat: found.minatBakat ?? '',
    })
    setMftText(
      found.mftLevel && found.mftShuttle ? `${found.mftLevel}.${found.mftShuttle}` : ''
    )
    setMftError(null)
  }
  function tryLoadByName() { loadByExactName(nameQuery) }

  function closeModal() {
    setMode(null)
    setEditing(null)
    setNameQuery('')
    setMftText('')
    setMftError(null)
    setNameDupError(null)
    setSchoolName('')
    setSchoolDupError(null)
  }

  function validateBasic(f: Child, mftTextValue: string) {
    if (!f.nama.trim()) return 'Nama wajib diisi.'
    if (!['Putra', 'Putri'].includes(f.gender)) return 'Gender tidak valid.'
    if (!(f.usia >= 11 && f.usia <= 15)) return 'Usia harus 11–15.'
    if (!f.asalSekolah || !f.asalSekolah.trim()) return 'Asal sekolah wajib dipilih.'

    const inRange = (v: number | undefined, min: number, max: number) =>
      v == null || (v >= min && v <= max)

    if (!inRange(f.tinggiBadan, 50, 300)) return 'Tinggi badan di luar rentang wajar.'
    if (!inRange(f.tinggiDuduk, 30, 200)) return 'Tinggi duduk di luar rentang wajar.'
    if (!inRange(f.beratBadan, 10, 200)) return 'Berat badan di luar rentang wajar.'
    if (!inRange(f.rentangLangan, 50, 300)) return 'Rentang langan di luar rentang wajar.'

    if (mftTextValue.trim()) {
      const parsed = parseMft(mftTextValue)
      if (parsed.error) return parsed.error
    }
    if (f.mftLevel != null && f.mftLevel !== 0 && (f.mftLevel < 1 || f.mftLevel > 11)) return 'Level VO₂ Max harus 1–11.'
    if (f.mftShuttle != null && f.mftShuttle !== 0 && (f.mftShuttle < 1 || f.mftShuttle > 11)) return 'Shuttle VO₂ Max harus 1–11.'
    return null
  }

  async function onSubmitChild(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUser) { setToast('Sesi login tidak ditemukan.'); return }

    // Guard: nama harus unik
    const cleanedName = form.nama.trim()
    if (isAddChild) {
      if (nameExists(cleanedName)) { setToast('Nama anak sudah ada. Gunakan nama yang berbeda.'); return }
    } else if (isEditByName) {
      if (!editing?.id) { setToast('Pilih/masukkan nama anak yang akan diedit terlebih dahulu.'); return }
      if (cleanedName.toLowerCase() !== (editing.nama || '').trim().toLowerCase()) {
        if (nameExists(cleanedName, editing.id)) { setToast('Nama anak sudah ada. Gunakan nama yang berbeda.'); return }
      }
    }

    // MFT dari mftText
    let nextMftLevel = form.mftLevel
    let nextMftShuttle = form.mftShuttle
    if (mftText.trim()) {
      const parsed = parseMft(mftText)
      if (parsed.error) { setToast(parsed.error); return }
      nextMftLevel = parsed.level
      nextMftShuttle = parsed.shuttle
    }

    const draft: Child = {
      ...form,
      nama: cleanedName,
      asalSekolah: form.asalSekolah.trim(),
      mftLevel: nextMftLevel,
      mftShuttle: nextMftShuttle
    }

    const err = validateBasic(draft, mftText)
    if (err) { setToast(err); return }

    const payload: Child = {
      ...draft,
      ltbt: n0(draft.ltbt),
      lbb: n0(draft.lbb),
      lt: n0(draft.lt),
      lk: n0(draft.lk),
      l40m: n0(draft.l40m),
      mftLevel: n0(draft.mftLevel),
      mftShuttle: n0(draft.mftShuttle),
      tinggiBadan: n0(draft.tinggiBadan),
      tinggiDuduk: n0(draft.tinggiDuduk),
      beratBadan: n0(draft.beratBadan),
      rentangLangan: n0(draft.rentangLangan),
      minatBakat: draft.minatBakat ?? '',
    }

    setBusy(true)
    try {
      if (isAddChild) {
        const colRef = collection(db, 'users', currentUser.uid, 'children')
        await addDoc(colRef, {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
        setToast('Data anak berhasil ditambahkan.')
        // Jangan tutup modal, reset form saja
        resetForm()
      } else if (isEditByName) {
        const docRef = doc(db, 'users', currentUser.uid, 'children', editing!.id!)
        await updateDoc(docRef, {
          ...payload,
          updatedAt: serverTimestamp(),
        })
        setToast('Data anak berhasil diperbarui.')
        // Jangan tutup modal, form tetap terbuka untuk edit data lain
      }
    } catch (err: any) {
      console.error(err)
      setToast(`Gagal menyimpan data anak: ${err?.message ?? 'unknown error'}`)
    } finally {
      setBusy(false)
    }
  }

  async function onSubmitSchool(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUser) { setToast('Sesi login tidak ditemukan.'); return }
    const nm = schoolName.trim()
    if (!nm) { setToast('Nama sekolah wajib diisi.'); return }
    if (schoolExists(nm)) { setToast('Nama sekolah sudah ada.'); return }
    setBusy(true)
    try {
      const colRef = collection(db, 'users', currentUser.uid, 'schools')
      await addDoc(colRef, { nama: nm, createdAt: serverTimestamp() })
      setToast('Nama sekolah ditambahkan.')
      // Jangan tutup modal, reset form saja
      setSchoolName('')
      setSchoolDupError(null)
    } catch (err: any) {
      console.error(err)
      setToast(`Gagal menambah sekolah: ${err?.message ?? 'unknown error'}`)
    } finally {
      setBusy(false)
    }
  }

  async function renameSchool(id: string) {
    if (!currentUser) { setToast('Sesi login tidak ditemukan.'); return }
    const old = schools.find(s => s.id === id)
    if (!old) return
    const newName = (schoolEdits[id] ?? '').trim()
    if (!newName) { setToast('Nama sekolah wajib diisi.'); return }
    if (newName === old.nama) { setToast('Tidak ada perubahan nama.'); return }
    if (schoolExists(newName)) { setToast('Nama sekolah sudah ada.'); return }

    try {
      setSchoolBusyId(id)
      // 1) Update dokumen sekolah
      const schoolRef = doc(db, 'users', currentUser.uid, 'schools', id)
      await updateDoc(schoolRef, { nama: newName })

      // 2) Cascade ke anak yang memakai asalSekolah lama
      const childrenRef = collection(db, 'users', currentUser.uid, 'children')
      const qChildren = query(childrenRef, where('asalSekolah', '==', old.nama))
      const qs = await getDocs(qChildren)
      if (!qs.empty) {
        const batch = writeBatch(db)
        qs.forEach(d => {
          batch.update(d.ref, { asalSekolah: newName, updatedAt: serverTimestamp() })
        })
        await batch.commit()
      }
      setToast('Nama sekolah diperbarui.')
      // Jangan tutup modal, tetap di halaman edit sekolah
    } catch (err: any) {
      console.error(err)
      setToast(`Gagal memperbarui sekolah: ${err?.message ?? 'unknown error'}`)
    } finally {
      setSchoolBusyId(null)
    }
  }

  // === Konfirmasi custom hapus sekolah ===
  function onAskDeleteSchool(sc: School) {
    const affected = items.filter(ch => (ch.asalSekolah || '') === sc.nama).length
    setSchoolToDelete(sc)
    setConfirmSchoolMsg(
      affected > 0
        ? `Hapus sekolah “${sc.nama}”? Terdapat ${affected} data anak yang saat ini menunjuk ke sekolah ini. Data anak TIDAK dihapus.`
        : `Hapus sekolah “${sc.nama}”? Tindakan ini tidak dapat dibatalkan.`
    )
    setConfirmSchoolOpen(true)
  }

  async function doDeleteSchool() {
    if (!currentUser || !schoolToDelete) { setConfirmSchoolOpen(false); return }
    try {
      setSchoolBusyId(schoolToDelete.id)
      await deleteDoc(doc(db, 'users', currentUser.uid, 'schools', schoolToDelete.id))
      setToast('Sekolah dihapus.')
    } catch (err: any) {
      console.error(err)
      setToast(`Gagal menghapus sekolah: ${err?.message ?? 'unknown error'}`)
    } finally {
      setSchoolBusyId(null)
      setConfirmSchoolOpen(false)
      setSchoolToDelete(null)
    }
  }

  function onAskDelete() {
    if (!editing) return
    setConfirmMsg(`Hapus data “${editing.nama}”? Tindakan ini tidak dapat dibatalkan.`)
    setConfirmOpen(true)
  }
  async function doDelete() {
    if (!currentUser || !editing?.id) { setConfirmOpen(false); return }
    try {
      const docRef = doc(db, 'users', currentUser.uid, 'children', editing.id)
      await deleteDoc(docRef)
      setToast('Data anak terhapus.')
      setConfirmOpen(false)
      // Jangan tutup modal, reset form untuk edit data lain
      setEditing(null)
      setNameQuery('')
      resetForm()
    } catch (e) {
      console.error(e)
      setToast('Gagal menghapus data.')
      setConfirmOpen(false)
    }
  }

  // ===== Helper kalkulasi norma + rekomendasi per-row =====
  function calcForRow(row: Child) {
    return computeScoresAndRecommend({
      gender: row.gender,
      usia: row.usia,
      ltbt: row.ltbt,
      lbb: row.lbb,
      lt: row.lt,
      lk: row.lk,
      l40m: row.l40m,
      mftLevel: row.mftLevel,
      mftShuttle: row.mftShuttle,
    })
  }

  // total kolom: Nama, Asal Sekolah, Gender, Usia, 4 biodata, 6 indikator, Minat & Bakat, Klasifikasi, Aksi = 17
  const COLS = 17

  function renderKlasifikasi(row: Child) {
    const calc = calcForRow(row)
    const recCount = calc.meta?.recommendedCount ?? 0
    return (
      <PotentialClassification
        recCount={recCount}
        scores={calc.scores}   // opsional: agar konsisten dengan tampilan lain jika breakdown dipakai
        align="center"
      />
    )
  }

  // ===== Ekspor Excel =====
  function handleExportExcel() {
    try {
      const rows = filtered.map((r) => {
        const calc = calcForRow(r)
        const recCount = calc.meta?.recommendedCount ?? 0
        const label = labelFromRecCount(recCount)
        const thresholdPct = Math.round((calc.meta?.threshold ?? DEFAULT_RECO_THRESHOLD) * 100)
        const topNames = (calc.top ?? []).map(t => t.sport).join(', ')
        const s = calc.scores
        const breakdown =
          `${s.ltbt ?? '–'}-${s.lbb ?? '–'}-${s.lt ?? '–'}-${s.lk ?? '–'}-${s.l40m ?? '–'}-${s.mft ?? '–'}`

        return {
          'Nama': r.nama,
          'Asal Sekolah': r.asalSekolah || '—',
          'Gender': r.gender,
          'Usia': r.usia,
          'Tinggi Badan (cm)': fmt(r.tinggiBadan),
          'Tinggi Duduk (cm)': fmt(r.tinggiDuduk),
          'Berat Badan (kg)': fmt(r.beratBadan),
          'Rentang Langan (cm)': fmt(r.rentangLangan),

          'Koordinasi (LTBT)': fmt(r.ltbt),
          'Lempar Bola Basket (LBB) (m)': fmt(r.lbb),
          'Power Tungkai (LT) (cm)': fmt(r.lt),
          'Lari Bolak-Balik 5 m (dt)': fmt(r.lk),
          'Lari 40 m (dt)': fmt(r.l40m),
          'VO₂ Max (Lv.Sh)': fmtMft(r.mftLevel, r.mftShuttle),

          // ✅ NEW: pakai skor norma (1–5) sebagai breakdown opsional
          'Rincian Skor Norma (LTBT-LBB-LT-LK-L40M-MFT)': breakdown,

          // ✅ NEW: klasifikasi berbasis jumlah rekomendasi
          'Ambang Rekomendasi (%)': thresholdPct,
          'Jumlah Rekomendasi (≥ ambang)': recCount,
          'Minat dan Bakat': r.minatBakat || '—',
          'Klasifikasi (baru)': label,
          'Top Rekomendasi': topNames || '—',
        }
      })

      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Data Anak')

      const now = new Date()
      const pad = (n: number) => String(n).padStart(2, '0')
      const fname = `data-anak_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}.xlsx`

      XLSX.writeFile(wb, fname)
      setToast('Ekspor Excel dimulai…')
    } catch (e) {
      console.error(e)
      setToast('Gagal mengekspor Excel.')
    }
  }

  return (
    <div className="animate-fadeIn">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <input
            className="input pl-9 rounded-2xl"
            placeholder="Cari nama atau sekolah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Ekspor */}
          <button
            className="rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-blue-50 px-3 py-2 disabled:opacity-50"
            onClick={handleExportExcel}
            disabled={loading || filtered.length === 0}
            title="Ekspor data yang sedang tampil ke Excel"
          >
            Ekspor Excel
          </button>

          {/* Tambah Data (popover) */}
          <div className="relative" ref={addMenuRef}>
            <button className="btn-primary rounded-2xl" onClick={openAddMenu}>+ Tambah Data</button>
            {addMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border bg-white shadow-lg overflow-hidden z-[60]">
                <button
                  className="w-full text-left px-3 py-2 hover:bg-slate-50"
                  onClick={chooseAddSchool}
                >
                  Tambah Sekolah
                </button>
                <button
                  className="w-full text-left px-3 py-2 hover:bg-slate-50"
                  onClick={chooseAddChild}
                >
                  Tambah Data Anak
                </button>
              </div>
            )}
          </div>

          {/* Edit Data (popover) */}
          <div className="relative" ref={editMenuRef}>
            <button
              className="rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-blue-50 px-3 py-2"
              onClick={openEditMenu}
            >
              Edit Data
            </button>
            {editMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border bg-white shadow-lg overflow-hidden z-[60]">
                <button
                  className="w-full text-left px-3 py-2 hover:bg-slate-50"
                  onClick={chooseEditSchool}
                >
                  Edit Data Sekolah
                </button>
                <button
                  className="w-full text-left px-3 py-2 hover:bg-slate-50"
                  onClick={chooseEditChild}
                >
                  Edit Data Anak
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 card p-0 rounded-2xl overflow-hidden">
        <table
          className="
            w-full table-fixed
            text-[8px] sm:text-[9px] md:text-[10px] leading-[1.1]
          "
        >
          <thead className="bg-blue-50 text-slate-700">
            <tr className="align-middle">
              {/* Biodata */}
              <th className="px-1.5 py-5 text-center align-middle break-words">Nama</th>
              <th className="px-1.5 py-5 text-center align-middle break-words">Asal Sekolah</th>
              <th className="px-1.5 py-5 text-center align-middle break-words">Gender</th>
              <th className="px-1.5 py-5 text-center align-middle break-words">Usia</th>
              <th className="px-1.5 py-5 text-center align-middle break-words">Tinggi<br/>Badan</th>
              <th className="px-1.5 py-5 text-center align-middle break-words">Tinggi<br/>Duduk</th>
              <th className="px-1.5 py-5 text-center align-middle break-words">Berat<br/>Badan</th>
              <th className="px-1.5 py-5 text-center align-middle break-words">Rentang<br/>Langan</th>

              {/* Indikator */}
              <th className="px-1.5 py-5 text-center align-middle break-words">Koordinasi</th>
              <th className="px-1.5 py-5 text-center align-middle break-words">Lempar Bola Basket</th>
              <th className="px-1.5 py-5 text-center align-middle break-words">Power Tungkai</th>
              <th className="px-1.5 py-5 text-center align-middle break-words">Lari Bolak-Balik 5m</th>
              <th className="px-1.5 py-5 text-center align-middle break-words">Lari 40 Meter</th>
              <th className="px-1.5 py-5 text-center align-middle break-words">VO₂ Max</th>

              {/* Klasifikasi */}
              <th className="px-1.5 py-5 text-center align-middle break-words">Klasifikasi</th>

              {/* Aksi */}
              <th className="px-1.5 py-5 text-center align-middle break-words">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {!currentUser && (
              <tr className="align-middle">
                <td colSpan={COLS} className="px-2 py-5 text-center align-middle text-slate-500">
                  Silakan login untuk melihat data.
                </td>
              </tr>
            )}
            {currentUser && loading && (
              <tr className="align-middle">
                <td colSpan={COLS} className="px-2 py-5 text-center align-middle text-slate-500">Memuat data…</td>
              </tr>
            )}
            {currentUser && !loading && filtered.length === 0 && (
              <tr className="align-middle">
                <td colSpan={COLS} className="px-2 py-5 text-center align-middle text-slate-500">
                  Belum ada data. Klik <span className="font-semibold">“Tambah Data”</span> untuk mulai.
                </td>
              </tr>
            )}
            {currentUser && filtered.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 align-middle">
                {/* Biodata */}
                <td className="px-1.5 py-5 text-center align-middle font-medium">{row.nama}</td>
                <td className="px-1.5 py-5 text-center align-middle">{row.asalSekolah || '—'}</td>
                <td className="px-1.5 py-5 text-center align-middle">{row.gender}</td>
                <td className="px-1.5 py-5 text-center align-middle">{row.usia} th</td>
                <td className="px-1.5 py-5 text-center align-middle">{fmt(row.tinggiBadan)}</td>
                <td className="px-1.5 py-5 text-center align-middle">{fmt(row.tinggiDuduk)}</td>
                <td className="px-1.5 py-5 text-center align-middle">{fmt(row.beratBadan)}</td>
                <td className="px-1.5 py-5 text-center align-middle">{fmt(row.rentangLangan)}</td>

                {/* Indikator */}
                <td className="px-1.5 py-5 text-center align-middle">{fmt(row.ltbt)}</td>
                <td className="px-1.5 py-5 text-center align-middle">{fmt(row.lbb)}</td>
                <td className="px-1.5 py-5 text-center align-middle">{fmt(row.lt)}</td>
                <td className="px-1.5 py-5 text-center align-middle">{fmt(row.lk)}</td>
                <td className="px-1.5 py-5 text-center align-middle">{fmt(row.l40m)}</td>
                <td className="px-1.5 py-5 text-center align-middle">{fmtMft(row.mftLevel, row.mftShuttle)}</td>

                {/* Klasifikasi (baru) */}
                <td className="text-center align-middle">
                  {renderKlasifikasi(row)}
                </td>

                {/* Aksi */}
                <td className="px-1.5 py-5 text-center align-middle">
                  {row.id ? (
                    <Link
                      to={`/data-anak/${row.id}`}
                      className="btn-ghost text-[9px] px-1.5 py-1.5 h-6 text-primary hover:bg-blue-50 rounded-2xl"
                      title="Lihat statistik anak"
                    >
                      View
                    </Link>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-4 right-4 z-[60] rounded-2xl bg-slate-900 text-white px-4 py-2 shadow-lg animate-fadeIn"
          onAnimationEnd={() => { setTimeout(() => setToast(null), 2500) }}
        >
          {toast}
        </div>
      )}

      {/* Modal: AddSchool / AddChild / Edit By Name / Edit School */}
      {mode && (
        <>
          {/* Overlay (klik di luar tidak menutup modal) */}
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-[2px]"
          />

          {/* Dialog container */}
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              className="w-full max-w-[820px] max-h-[90vh] rounded-2xl border border-slate-200 bg-slate-50 shadow-xl flex flex-col overflow-hidden animate-fadeIn"
              onClick={(e)=>e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-10 flex items-center justify-between">
                <h3 id="modal-title" className="text-lg font-bold text-slate-800">
                  {isAddSchool ? 'Tambah Sekolah' :
                   isAddChild ? 'Tambah Data Anak' :
                   isEditSchool ? 'Edit Data Sekolah' : 'Edit Data Anak'}
                </h3>
                <button
                  aria-label="Tutup"
                  onClick={closeModal}
                  className="btn-ghost rounded-2xl text-xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Body */}
              <div className="px-5 py-4 overflow-y-auto bg-slate-50">
                {isAddSchool && (
                  <form className="grid grid-cols-1 gap-4" onSubmit={onSubmitSchool} id="school-form">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-slate-700">
                        Nama Sekolah <span className="text-red-600">*</span>
                      </label>
                      <input
                        className={clsx(
                          inputCls,
                          schoolDupError && 'border-red-400 focus:ring-red-200 focus:border-red-400'
                        )}
                        value={schoolName}
                        onChange={(e)=>setSchoolName(e.target.value)}
                        onBlur={(e)=>setSchoolName(e.target.value.trim())}
                        required
                        aria-invalid={!!schoolDupError}
                        placeholder="Contoh: SDN 01 Cendekia"
                      />
                      {schoolDupError && (
                        <p className="mt-1 text-xs text-red-600">{schoolDupError}</p>
                      )}
                      <p className="mt-2 text-xs text-slate-500">
                        Sekolah akan menjadi opsi pada kolom <em>Asal Sekolah</em> saat menambah/mengedit data anak.
                      </p>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button type="button" className="btn-ghost rounded-2xl" onClick={closeModal}>Batal</button>
                      <button
                        type="submit"
                        className={clsx('btn-primary rounded-2xl', busy && 'opacity-70 pointer-events-none', schoolDupError && 'opacity-60 pointer-events-none')}
                        disabled={busy || !!schoolDupError}
                      >
                        {busy ? 'Menyimpan…' : 'Simpan'}
                      </button>
                    </div>
                  </form>
                )}

                {isEditSchool && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                      Kamu bisa memperbaiki penulisan nama sekolah. Saat disimpan, nama sekolah
                      yang baru akan <b>mengganti</b> asal sekolah pada semua anak yang masih memakai nama lama.
                    </p>

                    <div className="overflow-auto rounded-2xl border border-slate-200 bg-white">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="text-left px-3 py-2 w-10">No</th>
                            <th className="text-left px-3 py-2">Nama Sekolah</th>
                            <th className="text-right px-3 py-2 w-60">Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {schools.length === 0 && (
                            <tr>
                              <td colSpan={3} className="px-3 py-3 text-center text-slate-500">
                                Belum ada sekolah. Tambahkan lewat menu <b>Tambah Data → Tambah Sekolah</b>.
                              </td>
                            </tr>
                          )}
                          {schools.map((s, i) => (
                            <tr key={s.id} className="border-t">
                              <td className="px-3 py-2">{i + 1}</td>
                              <td className="px-3 py-2">
                                <input
                                  className={inputCls}
                                  value={schoolEdits[s.id] ?? ''}
                                  onChange={(e)=>setSchoolEdits(m => ({ ...m, [s.id]: e.target.value }))}
                                  onBlur={(e)=>setSchoolEdits(m => ({ ...m, [s.id]: e.target.value.trim() }))}
                                />
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    className={clsx('btn-ghost text-red-600 hover:bg-red-50 rounded-2xl',
                                      schoolBusyId === s.id && 'opacity-60 pointer-events-none')}
                                    onClick={()=>onAskDeleteSchool(s)}
                                    disabled={schoolBusyId === s.id}
                                  >
                                    Hapus
                                  </button>
                                  <button
                                    className={clsx('btn-primary rounded-2xl',
                                      schoolBusyId === s.id && 'opacity-60 pointer-events-none')}
                                    onClick={()=>renameSchool(s.id)}
                                    disabled={schoolBusyId === s.id}
                                  >
                                    {schoolBusyId === s.id ? 'Menyimpan…' : 'Simpan'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-end">
                      <button type="button" className="btn-ghost rounded-2xl" onClick={closeModal}>Tutup</button>
                    </div>
                  </div>
                )}

                {!isAddSchool && !isEditSchool && (
                  <>
                    {isEditByName && (
                      <div className="mb-4 grid sm:grid-cols-[1fr_auto] gap-2 items-center">
                        <div>
                          <label className="block text-sm font-medium mb-1 text-slate-700">
                            Masukkan / pilih nama anak untuk diedit
                          </label>
                          <div className="relative">
                            <input
                              ref={nameInputRef}
                              className={inputCls}
                              value={nameQuery}
                              onChange={(e)=>{ setNameQuery(e.target.value); setSuggestOpen(true); setActiveSuggestion(-1) }}
                              onFocus={()=>setSuggestOpen(true)}
                              onKeyDown={(e)=>{
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  if (activeSuggestion >= 0 && nameHints[activeSuggestion]) {
                                    setNameQuery(nameHints[activeSuggestion].nama)
                                    setSuggestOpen(false)
                                    setActiveSuggestion(-1)
                                  } else {
                                    tryLoadByName()
                                  }
                                } else if (e.key === 'ArrowDown') {
                                  e.preventDefault()
                                  setActiveSuggestion(i => Math.min(i + 1, nameHints.length - 1))
                                } else if (e.key === 'ArrowUp') {
                                  e.preventDefault()
                                  setActiveSuggestion(i => Math.max(i - 1, 0))
                                } else if (e.key === 'Escape') {
                                  setSuggestOpen(false)
                                  setActiveSuggestion(-1)
                                }
                              }}
                            />

                            {suggestOpen && nameHints.length > 0 && (
                              <div ref={suggestRef} className="absolute z-50 mt-1 w-full rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                                {nameHints.map((it, idx) => (
                                  <button
                                    key={it.id}
                                    type="button"
                                    onClick={() => { setNameQuery(it.nama); setSuggestOpen(false); setActiveSuggestion(-1) }}
                                    className={clsx(
                                      'w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50',
                                      idx === activeSuggestion && 'bg-blue-50 text-primary'
                                    )}
                                  >
                                    {it.nama}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            Gunakan ejaan yang persis seperti pada tabel.
                          </p>
                        </div>
                        <button className="btn-primary h-[42px] self-center rounded-2xl" onClick={tryLoadByName}>Muat Data</button>
                      </div>
                    )}

                    <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={onSubmitChild} id="child-form">
                      {/* === BIODATA === */}
                      <div className="sm:col-span-2 mt-1">
                        <div className="font-semibold text-slate-700">Biodata</div>
                        <p className="text-xs text-slate-500">Data fisik dan identitas anak.</p>
                      </div>

                      {/* Nama */}
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-1 text-slate-700">
                          Nama <span className="text-red-600">*</span>
                        </label>
                        <input
                          className={clsx(
                            inputCls,
                            nameDupError && 'border-red-400 focus:ring-red-200 focus:border-red-400'
                          )}
                          value={form.nama}
                          onChange={(e)=>setForm(f=>({ ...f, nama: e.target.value }))}
                          onBlur={(e)=>setForm(f=>({ ...f, nama: e.target.value.trim() }))}
                          required
                          aria-invalid={!!nameDupError}
                        />
                        {nameDupError && (
                          <p className="mt-1 text-xs text-red-600">{nameDupError}</p>
                        )}
                      </div>

                      {/* Asal Sekolah (Wajib) */}
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium mb-1 text-slate-700">
                          Asal Sekolah <span className="text-red-600">*</span>
                        </label>
                        <select
                          className={inputCls}
                          value={form.asalSekolah}
                          onChange={(e)=>setForm(f=>({ ...f, asalSekolah: e.target.value }))}
                          required
                        >
                          <option value="" disabled>Pilih sekolah…</option>
                          {schools.map(s => (
                            <option key={s.id} value={s.nama}>{s.nama}</option>
                          ))}
                        </select>
                        {schools.length === 0 && (
                          <p className="mt-1 text-xs text-amber-600">
                            Belum ada data sekolah. Tambahkan lewat tombol <b>Tambah Data → Tambah Sekolah</b>.
                          </p>
                        )}
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">
                          Gender <span className="text-red-600">*</span>
                        </label>
                        <select
                          className={inputCls}
                          value={form.gender}
                          onChange={(e)=>setForm(f=>({ ...f, gender: e.target.value as Gender }))}
                        >
                          <option value="Putra">Putra</option>
                          <option value="Putri">Putri</option>
                        </select>
                      </div>

                      {/* Usia */}
                      <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">
                          Usia (tahun) <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="number" min={11} max={15}
                          className={inputCls}
                          value={form.usia}
                          onChange={(e)=>setForm(f=>({ ...f, usia: Number(e.target.value) }))}
                          required
                        />
                      </div>

                      {/* Empat biodata tambahan */}
                      <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Tinggi Badan (cm)</label>
                        <input
                          type="number" min={0} step="0.01"
                          className={inputCls}
                          value={form.tinggiBadan ?? ''}
                          onChange={(e)=>setForm(f=>({ ...f, tinggiBadan: e.target.value === '' ? undefined : Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Tinggi Duduk (cm)</label>
                        <input
                          type="number" min={0} step="0.01"
                          className={inputCls}
                          value={form.tinggiDuduk ?? ''}
                          onChange={(e)=>setForm(f=>({ ...f, tinggiDuduk: e.target.value === '' ? undefined : Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Berat Badan (kg)</label>
                        <input
                          type="number" min={0} step="0.01"
                          className={inputCls}
                          value={form.beratBadan ?? ''}
                          onChange={(e)=>setForm(f=>({ ...f, beratBadan: e.target.value === '' ? undefined : Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Rentang Langan (cm)</label>
                        <input
                          type="number" min={0} step="0.01"
                          className={inputCls}
                          value={form.rentangLangan ?? ''}
                          onChange={(e)=>setForm(f=>({ ...f, rentangLangan: e.target.value === '' ? undefined : Number(e.target.value) }))}
                        />
                      </div>

                      {/* === INDIKATOR === */}
                      <div className="sm:col-span-2 mt-2">
                        <div className="font-semibold text-slate-700">Indikator</div>
                        <p className="text-xs text-slate-500">Data yang akan menjadi indikator rekomendasi cabang olahraga.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Koordinasi (kali)</label>
                        <input
                          type="number" min={0} step={1}
                          className={inputCls}
                          value={form.ltbt ?? ''}
                          onChange={(e)=>setForm(f=>({ ...f, ltbt: e.target.value === '' ? undefined : Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Lempar Bola Basket (meter)</label>
                        <input
                          type="number" min={0} step="0.01"
                          className={inputCls}
                          value={form.lbb ?? ''}
                          onChange={(e)=>setForm(f=>({ ...f, lbb: e.target.value === '' ? undefined : Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Power Tungkai (cm)</label>
                        <input
                          type="number" min={0} step={1}
                          className={inputCls}
                          value={form.lt ?? ''}
                          onChange={(e)=>setForm(f=>({ ...f, lt: e.target.value === '' ? undefined : Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Lari Bolak-Balik 5 Meter (detik)</label>
                        <input
                          type="number" min={0} step="0.01"
                          className={inputCls}
                          value={form.lk ?? ''}
                          onChange={(e)=>setForm(f=>({ ...f, lk: e.target.value === '' ? undefined : Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Lari 40 Meter (detik)</label>
                        <input
                          type="number" min={0} step="0.01"
                          className={inputCls}
                          value={form.l40m ?? ''}
                          onChange={(e)=>setForm(f=>({ ...f, l40m: e.target.value === '' ? undefined : Number(e.target.value) }))}
                        />
                      </div>

                      {/* VO₂ Max gabungan: "L.S" */}
                      <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">VO₂ Max (level, shuttle)</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="contoh: 5.3"
                          className={clsx(inputCls, !!mftError && 'border-red-400 focus:ring-red-200 focus:border-red-400')}
                          value={mftText}
                          onChange={(e) => {
                            const v = e.target.value
                            setMftText(v)
                            const parsed = parseMft(v)
                            if (parsed.error) {
                              setMftError(parsed.error)
                              setForm(f => ({ ...f, mftLevel: undefined, mftShuttle: undefined }))
                            } else {
                              setMftError(null)
                              setForm(f => ({ ...f, mftLevel: parsed.level, mftShuttle: parsed.shuttle }))
                            }
                          }}
                        />
                        {mftError && <p className="mt-1 text-xs text-red-600">{mftError}</p>}
                      </div>

                        {/* Minat dan Bakat */}
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium mb-1 text-slate-700">Minat dan Bakat</label>
                          <textarea
                            className={inputCls}
                            rows={4}
                            value={form.minatBakat ?? ''}
                            onChange={(e) => setForm(f => ({ ...f, minatBakat: e.target.value }))}
                            onBlur={(e) => setForm(f => ({ ...f, minatBakat: e.target.value.trim() }))}
                            placeholder="Contoh: Tertarik pada voli, musik, atau seni rupa"
                          />
                        </div>

                      <div className="sm:col-span-2 mt-2 flex items-center justify-end gap-2">
                        {isEditByName && editing?.id && (
                          <button
                            type="button"
                            className="btn-ghost text-red-600 hover:bg-red-50 rounded-2xl"
                            onClick={onAskDelete}
                          >
                            Hapus
                          </button>
                        )}
                        <button type="button" className="btn-ghost rounded-2xl" onClick={closeModal}>Batal</button>
                        <button
                          type="submit"
                          className={clsx(
                            'btn-primary rounded-2xl',
                            busy && 'opacity-70 pointer-events-none',
                            (isEditByName && !editing?.id) && 'opacity-60 pointer-events-none',
                            nameDupError && 'opacity-60 pointer-events-none',
                            schools.length === 0 && 'opacity-60 pointer-events-none'
                          )}
                          disabled={busy || (isEditByName && !editing?.id) || !!nameDupError || schools.length === 0}
                        >
                          {isAddChild ? (busy ? 'Menyimpan…' : 'Simpan') : (busy ? 'Memperbarui…' : 'Perbarui')}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Confirm Dialog: Hapus Anak */}
      {confirmOpen && (
        <>
          <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-[2px]" />
          <div className="fixed inset-0 z-[71] flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl animate-fadeIn overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="font-semibold text-slate-800">Konfirmasi Hapus</div>
                <button className="btn-ghost rounded-2xl text-xl font-bold" onClick={()=>setConfirmOpen(false)} aria-label="Tutup">×</button>
              </div>
              <div className="px-5 py-4 text-slate-700">{confirmMsg}</div>
              <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50">
                <button className="btn-ghost rounded-2xl" onClick={()=>setConfirmOpen(false)}>Batal</button>
                <button className="btn-ghost text-red-600 hover:bg-red-50 rounded-2xl" onClick={doDelete}>Hapus</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Confirm Dialog: Hapus Sekolah (custom) */}
      {confirmSchoolOpen && (
        <>
          <div className="fixed inset-0 z-[72] bg-slate-900/60 backdrop-blur-[2px]" />
          <div className="fixed inset-0 z-[73] flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl animate-fadeIn overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="font-semibold text-slate-800">Konfirmasi Hapus Sekolah</div>
                <button className="btn-ghost rounded-2xl text-xl font-bold" onClick={()=>setConfirmSchoolOpen(false)} aria-label="Tutup">×</button>
              </div>
              <div className="px-5 py-4 text-slate-700">{confirmSchoolMsg}</div>
              <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50">
                <button className="btn-ghost rounded-2xl" onClick={()=>setConfirmSchoolOpen(false)}>Batal</button>
                <button
                  className={clsx('btn-ghost text-red-600 hover:bg-red-50 rounded-2xl',
                    schoolBusyId && 'opacity-60 pointer-events-none')}
                  onClick={doDeleteSchool}
                  disabled={!!schoolBusyId}
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

