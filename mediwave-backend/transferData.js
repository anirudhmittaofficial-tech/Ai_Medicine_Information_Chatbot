require("dotenv").config();
const { Pool } = require("pg");

const poolLocal = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const poolNeon = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function transfer() {
  try {
    console.log("Fetching products from Local DB...");
    const { rows: products } = await poolLocal.query("SELECT * FROM products");
    console.log(`Found ${products.length} products locally.`);

    if (products.length > 0) {
      console.log("Transferring products to Neon DB...");
      for (const p of products) {
        await poolNeon.query(
          `INSERT INTO products (id, product_name, category, composition, dosage, indication, description, source_url, created_at, embedding, hidden)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO NOTHING`,
          [p.id, p.product_name, p.category, p.composition, p.dosage, p.indication, p.description, p.source_url, p.created_at, p.embedding, p.hidden]
        );
      }
      
      // Update sequence
      await poolNeon.query(`SELECT setval('products_id_seq', (SELECT MAX(id) FROM products))`);
      console.log("✅ Products transferred successfully!");
    }

    console.log("Fetching chat_history from Local DB...");
    const { rows: chats } = await poolLocal.query("SELECT * FROM chat_history");
    if (chats.length > 0) {
      // Need to transfer conversations first because of foreign key
      const { rows: convos } = await poolLocal.query("SELECT * FROM conversations");
      for (const c of convos) {
        await poolNeon.query(
          `INSERT INTO conversations (id, title, created_at, updated_at) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
          [c.id, c.title, c.created_at, c.updated_at]
        );
      }
      
      for (const c of chats) {
        await poolNeon.query(
          `INSERT INTO chat_history (id, question, answer, created_at, conversation_id, metadata)
           VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING`,
          [c.id, c.question, c.answer, c.created_at, c.conversation_id, c.metadata]
        );
      }
      console.log("✅ Chat history transferred successfully!");
    }

    console.log("Fetching enquiries from Local DB...");
    const { rows: enquiries } = await poolLocal.query("SELECT * FROM enquiries");
    if (enquiries.length > 0) {
      for (const e of enquiries) {
        await poolNeon.query(
          `INSERT INTO enquiries (id, user_name, email, question, status, created_at, answer, user_type)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING`,
          [e.id, e.user_name, e.email, e.question, e.status, e.created_at, e.answer, e.user_type]
        );
      }
      console.log("✅ Enquiries transferred successfully!");
    }

    process.exit(0);
  } catch(e) {
    console.error("❌ Transfer failed:", e);
    process.exit(1);
  }
}

transfer();
