// src/pages/DataAnak.tsx
import AppLayout from '../components/Navbar'
import ChildTable from '../components/ChildTable'

export default function DataAnak() {
  return (
    <AppLayout title="Data Anak">
      <div className="mb-6 px-1">
        <p className="text-slate-600 text-sm md:text-base max-w-2xl leading-relaxed">
          Kelola data anak: tambah, edit, hapus, dan lihat ringkasan indikator keberbakatan olahraga secara efisien.
        </p>
      </div>

      <div className="w-full">
        <ChildTable />
      </div>
    </AppLayout>
  )
}