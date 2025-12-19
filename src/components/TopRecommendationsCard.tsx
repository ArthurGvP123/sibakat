// src/components/TopRecommendationsCard.tsx
import { useMemo } from 'react'
import type { Recommendation } from '../lib/norma'

type Props = {
  recommendations: Recommendation[]; // Daftar yang sudah difilter >= threshold
  limit?: number;                    // Default 6
  thresholdPct?: number;             // Ambang batas (misal 75)
  color?: 'blue' | 'red';            // Penambahan prop warna untuk tema komparasi
}

export default function TopRecommendationsCard({
  recommendations,
  limit = 6,
  thresholdPct = 75,
  color = 'blue' // Default warna biru
}: Props) {
  // Hanya mengambil Top 6 dengan kecocokan tertinggi
  const topRecommendations = useMemo(
    () => recommendations.slice(0, limit),
    [recommendations, limit]
  )

  const total = recommendations.length

  // Logika warna dinamis berdasarkan prop 'color'
  const isRed = color === 'red';
  const badgeCls = isRed ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700';
  const hoverCls = isRed ? 'hover:border-red-200' : 'hover:border-blue-200';
  const pctCls = isRed ? 'text-red-600' : 'text-primary';

  return (
    <div className="card p-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="px-4 py-3 border-b font-semibold flex items-center justify-between bg-slate-50/50">
        <span className="text-slate-800">Top Rekomendasi Cabang Olahraga</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeCls}`}>
          Ambang {thresholdPct}%
        </span>
      </div>

      <div className="p-4">
        {total === 0 ? (
          <div className="text-sm text-slate-500 italic py-4 text-center">
            Tidak ada cabang olahraga yang memenuhi ambang batas.
          </div>
        ) : (
          <ul className="space-y-2">
            {topRecommendations.map((r, idx) => (
              <li
                key={`${r.sport}-${idx}`}
                className={`flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/30 px-3 py-2.5 transition-colors ${hoverCls}`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-400">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-sm text-slate-800">{r.sport}</span>
                </div>
                <span className={`text-xs font-bold ${pctCls}`}>
                  {r.matchPct}%
                </span>
              </li>
            ))}
          </ul>
        )}
        
        {total > 0 && (
          <p className="mt-4 text-[10px] text-slate-400 text-center italic">
            *Menampilkan {topRecommendations.length} rekomendasi dengan kecocokan tertinggi.
          </p>
        )}
      </div>
    </div>
  )
}