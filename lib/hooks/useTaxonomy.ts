'use client';

import { useState, useEffect } from 'react';

export interface TaxonomyUseCase {
  id: string;
  title: string;
}

export interface TaxonomyCategory {
  id: string;
  name: string;
  emoji: string;
  description: string;
  useCases: TaxonomyUseCase[];
}

let cachedCategories: TaxonomyCategory[] | null = null;
let fetchPromise: Promise<TaxonomyCategory[]> | null = null;

async function fetchTaxonomy(): Promise<TaxonomyCategory[]> {
  const res = await fetch('/api/taxonomy');
  if (!res.ok) return [];
  const data = await res.json();
  return data.categories || [];
}

export function useTaxonomy() {
  const [categories, setCategories] = useState<TaxonomyCategory[]>(cachedCategories || []);
  const [loading, setLoading] = useState(!cachedCategories);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedCategories) {
      setCategories(cachedCategories);
      setLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = fetchTaxonomy();
    }

    fetchPromise
      .then((data) => {
        cachedCategories = data;
        setCategories(data);
      })
      .catch((err) => {
        console.error('Failed to fetch taxonomy:', err);
        setError('Failed to load taxonomy');
      })
      .finally(() => {
        setLoading(false);
        fetchPromise = null;
      });
  }, []);

  return { categories, loading, error };
}
