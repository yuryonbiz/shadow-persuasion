"use client";

const contents = [
  { roman: "I", title: "Foundations of Influence", page: "01" },
  { roman: "II", title: "Frame Control Methodology", page: "02" },
  { roman: "III", title: "Covert Persuasion Patterns", page: "03" },
  { roman: "IV", title: "Negotiation Architecture", page: "04" },
  { roman: "V", title: "Emotional Leverage Systems", page: "05" },
  { roman: "VI", title: "Applied Deployment", page: "06" },
];

const TableOfContents = () => {
  const scrollToMethodology = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const methodologySection = document.getElementById('methodology');
    if (methodologySection) {
      methodologySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="toc" className="py-20 sm:py-24 border-b border-steel-gray">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-libre-baskerville text-3xl font-bold text-navy-deep text-center mb-12">
          Table of Contents
        </h2>
        <div className="space-y-4">
          {contents.map((item, index) => (
            <a href="#methodology" key={index} onClick={scrollToMethodology} className="group block py-4 border-b border-steel-gray last:border-b-0 hover:bg-bone-light transition-colors duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-libre-baskerville text-2xl text-navy w-12">{item.roman}.</span>
                  <span className="font-libre-baskerville text-xl text-navy-deep group-hover:text-clinical-red transition-colors duration-300">{item.title}</span>
                </div>
                <div className="flex items-end">
                  <span className="border-b border-dotted border-steel-gray flex-grow mx-2"></span>
                  <span className="font-mono text-lg text-steel-gray-light">{item.page}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TableOfContents;
