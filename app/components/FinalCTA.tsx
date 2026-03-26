'use client'

import { motion } from 'framer-motion'

const FinalCTA = () => {
  return (
    <section className="py-32 px-6 lg:px-12 relative overflow-hidden">
      {/* Near-black background with vignette effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at center, #111111 0%, #0A0A0A 70%, #000000 100%),
            url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")
          `,
          backgroundBlendMode: 'overlay'
        }}
      />

      {/* Subtle atmospheric effects */}
      <div className="absolute inset-0 bg-gradient-radial from-[#8B0000]/5 via-transparent 
                     to-transparent opacity-50" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ 
            duration: 1.2,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          {/* Pre-headline */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-3 mb-8 px-6 py-3 
                       bg-[#1A1A1A]/50 border border-[#8B0000]/20 rounded-full
                       backdrop-blur-sm"
          >
            <div className="w-2 h-2 bg-[#8B0000] rounded-full animate-pulse" />
            <span className="text-sm font-mono text-[#8B0000] uppercase tracking-wider">
              Final Transmission
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl md:text-5xl lg:text-7xl font-bold font-serif text-[#E8E8E0] 
                       leading-tight mb-6"
          >
            Most people never learn
            <br />
            <span className="text-[#8B0000]">what moves them.</span>
            <br />
            You're about to.
          </motion.h1>

          {/* Supporting text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl text-[#E8E8E0]/70 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Step beyond the veil of conscious awareness. Master the hidden architecture 
            that governs every decision, every desire, every moment of human compliance.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="relative"
          >
            <motion.button
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 40px rgba(139, 0, 0, 0.4)"
              }}
              whileTap={{ scale: 0.98 }}
              className="relative px-12 py-6 bg-gradient-to-r from-[#8B0000] to-[#C0392B]
                         text-white text-xl font-bold rounded-2xl border border-[#8B0000]
                         transition-all duration-300 overflow-hidden group
                         shadow-lg shadow-[#8B0000]/20"
              style={{
                background: `
                  linear-gradient(135deg, #8B0000 0%, #C0392B 100%),
                  url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.1'/%3E%3C/svg%3E")
                `,
                backgroundBlendMode: 'overlay'
              }}
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#8B0000] to-[#C0392B] 
                             opacity-0 group-hover:opacity-20 transition-opacity duration-300
                             blur-xl" />
              
              {/* Button text */}
              <span className="relative z-10 flex items-center gap-3">
                Enter the Shadow
                <motion.svg
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M4 12h16m-7-7l7 7-7 7"/>
                </motion.svg>
              </span>

              {/* Subtle inner glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent 
                             to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>

            {/* Pulsing ring effect */}
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 border-2 border-[#8B0000] rounded-2xl -z-10"
            />
          </motion.div>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="text-sm text-[#E8E8E0]/40 mt-8 font-mono tracking-wide"
          >
            [ WARNING: This knowledge changes you permanently ]
          </motion.p>
        </motion.div>
      </div>

      {/* Subtle floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[#8B0000]/30 rounded-full"
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
            style={{
              left: `${10 + i * 15}%`,
              top: '90%'
            }}
          />
        ))}
      </div>
    </section>
  )
}

export default FinalCTA