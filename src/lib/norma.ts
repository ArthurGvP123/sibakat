// src/lib/norma.ts
// Mesin scoring 1–5 untuk 6 indikator + rekomendasi 42 cabang olahraga
// Update:
// - Threshold rekomendasi (default 75%) & top-N default 6
// - Mengembalikan meta {recommendedCount, totalEvaluated, threshold, limit, potentialCategory}
// - Ekspor util potentialCategoryFromCount() sesuai aturan baru

export type Gender = 'Putra' | 'Putri'

export type RawIndicators = {
  ltbt?: number   // kali (lebih tinggi lebih baik)
  lbb?: number    // meter (lebih tinggi lebih baik)
  lt?: number     // cm (lebih tinggi lebih baik)
  lk?: number     // detik (lebih rendah lebih baik)
  l40m?: number   // detik (lebih rendah lebih baik)
  mftLevel?: number // 1..11
  mftShuttle?: number // 1..11
}

export type Score6 = {
  ltbt?: number
  lbb?: number
  lt?: number
  lk?: number
  l40m?: number
  mft?: number
}

export type ChildProfile = {
  gender: Gender
  usia: number  // 11..15
} & RawIndicators

// ====== Konstanta rekomendasi ======
export const DEFAULT_RECO_THRESHOLD = 0.75 // 75%
export const DEFAULT_RECO_LIMIT = 6

// Tipe rekomendasi untuk UI modern
export type Recommendation = {
  sport: string
  match: number     // 0..1
  matchPct: number  // 0..100 (dibulatkan)
  distance: number  // rata-rata |score-target| (1..5), semakin kecil semakin baik
  target: { ltbt: number; lbb: number; lt: number; lk: number; l40m: number; mft: number }
}

// ====== Kategori Potensi (berdasarkan jumlah rekomendasi) ======
export type PotentialCategory =
  | 'Sangat Potensial'
  | 'Potensial'
  | 'Cukup Potensial'
  | 'Kurang Potensial'
  | 'Tidak Potensial'

/** Pemetaan jumlah rekomendasi → kategori */
export function potentialCategoryFromCount(count: number): PotentialCategory {
  if (count > 6) return 'Sangat Potensial'
  if (count >= 5) return 'Potensial'
  if (count >= 3) return 'Cukup Potensial'
  if (count >= 1) return 'Kurang Potensial'
  return 'Tidak Potensial'
}

// Helper MFT (gabungkan Level.Shuttle → float, contoh 4.3)
function mftToFloat(level?: number, shuttle?: number) {
  if (level == null || shuttle == null) return undefined
  return Number((level + (shuttle / 10)).toFixed(1))
}

// ====== TABEL NORMA (Putri & Putra, usia 11-15) ======
// Format: untuk setiap indikator menyediakan fungsi skor berdasar nilai & usia.
// Agar ringkas, threshold ditulis sebagai array range lalu fungsi finder.

type Band = { min?: number; max?: number; score: number } // min inclusive, max inclusive

function byHigher(value: number, bands: Band[]) {
  // bands diurutkan dari skor 5 → 1, pakai kondisi >= atau rentang [a..b]
  for (const b of bands) {
    const okMin = b.min === undefined ? true : value >= b.min
    const okMax = b.max === undefined ? true : value <= b.max
    if (okMin && okMax) return b.score
  }
  return 1
}
function byLower(value: number, bands: Band[]) {
  // untuk indikator "semakin kecil semakin baik" seperti LK & L40M
  // bands diurutkan dari skor 5 → 1 dengan kondisi <= atau rentang [a..b]
  for (const b of bands) {
    const okMin = b.min === undefined ? true : value >= b.min
    const okMax = b.max === undefined ? true : value <= b.max
    if (okMin && okMax) return b.score
  }
  return 1
}

type NormMap = Record<Gender, Record<number, {
  ltbt: (v: number) => number
  lbb: (v: number) => number
  lt: (v: number) => number
  lk: (v: number) => number
  l40m: (v: number) => number
  mft: (v: number) => number
}>>

const NORMA: NormMap = {
  Putri: {
    11: {
      ltbt: (v) => byHigher(v, [
        { min: 15, score: 5 },
        { min: 10, max: 14, score: 4 },
        { min: 6, max: 9, score: 3 },
        { min: 3, max: 5, score: 2 },
        { max: 2, score: 1 },
      ]),
      lbb: (v) => byHigher(v, [
        { min: 5.25, score: 5 },
        { min: 4.40, max: 5.24, score: 4 },
        { min: 3.50, max: 4.39, score: 3 },
        { min: 2.70, max: 3.49, score: 2 },
        { max: 2.69, score: 1 },
      ]),
      lt: (v) => byHigher(v, [
        { min: 35, score: 5 },
        { min: 29, max: 34, score: 4 },
        { min: 23, max: 28, score: 3 },
        { min: 17, max: 22, score: 2 },
        { max: 16, score: 1 },
      ]),
      lk: (v) => byLower(v, [
        { max: 19.75, score: 5 },
        { min: 19.76, max: 22.24, score: 4 },
        { min: 22.25, max: 24.73, score: 3 },
        { min: 24.74, max: 27.22, score: 2 },
        { min: 27.23, score: 1 },
      ]),
      l40m: (v) => byLower(v, [
        { max: 6.81, score: 5 },
        { min: 6.82, max: 7.76, score: 4 },
        { min: 7.77, max: 8.71, score: 3 },
        { min: 8.72, max: 9.66, score: 2 },
        { min: 9.67, score: 1 },
      ]),
      mft: (v) => byHigher(v, [
        { min: 7.2, score: 5 },
        { min: 5.2, max: 7.1, score: 4 },
        { min: 3.3, max: 5.1, score: 3 },
        { min: 2.3, max: 3.2, score: 2 },
        { max: 2.2, score: 1 },
      ]),
    },
    12: {
      ltbt: (v) => byHigher(v, [
        { min: 16, score: 5 },
        { min: 12, max: 15, score: 4 },
        { min: 7, max: 11, score: 3 },
        { min: 3, max: 6, score: 2 },
        { max: 2, score: 1 },
      ]),
      lbb: (v) => byHigher(v, [
        { min: 6.20, score: 5 },
        { min: 5.40, max: 6.19, score: 4 },
        { min: 4.65, max: 5.39, score: 3 },
        { min: 3.90, max: 4.64, score: 2 },
        { max: 3.89, score: 1 },
      ]),
      lt: (v) => byHigher(v, [
        { min: 36, score: 5 },
        { min: 30, max: 35, score: 4 },
        { min: 21, max: 29, score: 3 },
        { min: 19, max: 20, score: 2 },
        { max: 18, score: 1 },
      ]),
      lk: (v) => byLower(v, [
        { max: 18.96, score: 5 },
        { min: 18.97, max: 21.10, score: 4 },
        { min: 21.11, max: 23.24, score: 3 },
        { min: 23.25, max: 25.37, score: 2 },
        { min: 25.38, score: 1 },
      ]),
      l40m: (v) => byLower(v, [
        { max: 6.42, score: 5 },
        { min: 6.43, max: 7.19, score: 4 },
        { min: 7.20, max: 7.97, score: 3 },
        { min: 7.98, max: 8.73, score: 2 },
        { min: 8.74, score: 1 },
      ]),
      mft: (v) => byHigher(v, [
        { min: 7.7, score: 5 },
        { min: 6.0, max: 7.6, score: 4 },
        { min: 4.2, max: 5.9, score: 3 },
        { min: 2.5, max: 4.1, score: 2 },
        { max: 2.4, score: 1 },
      ]),
    },
    13: {
      ltbt: (v) => byHigher(v, [
        { min: 17, score: 5 },
        { min: 13, max: 16, score: 4 },
        { min: 8, max: 12, score: 3 },
        { min: 4, max: 7, score: 2 },
        { max: 3, score: 1 },
      ]),
      lbb: (v) => byHigher(v, [
        { min: 6.45, score: 5 },
        { min: 5.70, max: 6.44, score: 4 },
        { min: 4.90, max: 5.69, score: 3 },
        { min: 4.10, max: 4.89, score: 2 },
        { max: 4.09, score: 1 },
      ]),
      lt: (v) => byHigher(v, [
        { min: 38, score: 5 },
        { min: 32, max: 37, score: 4 },
        { min: 26, max: 31, score: 3 },
        { min: 21, max: 25, score: 2 },
        { max: 20, score: 1 },
      ]),
      lk: (v) => byLower(v, [
        { max: 18.17, score: 5 },
        { min: 18.18, max: 20.26, score: 4 },
        { min: 20.27, max: 22.36, score: 3 },
        { min: 22.37, max: 24.44, score: 2 },
        { min: 24.45, score: 1 },
      ]),
      l40m: (v) => byLower(v, [
        { max: 6.33, score: 5 },
        { min: 6.34, max: 7.07, score: 4 },
        { min: 7.08, max: 7.82, score: 3 },
        { min: 7.83, max: 8.54, score: 2 },
        { min: 8.55, score: 1 },
      ]),
      mft: (v) => byHigher(v, [
        { min: 8.1, score: 5 },
        { min: 6.3, max: 8.0, score: 4 },
        { min: 4.5, max: 6.2, score: 3 },
        { min: 2.7, max: 4.4, score: 2 },
        { max: 2.6, score: 1 },
      ]),
    },
    14: {
      ltbt: (v) => byHigher(v, [
        { min: 17, score: 5 },
        { min: 13, max: 16, score: 4 },
        { min: 8, max: 12, score: 3 },
        { min: 4, max: 7, score: 2 },
        { max: 3, score: 1 },
      ]),
      lbb: (v) => byHigher(v, [
        { min: 6.90, score: 5 },
        { min: 6.00, max: 6.89, score: 4 },
        { min: 5.10, max: 5.99, score: 3 },
        { min: 4.20, max: 5.09, score: 2 },
        { max: 4.19, score: 1 },
      ]),
      lt: (v) => byHigher(v, [
        { min: 39, score: 5 },
        { min: 33, max: 38, score: 4 },
        { min: 27, max: 32, score: 3 },
        { min: 22, max: 26, score: 2 },
        { max: 21, score: 1 },
      ]),
      lk: (v) => byLower(v, [
        { max: 17.38, score: 5 },
        { min: 17.39, max: 19.79, score: 4 },
        { min: 19.80, max: 22.21, score: 3 },
        { min: 22.22, max: 24.61, score: 2 },
        { min: 24.62, score: 1 },
      ]),
      l40m: (v) => byLower(v, [
        { max: 6.04, score: 5 },
        { min: 6.05, max: 6.88, score: 4 },
        { min: 6.89, max: 7.42, score: 3 },
        { min: 7.43, max: 8.55, score: 2 },
        { min: 8.56, score: 1 },
      ]),
      mft: (v) => byHigher(v, [
        { min: 8.1, score: 5 },
        { min: 6.3, max: 8.0, score: 4 },
        { min: 4.5, max: 6.2, score: 3 },
        { min: 2.7, max: 4.4, score: 2 },
        { max: 2.6, score: 1 },
      ]),
    },
    15: {
      ltbt: (v) => byHigher(v, [
        { min: 18, score: 5 },
        { min: 14, max: 17, score: 4 },
        { min: 9, max: 13, score: 3 },
        { min: 5, max: 8, score: 2 },
        { max: 4, score: 1 },
      ]),
      lbb: (v) => byHigher(v, [
        { min: 7.10, score: 5 },
        { min: 6.25, max: 7.09, score: 4 },
        { min: 5.40, max: 6.24, score: 3 },
        { min: 4.35, max: 5.39, score: 2 },
        { max: 4.34, score: 1 },
      ]),
      lt: (v) => byHigher(v, [
        { min: 41, score: 5 },
        { min: 34, max: 40, score: 4 },
        { min: 28, max: 33, score: 3 },
        { min: 23, max: 27, score: 2 },
        { max: 22, score: 1 },
      ]),
      lk: (v) => byLower(v, [
        { max: 16.92, score: 5 },
        { min: 16.93, max: 19.47, score: 4 },
        { min: 19.48, max: 22.03, score: 3 },
        { min: 22.03, max: 24.57, score: 2 }, // tumpang tindih kecil → disesuaikan
        { min: 24.58, score: 1 },
      ]),
      l40m: (v) => byLower(v, [
        { max: 5.99, score: 5 },
        { min: 5.98, max: 6.76, score: 4 },
        { min: 6.77, max: 7.54, score: 3 },
        { min: 7.55, max: 8.30, score: 2 },
        { min: 8.31, score: 1 },
      ]),
      mft: (v) => byHigher(v, [
        { min: 8.3, score: 5 },
        { min: 6.3, max: 8.2, score: 4 },
        { min: 4.5, max: 6.2, score: 3 },
        { min: 2.7, max: 4.4, score: 2 },
        { max: 2.6, score: 1 },
      ]),
    },
  },

  Putra: {
    11: {
      ltbt: (v) => byHigher(v, [
        { min: 17, score: 5 },
        { min: 12, max: 16, score: 4 },
        { min: 8, max: 11, score: 3 },
        { min: 4, max: 7, score: 2 },
        { max: 3, score: 1 },
      ]),
      lbb: (v) => byHigher(v, [
        { min: 5.90, score: 5 },
        { min: 5.10, max: 5.89, score: 4 },
        { min: 4.35, max: 5.09, score: 3 },
        { min: 3.35, max: 4.34, score: 2 },
        { max: 3.34, score: 1 },
      ]),
      lt: (v) => byHigher(v, [
        { min: 39, score: 5 },
        { min: 33, max: 38, score: 4 },
        { min: 26, max: 32, score: 3 },
        { min: 19, max: 25, score: 2 },
        { max: 18, score: 1 },
      ]),
      lk: (v) => byLower(v, [
        { max: 18.02, score: 5 },
        { min: 18.03, max: 20.71, score: 4 },
        { min: 20.72, max: 23.42, score: 3 },
        { min: 23.43, max: 26.13, score: 2 },
        { min: 26.14, score: 1 },
      ]),
      l40m: (v) => byLower(v, [
        { max: 6.78, score: 5 },
        { min: 6.79, max: 7.59, score: 4 },
        { min: 7.60, max: 8.40, score: 3 },
        { min: 8.41, max: 9.21, score: 2 },
        { min: 9.22, score: 1 },
      ]),
      mft: (v) => byHigher(v, [
        { min: 8.8, score: 5 },
        { min: 6.5, max: 8.7, score: 4 },
        { min: 4.2, max: 6.4, score: 3 },
        { min: 2.8, max: 4.2, score: 2 },
        { max: 2.7, score: 1 },
      ]),
    },
    12: {
      ltbt: (v) => byHigher(v, [
        { min: 17, score: 5 },
        { min: 14, max: 16, score: 4 },
        { min: 10, max: 13, score: 3 },
        { min: 6, max: 9, score: 2 },
        { max: 5, score: 1 },
      ]),
      lbb: (v) => byHigher(v, [
        { min: 6.80, score: 5 },
        { min: 6.00, max: 6.79, score: 4 },
        { min: 5.15, max: 5.99, score: 3 },
        { min: 4.30, max: 5.14, score: 2 },
        { max: 4.29, score: 1 },
      ]),
      lt: (v) => byHigher(v, [
        { min: 42, score: 5 },
        { min: 35, max: 41, score: 4 },
        { min: 28, max: 34, score: 3 },
        { min: 21, max: 27, score: 2 },
        { max: 20, score: 1 },
      ]),
      lk: (v) => byLower(v, [
        { max: 18.15, score: 5 },
        { min: 18.16, max: 20.07, score: 4 },
        { min: 20.08, max: 21.99, score: 3 },
        { min: 22.00, max: 23.91, score: 2 },
        { min: 23.92, score: 1 },
      ]),
      l40m: (v) => byLower(v, [
        { max: 6.05, score: 5 },
        { min: 6.06, max: 6.75, score: 4 },
        { min: 6.76, max: 7.45, score: 3 },
        { min: 7.46, max: 8.15, score: 2 },
        { min: 8.16, score: 1 },
      ]),
      mft: (v) => byHigher(v, [
        { min: 9.3, score: 5 },
        { min: 8.0, max: 9.2, score: 4 },
        { min: 5.7, max: 7.9, score: 3 },
        { min: 3.5, max: 5.6, score: 2 },
        { max: 3.4, score: 1 },
      ]),
    },
    13: {
      ltbt: (v) => byHigher(v, [
        { min: 18, score: 5 },
        { min: 15, max: 17, score: 4 },
        { min: 11, max: 14, score: 3 },
        { min: 7, max: 10, score: 2 },
        { max: 6, score: 1 },
      ]),
      lbb: (v) => byHigher(v, [
        { min: 8.05, score: 5 },
        { min: 6.85, max: 8.04, score: 4 },
        { min: 5.70, max: 6.84, score: 3 },
        { min: 4.50, max: 5.69, score: 2 },
        { max: 4.49, score: 1 },
      ]),
      lt: (v) => byHigher(v, [
        { min: 44, score: 5 },
        // catatan input sumber: range tampak tidak konsisten, dibuat inklusif
        { min: 27, max: 43, score: 4 },
        { min: 29, max: 37, score: 3 },
        { min: 22, max: 28, score: 2 },
        { max: 21, score: 1 },
      ]),
      lk: (v) => byLower(v, [
        { max: 16.60, score: 5 },
        { min: 16.61, max: 18.72, score: 4 },
        { min: 19.73, max: 20.84, score: 3 },
        { min: 20.85, max: 22.97, score: 2 },
        { min: 22.98, score: 1 },
      ]),
      l40m: (v) => byLower(v, [
        { max: 5.82, score: 5 },
        { min: 5.83, max: 6.56, score: 4 },
        { min: 6.57, max: 7.30, score: 3 },
        { min: 7.31, max: 8.04, score: 2 },
        { min: 8.05, score: 1 },
      ]),
      mft: (v) => byHigher(v, [
        { min: 10.2, score: 5 },
        { min: 8.9, max: 10.1, score: 4 },
        { min: 6.6, max: 8.8, score: 3 },
        { min: 4.3, max: 6.5, score: 2 },
        { max: 4.2, score: 1 },
      ]),
    },
    14: {
      ltbt: (v) => byHigher(v, [
        { min: 19, score: 5 },
        { min: 16, max: 18, score: 4 },
        { min: 12, max: 15, score: 3 },
        { min: 8, max: 11, score: 2 },
        { max: 7, score: 1 },
      ]),
      lbb: (v) => byHigher(v, [
        { min: 8.75, score: 5 },
        { min: 7.50, max: 8.74, score: 4 },
        { min: 6.25, max: 7.49, score: 3 },
        { min: 5.00, max: 6.24, score: 2 },
        { max: 5.49, score: 1 },
      ]),
      lt: (v) => byHigher(v, [
        { min: 47, score: 5 },
        { min: 40, max: 46, score: 4 },
        { min: 32, max: 39, score: 3 },
        { min: 25, max: 31, score: 2 },
        { max: 24, score: 1 },
      ]),
      lk: (v) => byLower(v, [
        { max: 16.42, score: 5 },
        { min: 16.43, max: 18.35, score: 4 },
        { min: 18.36, max: 20.29, score: 3 },
        { min: 20.30, max: 22.22, score: 2 },
        { min: 22.23, score: 1 },
      ]),
      l40m: (v) => byLower(v, [
        { max: 5.50, score: 5 },
        { min: 5.51, max: 6.21, score: 4 },
        { min: 6.22, max: 6.93, score: 3 },
        { min: 6.94, max: 7.64, score: 2 },
        { min: 7.65, score: 1 },
      ]),
      mft: (v) => byHigher(v, [
        { min: 11.4, score: 5 },
        { min: 9.2, max: 11.3, score: 4 },
        { min: 6.9, max: 9.1, score: 3 },
        { min: 4.7, max: 6.8, score: 2 },
        { max: 4.6, score: 1 },
      ]),
    },
    15: {
      ltbt: (v) => byHigher(v, [
        { min: 20, score: 5 },
        { min: 17, max: 19, score: 4 },
        { min: 13, max: 16, score: 3 },
        { min: 9, max: 12, score: 2 },
        { max: 8, score: 1 },
      ]),
      lbb: (v) => byHigher(v, [
        { min: 9.85, score: 5 },
        { min: 8.65, max: 9.84, score: 4 },
        { min: 7.45, max: 8.64, score: 3 },
        { min: 6.25, max: 7.44, score: 2 },
        { max: 6.24, score: 1 },
      ]),
      lt: (v) => byHigher(v, [
        { min: 57, score: 5 },
        { min: 48, max: 56, score: 4 },
        { min: 36, max: 47, score: 3 },
        { min: 29, max: 35, score: 2 },
        { max: 28, score: 1 },
      ]),
      lk: (v) => byLower(v, [
        { max: 14.89, score: 5 },
        { min: 14.90, max: 17.88, score: 4 },
        { min: 17.89, max: 20.19, score: 3 },
        { min: 20.18, max: 22.12, score: 2 },
        { min: 22.13, score: 1 },
      ]),
      l40m: (v) => byLower(v, [
        { max: 5.00, score: 5 },
        { min: 5.01, max: 5.93, score: 4 },
        { min: 5.94, max: 6.77, score: 3 },
        { min: 6.78, max: 7.50, score: 2 },
        { min: 7.51, score: 1 },
      ]),
      mft: (v) => byHigher(v, [
        { min: 11.8, score: 5 },
        { min: 9.5, max: 11.7, score: 4 },
        { min: 7.1, max: 9.4, score: 3 },
        { min: 4.8, max: 7.0, score: 2 },
        { max: 4.7, score: 1 },
      ]),
    },
  },
}

// Hitung skor 1..5 untuk 6 indikator
export function scoreIndicators(profile: ChildProfile): Score6 {
  const { gender, usia } = profile
  const n = NORMA[gender]?.[usia]
  if (!n) return {}

  const mft = mftToFloat(profile.mftLevel, profile.mftShuttle)

  return {
    ltbt: profile.ltbt == null ? undefined : n.ltbt(profile.ltbt),
    lbb:  profile.lbb  == null ? undefined : n.lbb(profile.lbb),
    lt:   profile.lt   == null ? undefined : n.lt(profile.lt),
    lk:   profile.lk   == null ? undefined : n.lk(profile.lk),
    l40m: profile.l40m == null ? undefined : n.l40m(profile.l40m),
    mft:  mft          == null ? undefined : n.mft(mft),
  }
}

// ====== PROFIL TARGET 42 CABANG ======
type SportProfile = {
  name: string
  // skor target 1..5
  ltbt: number; lt: number; lbb: number; lk: number; l40m: number; mft: number
}

const SPORTS: SportProfile[] = [
  { name: 'Anggar (Olahraga Kombatif)',              ltbt:5, lt:4, lbb:4, lk:4, l40m:4, mft:4 },
  { name: 'Angkat Besi (Olahraga Individu)',                  ltbt:3, lt:5, lbb:5, lk:2, l40m:2, mft:1 },
  { name: 'Baseball (Olahraga Tim)',                 ltbt:5, lt:4, lbb:4, lk:4, l40m:4, mft:4 },
  { name: 'Bola Basket (Olahraga Tim)',              ltbt:5, lt:5, lbb:5, lk:4, l40m:4, mft:4 },
  { name: 'Bola Tangan (Olahraga Tim)',              ltbt:5, lt:4, lbb:4, lk:4, l40m:4, mft:4 },
  { name: 'Bola Voli (Olahraga Net)',                ltbt:5, lt:4, lbb:5, lk:4, l40m:4, mft:4 },
  { name: 'Bulutangkis (Olahraga Net)',              ltbt:5, lt:5, lbb:5, lk:5, l40m:5, mft:5 },
  { name: 'Dayung (Olahraga Tim)',                   ltbt:3, lt:5, lbb:5, lk:2, l40m:4, mft:4 },
  { name: 'Hoki (Olahraga Tim)',                     ltbt:5, lt:4, lbb:5, lk:5, l40m:4, mft:4 },
  { name: 'Jalan (Olahraga Individu)',               ltbt:1, lt:3, lbb:1, lk:2, l40m:2, mft:5 },
  { name: 'Judo (Olahraga Kombatif)',                ltbt:3, lt:4, lbb:5, lk:3, l40m:2, mft:3 },
  { name: 'Kano (Olahraga Individu)',                ltbt:3, lt:3, lbb:5, lk:2, l40m:3, mft:4 },
  { name: 'Karate-Do (Olahraga Kombatif)',           ltbt:4, lt:5, lbb:5, lk:5, l40m:4, mft:4 },
  { name: 'Kung Fu (Olahraga Kombatif)',             ltbt:4, lt:5, lbb:5, lk:5, l40m:4, mft:4 },
  { name: 'Lari Cepat (Olahraga Individu)',          ltbt:1, lt:5, lbb:3, lk:4, l40m:5, mft:2 },
  { name: 'Lari Jarak Jauh (Olahraga Individu)',     ltbt:1, lt:3, lbb:1, lk:3, l40m:4, mft:5 },
  { name: 'Lari Gawang (Olahraga Individu)',         ltbt:3, lt:5, lbb:1, lk:5, l40m:5, mft:2 },
  { name: 'Lompat Jauh (Olahraga Individu)',         ltbt:2, lt:5, lbb:2, lk:3, l40m:4, mft:2 },
  { name: 'Lempar Cakram (Olahraga Individu)',       ltbt:3, lt:4, lbb:5, lk:3, l40m:4, mft:1 },
  { name: 'Lempar Lembing (Olahraga Individu)',      ltbt:3, lt:4, lbb:5, lk:3, l40m:4, mft:2 },
  { name: 'Lompat Jangkit (Olahraga Individu)',      ltbt:2, lt:5, lbb:2, lk:3, l40m:5, mft:2 },
  { name: 'Lompat Tinggi (Olahraga Individu)',       ltbt:2, lt:5, lbb:2, lk:4, l40m:4, mft:2 },
  { name: 'Lompat Galah (Olahraga Individu)',        ltbt:3, lt:5, lbb:4, lk:3, l40m:4, mft:2 },
  { name: 'Loncat Indah (Olahraga Artistik)',        ltbt:4, lt:5, lbb:5, lk:5, l40m:4, mft:2 },
  { name: 'Lontar Martil (Olahraga Individu)',       ltbt:3, lt:4, lbb:5, lk:2, l40m:2, mft:1 },
  { name: 'Panahan (Olahraga Target)',               ltbt:5, lt:2, lbb:5, lk:1, l40m:1, mft:3 },
  { name: 'Panjat Tebing (Olahraga Individu)',       ltbt:5, lt:5, lbb:2, lk:4, l40m:4, mft:4 },
  { name: 'Pencak Silat (Olahraga Kombatif)',        ltbt:4, lt:5, lbb:5, lk:5, l40m:4, mft:4 },
  { name: 'Renang Jarak Pendek (Olahraga Individu)', ltbt:3, lt:5, lbb:5, lk:3, l40m:5, mft:4 },
  { name: 'Renang Jarak Jauh (Olahraga Individu)',   ltbt:3, lt:4, lbb:5, lk:3, l40m:4, mft:5 },
  { name: 'Senam (Olahraga Artistik)',               ltbt:4, lt:5, lbb:5, lk:5, l40m:4, mft:2 },
  { name: 'Sepakbola (Olahraga Tim)',                ltbt:4, lt:4, lbb:3, lk:4, l40m:4, mft:4 },
  { name: 'Sepak Takraw (Olahraga Net)',             ltbt:4, lt:5, lbb:5, lk:5, l40m:4, mft:4 },
  { name: 'Sepeda (Olahraga Individu)',              ltbt:4, lt:5, lbb:4, lk:4, l40m:4, mft:5 },
  { name: 'Softball (Olahraga Tim)',                 ltbt:5, lt:4, lbb:4, lk:4, l40m:4, mft:4 },
  { name: 'Squash (Olahraga Net)',                   ltbt:5, lt:4, lbb:5, lk:5, l40m:5, mft:4 },
  { name: 'Steeplechase (Olahraga Individu)',        ltbt:2, lt:5, lbb:1, lk:4, l40m:4, mft:5 },
  { name: 'Taekwondo (Olahraga Kombatif)',           ltbt:4, lt:5, lbb:5, lk:5, l40m:4, mft:4 },
  { name: 'Tenis (Olahraga Net)',                    ltbt:5, lt:5, lbb:5, lk:5, l40m:4, mft:5 },
  { name: 'Tenis Meja (Olahraga Net)',               ltbt:5, lt:3, lbb:3, lk:3, l40m:3, mft:3 },
  { name: 'Tinju (Olahraga Kombatif)',               ltbt:4, lt:3, lbb:5, lk:4, l40m:4, mft:4 },
  { name: 'Tolak Peluru (Olahraga Individu)',        ltbt:3, lt:4, lbb:5, lk:2, l40m:2, mft:1 },
]

// Hitung jarak (semakin kecil semakin cocok) dengan abaikan indikator yang belum ada
function distance(a: Score6, b: SportProfile) {
  let sum = 0
  let n = 0
  if (a.ltbt != null) { sum += Math.abs(a.ltbt - b.ltbt); n++ }
  if (a.lbb  != null) { sum += Math.abs(a.lbb  - b.lbb ); n++ }
  if (a.lt   != null) { sum += Math.abs(a.lt   - b.lt  ); n++ }
  if (a.lk   != null) { sum += Math.abs(a.lk   - b.lk  ); n++ }
  if (a.l40m != null) { sum += Math.abs(a.l40m - b.l40m); n++ }
  if (a.mft  != null) { sum += Math.abs(a.mft  - b.mft ); n++ }
  if (n === 0) return Number.POSITIVE_INFINITY
  return sum / n // rata-rata selisih
}

// ===== Utility: konversi jarak → skor kecocokan 0..1 =====
function matchFromDistance(avgDiff: number) {
  if (!Number.isFinite(avgDiff)) return 0
  const ratio = 1 - Math.min(1, avgDiff / 4) // 0..1 (asumsi selisih max rata-rata 4)
  return Math.max(0, Math.min(1, ratio))
}

// ===== Rekomendasi versi baru: semua cabang, lalu urut =====
function recommendAll(scores: Score6): Recommendation[] {
  const rows = SPORTS.map((s) => {
    const d = distance(scores, s)
    const m = matchFromDistance(d)
    return {
      sport: s.name,
      match: m,
      matchPct: Math.round(m * 100),
      distance: d,
      target: { ltbt: s.ltbt, lbb: s.lbb, lt: s.lt, lk: s.lk, l40m: s.l40m, mft: s.mft },
    } as Recommendation
  })

  // Urut: match desc → distance asc → nama asc
  rows.sort((a, b) => {
    if (b.match !== a.match) return b.match - a.match
    if (a.distance !== b.distance) return a.distance - b.distance
    return a.sport.localeCompare(b.sport, 'id', { sensitivity: 'base' })
  })

  return rows
}

// Util utama: dari raw + profil → skor 1..5 per indikator + rekomendasi modern
export function computeScoresAndRecommend(
  profile: ChildProfile,
  opts?: { threshold?: number; limit?: number }
) {
  const threshold = opts?.threshold ?? DEFAULT_RECO_THRESHOLD
  const limit = opts?.limit ?? DEFAULT_RECO_LIMIT

  const scores = scoreIndicators(profile)
  const all = recommendAll(scores)
  const recommended = all.filter(r => r.match >= threshold)
  const top = recommended.slice(0, limit)

  const recommendedCount = recommended.length
  const meta = {
    threshold,
    limit,
    recommendedCount,
    totalEvaluated: all.length,
    potentialCategory: potentialCategoryFromCount(recommendedCount) as PotentialCategory,
  }

  return { scores, top, recommended, all, meta }
}

// ====== Fungsi legacy (kompatibilitas mundur) ======
// Tetap mengembalikan bentuk lama (tanpa filter threshold) agar kode lama aman.
export function recommendTop(scores: Score6, topN = 6) {
  const all = recommendAll(scores)
  const sliced = all.slice(0, topN)
  return sliced.map((r, i) => ({
    rank: i + 1,
    name: r.sport,
    distance: r.distance,
    target: r.target,
    match: r.matchPct,
  }))
}
