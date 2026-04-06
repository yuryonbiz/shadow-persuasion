'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const MeasuredImpact = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const metrics = [
    { label: "Close Rate", value: 87, highlight: true },
    { label: "Negotiation Wins", value: 73 },
    { label: "Frame Control", value: 92 },
    { label: "Objection Handling", value: 68 },
    { label: "Deal Size", value: 84 },
    { label: "First-Call Conversion", value: 95, highlight: true },
    { label: "Retention", value: 78 }
  ]

  return (
    <section className="py-24 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-6xl font-bold font-special-elite mb-6 text-[#1A1A1A]">
            Measured <span className="text-[#8B0000]">Impact</span> Across Operators
          </h2>
          <p className="text-xl text-[#1A1A1A]/70 max-w-3xl mx-auto">
            Quantified results from our psychological influence framework
          </p>
        </motion.div>

        <div 
          ref={ref}
          className="bg-[#E8DCC8] rounded-3xl p-8 lg:p-12 border-2 border-gray-400
                     relative overflow-hidden shadow-lg"
          style={{
            background: `
              linear-gradient(135deg, #E8DCC8 0%, #EDE3D0 100%),
              url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")
            `,
            backgroundBlendMode: 'overlay'
          }}
        >
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-20">
            {[20, 40, 60, 80, 100].map((percent) => (
              <div
                key={percent}
                className="absolute left-0 right-0 border-t border-gray-400"
                style={{ top: `${100 - percent}%` }}
              />
            ))}
          </div>

          {/* Y-axis labels */}
          <div className="absolute left-2 top-8 bottom-16 flex flex-col justify-between text-sm font-mono text-gray-600">
            {[100, 80, 60, 40, 20, 0].map((value) => (
              <span key={value}>{value}%</span>
            ))}
          </div>

          <div className="ml-12 mr-4">
            <div className="flex items-end justify-between h-80 mb-8 relative">
              {metrics.map((metric, index) => (
                <div 
                  key={metric.label}
                  className="flex-1 flex flex-col items-center group relative"
                >
                  {/* Value display on hover */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.1 + 0.5 }}
                    className="absolute -top-12 bg-[#1A1A1A] px-3 py-1 rounded-lg border border-gray-400
                              text-sm font-bold text-white opacity-0 group-hover:opacity-100 
                              transition-opacity duration-200"
                  >
                    {metric.value}%
                  </motion.div>

                  {/* Bar Container */}
                  <div className="w-8 lg:w-12 bg-[#D4C5B0] rounded-t-lg relative overflow-hidden flex-1 max-h-full border border-gray-400">
                    <motion.div
                      className={`absolute bottom-0 left-0 right-0 rounded-t-lg transition-all duration-300 ${
                        metric.highlight 
                          ? 'bg-gradient-to-t from-[#8B0000] to-[#C0392B] shadow-lg shadow-[#8B0000]/30' 
                          : index === 0 || index === 5 
                          ? 'bg-gradient-to-t from-[#8B4513] to-[#A0522D] shadow-lg shadow-[#8B4513]/30'
                          : 'bg-gradient-to-t from-[#4A4A4A] to-[#6A6A6A]'
                      }`}
                      initial={{ height: 0 }}
                      animate={{ 
                        height: isInView ? `${metric.value}%` : 0 
                      }}
                      transition={{ 
                        duration: 1.2,
                        delay: index * 0.15,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }}
                    >
                      {/* Glowing effect for highlighted bars */}
                      {metric.highlight && (
                        <div className="absolute inset-0 bg-gradient-to-t from-[#8B0000]/20 to-transparent
                                       animate-pulse" />
                      )}
                      {(index === 0 || index === 5) && !metric.highlight && (
                        <div className="absolute inset-0 bg-gradient-to-t from-[#8B4513]/20 to-transparent
                                       animate-pulse" />
                      )}
                    </motion.div>
                  </div>
                </div>
              ))}
            </div>

            {/* Labels */}
            <div className="flex justify-between">
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="flex-1 text-center"
                >
                  <div className={`text-xs lg:text-sm font-semibold transition-colors duration-200 ${
                    metric.highlight 
                      ? 'text-[#8B0000]' 
                      : index === 0 || index === 5
                      ? 'text-[#8B4513]'
                      : 'text-[#1A1A1A]/70'
                  }`}>
                    {metric.label.split(' ').map((word, i) => (
                      <div key={i}>{word}</div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-gradient-radial from-[#8B0000]/5 via-transparent 
                         to-transparent opacity-40" />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center text-sm text-[#1A1A1A]/50 mt-8 font-mono"
        >
          Data aggregated from 847 operators across 23 industries
        </motion.p>
      </div>
    </section>
  )
}

export default MeasuredImpact