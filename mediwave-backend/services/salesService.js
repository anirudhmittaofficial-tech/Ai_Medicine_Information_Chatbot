const axios = require("axios");
const config = require("../config/integrations").sales;

const MOCK_DATA = {
  topSelling: [
    { medicine: "HIGH-D3",     unitsSold: 1200, revenue: 84000 },
    { medicine: "HIGHSAM-400", unitsSold: 980,  revenue: 147000 },
    { medicine: "SITAWAVE-M",  unitsSold: 750,  revenue: 112500 },
    { medicine: "NERVITIN-QC", unitsSold: 620,  revenue: 74400 },
    { medicine: "LIVWAVE-DS",  unitsSold: 580,  revenue: 69600 },
  ],
  monthly: { month: "June 2026", totalRevenue: 487500, totalUnits: 4130 }
};

async function getTopSelling() {
  if (config.baseUrl) {
    try {
      const res = await axios.get(`${config.baseUrl}${config.endpoints.top}`, { timeout: 5000 });
      return { source: "live", data: res.data };
    } catch (err) {
      console.warn("⚠️ Sales API unreachable, using mock:", err.message);
    }
  }
  return { source: "mock", data: MOCK_DATA.topSelling };
}

async function getMonthlySummary() {
  if (config.baseUrl) {
    try {
      const res = await axios.get(`${config.baseUrl}${config.endpoints.monthly}`, { timeout: 5000 });
      return { source: "live", data: res.data };
    } catch (err) {
      console.warn("⚠️ Sales API unreachable, using mock:", err.message);
    }
  }
  return { source: "mock", data: MOCK_DATA.monthly };
}

module.exports = { getTopSelling, getMonthlySummary };
