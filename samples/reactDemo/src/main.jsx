import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // Note: React StrictMode causes the Spire editor to render twice, so it’s recommended to disable it
  <App />
)