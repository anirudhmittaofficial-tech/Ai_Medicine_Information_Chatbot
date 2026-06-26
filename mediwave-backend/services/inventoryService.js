const axios = require("axios");
const config = require("../config/integrations").inventory;

const MOCK_DATA = {
  stock: [
    { medicine: "HIGHSAM-400", stock: 230, warehouse: "Hyderabad", expiry: "2027-10-15" },
    { medicine: "LIVWAVE-DS",  stock: 180, warehouse: "Hyderabad", expiry: "2027-06-30" },
    { medicine: "SITAWAVE-M",  stock: 95,  warehouse: "Bangalore",  expiry: "2026-12-31" },
    { medicine: "NERVITIN-QC", stock: 50,  warehouse: "Hyderabad", expiry: "2026-09-15" },
    { medicine: "HIGH-D3",     stock: 400, warehouse: "Bangalore",  expiry: "2027-03-20" },
  ]
};

async function getStock(medicineName) {
  if (config.baseUrl) {
    try {
      const url = `${config.baseUrl}${config.endpoints.stock}/${medicineName}`;
      const res = await axios.get(url, { timeout: 5000 });
      return { source: "live", data: res.data };
    } catch (err) {
      console.warn("⚠️ Inventory API unreachable, using mock:", err.message);
    }
  }
  const item = MOCK_DATA.stock.find(
    s => s.medicine.toLowerCase() === medicineName.toLowerCase()
  ) || { medicine: medicineName, stock: "Unknown", warehouse: "N/A", expiry: "N/A" };
  return { source: "mock", data: item };
}

async function getAllStock() {
  if (config.baseUrl) {
    try {
      const res = await axios.get(`${config.baseUrl}${config.endpoints.stock}`, { timeout: 5000 });
      return { source: "live", data: res.data };
    } catch (err) {
      console.warn("⚠️ Inventory API unreachable, using mock:", err.message);
    }
  }
  return { source: "mock", data: MOCK_DATA.stock };
}

module.exports = { getStock, getAllStock };
