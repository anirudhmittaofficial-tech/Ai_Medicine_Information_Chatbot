const express = require("express");
const router = express.Router();
const pool = require("../db");
const { getEmbedding, productToText } = require("../RAG/ragEngine");

// GET all products
router.get("/", async (req, res) => {
  try {
    const { admin } = req.query;
    let query = "SELECT * FROM products ORDER BY id";
    
    // If not admin, only show non-hidden products
    if (admin !== 'true') {
      query = "SELECT * FROM products WHERE hidden = false ORDER BY id";
    }
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single product by name
router.get("/:name", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE product_name ILIKE $1",
      [req.params.name]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new product
router.post("/", async (req, res) => {
  try {
    const { product_name, category, composition, dosage, indication } = req.body;
    
    // 1. Generate text format for the AI
    const productText = productToText({ product_name, category, composition, dosage, indication });
    
    // 2. Fetch the vector embedding from Gemini real-time
    const embedding = await getEmbedding(productText);

    // 3. Insert into DB including the embedding
    const result = await pool.query(
      `INSERT INTO products (product_name, category, composition, dosage, indication, embedding) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [product_name, category, composition, dosage, indication, JSON.stringify(embedding)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update product (and toggle hidden)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, category, composition, dosage, indication, hidden } = req.body;
    
    // Get current product to ensure we have all fields for embedding if only some are passed
    const current = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    const currentProduct = current.rows[0];

    const mergedProduct = {
      product_name: product_name !== undefined ? product_name : currentProduct.product_name,
      category: category !== undefined ? category : currentProduct.category,
      composition: composition !== undefined ? composition : currentProduct.composition,
      dosage: dosage !== undefined ? dosage : currentProduct.dosage,
      indication: indication !== undefined ? indication : currentProduct.indication,
    };

    // Re-generate embedding because the details changed!
    const productText = productToText(mergedProduct);
    const newEmbedding = await getEmbedding(productText);
    
    const result = await pool.query(
      `UPDATE products 
       SET product_name = $1, 
           category = $2, 
           composition = $3, 
           dosage = $4, 
           indication = $5,
           hidden = COALESCE($6, hidden),
           embedding = $7
       WHERE id = $8 RETURNING *`,
      [mergedProduct.product_name, mergedProduct.category, mergedProduct.composition, 
       mergedProduct.dosage, mergedProduct.indication, hidden, JSON.stringify(newEmbedding), id]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE product
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
