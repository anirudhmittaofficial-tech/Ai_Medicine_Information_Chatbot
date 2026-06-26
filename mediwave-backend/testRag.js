require("dotenv").config();
const { searchProducts, askGemini } = require("./RAG/ragEngine");

async function test() {
    const question = "What is HIGH-D3 used for?";
    console.log("❓ Question:", question);

    const context = await searchProducts(question);
    console.log("\n📄 Context:\n", context);

    if (context) {
        const answer = await askGemini(question, context);
        console.log("\n🤖 Answer:\n", answer);
    } else {
        console.log("❌ No context found");
    }

    process.exit(0);
}

test();