const axios = require("axios");
const config = require("../config/integrations").mrVisit;

const MOCK_DATA = {
  visits: [
    { mrName: "Raj Kumar",  doctor: "Dr. Reddy",  pharmacy: "Apollo MedPlus", product: "HIGH-D3",     date: "2026-06-24" },
    { mrName: "Priya Singh", doctor: "Dr. Sharma", pharmacy: "Care Pharmacy",  product: "HIGHSAM-400", date: "2026-06-25" },
    { mrName: "Arjun Das",  doctor: "Dr. Reddy",  pharmacy: "MedPlus",        product: "LIVWAVE-DS",  date: "2026-06-22" },
  ]
};

async function getVisits(doctorName) {
  if (config.baseUrl) {
    try {
      const url = doctorName
        ? `${config.baseUrl}${config.endpoints.visits}?doctor=${doctorName}`
        : `${config.baseUrl}${config.endpoints.visits}`;
      const res = await axios.get(url, { timeout: 5000 });
      return { source: "live", data: res.data };
    } catch (err) {
      console.warn("⚠️ MR Visit API unreachable, using mock:", err.message);
    }
  }
  const filtered = doctorName
    ? MOCK_DATA.visits.filter(v =>
        v.doctor.toLowerCase().includes(doctorName.toLowerCase()))
    : MOCK_DATA.visits;
  return { source: "mock", data: filtered };
}

module.exports = { getVisits };
