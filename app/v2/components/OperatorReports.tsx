'use client';

import { motion } from 'framer-motion';

const reports = [
  {
    codename: 'VIPER',
    report: 'Frameworks integrated. Negotiation architecture is ruthlessly effective. Moved from a 6-figure to a 7-figure deal in under an hour. Target was unaware of the vectors of influence. Mission successful.',
    rating: '5/5',
  },
  {
    codename: 'GHOST',
    report: 'Leveraged emotional exploitation protocols during a hostile corporate takeover. Bypassed all logical defenses. The board folded in 24 hours. Minimal resistance. High-value asset acquired.',
    rating: '5/5',
  },
  {
    codename: 'SPECTRE',
    report: 'Applied Frame Control during a high-stakes investor pitch. They weren\'t just buying the company, they were buying my reality. Secured double the initial ask. The playbook works.',
    rating: '5/5',
  },
  {
    codename: 'ORACLE',
    report: 'Social Proof Engineering module is almost too powerful. Manufactured a city-wide trend in under a week. The level of control is unprecedented. Use with caution.',
    rating: '4.9/5',
  },
];

export default function OperatorReports() {
  return (
    <section className="my-12">
      <h2 className="mb-8 font-mono text-3xl uppercase tracking-widest text-white">
        Operator Reports
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {reports.map((report, i) => (
          <motion.div
            key={report.codename}
            className="border border-[#1A2E1A] bg-black p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-mono text-xl font-bold uppercase text-[#FF8C00]">
                Field Report — {report.codename}
              </h3>
              <span className="text-xs text-gray-500">
                CLASSIFICATION: EYES ONLY
              </span>
            </div>
            <p className="mb-4 font-mono text-base leading-relaxed text-gray-300">
              {report.report}
            </p>
            <div className="mt-4 flex items-center justify-between border-t border-[#333] pt-4">
              <span className="text-xs text-gray-500">
                TIMESTAMP: 2026-03-26 15:03:17Z
              </span>
              <span className="font-mono text-sm text-[#FF8C00]">
                Operator Rating: {report.rating}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
