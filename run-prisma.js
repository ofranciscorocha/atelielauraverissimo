const { execSync } = require('child_process');
const env = {
  ...process.env,
  DATABASE_URL: 'postgresql://postgres.syilqqtgphpqdamvvazn:FXtfiQH8tTlndnjE@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
};

try {
  console.log('Running prisma db push...');
  const output = execSync('npx prisma db push', { env, stdio: 'inherit', encoding: 'utf-8' });
  console.log('Success!');
} catch (error) {
  console.error('Failed to run prisma db push');
  process.exit(1);
}
