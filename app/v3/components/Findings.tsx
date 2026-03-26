"use client";

const findingsData = [
  { metric: "Close Rate", control: "31.2%", shadow: "54.8%", change: "+75.6%" },
  { metric: "Negotiation Outcomes (Value)", control: "+8.1%", shadow: "+22.4%", change: "+176.5%" },
  { metric: "Frame Control (Avg. Duration)", control: "2.3 min", shadow: "11.7 min", change: "+408.7%" },
  { metric: "First-Contact Conversion", control: "14.5%", shadow: "33.1%", change: "+128.3%" },
  { metric: "Objection Resolution Rate", control: "45.0%", shadow: "89.2%", change: "+98.2%" },
  { metric: "Client Retention (12-mo)", control: "62.7%", shadow: "81.4%", change: "+29.8%" },
];

const Findings = () => {
  return (
    <section id="findings" className="py-20 sm:py-24 border-b border-steel-gray">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-libre-baskerville text-3xl font-bold text-navy-deep">
            Empirical Findings
          </h2>
          <p className="mt-4 text-lg text-navy">
            Comparative analysis of key performance indicators between control groups and subjects trained in the Shadow Protocol.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-steel-gray">
            <thead className="bg-bone-light">
              <tr>
                <th className="py-3 px-6 text-left font-libre-baskerville text-navy-deep font-semibold">Metric</th>
                <th className="py-3 px-6 text-left font-libre-baskerville text-navy-deep font-semibold">Control Group</th>
                <th className="py-3 px-6 text-left font-libre-baskerville text-navy-deep font-semibold">Shadow Protocol</th>
                <th className="py-3 px-6 text-left font-libre-baskerville text-clinical-red font-semibold">Δ Change</th>
              </tr>
            </thead>
            <tbody>
              {findingsData.map((row, index) => (
                <tr key={index} className="border-t border-steel-gray hover:bg-bone-light/50 transition-colors duration-200">
                  <td className="py-4 px-6 font-semibold text-navy-deep">{row.metric}</td>
                  <td className="py-4 px-6 font-mono text-navy">{row.control}</td>
                  <td className="py-4 px-6 font-mono text-navy">{row.shadow}</td>
                  <td className="py-4 px-6 font-mono text-clinical-red-dark font-bold">{row.change}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6">
          <p className="text-xs text-steel-gray-light font-mono text-center">
            Note: Data derived from a double-blind study (N=256) conducted over 18 months in simulated high-stakes business environments. Full data set available upon request.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Findings;
