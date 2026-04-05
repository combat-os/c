// backend/src/db/connection.js
// Database connection - SQLite for development, PostgreSQL for production

import dotenv from 'dotenv';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import pkg from 'pg';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const { Pool } = pkg;

// PostgreSQL setup
let pgPool = null;
const getPgPool = () => {
  if (!pgPool) {
    pgPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'combat_os',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });

    pgPool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }
  return pgPool;
};

const queryPg = async (text, params) => {
  const pool = getPgPool();
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
};

const getPgClient = async () => {
  const pool = getPgPool();
  const client = await pool.connect();
  return client;
};

// SQLite setup
let sqliteDb = null;
const getSqliteDb = async () => {
  if (!sqliteDb) {
    sqliteDb = await open({
      filename: './combat_os.db',
      driver: sqlite3.Database,
    });
  }
  return sqliteDb;
};

const convertPlaceholders = (text) => {
  // Convert $1, $2, $3... to ?, ?, ?...
  return text.replace(/\$\d+/g, '?');
};

const extractTableName = (sql) => {
  const match = sql.match(/(?:INSERT INTO|UPDATE|DELETE FROM)\s+(\w+)/i);
  return match ? match[1] : '';
};

const handleReturning = async (database, text, params) => {
  if (text.toUpperCase().includes('RETURNING')) {
    // Execute the statement
    const result = await database.run(text.replace(/RETURNING.*/i, ''), params);
    // Then fetch the inserted/updated row using lastID or a WHERE clause
    if (text.trim().toUpperCase().startsWith('INSERT')) {
      const fetched = await database.get('SELECT * FROM ' + extractTableName(text) + ' WHERE rowid = ?', [result.lastID]);
      return { rows: fetched ? [fetched] : [], rowCount: result.changes };
    }
    return { rows: [], rowCount: result.changes };
  }
  return null;
};

const querySqlite = async (text, params = []) => {
  const database = await getSqliteDb();
  const start = Date.now();

  try {
    const convertedText = convertPlaceholders(text);
    const returningResult = await handleReturning(database, convertedText, params);
    if (returningResult) {
      return returningResult;
    }

    let result;
    if (convertedText.trim().toUpperCase().startsWith('SELECT') || convertedText.trim().toUpperCase().startsWith('PRAGMA')) {
      result = await database.all(convertedText, params);
      return { rows: result, rowCount: result.length };
    } else {
      result = await database.run(convertedText, params);
      return { rows: [{ id: result.lastID }], rowCount: result.changes };
    }
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  } finally {
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration });
  }
};

const getSqliteClient = async () => {
  return await getSqliteDb();
};

// Export based on environment
export const query = isProduction ? queryPg : querySqlite;
export const getClient = isProduction ? getPgClient : getSqliteClient;
export default isProduction ? getPgPool() : { getDb: getSqliteDb };
