require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const pool = require("../db");
const fs = require("fs");
const path = require("path");

function getSettings() {
    try {
        const data = fs.readFileSync(path.join(__dirname, "../config/settings.json"), "utf-8");
        return JSON.parse(data);
    } catch (e) {
        return { similarityThreshold: 0.75, maxChunks: 4, maxTokens: 1024, disclaimer: "This information is for reference only. Please consult a qualified healthcare professional before use." };
    }
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Convert product to readable text
function productToText(product) {
    return `
    Product Name: ${product.product_name}
    Category: ${product.category || "General"}
    Composition: ${product.composition || "Not specified"}
    Dosage: ${product.dosage || "As directed by physician"}
    Indication: ${product.indication || "Not specified"}
    Description: ${product.description || "No description"}
  `.trim();
}

// Get embedding from Gemini
async function getEmbedding(text) {
    const model = genAI.getGenerativeModel({
        model: "gemini-embedding-001"
    });
    const result = await model.embedContent(text);
    return result.embedding.values;
}

// Calculate cosine similarity between two vectors
function cosineSimilarity(a, b) {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
}

// Build vector store - embed all products and store in PostgreSQL
async function buildVectorStore() {
    try {
        console.log("🔄 Building RAG vector store...");

        // Add embedding column if it doesn't exist
        await pool.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS embedding TEXT
    `);

        // Get all products
        const { rows } = await pool.query("SELECT * FROM products");
        console.log(`📦 Found ${rows.length} products in database`);

        if (rows.length === 0) {
            console.log("❌ No products found! Add products first.");
            return;
        }

        // Create embedding for each product
        for (const product of rows) {
            const text = productToText(product);
            console.log(`⚙️  Embedding: ${product.product_name}`);

            const embedding = await getEmbedding(text);

            // Save embedding to PostgreSQL
            await pool.query(
                "UPDATE products SET embedding = $1 WHERE id = $2",
                [JSON.stringify(embedding), product.id]
            );
        }

        console.log("✅ Vector store built successfully in PostgreSQL!");

    } catch (err) {
        console.error("❌ Error building vector store:", err.message);
    }
}

// Search products using cosine similarity
async function searchProducts(question) {
    try {
        // Get embedding for the question
        console.log(`🔍 Searching for: "${question}"`);
        const questionEmbedding = await getEmbedding(question);

        // Get all products that have embeddings
        const { rows } = await pool.query(
            "SELECT * FROM products WHERE embedding IS NOT NULL"
        );

        if (rows.length === 0) {
            console.log("❌ No embeddings found. Run buildStore.js first.");
            return null;
        }

        // Calculate similarity score for each product
        const scored = rows.map(product => {
            const productEmbedding = JSON.parse(product.embedding);
            const score = cosineSimilarity(questionEmbedding, productEmbedding);
            return { product, score };
        });

        // Get dynamic settings
        const settings = getSettings();

        // Filter by threshold
        const filtered = scored.filter(s => s.score >= settings.similarityThreshold);

        // Sort by highest similarity
        filtered.sort((a, b) => b.score - a.score);

        if (filtered.length === 0) {
            console.log(`❌ No matches above threshold (${settings.similarityThreshold})`);
            return null;
        }

        // Take top chunks based on dynamic maxChunks
        const topChunks = filtered.slice(0, settings.maxChunks);
        console.log(`✅ Top match: ${topChunks[0].product.product_name} (score: ${topChunks[0].score.toFixed(3)})`);

        // Return context and metadata
        const contextString = topChunks
            .map(({ product }) => productToText(product))
            .join("\n\n---\n\n");
            
        const topMatches = topChunks.map(c => ({
            product_name: c.product.product_name,
            score: c.score.toFixed(3),
            fields: {
                composition: c.product.composition,
                dosage: c.product.dosage,
                indication: c.product.indication,
                description: c.product.description
            }
        }));

        return { contextString, topMatches };

    } catch (err) {
        console.error("❌ Search error:", err.message);
        return null;
    }
}

// Ask Gemini with retrieved context
async function askGemini(question, context) {
    const settings = getSettings();
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        maxOutputTokens: settings.maxTokens
      }
    });

    const prompt = `
You are Mediwave AI, a knowledgeable and friendly medicine information assistant for Mediwave Life Sciences Pvt Ltd. You talk the way a helpful pharmacist would — warm, clear, natural sentences. Never sound like you're reading off a database.

Relevant product information:
${context}

User's question: "${question}"

How to respond:
- Write in flowing, natural sentences, like a real conversation. Do NOT use bullet points, asterisks, bold headers, or list formatting unless the user explicitly asks for a list or comparison.
- Mention product names naturally within sentences, not as labeled data fields.
- The user may phrase things differently than the product data does — use reasonable medical understanding to connect their question to what these products actually do.
- Don't invent dosages, age guidelines, or claims not reasonably supported above. If something like a child's dosage isn't specified, say so plainly in one natural sentence and suggest checking with a doctor or pharmacist — don't repeat this caveat for every product.
- Keep responses concise — a few natural sentences is usually enough.
- If nothing above genuinely relates to the question, say so naturally and suggest contacting Mediwave Life Sciences directly.
- End with this line exactly, on its own:

${settings.disclaimer}
  `;

    const result = await model.generateContent(prompt);
    return {
        answer: result.response.text(),
        promptSent: prompt.trim()
    };
}

module.exports = { buildVectorStore, searchProducts, askGemini, getEmbedding, productToText };