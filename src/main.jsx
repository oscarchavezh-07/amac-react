import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './styles/variables.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/componentes.css'
import './styles/extras.css'

import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
