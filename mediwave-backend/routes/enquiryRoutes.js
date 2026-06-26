const express = require("express");
const router = express.Router();
const pool = require("../db");

router.post("/", async (req, res) => {
    try {
        const { user_name, user_type, question } = req.body;

        if (!user_name || !user_type || !question) {
            return res.status(400).json({ error: "user_name, user_type, and question are required" });
        }

        const result = await pool.query(
            `INSERT INTO enquiries (user_name, user_type, question, status)
             VALUES ($1, $2, $3, 'New')
             RETURNING *`,
            [user_name, user_type, question]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
});

// GET all enquiries (for dashboard/list view)
router.get("/", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM enquiries ORDER BY created_at DESC"
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET public enquiries (hides email and PII)
router.get("/public", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, user_name, user_type, question, answer, status, created_at 
             FROM enquiries 
             ORDER BY created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single enquiry by id (for detail page)
router.get("/:id", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM enquiries WHERE id = $1",
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Enquiry not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update status and answer
router.put("/:id", async (req, res) => {
    try {
        const { status, answer } = req.body;
        
        let query = "UPDATE enquiries SET status = $1 WHERE id = $2 RETURNING *";
        let params = [status, req.params.id];

        if (answer !== undefined) {
            query = "UPDATE enquiries SET status = $1, answer = $2 WHERE id = $3 RETURNING *";
            params = [status, answer, req.params.id];
        }

        const result = await pool.query(query, params);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Enquiry not found" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE enquiry
router.delete("/:id", async (req, res) => {
    try {
        const result = await pool.query(
            "DELETE FROM enquiries WHERE id = $1 RETURNING *",
            [req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Enquiry not found" });
        }
        res.json({ message: "Enquiry deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;