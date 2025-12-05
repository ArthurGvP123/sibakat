// src/pages/DataAnak.tsx
import AppLayout from '../components/Navbar'
import ChildTable from '../components/ChildTable'

export default function DataAnak() {
  return (
    <AppLayout title="Data Anak">
      <div className="mb-6">
        <p className="text-slate-600 text-sm max-w-2xl">
          Kelola data anak: tambah, edit, hapus, dan lihat ringkasan indikator keberbakatan olahraga.
        </p>
      </div>

      <ChildTable />
    </AppLayout>
  )
}