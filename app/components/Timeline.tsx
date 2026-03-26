'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

const Timeline = () => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const techniques = [
    {
      title: "Pattern Interruption",
      description: "Disrupt expected behavioral sequences to create openings for influence.",
      preview: "Break established patterns of thought and response by introducing unexpected elements at precise moments. The disruption creates a window of heightened suggestibility where new patterns can be installed."
    },
    {
      title: "Mirroring",
      description: "Establish unconscious rapport through behavioral synchronization.",
      preview: "Match and mirror body language, speech patterns, and emotional states to create unconscious connection. The target feels understood and aligned without conscious awareness of the technique."
    },
    {
      title: "Scarcity Framing",
      description: "Leverage loss aversion to accelerate decision-making.",
      preview: "Create genuine or perceived limitations around availability, time, or opportunity. The fear of missing out overrides rational evaluation and compels immediate action."
    },
    {
      title: "Anchoring",
      description: "Establish psychological reference points that influence all subsequent decisions.",
      preview: "Set initial anchors that serve as unconscious baselines for comparison. All following options are evaluated relative to this carefully positioned reference point."
    },
    {
      title: "The Void Pull",
      description: "Use strategic silence and withdrawal to create psychological tension.",
      preview: "Deploy calculated absence and silence to generate pursuit behavior. The void creates discomfort that the target seeks to fill through compliance and engagement."
    },
    {
      title: "Social Proof Architecture",
      description: "Engineer environmental cues that demonstrate desired behaviors.",
      preview: "Construct evidence of collective behavior that validates the target's desired action. The environment itself becomes the persuasive force through demonstrated consensus."
    }
  ]

  return (
    <section className="py-24 px-6 lg:px-12 bg-[#111111]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-6xl font-bold font-serif mb-6 text-[#E8E8E0]">
            The Architecture of <span className="text-[#8B0000]">Influence</span>
          </h2>
          <p className="text-xl text-[#E8E8E0]/70 max-w-3xl mx-auto">
            Six foundational techniques that form the core of psychological leverage
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left: Technique List */}
          <div className="space-y-4 relative">
            {/* Vertical connecting line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-[#1E1E1E]">
              <motion.div
                className="w-full bg-[#8B0000] origin-top"
                initial={{ scaleY: 0 }}
                animate={{ 
                  scaleY: selectedIndex > 0 ? (selectedIndex + 1) / techniques.length : 0.1
                }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            </div>

            {techniques.map((technique, index) => (
              <motion.div
                key={technique.title}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => setSelectedIndex(index)}
                className={`relative pl-16 pr-6 py-6 cursor-pointer transition-all duration-300 rounded-lg
                          ${selectedIndex === index 
                            ? 'bg-[#4A0A0A] shadow-lg shadow-[#8B0000]/20' 
                            : 'hover:bg-[#1A1A1A]'
                          }`}
              >
                {/* Timeline dot */}
                <div className={`absolute left-4 top-8 w-4 h-4 rounded-full border-2 
                               transition-all duration-300 ${
                                 selectedIndex === index
                                   ? 'bg-[#8B0000] border-[#8B0000] shadow-md shadow-[#8B0000]/50'
                                   : selectedIndex > index
                                   ? 'bg-[#8B0000] border-[#8B0000]'
                                   : 'bg-[#1A1A1A] border-[#1E1E1E]'
                               }`} />

                <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${
                  selectedIndex === index ? 'text-white' : 'text-[#E8E8E0]'
                }`}>
                  {technique.title}
                </h3>

                <p className={`text-sm transition-colors duration-300 ${
                  selectedIndex === index ? 'text-[#E8E8E0]/90' : 'text-[#E8E8E0]/60'
                }`}>
                  {technique.description}
                </p>

                {/* Selection indicator */}
                {selectedIndex === index && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-[#8B0000] rounded-r"
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* Right: Preview Panel */}
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-[#1A1A1A] rounded-2xl p-8 border border-[#8B0000]/20 
                      shadow-lg shadow-[#8B0000]/10 relative overflow-hidden"
            style={{
              background: `
                linear-gradient(135deg, #1A1A1A 0%, #1E1E1E 100%),
                url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.015'/%3E%3C/svg%3E")
              `,
              backgroundBlendMode: 'overlay'
            }}
          >
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#8B0000]/5 via-transparent 
                           to-[#8B0000]/5 opacity-60" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-[#8B0000] rounded-full animate-pulse" />
                <span className="text-sm font-mono text-[#8B0000] uppercase tracking-wide">
                  Active Technique
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white mb-4">
                {techniques[selectedIndex].title}
              </h3>

              <p className="text-[#E8E8E0]/80 leading-relaxed text-lg">
                {techniques[selectedIndex].preview}
              </p>

              {/* Progress indicator */}
              <div className="mt-8 flex justify-between items-center">
                <div className="flex gap-2">
                  {techniques.map((_, index) => (
                    <div
                      key={index}
                      className={`w-8 h-1 rounded transition-all duration-300 ${
                        index === selectedIndex
                          ? 'bg-[#8B0000]'
                          : index < selectedIndex
                          ? 'bg-[#8B0000]/50'
                          : 'bg-[#1E1E1E]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-mono text-[#E8E8E0]/50">
                  {String(selectedIndex + 1).padStart(2, '0')} / {String(techniques.length).padStart(2, '0')}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Timeline