// src/components/RadarScoreCard.tsx
import { forwardRef, useMemo } from 'react'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts'
import PotentialClassification from './PotentialClassification'

type Scores = {
  ltbt?: number
  lbb?: number
  lt?: number
  lk?: number
  l40m?: number
  mft?: number
}

type Props = {
  title?: string
  scores: Scores
  /** NEW: jumlah cabang olahraga yang direkomendasikan (lolos threshold) */
  recCount?: number
  /** Catatan Minat dan Bakat anak (opsional) */
  minatBakat?: string
  /** Tampilkan klasifikasi potensi (default: true). 
   * Klasifikasi hanya dirender jika recCount tersedia. */
  showClassification?: boolean
  /** Catatan kecil di bawah chart */
  note?: string
  /** ClassName kartu luar (opsional) */
  className?: string
}

/** join className sederhana */
function cx(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(' ')
}

/**
 * Kartu "Profil Skor (Radar)" yang bisa dipakai lintas halaman.
 * - Menerima skor 0–5 per indikator
 * - Menggambar radar chart Recharts
 * - Opsional menampilkan <PotentialClassification /> (berbasis jumlah rekomendasi/recCount)
 * - forwardRef ke wrapper .card agar parent bisa mengukur tinggi
 */
const RadarScoreCard = forwardRef<HTMLDivElement, Props>(function RadarScoreCard(
  {
    title = 'Profil Skor (Radar)',
    scores,
    recCount,
    showClassification = true,
    note = 'Klasifikasi potensi berdasarkan jumlah cabang olahraga yang direkomendasikan.',
    className,
    minatBakat,
  },
  ref
) {
  const data = useMemo(
    () => [
      { key: 'Kecepatan',      value: scores.l40m  ?? 0 },
      { key: 'Kelincahan',     value: scores.lk    ?? 0 },
      { key: 'Koordinasi',     value: scores.ltbt  ?? 0 },
      { key: 'Kekuatan',       value: scores.lbb   ?? 0 },
      { key: 'Power',          value: scores.lt    ?? 0 },
      { key: 'Daya Tahan',     value: scores.mft   ?? 0 },
    ],
    [scores]
  )

  return (
    <div ref={ref} className={cx('card p-0 overflow-hidden', className)}>
      <div className="px-4 py-3 border-b font-semibold text-center">{title}</div>

      {/* Konten dipusatkan H & V dan diberi minimum height agar rapi */}
      <div className="p-4 min-h-[460px] flex flex-col items-center justify-center text-center gap-3">
        <div className="w-full max-w-[520px] h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="key" />
              <PolarRadiusAxis domain={[0, 5]} tickCount={6} />
              <Radar
                name="Skor"
                dataKey="value"
                stroke="#0ea5e9"
                strokeWidth={2}
                fill="none"
                fillOpacity={0}
                dot={false}
                activeDot={false}
                isAnimationActive={false}
              />
              <Tooltip formatter={(v: any) => String(v)} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* NEW: klasifikasi potensi pakai recCount (jumlah rekomendasi).
            Ditampilkan hanya jika recCount disuplai agar kompatibel dengan pemakaian lama. */}
        {showClassification && recCount != null && (
          <PotentialClassification
            recCount={recCount}
            // scores tetap diteruskan agar opsi breakdown/visual lain tetap bisa bekerja
            scores={scores}
            align="center"
          />
        )}

        {note && (
          <div className="text-xs text-slate-500">{note}</div>
        )}

        {/* Minat dan Bakat (jika tersedia) - tampil di bawah note dan center */}
        {minatBakat && (
          <div className="w-full max-w-[520px] mt-3 text-center">
            <div className="text-sm font-semibold">Minat & Bakat</div>
            <div className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{minatBakat}</div>
          </div>
        )}
      </div>
    </div>
  )
})

export default RadarScoreCard