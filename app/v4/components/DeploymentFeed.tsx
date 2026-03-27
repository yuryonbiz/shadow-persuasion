'use client';

import { motion } from 'framer-motion';

const feedItems = [
  "14:32 UTC — OPERATOR #4,891 deployed Scarcity Frame in salary negotiation — OUTCOME: SUCCESS",
  "14:28 UTC — OPERATOR #12,044 used Anchoring in client pitch — OUTCOME: DEAL CLOSED $240K",
  "14:15 UTC — OPERATOR #7,229 activated Void Pull in partnership discussion — OUTCOME: PENDING",
  "14:02 UTC — OPERATOR #9,112 deployed Pattern Interrupt during investor meeting — OUTCOME: SUCCESS",
  "13:55 UTC — OPERATOR #2,587 utilized Mirroring for rapport building — OUTCOME: POSITIVE SHIFT",
  "13:41 UTC — OPERATOR #1,800 executed Frame Control in hostile takeover — OUTCOME: PENDING",
  "13:30 UTC — OPERATOR #11,311 engaged Social Proof Architecture in marketing copy — OUTCOME: +18% CTR", 
  "13:22 UTC — OPERATOR #6,421 used Reciprocity Trap to gain concession — OUTCOME: SUCCESS",
];

const Stamp = ({ text, className }: { text: string; className?: string }) => (
    <div className={`absolute border-2 border-red-600 p-1 text-xs font-bold uppercase tracking-wider text-red-600 opacity-80 ${className}`}>
      {text}
    </div>
);

const DeploymentFeed = () => {
  return (
    <section className="relative py-16">
        <div className="text-left mb-12">
            <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500">
                LIVE DEPLOYMENT FEED
            </h2>
            <p className="text-3xl mt-2">Monitoring Active</p>
            <Stamp text="REAL-TIME — UNREDACTED" className="-bottom-8 right-0 rotate-3" />
        </div>

        <div className="bg-[#1A1A1A] text-white p-6 sm:p-8 border-2 border-gray-700 shadow-lg relative font-mono">
            <div className="flex items-center gap-3 mb-4 border-b border-dashed border-gray-600 pb-4">
                <motion.div 
                    className="w-3 h-3 rounded-full bg-green-500"
                    animate={{scale: [1, 1.2, 1]}}
                    transition={{duration: 1, repeat: Infinity}}
                />
                <div className="text-sm uppercase tracking-widest text-green-400">FEED: LIVE</div>
            </div>

            <div className="h-48 overflow-hidden relative">
                 <motion.div 
                    className="absolute top-0 left-0 w-full"
                    animate={{ y: ['0%', '-50%'] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                 >
                    <div className="space-y-2">
                        {[...feedItems, ...feedItems].map((item, index) => {
                            const isSuccess = item.includes('SUCCESS') || item.includes('CLOSED') || item.includes('POSITIVE') || item.includes('+18% CTR');
                            const isPending = item.includes('PENDING');
                            return (
                                <div key={index} className="text-sm whitespace-nowrap">
                                    <span className={isSuccess ? 'text-green-400' : isPending ? 'text-yellow-400' : 'text-gray-400'}>
                                        {item.split('—')[0]}—
                                    </span>
                                    <span className="text-gray-300">{item.split('—')[1]}—</span>
                                    {isSuccess && <span className="bg-green-800 text-green-200 px-1.5 py-0.5 rounded-sm text-xs">{item.split('—')[2]}</span>}
                                    {isPending && <span className="bg-yellow-800 text-yellow-200 px-1.5 py-0.5 rounded-sm text-xs">{item.split('—')[2]}</span>}
                                    {!isSuccess && !isPending && <span>{item.split('—')[2]}</span>}
                                </div>
                            )
                        })}
                    </div>
                 </motion.div>
                 <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#1A1A1A] to-transparent"></div>
            </div>
        </div>
    </section>
  );
};

export default DeploymentFeed;
