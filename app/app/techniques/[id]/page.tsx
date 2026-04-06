import { techniques } from '@/lib/techniques';
import { notFound } from 'next/navigation';
import TechniqueDetailClient from './TechniqueDetailClient';

export function generateStaticParams() {
  return techniques.map(t => ({ id: t.id }));
}

export default async function TechniqueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const technique = techniques.find(t => t.id === id);

  if (!technique) {
    notFound();
  }

  return <TechniqueDetailClient technique={technique} />;
}
