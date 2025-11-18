'use client';

import { useState, useEffect } from 'react';
import JsonRenderer from '../components/JsonRenderer';
import { Block } from '../components/types';

export default function ViewPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Beispiel: JSON aus localStorage laden
    // In einer echten Anwendung würde man dies aus einer Datenbank laden
    const savedJson = localStorage.getItem('editor-content');
    if (savedJson) {
      try {
        const parsed = JSON.parse(savedJson) as Block[];
        setBlocks(parsed);
      } catch (e) {
        setError('Fehler beim Laden des JSON');
      }
    } else {
      // Beispiel-Daten für Demo
      setBlocks([
        {
          id: '1',
          type: 'heading',
          content: 'Willkommen auf meiner Website',
          level: 1,
        },
        {
          id: '2',
          type: 'text',
          content: 'Dies ist ein Beispiel-Text, der aus dem JSON geladen wurde.',
        },
      ]);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-600 dark:text-zinc-400">Lade Inhalte...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <JsonRenderer blocks={blocks} />
      </div>
    </div>
  );
}

