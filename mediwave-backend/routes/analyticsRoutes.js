const express = require("express");
const router = express.Router();
const pool = require("../db");

router.get("/overview", async (req, res) => {
    try {
        // Run multiple count queries in parallel
        const [
            productsResult,
            chatsResult,
            todaysChatsResult,
            enquiriesResult
        ] = await Promise.all([
            pool.query("SELECT COUNT(*) FROM products"),
            pool.query("SELECT COUNT(*) FROM conversations"),
            pool.query("SELECT COUNT(*) FROM conversations WHERE created_at >= CURRENT_DATE"),
            pool.query(`
                SELECT 
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE status = 'Pending' OR status = 'New') as pending,
                    COUNT(*) FILTER (WHERE status = 'Resolved') as resolved
                FROM enquiries
            `)
        ]);

        const totalProducts = parseInt(productsResult.rows[0].count) || 0;
        const totalChats = parseInt(chatsResult.rows[0].count) || 0;
        const todaysChats = parseInt(todaysChatsResult.rows[0].count) || 0;
        
        const enquiryStats = enquiriesResult.rows[0];
        const totalEnquiries = parseInt(enquiryStats.total) || 0;
        const pendingEnquiries = parseInt(enquiryStats.pending) || 0;
        const resolvedEnquiries = parseInt(enquiryStats.resolved) || 0;

        res.json({
            totalProducts,
            totalChats,
            todaysChats,
            totalEnquiries,
            pendingEnquiries,
            resolvedEnquiries,
            aiSuccessRate: "96.4%", // Simulated
            avgResponse: "1.8s"     // Simulated
        });

    } catch (error) {
        console.error("Dashboard Analytics Error:", error);
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;
