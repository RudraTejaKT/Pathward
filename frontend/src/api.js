const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

let authToken = null;
export function setAuthToken(token) {
  authToken = token;
}

async function request(path, { method = "GET", body, auth = false, optionalAuth = false } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (auth) {
    if (!authToken) throw new Error("Not logged in");
    headers["Authorization"] = `Bearer ${authToken}`;
  } else if (optionalAuth && authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error(
      `Could not connect to API (${err.message}). Make sure the backend server is running on http://localhost:4000.`
    );
  }

  const contentType = res.headers.get("content-type") || "";
  let json;
  if (contentType.includes("application/json")) {
    try {
      json = await res.json();
    } catch {
      throw new Error(`Invalid JSON response from server (Status: ${res.status})`);
    }
  } else {
    throw new Error(
      `Received non-JSON response from server (Status: ${res.status}). Ensure the backend server is running on http://localhost:4000.`
    );
  }

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
  signup: (name, email, password, role = "trainee") =>
    request("/auth/signup", { method: "POST", body: { name, email, password, role } }),
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
  createOrder: (payload) =>
    request("/payments/create-order", {
      method: "POST",
      auth: true,
      body: typeof payload === "string" ? { plan: payload } : payload,
    }),
  verifyPayment: (payload) => request("/payments/verify", { method: "POST", auth: true, body: payload }),
  getPaymentHistory: () => request("/payments/history", { auth: true }),
  getLearningStreams: () => request("/learning/streams"),
  getExams: () => request("/learning/exams"),
  getTedTalks: () => request("/learning/ted-talks"),
  getCourses: () => request("/learning/courses"),
  getCourse: (id) => request(`/learning/courses/${id}`),
  getMcqs: (stream, exam, count=20) => request(`/learning/mcq?stream=${encodeURIComponent(stream)}&exam=${encodeURIComponent(exam||"")}&count=${count}`),
  getPathway: (streamId) => request(`/learning/pathways/${encodeURIComponent(streamId)}`),
  instructorSignup: (name,email,password) => request("/auth/instructor-signup", {method:"POST",body:{name,email,password}}),
  getInstructorCourses: () => request("/learning/instructor/courses", {auth:true}),
  createCourse: (payload) => request("/learning/instructor/courses", {method:"POST",auth:true,body:payload}),
  addModule: (courseId,payload) => request(`/learning/instructor/courses/${courseId}/modules`, {method:"POST",auth:true,body:payload}),
  uploadModule: async (courseId, formData) => {
    if (!authToken) throw new Error("Not logged in");
    let res;
    try {
      res = await fetch(`${BASE_URL}/learning/instructor/courses/${courseId}/modules/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${authToken}` },
        body: formData,
      });
    } catch (err) {
      throw new Error(`Upload network error: ${err.message}`);
    }

    const contentType = res.headers.get("content-type") || "";
    let json;
    if (contentType.includes("application/json")) {
      json = await res.json();
    } else {
      throw new Error(`Upload server error (Status: ${res.status})`);
    }

    if (!res.ok || !json.success) throw new Error(json.message || "Upload failed");
    return json.data;
  },

  // --- Career Aptitude & Assessment ---
  getAssessmentQuestions: () => request("/assessment/questions"),
  evaluateAssessment: (answers) => request("/assessment/evaluate", { method: "POST", body: { answers }, optionalAuth: true }),
  getLatestAssessment: () => request("/assessment/latest", { auth: true }),
};
