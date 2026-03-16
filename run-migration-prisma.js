// Run migration using Prisma Client
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('📄 Reading migration SQL...');
    const sql = fs.readFileSync('manual-migration.sql', 'utf8');

    // Split by statement (rough approach)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('SELECT'))
      .map(s => s + ';');

    console.log(`🚀 Running ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt.trim().length < 10) continue; // Skip very short statements

      try {
        console.log(`   [${i + 1}/${statements.length}] Executing...`);
        await prisma.$executeRawUnsafe(stmt);
      } catch (error) {
        // Ignore "already exists" errors
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`   ⚠️  Skipped (already exists)`);
        } else {
          console.error(`   ❌ Error:`, error.message);
        }
      }
    }

    console.log('✅ Migration completed!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
