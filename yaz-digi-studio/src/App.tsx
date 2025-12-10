import { useState } from 'react'
import './App.css'
import Cube from './components/Cube'
import { Header } from './components/Header'
import { LanguageProvider } from './contexts/LanguageContext'

function App() {
  const [selectedFace, setSelectedFace] = useState<number | null>(null)

  return (
    <LanguageProvider>
      <div className="app">
        <Header onNavigate={setSelectedFace} />
        <Cube
          selectedFace={selectedFace}
          onFaceSelect={setSelectedFace}
        />
      </div>
    </LanguageProvider>
  )
}

export default App
