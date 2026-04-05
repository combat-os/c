#!/usr/bin/env node

// Database initialization script
// Sets up SQLite database with schema and seed data

import { query } from './src/db/connection.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  try {
    console.log('🚀 Initializing COMBAT OS Database...');

    // Read schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // Read seed file
    const seedPath = path.join(__dirname, '../database/seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');

    // Execute schema
    console.log('📝 Creating tables...');
    const schemaStatements = schemaSQL.split(';').filter(stmt => stmt.trim());
    for (const statement of schemaStatements) {
      if (statement.trim()) {
        await query(statement);
      }
    }

    // Execute seed data
    console.log('🌱 Seeding data...');
    const seedStatements = seedSQL.split(';').filter(stmt => stmt.trim());
    for (const statement of seedStatements) {
      if (statement.trim()) {
        await query(statement);
      }
    }

    console.log('✅ Database initialized successfully!');
    console.log('📊 Sample data inserted:');
    console.log('   - Personnel: P001, P002, P003, P004');
    console.log('   - POS: Gate A, Barracks, Admin Building');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();