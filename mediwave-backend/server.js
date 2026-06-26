require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { buildVectorStore } = require("./RAG/ragEngine");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/products", require("./routes/products"));
app.use("/api/chat", require("./routes/chat"));
app.use("/api/enquiry", require("./routes/enquiryRoutes"));
app.use("/api/integrations", require("./routes/integrations"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/settings", require("./routes/settings"));

app.get("/", (req, res) => {
  res.json({ message: "Mediwave API Running ✅" });
});

const PORT = process.env.PORT || 5000;

buildVectorStore().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});