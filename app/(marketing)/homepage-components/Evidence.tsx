'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

const AnimatedNumber = ({ value, suffix = '', prefix = '', inView }: { value: number; suffix?: string; prefix?: string; inView: boolean }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => {
    if (suffix === '%' || suffix === '/10') return Math.round(v);
    if (suffix === ' u/hr') return v.toFixed(1);
    if (suffix === ' days') return v.toFixed(1);
    if (suffix === '% acc.') return Math.round(v);
    return Math.round(v);
  });
  const display = useTransform(rounded, (v) => `${prefix}${v}${suffix}`);

  useEffect(() => {
    if (inView) {
      const controls = animate(count, value, { duration: 1.5, ease: 'easeOut' });
      return controls.stop;
    }
  }, [inView, count, value]);

  return <motion.span>{display}</motion.span>;
};

type RowData = {
  metric: string;
  before: string;
  after: string;
  changeValue: number;
  changePrefix: string;
  changeSuffix: string;
};

const rows: RowData[] = [
  { metric: 'Salary Negotiation Success', before: '1 in 4', after: '3 in 4', changeValue: 200, changePrefix: '+', changeSuffix: '%' },
  { metric: 'Confidence in High-Stakes Conversations', before: '5.6/10', after: '9.2/10', changeValue: 64, changePrefix: '+', changeSuffix: '%' },
  { metric: 'Ability to Detect Manipulation', before: '18%', after: '89%', changeValue: 394, changePrefix: '+', changeSuffix: '%' },
  { metric: 'Time to Craft the Right Response', before: '2+ hours', after: '< 3 min', changeValue: 97, changePrefix: '-', changeSuffix: '%' },
  { metric: 'Relationship Conflict Resolution', before: '41%', after: '84%', changeValue: 105, changePrefix: '+', changeSuffix: '%' },
  { metric: 'Deal Close Rate (Business)', before: '28%', after: '67%', changeValue: 139, changePrefix: '+', changeSuffix: '%' },
];

const Evidence = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section ref={ref} className="relative -mx-6 md:-mx-12 px-6 md:px-12 py-20 bg-[#1A1A1A] text-[#E8E8E0]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-wider text-white">
            Before &amp; After: What Changes When You Have the System
          </h2>
          <div className="w-24 h-1 bg-[#D4A017] mt-4 mx-auto" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-base md:text-lg text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-[#D4A017]">
                <th className="p-3 font-mono uppercase text-sm text-[#D4A017]">Metric</th>
                <th className="p-3 font-mono uppercase text-sm text-[#D4A017] text-center">Before Protocol</th>
                <th className="p-3 font-mono uppercase text-sm text-[#D4A017] text-center">After Protocol</th>
                <th className="p-3 font-mono uppercase text-sm text-[#D4A017] text-center">&Delta; Change</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <motion.tr
                  key={row.metric}
                  className="border-b border-white/10"
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                >
                  <td className="p-3 whitespace-nowrap">{row.metric}</td>
                  <td className="p-3 text-center">{row.before}</td>
                  <td className="p-3 text-center">{row.after}</td>
                  <td className="p-3 font-bold text-center text-[#D4A017]">
                    <AnimatedNumber
                      value={row.changeValue}
                      prefix={row.changePrefix}
                      suffix={row.changeSuffix}
                      inView={inView}
                    />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-center mt-8 text-sm text-amber-500/50 font-mono">
          Based on self-reported member data. Individual results vary.
        </p>
      </div>
    </section>
  );
};

export default Evidence;
