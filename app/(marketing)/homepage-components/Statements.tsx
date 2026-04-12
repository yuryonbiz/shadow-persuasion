'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Redacted = ({ children }: { children: React.ReactNode }) => <span className="bg-black text-black inline-block px-1">{children}</span>;

interface StatementProps {
  codename: string;
  date: string;
  title: string;
  children: React.ReactNode;
  index: number;
  inView: boolean;
}

const Statement = ({ codename, date, title, children, index, inView }: StatementProps) => (
  <motion.div
    className="border-2 border-gray-400 bg-[#F4ECD8] p-8 relative shadow-md"
    initial={{ opacity: 0, y: 30 }}
    animate={inView ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 0.5, delay: index * 0.15 }}
  >
    {/* Quotation mark */}
    <span className="text-5xl leading-none text-amber-600/40 font-serif select-none">
      &ldquo;
    </span>

    <h3 className="font-mono text-xs uppercase tracking-widest text-amber-700 font-bold mb-1">
      [{codename}] &mdash; {title}
    </h3>
    <p className="font-mono text-xs text-gray-500 mb-4">STATEMENT TAKEN {date}</p>

    <div className="text-[#1A1A1A] text-base leading-relaxed space-y-4">
      {children}
    </div>

    <div className="mt-6 pt-4 border-t border-gray-300">
      <p className="text-sm text-gray-600">Signature: <span className="font-mono">_______________</span></p>
    </div>

    <div className="absolute bottom-4 right-4 text-red-700 text-sm font-bold border-2 border-red-700 p-1.5 transform -rotate-6 opacity-70 font-mono">
      VERIFIED MEMBER
    </div>
  </motion.div>
);

const Statements = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <section ref={ref}>
      <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500 mb-2">
        MEMBER TESTIMONIALS
      </h2>
      <p className="text-3xl mt-1 mb-12">What Members Are Saying</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Statement codename="ALEX M." date="MARCH 2026" title="SALES PROFESSIONAL" index={0} inView={inView}>
          <p>&ldquo;I used to wing every sales conversation. Shadow Persuasion taught me that closing isn&apos;t about pressure — it&apos;s about understanding what the other person actually needs and framing your offer around that. My close rate went from 22% to 71% in three months. The AI coach doesn&apos;t just give you lines to say. It teaches you WHY they work.&rdquo;</p>
        </Statement>

        <Statement codename="SARAH K." date="FEBRUARY 2026" title="TECH EXECUTIVE" index={1} inView={inView}>
          <p>&ldquo;I was getting passed over for promotion despite outperforming my peers. The Conversation Analyzer showed me that my boss was using delay tactics every time I brought up advancement. The AI gave me a specific framework to reframe the conversation — and I got promoted within 6 weeks. This tool is like having a world-class negotiation coach in your pocket.&rdquo;</p>
        </Statement>

        <Statement codename="JAMES R." date="JANUARY 2026" title="STARTUP FOUNDER" index={2} inView={inView}>
          <p>&ldquo;I used to dread investor meetings. I&apos;d over-explain, get flustered by tough questions, and leave feeling like I&apos;d been outmaneuvered. After two weeks with the Training Arena, I went into my Series A pitch with a completely different presence. We closed the round at a 40% higher valuation than our initial target.&rdquo;</p>
        </Statement>
      </div>
    </section>
  );
};

export default Statements;
