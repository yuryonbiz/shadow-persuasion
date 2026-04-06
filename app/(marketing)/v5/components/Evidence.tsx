
'use client';

const TableRow = ({ metric, before, after, change }) => (
  <tr className="border-b border-white/10">
    <td className="p-3 whitespace-nowrap">{metric}</td>
    <td className="p-3 text-center">{before}</td>
    <td className="p-3 text-center">{after}</td>
    <td className={`p-3 font-bold text-center text-[#C0392B]`}>
        {change}
    </td>
  </tr>
);

const Evidence = () => {
  return (
    <section className="relative -mx-6 md:-mx-12 px-6 md:px-12 py-20 bg-[#1A1A1A] text-[#E8E8E0]">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-wider text-white">Exhibit A: Operational Effectiveness</h2>
                <div className="w-24 h-1 bg-red-600 mt-4 mx-auto"></div>
            </div>
      <div className="overflow-x-auto">
        <table className="w-full text-base md:text-lg text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-[#D4A017]">
              <th className="p-3 font-mono uppercase text-sm text-[#D4A017]">Metric</th>
              <th className="p-3 font-mono uppercase text-sm text-[#D4A017] text-center">Before Protocol</th>
              <th className="p-3 font-mono uppercase text-sm text-[#D4A017] text-center">After Protocol</th>
              <th className="p-3 font-mono uppercase text-sm text-[#D4A017] text-center">Δ Change</th>
            </tr>
          </thead>
          <tbody>
            <TableRow metric="Negotiation Win Rate" before="28%" after="74%" change="+164%" />
            <TableRow metric="Info. Extraction Yield" before="1.2 u/hr" after="7.8 u/hr" change="+550%" />
            <TableRow metric="Subject Compliance Rate" before="41%" after="92%" change="+124%" />
            <TableRow metric="Time-to-Conversion" before="14.2 days" after="3.1 days" change="-78%" />
            <TableRow metric="Operator Confidence" before="5.6/10" after="9.8/10" change="+75%" />
            <TableRow metric="Deception Detection" before="18% acc." after="89% acc." change="+394%" />
          </tbody>
        </table>
      </div>
      <p className="text-center mt-8 text-sm text-amber-500/50 font-mono">Note: Data collected across 20,847 active operators over 18-month period.</p>
      </div>
    </section>
  );
};

export default Evidence;
