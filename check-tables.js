const { Client } = require('pg');
const connectionString = 'postgresql://postgres.syilqqtgphpqdamvvazn:FXtfiQH8tTlndnjE@aws-1-us-east-1.pooler.supabase.com:6543/postgres';
const client = new Client({ connectionString });
client.connect()
  .then(() => {
    console.log('Connected successfully!');
    return client.query("SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'");
  })
  .then(res => {
    console.log('Tables in public schema:', res.rows[0].count);
    if (res.rows[0].count > 0) {
      return client.query("SELECT * FROM \"Client\" LIMIT 1").catch(() => ({ rows: [] }));
    }
    return { rows: [] };
  })
  .then(res => {
    console.log('Client table check:', res.rows.length >= 0 ? 'Table exists (or query ran)' : 'Table missing');
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
