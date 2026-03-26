'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "Is this manipulation?",
      answer: "All human interaction involves influence. The question isn't whether you're influencing others – you always are. The question is whether you're doing it consciously and ethically. Our framework teaches you to be aware of the psychological forces already at play, giving you the choice to use them responsibly rather than being unconsciously manipulated by others who understand these dynamics."
    },
    {
      question: "Will this work on people who already understand influence?",
      answer: "Yes, because these techniques operate on fundamental cognitive architecture that exists in all humans, including experts. Knowing about cognitive biases doesn't make you immune to them – it just makes you aware when they're happening. Even psychologists fall prey to anchoring, even negotiation experts respond to social proof, even influence practitioners are susceptible to pattern interruption when executed skillfully."
    },
    {
      question: "What separates persuasion from coercion?",
      answer: "Persuasion expands someone's perceived options and helps them make better decisions aligned with their values. Coercion removes options and forces compliance through fear or pressure. Our techniques help people see possibilities they missed and make choices they'll thank you for later. The difference is in intent: are you helping them get what they want, or forcing them to give you what you want?"
    },
    {
      question: "How quickly will I see results?",
      answer: "Most operators notice immediate improvements in rapport and frame control within their first conversations. Measurable changes in negotiation outcomes typically appear within 2-3 weeks of consistent application. Full mastery of the advanced techniques – void pull, emotional hijacking, social proof architecture – develops over 3-6 months depending on practice frequency and natural aptitude."
    },
    {
      question: "Is this legal?",
      answer: "These are psychological techniques, not legal violations. Everything taught operates within ethical and legal boundaries when applied properly. We cover the ethical framework extensively because with great power comes great responsibility. The techniques themselves are morally neutral tools – like a knife that can cut food or cause harm. The intent and application determine the ethics, not the tool itself."
    },
    {
      question: "Who is this NOT for?",
      answer: "This framework isn't for people seeking quick manipulation tricks or those who want to harm others for personal gain. It's not for individuals who lack emotional intelligence or self-awareness. If you're looking for pickup artist tactics, MLM recruitment schemes, or ways to exploit vulnerable people, this isn't your program. This is for professionals who want to understand human psychology to create win-win outcomes and build genuine influence."
    }
  ]

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-24 px-6 lg:px-12 bg-[#111111]">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-6xl font-bold font-serif mb-6 text-[#E8E8E0]">
            Frequently Asked <span className="text-[#8B0000]">Questions</span>
          </h2>
          <p className="text-xl text-[#E8E8E0]/70 max-w-3xl mx-auto">
            Direct answers to the questions that matter
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-[#1A1A1A] rounded-xl border border-[#8B0000]/10 overflow-hidden
                         hover:border-[#8B0000]/20 transition-all duration-300"
              style={{
                background: `
                  linear-gradient(135deg, #1A1A1A 0%, #1E1E1E 100%),
                  url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E")
                `,
                backgroundBlendMode: 'overlay'
              }}
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full text-left p-6 focus:outline-none group"
              >
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-bold transition-colors duration-300 ${
                    openIndex === index 
                      ? 'text-white' 
                      : 'text-[#E8E8E0] group-hover:text-white'
                  }`}>
                    {faq.question}
                  </h3>
                  
                  <motion.div
                    animate={{ rotate: openIndex === index ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={`w-6 h-6 flex items-center justify-center transition-colors duration-300 ${
                      openIndex === index ? 'text-[#8B0000]' : 'text-[#E8E8E0]/60'
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </motion.div>
                </div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ 
                      duration: 0.3,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      {/* Separator line */}
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="h-px bg-gradient-to-r from-[#8B0000]/30 via-[#8B0000]/60 
                                  to-[#8B0000]/30 mb-4 origin-left"
                      />
                      
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                        className="text-[#E8E8E0]/80 leading-relaxed"
                      >
                        {faq.answer}
                      </motion.p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom border for visual separation */}
              {index < faqs.length - 1 && (
                <div className="h-px bg-gradient-to-r from-transparent via-[#1E1E1E] to-transparent" />
              )}
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
          <p className="text-sm text-[#E8E8E0]/50">
            Still have questions? The shadows hold more answers than you might expect.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

export default FAQ