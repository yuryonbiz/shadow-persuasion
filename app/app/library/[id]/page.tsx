import { techniques } from '@/lib/techniques';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export function generateStaticParams() {
  return techniques.map(t => ({ id: t.id }));
}

export default async function TechniqueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const technique = techniques.find(t => t.id === id);

  if (!technique) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <p className="font-mono text-sm text-[#D4A017] uppercase">{technique.category}</p>
        <h1 className="text-3xl font-bold tracking-wider mt-1">{technique.name}</h1>
        <p className="text-lg text-gray-400 mt-2">{technique.description}</p>
      </header>
      
      <div className="p-6 bg-[#1A1A1A] rounded-lg border border-[#333333]">
        <h2 className="font-mono text-lg text-[#D4A017] uppercase mb-3">How to Use It</h2>
        <ul className="space-y-2 list-disc list-inside">
            {technique.howTo.map((step, index) => (
                <li key={index} className="text-gray-300">{step}</li>
            ))}
        </ul>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-[#1A1A1A] rounded-lg border border-[#333333]">
                <h3 className="font-mono text-md text-[#D4A017] uppercase mb-2">When to Use It</h3>
                <p className="text-sm text-gray-300">{technique.whenToUse}</p>
            </div>
             <div className="p-6 bg-[#1A1A1A] rounded-lg border border-[#333333]">
                <h3 className="font-mono text-md text-[#D4A017] uppercase mb-2">When NOT to Use It</h3>
                <p className="text-sm text-gray-300">{technique.whenNotToUse}</p>
            </div>
       </div>

       <div className="text-center">
            <Link href="/app/scenarios" className="inline-block px-8 py-3 bg-[#D4A017] text-[#0A0A0A] font-bold rounded-lg uppercase tracking-wider hover:bg-[#E8B030] transition-transform hover:scale-105">
                Practice This Technique
            </Link>
       </div>
    </div>
  );
}
