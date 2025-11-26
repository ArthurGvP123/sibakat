import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import App from './App'
import ErrorBoundary from './dev/ErrorBoundary'
// import GlobalErrorOverlay from './dev/GlobalErrorOverlay'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* AuthProvider harus membungkus SEMUA yang memakai useAuth() */}
    <AuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
        {/* Jika overlay/komponen debug juga memakai useAuth, aman karena ada di dalam AuthProvider */}
        {/* <GlobalErrorOverlay /> */}
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
)
