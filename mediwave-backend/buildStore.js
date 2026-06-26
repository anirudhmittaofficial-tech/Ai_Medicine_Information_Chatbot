require("dotenv").config();
const { buildVectorStore } = require("./RAG/ragEngine");

buildVectorStore()
    .then(() => {
        console.log("🎉 Done!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ Failed:", err.message);
        process.exit(1);
    });