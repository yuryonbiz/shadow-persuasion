'use client'

import { motion } from 'framer-motion'

const FeatureCards = () => {
  const features = [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" className="text-[#8B0000]">
          <path d="M16 2L20 12L30 16L20 20L16 30L12 20L2 16L12 12Z" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="16" cy="16" r="4" fill="currentColor" opacity="0.6" />
        </svg>
      ),
      title: "Psychological Leverage",
      description: "Master the hidden pressure points that compel action before conscious resistance can form."
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" className="text-[#8B0000]">
          <rect x="4" y="8" width="24" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M8 12h16M8 16h12M8 20h8" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
      title: "Frame Control",
      description: "Establish and maintain the contextual boundaries that determine how others interpret reality."
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" className="text-[#8B0000]">
          <path d="M16 6L18 14L26 16L18 18L16 26L14 18L6 16L14 14Z" fill="currentColor" opacity="0.3" />
          <circle cx="16" cy="16" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M16 2v4M30 16h-4M16 30v-4M2 16h4" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
      title: "Dark Patterns of Influence",
      description: "Deploy cognitive biases and decision-making shortcuts that bypass rational evaluation."
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" className="text-[#8B0000]">
          <path d="M8 8h16v16H8z" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M4 4h8v8H4zM20 4h8v8h-8zM4 20h8v8H4zM20 20h8v8h-8z" fill="currentColor" opacity="0.2" />
        </svg>
      ),
      title: "Negotiation Architecture",
      description: "Structure conversations and environments to predetermine favorable outcomes."
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" className="text-[#8B0000]">
          <ellipse cx="16" cy="16" rx="12" ry="8" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="16" cy="16" r="4" fill="currentColor" opacity="0.4" />
          <path d="M4 16h8M20 16h8" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
      title: "Covert Persuasion",
      description: "Influence decisions while remaining invisible to the target's conscious awareness."
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 32 32" className="text-[#8B0000]">
          <path d="M16 4C22 4 26 8 26 14C26 20 16 28 16 28S6 20 6 14C6 8 10 4 16 4Z" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="16" cy="14" r="4" fill="currentColor" opacity="0.3" />
        </svg>
      ),
      title: "Emotional Hijacking",
      description: "Redirect emotional states to create windows of heightened suggestibility and compliance."
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { 
      opacity: 0,
      y: 30
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  return (
    <section className="py-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              whileHover={{
                y: -8,
                transition: { duration: 0.3 }
              }}
              className="group relative p-8 bg-[#1A1A1A] rounded-2xl border border-[#8B0000]/10
                        cursor-pointer overflow-hidden"
              style={{
                background: `
                  linear-gradient(135deg, #1A1A1A 0%, #1E1E1E 100%),
                  url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E")
                `,
                backgroundBlendMode: 'overlay'
              }}
            >
              {/* Inner crimson glow at edges */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#8B0000]/5 via-transparent 
                             to-[#8B0000]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Ember glow from beneath on hover */}
              <div className="absolute inset-0 bg-gradient-radial from-[#D4A017]/10 via-transparent 
                             to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* Enhanced shadow on hover */}
              <div className="absolute inset-0 rounded-2xl shadow-lg shadow-[#8B0000]/0 
                             group-hover:shadow-[#8B0000]/20 transition-shadow duration-500" />

              <div className="relative z-10">
                <motion.div
                  whileHover={{ 
                    scale: 1.1,
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{ duration: 0.4 }}
                  className="w-16 h-16 bg-[#0A0A0A] rounded-xl flex items-center justify-center 
                            mb-6 border border-[#8B0000]/20 group-hover:border-[#8B0000]/40
                            transition-colors duration-300"
                >
                  {feature.icon}
                </motion.div>

                <h3 className="text-xl font-bold mb-4 text-[#E8E8E0] group-hover:text-white 
                              transition-colors duration-300">
                  {feature.title}
                </h3>

                <p className="text-[#E8E8E0]/70 leading-relaxed group-hover:text-[#E8E8E0]/90 
                             transition-colors duration-300">
                  {feature.description}
                </p>
              </div>

              {/* Subtle border enhancement on hover */}
              <div className="absolute inset-0 rounded-2xl border border-transparent 
                             group-hover:border-[#8B0000]/20 transition-colors duration-300" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default FeatureCards