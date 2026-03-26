"use client";

const caseStudies = [
  {
    case: 1,
    context: "Multi-round negotiation with a hostile counterparty for a technology licensing agreement.",
    quote: "The ability to reframe the entire negotiation from a zero-sum conflict to a collaborative problem-solving exercise, while maintaining complete control, was astonishing. We didn't just win; we redefined what winning meant.",
    author: "K. Patel, Head of Corporate Strategy, FinTech Unicorn",
  },
  {
    case: 2,
    context: "Internal leadership challenge during a corporate restructuring.",
    quote: "This isn't about manipulation; it's about understanding the deep structure of communication. I was able to preempt and neutralize dissent by addressing the unstated anxieties of my team, rather than the superficial arguments.",
    author: "Dr. L. Moreau, Chief Operating Officer, BioGenCorp",
  },
  {
    case: 3,
    context: "Venture capital fundraising in a competitive market.",
    quote: "The framework allowed me to diagnose the investors' underlying decision-making criteria with clinical precision. I stopped pitching and started aligning. The result was a term sheet that exceeded our most optimistic projections.",
    author: "A. Singh, Founder & CEO, Series B SaaS Startup",
  },
];

const CaseStudies = () => {
  return (
    <section id="case-studies" className="py-20 sm:py-24 border-b border-steel-gray bg-bone-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-libre-baskerville text-3xl font-bold text-navy-deep">
            Selected Case Studies
          </h2>
          <p className="mt-4 text-lg text-navy">
            Qualitative data from practitioners in the field.
          </p>
        </div>
        <div className="space-y-12">
          {caseStudies.map((study) => (
            <div key={study.case}>
              <h3 className="font-mono text-sm uppercase tracking-widest text-navy">Case Study {String(study.case).padStart(3, '0')}</h3>
              <p className="mt-1 text-sm text-steel-gray-light italic">{study.context}</p>
              <blockquote className="mt-4 border-l-4 border-clinical-red pl-6">
                <p className="font-libre-baskerville text-xl sm:text-2xl italic text-navy-deep leading-relaxed">
                  “{study.quote}”
                </p>
              </blockquote>
              <p className="mt-4 text-right font-semibold text-navy">
                — {study.author}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;
