import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter,HashRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'
import { DemoAuthProvider } from './context/DemoAuthProvider'


const qc = new QueryClient()

// import { AuthProvider } from './context/AuthProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <HashRouter>
        <DemoAuthProvider>
          <App />
        </DemoAuthProvider>
      </HashRouter>
    </QueryClientProvider>
  </React.StrictMode>
)
