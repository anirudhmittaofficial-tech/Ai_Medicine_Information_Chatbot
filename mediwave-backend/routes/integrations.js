const express = require("express");
const router = express.Router();
const inventory = require("../services/inventoryService");
const sales     = require("../services/salesService");
const pharmacy  = require("../services/pharmacyService");
const mr        = require("../services/mrService");
const config    = require("../config/integrations");

// ── Inventory ──────────────────────────────────────────
router.get("/inventory/stock", async (req, res) => {
  const result = await inventory.getAllStock();
  res.json(result);
});

router.get("/inventory/stock/:medicine", async (req, res) => {
  const result = await inventory.getStock(req.params.medicine);
  res.json(result);
});

// ── Sales ──────────────────────────────────────────────
router.get("/sales/top", async (req, res) => {
  const result = await sales.getTopSelling();
  res.json(result);
});

router.get("/sales/monthly", async (req, res) => {
  const result = await sales.getMonthlySummary();
  res.json(result);
});

// ── Pharmacy Orders ────────────────────────────────────
router.get("/pharmacy/orders", async (req, res) => {
  const result = await pharmacy.getOrders();
  res.json(result);
});

router.post("/pharmacy/orders", async (req, res) => {
  const { medicine, qty } = req.body;
  if (!medicine || !qty) {
    return res.status(400).json({ error: "medicine and qty are required" });
  }
  const result = await pharmacy.createOrder(medicine, qty);
  res.json(result);
});

// ── MR Visits ──────────────────────────────────────────
router.get("/mr/visits", async (req, res) => {
  const result = await mr.getVisits(req.query.doctor);
  res.json(result);
});

// GET status of all integrations (for Admin Dashboard)
router.get("/status", (req, res) => {
    try {
        const statuses = Object.keys(config).map(key => {
            const int = config[key];
            const isConnected = !!int.baseUrl;
            return {
                system: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
                status: isConnected ? "Connected" : "Waiting",
                mockUrl: `http://localhost:5000/api/integrations/${key}`,
                futureUrl: Object.values(int.endpoints)[0],
                latency: isConnected ? "85ms" : "-", // Simulated latency
                active: isConnected
            };
        });
        res.json(statuses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
