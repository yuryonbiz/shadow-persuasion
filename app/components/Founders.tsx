'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

const Founders = () => {
  const architects = [
    {
      name: "Dr. Helena Cross",
      title: "Psychological Operations Specialist",
      image: "https://i.pravatar.cc/300?img=3",
      dossier: "Former intelligence operative specializing in behavioral modification and cognitive manipulation. 15 years developing covert influence protocols for state-level negotiations. Now applies these techniques to corporate environments with surgical precision."
    },
    {
      name: "Viktor Steinberg",
      title: "Negotiation Architect", 
      image: "https://i.pravatar.cc/300?img=5",
      dossier: "Built psychological frameworks for Fortune 500 mergers worth $340B+ collective value. Known for creating decision environments that predetermine outcomes. His anchoring techniques have become industry legend among those who know."
    },
    {
      name: "Dr. Maya Blackthorne",
      title: "Cognitive Systems Designer",
      image: "https://i.pravatar.cc/300?img=8", 
      dossier: "Neuroscience PhD focused on decision-making under pressure. Designs influence architectures that bypass conscious resistance. Her pattern interruption protocols are considered the gold standard in behavioral modification."
    },
    {
      name: "Alexander Kane",
      title: "Social Dynamics Engineer",
      image: "https://i.pravatar.cc/300?img=12",
      dossier: "Spent 12 years studying power dynamics in closed systems. Expert in social proof manipulation and environmental design for influence. Creates contexts where targets persuade themselves while believing it was their idea entirely."
    }
  ]

  return (
    <section className="py-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-6xl font-bold font-serif mb-6 text-[#E8E8E0]">
            The <span className="text-[#8B0000]">Architects</span>
          </h2>
          <p className="text-xl text-[#E8E8E0]/70 max-w-3xl mx-auto">
            Masters of psychological influence who built these frameworks in the shadows
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {architects.map((architect, index) => (
            <motion.div
              key={architect.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3 }
              }}
              className="bg-[#0A0A0A] border border-[#1E1E1E] rounded-2xl p-6 
                         hover:border-[#8B0000]/30 transition-all duration-500
                         relative overflow-hidden group"
              style={{
                background: `
                  linear-gradient(135deg, #0A0A0A 0%, #111111 100%),
                  url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")
                `,
                backgroundBlendMode: 'overlay'
              }}
            >
              {/* Subtle glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#8B0000]/5 via-transparent 
                             to-[#8B0000]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Profile image */}
              <div className="relative mb-6">
                <motion.div
                  whileHover={{ 
                    scale: 1.05,
                    filter: "grayscale(0%)"
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-[#8B0000]/20
                            group-hover:border-[#8B0000]/40 transition-colors duration-300"
                  style={{ filter: "grayscale(100%) contrast(1.1)" }}
                >
                  <Image
                    src={architect.image}
                    alt={architect.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </motion.div>

                {/* Classification stamp */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="absolute -top-2 -right-2 bg-[#8B0000] text-white text-xs 
                            px-2 py-1 rounded-full font-mono tracking-wide"
                >
                  CLASSIFIED
                </motion.div>
              </div>

              {/* Name and title */}
              <div className="text-center mb-4 relative z-10">
                <h3 className="text-lg font-bold text-[#E8E8E0] mb-1 group-hover:text-white 
                              transition-colors duration-300">
                  {architect.name}
                </h3>
                <p className="text-sm text-[#8B0000] font-semibold tracking-wide">
                  {architect.title}
                </p>
              </div>

              {/* Dossier */}
              <div className="relative z-10">
                <div className="text-xs font-mono text-[#D4A017] mb-2 uppercase tracking-wider">
                  DOSSIER:
                </div>
                <p className="text-sm text-[#E8E8E0]/70 leading-relaxed group-hover:text-[#E8E8E0]/90
                             transition-colors duration-300">
                  {architect.dossier}
                </p>
              </div>

              {/* Security clearance indicator */}
              <div className="mt-6 pt-4 border-t border-[#1E1E1E] group-hover:border-[#8B0000]/20
                             transition-colors duration-300">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-[#8B0000] rounded-full animate-pulse" />
                  <span className="text-[#E8E8E0]/50 font-mono tracking-wide">
                    CLEARANCE: UMBRAL
                  </span>
                </div>
              </div>

              {/* Subtle shadow enhancement */}
              <div className="absolute inset-0 rounded-2xl shadow-lg shadow-[#8B0000]/0 
                             group-hover:shadow-[#8B0000]/20 transition-shadow duration-500" />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-[#E8E8E0]/40 font-mono tracking-wide">
            AUTHORIZATION LEVEL: RESTRICTED ACCESS ONLY
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default Founders