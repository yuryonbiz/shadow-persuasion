'use client';

import { motion, useInView, useSpring } from 'framer-motion';
import { useEffect, useRef } from 'react';

const AnimatedNumber = ({ value, isString = false }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    
    // For numbers, use a spring animation
    const numberValue = isString ? parseFloat(value) : value;
    const spring = useSpring(0, { damping: 30, stiffness: 100 });
  
    useEffect(() => {
      if (isInView) {
        spring.set(numberValue);
      }
    }, [isInView, numberValue, spring]);
  
    useEffect(() => {
      // For strings, we just display the final value instantly on view
      if (isString && isInView) return;

      const unsubscribe = spring.on("change", (latest) => {
        if (ref.current) {
          // Format integers without decimals, floats with one decimal for "94.7%"
          ref.current.textContent = Number.isInteger(numberValue) 
            ? Math.round(latest).toLocaleString() 
            : latest.toFixed(1);
        }
      });
  
      return () => unsubscribe();
    }, [spring, isString, numberValue, isInView]);

    if (isString) {
        return <span ref={ref}>{isInView ? value : '0+'}</span>
    }
  
    return <span ref={ref}>0</span>;
};


const metrics = [
    { value: 20847, label: "Active Operators" },
    { value: 94.7, label: "Avg Success Rate", suffix: "%" },
    { value: "50+", label: "Influence Frameworks", isString: true },
    { value: "24/7", label: "AI Availability", isString: true },
];

const testimonials = [
    {
        codename: 'VIPER',
        report: ' "The AI console is a battlefield advantage. I closed a deal worth 6 figures by following the script word-for-word." '
    },
    {
        codename: 'GHOST',
        report: ' "I used to hate negotiating. Now I look forward to it. Frame control changed everything for me." '
    },
    {
        codename: 'SPECTRE',
        report: ' "The visual intelligence module picked up on a micro-expression I completely missed. Saved me from a very bad partnership." '
    },
];

export const Metrics = () => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="bg-[#0A0A0A] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-mono text-base font-semibold uppercase tracking-widest text-[#FF8C00]">
            Operational Metrics
          </h2>
        </div>
        
        <div className="mt-16 grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
            {metrics.map((metric, index) => (
                <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                    <div className="text-4xl font-bold text-white md:text-5xl">
                        <AnimatedNumber value={metric.value} isString={metric.isString} />
                        {metric.suffix && metric.suffix}
                    </div>
                    <p className="mt-2 text-sm uppercase tracking-wider text-gray-400">{metric.label}</p>
                </motion.div>
            ))}
        </div>

        <motion.div 
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.8 }}
            className="my-24 h-px w-full bg-[#FF8C00]/30"
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
             <motion.div 
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 1 + index * 0.2 }}
                className="relative rounded-lg border border-[#333] bg-[#111] p-8"
             >
                <div className="absolute -top-3 right-4 font-mono text-[10px] uppercase text-red-500 transform -rotate-12 border border-red-500 px-2 py-0.5 bg-[#0A0A0A] z-10">CLASSIFIED</div>
                <p className="text-gray-300">{testimonial.report}</p>
                <p className="mt-6 font-mono text-sm font-semibold uppercase tracking-wider text-[#FF8C00]">FIELD REPORT // {testimonial.codename}</p>
             </motion.div>
        ))}
        </div>

      </div>
    </section>
  );
};
