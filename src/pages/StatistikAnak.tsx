// src/pages/StatistikAnak.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { doc, onSnapshot, collection, query, orderBy } from 'firebase/firestore'
import { db } from '../firebase'
import AppLayout from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { computeScoresAndRecommend, DEFAULT_RECO_THRESHOLD, type Gender } from '../lib/norma'
import ValueScoreCard from '../components/ValueScoreCard'
import TopRecommendationsCard from '../components/TopRecommendationsCard'
import RadarScoreCard from '../components/RadarScoreCard'
import { Search, User } from 'lucide-react'

type ChildDoc = {
  id: string
  nama: string
  gender: Gender
  usia: number
  ltbt?: number
  lbb?: number
  lt?: number
  lk?: number
  l40m?: number
  mftLevel?: number
  mftShuttle?: number
  tinggiBadan?: number
  tinggiDuduk?: number
  beratBadan?: number
  rentangLangan?: number
  asalSekolah?: string
  minatBakat?: string
}

export default function StatistikAnak() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  
  const [child, setChild] = useState<ChildDoc | null>(null)
  const [childrenList, setChildrenList] = useState<ChildDoc[]>([])
  const [loading, setLoading] = useState(true)
  
  // State untuk Search Bar (Sinkronisasi)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const radarCardRef = useRef<any>(null)

  // 1. Fetch Semua Anak untuk Search Bar (Urut Abjad)
  useEffect(() => {
    if (!currentUser) return
    const q = query(collection(db, 'users', currentUser.uid, 'children'), orderBy('nama', 'asc'))
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ChildDoc))
      setChildrenList(list)
      setLoading(false)
    })
    return () => unsub()
  }, [currentUser])

  // 2. Sinkronisasi Data Anak Terpilih (dari URL)
  useEffect(() => {
    if (!currentUser || !id) {
      setChild(null)
      setSearchQuery('')
      return
    }
    const unsub = onSnapshot(doc(db, 'users', currentUser.uid, 'children', id), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as ChildDoc
        setChild({ ...data, id: snap.id })
        setSearchQuery(data.nama) // Otomatis terisi nama jika ada ID di URL
      }
    })
    return () => unsub()
  }, [currentUser, id])

  // Filter pencarian dropdown
  const filteredResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return []
    return childrenList.filter(c => c.nama.toLowerCase().includes(q))
  }, [searchQuery, childrenList])

  const calc = useMemo(() => {
    if (!child) return null
    return computeScoresAndRecommend({
      gender: child.gender,
      usia: child.usia,
      ltbt: child.ltbt,
      lbb: child.lbb,
      lt: child.lt,
      lk: child.lk,
      l40m: child.l40m,
      mftLevel: child.mftLevel,
      mftShuttle: child.mftShuttle,
    })
  }, [child])

  return (
    <AppLayout title="Analisis Statistik Bakat">
      <div className="space-y-6">
        
        {/* --- SEARCH BAR (Desain Mirip Komparasi) --- */}
        <div className="card p-4 bg-white border border-slate-200 shadow-sm relative z-50">
          <div className="relative w-full max-w-lg mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition text-sm font-medium"
              placeholder="Cari nama anak..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setIsSearchOpen(true)
              }}
              onFocus={() => setIsSearchOpen(true)}
            />
            
            {isSearchOpen && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl z-[100] max-h-60 overflow-auto divide-y">
                {filteredResults.length > 0 ? (
                  filteredResults.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        navigate(`/statistik-anak/${c.id}`)
                        setIsSearchOpen(false)
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 transition flex flex-col group"
                    >
                      <span className="font-semibold text-slate-800 group-hover:text-primary transition-colors">{c.nama}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">{c.asalSekolah || 'Sekolah Belum Terdata'}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-slate-500 italic text-center">Data anak tidak ditemukan.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* --- TAMPILAN DATA --- */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 animate-pulse">Menghubungkan ke database...</div>
        ) : !child ? (
          <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <div className="max-w-xs mx-auto space-y-3">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-slate-300">
                <User size={32} />
              </div>
              <p className="text-slate-500 font-semibold italic">Silakan cari dan pilih nama anak di atas untuk menampilkan analisis.</p>
            </div>
          </div>
        ) : (
          <div className="animate-fadeIn space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1) PROFIL SINGKAT */}
              <div className="card p-6 flex flex-col gap-6 rounded-2xl">
                <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                  <h3 className="font-bold text-slate-800">Profil Peserta</h3>
                  <Link to="/data-anak" className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-lg text-slate-600 hover:bg-slate-200 transition-colors">DETAIL TABEL</Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <BItem label="Nama Lengkap" value={child.nama} />
                  <BItem label="Jenis Kelamin" value={child.gender} />
                  <BItem label="Usia" value={`${child.usia} Tahun`} />
                  <BItem label="Sekolah" value={child.asalSekolah} />
                  <BItem label="Tinggi" value={child.tinggiBadan ? `${child.tinggiBadan} cm` : undefined} />
                  <BItem label="Berat" value={child.beratBadan ? `${child.beratBadan} kg` : undefined} />
                </div>
              </div>

              {/* 2) RADAR CHART */}
              {calc && (
                <RadarScoreCard
                  ref={radarCardRef}
                  scores={calc.scores}
                  recCount={calc.meta.recommendedCount}
                  minatBakat={child.minatBakat}
                />
              )}
            </div>

            {calc && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 3) SKOR INDIKATOR */}
                <ValueScoreCard
                  values={{
                    ltbt: child.ltbt,
                    lbb: child.lbb,
                    lt: child.lt,
                    lk: child.lk,
                    l40m: child.l40m,
                    mftLevel: child.mftLevel,
                    mftShuttle: child.mftShuttle,
                  }}
                  scores={calc.scores}
                />

                {/* 4) TOP 6 REKOMENDASI */}
                <TopRecommendationsCard
                  recommendations={calc.recommended}
                  limit={6}
                  thresholdPct={Math.round((calc.meta?.threshold ?? DEFAULT_RECO_THRESHOLD) * 100)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}

function BItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="bg-slate-50/50 rounded-xl px-3 py-2.5 border border-slate-100">
      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">{label}</div>
      <div className="text-sm font-bold text-slate-700 truncate">{value ?? <span className="text-slate-300 font-normal">Belum diisi</span>}</div>
    </div>
  )
}