'use client';

import styles from './ClassifiedComparison.module.css';

const features = [
    { name: "Basic Influence Guide", civilian: true, operator: true },
    { name: "AI Operator Console", civilian: false, operator: true },
    { name: "Visual Intelligence", civilian: false, operator: true },
    { name: "50+ Dark Patterns", civilian: false, operator: true },
    { name: "Negotiation Simulator", civilian: false, operator: true },
    { name: "Script Generator", civilian: false, operator: true },
    { name: "Psychological Profiling", civilian: false, operator: true },
    { name: "Private Community", civilian: false, operator: true },
];

const Checkmark = () => <span className="text-green-600 font-bold">✓</span>;
const Redacted = () => <span className="bg-black text-black select-none">██████</span>

const ClassifiedComparison = () => {
  return (
    <section className={`relative py-16 ${styles.container}`}>
        <div className="text-center mb-12">
            <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500">
                DOCUMENT COMPARISON
            </h2>
            <p className="text-3xl mt-2">Access Levels</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-2 border-gray-400 bg-[#F4ECD8] shadow-lg p-6 sm:p-8">
            {/* Civilian Access */}
            <div className="border border-dashed border-gray-400 p-6">
                <h3 className="text-2xl text-center font-bold">CIVILIAN ACCESS</h3>
                <p className="text-center font-mono text-lg text-gray-600 mb-6">FREE</p>
                <ul className="space-y-4">
                    {features.map(f => (
                        <li key={f.name} className="flex justify-between items-center text-lg">
                            <span>{f.name}</span>
                            {f.civilian ? <Checkmark/> : <div className={styles.redacted}><Redacted/></div>}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Operator Access */}
            <div className="border-2 border-amber-500 p-6 bg-[#fffef7] shadow-2xl relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black font-mono text-xs uppercase px-2 py-1 font-bold">RECOMMENDED</div>
                <h3 className="text-2xl text-center font-bold text-amber-900">OPERATOR ACCESS</h3>
                <p className="text-center font-mono text-lg mb-6">
                    <span className="line-through text-gray-500">$97</span>
                    <span className="text-amber-700 font-bold"> $47/MO</span>
                </p>
                <ul className="space-y-4">
                    {features.map(f => (
                        <li key={f.name} className="flex justify-between items-center text-lg">
                            <span>{f.name}</span>
                            {f.operator ? <Checkmark/> : <Redacted/>}
                        </li>
                    ))}
                </ul>
                 <button className='w-full mt-8 bg-black text-white font-mono uppercase px-4 py-3 text-lg hover:bg-amber-700 transition-colors duration-300'>
                      Activate Operator Access
                 </button>
            </div>
        </div>
    </section>
  )
}

export default ClassifiedComparison;
