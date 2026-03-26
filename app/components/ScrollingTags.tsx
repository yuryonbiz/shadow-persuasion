'use client'

import { motion } from 'framer-motion'

const ScrollingTags = () => {
  const tags = [
    "Negotiators", "Founders", "Copywriters", "Closers", 
    "Strategists", "Operators", "Negotiators", "Founders", 
    "Copywriters", "Closers", "Strategists", "Operators"
  ]

  return (
    <section className="py-16 border-t border-b border-[#1E1E1E] overflow-hidden">
      <div className="relative">
        <motion.div
          animate={{
            x: [0, -50 * tags.length]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="flex gap-8 whitespace-nowrap"
          style={{ width: 'max-content' }}
        >
          {tags.map((tag, index) => (
            <motion.div
              key={`${tag}-${index}`}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              className="px-6 py-3 bg-[#1A1A1A] border border-[#8B0000]/20 rounded-full 
                        text-[#E8E8E0]/80 font-mono text-sm cursor-pointer
                        hover:bg-[#1E1E1E] hover:border-[#D4A017]/40 hover:text-[#E8E8E0]
                        hover:shadow-md hover:shadow-[#D4A017]/20 transition-all duration-300
                        relative overflow-hidden group"
              onMouseEnter={(e) => {
                const target = e.currentTarget
                target.style.animationPlayState = 'paused'
                // Add pulse effect
                const pulse = target.querySelector('.pulse-effect')
                if (pulse) {
                  pulse.classList.add('animate-pulse')
                }
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget
                target.style.animationPlayState = 'running'
                const pulse = target.querySelector('.pulse-effect')
                if (pulse) {
                  pulse.classList.remove('animate-pulse')
                }
              }}
            >
              <span className="relative z-10">{tag}</span>
              
              {/* Ember glow effect on hover */}
              <div className="pulse-effect absolute inset-0 bg-gradient-radial from-[#D4A017]/20 
                             via-transparent to-transparent opacity-0 group-hover:opacity-100 
                             transition-opacity duration-300" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default ScrollingTags