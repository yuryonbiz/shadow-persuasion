'use client';

const TOCEntry = ({ number, title, page, redacted = false, id }) => (
  <a href={`#${id}`} className="block">
    <li className="flex items-end justify-between py-2 text-lg font-special-elite cursor-pointer hover:bg-gray-200 px-2 rounded-sm">
      <div className="flex items-end">
        <span className="mr-3 text-gray-600">{number}.</span>
        <span>{redacted ? <span className="bg-black text-black">{title}</span> : title}</span>
      </div>
      <div className="flex-grow border-b-2 border-dotted border-black mx-4"></div>
      <span className="text-gray-600">{page}</span>
    </li>
  </a>
);

const TableOfContents = () => {
  const sections = [
    { number: 1, title: 'Executive Summary', page: 2, id: 'summary' },
    { number: 2, title: 'System Capabilities (Declassified)', page: 3, id: 'capabilities' },
    { number: 3, title: 'Intercepted System Communication', page: 5, id: 'preview' },
    { number: 4, title: 'Subject Files: Core Concepts', page: 7, id: 'subjects' },
    { number: 5, title: 'Operational Module Index', page: 11, id: 'modules' },
    { number: 6, title: 'Operational Evidence: Field Test Results', page: 15, id: 'evidence' },
    { number: 7, title: 'Operator Testimonials', page: 19, id: 'statements' },
    { number: 8, title: 'Personnel Files (Restricted)', page: 22, id: 'architects' },
    { number: 9, title: 'Frequently Asked Questions (Sanitized)', page: 25, id: 'faq' },
    { number: 10, title: 'Request for Unredacted Access', page: 28, id: 'access' },
  ];

  return (
    <section className="relative bg-[#EDE3D0] p-8 my-16 border-2 border-dashed border-gray-500 shadow-inner-lg">
      <div className="absolute top-4 left-4 font-mono text-sm text-gray-500">DOCUMENT MAP</div>
      <h2 className="font-special-elite text-3xl font-bold mb-8 text-center">Table of Contents</h2>
      <ul className="space-y-2 max-w-3xl mx-auto">
        {sections.map(section => (
            <TOCEntry key={section.id} {...section} />
        ))}
      </ul>
      <div className="absolute -bottom-5 -right-5 text-red-700 text-2xl font-bold border-4 border-red-700 p-2 transform rotate-6 opacity-80 font-mono">
        APPROVED FOR RELEASE
      </div>
    </section>
  );
};

export default TableOfContents;
