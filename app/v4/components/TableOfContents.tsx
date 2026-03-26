'use client';

const TOCEntry = ({ number, title, page, redacted = false }) => (
  <div className="flex justify-between items-end">
    <div className="flex items-end">
      <span>{number}</span>
      <span className="ml-2">{redacted ? <span className="bg-black text-black">████████ Techniques</span> : title}</span>
    </div>
    <span className="flex-grow border-b border-dotted border-gray-400 mx-2"></span>
    <span>{page}</span>
  </div>
);

const Stamp = ({ text, color, rotation }) => (
  <div
    className="relative border-2 p-1 font-black text-xl uppercase inline-block mt-8"
    style={{
      borderColor: color,
      color: color,
      transform: `rotate(${rotation}deg)`,
    }}
  >
    {text}
  </div>
);


export default function TableOfContents() {
  return (
    <section className="p-8">
      <h2 className="text-2xl font-bold uppercase tracking-wider text-center mb-8">
        Contents
      </h2>
      <div className="space-y-3 max-w-md mx-auto">
        <TOCEntry number="1.0" title="Introduction & Threat Assessment" page="3" />
        <TOCEntry number="2.0" title="Core Methodologies" page="7" />
        <TOCEntry number="3.0" title="Subject Profiling & Vectoring" page="15" />
        <TOCEntry number="4.0" title="████████ Techniques" page="24" redacted />
        <TOCEntry number="5.0" title="Case Studies: Operation Mockingbird" page="38" />
        <TOCEntry number="6.0" title="Counter-Influence Protocols" page="52" />
        <TOCEntry number="7.0" title="Appendix A: Operator Field Kit" page="65" />
        <TOCEntry number="8.0" title="Appendix B: ████████" page="71" redacted />
      </div>
      <div className="text-center mt-12">
        <Stamp text="APPROVED FOR RELEASE" color="#C0392B" rotation={-5} />
      </div>
    </section>
  );
}
