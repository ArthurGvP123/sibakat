// src/components/AnimatedBackground.tsx
export default function AnimatedBackground() {
  // Tetap di bawah semua konten dalam stacking context AppLayout/AuthCard:
  // z-0 untuk background, konten utama akan diberi z-10, sedangkan sidebar/overlay z-50.
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {/* blob 1 */}
      <div className="absolute -top-12 -left-12 h-60 w-60 rounded-full bg-primary/30 blur-3xl animate-blob"></div>
      {/* blob 2 */}
      <div className="absolute top-24 -right-12 h-72 w-72 rounded-full bg-accent/30 blur-3xl animate-blob-delayed"></div>
      {/* blob 3 */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-indigo-400/30 blur-3xl animate-blob-slow"></div>
    </div>
  )
}
