'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Check, Shield } from 'lucide-react';

const benefits = [
  "Decode hidden intentions in any conversation",
  "Generate psychologically optimized responses in seconds",
  "Detect deception with 89% accuracy",
  "Dominate negotiations before they begin",
  "Build unshakable confidence backed by AI intelligence",
];

const AccessRequest = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section ref={ref} className="bg-[#0D0D0D] w-full py-24 px-6 md:px-12">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Ready to See What Others Miss?
          </h2>
          <p className="text-lg text-gray-400 mb-12 max-w-xl mx-auto">
            Gain an unfair advantage in every conversation. See the psychology others can&apos;t — and respond with precision they won&apos;t expect.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="bg-[#141414] border border-white/10 rounded-2xl p-8 md:p-12 mb-8"
        >
          {/* Benefits */}
          <ul className="text-left space-y-4 mb-10 max-w-md mx-auto">
            {benefits.map((benefit, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
              >
                <Check className="w-5 h-5 text-[#D4A017] mt-0.5 flex-shrink-0" strokeWidth={3} />
                <span className="text-gray-300 text-base">{benefit}</span>
              </motion.li>
            ))}
          </ul>

          {/* Price */}
          <div className="mb-8">
            <p className="text-5xl md:text-6xl font-bold text-white">
              $99<span className="text-xl font-normal text-gray-500">/month</span>
            </p>
            <p className="text-sm text-gray-500 mt-2">Cancel anytime. No contracts.</p>
          </div>

          {/* CTA Button */}
          <motion.button
            className="relative w-full max-w-md mx-auto block bg-[#D4A017] hover:bg-[#b88913] text-black font-bold text-lg uppercase tracking-wider py-5 px-8 rounded-lg transition-colors duration-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="relative z-10">REQUEST OPERATOR ACCESS</span>
            {/* Pulse glow */}
            <motion.span
              className="absolute inset-0 rounded-lg bg-[#D4A017]/40"
              animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.button>
        </motion.div>

        {/* Guarantee badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-2 text-[#D4A017]">
            <Shield className="w-5 h-5" />
            <span className="font-mono text-sm uppercase tracking-wider font-bold">
              30-Day Intelligence Guarantee
            </span>
          </div>
          <p className="text-xs text-gray-600 font-mono tracking-wide">
            256-bit encryption &bull; Cancel anytime &bull; Immediate access
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default AccessRequest;
