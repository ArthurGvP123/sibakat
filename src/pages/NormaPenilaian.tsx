// src/pages/NormaPenilaian.tsx
import AppLayout from '../components/Navbar'
import { useMemo, useState } from 'react'
import { DEFAULT_RECO_THRESHOLD } from '../lib/norma'

type GradeBands = { A: string; B: string; C: string; D: string; E: string }
type IndicatorKey = 'LTBT' | 'LBB' | 'LT' | 'LK' | 'L40M' | 'MFT'

type AgeCategoryData = Record<IndicatorKey, GradeBands>
type Gender = 'Putri' | 'Putra'
type Age = 11 | 12 | 13 | 14 | 15

const PROFIL_UNIT: Record<IndicatorKey, string> = {
  LTBT: 'kali',
  LBB: 'meter',
  LT: 'centimeter',
  LK: 'detik',
  L40M: 'detik',
  MFT: 'level.shuttle'
}

/* =========================
   A & B — NORMA (tetap)
   ========================= */
const NORMA: Record<Gender, Record<Age, AgeCategoryData>> = {
  /* … (isi sama persis seperti yang sudah kamu punya sebelumnya) … */
  Putri: {
    11: {
      LTBT: { A: '≥15', B: '10–14', C: '6–9', D: '3–5', E: '≤2' },
      LBB:  { A: '≥5.25', B: '4.40–5.24', C: '3.50–4.39', D: '2.70–3.49', E: '≤2.69' },
      LT:   { A: '≥35', B: '29–34', C: '23–28', D: '17–22', E: '≤16' },
      LK:   { A: '≤19.75', B: '19.76–22.24', C: '22.25–24.73', D: '24.74–27.22', E: '≥27.23' },
      L40M: { A: '≤6.81', B: '6.82–7.76', C: '7.77–8.71', D: '8.72–9.66', E: '≥9.67' },
      MFT:  { A: '≥7.2', B: '5.2–7.1', C: '3.3–5.1', D: '2.3–3.2', E: '≤2.2' }
    },
    12: {
      LTBT: { A: '≥16', B: '12–15', C: '7–11', D: '3–6', E: '≤2' },
      LBB:  { A: '≥6.20', B: '5.40–6.19', C: '4.65–5.39', D: '3.90–4.64', E: '≤3.89' },
      LT:   { A: '≥36', B: '30–35', C: '21–29', D: '19–20', E: '≤18' },
      LK:   { A: '≤18.96', B: '18.97–21.10', C: '21.11–23.24', D: '23.25–25.37', E: '≥25.38' },
      L40M: { A: '≤6.42', B: '6.43–7.19', C: '7.20–7.97', D: '7.98–8.73', E: '≥8.74' },
      MFT:  { A: '≥7.7', B: '6.0–7.6', C: '4.2–5.9', D: '2.5–4.1', E: '≤2.4' }
    },
    13: {
      LTBT: { A: '≥17', B: '13–16', C: '8–12', D: '4–7', E: '≤3' },
      LBB:  { A: '≥6.45', B: '5.70–6.44', C: '4.90–5.69', D: '4.10–4.89', E: '≤4.09' },
      LT:   { A: '≥38', B: '32–37', C: '26–31', D: '21–25', E: '≤20' },
      LK:   { A: '≤18.17', B: '18.18–20.26', C: '20.27–22.36', D: '22.37–24.44', E: '≥24.45' },
      L40M: { A: '≤6.33', B: '6.34–7.07', C: '7.08–7.82', D: '7.83–8.54', E: '≥8.55' },
      MFT:  { A: '≥8.1', B: '6.3–8.0', C: '4.5–6.2', D: '2.7–4.4', E: '≤2.6' }
    },
    14: {
      LTBT: { A: '≥17', B: '13–16', C: '8–12', D: '4–7', E: '≤3' },
      LBB:  { A: '≥6.90', B: '6.00–6.89', C: '5.10–5.99', D: '4.20–5.09', E: '≤4.19' },
      LT:   { A: '≥39', B: '33–38', C: '27–32', D: '22–26', E: '≤21' },
      LK:   { A: '≤17.38', B: '17.39–19.79', C: '19.80–22.21', D: '22.22–24.61', E: '≥24.62' },
      L40M: { A: '≤6.04', B: '6.05–6.88', C: '6.89–7.42', D: '7.43–8.55', E: '≥8.56' },
      MFT:  { A: '≥8.1', B: '6.3–8.0', C: '4.5–6.2', D: '2.7–4.4', E: '≤2.6' }
    },
    15: {
      LTBT: { A: '≥18', B: '14–17', C: '9–13', D: '5–8', E: '≤4' },
      LBB:  { A: '≥7.10', B: '6.25–7.09', C: '5.40–6.24', D: '4.35–5.39', E: '≤4.34' },
      LT:   { A: '≥41', B: '34–40', C: '28–33', D: '23–27', E: '≤22' },
      LK:   { A: '≤16.92', B: '16.93–19.47', C: '19.48–22.03', D: '22.03–24.57', E: '≥24.58' },
      L40M: { A: '≤5.99', B: '5.98–6.76', C: '6.77–7.54', D: '7.55–8.30', E: '≥8.31' },
      MFT:  { A: '≥8.3', B: '6.3–8.2', C: '4.5–6.2', D: '2.7–4.4', E: '≤2.6' }
    }
  },
  Putra: {
    11: {
      LTBT: { A: '≥17', B: '12–16', C: '8–11', D: '4–7', E: '≤3' },
      LBB:  { A: '≥5.90', B: '5.10–5.89', C: '4.35–5.09', D: '3.35–4.34', E: '≤3.34' },
      LT:   { A: '≥39', B: '33–38', C: '26–32', D: '19–25', E: '≤18' },
      LK:   { A: '≤18.02', B: '18.03–20.71', C: '20.72–23.42', D: '23.43–26.13', E: '≥26.14' },
      L40M: { A: '≤6.78', B: '6.79–7.59', C: '7.60–8.40', D: '8.41–9.21', E: '≥9.22' },
      MFT:  { A: '≥8.8', B: '6.5–8.7', C: '4.2–6.4', D: '2.8–4.2', E: '≤2.7' }
    },
    12: {
      LTBT: { A: '≥17', B: '14–16', C: '10–13', D: '6–9', E: '≤5' },
      LBB:  { A: '≥6.80', B: '6.00–6.79', C: '5.15–5.99', D: '4.30–5.14', E: '≤4.29' },
      LT:   { A: '≥42', B: '35–41', C: '28–34', D: '21–27', E: '≤20' },
      LK:   { A: '≤18.15', B: '18.16–20.07', C: '20.08–21.99', D: '22.00–23.91', E: '≥23.92' },
      L40M: { A: '≤6.05', B: '6.06–6.75', C: '6.76–7.45', D: '7.46–8.15', E: '≥8.16' },
      MFT:  { A: '≥9.3', B: '8.0–9.2', C: '5.7–7.9', D: '3.5–5.6', E: '≤3.4' }
    },
    13: {
      LTBT: { A: '≥18', B: '15–17', C: '11–14', D: '7–10', E: '≤6' },
      LBB:  { A: '≥8.05', B: '6.85–8.04', C: '5.70–6.84', D: '4.50–5.69', E: '≤4.49' },
      LT:   { A: '≥44', B: '27–43', C: '29–37', D: '22–28', E: '≤21' },
      LK:   { A: '≤16.60', B: '16.61–18.72', C: '19.73–20.84', D: '20.85–22.97', E: '≥22.98' },
      L40M: { A: '≤5.82', B: '5.83–6.56', C: '6.57–7.30', D: '7.31–8.04', E: '≥8.05' },
      MFT:  { A: '≥10.2', B: '8.9–10.1', C: '6.6–8.8', D: '4.3–6.5', E: '≤4.2' }
    },
    14: {
      LTBT: { A: '≥19', B: '16–18', C: '12–15', D: '8–11', E: '≤7' },
      LBB:  { A: '≥8.75', B: '7.50–8.74', C: '6.25–7.49', D: '5.00–6.24', E: '≤5.49' },
      LT:   { A: '≥47', B: '40–46', C: '32–39', D: '25–31', E: '≤24' },
      LK:   { A: '≤16.42', B: '16.43–18.35', C: '18.36–20.29', D: '20.30–22.22', E: '≥22.23' },
      L40M: { A: '≤5.50', B: '5.51–6.21', C: '6.22–6.93', D: '6.94–7.64', E: '≥7.65' },
      MFT:  { A: '≥11.4', B: '9.2–11.3', C: '6.9–9.1', D: '4.7–6.8', E: '≤4.6' }
    },
    15: {
      LTBT: { A: '≥20', B: '17–19', C: '13–16', D: '9–12', E: '≤8' },
      LBB:  { A: '≥9.85', B: '8.65–9.84', C: '7.45–8.64', D: '6.25–7.44', E: '≤6.24' },
      LT:   { A: '≥57', B: '48–56', C: '36–47', D: '29–35', E: '≤28' },
      LK:   { A: '≤14.89', B: '14.90–17.88', C: '17.89–20.19', D: '20.18–22.12', E: '≥22.13' },
      L40M: { A: '≤5.00', B: '5.01–5.93', C: '5.94–6.77', D: '6.78–7.50', E: '≥7.51' },
      MFT:  { A: '≥11.8', B: '9.5–11.7', C: '7.1–9.4', D: '4.8–7.0', E: '≤4.7' }
    }
  }
}

/* =========================
   C — SPORT TARGETS (1–5)
   ========================= */
type SportTarget = {
  name: string
  category: string
  target: Record<IndicatorKey, 1|2|3|4|5>
}

/** Skor target 1–5 artinya kebutuhan relatif cabang tsb pada indikator:
 *  1 = rendah, 3 = sedang, 5 = sangat tinggi.
 *  (Penetapan diselaraskan dengan profil fisik umum cabang.)
 */
const SPORTS: SportTarget[] = [
  { name: 'Anggar', category: 'Olahraga Kombatif', target: { LTBT:5, LBB:2, LT:3, LK:5, L40M:4, MFT:3 } },
  { name: 'Angkat Besi', category: 'Olahraga Individu', target:      { LTBT:2, LBB:5, LT:5, LK:2, L40M:1, MFT:1 } },
  { name: 'Baseball', category: 'Olahraga Tim', target:     { LTBT:4, LBB:5, LT:3, LK:4, L40M:4, MFT:3 } },
  { name: 'Bola Basket', category: 'Olahraga Tim', target:  { LTBT:4, LBB:4, LT:4, LK:4, L40M:4, MFT:3 } },
  { name: 'Bola Tangan', category: 'Olahraga Tim', target:  { LTBT:4, LBB:5, LT:4, LK:4, L40M:4, MFT:3 } },
  { name: 'Bola Voli', category: 'Olahraga Net', target:    { LTBT:4, LBB:4, LT:5, LK:3, L40M:3, MFT:3 } },
  { name: 'Bulutangkis', category: 'Olahraga Net', target:  { LTBT:5, LBB:3, LT:3, LK:5, L40M:4, MFT:4 } },
  { name: 'Dayung', category: 'Olahraga Tim', target:       { LTBT:3, LBB:3, LT:5, LK:2, L40M:2, MFT:5 } },
  { name: 'Hoki', category: 'Olahraga Tim', target:         { LTBT:4, LBB:3, LT:3, LK:5, L40M:4, MFT:4 } },
  { name: 'Jalan', category: 'Olahraga Individu', target:   { LTBT:2, LBB:1, LT:2, LK:3, L40M:2, MFT:5 } },
  { name: 'Judo', category: 'Olahraga Kombatif', target:    { LTBT:4, LBB:3, LT:4, LK:4, L40M:3, MFT:3 } },
  { name: 'Kano', category: 'Olahraga Individu', target:    { LTBT:3, LBB:3, LT:5, LK:2, L40M:2, MFT:5 } },
  { name: 'Karate-Do', category: 'Olahraga Kombatif', target:{ LTBT:4, LBB:2, LT:4, LK:5, L40M:4, MFT:3 } },
  { name: 'Kung Fu', category: 'Olahraga Kombatif', target: { LTBT:5, LBB:2, LT:4, LK:5, L40M:4, MFT:3 } },
  { name: 'Lari Cepat', category: 'Olahraga Individu', target:{ LTBT:3, LBB:1, LT:4, LK:4, L40M:5, MFT:2 } },
  { name: 'Lari Jarak Jauh', category: 'Olahraga Individu', target:{ LTBT:2, LBB:1, LT:3, LK:3, L40M:2, MFT:5 } },
  { name: 'Lari Gawang', category: 'Olahraga Individu', target:{ LTBT:4, LBB:1, LT:4, LK:5, L40M:5, MFT:3 } },
  { name: 'Lompat Jauh', category: 'Olahraga Individu', target:{ LTBT:3, LBB:1, LT:5, LK:4, L40M:4, MFT:2 } },
  { name: 'Lempar Cakram', category: 'Olahraga Individu', target:{ LTBT:2, LBB:5, LT:5, LK:2, L40M:1, MFT:1 } },
  { name: 'Lempar Lembing', category: 'Olahraga Individu', target:{ LTBT:3, LBB:5, LT:4, LK:3, L40M:2, MFT:2 } },
  { name: 'Lompat Jangkit', category: 'Olahraga Individu', target:{ LTBT:3, LBB:1, LT:5, LK:4, L40M:4, MFT:2 } },
  { name: 'Lompat Tinggi', category: 'Olahraga Individu', target:{ LTBT:3, LBB:1, LT:5, LK:4, L40M:4, MFT:2 } },
  { name: 'Lompat Galah', category: 'Olahraga Individu', target:{ LTBT:5, LBB:1, LT:5, LK:4, L40M:4, MFT:3 } },
  { name: 'Loncat Indah', category: 'Olahraga Artistik', target:{ LTBT:5, LBB:1, LT:4, LK:5, L40M:2, MFT:2 } },
  { name: 'Lontar Martil', category: 'Olahraga Individu', target:{ LTBT:2, LBB:5, LT:5, LK:2, L40M:1, MFT:1 } },
  { name: 'Panahan', category: 'Olahraga Target', target:   { LTBT:4, LBB:2, LT:2, LK:3, L40M:1, MFT:2 } },
  { name: 'Panjat Tebing', category: 'Olahraga Individu', target:{ LTBT:4, LBB:2, LT:4, LK:5, L40M:4, MFT:4 } },
  { name: 'Pencak Silat', category: 'Olahraga Kombatif', target:{ LTBT:5, LBB:2, LT:4, LK:5, L40M:4, MFT:3 } },
  { name: 'Renang Jarak Pendek', category: 'Olahraga Individu', target:{ LTBT:3, LBB:1, LT:4, LK:3, L40M:4, MFT:4 } },
  { name: 'Renang Jarak Jauh', category: 'Olahraga Individu', target:{ LTBT:3, LBB:1, LT:3, LK:3, L40M:3, MFT:5 } },
  { name: 'Senam', category: 'Olahraga Artistik', target:   { LTBT:5, LBB:1, LT:5, LK:5, L40M:3, MFT:3 } },
  { name: 'Sepakbola', category: 'Olahraga Tim', target:   { LTBT:4, LBB:2, LT:3, LK:5, L40M:4, MFT:4 } },
  { name: 'Sepak Takraw', category: 'Olahraga Net', target:{ LTBT:5, LBB:1, LT:5, LK:5, L40M:4, MFT:3 } },
  { name: 'Sepeda', category: 'Olahraga Individu', target: { LTBT:2, LBB:1, LT:4, LK:3, L40M:3, MFT:5 } },
  { name: 'Softball', category: 'Olahraga Tim', target:    { LTBT:4, LBB:5, LT:3, LK:3, L40M:3, MFT:2 } },
  { name: 'Squash', category: 'Olahraga Net', target:      { LTBT:5, LBB:2, LT:3, LK:5, L40M:4, MFT:4 } },
  { name: 'Steeplechase', category: 'Olahraga Individu', target:{ LTBT:3, LBB:1, LT:4, LK:4, L40M:3, MFT:5 } },
  { name: 'Taekwondo', category: 'Olahraga Kombatif', target:{ LTBT:5, LBB:2, LT:4, LK:5, L40M:4, MFT:3 } },
  { name: 'Tenis', category: 'Olahraga Net', target:       { LTBT:4, LBB:3, LT:3, LK:4, L40M:3, MFT:3 } },
  { name: 'Tenis Meja', category: 'Olahraga Net', target:  { LTBT:5, LBB:1, LT:2, LK:5, L40M:3, MFT:2 } },
  { name: 'Tinju', category: 'Olahraga Kombatif', target:  { LTBT:4, LBB:3, LT:4, LK:5, L40M:4, MFT:4 } },
  { name: 'Tolak Peluru', category: 'Olahraga Individu', target:{ LTBT:2, LBB:5, LT:5, LK:2, L40M:1, MFT:1 } }
]

/* =========================
   UI helpers
   ========================= */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-1 w-10 rounded bg-primary" />
      <h2 className="text-xl lg:text-2xl font-bold">{children}</h2>
    </div>
  )
}
function MiniBadge({ children }: { children: React.ReactNode }) {
  return <span className="px-2 py-0.5 rounded-full bg-blue-50 text-primary text-xs font-semibold">{children}</span>
}
function NormaTable({ data }: { data: AgeCategoryData }) {
  const rows: { label: IndicatorKey; unit: string; bands: GradeBands }[] = [
    { label: 'LTBT', unit: PROFIL_UNIT.LTBT, bands: data.LTBT },
    { label: 'LBB',  unit: PROFIL_UNIT.LBB,  bands: data.LBB  },
    { label: 'LT',   unit: PROFIL_UNIT.LT,   bands: data.LT   },
    { label: 'LK',   unit: PROFIL_UNIT.LK,   bands: data.LK   },
    { label: 'L40M', unit: PROFIL_UNIT.L40M, bands: data.L40M },
    { label: 'MFT',  unit: PROFIL_UNIT.MFT,  bands: data.MFT  }
  ]
  return (
    <div className="overflow-x-auto hide-scrollbar">
      <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
        <thead className="bg-blue-50 text-slate-700">
          <tr>
            <th className="px-3 py-2 text-left">Indikator</th>
            <th className="px-3 py-2 text-left">Satuan</th>
            <th className="px-3 py-2 text-left">A (5)</th>
            <th className="px-3 py-2 text-left">B (4)</th>
            <th className="px-3 py-2 text-left">C (3)</th>
            <th className="px-3 py-2 text-left">D (2)</th>
            <th className="px-3 py-2 text-left">E (1)</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r, idx) => (
            <tr key={r.label} className={idx % 2 ? 'bg-white' : 'bg-white/60'}>
              <td className="px-3 py-2 font-medium">{r.label}</td>
              <td className="px-3 py-2 text-slate-500">{r.unit}</td>
              <td className="px-3 py-2">{r.bands.A}</td>
              <td className="px-3 py-2">{r.bands.B}</td>
              <td className="px-3 py-2">{r.bands.C}</td>
              <td className="px-3 py-2">{r.bands.D}</td>
              <td className="px-3 py-2">{r.bands.E}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Accordion({
  title,
  children,
  defaultOpen = false
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  return (
    <details className="group card p-4 animate-fadeIn" open={defaultOpen}>
      <summary className="cursor-pointer list-none flex items-center justify-between">
        <div className="font-semibold">{title}</div>
        <div className="text-slate-400 transition group-open:rotate-90">›</div>
      </summary>
      <div className="mt-4">
        {children}
      </div>
    </details>
  )
}

function SportTargetsTable({ rows }: { rows: SportTarget[] }) {
  return (
    <div className="overflow-x-auto hide-scrollbar">
      <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
        <thead className="bg-blue-50 text-slate-700">
          <tr>
            <th className="px-3 py-2 text-left">Cabang</th>
            <th className="px-3 py-2 text-left">Kategori</th>
            <th className="px-3 py-2 text-left">LTBT</th>
            <th className="px-3 py-2 text-left">LBB</th>
            <th className="px-3 py-2 text-left">LT</th>
            <th className="px-3 py-2 text-left">LK</th>
            <th className="px-3 py-2 text-left">L40M</th>
            <th className="px-3 py-2 text-left">MFT</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((s, i) => (
            <tr key={`${s.name}-${i}`} className={i % 2 ? 'bg-white' : 'bg-white/60'}>
              <td className="px-3 py-2 font-medium">{s.name}</td>
              <td className="px-3 py-2 text-slate-600">{s.category}</td>
              <td className="px-3 py-2">{s.target.LTBT}</td>
              <td className="px-3 py-2">{s.target.LBB}</td>
              <td className="px-3 py-2">{s.target.LT}</td>
              <td className="px-3 py-2">{s.target.LK}</td>
              <td className="px-3 py-2">{s.target.L40M}</td>
              <td className="px-3 py-2">{s.target.MFT}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-slate-500">
        Keterangan: skor target 1–5 menunjukkan kebutuhan relatif cabang di tiap indikator (1= rendah, 3= sedang, 5= sangat tinggi).
      </p>
    </div>
  )
}

/* =========================
   Page
   ========================= */
export default function NormaPenilaian() {
  const [gender, setGender] = useState<Gender>('Putri')
  const [categoryFilter, setCategoryFilter] = useState<string>('Semua')

  const ages: Age[] = useMemo(() => [11, 12, 13, 14, 15], [])
  const dataByAge = NORMA[gender]

  const categories = useMemo(() => {
    const uniq = Array.from(new Set(SPORTS.map(s => s.category)))
    return ['Semua', ...uniq]
  }, [])

  const filteredSports = useMemo(() => {
    if (categoryFilter === 'Semua') return SPORTS
    return SPORTS.filter(s => s.category === categoryFilter)
  }, [categoryFilter])

  const thresholdPct = Math.round((DEFAULT_RECO_THRESHOLD ?? 0.7) * 100)

  return (
    <AppLayout title="Norma Penilaian">
      {/* Hero kecil + shimmer */}
      <div
        className="
          mb-6 h-1 w-32 rounded-full 
          bg-[linear-gradient(90deg,#2563eb,#06b6d4,#2563eb)]
          bg-[length:200%_100%] animate-shimmer
        "
      />

      {/* ===== A. Profil Keberbakatan ===== */}
      <SectionTitle>A. Profil Keberbakatan Cabang Olahraga</SectionTitle>
      <div className="card p-5 animate-fadeIn">
        <p className="text-slate-700">
          Terdiri dari 6 indikator yang diuji per anak. Nilai diinput manual oleh penguji/pelatih, kemudian diolah pada bagian norma.
        </p>
        <ul className="mt-4 grid sm:grid-cols-2 gap-3">
          <li><MiniBadge>LTBT</MiniBadge> Lempar Tangkap Bola Tenis — <span className="text-slate-600">satuan: {PROFIL_UNIT.LTBT}</span></li>
          <li><MiniBadge>LBB</MiniBadge> Lempar Bola Basket — <span className="text-slate-600">satuan: {PROFIL_UNIT.LBB}</span></li>
          <li><MiniBadge>LT</MiniBadge> Lompat Tegak — <span className="text-slate-600">satuan: {PROFIL_UNIT.LT}</span></li>
          <li><MiniBadge>LK</MiniBadge> Lari Kelincahan — <span className="text-slate-600">satuan: {PROFIL_UNIT.LK}</span></li>
          <li><MiniBadge>L40M</MiniBadge> Lari 40 Meter — <span className="text-slate-600">satuan: {PROFIL_UNIT.L40M}</span></li>
          <li><MiniBadge>MFT</MiniBadge> Multistage Fitness Test — <span className="text-slate-600">satuan: {PROFIL_UNIT.MFT}</span></li>
        </ul>

        <div className="mt-4 p-3 rounded-lg bg-slate-50 text-xs text-slate-600">
          <span className="font-medium">Catatan perubahan nama indikator:</span>{' '}
          Koordinasi = <em>LTBT</em>, Lempar Bola Basket = <em>LBB</em>, Power Tungkai = <em>LT</em>,
          Lari Bolak-Balik 5 Meter = <em>LK</em>, Lari 40 Meter = <em>L40M</em>, VO₂ Max = <em>MFT</em>.
        </div>
      </div>

      {/* ===== B. Norma Penilaian Hasil Tes ===== */}
      <div className="mt-10">
        <SectionTitle>B. Norma Penilaian Hasil Tes</SectionTitle>

        {/* Tab Gender */}
        <div className="inline-flex gap-2 rounded-xl border p-1 bg-white shadow-sm">
          {(['Putri','Putra'] as Gender[]).map(g => (
            <button
              key={g}
              onClick={()=>setGender(g)}
              className={`px-4 py-2 rounded-lg transition ${gender===g ? 'bg-primary text-white' : 'text-slate-700 hover:bg-blue-50'}`}
            >
              {g}
            </button>
          ))}
        </div>
        <p className="mt-3 text-slate-600">
          Pilih gender, lalu buka kategori usia untuk melihat rentang skor <em>A (5)</em> s/d <em>E (1)</em> tiap indikator.
        </p>

        <div className="mt-5 space-y-4">
          {ages.map((age, idx) => (
            <Accordion
              key={age}
              title={`${gender} Usia ${age} Tahun`}
              defaultOpen={idx === 0}
            >
              <NormaTable data={dataByAge[age]} />
            </Accordion>
          ))}
        </div>
      </div>

      {/* ===== C. Indikator Cabang Olahraga ===== */}
      <div className="mt-10">
        <SectionTitle>C. Indikator Cabang Olahraga</SectionTitle>
        <div className="card p-5 animate-fadeIn space-y-4">
          <p className="text-slate-700">
            Tiap cabang olahraga memiliki <span className="font-semibold">skor target</span> (1–5) untuk 6 indikator.
            Skor target merepresentasikan kebutuhan relatif cabang terhadap indikator tersebut (1 = rendah, 3 = sedang, 5 = sangat tinggi).
            Daftar di bawah sekaligus memuat <em>kategori</em> cabang sebagaimana kamu tentukan.
          </p>

          {/* Filter kategori kecil */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-600">Filter kategori:</span>
            <select
              className="rounded-xl border px-3 py-2 bg-white"
              value={categoryFilter}
              onChange={(e)=>setCategoryFilter(e.target.value)}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <SportTargetsTable rows={filteredSports} />
        </div>
      </div>

      {/* ===== D. Penentuan Potensi Cabang Olahraga ===== */}
      <div className="mt-10">
        <SectionTitle>D. Penentuan Potensi Cabang Olahraga</SectionTitle>
        <div className="card p-5 animate-fadeIn space-y-4">
          <p className="text-slate-700">
            Setelah nilai mentah anak dikonversi ke <b>skor 1–5 per indikator</b> (A–E ≡ 5–1) sesuai norma usia/gender,
            sistem mencocokkan skor anak dengan <b>vektor target</b> tiap cabang (lihat bagian C) menggunakan
            <span className="font-semibold"> jarak Manhattan</span>:
          </p>
          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            <div><code>d(s, t) = |s<sub>LTBT</sub> − t<sub>LTBT</sub>| + |s<sub>LBB</sub> − t<sub>LBB</sub>| + |s<sub>LT</sub> − t<sub>LT</sub>| + |s<sub>LK</sub> − t<sub>LK</sub>| + |s<sub>L40M</sub> − t<sub>L40M</sub>| + |s<sub>MFT</sub> − t<sub>MFT</sub>|</code></div>
            <div className="mt-1 text-slate-600">d ∈ [0, 24] karena ada 6 indikator, selisih maksimum per indikator 4 (rentang 1–5).</div>
          </div>
          <p className="text-slate-700">
            Jarak ini dinormalisasi menjadi <b>skor kedekatan</b> (0–100%):
          </p>
          <div className="rounded-lg bg-slate-50 p-3 text-sm">
            <code>kedekatan = (1 − d/24) × 100%</code>
          </div>
          <p className="text-slate-700">
            Sebuah cabang <b>direkomendasikan</b> bila kedekatan <b>≥ {thresholdPct}%</b> (default).
            Hasil kemudian diurutkan dari kedekatan tertinggi (Top-N ditampilkan pada halaman Statistik Anak).
          </p>

          <div className="rounded-lg bg-white border p-4">
            <div className="font-semibold mb-2">Contoh Perhitungan</div>
            <ol className="text-sm list-decimal pl-5 space-y-1 text-slate-700">
              <li>Skor anak (setelah norma): s = (LTBT=4, LBB=3, LT=5, LK=2, L40M=3, MFT=4)</li>
              <li>Target <em>Bola Basket</em> (bagian C): t = (4, 4, 4, 4, 4, 3)</li>
              <li>d = |4−4| + |3−4| + |5−4| + |2−4| + |3−4| + |4−3| = 0 + 1 + 1 + 2 + 1 + 1 = <b>6</b></li>
              <li>kedekatan = (1 − 6/24) × 100% = (1 − 0.25) × 100% = <b>75%</b> → <b>Direkomendasikan</b> (≥ {thresholdPct}%).</li>
            </ol>
          </div>

          <p className="text-xs text-slate-500">
            Catatan: Bila dua cabang memiliki kedekatan sama, tie-breaker dapat menggunakan total skor anak (lebih tinggi diutamakan) atau
            prioritas kategori/kurikulum (opsional).
          </p>
        </div>
      </div>

      {/* ===== E. Klasifikasi Potensi Atlet (metode baru) ===== */}
      <div className="mt-10">
        <SectionTitle>E. Klasifikasi Potensi Atlet (Metode Baru)</SectionTitle>
        <div className="card p-5 animate-fadeIn space-y-4">
          <p className="text-slate-700">
            Sistem mengelompokkan potensi berdasarkan jumlah cabang yang melewati ambang kedekatan {thresholdPct}% pada bagian D:
          </p>

          <div className="overflow-x-auto hide-scrollbar">
            <table className="w-full text-sm">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-3 py-2 text-left">Jumlah Cabang Direkomendasikan</th>
                  <th className="px-3 py-2 text-left">Klasifikasi</th>
                  <th className="px-3 py-2 text-left">Interpretasi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-3 py-2">≥ 7</td>
                  <td className="px-3 py-2 font-medium">Sangat Potensial</td>
                  <td className="px-3 py-2 text-slate-600">Spektrum kecocokan sangat luas di banyak cabang.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">5 – 6</td>
                  <td className="px-3 py-2 font-medium">Potensial</td>
                  <td className="px-3 py-2 text-slate-600">Banyak cabang cocok; peluang pembinaan multi-opsi.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">3 – 4</td>
                  <td className="px-3 py-2 font-medium">Cukup Potensial</td>
                  <td className="px-3 py-2 text-slate-600">Ada beberapa cabang yang menjanjikan.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">1 – 2</td>
                  <td className="px-3 py-2 font-medium">Kurang Potensial</td>
                  <td className="px-3 py-2 text-slate-600">Butuh peningkatan fisik/teknik untuk memperluas opsi.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2">0</td>
                  <td className="px-3 py-2 font-medium">Tidak Potensial</td>
                  <td className="px-3 py-2 text-slate-600">Belum ada kecocokan yang memenuhi ambang saat ini.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-slate-500">
            Ambang bisa disesuaikan di sistem.
          </p>
        </div>
      </div>

      {/* back to top */}
      <div className="mt-8 text-right">
        <a href="#" className="text-primary hover:underline">Kembali ke atas ↑</a>
      </div>
    </AppLayout>
  )
}
