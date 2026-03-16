// Run manual migration SQL against Supabase
const fs = require('fs');
const { Pool } = require('pg');

// Parse DATABASE_URL from .env
const envContent = fs.readFileSync('.env', 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);

if (!dbUrlMatch) {
  console.error('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

const connectionString = dbUrlMatch[1];

async function runMigration() {
  const pool = new Pool({ connectionString });

  try {
    console.log('🔌 Connecting to database...');
    const client = await pool.connect();

    console.log('📄 Reading migration SQL...');
    const sql = fs.readFileSync('manual-migration.sql', 'utf8');

    console.log('🚀 Running migration...');
    await client.query(sql);

    console.log('✅ Migration completed successfully!');

    client.release();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
