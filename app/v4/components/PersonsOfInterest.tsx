'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';

const PersonCard = ({ name, alias, role, status, imgId, rotation }) => {
  return (
    <motion.div 
      className="bg-[#E8DCC8] p-4 border border-gray-400 text-sm"
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.4 }}
    >
      <div 
        className="relative w-full h-48 mb-4 transform"
        style={{ rotate: `${rotation}deg` }}
      >
        <div className="absolute -top-2 -left-2 w-16 h-8 bg-yellow-200/20 transform -rotate-45 z-10" />
        <div className="absolute -bottom-2 -right-2 w-16 h-8 bg-yellow-200/20 transform -rotate-45 z-10" />
        <Image 
          src={`https://i.pravatar.cc/300?img=${imgId}`} 
          alt={`Surveillance photo of ${name}`}
          layout="fill"
          objectFit="cover"
          className="grayscale sepia-[20%]"
        />
      </div>
      <div>
        <p><span className="font-bold">NAME:</span> {name}</p>
        <p><span className="font-bold">ALIAS:</span> {alias}</p>
        <p><span className="font-bold">ROLE:</span> {role}</p>
        <p><span className="font-bold">STATUS:</span> <span className="text-green-800">{status}</span></p>
      </div>
    </motion.div>
  );
};

export default function PersonsOfInterest() {
  const people = [
    { name: 'Dr. Alistair Finch', alias: '"The Architect"', role: 'Program Director', status: 'ACTIVE', imgId: 32, rotation: -2 },
    { name: 'Isabella Rossi', alias: '"Echo"', role: 'Lead Field Operator', status: 'ACTIVE', imgId: 36, rotation: 1.5 },
    { name: 'Marcus Thorne', alias: '"The Ghost"', role: 'Counter-Intel & Extraction', status: 'ACTIVE', imgId: 40, rotation: -1 },
    { name: 'Subject Zero', alias: '"Patient Zero"', role: 'Original Case Study', status: 'CONTAINED', imgId: 44, rotation: 2.5 },
  ];

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold uppercase tracking-wider text-center mb-10">
        Persons of Interest
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {people.map((person) => (
          <PersonCard key={person.alias} {...person} />
        ))}
      </div>
    </section>
  );
}
