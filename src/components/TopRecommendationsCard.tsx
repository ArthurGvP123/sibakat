// src/components/TopRecommendationsCard.tsx
import { useMemo, useState } from 'react'
import type { Recommendation } from '../lib/norma'

type Props = {
  recommendations: Recommendation[]; // kirim daftar yg SUDAH difilter >= threshold
  limit?: number;                    // default 6
  thresholdPct?: number;             // opsional, untuk badge info (mis. 75)
}

export default function TopRecommendationsCard({
  recommendations,
  limit = 6,
  thresholdPct = 75,
}: Props) {
  const [showAll, setShowAll] = useState(false)

  const total = recommendations.length
  const visible = useMemo(
    () => (showAll ? recommendations : recommendations.slice(0, limit)),
    [showAll, recommendations, limit]
  )

  return (
    <div className="card p-0 overflow-hidden rounded-2xl">
      <div className="px-4 py-3 border-b font-semibold flex items-center justify-between">
        <span>Rekomendasi Cabang Olahraga</span>
        <span className="text-xs text-slate-500">
          Ambang = {thresholdPct}%
        </span>
      </div>

      <div className="p-4">
        {total === 0 ? (
          <div className="text-sm text-slate-600">
            Tidak ada cabang olahraga yang direkomendasikan.
          </div>
        ) : (
          <>
            <ul className="space-y-2">
              {visible.map((r, idx) => (
                <li
                  key={`${r.sport}-${idx}`}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-2"
                >
                  <span className="font-medium text-sm text-slate-800">{r.sport}</span>
                  <span className="text-sm text-slate-700">
                    {r.matchPct}% cocok
                  </span>
                </li>
              ))}
            </ul>

            {total > limit && (
              <div className="mt-3 text-right">
                <button
                  className="btn-ghost rounded-2xl"
                  onClick={() => setShowAll(s => !s)}
                >
                  {showAll ? 'Sembunyikan' : `Tampilkan semua (${total})`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
