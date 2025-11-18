import { NextRequest, NextResponse } from 'next/server';
import { Block } from '@/app/components/types';

// Beispiel: Datenbankverbindung (anpassen je nach Ihrer Datenbank)
// Hier verwenden wir ein einfaches Beispiel mit einer In-Memory-Datenbank
// In Produktion würden Sie hier Ihre echte Datenbankverbindung verwenden

// Beispiel-Datenbank (ersetzen Sie dies durch Ihre echte DB)
const memorials: Record<string, { id: string; blocks: Block[]; createdAt: string; updatedAt: string }> = {};

// GET - Memorial laden
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Memorial ID erforderlich' },
        { status: 400 }
      );
    }

    const memorial = memorials[id];
    
    if (!memorial) {
      return NextResponse.json(
        { error: 'Memorial nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      id: memorial.id,
      blocks: memorial.blocks,
      createdAt: memorial.createdAt,
      updatedAt: memorial.updatedAt
    });
  } catch (error) {
    console.error('Fehler beim Laden:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden des Memorials' },
      { status: 500 }
    );
  }
}

// POST - Memorial speichern
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, blocks } = body;

    if (!blocks || !Array.isArray(blocks)) {
      return NextResponse.json(
        { error: 'Ungültige Daten: blocks Array erforderlich' },
        { status: 400 }
      );
    }

    const memorialId = id || `memorial-${Date.now()}`;
    const now = new Date().toISOString();

    memorials[memorialId] = {
      id: memorialId,
      blocks: blocks as Block[],
      createdAt: memorials[memorialId]?.createdAt || now,
      updatedAt: now,
    };

    return NextResponse.json({ 
      success: true,
      id: memorialId,
      message: 'Memorial erfolgreich gespeichert'
    });
  } catch (error) {
    console.error('Fehler beim Speichern:', error);
    return NextResponse.json(
      { error: 'Fehler beim Speichern des Memorials' },
      { status: 500 }
    );
  }
}

// PUT - Memorial aktualisieren
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, blocks } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Memorial ID erforderlich' },
        { status: 400 }
      );
    }

    if (!blocks || !Array.isArray(blocks)) {
      return NextResponse.json(
        { error: 'Ungültige Daten: blocks Array erforderlich' },
        { status: 400 }
      );
    }

    if (!memorials[id]) {
      return NextResponse.json(
        { error: 'Memorial nicht gefunden' },
        { status: 404 }
      );
    }

    memorials[id] = {
      ...memorials[id],
      blocks: blocks as Block[],
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ 
      success: true,
      id: id,
      message: 'Memorial erfolgreich aktualisiert'
    });
  } catch (error) {
    console.error('Fehler beim Aktualisieren:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Memorials' },
      { status: 500 }
    );
  }
}

// DELETE - Memorial löschen
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Memorial ID erforderlich' },
        { status: 400 }
      );
    }

    if (!memorials[id]) {
      return NextResponse.json(
        { error: 'Memorial nicht gefunden' },
        { status: 404 }
      );
    }

    delete memorials[id];

    return NextResponse.json({ 
      success: true,
      message: 'Memorial erfolgreich gelöscht'
    });
  } catch (error) {
    console.error('Fehler beim Löschen:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Memorials' },
      { status: 500 }
    );
  }
}

