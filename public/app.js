console.log("app.js loaded");

window.USER = JSON.parse(localStorage.getItem("user")) || null;
let MY_REPORTS_CACHE = [];
let ADMIN_REPORTS_CACHE = [];
let USERS_CACHE = [];

/* ================= SAFE API HELPERS ================= */
function unwrap(res) {
  // supports both old + new API formats
  return res?.data ?? res ?? [];
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function severityColor(severity) {
  return {
    critical: "var(--critical)",
    high: "var(--high)",
    medium: "var(--medium)",
    low: "var(--low)"
  }[severity] || "var(--low)";
}

function reportCard(r, actions = "") {
  const severity = escapeHtml(r.severity || "low");
  const status = escapeHtml(r.status || "new");
  const created = r.created_at ? new Date(r.created_at).toLocaleDateString() : "Just now";
  const proof = r.proof_photo_url
    ? `<a href="${escapeHtml(r.proof_photo_url)}" target="_blank" rel="noopener" class="proof-thumb"><img src="${escapeHtml(r.proof_photo_url)}" alt="Report proof photo"></a>`
    : `<div class="proof-thumb proof-empty"><i data-lucide="image-off"></i></div>`;

  return `
    <article class="report-card">
      <span class="report-severity-dot" style="background:${severityColor(r.severity)}"></span>
      ${proof}
      <div class="report-info">
        <div class="report-location">${escapeHtml(r.location || "Unknown location")}</div>
        <div class="report-desc">${escapeHtml(r.description || "No description provided")}</div>
      </div>
      <div class="report-meta">
        <span class="pill pill-${severity}">${severity}</span>
        <span class="pill pill-${status}">${status}</span>
        <span class="report-date">${created}</span>
        ${actions}
      </div>
    </article>
  `;
}

function coordinateText(r) {
  if (r.latitude === null || r.latitude === undefined || r.longitude === null || r.longitude === undefined) {
    return "Not captured";
  }

  return `${Number(r.latitude).toFixed(6)}, ${Number(r.longitude).toFixed(6)}`;
}

function myReportCard(r) {
  const id = Number(r.id);
  return `
    <div class="report-item" id="report-item-${id}">
      ${reportCard(r, `
        <div class="report-actions">
          <button class="btn-sm btn-view" onclick="toggleReportReview(${id})">Review</button>
          <button class="btn-sm btn-edit" onclick="showEditReport(${id})">Edit</button>
        </div>
      `)}
      <div class="report-review hidden" id="report-review-${id}">
        <div class="review-grid">
          <div>
            <span>Location</span>
            <strong>${escapeHtml(r.location || "Unknown location")}</strong>
          </div>
          <div>
            <span>GPS</span>
            <strong>${escapeHtml(coordinateText(r))}</strong>
          </div>
          <div>
            <span>Severity</span>
            <strong>${escapeHtml(r.severity || "low")}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>${escapeHtml(r.status || "new")}</strong>
          </div>
          <div>
            <span>Submitted</span>
            <strong>${r.created_at ? new Date(r.created_at).toLocaleString() : "Just now"}</strong>
          </div>
        </div>
        <div class="review-description">
          <span>Description</span>
          <p>${escapeHtml(r.description || "No description provided")}</p>
        </div>
        <div class="review-proof">
          <span>Photo Proof</span>
          ${r.proof_photo_url
            ? `<a href="${escapeHtml(r.proof_photo_url)}" target="_blank" rel="noopener"><img src="${escapeHtml(r.proof_photo_url)}" alt="Report proof photo"></a>`
            : `<p>No proof photo attached</p>`}
        </div>
      </div>
      <div class="report-edit hidden" id="report-edit-${id}">
        <div class="form-row">
          <div class="form-group">
            <label for="edit-location-${id}">Location</label>
            <input id="edit-location-${id}" class="form-input" value="${escapeHtml(r.location || "")}">
            <input id="edit-latitude-${id}" type="hidden" value="${escapeHtml(r.latitude ?? "")}">
            <input id="edit-longitude-${id}" type="hidden" value="${escapeHtml(r.longitude ?? "")}">
            <div class="location-actions">
              <button type="button" class="btn-location" onclick="useCurrentLocation(${id})">
                <i data-lucide="crosshair"></i>
                <span>Update GPS</span>
              </button>
              <span id="edit-location-status-${id}" class="location-status">${escapeHtml(coordinateText(r))}</span>
            </div>
          </div>
          <div class="form-group">
            <label for="edit-severity-${id}">Severity</label>
            <select id="edit-severity-${id}" class="form-select">
              ${["low", "medium", "high", "critical"].map(level => `
                <option value="${level}" ${r.severity === level ? "selected" : ""}>${level[0].toUpperCase() + level.slice(1)}</option>
              `).join("")}
            </select>
          </div>
        </div>
        <div class="form-group">
          <label for="edit-description-${id}">Description</label>
          <textarea id="edit-description-${id}" class="form-input form-textarea">${escapeHtml(r.description || "")}</textarea>
        </div>
        <div class="form-group">
          <label for="edit-proof-photo-${id}">Replace Photo Proof</label>
          <label class="file-drop" for="edit-proof-photo-${id}">
            <i data-lucide="image-plus"></i>
            <span id="edit-proof-photo-label-${id}">${r.proof_photo_url ? "Current proof attached - choose a new file to replace" : "Attach JPG, PNG, or WebP evidence"}</span>
          </label>
          <input id="edit-proof-photo-${id}" type="file" accept="image/jpeg,image/png,image/webp" class="file-input" onchange="updateProofLabel(${id})">
        </div>
        <div class="edit-actions">
          <button class="btn-sm btn-approve" onclick="saveMyReport(${id})">Save Changes</button>
          <button class="btn-sm btn-delete" onclick="hideEditReport(${id})">Cancel</button>
        </div>
      </div>
    </div>
  `;
}

function adminReportCard(r) {
  const id = Number(r.id);
  const token = `admin-${id}`;

  return `
    <div class="report-item" id="admin-report-item-${id}">
      ${reportCard(r, `
        <div class="report-actions">
          <button class="btn-sm btn-view" onclick="toggleAdminReportReview(${id})">Review</button>
          <button class="btn-sm btn-edit" onclick="showAdminEditReport(${id})">Edit</button>
          <button class="btn-sm btn-approve" onclick="updateStatus(${id}, 'approved')">Approve</button>
          <button class="btn-sm btn-approve" onclick="updateStatus(${id}, 'resolved')">Resolve</button>
          <button class="btn-sm btn-reject" onclick="updateStatus(${id}, 'rejected')">Reject</button>
          <button class="btn-sm btn-delete" onclick="deleteReportAPI(${id})">Delete</button>
        </div>
      `)}
      <div class="report-review hidden" id="admin-report-review-${id}">
        <div class="review-grid">
          <div>
            <span>Location</span>
            <strong>${escapeHtml(r.location || "Unknown location")}</strong>
          </div>
          <div>
            <span>GPS</span>
            <strong>${escapeHtml(coordinateText(r))}</strong>
          </div>
          <div>
            <span>Severity</span>
            <strong>${escapeHtml(r.severity || "low")}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>${escapeHtml(r.status || "new")}</strong>
          </div>
          <div>
            <span>Submitted</span>
            <strong>${r.created_at ? new Date(r.created_at).toLocaleString() : "Just now"}</strong>
          </div>
        </div>
        <div class="review-description">
          <span>Description</span>
          <p>${escapeHtml(r.description || "No description provided")}</p>
        </div>
        <div class="review-proof">
          <span>Photo Proof</span>
          ${r.proof_photo_url
            ? `<a href="${escapeHtml(r.proof_photo_url)}" target="_blank" rel="noopener"><img src="${escapeHtml(r.proof_photo_url)}" alt="Report proof photo"></a>`
            : `<p>No proof photo attached</p>`}
        </div>
      </div>
      <div class="report-edit hidden" id="admin-report-edit-${id}">
        <div class="form-row">
          <div class="form-group">
            <label for="edit-location-${token}">Location</label>
            <input id="edit-location-${token}" class="form-input" value="${escapeHtml(r.location || "")}">
            <input id="edit-latitude-${token}" type="hidden" value="${escapeHtml(r.latitude ?? "")}">
            <input id="edit-longitude-${token}" type="hidden" value="${escapeHtml(r.longitude ?? "")}">
            <div class="location-actions">
              <button type="button" class="btn-location" onclick="useCurrentLocation('${token}')">
                <i data-lucide="crosshair"></i>
                <span>Update GPS</span>
              </button>
              <span id="edit-location-status-${token}" class="location-status">${escapeHtml(coordinateText(r))}</span>
            </div>
          </div>
          <div class="form-group">
            <label for="edit-severity-${token}">Severity</label>
            <select id="edit-severity-${token}" class="form-select">
              ${["low", "medium", "high", "critical"].map(level => `
                <option value="${level}" ${r.severity === level ? "selected" : ""}>${level[0].toUpperCase() + level.slice(1)}</option>
              `).join("")}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="edit-status-${token}">Status</label>
            <select id="edit-status-${token}" class="form-select">
              ${["new", "pending", "approved", "rejected", "resolved"].map(status => `
                <option value="${status}" ${r.status === status ? "selected" : ""}>${status[0].toUpperCase() + status.slice(1)}</option>
              `).join("")}
            </select>
          </div>
          <div class="form-group">
            <label for="edit-proof-photo-${token}">Replace Photo Proof</label>
            <label class="file-drop" for="edit-proof-photo-${token}">
              <i data-lucide="image-plus"></i>
              <span id="edit-proof-photo-label-${token}">${r.proof_photo_url ? "Current proof attached - choose a new file to replace" : "Attach JPG, PNG, or WebP evidence"}</span>
            </label>
            <input id="edit-proof-photo-${token}" type="file" accept="image/jpeg,image/png,image/webp" class="file-input" onchange="updateProofLabel('${token}')">
          </div>
        </div>
        <div class="form-group">
          <label for="edit-description-${token}">Description</label>
          <textarea id="edit-description-${token}" class="form-input form-textarea">${escapeHtml(r.description || "")}</textarea>
        </div>
        <div class="edit-actions">
          <button class="btn-sm btn-approve" onclick="saveAdminReport(${id})">Save Changes</button>
          <button class="btn-sm btn-delete" onclick="hideAdminEditReport(${id})">Cancel</button>
        </div>
      </div>
    </div>
  `;
}

function emptyState(message) {
  return `
    <div class="empty-state">
      <i data-lucide="inbox"></i>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function refreshIcons() {
  if (window.lucide) lucide.createIcons();
}

function isAdmin() {
  return window.USER?.role === "admin";
}

function userCard(user) {
  const id = Number(user.id);
  const joined = user.created_at ? new Date(user.created_at).toLocaleDateString() : "Unknown";

  return `
    <div class="user-card" id="user-card-${id}">
      <div class="user-avatar-mini">
        <i data-lucide="user"></i>
      </div>
      <div class="user-info">
        <strong>${escapeHtml(user.name || "Unnamed User")}</strong>
        <span>${escapeHtml(user.email || "No email")}</span>
      </div>
      <div class="report-meta">
        <span class="pill pill-${user.role === "admin" ? "approved" : "low"}">${escapeHtml(user.role || "user")}</span>
        <span class="report-date">Joined ${joined}</span>
        <div class="report-actions">
          <button class="btn-sm btn-view" onclick="toggleUserPreview(${id})">Preview</button>
          <button class="btn-sm btn-edit" onclick="showUserEdit(${id})">Edit</button>
        </div>
      </div>
      <div class="report-review hidden" id="user-preview-${id}">
        <div class="review-grid">
          <div><span>Name</span><strong>${escapeHtml(user.name || "Unnamed User")}</strong></div>
          <div><span>Email</span><strong>${escapeHtml(user.email || "No email")}</strong></div>
          <div><span>Role</span><strong>${escapeHtml(user.role || "user")}</strong></div>
          <div><span>Created</span><strong>${user.created_at ? new Date(user.created_at).toLocaleString() : "Unknown"}</strong></div>
        </div>
      </div>
      <div class="report-edit hidden" id="user-edit-${id}">
        <div class="form-row">
          <div class="form-group">
            <label for="user-name-${id}">Full Name</label>
            <input id="user-name-${id}" class="form-input" value="${escapeHtml(user.name || "")}">
          </div>
          <div class="form-group">
            <label for="user-email-${id}">Email Address</label>
            <input id="user-email-${id}" type="email" class="form-input" value="${escapeHtml(user.email || "")}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="user-role-${id}">Role</label>
            <select id="user-role-${id}" class="form-select">
              <option value="user" ${user.role === "user" ? "selected" : ""}>User</option>
              <option value="admin" ${user.role === "admin" ? "selected" : ""}>Admin</option>
            </select>
          </div>
          <div class="form-group">
            <label for="user-password-${id}">New Password</label>
            <input id="user-password-${id}" type="password" class="form-input" placeholder="Leave blank to keep current password">
          </div>
        </div>
        <div class="edit-actions">
          <button class="btn-sm btn-approve" onclick="saveUser(${id})">Save User</button>
          <button class="btn-sm btn-delete" onclick="hideUserEdit(${id})">Cancel</button>
        </div>
      </div>
    </div>
  `;
}

/* ================= LOGIN ================= */
window.login = async function () {
  try {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await loginAPI(email, password);

    if (!res.token) throw new Error("Login failed");

    localStorage.setItem("token", res.token);
    localStorage.setItem("user", JSON.stringify(res.user));

    window.USER = res.user;
    window.USER.role = res.role || res.user.role;
    updateUserChrome();

    document.getElementById("loginModal").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");

    switchSection("dashboard");

    if (isAdmin()) loadAdminReports();
    if (isAdmin()) loadUsers();
    loadMyReports();
    renderDashboard();

  } catch (err) {
    alert(err.message);
  }
};

/* ================= REGISTER ================= */
window.register = async function () {
  try {
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    await registerAPI(name, email, password);

    alert("Registration successful! Please login.");
    showLogin();

  } catch (err) {
    alert(err.message);
  }
};

/* ================= LOGOUT ================= */
function logout() {
  localStorage.clear();
  location.reload();
}
window.logout = logout;

/* ================= REPORT SUBMIT ================= */
window.submitReport = async function () {
  try {
    const location = document.getElementById("input-location").value.trim();
    const latitude = document.getElementById("input-latitude").value;
    const longitude = document.getElementById("input-longitude").value;
    const description = document.getElementById("input-description").value.trim();
    const severity = document.getElementById("input-severity").value;
    const proofPhoto = document.getElementById("input-proof-photo").files[0];

    if (!location || !description || !severity) {
      throw new Error("Please fill in location, description, and severity.");
    }

    const payload = new FormData();
    payload.append("location", location);
    payload.append("description", description);
    payload.append("severity", severity);
    if (latitude) payload.append("latitude", latitude);
    if (longitude) payload.append("longitude", longitude);
    if (proofPhoto) payload.append("proof_photo", proofPhoto);

    await createReport(payload);

    document.getElementById("input-location").value = "";
    document.getElementById("input-latitude").value = "";
    document.getElementById("input-longitude").value = "";
    document.getElementById("input-description").value = "";
    document.getElementById("input-severity").value = "low";
    document.getElementById("input-proof-photo").value = "";
    setProofLabel();
    setLocationStatus("Manual location");

    const success = document.getElementById("success-message");
    if (success) {
      success.classList.remove("hidden");
      setTimeout(() => success.classList.add("hidden"), 2500);
    }

    await loadMyReports();
    await renderDashboard();
    switchSection("myreports");
  } catch (err) {
    alert(err.message);
  }
};

function setLocationStatus(message, id = null) {
  const status = document.getElementById(id ? "edit-location-status-" + id : "location-status");
  if (status) status.innerText = message;
}

function setCoordinateFields(position, id = null) {
  const lat = position.coords.latitude.toFixed(7);
  const lng = position.coords.longitude.toFixed(7);
  const accuracy = Math.round(position.coords.accuracy);
  const locationValue = `GPS ${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)}`;

  const locationInput = document.getElementById(id ? "edit-location-" + id : "input-location");
  const latitudeInput = document.getElementById(id ? "edit-latitude-" + id : "input-latitude");
  const longitudeInput = document.getElementById(id ? "edit-longitude-" + id : "input-longitude");

  if (locationInput) locationInput.value = locationValue;
  if (latitudeInput) latitudeInput.value = lat;
  if (longitudeInput) longitudeInput.value = lng;

  setLocationStatus(`${Number(lat).toFixed(6)}, ${Number(lng).toFixed(6)} - accuracy ${accuracy}m`, id);
}

function geolocationErrorMessage(error) {
  if (error.code === error.PERMISSION_DENIED) return "Location permission denied";
  if (error.code === error.POSITION_UNAVAILABLE) return "Location unavailable";
  if (error.code === error.TIMEOUT) return "Location request timed out";
  return "Could not get current location";
}

function useCurrentLocation(id = null) {
  if (!navigator.geolocation) {
    setLocationStatus("Geolocation is not supported", id);
    return;
  }

  setLocationStatus("Detecting location...", id);

  navigator.geolocation.getCurrentPosition(
    position => setCoordinateFields(position, id),
    error => setLocationStatus(geolocationErrorMessage(error), id),
    {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 60000
    }
  );
}
window.useCurrentLocation = useCurrentLocation;

function setProofLabel() {
  const input = document.getElementById("input-proof-photo");
  const label = document.getElementById("proof-photo-label");
  if (!input || !label) return;

  label.innerText = input.files[0]?.name || "Attach JPG, PNG, or WebP evidence";
}
window.setProofLabel = setProofLabel;

function updateProofLabel(id) {
  const input = document.getElementById("edit-proof-photo-" + id);
  const label = document.getElementById("edit-proof-photo-label-" + id);
  if (!input || !label) return;

  label.innerText = input.files[0]?.name || "Attach JPG, PNG, or WebP evidence";
}
window.updateProofLabel = updateProofLabel;

/* ================= NAVIGATION ================= */
window.switchSection = function (name) {
  if (name === "admin" && !isAdmin()) {
    switchSection("dashboard");
    return;
  }

  if (name === "users" && !isAdmin()) {
    switchSection("dashboard");
    return;
  }

  document.querySelectorAll('.content-section').forEach(sec => {
    sec.classList.remove('active');
  });

  const target = document.getElementById('section-' + name);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  const activeNav = document.getElementById('nav-' + name);
  if (activeNav) activeNav.classList.add('active');

  const labels = {
    dashboard: "Dashboard",
    report: "Report Issue",
    myreports: "My Reports",
    profile: "Profile",
    users: "Users",
    admin: "Admin Panel"
  };
  const title = document.getElementById("topbar-section-title");
  if (title) title.innerText = labels[name] || "Road Report";

  updateDashboardScope();

  if (name === "admin") loadAdminReports();
  if (name === "myreports") loadMyReports();
  if (name === "profile") loadProfileForm();
  if (name === "users") loadUsers();
  if (name === "dashboard") renderDashboard();
};

/* ================= ADMIN ================= */
async function loadAdminReports() {
  const el = document.getElementById("admin");

  if (!window.USER || window.USER.role !== "admin") {
    el.innerHTML = `
      <div class="access-denied">
        <i data-lucide="lock-keyhole"></i>
        <h3>Access denied</h3>
        <p>Only admin users can operate the response console.</p>
      </div>
    `;
    refreshIcons();
    return;
  }

  try {
    const res = await getAllReports();
    const reports = unwrap(res);
    ADMIN_REPORTS_CACHE = reports;

    if (!reports.length) {
      el.innerHTML = emptyState("No reports found");
      refreshIcons();
      return;
    }

    el.innerHTML = reports.map(r => adminReportCard(r)).join("");
    refreshIcons();
  } catch (err) {
    el.innerHTML = `<p>${err.message}</p>`;
  }
}

/* ================= UPDATE ================= */
async function updateStatus(id, status) {
  await updateReport(id, { status });
  loadAdminReports();
  renderDashboard();
}
window.updateStatus = updateStatus;

/* ================= DELETE ================= */
async function deleteReportAPI(id) {
  await deleteReport(id);
  loadAdminReports();
  renderDashboard();
}
window.deleteReportAPI = deleteReportAPI;

function findAdminReport(id) {
  return ADMIN_REPORTS_CACHE.find(report => Number(report.id) === Number(id));
}

function toggleAdminReportReview(id) {
  const review = document.getElementById("admin-report-review-" + id);
  const edit = document.getElementById("admin-report-edit-" + id);
  if (!review) return;

  if (edit) edit.classList.add("hidden");
  review.classList.toggle("hidden");
}
window.toggleAdminReportReview = toggleAdminReportReview;

function showAdminEditReport(id) {
  const report = findAdminReport(id);
  const edit = document.getElementById("admin-report-edit-" + id);
  const review = document.getElementById("admin-report-review-" + id);
  if (!report || !edit) return;

  if (review) review.classList.add("hidden");
  edit.classList.remove("hidden");
}
window.showAdminEditReport = showAdminEditReport;

function hideAdminEditReport(id) {
  const edit = document.getElementById("admin-report-edit-" + id);
  if (edit) edit.classList.add("hidden");
}
window.hideAdminEditReport = hideAdminEditReport;

async function saveAdminReport(id) {
  try {
    const token = `admin-${id}`;
    const location = document.getElementById("edit-location-" + token).value.trim();
    const latitude = document.getElementById("edit-latitude-" + token).value;
    const longitude = document.getElementById("edit-longitude-" + token).value;
    const description = document.getElementById("edit-description-" + token).value.trim();
    const severity = document.getElementById("edit-severity-" + token).value;
    const status = document.getElementById("edit-status-" + token).value;
    const proofPhoto = document.getElementById("edit-proof-photo-" + token).files[0];

    if (!location || !description || !severity || !status) {
      throw new Error("Please fill in location, description, severity, and status.");
    }

    const payload = new FormData();
    payload.append("location", location);
    payload.append("description", description);
    payload.append("severity", severity);
    payload.append("status", status);
    if (latitude) payload.append("latitude", latitude);
    if (longitude) payload.append("longitude", longitude);
    if (proofPhoto) payload.append("proof_photo", proofPhoto);

    await updateReport(id, payload);
    await loadAdminReports();
    await renderDashboard();
  } catch (err) {
    alert(err.message);
  }
}
window.saveAdminReport = saveAdminReport;

/* ================= MY REPORTS ================= */
async function loadMyReports() {
  const el = document.getElementById("myreports-list");

  try {
    const res = await getMyReports();
    const reports = unwrap(res);
    MY_REPORTS_CACHE = reports;

    if (!reports.length) {
      el.innerHTML = emptyState("No reports found");
      refreshIcons();
      return;
    }

    el.innerHTML = reports.map(r => myReportCard(r)).join("");
    refreshIcons();
  } catch (err) {
    el.innerHTML = `<p>${err.message}</p>`;
  }
}

function findMyReport(id) {
  return MY_REPORTS_CACHE.find(report => Number(report.id) === Number(id));
}

function toggleReportReview(id) {
  const review = document.getElementById("report-review-" + id);
  const edit = document.getElementById("report-edit-" + id);
  if (!review) return;

  if (edit) edit.classList.add("hidden");
  review.classList.toggle("hidden");
}
window.toggleReportReview = toggleReportReview;

function showEditReport(id) {
  const report = findMyReport(id);
  const edit = document.getElementById("report-edit-" + id);
  const review = document.getElementById("report-review-" + id);
  if (!report || !edit) return;

  if (review) review.classList.add("hidden");
  edit.classList.remove("hidden");
}
window.showEditReport = showEditReport;

function hideEditReport(id) {
  const edit = document.getElementById("report-edit-" + id);
  if (edit) edit.classList.add("hidden");
}
window.hideEditReport = hideEditReport;

async function saveMyReport(id) {
  try {
    const location = document.getElementById("edit-location-" + id).value.trim();
    const latitude = document.getElementById("edit-latitude-" + id).value;
    const longitude = document.getElementById("edit-longitude-" + id).value;
    const description = document.getElementById("edit-description-" + id).value.trim();
    const severity = document.getElementById("edit-severity-" + id).value;
    const proofPhoto = document.getElementById("edit-proof-photo-" + id).files[0];

    if (!location || !description || !severity) {
      throw new Error("Please fill in location, description, and severity.");
    }

    const payload = new FormData();
    payload.append("location", location);
    payload.append("description", description);
    payload.append("severity", severity);
    if (latitude) payload.append("latitude", latitude);
    if (longitude) payload.append("longitude", longitude);
    if (proofPhoto) payload.append("proof_photo", proofPhoto);

    await updateReport(id, payload);
    await loadMyReports();
    await renderDashboard();
  } catch (err) {
    alert(err.message);
  }
}
window.saveMyReport = saveMyReport;

/* ================= PROFILE ================= */
function loadProfileForm() {
  if (!window.USER) return;

  const name = document.getElementById("profile-name");
  const email = document.getElementById("profile-email");
  const password = document.getElementById("profile-password");

  if (name) name.value = window.USER.name || "";
  if (email) email.value = window.USER.email || "";
  if (password) password.value = "";
}

async function saveProfile() {
  try {
    const name = document.getElementById("profile-name").value.trim();
    const email = document.getElementById("profile-email").value.trim();
    const password = document.getElementById("profile-password").value;

    if (!name || !email) {
      throw new Error("Please fill in name and email.");
    }

    const payload = { name, email };
    if (password) payload.password = password;

    const res = await updateProfile(payload);
    window.USER = res.user;
    localStorage.setItem("user", JSON.stringify(res.user));
    updateUserChrome();

    const message = document.getElementById("profile-message");
    if (message) {
      message.classList.remove("hidden");
      setTimeout(() => message.classList.add("hidden"), 2500);
    }

    loadProfileForm();
  } catch (err) {
    alert(err.message);
  }
}
window.saveProfile = saveProfile;

/* ================= USERS ================= */
async function loadUsers() {
  const el = document.getElementById("users-list");
  if (!el) return;

  if (!isAdmin()) {
    el.innerHTML = `
      <div class="access-denied">
        <i data-lucide="lock-keyhole"></i>
        <h3>Access denied</h3>
        <p>Only admin users can manage accounts.</p>
      </div>
    `;
    refreshIcons();
    return;
  }

  try {
    const res = await getUsers();
    const users = unwrap(res);
    USERS_CACHE = users;

    if (!users.length) {
      el.innerHTML = emptyState("No users found");
      refreshIcons();
      return;
    }

    el.innerHTML = users.map(user => userCard(user)).join("");
    refreshIcons();
  } catch (err) {
    el.innerHTML = `<p>${err.message}</p>`;
  }
}

function findUser(id) {
  return USERS_CACHE.find(user => Number(user.id) === Number(id));
}

function toggleUserPreview(id) {
  const preview = document.getElementById("user-preview-" + id);
  const edit = document.getElementById("user-edit-" + id);
  if (!preview) return;

  if (edit) edit.classList.add("hidden");
  preview.classList.toggle("hidden");
}
window.toggleUserPreview = toggleUserPreview;

function showUserEdit(id) {
  const user = findUser(id);
  const edit = document.getElementById("user-edit-" + id);
  const preview = document.getElementById("user-preview-" + id);
  if (!user || !edit) return;

  if (preview) preview.classList.add("hidden");
  edit.classList.remove("hidden");
}
window.showUserEdit = showUserEdit;

function hideUserEdit(id) {
  const edit = document.getElementById("user-edit-" + id);
  if (edit) edit.classList.add("hidden");
}
window.hideUserEdit = hideUserEdit;

async function saveUser(id) {
  try {
    const name = document.getElementById("user-name-" + id).value.trim();
    const email = document.getElementById("user-email-" + id).value.trim();
    const role = document.getElementById("user-role-" + id).value;
    const password = document.getElementById("user-password-" + id).value;

    if (!name || !email || !role) {
      throw new Error("Please fill in name, email, and role.");
    }

    const payload = { name, email, role };
    if (password) payload.password = password;

    const res = await updateUser(id, payload);

    if (Number(window.USER?.id) === Number(id)) {
      window.USER = res.data;
      localStorage.setItem("user", JSON.stringify(res.data));
      updateUserChrome();
    }

    await loadUsers();
  } catch (err) {
    alert(err.message);
  }
}
window.saveUser = saveUser;

/* ================= DASHBOARD ================= */
async function renderDashboard() {
  try {
    const res = isAdmin() ? await getAllReports() : await getMyReports();
    const reports = unwrap(res);

    const total = document.getElementById("dash-total");
    const pending = document.getElementById("dash-pending");
    const resolved = document.getElementById("dash-resolved");
    const critical = document.getElementById("dash-critical");

    if (total) total.innerText = reports.length;
    if (pending) {
      pending.innerText = reports.filter(r => r.status === "new" || r.status === "pending").length;
    }

    if (resolved) {
      resolved.innerText = reports.filter(r => r.status === "resolved").length;
    }

    if (critical) {
      critical.innerText = reports.filter(r => r.severity === "critical").length;
    }

    const list = document.getElementById("dashboard-list");
    if (list) {
      list.innerHTML = reports.slice(0, 8).map(r => reportCard(r)).join("") || emptyState("No reports yet");
      refreshIcons();
    }
  } catch (err) {
    const list = document.getElementById("dashboard-list");
    if (list) list.innerHTML = `<p>${err.message}</p>`;
  }
}

/* ================= INIT ================= */
window.onload = () => {
  if (window.USER) {
    document.getElementById("loginModal").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    updateUserChrome();
    switchSection("dashboard");

    if (isAdmin()) loadAdminReports();
    if (isAdmin()) loadUsers();
    loadMyReports();
    renderDashboard();
  }
};

function updateUserChrome() {
  if (!window.USER) return;

  const name = document.getElementById("user-display-name");
  const role = document.getElementById("user-display-role");
  const reporter = document.getElementById("input-reporter");

  if (name) name.innerText = window.USER.name || "User";
  if (role) role.innerText = window.USER.role || "Member";
  if (reporter && !reporter.value) reporter.value = window.USER.name || "";

  const adminNav = document.getElementById("nav-admin");
  const usersNav = document.getElementById("nav-users");
  const adminSection = document.getElementById("section-admin");
  const usersSection = document.getElementById("section-users");

  if (adminNav) adminNav.classList.toggle("hidden", !isAdmin());
  if (usersNav) usersNav.classList.toggle("hidden", !isAdmin());
  if (adminSection) adminSection.setAttribute("aria-hidden", String(!isAdmin()));
  if (usersSection) usersSection.setAttribute("aria-hidden", String(!isAdmin()));
  updateDashboardScope();
}

function updateDashboardScope() {
  const eyebrow = document.getElementById("dashboard-eyebrow");
  const subtitle = document.getElementById("dashboard-subtitle");
  const panelTitle = document.getElementById("dashboard-panel-title");

  if (eyebrow) eyebrow.innerText = isAdmin() ? "Road Network Control" : "Personal Report Control";
  if (subtitle) {
    subtitle.innerText = isAdmin()
      ? "Real-time view of all reported road issues and response status."
      : "Personal view of road issues submitted from your account.";
  }
  if (panelTitle) panelTitle.innerText = isAdmin() ? "Recent Reports" : "My Recent Reports";
}

/* ================= UI TOGGLES ================= */
function showLogin() {
  document.getElementById("loginForm").classList.remove("hidden");
  document.getElementById("registerForm").classList.add("hidden");
}
window.showLogin = showLogin;

function showRegister() {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("registerForm").classList.remove("hidden");
}
window.showRegister = showRegister;
