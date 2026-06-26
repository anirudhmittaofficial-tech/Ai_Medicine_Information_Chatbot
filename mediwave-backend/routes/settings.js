const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const settingsPath = path.join(__dirname, "../config/settings.json");

// GET current settings
router.get("/", (req, res) => {
    try {
        const data = fs.readFileSync(settingsPath, "utf-8");
        res.json(JSON.parse(data));
    } catch (err) {
        res.status(500).json({ error: "Failed to read settings" });
    }
});

// PUT update settings
router.put("/", (req, res) => {
    try {
        const { similarityThreshold, maxChunks, maxTokens, disclaimer } = req.body;
        
        // Read current
        const currentData = JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
        
        // Update fields
        if (similarityThreshold !== undefined) currentData.similarityThreshold = Number(similarityThreshold);
        if (maxChunks !== undefined) currentData.maxChunks = Number(maxChunks);
        if (maxTokens !== undefined) currentData.maxTokens = Number(maxTokens);
        if (disclaimer !== undefined) currentData.disclaimer = String(disclaimer);

        // Write back
        fs.writeFileSync(settingsPath, JSON.stringify(currentData, null, 2));
        
        res.json({ message: "Settings updated successfully", settings: currentData });
    } catch (err) {
        res.status(500).json({ error: "Failed to update settings" });
    }
});

module.exports = router;
