'use client';

import { motion } from 'framer-motion';

const metrics = [
  { label: 'Avg Close Rate', value: '+47%', progress: 47 },
  { label: 'Negotiation Success', value: '94.7%', progress: 94.7 },
  { label: 'Frame Control Index', value: '9.2/10', progress: 92 },
  { label: 'Operator Retention', value: '98.1%', progress: 98.1 },
];

export default function MetricsDashboard() {
  return (
    <section className="my-12">
      <h2 className="mb-4 font-mono text-3xl uppercase tracking-widest text-white">
        Operational Metrics — Live
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            className="border border-[#333] p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <h3 className="text-md font-semibold uppercase text-gray-400">
              {metric.label}
            </h3>
            <p className="my-2 font-mono text-4xl font-bold text-[#FF8C00]">
              {metric.value}
            </p>
            <div className="h-2 w-full bg-[#1A2E1A]">
              <motion.div
                className="h-2 bg-[#FF8C00]"
                initial={{ width: 0 }}
                animate={{ width: `${metric.progress}%` }}
                transition={{ duration: 1, delay: i * 0.2 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
