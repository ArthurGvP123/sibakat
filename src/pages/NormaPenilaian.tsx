// src/pages/NormaPenilaian.tsx
import { useMemo, useState } from 'react'
import AppLayout from '../components/Navbar'
import { DEFAULT_RECO_THRESHOLD } from '../lib/norma'
import { 
  BookOpen, 
  Activity, 
  Target, 
  Calculator, 
  Award, 
  ChevronDown, 
  Filter 
} from 'lucide-react'

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
   DATA NORMA (TETAP)
   ========================= */
const NORMA: Record<Gender, Record<Age, AgeCategoryData>> = {
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
   DATA SPORT TARGETS (TETAP)
   ========================= */
type SportTarget = {
  name: string
  category: string
  target: Record<IndicatorKey, 1|2|3|4|5>
}

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
  { name: 'Panahan', category: 'Olahraga Target', target:   { LTBT:5, LBB:2, LT:2, LK:3, L40M:1, MFT:2 } },
  { name: 'Panjat Tebing', category: 'Olahraga Individu', target:{ LTBT:5, LBB:5, LT:5, LK:4, L40M:4, MFT:4 } },
  { name: 'Pencak Silat', category: 'Olahraga Kombatif', target:{ LTBT:4, LBB:5, LT:5, LK:5, L40M:4, MFT:4 } },
  { name: 'Renang Jarak Pendek', category: 'Olahraga Individu', target:{ LTBT:3, LBB:5, LT:5, LK:3, L40M:5, MFT:4 } },
  { name: 'Renang Jarak Jauh', category: 'Olahraga Individu', target:{ LTBT:3, LBB:4, LT:5, LK:3, L40M:4, MFT:5 } },
  { name: 'Senam', category: 'Olahraga Artistik', target:   { LTBT:4, LBB:5, LT:5, LK:5, L40M:4, MFT:2 } },
  { name: 'Sepakbola', category: 'Olahraga Tim', target:   { LTBT:4, LBB:4, LT:3, LK:4, L40M:4, MFT:4 } },
  { name: 'Sepak Takraw', category: 'Olahraga Net', target:{ LTBT:4, LBB:5, LT:5, LK:5, L40M:4, MFT:4 } },
  { name: 'Sepeda', category: 'Olahraga Individu', target: { LTBT:4, LBB:5, LT:5, LK:4, L40M:4, MFT:5 } },
  { name: 'Softball', category: 'Olahraga Tim', target:    { LTBT:5, LBB:4, LT:4, LK:4, L40M:4, MFT:4 } },
  { name: 'Squash', category: 'Olahraga Net', target:      { LTBT:5, LBB:4, LT:5, LK:5, L40M:5, MFT:4 } },
  { name: 'Steeplechase', category: 'Olahraga Individu', target:{ LTBT:2, LBB:5, LT:1, LK:4, L40M:4, MFT:5 } },
  { name: 'Taekwondo', category: 'Olahraga Kombatif', target:{ LTBT:4, LBB:5, LT:5, LK:5, L40M:4, MFT:4 } },
  { name: 'Tenis', category: 'Olahraga Net', target:       { LTBT:5, LBB:5, LT:5, LK:5, L40M:4, MFT:5 } },
  { name: 'Tenis Meja', category: 'Olahraga Net', target:  { LTBT:5, LBB:3, LT:3, LK:3, L40M:3, MFT:3 } },
  { name: 'Tinju', category: 'Olahraga Kombatif', target:  { LTBT:4, LBB:3, LT:5, LK:4, L40M:4, MFT:4 } },
  { name: 'Tolak Peluru', category: 'Olahraga Individu', target:{ LTBT:3, LBB:4, LT:5, LK:2, L40M:2, MFT:1 } }
]

/* =========================
   COMPONENTS
   ========================= */

// Header Section dengan Ikon
function SectionHeader({ 
  icon: Icon, 
  title, 
  subtitle 
}: { 
  icon: React.ElementType, 
  title: string, 
  subtitle?: string 
}) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
        <Icon size={28} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        {subtitle && <p className="text-slate-500 mt-1 text-sm">{subtitle}</p>}
      </div>
    </div>
  )
}

// Tabel Norma dalam Accordion Modern
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
    <details className="group bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-4 transition-all duration-300 open:shadow-md" open={defaultOpen}>
      <summary className="cursor-pointer list-none flex items-center justify-between p-5 bg-white hover:bg-slate-50 transition-colors">
        <div className="font-semibold text-slate-800 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          {title}
        </div>
        <div className="text-slate-400 group-open:rotate-180 transition-transform duration-300">
          <ChevronDown size={20} />
        </div>
      </summary>
      <div className="px-5 pb-5 pt-0 border-t border-slate-100 animate-fadeIn">
        {children}
      </div>
    </details>
  )
}

// Tabel Norma
function NormaTable({ data }: { data: AgeCategoryData }) {
  const rows: { label: string; key: IndicatorKey; unit: string; bands: GradeBands }[] = [
    { label: 'Lempar Tangkap Bola Tenis', key: 'LTBT', unit: PROFIL_UNIT.LTBT, bands: data.LTBT },
    { label: 'Lempar Bola Basket',        key: 'LBB',  unit: PROFIL_UNIT.LBB,  bands: data.LBB  },
    { label: 'Loncat Tegak',              key: 'LT',   unit: PROFIL_UNIT.LT,   bands: data.LT   },
    { label: 'Lari Kelincahan',           key: 'LK',   unit: PROFIL_UNIT.LK,   bands: data.LK   },
    { label: 'Lari 40 Meter',             key: 'L40M', unit: PROFIL_UNIT.L40M, bands: data.L40M },
    { label: 'Lari Multitahap',           key: 'MFT',  unit: PROFIL_UNIT.MFT,  bands: data.MFT  }
  ]
  
  return (
    <div className="overflow-x-auto mt-4 rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-700 font-semibold">
          <tr>
            <th className="px-4 py-3 text-left w-1/4">Indikator</th>
            <th className="px-4 py-3 text-left">Satuan</th>
            <th className="px-4 py-3 text-center bg-blue-50 text-blue-700">A (5)</th>
            <th className="px-4 py-3 text-center bg-emerald-50 text-emerald-700">B (4)</th>
            <th className="px-4 py-3 text-center bg-yellow-50 text-yellow-700">C (3)</th>
            <th className="px-4 py-3 text-center bg-orange-50 text-orange-700">D (2)</th>
            <th className="px-4 py-3 text-center bg-red-50 text-red-700">E (1)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((r) => (
            <tr key={r.key} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 font-medium text-slate-800">{r.label}</td>
              <td className="px-4 py-3 text-slate-500 text-xs">{r.unit}</td>
              <td className="px-4 py-3 text-center font-mono text-slate-600 bg-blue-50/30">{r.bands.A}</td>
              <td className="px-4 py-3 text-center font-mono text-slate-600 bg-emerald-50/30">{r.bands.B}</td>
              <td className="px-4 py-3 text-center font-mono text-slate-600 bg-yellow-50/30">{r.bands.C}</td>
              <td className="px-4 py-3 text-center font-mono text-slate-600 bg-orange-50/30">{r.bands.D}</td>
              <td className="px-4 py-3 text-center font-mono text-slate-600 bg-red-50/30">{r.bands.E}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Tabel Target Cabang Olahraga
function SportTargetsTable({ rows }: { rows: SportTarget[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 mt-4">
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-700 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-4 py-3 text-left">Cabang Olahraga</th>
              <th className="px-4 py-3 text-left">Kategori</th>
              <th className="px-4 py-3 text-center" title="Lempar Tangkap Bola Tenis">LTBT</th>
              <th className="px-4 py-3 text-center" title="Lempar Bola Basket">LBB</th>
              <th className="px-4 py-3 text-center" title="Loncat Tegak">LT</th>
              <th className="px-4 py-3 text-center" title="Lari Kelincahan">LK</th>
              <th className="px-4 py-3 text-center" title="Lari 40 Meter">L40M</th>
              <th className="px-4 py-3 text-center" title="Lari Multitahap">MFT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((s, i) => (
              <tr key={`${s.name}-${i}`} className="hover:bg-blue-50/50 transition-colors">
                <td className="px-4 py-3 font-medium text-slate-800">{s.name}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">
                  <span className="px-2 py-1 bg-slate-100 rounded-md">{s.category}</span>
                </td>
                <td className="px-4 py-3 text-center text-slate-600">{s.target.LTBT}</td>
                <td className="px-4 py-3 text-center text-slate-600">{s.target.LBB}</td>
                <td className="px-4 py-3 text-center text-slate-600">{s.target.LT}</td>
                <td className="px-4 py-3 text-center text-slate-600">{s.target.LK}</td>
                <td className="px-4 py-3 text-center text-slate-600">{s.target.L40M}</td>
                <td className="px-4 py-3 text-center text-slate-600">{s.target.MFT}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 text-xs text-slate-500 flex items-center gap-2">
        <InfoBadge />
        Skor target 1–5 menunjukkan kebutuhan relatif cabang (1=Rendah, 3=Sedang, 5=Sangat Tinggi).
      </div>
    </div>
  )
}

function InfoBadge() {
  return <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">i</div>
}

/* =========================
   PAGE COMPONENT
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
      <div className="max-w-5xl mx-auto space-y-12 pb-12 animate-fadeIn">
        
        {/* ===== A. Profil Keberbakatan ===== */}
        <section>
          <SectionHeader 
            icon={BookOpen} 
            title="A. Profil Keberbakatan" 
            subtitle="Indikator fisik yang diukur dalam tes identifikasi bakat."
          />
          <div className="card p-6 border border-slate-200 shadow-sm bg-white">
            <p className="text-slate-600 mb-6 leading-relaxed">
              Terdiri dari 6 indikator utama yang diuji. Nilai mentah (raw data) dari lapangan akan dikonversi menjadi skor 1-5 berdasarkan tabel norma.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <IndicatorCard code="LTBT" label="Lempar Tangkap Bola Tenis" unit={PROFIL_UNIT.LTBT} />
              <IndicatorCard code="LBB" label="Lempar Bola Basket" unit={PROFIL_UNIT.LBB} />
              <IndicatorCard code="LT" label="Loncat Tegak" unit={PROFIL_UNIT.LT} />
              <IndicatorCard code="LK" label="Lari Kelincahan" unit={PROFIL_UNIT.LK} />
              <IndicatorCard code="L40M" label="Lari 40 Meter" unit={PROFIL_UNIT.L40M} />
              <IndicatorCard code="MFT" label="Lari Multitahap" unit={PROFIL_UNIT.MFT} />
            </div>
            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800 flex gap-3">
              <div className="shrink-0 mt-0.5"><InfoBadge /></div>
              <div>
                <strong>Catatan Perubahan Istilah:</strong> Koordinasi = <em>Lempar Tangkap Bola Tenis</em>, Power Tungkai = <em>Loncat Tegak</em>, VO₂ Max = <em>Lari Multitahap</em>.
              </div>
            </div>
          </div>
        </section>

        {/* ===== B. Norma Penilaian ===== */}
        <section>
          <SectionHeader 
            icon={Activity} 
            title="B. Norma Penilaian Hasil Tes" 
            subtitle="Tabel konversi nilai mentah menjadi skor 1-5 berdasarkan usia dan gender."
          />
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            {/* Gender Switcher */}
            <div className="flex justify-center mb-8">
              <div className="bg-slate-100 p-1.5 rounded-xl inline-flex shadow-inner">
                {(['Putri','Putra'] as Gender[]).map(g => (
                  <button
                    key={g}
                    onClick={()=>setGender(g)}
                    className={`
                      px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                      ${gender===g 
                        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
                    `}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
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
        </section>

        {/* ===== C. Indikator Cabang Olahraga ===== */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <SectionHeader 
              icon={Target} 
              title="C. Target Cabang Olahraga" 
              subtitle="Profil kebutuhan fisik untuk 42 cabang olahraga."
            />
            {/* Filter Kategori */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
              <Filter size={16} className="text-slate-400" />
              <select
                className="bg-transparent text-sm font-medium text-slate-700 outline-none cursor-pointer"
                value={categoryFilter}
                onChange={(e)=>setCategoryFilter(e.target.value)}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="card p-6 bg-white border border-slate-200 shadow-sm">
            <SportTargetsTable rows={filteredSports} />
          </div>
        </section>

        {/* ===== D. Penentuan Potensi (Restore Full Content) ===== */}
        <section className="space-y-8">
            <SectionHeader 
              icon={Calculator} 
              title="D. Penentuan Potensi Cabang Olahraga"
              subtitle="Cara menghitung potensi cabor anak."
            />
            <div className="card p-6 md:p-8 bg-white text-slate-700 shadow-sm border border-slate-200 space-y-6">
              <p>
                Setelah nilai mentah anak dikonversi ke <b>skor 1–5 per indikator</b> (A–E ≡ 5–1) sesuai norma usia/gender,
                sistem mencocokkan skor anak dengan <b>vektor target</b> tiap cabang (lihat bagian C) menggunakan
                <span className="font-semibold text-primary"> jarak Manhattan</span>:
              </p>
              
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 text-sm font-mono overflow-x-auto">
                <div className="mb-2"><strong>Rumus Jarak (d):</strong></div>
                <div>d(s, t) = |s<sub>LTBT</sub> − t<sub>LTBT</sub>| + |s<sub>LBB</sub> − t<sub>LBB</sub>| + |s<sub>LT</sub> − t<sub>LT</sub>| + |s<sub>LK</sub> − t<sub>LK</sub>| + |s<sub>L40M</sub> − t<sub>L40M</sub>| + |s<sub>MFT</sub> − t<sub>MFT</sub>|</div>
                <div className="mt-3 text-slate-500 italic text-xs font-sans">
                  *d ∈ [0, 24] karena ada 6 indikator, dengan selisih maksimum per indikator adalah 4 (rentang 1–5).
                </div>
              </div>

              <p>
                Jarak ini kemudian dinormalisasi menjadi <b>skor kedekatan</b> (0–100%):
              </p>
              
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 text-sm font-mono inline-block">
                <code>kedekatan = (1 − d/24) × 100%</code>
              </div>

              <p>
                Sebuah cabang <b>direkomendasikan</b> bila kedekatan <b>≥ {thresholdPct}%</b> (default).
                Hasil kemudian diurutkan dari kedekatan tertinggi (Top-N ditampilkan pada halaman Statistik Anak).
              </p>

              <div className="rounded-xl bg-blue-50/50 border border-blue-100 p-5">
                <div className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <Calculator size={18} /> Contoh Perhitungan
                </div>
                <ol className="text-sm list-decimal pl-5 space-y-2 text-slate-700">
                  <li>
                    <strong>Skor anak (s):</strong> LTBT=4, LBB=3, LT=5, LK=2, L40M=3, MFT=4
                  </li>
                  <li>
                    <strong>Target <em>Bola Basket</em> (t):</strong> 4, 4, 4, 4, 4, 3
                  </li>
                  <li>
                    <strong>Hitung Jarak (d):</strong><br/>
                    |4−4| + |3−4| + |5−4| + |2−4| + |3−4| + |4−3| <br/>
                    = 0 + 1 + 1 + 2 + 1 + 1 <br/>
                    = <strong>6</strong>
                  </li>
                  <li>
                    <strong>Hitung Kedekatan:</strong><br/>
                    (1 − 6/24) × 100% = (1 − 0.25) × 100% = <strong>75%</strong>
                  </li>
                </ol>
                <div className="mt-4 pt-3 border-t border-blue-200 text-blue-900 font-medium text-sm">
                  → Hasil: <strong>Direkomendasikan</strong> (karena ≥ {thresholdPct}%)
                </div>
              </div>

              <p className="text-sm text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                Catatan: Bila dua cabang memiliki kedekatan sama, tie-breaker dapat menggunakan total skor anak (lebih tinggi diutamakan) atau
                prioritas kategori/kurikulum (opsional).
              </p>
            </div>
        </section>

        {/* ===== E. Klasifikasi Potensi (Separate Section) ===== */}
        <section>
          <SectionHeader 
            icon={Award} 
            title="E. Klasifikasi Potensi Atlet" 
            subtitle="Kategori klasifikasi potensi anak."
          />
          <div className="card p-0 overflow-hidden border border-slate-200 shadow-sm bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left">Jumlah Cabang Direkomendasikan</th>
                  <th className="px-6 py-4 text-left">Klasifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-emerald-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-600 font-medium">≥ 7</td>
                  <td className="px-6 py-4"><span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200">Sangat Potensial</span></td>
                </tr>
                <tr className="hover:bg-green-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-600 font-medium">5 – 6</td>
                  <td className="px-6 py-4"><span className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 text-xs font-bold border border-green-200">Potensial</span></td>
                </tr>
                <tr className="hover:bg-amber-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-600 font-medium">3 – 4</td>
                  <td className="px-6 py-4"><span className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200">Cukup Potensial</span></td>
                </tr>
                <tr className="hover:bg-orange-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-600 font-medium">1 – 2</td>
                  <td className="px-6 py-4"><span className="px-3 py-1.5 rounded-lg bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200">Kurang Potensial</span></td>
                </tr>
                <tr className="hover:bg-red-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-600 font-medium">0</td>
                  <td className="px-6 py-4"><span className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-bold border border-red-200">Tidak Potensial</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </AppLayout>
  )
}

// --- Component Kartu Indikator ---
function IndicatorCard({ code, label, unit }: { code: string, label: string, unit: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all group">
      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shadow-sm group-hover:text-blue-600 group-hover:border-blue-200">
        {code}
      </div>
      <div>
        <div className="font-semibold text-slate-800 text-sm group-hover:text-blue-700">{label}</div>
        <div className="text-xs text-slate-500">Satuan: {unit}</div>
      </div>
    </div>
  )
}