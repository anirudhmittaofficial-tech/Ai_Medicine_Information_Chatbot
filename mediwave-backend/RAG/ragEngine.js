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

        // Get all products that need embeddings
        const { rows } = await pool.query("SELECT * FROM products WHERE embedding IS NULL");
        console.log(`📦 Found ${rows.length} products needing embeddings in database`);

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

// Keyword-based fallback search using in-memory scoring (much more accurate than SQL OR)
async function keywordSearch(question) {
    try {
        const settings = getSettings();
        // Extract meaningful words (3+ chars), ignore common stop words
        const stopWords = new Set(["what", "the", "for", "how", "can", "use", "used", "is", "are", "does", "much", "many", "about", "with", "this", "that", "old", "boy", "girl", "year", "years", "composition", "dosage", "and", "tell", "me"]);
        const keywords = question
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, " ")
            .split(/\s+/)
            .filter(w => w.length >= 3 && !stopWords.has(w));

        if (keywords.length === 0) return null;

        // Fetch all products since it's a small dataset (62 rows)
        const { rows } = await pool.query(`SELECT * FROM products`);
        
        // Score products based on keyword matches
        const scored = rows.map(product => {
            let score = 0;
            const searchString = `${product.product_name} ${product.composition} ${product.indication} ${product.description} ${product.category}`.toLowerCase();
            
            for (const kw of keywords) {
                // Exact product name match gets a massive boost
                if (product.product_name.toLowerCase().includes(kw)) {
                    score += 10;
                }
                // General text match gets normal points
                else if (searchString.includes(kw)) {
                    score += 1;
                }
            }
            return { product, score };
        });

        // Filter out products with 0 matches, sort by score descending
        const filtered = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score);

        if (filtered.length === 0) return null;

        const topChunks = filtered.slice(0, settings.maxChunks);
        console.log(`🔑 Keyword fallback matched ${filtered.length} product(s). Top match: ${topChunks[0].product.product_name} (score: ${topChunks[0].score})`);

        const contextString = topChunks.map(c => productToText(c.product)).join("\n\n---\n\n");
        const topMatches = topChunks.map(c => ({
            product_name: c.product.product_name,
            score: "keyword",
            fields: {
                composition: c.product.composition,
                dosage: c.product.dosage,
                indication: c.product.indication,
                description: c.product.description
            }
        }));

        return { contextString, topMatches };
    } catch (err) {
        console.error("❌ Keyword search error:", err.message);
        return null;
    }
}

// Search products: tries embedding-based similarity first, falls back to keyword search
async function searchProducts(question) {
    console.log(`🔍 Searching for: "${question}"`);

    try {
        const questionEmbedding = await getEmbedding(question);

        // Get all products that have embeddings
        const { rows } = await pool.query(
            "SELECT * FROM products WHERE embedding IS NOT NULL"
        );

        if (rows.length === 0) {
            console.log("⚠️  No embeddings found, falling back to keyword search.");
            return await keywordSearch(question);
        }

        // Calculate similarity score for each product
        const scored = rows.map(product => {
            const productEmbedding = JSON.parse(product.embedding);
            const score = cosineSimilarity(questionEmbedding, productEmbedding);
            return { product, score };
        });

        const settings = getSettings();
        const filtered = scored.filter(s => s.score >= settings.similarityThreshold);
        filtered.sort((a, b) => b.score - a.score);

        if (filtered.length === 0) {
            console.log(`⚠️  No embedding matches above threshold (${settings.similarityThreshold}), falling back to keyword search.`);
            return await keywordSearch(question);
        }

        const topChunks = filtered.slice(0, settings.maxChunks);
        console.log(`✅ Top match: ${topChunks[0].product.product_name} (score: ${topChunks[0].score.toFixed(3)})`);

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
        // Embedding API failed (e.g. quota exceeded 429) — fall back to keyword search
        console.warn(`⚠️  Embedding API unavailable (${err.message.slice(0, 80)}...). Using keyword search fallback.`);
        return await keywordSearch(question);
    }
}

// Ask Gemini with retrieved context — tries models in order, retries on 429
async function askGemini(question, context) {
    const settings = getSettings();

    // Models tried in order — all have free tiers
    const MODELS = [
        "gemini-2.0-flash-lite",
        "gemini-2.5-flash-lite",
        "gemini-1.5-flash-8b",
    ];

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
    let lastErr;
    for (const modelName of MODELS) {
        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: { maxOutputTokens: settings.maxTokens }
            });
            console.log(`🤖 Trying model: ${modelName}`);
            const result = await model.generateContent(prompt);
            return {
                answer: result.response.text(),
                promptSent: prompt.trim(),
                modelUsed: modelName
            };
        } catch (err) {
            lastErr = err;
            const is429 = err.message.includes("429") || err.message.includes("Too Many Requests");
            const isQuotaZero = err.message.includes("limit: 0");

            if (is429 && !isQuotaZero) {
                // Rate-limited but quota exists — extract retry delay and wait
                const delayMatch = err.message.match(/retry in ([\d.]+)s/i);
                const waitMs = delayMatch ? Math.min(parseFloat(delayMatch[1]) * 1000, 60000) : 5000;
                console.warn(`⏳ Model ${modelName} rate-limited. Waiting ${waitMs / 1000}s before retry...`);
                await new Promise(r => setTimeout(r, waitMs));
                // Retry this model once after wait
                try {
                    const model2 = genAI.getGenerativeModel({
                        model: modelName,
                        generationConfig: { maxOutputTokens: settings.maxTokens }
                    });
                    const result2 = await model2.generateContent(prompt);
                    return {
                        answer: result2.response.text(),
                        promptSent: prompt.trim(),
                        modelUsed: modelName
                    };
                } catch (retryErr) {
                    console.warn(`⚠️  ${modelName} retry failed: ${retryErr.message.slice(0, 60)}`);
                    lastErr = retryErr;
                }
            } else {
                // Quota = 0 (no free tier) or 404 → skip to next model
                console.warn(`⚠️  ${modelName} unavailable: ${err.message.slice(0, 80)}`);
            }
        }
    }

    throw new Error(`All AI models unavailable. Please try again in a few minutes. (${lastErr?.message?.slice(0, 100)})`);
}

module.exports = { buildVectorStore, searchProducts, askGemini, getEmbedding, productToText };