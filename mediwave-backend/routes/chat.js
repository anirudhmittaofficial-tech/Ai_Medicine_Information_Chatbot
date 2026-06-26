const express = require("express");
const router = express.Router();
const pool = require("../db");
const { searchProducts, askGemini } = require("../RAG/ragEngine");

function isGreeting(text) {
    const t = text.trim().toLowerCase();
    return /^(hi|hello|hey|hii+|good morning|good afternoon|good evening|thanks|thank you|ok|okay|bye)[\s!.,]*$/.test(t);
}

async function createConversation(firstMessage) {
    const title = firstMessage.length > 50 ? firstMessage.slice(0, 50) + "..." : firstMessage;
    const result = await pool.query(
        "INSERT INTO conversations (title) VALUES ($1) RETURNING id",
        [title]
    );
    return result.rows[0].id;
}

router.post("/", async (req, res) => {
    const { question, conversation_id } = req.body;
    if (!question) return res.status(400).json({ error: "Question is required" });

    try {
        let convoId = conversation_id;
        if (!convoId) {
            convoId = await createConversation(question);
        } else {
            await pool.query(
                "UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1",
                [convoId]
            );
        }

        if (isGreeting(question)) {
            const greetingReply = "Hi! I'm Mediwave AI — I can help with questions about our medicines, dosages, and uses. What would you like to know?";
            await pool.query(
                "INSERT INTO chat_history (conversation_id, question, answer) VALUES ($1, $2, $3)",
                [convoId, question, greetingReply]
            );
            return res.json({ question, answer: greetingReply, conversation_id: convoId });
        }

        const searchResult = await searchProducts(question);
        
        let answer = "";
        let metadata = { topMatches: [], promptSent: "" };

        if (!searchResult || searchResult.topMatches.length === 0) {
            answer = "Sorry, I couldn't find relevant medicine information. Please contact Mediwave Life Sciences directly.\n\n⚠️ Disclaimer: This information is for reference only. Please consult a qualified healthcare professional before use.";
        } else {
            const geminiResult = await askGemini(question, searchResult.contextString);
            answer = geminiResult.answer;
            metadata.topMatches = searchResult.topMatches;
            metadata.promptSent = geminiResult.promptSent;
        }

        await pool.query(
            "INSERT INTO chat_history (conversation_id, question, answer, metadata) VALUES ($1, $2, $3, $4)",
            [convoId, question, answer, JSON.stringify(metadata)]
        );

        res.json({ question, answer, conversation_id: convoId, metadata });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Sidebar list — one row per conversation
router.get("/conversations", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM conversations ORDER BY updated_at DESC"
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Full message thread for one conversation
router.get("/conversations/:id/messages", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM chat_history WHERE conversation_id = $1 ORDER BY created_at ASC",
            [req.params.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete an entire conversation (cascades to its messages)
router.delete("/conversations/:id", async (req, res) => {
    try {
        await pool.query("DELETE FROM conversations WHERE id = $1", [req.params.id]);
        res.json({ message: "Conversation deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all chat history messages (for Admin Dashboard)
router.get("/history", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT ch.id, ch.question, ch.answer, ch.created_at as time, c.title as conversation_title, ch.metadata 
             FROM chat_history ch 
             JOIN conversations c ON ch.conversation_id = c.id 
             ORDER BY ch.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a single chat log
router.delete("/history/:id", async (req, res) => {
    try {
        await pool.query("DELETE FROM chat_history WHERE id = $1", [req.params.id]);
        res.json({ message: "Chat log deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;