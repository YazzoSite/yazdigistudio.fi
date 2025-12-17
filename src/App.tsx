/**
 * App Component
 *
 * Main application component with language provider and layout.
 */

import { LanguageProvider } from './contexts/LanguageContext'
import { Layout } from './components/layout/Layout'
import { Hero } from './components/sections/Hero'
import { ServicesSlideshow } from './components/sections/ServicesSlideshow'
import { WhyYaz } from './components/sections/WhyYaz'
import { About } from './components/sections/About'
import { Contact } from './components/sections/Contact'

function App() {
  return (
    <LanguageProvider>
      <Layout>
        <Hero />
        <ServicesSlideshow />
        <WhyYaz />
        <About />
        <Contact />
      </Layout>
    </LanguageProvider>
  )
}

export default App
