// src/components/ValueScoreCard.tsx
function clsx(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(' ')
}

type Scores = {
  ltbt?: number
  lbb?: number
  lt?: number
  lk?: number
  l40m?: number
  mft?: number
}

type Values = {
  ltbt?: number
  lbb?: number
  lt?: number
  lk?: number
  l40m?: number
  mftLevel?: number
  mftShuttle?: number
}

type Palette = {
  headBg: string
  badge: string
  barGrad: string
}

function getPalette(color: 'blue' | 'red'): Palette {
  return color === 'red'
    ? {
        headBg: 'bg-blue-50',
        badge: 'bg-rose-50 text-rose-700',
        barGrad: 'from-rose-400 to-red-500',
      }
    : {
        headBg: 'bg-blue-50',
        badge: 'bg-indigo-50 text-indigo-700',
        barGrad: 'from-sky-400 to-blue-500',
      }
}

export default function ValueScoreCard({
  title = 'Nilai & Skor',
  values,
  scores,
  className,
  color = 'blue',
}: {
  title?: string
  values: Values
  scores: Scores
  className?: string
  color?: 'blue' | 'red'
}) {
  const pal = getPalette(color)

  return (
    <div className={clsx('card p-0 overflow-hidden', className)}>
      <div className="px-4 py-3 border-b font-semibold text-center">{title}</div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className={pal.headBg}>
            <tr>
              <th className="px-3 py-2 text-left">Indikator</th>
              <th className="px-3 py-2 text-left">Nilai</th>
              <th className="px-3 py-2 text-left">Skor</th>
              <th className="px-3 py-2 text-left">Visual</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <RowItem label="Kecepatan" value={values.l40m} score={scores.l40m} pal={pal} />
            <RowItem label="Kelincahan" value={values.lk} score={scores.lk} pal={pal} />
            <RowItem label="Koordinasi" value={values.ltbt} score={scores.ltbt} pal={pal} />
            <RowItem label="Kekuatan" value={values.lbb} score={scores.lbb} pal={pal} />
            <RowItem label="Power" value={values.lt} score={scores.lt} pal={pal} />
            <RowItem
              label="Daya Tahan"
              value={fmtMft(values.mftLevel, values.mftShuttle)}
              score={scores.mft}
              pal={pal}
            />
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RowItem({
  label,
  value,
  score,
  pal,
}: {
  label: string
  value?: number | string
  score?: number
  pal: Palette
}) {
  const s = score ?? 0
  const percent = Math.max(0, Math.min(100, (s / 5) * 100))
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-3 py-2">{label}</td>
      <td className="px-3 py-2">{value ?? <span className="text-slate-400">—</span>}</td>
      <td className="px-3 py-2">
        {score != null ? (
          <span className={clsx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold', pal.badge)}>
            {score}
          </span>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </td>
      <td className="px-3 py-2">
        <div className="w-40 max-w-full h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className={clsx('h-full rounded-full bg-gradient-to-r transition-[width] duration-700', pal.barGrad)}
            style={{ width: `${percent}%` }}
            aria-label={`Skor ${s} dari 5`}
          />
        </div>
      </td>
    </tr>
  )
}

function fmtMft(level?: number, shuttle?: number) {
  if (level == null || shuttle == null) return undefined
  return `${level}.${shuttle}`
}