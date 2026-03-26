'use client';
import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "I used to think I was persuasive. Now I realize I was just loud.",
    author: "MARCUS, CEO",
  },
  {
    quote: "The ability to reframe a conversation is a superpower. This is where you learn it.",
    author: "ELARA, NEGOTIATOR",
  },
  {
    quote: "It's unsettling how effective this is. I almost feel guilty.",
    author: "JONAH, FOUNDER",
  },
];

export default function Voices() {
  return (
    <section className="py-24">
      {testimonials.map((testimonial, i) => (
        <div key={i} className="flex h-[70vh] items-center justify-center text-center">
          <motion.figure
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 2 }}
            viewport={{ once: true, amount: 0.5 }}
            className="max-w-3xl px-8"
          >
            <blockquote className="text-4xl font-light italic tracking-wide">
              “{testimonial.quote}”
            </blockquote>
            <figcaption className="mt-8 text-xs font-semibold uppercase tracking-[0.2em]">
              — {testimonial.author}
            </figcaption>
          </motion.figure>
        </div>
      ))}
    </section>
  );
}
