import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

// Halaman
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import DataAnak from './pages/DataAnak'
import StatistikAnak from './pages/StatistikAnak'
import KomparasiStatistik from './pages/KomparasiStatistik'
import NormaPenilaian from './pages/NormaPenilaian'
import PanduanSportSearch from './pages/PanduanSportSearch'
import PetunjukPenggunaan from './pages/PetunjukPenggunaan'
import ProfilPeneliti from './pages/ProfilPeneliti'

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-slate-600">
      Halaman tidak ditemukan.
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Publik */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Proteksi */}
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/data-anak" element={<ProtectedRoute><DataAnak /></ProtectedRoute>} />
      <Route path="/data-anak/:id" element={<ProtectedRoute><StatistikAnak /></ProtectedRoute>} />
      <Route path="/komparasi-statistik" element={<ProtectedRoute><KomparasiStatistik /></ProtectedRoute>} />
      <Route path="/norma-penilaian" element={<ProtectedRoute><NormaPenilaian /></ProtectedRoute>} />
      <Route path="/panduan-sport-search" element={<ProtectedRoute><PanduanSportSearch /></ProtectedRoute>} />
      <Route path="/petunjuk-penggunaan" element={<ProtectedRoute><PetunjukPenggunaan /></ProtectedRoute>} />
      <Route path="/profil-peneliti" element={<ProtectedRoute><ProfilPeneliti /></ProtectedRoute>} />

      {/* Default */}
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
