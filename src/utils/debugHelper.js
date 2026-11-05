// debugHelper.js - Helper untuk debugging koneksi dan API calls

export const debugAPI = {
  // Test koneksi ke backend
  async testConnection() {
    try {
      const apiBase = import.meta.env.VITE_API_URL || "/api";
      const response = await fetch(`${apiBase}/health`);
      const data = await response.json();
      console.log("✅ Backend connection test:", data);
      return { success: true, data };
    } catch (error) {
      console.error("❌ Backend connection failed:", error);
      return { success: false, error: error.message };
    }
  },

  // Test authentication
  async testAuth() {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        return { success: false, error: "No token found" };
      }

      const apiBase = import.meta.env.VITE_API_URL || "/api";
      const response = await fetch(`${apiBase}/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("✅ Auth test:", data);
      return { success: true, data };
    } catch (error) {
      console.error("❌ Auth test failed:", error);
      return { success: false, error: error.message };
    }
  },

  // Test RAN PAUD endpoints
  async testRanPaudEndpoints() {
    const apiBase = import.meta.env.VITE_API_URL || "/api";
    const tests = [
      {
        name: "GET /ran-paud/data",
        url: `${apiBase}/ran-paud/data`,
        method: "GET",
      },
      {
        name: "GET /ran-paud/kl-list",
        url: `${apiBase}/ran-paud/kl-list`,
        method: "GET",
      },
      {
        name: "GET /ran-paud/summary",
        url: `${apiBase}/ran-paud/summary`,
        method: "GET",
      },
    ];

    const results = [];

    for (const test of tests) {
      try {
        const token = localStorage.getItem("authToken");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(test.url, {
          method: test.method,
          headers,
        });

        const data = await response.json();
        results.push({
          name: test.name,
          success: response.ok,
          status: response.status,
          data: data,
        });

        console.log(`✅ ${test.name}:`, response.status, data);
      } catch (error) {
        results.push({
          name: test.name,
          success: false,
          error: error.message,
        });
        console.error(`❌ ${test.name}:`, error);
      }
    }

    return results;
  },

  // Log current user info
  logUserInfo() {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("👤 Current user:", payload);
        return payload;
      } catch (error) {
        console.error("❌ Failed to decode token:", error);
        return null;
      }
    } else {
      console.log("❌ No token found");
      return null;
    }
  },

  // Test form data validation
  validateFormData(formData) {
    const errors = [];

    if (!formData.klId) errors.push("K/L ID is required");
    if (!formData.program) errors.push("Program is required");
    if (!formData.indikator) errors.push("Indikator is required");
    if (!formData.targetSatuan) errors.push("Target/Satuan is required");

    if (!formData.tahunData || !Array.isArray(formData.tahunData)) {
      errors.push("TahunData must be an array");
    } else {
      formData.tahunData.forEach((tahun, index) => {
        if (!tahun.tahun) errors.push(`Tahun ${index}: tahun is required`);
        if (tahun.target && isNaN(parseFloat(tahun.target))) {
          errors.push(`Tahun ${index}: target must be a number`);
        }
        if (tahun.realisasi && isNaN(parseFloat(tahun.realisasi))) {
          errors.push(`Tahun ${index}: realisasi must be a number`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

export default debugAPI;
