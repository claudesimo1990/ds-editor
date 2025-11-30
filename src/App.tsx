import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'

import { Toaster as Sonner } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'

import PasswordProtection from './components/auth/PasswordProtection'
import Footer from './components/layout/Footer'
import Navigation from './components/layout/Navigation'
import { FiltersProvider } from './context/filters'
import { useScrollToTop } from './hooks/useScrollToTop'
import AdminDashboard from './pages/AdminDashboard'
import Auth from './pages/Auth'
import Begleiter from './pages/Begleiter'
import Gedenkportal from './pages/Gedenkportal'
import Impressum from './pages/Impressum'
import Index from './pages/Index'
import LandingPage from './pages/LandingPage'
import MemorialEditor from './pages/MemorialEditor'
import MemorialPageView from './pages/MemorialPageView'
import MemorialShareView from './pages/MemorialShareView'
import NotFound from './pages/NotFound'
import ObituaryView from './pages/ObituaryView'
import Traueranzeigen from './pages/Traueranzeigen'
import UeberUns from './pages/UeberUns'
import UserDashboard from './pages/UserDashboard'
import Kontakt from './pages/Kontakt'

const queryClient = new QueryClient()

const AppContent = () => {
  useScrollToTop()
  const location = useLocation()

  // Route de partage sans navigation ni footer
  const isShareRoute = location.pathname.startsWith('/gedenkseite/share/')

  if (isShareRoute) {
    return (
      <Routes>
        <Route path='/gedenkseite/share/:id' element={<MemorialShareView />} />
      </Routes>
    )
  }

  return (
    <FiltersProvider>
      <div className='min-h-screen flex flex-col'>
        <Navigation />
        <main className='flex-1'>
          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/gedenkportal' element={<Gedenkportal />} />
            <Route path='/traueranzeigen' element={<Traueranzeigen />} />
            <Route path='/traueranzeigen/erstellen' element={<Index />} />
            <Route path='/traueranzeige/:id' element={<ObituaryView />} />
            <Route path='/dashboard' element={<UserDashboard />} />
            <Route path='/gedenkseite/erstellen' element={<MemorialEditor />} />
            <Route path='/editor' element={<Index />} />
            <Route path='/verzeichnis' element={<Gedenkportal />} />
            <Route path='/begleiter' element={<Begleiter />} />
            <Route path='/ueber-uns' element={<UeberUns />} />
            <Route path='/auth' element={<Auth />} />
            <Route path='/user-bereich' element={<UserDashboard />} />
            <Route path='/admin-bereich' element={<AdminDashboard />} />
            <Route path='/gedenkseite/:id' element={<MemorialPageView />} />
            <Route path='/impressum' element={<Impressum />} />
            <Route path='/datenschutz' element={<NotFound />} />
            <Route path='/kontakt' element={<Kontakt />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path='*' element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </FiltersProvider>
  )
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TooltipProvider>
          <PasswordProtection>
            <AppContent />
            <Toaster />
            <Sonner />
          </PasswordProtection>
        </TooltipProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
