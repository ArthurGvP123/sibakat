// src/pages/KomparasiStatistik.tsx
import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, orderBy, query, doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import AppLayout from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import { Search } from 'lucide-react'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts'
import { computeScoresAndRecommend, type Gender } from '../lib/norma'
import TopRecommendationsCard from '../components/TopRecommendationsCard'
import PotentialClassification from '../components/PotentialClassification'

type Child = {
  id: string
  nama: string
  gender: Gender
  usia: number
  asalSekolah?: string
  ltbt?: number
  lbb?: number
  lt?: number
  lk?: number
  l40m?: number
  mftLevel?: number
  mftShuttle?: number
}

type CalcResult = ReturnType<typeof computeScoresAndRecommend> | null

export default function KomparasiStatistik() {
  const { currentUser } = useAuth()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)

  const [selA, setSelA] = useState<string | null>(null)
  const [selB, setSelB] = useState<string | null>(null)

  const [childA, setChildA] = useState<Child | null>(null)
  const [childB, setChildB] = useState<Child | null>(null)

  const [calcA, setCalcA] = useState<CalcResult>(null)
  const [calcB, setCalcB] = useState<CalcResult>(null)

  useEffect(() => {
    if (!currentUser) return
    setLoading(true)
    const colRef = collection(db, 'users', currentUser.uid, 'children')
    const qy = query(colRef, orderBy('createdAt', 'desc'))
    const unsub = onSnapshot(qy, (snap) => {
      const rows: Child[] = []
      snap.forEach((d) => rows.push({ id: d.id, ...(d.data() as any) }))
      setChildren(rows)
      setLoading(false)
    }, () => setLoading(false))
    return () => unsub()
  }, [currentUser])

  async function fetchChildById(id: string | null): Promise<Child | null> {
    if (!currentUser || !id) return null
    const ref = doc(db, 'users', currentUser.uid, 'children', id)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return { id: snap.id, ...(snap.data() as any) } as Child
  }

  useEffect(() => {
    (async () => {
      const data = await fetchChildById(selA)
      setChildA(data)
      if (!data) { setCalcA(null); return }
      setCalcA(computeScoresAndRecommend({
        gender: data.gender, usia: data.usia,
        ltbt: data.ltbt, lbb: data.lbb, lt: data.lt, lk: data.lk, l40m: data.l40m,
        mftLevel: data.mftLevel, mftShuttle: data.mftShuttle,
      }))
    })()
  }, [selA])

  useEffect(() => {
    (async () => {
      const data = await fetchChildById(selB)
      setChildB(data)
      if (!data) { setCalcB(null); return }
      setCalcB(computeScoresAndRecommend({
        gender: data.gender, usia: data.usia,
        ltbt: data.ltbt, lbb: data.lbb, lt: data.lt, lk: data.lk, l40m: data.l40m,
        mftLevel: data.mftLevel, mftShuttle: data.mftShuttle,
      }))
    })()
  }, [selB])

  const radarData = useMemo(() => {
    const keys = [
      { label: 'Kecepatan',  k: 'l40m' as const },
      { label: 'Kelincahan', k: 'lk'   as const },
      { label: 'Koordinasi', k: 'ltbt' as const },
      { label: 'Kekuatan',   k: 'lbb'  as const },
      { label: 'Power',      k: 'lt'   as const },
      { label: 'Daya Tahan', k: 'mft'  as const },
    ]
    return keys.map(({ label, k }) => ({
      key: label,
      a: calcA ? (calcA.scores as any)[k] ?? 0 : 0,
      b: calcB ? (calcB.scores as any)[k] ?? 0 : 0,
    }))
  }, [calcA, calcB])

  return (
    <AppLayout title="Komparasi Statistik">
      <div className="space-y-6 animate-fadeIn">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CompareCard
            title="Anak A"
            color="blue"
            loading={loading}
            childrenList={children}
            selectedId={selA}
            onChange={setSelA}
            child={childA}
            calc={calcA}
          />
          <CompareCard
            title="Anak B"
            color="red"
            loading={loading}
            childrenList={children}
            selectedId={selB}
            onChange={setSelB}
            child={childB}
            calc={calcB}
          />
        </div>

        <div className="card p-0 overflow-hidden rounded-2xl border">
          <div className="px-4 py-3 border-b font-semibold bg-slate-50/50">Perbandingan Radar</div>
          <div className="h-[320px] sm:h-[380px] p-3">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="key" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis domain={[0, 5]} tickCount={6} />
                <Radar
                  name={childA?.nama || 'Anak A'}
                  dataKey="a"
                  stroke="#2563eb" strokeWidth={2}
                  fill="none" fillOpacity={0} style={{ fill: 'none' }}
                  isAnimationActive={false}
                />
                <Radar
                  name={childB?.nama || 'Anak B'}
                  dataKey="b"
                  stroke="#dc2626" strokeWidth={2}
                  fill="none" fillOpacity={0} style={{ fill: 'none' }}
                  isAnimationActive={false}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="px-4 pb-4 text-[10px] sm:text-xs text-slate-500">
            Titik: Kecepatan, Kelincahan, Koordinasi, Kekuatan, Power, Daya Tahan (skala 0–5).
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function CompareCard({
  title, color, loading, childrenList, onChange, child, calc,
}: {
  title: string
  color: 'blue' | 'red'
  loading: boolean
  childrenList: Child[]
  selectedId: string | null
  onChange: (id: string | null) => void
  child: Child | null
  calc: CalcResult
}) {
  const [keyword, setKeyword] = useState('')
  const [focused, setFocused] = useState(false)

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase()
    if (!k) return []
    return childrenList
      .filter(c =>
        c.nama.toLowerCase().includes(k) ||
        (c.asalSekolah || '').toLowerCase().includes(k)
      ).slice(0, 8)
  }, [childrenList, keyword])

  const accent = color === 'blue' ? 'text-blue-600' : 'text-red-600'
  const chipBg = color === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'
  const barColor = color === 'blue' ? 'bg-blue-500' : 'bg-red-500'
  const classificationContainer = color === 'blue' ? 'bg-blue-50/50 border-blue-100' : 'bg-red-50/50 border-red-100'
  const headerBg = color === 'blue' ? 'bg-blue-50' : 'bg-red-50'
  const neutralChip = 'bg-slate-100 text-slate-700'

  return (
    <div className={`card p-4 space-y-4 relative overflow-visible rounded-2xl border transition-all duration-200 ${focused ? 'z-[100]' : 'z-[60]'}`}>
      <div className="flex items-center justify-between">
        <div className="text-lg font-bold">{title}</div>
        {child && (
          <div className={`text-sm font-semibold truncate max-w-[150px] sm:max-w-none ${accent}`}>
            {child.nama}
          </div>
        )}
      </div>

      <div className="relative">
        <div className="relative">
          <input
            className="input pl-10 text-sm"
            placeholder={loading ? 'Memuat daftar anak…' : 'Ketik nama/asal sekolah'}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            disabled={loading}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>

        {focused && keyword.trim() !== '' && (
          <div className="absolute z-[100] mt-2 w-full rounded-2xl border bg-white shadow-lg overflow-hidden animate-fadeIn">
            {filtered.length > 0 ? (
              filtered.map((c) => (
                <button
                  key={c.id}
                  onMouseDown={(e) => { e.preventDefault(); onChange(c.id); setKeyword(''); }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b last:border-b-0"
                >
                  <div className="font-medium text-sm">{c.nama}</div>
                  <div className="text-[10px] text-slate-500">
                    {c.gender} • Usia {c.usia}{c.asalSekolah ? ` • ${c.asalSekolah}` : ''}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-slate-500 italic">Tidak ada hasil</div>
            )}
          </div>
        )}
      </div>

      {child && calc && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${chipBg}`}>
              {child.gender}
            </span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${chipBg}`}>
              Usia {child.usia}
            </span>
            {child.asalSekolah && (
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${neutralChip}`}>
                {child.asalSekolah}
              </span>
            )}
          </div>

          <div className="overflow-x-auto rounded-2xl border hide-scrollbar">
            <table className="w-full text-xs sm:text-sm">
              <thead className={`${headerBg}`}>
                <tr>
                  <th className="px-2 sm:px-3 py-2 text-left">Indikator</th>
                  <th className="px-2 sm:px-3 py-2 text-left">Nilai</th>
                  <th className="px-2 sm:px-3 py-2 text-left">Skor</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <RowItem label="Kecepatan"    value={child.l40m} score={calc.scores.l40m} colorClass={barColor} />
                <RowItem label="Kelincahan"   value={child.lk}   score={calc.scores.lk}   colorClass={barColor} />
                <RowItem label="Koordinasi"   value={child.ltbt} score={calc.scores.ltbt} colorClass={barColor} />
                <RowItem label="Kekuatan"     value={child.lbb}  score={calc.scores.lbb}  colorClass={barColor} />
                <RowItem label="Power"        value={child.lt}   score={calc.scores.lt}   colorClass={barColor} />
                <RowItem label="Daya Tahan"   value={fmtMft(child.mftLevel, child.mftShuttle)} score={calc.scores.mft} colorClass={barColor} />
              </tbody>
            </table>
          </div>

          <div>
            {/* Mengirimkan prop color agar desain kartu rekomendasi sinkron */}
            <TopRecommendationsCard recommendations={calc.top} limit={calc.top.length} color={color} />
          </div>

          <div className={`rounded-2xl border overflow-hidden ${classificationContainer}`}>
            <div className="px-3 py-2 border-b font-bold text-xs uppercase tracking-wider bg-white/50">Klasifikasi Potensi</div>
            <div className="px-3 py-4">
              <PotentialClassification
                recCount={calc.meta.recommendedCount}
                scores={calc.scores}
                align="center"
              />
            </div>
          </div>
        </div>
      )}

      {!child && (
        <div className="text-xs text-slate-500 italic py-2">Pilih anak dari kotak pencarian di atas untuk membandingkan statistik.</div>
      )}
    </div>
  )
}

function RowItem({
  label, value, score, colorClass
}: { label: string; value?: number | string; score?: number; colorClass: string }) {
  const pct = Math.max(0, Math.min(100, ((score ?? 0) / 5) * 100))
  return (
    <tr className="hover:bg-slate-50 align-top">
      <td className="px-2 sm:px-3 py-2 font-medium">{label}</td>
      <td className="px-2 sm:px-3 py-2 font-mono text-slate-600">{value ?? <span className="text-slate-400">—</span>}</td>
      <td className="px-2 sm:px-3 py-2">
        <div className="flex flex-col gap-1">
          {score != null
            ? <span className="text-xs font-bold">{score}</span>
            : <span className="text-slate-400 text-xs">—</span>
          }
          <div className="h-1 w-20 sm:w-32 bg-slate-200 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${colorClass} transition-[width] duration-500`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </td>
    </tr>
  )
}

function fmtMft(level?: number, shuttle?: number) {
  if (level == null || shuttle == null) return undefined
  return `${level}.${shuttle}`
}