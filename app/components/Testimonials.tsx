'use client'

import { motion } from 'framer-motion'

const Testimonials = () => {
  const leftColumnTestimonials = [
    {
      quote: "I finally understood how to make people say yes without them realizing they were being led. The psychological leverage techniques are surgical in their precision.",
      name: "Marcus Chen",
      role: "Corporate Strategy Director",
      stars: 5
    },
    {
      quote: "Frame control changed everything. I can now dictate the terms of any conversation before it begins. People think they're making independent decisions.",
      name: "Sarah Blackwood",
      role: "Senior Sales Executive",
      stars: 5
    },
    {
      quote: "The void pull technique is devastatingly effective. Creating that psychological tension makes them chase me, not the other way around.",
      name: "David Rodriguez",
      role: "Negotiation Consultant",
      stars: 5
    },
    {
      quote: "I've been studying influence for years, but this revealed layers I never knew existed. The ethical boundaries discussion was particularly enlightening.",
      name: "Elena Volkov",
      role: "Executive Coach",
      stars: 5
    },
    {
      quote: "Emotional hijacking sounds harsh, but it's just understanding how decisions really get made. This framework made me unstoppable in client meetings.",
      name: "James Mitchell",
      role: "Management Consultant",
      stars: 5
    },
    {
      quote: "Pattern interruption broke through resistance I couldn't crack for months. The timing and execution guidance was perfect.",
      name: "Anna Kowalski",
      role: "Business Development",
      stars: 5
    },
    {
      quote: "I always sensed there were hidden mechanics to persuasion. This course exposed them all. My close rate tripled within two months.",
      name: "Robert Kim",
      role: "Sales Director",
      stars: 5
    }
  ]

  const rightColumnTestimonials = [
    {
      quote: "Scarcity framing isn't about false urgency – it's about revealing genuine constraints. This distinction made all the difference in my approach.",
      name: "Victoria Stone",
      role: "Product Manager",
      stars: 5
    },
    {
      quote: "The anchoring techniques work on sophisticated audiences too. Board members, executives – everyone has the same psychological vulnerabilities.",
      name: "Michael Torres",
      role: "Investment Banker",
      stars: 5
    },
    {
      quote: "Social proof architecture is genius. Instead of telling people what to do, I create environments where they convince themselves.",
      name: "Lisa Zhang",
      role: "Marketing Director",
      stars: 5
    },
    {
      quote: "Mirroring at this level requires real skill. It's not mimicry – it's psychological synchronization. The results speak for themselves.",
      name: "Christopher Wade",
      role: "HR Executive",
      stars: 5
    },
    {
      quote: "I thought I understood negotiation until I learned about psychological leverage. This opened a completely different dimension of control.",
      name: "Nina Petrov",
      role: "Legal Counsel",
      stars: 5
    },
    {
      quote: "The dark patterns module was uncomfortable but necessary. Understanding these mechanics means I can both deploy and defend against them.",
      name: "Alex Turner",
      role: "CEO",
      stars: 5
    },
    {
      quote: "Covert persuasion works because people want to feel autonomous. This approach preserves that illusion while achieving your objectives.",
      name: "Maria Santos",
      role: "Operations Director",
      stars: 5
    }
  ]

  const StarRating = ({ count }: { count: number }) => (
    <div className="flex gap-1">
      {[...Array(count)].map((_, i) => (
        <svg 
          key={i} 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="#D4A017"
          className="text-[#D4A017]"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
      ))}
    </div>
  )

  const TestimonialCard = ({ testimonial, index }: { testimonial: any, index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-[#1A1A1A] p-6 rounded-xl border border-[#8B0000]/10 
                 hover:border-[#8B0000]/20 transition-all duration-300
                 relative overflow-hidden group"
      style={{
        background: `
          linear-gradient(135deg, #1A1A1A 0%, #1E1E1E 100%),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")
        `,
        backgroundBlendMode: 'overlay'
      }}
    >
      {/* Subtle hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#8B0000]/5 via-transparent 
                     to-[#8B0000]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <blockquote className="text-[#E8E8E0]/80 italic leading-relaxed mb-4 text-sm">
          "{testimonial.quote}"
        </blockquote>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-[#E8E8E0] text-sm">
              {testimonial.name}
            </div>
            <div className="text-[#E8E8E0]/60 text-xs">
              {testimonial.role}
            </div>
          </div>
          
          <StarRating count={testimonial.stars} />
        </div>
      </div>
    </motion.div>
  )

  return (
    <section className="py-24 px-6 lg:px-12 bg-[#111111] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-6xl font-bold font-serif mb-6 text-[#E8E8E0]">
            Operator <span className="text-[#8B0000]">Testimonials</span>
          </h2>
          <p className="text-xl text-[#E8E8E0]/70 max-w-3xl mx-auto">
            Confessions from those who've mastered the shadow arts of influence
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Scrolls Up */}
          <div className="space-y-6 testimonials-scroll-up">
            {[...leftColumnTestimonials, ...leftColumnTestimonials].map((testimonial, index) => (
              <TestimonialCard 
                key={`left-${index}`}
                testimonial={testimonial} 
                index={index % leftColumnTestimonials.length}
              />
            ))}
          </div>

          {/* Right Column - Scrolls Down */}
          <div className="space-y-6 testimonials-scroll-down">
            {[...rightColumnTestimonials, ...rightColumnTestimonials].map((testimonial, index) => (
              <TestimonialCard 
                key={`right-${index}`}
                testimonial={testimonial} 
                index={index % rightColumnTestimonials.length}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .testimonials-scroll-up {
          animation: scrollUp 120s linear infinite;
        }
        
        .testimonials-scroll-down {
          animation: scrollDown 120s linear infinite;
        }
        
        .testimonials-scroll-up:hover,
        .testimonials-scroll-down:hover {
          animation-play-state: paused;
        }
        
        @keyframes scrollUp {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        
        @keyframes scrollDown {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  )
}

export default Testimonials