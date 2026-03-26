"use client";

import { motion } from 'framer-motion';

const CallToAction = () => {
  return (
    <section id="cta" className="text-center py-24 sm:py-32">
      <h2 className="font-libre-baskerville text-4xl sm:text-5xl font-bold text-navy-deep">
        Knowledge is ethically neutral. <br /> Application is not.
      </h2>
      <p className="mt-6 max-w-xl mx-auto text-lg text-navy leading-8">
        Access the complete framework and gain a decisive advantage in your professional interactions.
      </p>
      <div className="mt-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-navy-deep text-bone-light px-10 py-4 text-xl font-semibold shadow-lg hover:bg-navy transition-colors duration-300"
        >
          Request Access
        </motion.button>
      </div>
      <p className="mt-6 text-sm text-steel-gray-light font-mono">
        Individual and institutional licenses available.
      </p>
    </section>
  );
};

export default CallToAction;
