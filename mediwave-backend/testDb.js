const pool = require("./db");

async function checkSchema() {
  try {
    const tables = ['enquiries'];
    for (const table of tables) {
      console.log(`\nTable: ${table}`);
      const res = await pool.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = $1;
      `, [table]);
      console.table(res.rows);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
