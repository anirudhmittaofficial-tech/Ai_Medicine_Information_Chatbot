const pool = require("./db");

async function check() {
  const res = await pool.query("SELECT * FROM enquiries ORDER BY id DESC LIMIT 5");
  console.log(res.rows);
  process.exit();
}
check();
