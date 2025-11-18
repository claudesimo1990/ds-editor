import dynamic from 'next/dynamic';

/**
 * Einfachste Integration - Nur den Editor anzeigen
 */
const Editor = dynamic(() => import('../components/Editor'), {
  ssr: false,
});

export default function SimpleIntegration() {
  return (
    <div className="min-h-screen">
      <Editor />
    </div>
  );
}

