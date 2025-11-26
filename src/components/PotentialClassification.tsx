// src/components/PotentialClassification.tsx
// Klasifikasi Potensi berbasis jumlah rekomendasi cabang olahraga.
//
// Cara pakai (wajib):
//   <PotentialClassification recCount={calc.meta.recommendedCount} />
//
// Opsional tampilkan breakdown skor indikator (hanya untuk display):
//   <PotentialClassification recCount={...} scores={calc.scores} showBreakdown />

// import type { PotentialCategory } from '../lib/norma'
import { potentialCategoryFromCount } from '../lib/norma'

type Scores = {
  ltbt?: number
  lbb?: number
  lt?: number
  lk?: number
  l40m?: number
  mft?: number
}

export function computePotentialClassificationFromCount(recCount: number) {
  const category = potentialCategoryFromCount(recCount)

  // Warna badge per kategori (konsisten dengan sebelumnya)
  let badgeCls: string
  switch (category) {
    case 'Sangat Potensial':
      badgeCls = 'bg-emerald-50 text-emerald-700'
      break
    case 'Potensial':
      badgeCls = 'bg-green-50 text-green-700'
      break
    case 'Cukup Potensial':
      badgeCls = 'bg-amber-50 text-amber-700'
      break
    case 'Kurang Potensial':
      badgeCls = 'bg-orange-50 text-orange-700'
      break
    default:
      badgeCls = 'bg-red-50 text-red-700' // Tidak Potensial
  }

  return { category, badgeCls }
}

type Props = {
  /** Jumlah cabang olahraga yang masuk rekomendasi (>= threshold) */
  recCount: number
  /** Opsional: skor 6 indikator untuk breakdown visual saja */
  scores?: Scores
  /** Posisi teks/badge */
  align?: 'left' | 'center' | 'right'
  /** Opsional: tampilkan breakdown 6 skor seperti 4-4-4-4-4-4 */
  showBreakdown?: boolean
  className?: string
}

/** Komponen tampilan klasifikasi potensi (berbasis jumlah rekomendasi) */
export default function PotentialClassification({
  recCount,
  scores,
  align = 'center',
  showBreakdown = false,
  className,
}: Props) {
  const { category, badgeCls } = computePotentialClassificationFromCount(recCount)
  const alignCls =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'

  const breakdown = [
    scores?.ltbt ?? 0,
    scores?.lbb ?? 0,
    scores?.lt ?? 0,
    scores?.lk ?? 0,
    scores?.l40m ?? 0,
    scores?.mft ?? 0,
  ]
  const total = breakdown.reduce((a, b) => a + b, 0)

  return (
    <div className={`${alignCls} ${className ?? ''}`}>
      <div className={`inline-flex items-center rounded-full px-1 py-1 text-xxs font-semibold ${badgeCls}`}>
        {category}
      </div>

      {/* Informasi baru: tampilkan jumlah rekomendasi, bukan total skor */}
      <div className="mt-1 text-xxs text-slate-600">({recCount} cabang)</div>

      {/* Breakdown skor indikator: opsional (untuk konteks/diagnostik visual) */}
      {showBreakdown && (
        <div className="mt-1 text-[11px] leading-tight text-slate-500 font-mono">
          <div className="uppercase tracking-wide not-italic font-sans">Skor 6 Indikator</div>
          <div>{breakdown.map((v) => String(v)).join('-')}</div>
          <div>Total skor indikator: {total}/30</div>
        </div>
      )}
    </div>
  )
}
