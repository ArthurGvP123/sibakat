// src/lib/export.ts
import ExcelJS from 'exceljs'

export type Gender = 'Putra' | 'Putri'

export type ChildRow = {
  id?: string
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
  createdAt?: any
  updatedAt?: any
}

type Scores = {
  ltbt?: number
  lbb?: number
  lt?: number
  lk?: number
  l40m?: number
  mft?: number
}

type TopRow = {
  rank: number
  name: string
  match: number
  target: { ltbt: number; lbb: number; lt: number; lk: number; l40m: number; mft: number }
}

export type CalcLike = { scores: Scores; top: TopRow[] }

function fmtDate(v: any): string | undefined {
  if (!v) return undefined
  try {
    if (typeof v.toDate === 'function') return v.toDate().toISOString()
    const d = new Date(v)
    if (!isNaN(d.getTime())) return d.toISOString()
  } catch {}
  return undefined
}

function mftJoin(level?: number, shuttle?: number): string | undefined {
  if (level == null || shuttle == null) return undefined
  return `${level}.${shuttle}`
}

function downloadBuffer(buf: ArrayBuffer, filename: string) {
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Ekspor seluruh daftar anak ke Excel (1 sheet) */
export async function exportChildrenToExcel(children: ChildRow[], filename = 'talenta_sport-data-anak.xlsx') {
  if (!children || children.length === 0) throw new Error('Tidak ada data anak untuk diekspor.')

  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Data Anak')

  ws.columns = [
    { header: 'Nama', key: 'nama', width: 28 },
    { header: 'Gender', key: 'gender', width: 10 },
    { header: 'Usia', key: 'usia', width: 8 },
    { header: 'LTBT (kali)', key: 'ltbt', width: 14 },
    { header: 'LBB (m)', key: 'lbb', width: 12 },
    { header: 'LT (cm)', key: 'lt', width: 12 },
    { header: 'LK (dt)', key: 'lk', width: 12 },
    { header: 'L40M (dt)', key: 'l40m', width: 12 },
    { header: 'MFT (Lv.Sh)', key: 'mft', width: 14 },
    { header: 'Created At (ISO)', key: 'createdAt', width: 22 },
    { header: 'Updated At (ISO)', key: 'updatedAt', width: 22 },
  ]

  children.forEach((c) => {
    ws.addRow({
      nama: c.nama,
      gender: c.gender,
      usia: c.usia,
      ltbt: c.ltbt ?? '',
      lbb: c.lbb ?? '',
      lt: c.lt ?? '',
      lk: c.lk ?? '',
      l40m: c.l40m ?? '',
      mft: mftJoin(c.mftLevel, c.mftShuttle) ?? '',
      createdAt: fmtDate(c.createdAt) ?? '',
      updatedAt: fmtDate(c.updatedAt) ?? '',
    })
  })

  ws.getRow(1).font = { bold: true }

  const buf = await wb.xlsx.writeBuffer()
  downloadBuffer(buf, filename)
}

/** Ekspor statistik 1 anak (Profil, Nilai & Skor, Top 6, dan gambar Radar Chart) */
export async function exportChildStatsToExcel(
  child: ChildRow,
  calc: CalcLike,
  radarDataUrl?: string, // PNG dataURL dari html2canvas (opsional)
  filename?: string
) {
  if (!child || !calc) throw new Error('Data tidak lengkap untuk ekspor.')

  const wb = new ExcelJS.Workbook()
  const nameSafe = (child.nama || 'statistik-anak').replace(/[\\/:*?"<>|]+/g, '_')
  const file = filename || `sibakat-stat-${nameSafe}.xlsx`

  // Sheet: Profil
  const wsProfil = wb.addWorksheet('Profil')
  wsProfil.columns = [
    { header: 'Field', key: 'f', width: 20 },
    { header: 'Nilai', key: 'v', width: 30 },
  ]
  const profilRows: [string, any][] = [
    ['Nama', child.nama],
    ['Gender', child.gender],
    ['Usia', child.usia],
    ['LTBT (kali)', child.ltbt ?? ''],
    ['LBB (m)', child.lbb ?? ''],
    ['LT (cm)', child.lt ?? ''],
    ['LK (dt)', child.lk ?? ''],
    ['L40M (dt)', child.l40m ?? ''],
    ['MFT (Lv.Sh)', mftJoin(child.mftLevel, child.mftShuttle) ?? ''],
  ]
  profilRows.forEach(([f, v]) => wsProfil.addRow({ f, v }))
  wsProfil.getRow(1).font = { bold: true }

  // Sheet: Nilai & Skor
  const wsNilai = wb.addWorksheet('Nilai & Skor')
  wsNilai.columns = [
    { header: 'Indikator', key: 'i', width: 16 },
    { header: 'Nilai', key: 'n', width: 14 },
    { header: 'Skor (1–5)', key: 's', width: 14 },
  ]
  const nilaiRows = [
    { i: 'LTBT', n: child.ltbt ?? '', s: calc.scores.ltbt ?? '' },
    { i: 'LBB',  n: child.lbb  ?? '', s: calc.scores.lbb  ?? '' },
    { i: 'LT',   n: child.lt   ?? '', s: calc.scores.lt   ?? '' },
    { i: 'LK',   n: child.lk   ?? '', s: calc.scores.lk   ?? '' },
    { i: 'L40M', n: child.l40m ?? '', s: calc.scores.l40m ?? '' },
    { i: 'MFT',  n: mftJoin(child.mftLevel, child.mftShuttle) ?? '', s: calc.scores.mft ?? '' },
  ]
  nilaiRows.forEach(r => wsNilai.addRow(r))
  wsNilai.getRow(1).font = { bold: true }

  // Sheet: Top 6
  const wsTop = wb.addWorksheet('Top 6')
  wsTop.columns = [
    { header: 'Peringkat', key: 'rank', width: 12 },
    { header: 'Cabang', key: 'name', width: 26 },
    { header: 'Kecocokan (%)', key: 'match', width: 16 },
    { header: 'Target LTBT', key: 't1', width: 12 },
    { header: 'Target LBB', key: 't2', width: 12 },
    { header: 'Target LT', key: 't3', width: 12 },
    { header: 'Target LK', key: 't4', width: 12 },
    { header: 'Target L40M', key: 't5', width: 12 },
    { header: 'Target MFT', key: 't6', width: 12 },
  ]
  calc.top.forEach((r) => {
    wsTop.addRow({
      rank: r.rank, name: r.name, match: r.match,
      t1: r.target.ltbt, t2: r.target.lbb, t3: r.target.lt,
      t4: r.target.lk, t5: r.target.l40m, t6: r.target.mft,
    })
  })
  wsTop.getRow(1).font = { bold: true }

  // Sheet: Radar (gambar) — gunakan range string agar kompatibel type
  const wsRadar = wb.addWorksheet('Radar')
  wsRadar.getCell('A1').value = 'Radar Chart'
  wsRadar.getCell('A1').font = { bold: true }
  if (radarDataUrl) {
    const imgId = wb.addImage({ base64: radarDataUrl, extension: 'png' })
    // Tempelkan gambar pada area sel A3:O30
    wsRadar.addImage(imgId, 'A3:O30')
  } else {
    wsRadar.getCell('A3').value = 'Radar chart tidak disertakan (screenshot gagal).'
  }

  const buf = await wb.xlsx.writeBuffer()
  downloadBuffer(buf, file)
}
