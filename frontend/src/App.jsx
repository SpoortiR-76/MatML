import { BrowserRouter, Routes, Route } from 'react-router-dom'
import GlassNavbar from './components/ui/GlassNavbar'
import LandingPage from './pages/LandingPage'
import AboutPage from './pages/AboutPage'
import PredictPage from './pages/PredictPage'

export default function App() {
  return (
    <BrowserRouter>
      <GlassNavbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/predict" element={<PredictPage />} />
      </Routes>
    </BrowserRouter>
  )
}
