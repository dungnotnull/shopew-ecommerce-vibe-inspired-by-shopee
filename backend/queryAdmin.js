const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL || "postgresql://root:rootpassword@localhost:5432/shopew?schema=public"
});

async function main() {
  await client.connect();
  const res = await client.query("SELECT id, email, role FROM \"User\" WHERE role='ADMIN'");
  console.log(res.rows);
  await client.end();
}
main().catch(console.error);
