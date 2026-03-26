'use client';
import { motion } from 'framer-motion';

const faqs = [
  {
    q: "Is this ethical?",
    a: "Power is a tool. We teach you how it works. You decide how to use it."
  },
  {
    q: "How is this different from other 'persuasion' courses?",
    a: "They teach you scripts. We teach you the underlying physics of human dynamics."
  },
  {
    q: "Is this for me?",
    a: "If you have to ask, probably not."
  },
  {
    q: "What if I'm not a founder or negotiator?",
    a: "The principles apply everywhere. The only prerequisite is an encounter with other human beings."
  }
];

export default function Questions() {
  return (
    <section className="py-32 px-12 md:px-24">
      <div className="mx-auto max-w-2xl">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: i * 0.4 }}
            viewport={{ once: true, amount: 0.8 }}
            className="mb-16"
          >
            <h3 className="text-xl font-semibold tracking-wider">{faq.q}</h3>
            <p className="mt-4 text-lg font-light tracking-wide pl-4">{faq.a}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
