// config/integrations.js
// ─────────────────────────────────────────────────────────
// When another team deploys their API, update ONLY this file.
// Change the URL from null to their deployed link.
// The services will automatically switch from mock to live.
// ─────────────────────────────────────────────────────────

module.exports = {
  inventory: {
    baseUrl: null, // e.g. "https://inventory-team.onrender.com"
    endpoints: {
      stock: "/api/inventory/stock",
      expiry: "/api/inventory/expiry",
      warehouse: "/api/inventory/warehouse"
    }
  },
  sales: {
    baseUrl: null, // e.g. "https://sales-team.onrender.com"
    endpoints: {
      top: "/api/sales/top",
      monthly: "/api/sales/monthly",
      byProduct: "/api/sales/product"
    }
  },
  pharmacy: {
    baseUrl: null, // e.g. "https://pharmacy-team.onrender.com"
    endpoints: {
      orders: "/api/orders",
      orderById: "/api/orders",
      history: "/api/orders/history"
    }
  },
  returns: {
    baseUrl: null, // e.g. "https://returns-team.onrender.com"
    endpoints: {
      all: "/api/returns",
      create: "/api/returns"
    }
  },
  mrVisit: {
    baseUrl: null, // e.g. "https://mrvisit-team.onrender.com"
    endpoints: {
      doctors: "/api/mr/doctors",
      visits: "/api/mr/visits",
      create: "/api/mr/visit"
    }
  },
  warehouse: {
    baseUrl: null, // e.g. "https://warehouse-team.onrender.com"
    endpoints: {
      stock: "/api/warehouse/stock",
      summary: "/api/warehouse/summary"
    }
  }
};
