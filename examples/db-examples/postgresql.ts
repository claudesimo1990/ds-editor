/**
 * PostgreSQL Datenbankverbindung Beispiel
 * 
 * Installation: npm install pg
 */

import { Pool } from 'pg';

// Datenbankverbindung konfigurieren
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'memorials',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Tabelle erstellen (einmalig ausführen)
export async function createMemorialsTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS memorials (
        id VARCHAR(255) PRIMARY KEY,
        blocks JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Memorials Tabelle erstellt');
  } catch (error) {
    console.error('Fehler beim Erstellen der Tabelle:', error);
  }
}

// Memorial speichern
export async function saveMemorial(id: string, blocks: any[]) {
  try {
    await pool.query(
      `INSERT INTO memorials (id, blocks, updated_at) 
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (id) 
       DO UPDATE SET blocks = $2, updated_at = CURRENT_TIMESTAMP`,
      [id, JSON.stringify(blocks)]
    );
    return { success: true, id };
  } catch (error) {
    console.error('Fehler beim Speichern:', error);
    throw error;
  }
}

// Memorial laden
export async function loadMemorial(id: string) {
  try {
    const result = await pool.query(
      'SELECT * FROM memorials WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return {
      id: result.rows[0].id,
      blocks: result.rows[0].blocks,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at,
    };
  } catch (error) {
    console.error('Fehler beim Laden:', error);
    throw error;
  }
}

// Memorial löschen
export async function deleteMemorial(id: string) {
  try {
    await pool.query('DELETE FROM memorials WHERE id = $1', [id]);
    return { success: true };
  } catch (error) {
    console.error('Fehler beim Löschen:', error);
    throw error;
  }
}

export { pool };

