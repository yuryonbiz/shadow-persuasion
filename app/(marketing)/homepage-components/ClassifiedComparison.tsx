'use client';

import styles from './ClassifiedComparison.module.css';

const leftFeatures = [
    "Google searches and YouTube videos",
    "Reading psychology books",
    "Trial and error in real conversations",
    "No feedback on what went wrong",
    "No personalized scripts",
    "No practice environment",
    "Months or years to improve",
];

const rightFeatures = [
    "AI Strategic Coach (24/7)",
    "Conversation Analysis Engine",
    "50+ Influence Techniques with Practice Mode",
    "Message Optimizer",
    "People Profiles & Strategies",
    "Training Arena (AI Role-Play)",
    "Daily Field Missions with AI Grading",
    "Persuasion Score & Progress Tracking",
    "Voice Profile (AI matches YOUR style)",
    "Quick-Fire Instant Response Mode",
];

const Checkmark = () => <span className="text-green-600 font-bold">&#10003;</span>;
const Redacted = () => <span className="bg-black text-black select-none">██████</span>

const ClassifiedComparison = () => {
  return (
    <section className={`bg-[#0D0D0D] w-full ${styles.container}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="text-center mb-12">
            <h2 className="font-mono text-sm uppercase tracking-widest text-gray-400">
                COMPARISON
            </h2>
            <p className="text-3xl mt-2 text-white">Why Shadow Persuasion</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-2 border-gray-400 bg-[#F4ECD8] shadow-lg p-6 sm:p-8">
            {/* Trying Alone */}
            <div className="border border-dashed border-gray-400 p-6">
                <h3 className="text-2xl text-center font-bold">TRYING TO FIGURE IT OUT ALONE</h3>
                <p className="text-center font-mono text-lg text-gray-600 mb-6">&nbsp;</p>
                <ul className="space-y-4">
                    {leftFeatures.map(f => (
                        <li key={f} className="flex justify-between items-center text-lg">
                            <span>{f}</span>
                            <span className="text-red-500 font-bold text-xl">&mdash;</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Shadow Persuasion Member */}
            <div className="border-2 border-amber-500 p-6 bg-[#fffef7] shadow-2xl relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-black font-mono text-xs uppercase px-2 py-1 font-bold">RECOMMENDED</div>
                <h3 className="text-2xl text-center font-bold text-amber-900">SHADOW PERSUASION MEMBER</h3>
                <p className="text-center font-mono text-lg mb-6">
                    <span className="text-amber-700 font-bold">$99/MO</span>
                </p>
                <ul className="space-y-4">
                    {rightFeatures.map(f => (
                        <li key={f} className="flex justify-between items-center text-lg">
                            <span>{f}</span>
                            <Checkmark/>
                        </li>
                    ))}
                </ul>
                 <button className='w-full mt-8 bg-black text-white font-mono uppercase px-4 py-3 text-lg hover:bg-amber-700 transition-colors duration-300'>
                      START TRAINING NOW
                 </button>
            </div>
        </div>
      </div>
    </section>
  )
}

export default ClassifiedComparison;
