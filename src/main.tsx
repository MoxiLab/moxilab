import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@/components/theme-provider'
import { I18nProvider } from '@/lib/i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <I18nProvider>
        <HashRouter>
          <App />
        </HashRouter>
      </I18nProvider>
    </ThemeProvider>
  </StrictMode>,
)
