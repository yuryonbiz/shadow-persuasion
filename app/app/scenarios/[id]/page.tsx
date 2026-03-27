import { scenarios } from '@/lib/scenarios';
import { techniques } from '@/lib/techniques';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return scenarios.map(s => ({ id: s.id }));
}

export default function ScenarioDetailPage({ params }: { params: { id: string } }) {
  const scenario = scenarios.find(s => s.id === params.id);

  if (!scenario) {
    notFound();
  }
  
  const relevantTechniques = techniques.filter(t => scenario.techniques.includes(t.name));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <p className="font-mono text-sm text-[#D4A017] uppercase">{scenario.category}</p>
        <h1 className="text-3xl font-bold tracking-wider mt-1">{scenario.title}</h1>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-6 bg-[#1A1A1A] rounded-lg border border-[#333333]">
           <h2 className="font-mono text-lg text-[#D4A017] uppercase mb-2">Briefing</h2>
           <p className="text-gray-300">{scenario.description}</p>
           <h2 className="font-mono text-lg text-[#D4A017] uppercase mt-4 mb-2">Objective</h2>
           <p className="text-gray-300">{scenario.objective}</p>
        </div>
        <div className="p-6 bg-[#1A1A1A] rounded-lg border border-[#333333]">
           <h2 className="font-mono text-lg text-[#D4A017] uppercase mb-2">Key Techniques</h2>
           <ul className="space-y-2">
            {relevantTechniques.map(t => (
                <li key={t.id}>
                    <Link href={`/app/library/${t.id}`} className="text-sm hover:underline">{t.name}</Link>
                </li>
            ))}
           </ul>
        </div>
      </div>
      
      <div className="text-center">
        <Link 
         href={`/app/chat/scenario-${scenario.id}`} 
         className="inline-block px-8 py-3 bg-[#D4A017] text-[#0A0A0A] font-bold rounded-lg uppercase tracking-wider hover:bg-[#E8B030] transition-transform hover:scale-105">
            Begin Operation
        </Link>
      </div>
    </div>
  );
}
