'use client'

import { motion } from 'framer-motion'
import Hero from './components/Hero'
import ScrollingTags from './components/ScrollingTags'
import FeatureCards from './components/FeatureCards'
import Timeline from './components/Timeline'
import BarChart from './components/BarChart'
import Testimonials from './components/Testimonials'
import Founders from './components/Founders'
import FAQ from './components/FAQ'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E8E8E0] relative overflow-hidden">
      {/* Grain texture overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50" 
           style={{
             backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
           }} />

      <main>
        <Hero />
        <ScrollingTags />
        <FeatureCards />
        <Timeline />
        <BarChart />
        <Testimonials />
        <Founders />
        <FAQ />
        <FinalCTA />
        <Footer />
      </main>
    </div>
  )
}