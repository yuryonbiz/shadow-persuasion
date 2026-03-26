'use client'

import { motion } from 'framer-motion'

const Footer = () => {
  const links = [
    { name: "Framework", href: "#framework" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "FAQ", href: "#faq" },
    { name: "Contact", href: "#contact" }
  ]

  return (
    <footer className="py-16 px-6 lg:px-12 bg-[#0A0A0A] border-t border-[#1E1E1E]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Logo/Brand name */}
          <motion.h3
            whileHover={{ 
              textShadow: "0 0 20px rgba(139, 0, 0, 0.5)"
            }}
            className="text-3xl font-bold font-serif text-[#E8E8E0] mb-8 cursor-pointer
                       hover:text-[#8B0000] transition-colors duration-300"
          >
            Shadow Persuasion
          </motion.h3>

          {/* Navigation links */}
          <nav className="mb-12">
            <ul className="flex flex-wrap justify-center gap-8 md:gap-12">
              {links.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <motion.a
                    href={link.href}
                    whileHover={{ 
                      y: -2,
                      color: "#8B0000"
                    }}
                    className="text-[#E8E8E0]/70 hover:text-[#8B0000] transition-colors duration-300
                              text-lg font-medium relative group"
                  >
                    {link.name}
                    
                    {/* Underline effect */}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#8B0000] 
                                    transition-all duration-300 group-hover:w-full" />
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </nav>

          {/* Separator line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="h-px bg-gradient-to-r from-transparent via-[#8B0000]/30 to-transparent mb-8"
          />

          {/* Copyright and tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-4"
          >
            <p className="text-[#E8E8E0]/50 text-sm">
              © 2026 Shadow Persuasion. All rights reserved.
            </p>
            
            <p className="text-[#E8E8E0]/40 text-xs font-mono tracking-wide uppercase">
              Knowledge is Power • Power is Responsibility • Responsibility is Eternal
            </p>
          </motion.div>

          {/* Subtle warning notice */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-8 inline-flex items-center gap-2 px-4 py-2 
                       bg-[#1A1A1A]/50 border border-[#8B0000]/20 rounded-lg"
          >
            <div className="w-2 h-2 bg-[#8B0000] rounded-full animate-pulse" />
            <span className="text-xs text-[#E8E8E0]/60 font-mono">
              This knowledge changes everything
            </span>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer