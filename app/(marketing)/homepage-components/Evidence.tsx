'use client';

type RowData = {
  metric: string;
  before: string;
  after: string;
  changeDisplay: string;
};

const rows: RowData[] = [
  { metric: 'Salary Negotiation Success', before: '1 in 4', after: '3 in 4', changeDisplay: '+200%' },
  { metric: 'Confidence in High-Stakes Conversations', before: '5.6/10', after: '9.2/10', changeDisplay: '+64%' },
  { metric: 'Ability to Detect Manipulation', before: '18%', after: '89%', changeDisplay: '+394%' },
  { metric: 'Time to Craft the Right Response', before: '2+ hours', after: '< 3 min', changeDisplay: '-97%' },
  { metric: 'Relationship Conflict Resolution', before: '41%', after: '84%', changeDisplay: '+105%' },
  { metric: 'Deal Close Rate (Business)', before: '28%', after: '67%', changeDisplay: '+139%' },
];

const Evidence = () => {
  return (
    <section className="relative px-6 md:px-12 py-20 bg-[#1A1A1A] text-[#E8E8E0]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-wider text-white">
            Before &amp; After: What Changes When You Have the System
          </h2>
          <div className="w-24 h-1 bg-[#D4A017] mt-4 mx-auto" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-base md:text-lg text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-[#D4A017]">
                <th className="p-3 font-mono uppercase text-sm text-[#D4A017]">Metric</th>
                <th className="p-3 font-mono uppercase text-sm text-[#D4A017] text-center">Before Protocol</th>
                <th className="p-3 font-mono uppercase text-sm text-[#D4A017] text-center">After Protocol</th>
                <th className="p-3 font-mono uppercase text-sm text-[#D4A017] text-center">&Delta; Change</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.metric}
                  className="border-b border-white/10"
                >
                  <td className="p-3">{row.metric}</td>
                  <td className="p-3 text-center">{row.before}</td>
                  <td className="p-3 text-center">{row.after}</td>
                  <td className="p-3 font-bold text-center text-[#D4A017]">
                    {row.changeDisplay}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-center mt-8 text-sm text-amber-500/50 font-mono">
          Based on self-reported member data. Individual results vary.
        </p>
      </div>
    </section>
  );
};

export default Evidence;
