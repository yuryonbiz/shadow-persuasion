"use client";

import { motion } from 'framer-motion';

const methodologies = [
  {
    figure: "I",
    title: "Foundations of Influence",
    description: "An examination of the core psychological drivers that underpin all human decision-making, synthesizing principles from behavioral economics and social psychology into a unified model.",
  },
  {
    figure: "II",
    title: "Frame Control Methodology",
    description: "A systematic process for establishing and maintaining cognitive dominance in any interaction. This module deconstructs the architecture of conversational frames and provides protocols for their control.",
  },
  {
    figure: "III",
    title: "Covert Persuasion Patterns",
    description: "The deployment of specific linguistic structures and narrative techniques designed to bypass conscious resistance and embed suggestion at a subconscious level.",
  },
  {
    figure: "IV",
    title: "Negotiation Architecture",
    description: "A structured approach to high-stakes negotiation that moves beyond tactics to the strategic design of the negotiation environment and agenda itself.",
  },
  {
    figure: "V",
    title: "Emotional Leverage Systems",
    description: "The identification and application of emotional states as leverage points. This section provides a clinical framework for modulating the affective states of counterparts to achieve desired outcomes.",
  },
  {
    figure: "VI",
    title: "Applied Deployment",
    description: "Practical application frameworks, including red-teaming scenarios and live-fire simulations, to ensure the internalization and effective deployment of the preceding modules.",
  },
];

const Methodology = () => {
  return (
    <section id="methodology" className="py-20 sm:py-24 border-b border-steel-gray bg-bone-light">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-libre-baskerville text-3xl font-bold text-navy-deep">
            Core Methodology
          </h2>
          <p className="mt-4 text-lg text-navy max-w-2xl mx-auto">
            The framework is modular, allowing for systematic study and application. Each module represents a distinct domain of strategic influence.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {methodologies.map((item, index) => (
            <motion.div
              key={index}
              className="group relative bg-white p-6 shadow-sm border border-steel-gray hover:border-steel-gray-light transition-all duration-300"
              whileHover={{ y: -5 }}
            >
              <div className="absolute left-0 top-0 h-full w-1 bg-transparent group-hover:bg-clinical-red transition-all duration-300"></div>
              <div>
                <span className="font-mono text-sm text-clinical-red">Figure {item.figure}</span>
                <h3 className="mt-2 font-libre-baskerville text-xl font-bold text-navy-deep">{item.title}</h3>
                <p className="mt-4 text-base text-navy leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Methodology;
