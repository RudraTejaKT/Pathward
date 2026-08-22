const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

let authToken = null;
export function setAuthToken(token) {
  authToken = token;
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (auth) {
    if (!authToken) throw new Error("Not logged in");
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Request failed");
  }
  return json.data;
}

export const api = {
  // --- Public career-guide data ---
  getStreams: () => request("/streams"),
  getBranches: () => request("/branches"),
  getBranch: (id) => request(`/branches/${id}`),
  getBranchDetails: (id) => request(`/branch-details/${id}`),

  // --- Auth ---
  signup: (name, email, password) => request("/auth/signup", { method: "POST", body: { name, email, password } }),
  login: (email, password) => request("/auth/login", { method: "POST", body: { email, password } }),
  me: () => request("/auth/me", { auth: true }),

  // --- Trainee progress (requires login) ---
  getProgressOverview: () => request("/trainee/progress", { auth: true }),
  getBranchProgress: (branchId) => request(`/trainee/progress/${branchId}`, { auth: true }),
  setProgress: (branchId, itemType, itemKey, completed) =>
    request(`/trainee/progress/${branchId}`, {
      method: "PUT",
      auth: true,
      body: { itemType, itemKey, completed },
    }),

  // --- Payments (requires login) ---
  getPlans: () => request("/payments/plans", { auth: true }),
  createOrder: (plan) => request("/payments/create-order", { method: "POST", auth: true, body: { plan } }),
  verifyPayment: (payload) => request("/payments/verify", { method: "POST", auth: true, body: payload }),
  getPaymentHistory: () => request("/payments/history", { auth: true }),
};
