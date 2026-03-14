const { Client } = require('pg');
const connectionString = 'postgresql://postgres.syilqqtgphpqdamvvazn:FXtfiQH8tTlndnjE@aws-1-us-east-1.pooler.supabase.com:6543/postgres';
const client = new Client({ connectionString });
client.connect()
  .then(() => {
    console.log('Connected successfully!');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('Result:', res.rows[0]);
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
