// src/pages/StatistikAnak.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import AppLayout from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { computeScoresAndRecommend, DEFAULT_RECO_LIMIT, DEFAULT_RECO_THRESHOLD, type Gender } from '../lib/norma'
import ValueScoreCard from '../components/ValueScoreCard'
import TopRecommendationsCard from '../components/TopRecommendationsCard'
import RadarScoreCard from '../components/RadarScoreCard'

type ChildDoc = {
  nama: string
  gender: Gender
  usia: number
  // indikator
  ltbt?: number
  lbb?: number
  lt?: number
  lk?: number
  l40m?: number
  mftLevel?: number
  mftShuttle?: number
  // biodata
  tinggiBadan?: number
  tinggiDuduk?: number
  beratBadan?: number
  rentangLangan?: number
  // sekolah
  asalSekolah?: string
  // Minat dan Bakat
  minatBakat?: string
}

export default function StatistikAnak() {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const [child, setChild] = useState<ChildDoc | null>(null)
  const [loading, setLoading] = useState(true)

  // Sinkron tinggi Biodata = tinggi kartu Radar
  const radarCardRef = useRef<HTMLDivElement | null>(null)
  const [radarHeight, setRadarHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (!radarCardRef.current) return
    const el = radarCardRef.current
    const measure = () => setRadarHeight(el.offsetHeight)
    const ro = new ResizeObserver(() => measure())
    ro.observe(el)
    measure()
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  useEffect(() => {
    (async () => {
      if (!currentUser || !id) return
      setLoading(true)
      const ref = doc(db, 'users', currentUser.uid, 'children', id)
      const snap = await getDoc(ref)
      if (snap.exists()) setChild(snap.data() as ChildDoc)
      setLoading(false)
    })()
  }, [currentUser, id])

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
    <AppLayout title="Statistik Anak">
      {loading && (
        <div className="min-h-[40vh] grid place-items-center text-slate-500">Memuat…</div>
      )}

      {!loading && !child && (
        <div className="card p-6 text-slate-600 rounded-2xl">
          Data anak tidak ditemukan. <Link className="text-primary font-medium" to="/data-anak">Kembali ke Data Anak</Link>
        </div>
      )}

      {!loading && child && calc && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header ringkas */}
          <div className="card p-4 flex flex-wrap items-center gap-4 rounded-2xl">
            <Link to="/data-anak" className="btn-ghost rounded-2xl">← Kembali</Link>
            <div className="grow">
              <div className="text-lg font-bold">{child.nama}</div>
              <div className="text-sm text-slate-600">
                {child.gender} • Usia {child.usia}{child.asalSekolah ? ` • ${child.asalSekolah}` : ''}
              </div>
            </div>
          </div>

          {/* ===== Grid 2x2 ===== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1) BIODATA — tinggi = tinggi kartu Radar */}
            <div
              className="card p-0 overflow-hidden flex flex-col rounded-2xl"
              style={radarHeight ? { height: radarHeight } : undefined}
            >
              <div className="px-4 py-3 border-b font-semibold text-center">Biodata</div>
              <div className="p-4 flex-1 overflow-auto">
                <dl className="grid grid-cols-1 gap-3 text-sm">
                  <BItem label="Nama" value={child.nama} />
                  <BItem label="Gender" value={child.gender} />
                  <BItem label="Usia" value={fmt(child.usia, 'tahun')} />
                  <BItem label="Asal Sekolah" value={child.asalSekolah ?? '—'} />
                  <BItem label="Tinggi Badan" value={fmt(child.tinggiBadan, 'cm')} />
                  <BItem label="Tinggi Duduk" value={fmt(child.tinggiDuduk, 'cm')} />
                  <BItem label="Berat Badan" value={fmt(child.beratBadan, 'kg')} />
                  <BItem label="Rentang Langan" value={fmt(child.rentangLangan, 'cm')} />
                </dl>
              </div>
            </div>

            {/* 2) PROFIL SKOR (RADAR) */}
            <RadarScoreCard
              ref={radarCardRef}
              scores={calc.scores}
              recCount={calc.meta.recommendedCount}
              minatBakat={child.minatBakat}
            />


            {/* 3) NILAI & SKOR */}
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

            {/* 4) REKOMENDASI (Top-6) */}
            <TopRecommendationsCard
              recommendations={calc.recommended}
              limit={DEFAULT_RECO_LIMIT}
              thresholdPct={Math.round((calc.meta?.threshold ?? DEFAULT_RECO_THRESHOLD) * 100)}
            />
          </div>
        </div>
      )}
    </AppLayout>
  )
}

/* ===== Helper kecil ===== */
function BItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="bg-slate-50 rounded-2xl px-3 py-2 border border-slate-200">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-slate-800">{value ?? <span className="text-slate-400">—</span>}</div>
    </div>
  )
}
function fmt(v?: number, unit?: string) {
  if (v == null) return undefined
  return unit ? `${v} ${unit}` : String(v)
}
