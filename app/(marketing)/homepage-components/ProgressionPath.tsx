
'use client';

const levels = [
  {
    name: 'CIVILIAN',
    description: 'Starting out. Building awareness of influence dynamics in everyday conversations.',
    classification: 'CLEARANCE: LEVEL 1',
    fileNum: 'PRS-001',
  },
  {
    name: 'OBSERVER',
    description: 'Learning to read the room. Recognizing tactics, patterns, and power shifts in real time.',
    classification: 'CLEARANCE: LEVEL 2',
    fileNum: 'PRS-002',
  },
  {
    name: 'INITIATE',
    description: 'Applying core frameworks. First successful deployments in real conversations.',
    classification: 'CLEARANCE: LEVEL 3',
    fileNum: 'PRS-003',
  },
  {
    name: 'OPERATIVE',
    description: 'Consistent execution. Comfortable navigating negotiations, conflicts, and high-pressure moments.',
    classification: 'CLEARANCE: LEVEL 4',
    fileNum: 'PRS-004',
  },
  {
    name: 'SPECIALIST',
    description: 'Multi-technique stacking. Personalized influence strategies for any situation.',
    classification: 'CLEARANCE: LEVEL 5',
    fileNum: 'PRS-005',
  },
  {
    name: 'HANDLER',
    description: 'Elite-level mastery. Reading people instantly, controlling frames effortlessly.',
    classification: 'CLEARANCE: LEVEL 6',
    fileNum: 'PRS-006',
  },
  {
    name: 'SHADOW MASTER',
    description: 'Full command of all frameworks. The most strategic communicator in any room.',
    classification: 'CLEARANCE: MAX',
    fileNum: 'PRS-007',
  },
];

const ProgressionPath = () => {
  return (
    <section className="relative py-16">
      <div className="text-left mb-16">
        <h2 className="font-mono text-sm uppercase tracking-widest text-gray-500">
          APPENDIX D: OPERATOR PROGRESSION PATH
        </h2>
        <p className="text-3xl mt-2">Career Trajectory</p>
      </div>

      {/* Mobile: single column with centered line */}
      <div className="relative flex flex-col items-center gap-y-10 max-w-6xl mx-auto md:hidden">
        <div
          className="absolute left-1/2 -translate-x-1/2 top-0 w-0.5 bg-amber-500 origin-top"
          style={{ height: '100%' }}
        />

        {levels.map((level) => (
          <div key={level.name} className="flex flex-col items-center gap-4 relative z-10">
            <div
              className="w-4 h-4 rounded-full bg-amber-500 border-4 border-[#F4ECD8]"
            />
            <div>
              <Card level={level} />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: alternating timeline grid */}
      <div className="relative hidden md:grid grid-cols-[1fr_auto_1fr] gap-x-6 gap-y-10 max-w-6xl mx-auto">
        <div
          className="absolute left-1/2 -translate-x-1/2 top-0 w-0.5 bg-amber-500 origin-top"
          style={{ height: '100%' }}
        />

        {levels.map((level, index) => {
          const isLeft = index % 2 === 0;

          return (
            <div
              key={level.name}
              className="contents"
            >
              {/* Left cell */}
              {isLeft ? (
                <div className="flex justify-end">
                  <Card level={level} />
                </div>
              ) : (
                <div />
              )}

              {/* Center dot */}
              <div className="flex items-center justify-center relative z-10">
                <div
                  className="w-4 h-4 rounded-full bg-amber-500 border-4 border-[#F4ECD8]"
                />
              </div>

              {/* Right cell */}
              {!isLeft ? (
                <div className="flex justify-start">
                  <Card level={level} />
                </div>
              ) : (
                <div />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

const Card = ({
  level,
}: {
  level: { name: string; description: string; classification: string; fileNum: string };
}) => (
  <div className="w-full max-w-sm bg-[#EDE3D0] border-2 border-gray-400 p-6 relative shadow-md">
    {/* File tab */}
    <div className="absolute -top-3 left-4 bg-gray-400 text-white px-3 py-1 text-xs font-mono font-bold">
      {level.fileNum}
    </div>

    {/* Classification stamp */}
    <div className="absolute top-2 right-2 border border-red-600 text-red-600 px-2 py-1 text-xs font-mono font-bold">
      {level.classification}
    </div>

    {/* Content */}
    <div className="mt-2">
      <h3 className="font-special-elite text-xl font-bold uppercase tracking-wide text-black mb-2">
        {level.name}
      </h3>
      <p className="text-gray-700 text-sm leading-relaxed">{level.description}</p>
    </div>

    {/* Distressed paper effect */}
    <div
      className="absolute inset-0 border-2 border-gray-300 opacity-30 pointer-events-none"
      style={{
        clipPath: 'polygon(0% 0%, 98% 0%, 100% 95%, 2% 100%)',
      }}
    />
  </div>
);

export default ProgressionPath;
