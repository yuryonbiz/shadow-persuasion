"use client";

import Image from 'next/image';

const teamMembers = [
  {
    name: "Dr. Alistair Finch",
    title: "Ph.D., Behavioral Psychology",
    institution: "Stanford University",
    interests: ["Cognitive Biases", "Heuristic Analysis", "Game Theory"],
    imgSrc: "https://i.pravatar.cc/300?img=20",
  },
  {
    name: "Dr. Eleanor Vance",
    title: "Ph.D., Social Dynamics",
    institution: "MIT Media Lab",
    interests: ["Group Behavior", "Influence Vectors", "Narrative Structures"],
    imgSrc: "https://i.pravatar.cc/300?img=25",
  },
  {
    name: "Dr. Kenji Tanaka",
    title: "Ph.D., Neuropolitics",
    institution: "University of Chicago",
    interests: ["Power Dynamics", "Subconscious Triggers", "Frame Control"],
    imgSrc: "https://i.pravatar.cc/300?img=30",
  },
];

const ResearchTeam = () => {
  return (
    <section id="team" className="py-20 sm:py-24 border-b border-steel-gray">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-libre-baskerville text-3xl font-bold text-navy-deep">
            Principal Investigators
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {teamMembers.map((member) => (
            <div key={member.name} className="text-center">
              <div className="relative w-40 h-40 mx-auto">
                <Image
                  src={member.imgSrc}
                  alt={member.name}
                  width={160}
                  height={160}
                  className="rounded-full grayscale"
                />
              </div>
              <h3 className="mt-6 font-libre-baskerville text-xl font-bold text-navy-deep">{member.name}</h3>
              <p className="text-navy">{member.title}</p>
              <p className="text-sm text-steel-gray-light">{member.institution}</p>
              <ul className="mt-4 space-y-1 font-mono text-xs text-navy">
                {member.interests.map((interest) => (
                  <li key={interest}>{interest}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResearchTeam;
