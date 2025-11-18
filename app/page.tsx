'use client';

import dynamic from 'next/dynamic';

// Dynamischer Import mit SSR deaktiviert, um Hydration-Mismatch zu vermeiden
const Editor = dynamic(() => import('./components/Editor'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="text-center">
        <div className="mb-4 text-2xl">⏳</div>
        <p className="text-zinc-600 dark:text-zinc-400">Editor wird geladen...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Editor />
    </div>
  );
}
