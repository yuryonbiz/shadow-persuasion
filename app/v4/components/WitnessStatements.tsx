'use client';
import { motion } from 'framer-motion';

const Redacted = () => <span className="bg-black text-black select-none">█████████████</span>;

const Stamp = ({ text, color, rotation }) => (
  <div
    className={`absolute bottom-4 right-4 border-2 p-1 font-black text-xs uppercase opacity-70`}
    style={{
      borderColor: color,
      color: color,
      transform: `rotate(${rotation}deg)`,
    }}
  >
    {text}
  </div>
);

const Statement = ({ name, date, children }) => (
    <motion.div 
        className="relative p-6 bg-[#E8DCC8] border border-gray-400"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.5 }}
    >
        <div className="border-b border-gray-400 pb-2 mb-4">
            <h3 className="font-bold uppercase">STATEMENT OF {name}</h3>
            <p className="text-xs text-gray-600">TAKEN {date}</p>
        </div>
        <blockquote className="italic space-y-3 leading-relaxed">
            {children}
        </blockquote>
        <div className="mt-8 text-right">
            <p>Signature: <span className="font-mono">____________________</span></p>
            <p className="text-sm">{name}</p>
        </div>
        <Stamp text="SWORN AND ATTESTED" color="#2C5F8A" rotation={5} />
    </motion.div>
);

export default function WitnessStatements() {
  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold uppercase tracking-wider text-center mb-10">
        Witness Statements
      </h2>
      <div className="max-w-2xl mx-auto space-y-8">
        <Statement name="Operator K-7" date="██/██/2026">
          <p>"The training is unlike anything I've experienced. It rewired my perception of communication. In my last assignment at <Redacted />, I was able to shift a board-level decision worth nine figures in less than a week. The subject never knew I was there."</p>
        </Statement>
        <Statement name="Subject 84B (Debrief)" date="11/19/2026">
          <p>"Looking back, I can't explain why I changed my mind. It just felt... right. It was my idea, completely. The thought that someone else influenced me is absurd. I'm in control of my own decisions. I've always been."</p>
        </Statement>
        <Statement name="[NAME REDACTED]" date="01/05/2027">
            <p>"We acquired the target company for pennies on the dollar. Their lead negotiator just... folded. He gave up every point of leverage. It was the easiest deal of my career. My new consultant, introduced to me by <Redacted />, was instrumental. Worth every penny."</p>
        </Statement>
      </div>
    </section>
  );
}
