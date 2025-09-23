import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter,HashRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'
import "@/styles/clamp.css";
import { handleLoginSuccessToken } from '@/lib/api'   // <-- where this is exported in your project

const qc = new QueryClient()

import { AuthProvider } from './context/AuthProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
