'use client'

import { motion, useAnimation } from 'framer-motion'
import { useEffect, useState } from 'react'

const Hero = () => {
  const [cursorVisible, setCursorVisible] = useState(false)
  const cursorControls = useAnimation()

  useEffect(() => {
    const animateCursor = async () => {
      await new Promise(resolve => setTimeout(resolve, 3000)) // Initial delay
      
      while (true) {
        setCursorVisible(true)
        
        // Move to Dark Persuasion text
        await cursorControls.start({
          x: 100,
          y: 50,
          transition: { duration: 1.5, ease: [0.25, 0.46, 0.45, 0.94] }
        })
        
        // Click animation
        await cursorControls.start({
          scale: 0.8,
          transition: { duration: 0.1 }
        })
        await cursorControls.start({
          scale: 1,
          transition: { duration: 0.2 }
        })
        
        // Hide cursor
        setCursorVisible(false)
        await cursorControls.start({
          x: 0,
          y: 0,
          transition: { duration: 0.5 }
        })
        
        // Wait before next cycle
        await new Promise(resolve => setTimeout(resolve, 8000))
      }
    }

    animateCursor()
  }, [cursorControls])

  const orbitalCards = [
    { title: "Pattern Interruption", angle: 0 },
    { title: "Mirroring", angle: 60 },
    { title: "Scarcity Framing", angle: 120 },
    { title: "Anchoring", angle: 180 },
    { title: "The Void Pull", angle: 240 },
    { title: "Social Proof Architecture", angle: 300 }
  ]

  return (
    <section className="min-h-screen flex items-center px-6 lg:px-12 py-16 relative">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Left Side */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-6xl lg:text-8xl font-bold leading-[0.9] font-serif">
                <div className="text-[#E8E8E0]">Master</div>
                <div className="relative inline-block">
                  <span className="text-[#E8E8E0] relative z-10">Dark Persuasion</span>
                  <motion.div
                    initial={{ scaleX: 0, opacity: 0 }}
                    animate={{ scaleX: 1, opacity: 0.3 }}
                    transition={{ duration: 1.2, delay: 1.5 }}
                    className="absolute -inset-x-2 inset-y-2 bg-[#8B0000] -z-10 origin-left"
                    style={{ 
                      clipPath: 'polygon(0% 0%, 95% 0%, 100% 50%, 98% 100%, 0% 100%)'
                    }}
                  />
                  {/* Decorative elements */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="absolute -right-8 top-1/2 transform -translate-y-1/2"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" className="text-[#8B0000]">
                      <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="currentColor" />
                    </svg>
                  </motion.div>
                  
                  {/* Simulated cursor */}
                  {cursorVisible && (
                    <motion.div
                      animate={cursorControls}
                      className="absolute top-0 left-0 pointer-events-none z-20"
                    >
                      <div className="w-4 h-6 bg-white transform rotate-12 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-300" 
                             style={{ clipPath: 'polygon(0 0, 0 100%, 25% 75%, 50% 100%, 100% 0)' }} />
                      </div>
                    </motion.div>
                  )}
                </div>
                <div className="text-[#E8E8E0]">Before It Masters You</div>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl lg:text-2xl text-[#E8E8E0]/80 max-w-2xl leading-relaxed"
            >
              Gain access to frameworks, scripts, and psychological architectures used by the world's most effective operators, negotiators, and closers.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 10px 40px rgba(139, 0, 0, 0.3)',
                }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-[#8B0000] text-white font-semibold text-lg rounded-lg 
                          hover:bg-[#A00000] transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10">Enter the Shadow</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#8B0000] to-[#C0392B] 
                               opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>

              <motion.button
                whileHover={{ 
                  scale: 1.02,
                  borderColor: '#D4A017',
                }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 border-2 border-[#1E1E1E] text-[#E8E8E0] font-semibold text-lg 
                          rounded-lg hover:border-[#D4A017] transition-all duration-300"
              >
                Explore the Framework
              </motion.button>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="flex items-center gap-6 pt-8"
            >
              {/* Overlapping portraits */}
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1A1A1A] overflow-hidden">
                    <img
                      src={`https://i.pravatar.cc/40?img=${i}`}
                      alt=""
                      className="w-full h-full object-cover filter grayscale contrast-125"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex text-[#D4A017] text-lg">
                  {'★'.repeat(5)}
                </div>
                <span className="text-sm font-mono text-[#E8E8E0]/60">4.9</span>
              </div>

              <div className="text-sm font-mono text-[#E8E8E0]/60 border-l border-[#1E1E1E] pl-4">
                Used by 20K+ Operators, Closers, and Strategists
              </div>
            </motion.div>
          </div>

          {/* Right Side */}
          <div className="relative h-[600px] flex items-center justify-center">
            {/* Central eye/mask visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.8 }}
              className="w-40 h-40 relative"
            >
              <div className="w-full h-full bg-gradient-to-br from-[#1A1A1A] to-[#111111] 
                             rounded-full border border-[#8B0000]/20 flex items-center justify-center">
                <svg width="60" height="40" viewBox="0 0 60 40" className="text-[#8B0000]/40">
                  <ellipse cx="30" cy="20" rx="25" ry="15" stroke="currentColor" strokeWidth="2" fill="none" />
                  <circle cx="30" cy="20" r="8" fill="currentColor" opacity="0.6" />
                  <circle cx="30" cy="20" r="4" fill="white" />
                </svg>
              </div>
            </motion.div>

            {/* Orbiting cards */}
            {orbitalCards.map((card, index) => {
              const angle = (card.angle * Math.PI) / 180
              const radius = 180
              const x = Math.cos(angle) * radius
              const y = Math.sin(angle) * radius

              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 + index * 0.2 }}
                  className="absolute"
                  style={{
                    left: `calc(50% + ${x}px)`,
                    top: `calc(50% + ${y}px)`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <motion.div
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-32 h-20 bg-[#1A1A1A] border border-[#8B0000]/20 rounded-lg 
                              flex items-center justify-center p-3 cursor-pointer group 
                              hover:bg-[#1E1E1E] hover:border-[#8B0000]/40 hover:shadow-lg 
                              hover:shadow-[#8B0000]/10 transition-all duration-300"
                    whileHover={{
                      scale: 1.1,
                      z: 10,
                      boxShadow: '0 8px 32px rgba(139, 0, 0, 0.2)',
                    }}
                  >
                    <span className="text-xs font-mono text-center text-[#E8E8E0]/70 
                                   group-hover:text-[#E8E8E0] transition-colors">
                      {card.title}
                    </span>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero