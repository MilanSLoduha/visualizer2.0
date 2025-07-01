
/*

async function testConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const client = await pool.connect();
    console.log('Pripojenie k DB úspešné!');
    const res = await client.query('SELECT NOW()');
    console.log('Čas na DB:', res.rows[0]);
    client.release();
  } catch (error) {
    console.error('Chyba pri pripojení k DB:', error);
  } finally {
    await pool.end();
  }
}

testConnection();
*/

import * as dotenv from 'dotenv';
dotenv.config();
import * as path from 'path';
import { Client } from 'pg';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Connected successfully to the database');
  } catch (err) {
    console.error('❌ Error connecting to the database:', err);
  } finally {
    await client.end();
  }
}

testConnection();