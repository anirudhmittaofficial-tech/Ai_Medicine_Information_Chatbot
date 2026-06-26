const pool = require("./db");

async function migrate() {
    try {
        console.log("Setting up database schema...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS admins (
                id SERIAL PRIMARY KEY,
                name VARCHAR,
                email VARCHAR UNIQUE,
                password TEXT
            );

            CREATE TABLE IF NOT EXISTS conversations (
                id SERIAL PRIMARY KEY,
                title VARCHAR,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS chat_history (
                id SERIAL PRIMARY KEY,
                question TEXT,
                answer TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
                metadata JSONB
            );

            CREATE TABLE IF NOT EXISTS enquiries (
                id SERIAL PRIMARY KEY,
                user_name VARCHAR,
                email VARCHAR,
                question TEXT,
                status VARCHAR DEFAULT 'New',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                answer TEXT,
                user_type VARCHAR
            );

            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                product_name VARCHAR,
                category VARCHAR,
                composition TEXT,
                dosage TEXT,
                indication TEXT,
                description TEXT,
                source_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                embedding TEXT,
                hidden BOOLEAN DEFAULT false
            );
        `);
        console.log("✅ Migration successful! All tables created.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Migration failed:", err);
        process.exit(1);
    }
}

migrate();
