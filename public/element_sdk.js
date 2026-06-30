const USER = {
  name: null,
  role: null
};

function initUI() {
  const user = JSON.parse(localStorage.getItem("user"));

  USER.name = user.name;
  USER.role = user.role;

  document.getElementById("loginModal").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");

  if (USER.role !== "admin") {
    document.getElementById("adminBtn").style.display = "none";
  }

  loadData();
}

function logout() {
  localStorage.clear();
  location.reload();
}