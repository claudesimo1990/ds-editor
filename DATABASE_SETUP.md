# Datenbank-Setup für DS-Editor

Dieser Guide zeigt, wie Sie den DS-Editor mit verschiedenen Datenbanken verbinden.

## Schnellstart

### 1. Umgebungsvariablen konfigurieren

Erstellen Sie eine `.env.local` Datei:

```env
# Für MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=ihr_passwort
DB_NAME=memorials

# Für PostgreSQL
DB_PORT=5432

# Für MongoDB
MONGODB_URI=mongodb://localhost:27017
```

### 2. Datenbank-Beispiel wählen

Wählen Sie eine der folgenden Optionen:

- **MySQL**: `lib/db-examples/mysql.ts`
- **PostgreSQL**: `lib/db-examples/postgresql.ts`
- **MongoDB**: `lib/db-examples/mongodb.ts`

### 3. API Route konfigurieren

Kopieren Sie `app/api/memorial/route-mysql.ts.example` nach `app/api/memorial/route.ts` und passen Sie die Importe an.

## MySQL Setup

### Installation

```bash
npm install mysql2
```

### Datenbank erstellen

```sql
CREATE DATABASE memorials;
USE memorials;
```

### Tabelle erstellen

Die Tabelle wird automatisch erstellt, oder Sie können sie manuell erstellen:

```sql
CREATE TABLE memorials (
  id VARCHAR(255) PRIMARY KEY,
  blocks JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### API Route verwenden

```typescript
import { saveMemorial, loadMemorial } from '@/lib/db-examples/mysql';
```

## PostgreSQL Setup

### Installation

```bash
npm install pg
```

### Datenbank erstellen

```sql
CREATE DATABASE memorials;
```

### Tabelle erstellen

```sql
CREATE TABLE memorials (
  id VARCHAR(255) PRIMARY KEY,
  blocks JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Route verwenden

```typescript
import { saveMemorial, loadMemorial } from '@/lib/db-examples/postgresql';
```

## MongoDB Setup

### Installation

```bash
npm install mongodb
```

### Datenbank verbinden

MongoDB erstellt die Collection automatisch beim ersten Speichern.

### API Route verwenden

```typescript
import { saveMemorial, loadMemorial } from '@/lib/db-examples/mongodb';
```

## Verwendung im Editor

### Automatisches Speichern aktivieren

```tsx
<Editor 
  memorialId="memorial-123"
  apiEndpoint="/api/memorial"
  autoSave={true}
  onSave={(blocks) => console.log('Gespeichert:', blocks)}
/>
```

### Manuelles Speichern

Der Editor hat jetzt einen "Speichern"-Button in der Toolbar, der die Daten direkt in die Datenbank speichert.

## API-Endpunkte

### POST /api/memorial
Speichert ein neues Memorial

```json
{
  "id": "memorial-123",
  "blocks": [...]
}
```

### GET /api/memorial?id=memorial-123
Lädt ein Memorial

### PUT /api/memorial
Aktualisiert ein bestehendes Memorial

### DELETE /api/memorial?id=memorial-123
Löscht ein Memorial

## Beispiel: Vollständige Integration

```tsx
'use client';

import { useState, useEffect } from 'react';
import Editor from './components/Editor';
import JsonRenderer from './components/JsonRenderer';

export default function MemorialPage({ memorialId }: { memorialId: string }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div>
      {isEditing ? (
        <Editor 
          memorialId={memorialId}
          apiEndpoint="/api/memorial"
          autoSave={true}
          onSave={() => setIsEditing(false)}
        />
      ) : (
        <div>
          <button onClick={() => setIsEditing(true)}>Bearbeiten</button>
          {/* Hier würden Sie die Daten von der API laden und anzeigen */}
        </div>
      )}
    </div>
  );
}
```

## Sicherheit

⚠️ **Wichtig**: In Produktion sollten Sie:

1. **Authentifizierung** hinzufügen
2. **Rate Limiting** implementieren
3. **Input Validation** durchführen
4. **SQL Injection** Schutz (bei SQL-Datenbanken)
5. **CORS** richtig konfigurieren

## Support

Bei Fragen zur Datenbankintegration kontaktieren Sie **Digitalssolutions**.

© Digitalssolutions - DS-Editor

