const { execSync } = require('child_process');
const env = {
  ...process.env,
  DATABASE_URL: 'postgresql://postgres.syilqqtgphpqdamvvazn:FXtfiQH8tTlndnjE@aws-1-us-east-1.pooler.supabase.com:6543/postgres'
};

try {
  console.log('🚀 Rodando Prisma DB Push...\n');
  execSync('npm exec prisma -- db push', { env, stdio: 'inherit' });
  console.log('\n✅ Schema enviado para o banco!');

  console.log('\n🎉 PRONTO! Agora rode: npm run dev');
} catch (error) {
  console.error('\n❌ Erro ao executar Prisma:', error.message);
  process.exit(1);
}
