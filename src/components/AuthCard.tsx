// src/components/AuthCard.tsx
import AnimatedBackground from './AnimatedBackground'

export default function AuthCard({
  title,
  subtitle,
  children,
  footer
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* background animasi (z-0) */}
      <AnimatedBackground />

      {/* konten di atas background */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-10">
        {/* Header brand */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 animate-float">
            <div className="h-9 w-9 rounded-xl bg-primary/90 grid place-items-center text-white font-bold">Si</div>
            <div className="text-2xl font-bold tracking-tight">Talenta Sport<span className="text-primary">.id</span></div>
          </div>
          <div className="mt-1 text-sm muted">“Analisis Akurat, Bakat Terungkap”</div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Hero copy */}
          <div className="hidden lg:block">
            <h1 className="text-4xl font-extrabold leading-tight">
              Identifikasi Potensi <span className="text-primary">Keolahragaan</span> dengan Mudah
            </h1>
            <p className="mt-4 text-slate-600">
              Talenta Sport membantu menganalisis 6 indikator fisik siswa dan merekomendasikan cabang olahraga yang paling cocok.
            </p>
            <ul className="mt-6 space-y-2 text-slate-700">
              <li>• Login aman & data tiap akun terpisah</li>
              <li>• Antarmuka sederhana dan menarik</li>
              <li>• Siap untuk dipakai guru/pelatih di sekolah</li>
            </ul>
          </div>

          {/* Card */}
          <div className="card glass p-6 animate-fadeIn">
            <h2 className="text-2xl font-bold">{title}</h2>
            {subtitle && <p className="mt-1 muted">{subtitle}</p>}
            <div className="mt-6">{children}</div>
            {footer && <div className="mt-6">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
