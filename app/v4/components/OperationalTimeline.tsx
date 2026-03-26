'use client';

import { motion } from 'framer-motion';

const RedactedDate = () => <span className="bg-black text-black select-none">██/██/2026</span>;

const TimelineEvent = ({ phase, description, date, isLast }) => (
  <motion.div 
    className="relative pl-8"
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, amount: 0.5 }}
    transition={{ duration: 0.5 }}
  >
    {!isLast && <div className="absolute top-4 left-[3px] w-0.5 h-full bg-red-700" />}
    <div className="absolute top-4 left-0 w-2 h-2 bg-red-700 rounded-full" />
    
    <div className="p-4 bg-[#E8DCC8] border border-gray-400 -translate-y-2">
      <p className="font-bold text-sm uppercase tracking-wider text-gray-600">{date}</p>
      <h3 className="font-bold text-lg">{phase}</h3>
      <p className="text-sm">{description}</p>
    </div>
  </motion.div>
);

export default function OperationalTimeline() {
  const events = [
    { phase: 'Initial Assessment', description: 'Identification of key personnel and power structures within the target organization.', date: '01/15/2026' },
    { phase: 'Subject Profiling', description: 'Psychological and behavioral analysis of primary and secondary targets conducted.', date: '03/22/2026' },
    { phase: 'Approach Vector', description: 'Optimal channels for influence selected. Operatives integrated into subjects\' social and professional circles.', date: '06/05/2026' },
    { phase: 'Engagement Protocol', description: 'Core persuasive techniques deployed across multiple vectors. Preliminary results monitored.', date: '██/██/2026' },
    { phase: 'Extraction Sequence', description: 'Operatives disengaged. Disinformation protocols initiated to obscure program involvement.', date: '11/08/2026' },
    { phase: 'Post-Op Analysis', description: 'Long-term behavioral changes and ROI assessed. Findings integrated into future training modules.', date: '12/31/2026' },
  ];

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold uppercase tracking-wider text-center mb-12">
        Operational Timeline
      </h2>
      <div className="max-w-xl mx-auto space-y-8">
        {events.map((event, index) => (
          <TimelineEvent 
            key={index} 
            phase={event.phase}
            description={event.description}
            date={event.date.startsWith('█') ? <RedactedDate /> : event.date}
            isLast={index === events.length - 1} 
          />
        ))}
      </div>
    </section>
  );
}
