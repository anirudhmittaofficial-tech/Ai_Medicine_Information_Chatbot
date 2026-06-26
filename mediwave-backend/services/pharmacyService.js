const axios = require("axios");
const config = require("../config/integrations").pharmacy;

const MOCK_DATA = {
  orders: [
    { orderId: "ORD001", medicine: "HIGH-D3",     qty: 100, status: "Pending",   date: "2026-06-25" },
    { orderId: "ORD002", medicine: "SITAWAVE-M",  qty: 50,  status: "Delivered", date: "2026-06-20" },
    { orderId: "ORD003", medicine: "NERVITIN-QC", qty: 75,  status: "Processing",date: "2026-06-26" },
  ]
};

async function getOrders() {
  if (config.baseUrl) {
    try {
      const res = await axios.get(`${config.baseUrl}${config.endpoints.orders}`, { timeout: 5000 });
      return { source: "live", data: res.data };
    } catch (err) {
      console.warn("⚠️ Pharmacy API unreachable, using mock:", err.message);
    }
  }
  return { source: "mock", data: MOCK_DATA.orders };
}

async function createOrder(medicine, qty) {
  if (config.baseUrl) {
    try {
      const res = await axios.post(`${config.baseUrl}${config.endpoints.orders}`,
        { medicine, qty }, { timeout: 5000 });
      return { source: "live", data: res.data };
    } catch (err) {
      console.warn("⚠️ Pharmacy API unreachable, using mock:", err.message);
    }
  }
  const newOrder = {
    orderId: "ORD-MOCK-" + Date.now(),
    medicine, qty, status: "Pending",
    date: new Date().toISOString().split("T")[0]
  };
  return { source: "mock", data: newOrder };
}

module.exports = { getOrders, createOrder };
