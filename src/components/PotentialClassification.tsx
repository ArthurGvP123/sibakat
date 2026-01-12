// src/components/PotentialClassification.tsx
import { potentialCategoryFromScore } from '../lib/norma'

type Scores = {
  ltbt?: number
  lbb?: number
  lt?: number
  lk?: number
  l40m?: number
  mft?: number
}

/**
 * Helper untuk menentukan kategori dan warna badge berdasarkan TOTAL SKOR 
 */
export function computePotentialClassificationFromScore(totalScore: number) {
  const category = potentialCategoryFromScore(totalScore)

  // Warna badge per kategori sesuai rincian baru
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
      badgeCls = 'bg-red-50 text-red-700' // Tidak Potensial (<= 14)
  }

  return { category, badgeCls }
}

type Props = {
  recCount: number // Dipertahankan agar tidak error pada pemanggil komponen, meski klasifikasi kini menggunakan skor
  scores?: Scores
  align?: 'left' | 'center' | 'right'
  showBreakdown?: boolean
  className?: string
}

/** Komponen tampilan klasifikasi potensi */
export default function PotentialClassification({
  scores,
  align = 'center',
  showBreakdown = false,
  className,
}: Props) {
  // Menghitung total skor dari 6 indikator keberbakatan
  const breakdown = [
    scores?.ltbt ?? 0,
    scores?.lbb ?? 0,
    scores?.lt ?? 0,
    scores?.lk ?? 0,
    scores?.l40m ?? 0,
    scores?.mft ?? 0,
  ]
  const totalTalentScore = breakdown.reduce((a, b) => a + b, 0)

  // Menggunakan helper baru berbasis skor
  const { category, badgeCls } = computePotentialClassificationFromScore(totalTalentScore)
  
  const alignCls =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'

  return (
    <div className={`${alignCls} ${className ?? ''}`}>
      {/* Badge Kategori Klasifikasi */}
      <div className={`inline-flex items-center rounded-full px-2 py-1 text-xxs font-semibold ${badgeCls}`}>
        {category}
      </div>

      {/* Breakdown skor indikator: muncul jika properti showBreakdown diaktifkan */}
      {showBreakdown && (
        <div className="mt-1 text-[11px] leading-tight text-slate-500 font-mono">
          <div className="uppercase tracking-wide not-italic font-sans">Skor 6 Indikator</div>
          <div>{breakdown.map((v) => String(v)).join('-')}</div>
          <div>Total skor indikator: {totalTalentScore}/30</div>
        </div>
      )}
    </div>
  )
}