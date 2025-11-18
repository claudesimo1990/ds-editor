/**
 * MySQL Datenbankverbindung Beispiel
 * 
 * Installation: npm install mysql2
 */

import mysql from 'mysql2/promise';

// Datenbankverbindung konfigurieren
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'memorials',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Tabelle erstellen (einmalig ausführen)
export async function createMemorialsTable() {
  const connection = await pool.getConnection();
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS memorials (
        id VARCHAR(255) PRIMARY KEY,
        blocks JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Memorials Tabelle erstellt');
  } finally {
    connection.release();
  }
}

// Memorial speichern
export async function saveMemorial(id: string, blocks: any[]) {
  const connection = await pool.getConnection();
  try {
    await connection.execute(
      `INSERT INTO memorials (id, blocks) 
       VALUES (?, ?) 
       ON DUPLICATE KEY UPDATE blocks = ?, updated_at = CURRENT_TIMESTAMP`,
      [id, JSON.stringify(blocks), JSON.stringify(blocks)]
    );
    return { success: true, id };
  } finally {
    connection.release();
  }
}

// Memorial laden
export async function loadMemorial(id: string) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(
      'SELECT * FROM memorials WHERE id = ?',
      [id]
    ) as any[];
    
    if (rows.length === 0) {
      return null;
    }
    
    return {
      id: rows[0].id,
      blocks: JSON.parse(rows[0].blocks),
      createdAt: rows[0].created_at,
      updatedAt: rows[0].updated_at,
    };
  } finally {
    connection.release();
  }
}

// Memorial löschen
export async function deleteMemorial(id: string) {
  const connection = await pool.getConnection();
  try {
    await connection.execute('DELETE FROM memorials WHERE id = ?', [id]);
    return { success: true };
  } finally {
    connection.release();
  }
}

export { pool };

