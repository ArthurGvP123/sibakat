// src/pages/DataAnak.tsx
import AppLayout from '../components/Navbar'
import ChildTable from '../components/ChildTable'

export default function DataAnak() {
  return (
    <AppLayout title="Data Anak">
      <div className="mb-4 text-slate-600">
        Kelola data anak: tambah, edit, hapus, dan lihat ringkasan indikator.
      </div>
      <ChildTable />
    </AppLayout>
  )
}
