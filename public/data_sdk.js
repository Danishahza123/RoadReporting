const getApiUrl = () => {
  const pathname = window.location.pathname;
  if (pathname.includes('/public/')) {
    const base = pathname.split('/public/')[0];
    return window.location.origin + base + '/public/api';
  }
  return window.location.origin + '/api';
};
const API = getApiUrl();
let TOKEN = localStorage.getItem("token") || "";

const jsonHeaders = () => ({
  Accept: "application/json",
  "Content-Type": "application/json"
});

const authHeaders = () => ({
  Accept: "application/json",
  Authorization: `Bearer ${TOKEN}`
});

const authJsonHeaders = () => ({
  ...jsonHeaders(),
  Authorization: `Bearer ${TOKEN}`
});

const multipartHeaders = () => ({
  Accept: "application/json",
  Authorization: `Bearer ${TOKEN}`
});

/* =========================
   AUTH
========================= */

async function loginAPI(email, password) {
  const res = await fetch(API + "/login", {
    method: "POST",
    headers: jsonHeaders(),
    body: JSON.stringify({ email, password })
  });

  const data = await handleResponse(res);

  TOKEN = data.token;
  localStorage.setItem("token", TOKEN);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
}

async function registerAPI(name, email, password) {
  const res = await fetch(API + "/register", {
    method: "POST",   // 🔥 MUST be POST
    headers: jsonHeaders(),
    body: JSON.stringify({ name, email, password })
  });

  return handleResponse(res);
}

/* =========================
   USER
========================= */

async function getMe() {
  const res = await fetch(API + "/me", {
    headers: authHeaders()
  });

  return handleResponse(res);
}

async function updateProfile(data) {
  const res = await fetch(API + "/profile", {
    method: "PATCH",
    headers: authJsonHeaders(),
    body: JSON.stringify(data)
  });

  return handleResponse(res);
}

async function getUsers() {
  const res = await fetch(API + "/users", {
    headers: authHeaders()
  });

  return handleResponse(res);
}

async function updateUser(id, data) {
  const res = await fetch(API + "/users/" + id, {
    method: "PATCH",
    headers: authJsonHeaders(),
    body: JSON.stringify(data)
  });

  return handleResponse(res);
}

/* =========================
   REPORT HELPERS
========================= */

async function handleResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => ({}))
    : {};

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data;
}

/* =========================
   REPORTS
========================= */

async function createReport(data) {
  const isFormData = data instanceof FormData;
  const res = await fetch(API + "/reports", {
    method: "POST",
    headers: isFormData ? multipartHeaders() : authJsonHeaders(),
    body: isFormData ? data : JSON.stringify(data)
  });

  return handleResponse(res);
}

async function getMyReports() {
  const res = await fetch(API + "/my-reports", {
    headers: authHeaders()
  });

  return handleResponse(res);
}

async function getAllReports() {
  const res = await fetch(API + "/reports", {
    headers: authHeaders()
  });

  return handleResponse(res);
}

async function updateReport(id, data) {
  const isFormData = data instanceof FormData;
  if (isFormData) data.append("_method", "PATCH");

  const res = await fetch(API + "/reports/" + id, {
    method: isFormData ? "POST" : "PATCH",
    headers: isFormData ? multipartHeaders() : authJsonHeaders(),
    body: isFormData ? data : JSON.stringify(data)
  });

  return handleResponse(res);
}

async function deleteReport(id) {
  const res = await fetch(API + "/reports/" + id, {
    method: "DELETE",
    headers: authHeaders()
  });

  return handleResponse(res);
}

/* =========================
   EXPORT
========================= */

window.loginAPI = loginAPI;
window.registerAPI = registerAPI;
window.updateProfile = updateProfile;
window.getUsers = getUsers;
window.updateUser = updateUser;
window.createReport = createReport;
window.getMyReports = getMyReports;
window.getAllReports = getAllReports;
window.updateReport = updateReport;
window.deleteReport = deleteReport;
