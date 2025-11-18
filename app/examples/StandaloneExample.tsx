'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import JsonRenderer from '../components/JsonRenderer';
import { Block } from '../components/types';

/**
 * Beispiel: Wie man den DS-Editor in eine andere Seite integriert
 * 
 * Dieses Beispiel zeigt, wie Sie den DS-Editor in Ihre eigene Webseite einbinden können.
 */

const Editor = dynamic(() => import('../components/Editor'), {
  ssr: false,
});

export default function StandaloneExample() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isEditing, setIsEditing] = useState(true);

  // Diese Funktion wird aufgerufen, wenn der Benutzer speichert
  const handleSave = async (savedBlocks: Block[]) => {
    setBlocks(savedBlocks);
    setIsEditing(false);
    
    // Hier können Sie die Daten an Ihre API senden
    try {
      const response = await fetch('/api/save-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blocks: savedBlocks }),
      });
      
      if (response.ok) {
        console.log('Inhalt erfolgreich gespeichert');
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    }
  };

  // Diese Funktion lädt Daten von Ihrer API
  const handleLoad = async () => {
    try {
      const response = await fetch('/api/get-content');
      const data = await response.json();
      if (data.blocks) {
        setBlocks(data.blocks);
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Ihre eigene Navigation/Header */}
      <header className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Meine Gedenkseite</h1>
          <div className="flex gap-2">
            {isEditing ? (
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Vorschau
              </button>
            ) : (
              <>
                <button
                  onClick={handleLoad}
                  className="rounded-lg bg-zinc-200 px-4 py-2 text-zinc-700 hover:bg-zinc-300"
                >
                  Laden
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Bearbeiten
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* DS-Editor oder Anzeige */}
      {isEditing ? (
        <Editor />
      ) : (
        <div className="max-w-4xl mx-auto px-6 py-8">
          <JsonRenderer blocks={blocks} />
        </div>
      )}
    </div>
  );
}

