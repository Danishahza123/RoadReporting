{{-- Legacy migrated page: converted from public/index.html --}}

<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/lucide@0.263.0/dist/umd/lucide.min.js"></script><script src="https://unpkg.com/lucide@latest"></script>

{{-- Legacy assets --}}
<script src="{{ asset('data_sdk.js') }}?v={{ filemtime(public_path('data_sdk.js')) }}"></script>
<script src="{{ asset('app.js') }}?v={{ filemtime(public_path('app.js')) }}"></script>
<link rel="stylesheet" href="{{ asset('index.css') }}?v={{ filemtime(public_path('index.css')) }}">

<!-- ================= LOGIN ================= -->
<div id="loginModal" class="login-modal">
  <div class="login-box">
    <div class="login-grid"></div>

    <div class="login-logo">
      <div class="login-avatar">
        <i data-lucide="map-pin"></i>
      </div>
      <h2>Road Report</h2>
      <p>Urban hazard intelligence console</p>
    </div>

    <div class="tab-toggle">
      <button class="tab-btn active" id="tab-login-btn" onclick="showLogin()">Login</button>
      <button class="tab-btn" id="tab-register-btn" onclick="showRegister()">Register</button>
    </div>

    <!-- LOGIN FORM -->
    <div id="loginForm">
      <p class="login-form-title">Welcome back</p>
      <div class="form-group">
        <label>Email Address</label>
        <div class="input-wrap">
          <i data-lucide="mail" class="input-icon"></i>
          <input id="email" type="email" placeholder="you@example.com" class="form-input with-icon">
        </div>
      </div>
      <div class="form-group">
        <label>Password</label>
        <div class="input-wrap">
          <i data-lucide="lock" class="input-icon"></i>
          <input id="password" type="password" placeholder="••••••••" class="form-input with-icon">
        </div>
      </div>
      <button class="btn-primary" onclick="login()">
        <i data-lucide="log-in"></i>
        <span>Sign In</span>
      </button>
    </div>

    <!-- REGISTER FORM -->
    <div id="registerForm" class="hidden">
      <p class="login-form-title">Create account</p>
      <div class="form-group">
        <label>Full Name</label>
        <div class="input-wrap">
          <i data-lucide="user" class="input-icon"></i>
          <input id="regName" placeholder="Your full name" class="form-input with-icon">
        </div>
      </div>
      <div class="form-group">
        <label>Email Address</label>
        <div class="input-wrap">
          <i data-lucide="mail" class="input-icon"></i>
          <input id="regEmail" type="email" placeholder="you@example.com" class="form-input with-icon">
        </div>
      </div>
      <div class="form-group">
        <label>Password</label>
        <div class="input-wrap">
          <i data-lucide="lock" class="input-icon"></i>
          <input id="regPassword" type="password" placeholder="••••••••" class="form-input with-icon">
        </div>
      </div>
      <button class="btn-primary" onclick="register()">
        <i data-lucide="user-plus"></i>
        <span>Create Account</span>
      </button>
    </div>

  </div>
</div>

<!-- ================= APP ================= -->
<div id="app" class="app-layout hidden">

  <!-- SIDEBAR -->
  <aside class="sidebar" id="sidebar">
    <div class="sidebar-profile">
      <div class="profile-avatar-wrap">
        <div class="profile-avatar">
          <i data-lucide="user"></i>
        </div>
        <div class="online-dot"></div>
      </div>
      <p class="profile-welcome">WELCOME</p>
      <p class="profile-name" id="user-display-name">User</p>
      <p class="profile-role" id="user-display-role">Member</p>
    </div>

    <p class="nav-section-label">NAVIGATION</p>
    <nav class="nav-links">
      <button class="nav-item active" id="nav-dashboard" onclick="switchSection('dashboard')">
        <i data-lucide="layout-dashboard"></i>
        <span>Dashboard</span>
      </button>
      <button class="nav-item" id="nav-report" onclick="switchSection('report')">
        <i data-lucide="file-plus"></i>
        <span>Report Issue</span>
      </button>
      <button class="nav-item" id="nav-myreports" onclick="switchSection('myreports')">
        <i data-lucide="clipboard-list"></i>
        <span>My Reports</span>
      </button>
      <button class="nav-item" id="nav-profile" onclick="switchSection('profile')">
        <i data-lucide="user-cog"></i>
        <span>Profile</span>
      </button>
      <button class="nav-item" id="nav-admin" onclick="switchSection('admin')">
        <i data-lucide="shield-check"></i>
        <span>Admin Panel</span>
      </button>
      <button class="nav-item" id="nav-users" onclick="switchSection('users')">
        <i data-lucide="users-round"></i>
        <span>Users</span>
      </button>
      <button class="nav-item nav-logout" onclick="logout()">
        <i data-lucide="log-out"></i>
        <span>Logout</span>
      </button>
    </nav>

    <div class="sidebar-footer">© 2014 – 2026 Road Report System</div>
  </aside>

  <!-- MAIN LAYOUT -->
  <div class="main-layout">

    <!-- Top Bar -->
    <header class="top-bar">
      <div class="topbar-left">
        <span class="status-chip"><span></span> Live System</span>
        <span class="topbar-title" id="topbar-section-title">Dashboard</span>
      </div>
      <div class="topbar-right">
        <div class="topbar-user-avatar">
          <i data-lucide="user"></i>
        </div>
      </div>
    </header>

    <!-- CONTENT -->
    <main class="content-area">

      <!-- DASHBOARD -->
      <section id="section-dashboard" class="content-section active">
        <div class="section-header command-header">
          <div>
            <p class="eyebrow" id="dashboard-eyebrow">Road Network Control</p>
            <h1 class="section-title">Dashboard</h1>
            <p class="section-subtitle" id="dashboard-subtitle">Real-time view of reported road issues and response status.</p>
          </div>
          <div class="header-telemetry">
            <span>Network Health</span>
            <strong>Active</strong>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card stat-total">
            <div class="stat-icon-wrap"><i data-lucide="database"></i></div>
            <div>
              <p class="stat-label">Total Reports</p>
              <p class="stat-value" id="dash-total">0</p>
            </div>
          </div>
          <div class="stat-card stat-pending">
            <div class="stat-icon-wrap"><i data-lucide="radar"></i></div>
            <div>
              <p class="stat-label">Pending</p>
              <p class="stat-value" id="dash-pending">0</p>
            </div>
          </div>
          <div class="stat-card stat-resolved">
            <div class="stat-icon-wrap"><i data-lucide="shield-check"></i></div>
            <div>
              <p class="stat-label">Resolved</p>
              <p class="stat-value" id="dash-resolved">0</p>
            </div>
          </div>
          <div class="stat-card stat-critical">
            <div class="stat-icon-wrap"><i data-lucide="triangle-alert"></i></div>
            <div>
              <p class="stat-label">Critical</p>
              <p class="stat-value" id="dash-critical">0</p>
            </div>
          </div>
        </div>

        <div class="panel-shell">
          <div class="panel-title">
            <div>
              <p class="eyebrow">Latest Signals</p>
              <h2 id="dashboard-panel-title">Recent Reports</h2>
            </div>
            <i data-lucide="activity"></i>
          </div>
          <div class="reports-list" id="dashboard-list"></div>
        </div>
      </section>

      <!-- REPORT -->
      <section id="section-report" class="content-section">
        <div class="section-header command-header">
          <div>
            <p class="eyebrow">Incident Intake</p>
            <h1 class="section-title">Report Issue</h1>
            <p class="section-subtitle">Submit hazard data directly into the road response queue.</p>
          </div>
        </div>

        <div class="report-layout">
          <div class="form-card">
            <div class="form-card-header">
              <i data-lucide="file-plus-2"></i>
              <h3>New Road Issue</h3>
            </div>
            <div class="form-body">
              <div class="form-group">
                <label for="input-location">Location</label>
                <div class="input-wrap">
                  <i data-lucide="map-pin" class="input-icon"></i>
                  <input id="input-location" placeholder="Jalan Tun Razak, KL" class="form-input with-icon">
                </div>
                <input id="input-latitude" type="hidden">
                <input id="input-longitude" type="hidden">
                <div class="location-actions">
                  <button type="button" class="btn-location" onclick="useCurrentLocation()">
                    <i data-lucide="crosshair"></i>
                    <span>Use Current Location</span>
                  </button>
                  <span id="location-status" class="location-status">Manual location</span>
                </div>
              </div>

              <div class="form-group">
                <label for="input-description">Description</label>
                <textarea id="input-description" placeholder="Describe the pothole, broken light, flood risk, or road damage." class="form-input form-textarea"></textarea>
              </div>

              <div class="form-group">
                <label for="input-proof-photo">Photo Proof</label>
                <label class="file-drop" for="input-proof-photo">
                  <i data-lucide="image-plus"></i>
                  <span id="proof-photo-label">Attach JPG, PNG, or WebP evidence</span>
                </label>
                <input id="input-proof-photo" type="file" accept="image/jpeg,image/png,image/webp" class="file-input" onchange="setProofLabel()">
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="input-severity">Severity</label>
                  <select id="input-severity" class="form-select">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="input-reporter">Reporter</label>
                  <div class="input-wrap">
                    <i data-lucide="user-round" class="input-icon"></i>
                    <input id="input-reporter" placeholder="Auto-linked to your account" class="form-input with-icon">
                  </div>
                </div>
              </div>

              <button class="btn-submit" onclick="submitReport()">
                <i data-lucide="send"></i>
                <span>Transmit Report</span>
              </button>

              <div id="success-message" class="success-alert hidden">
                <i data-lucide="circle-check"></i>
                <div>
                  <p class="success-title">Report submitted</p>
                  <p class="success-sub">The issue is now stored in road_report.</p>
                </div>
              </div>
            </div>
          </div>

          <aside class="intel-card">
            <p class="eyebrow">Priority Matrix</p>
            <h2>Severity Signal</h2>
            <div class="intel-row"><span>Critical</span><strong>Immediate</strong></div>
            <div class="intel-row"><span>High</span><strong>Urgent</strong></div>
            <div class="intel-row"><span>Medium</span><strong>Monitor</strong></div>
            <div class="intel-row"><span>Low</span><strong>Routine</strong></div>
          </aside>
        </div>
      </section>

      <!-- MY REPORTS -->
      <section id="section-myreports" class="content-section">
        <div class="section-header command-header">
          <div>
            <p class="eyebrow">Personal Queue</p>
            <h1 class="section-title">My Reports</h1>
            <p class="section-subtitle">Track every issue submitted from your account.</p>
          </div>
        </div>
        <div class="panel-shell">
          <div class="reports-list" id="myreports-list"></div>
        </div>
      </section>

      <!-- PROFILE -->
      <section id="section-profile" class="content-section">
        <div class="section-header command-header">
          <div>
            <p class="eyebrow">Identity</p>
            <h1 class="section-title">Profile</h1>
            <p class="section-subtitle">Update your account name, email, or password.</p>
          </div>
        </div>
        <div class="form-card profile-card">
          <div class="form-card-header">
            <i data-lucide="user-cog"></i>
            <h3>Account Profile</h3>
          </div>
          <div class="form-body">
            <div class="form-row">
              <div class="form-group">
                <label for="profile-name">Full Name</label>
                <input id="profile-name" class="form-input" placeholder="Your name">
              </div>
              <div class="form-group">
                <label for="profile-email">Email Address</label>
                <input id="profile-email" type="email" class="form-input" placeholder="you@example.com">
              </div>
            </div>
            <div class="form-group">
              <label for="profile-password">New Password</label>
              <input id="profile-password" type="password" class="form-input" placeholder="Leave blank to keep current password">
            </div>
            <button class="btn-submit" onclick="saveProfile()">
              <i data-lucide="save"></i>
              <span>Save Profile</span>
            </button>
            <div id="profile-message" class="success-alert hidden">
              <i data-lucide="circle-check"></i>
              <div>
                <p class="success-title">Profile updated</p>
                <p class="success-sub">Your latest account details are active.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ADMIN -->
      <section id="section-admin" class="content-section">
        <div class="section-header command-header">
          <div>
            <p class="eyebrow">Operations</p>
            <h1 class="section-title">Admin Panel</h1>
            <p class="section-subtitle">Review, resolve, reject, or remove submitted road issues.</p>
          </div>
        </div>
        <div class="panel-shell">
          <div class="reports-list" id="admin"></div>
        </div>
      </section>

      <!-- USERS -->
      <section id="section-users" class="content-section">
        <div class="section-header command-header">
          <div>
            <p class="eyebrow">Access Control</p>
            <h1 class="section-title">Users</h1>
            <p class="section-subtitle">Preview all user accounts and edit their profiles or roles.</p>
          </div>
        </div>
        <div class="panel-shell">
          <div class="reports-list" id="users-list"></div>
        </div>
      </section>

    </main>
  </div>
</div>

<!-- ================= INIT ICONS ================= -->
<script>
document.addEventListener("DOMContentLoaded", function () {
  if (window.lucide) {
    lucide.createIcons();
  }
});
</script>
