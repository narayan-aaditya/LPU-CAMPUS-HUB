/*
 * auth.js — LOGIN, LOGOUT AND CURRENT USER
 * Knows who is logged in (student or teacher), logs people in and out, and
 * updates the name and photo in the top bar. Profiles come from config.js through data.js.
 */

/*
 * SECTION 1 — WHO IS LOGGED IN
 * Small checks used all over the site: the current user, is anyone
 * logged in, and is that user a teacher.
 */
function getCurrentUser() {
  return storageLoad("user", null);
}

function isLoggedIn() {
  return getCurrentUser() !== null;
}

function isTeacher() {
  const user = getCurrentUser();
  return user && user.role === "Teacher";
}

/*
 * SECTION 2 — LOGIN AND LOGOUT
 * Normal login with a name and role, the two demo buttons, and logout.
 */
function loginUser(name, role) {
  const cleanName = (name || "").trim() || "Guest";

  const userRole = role === "Teacher" ? "Teacher" : "Student";

  const userObj = {
    name: cleanName,
    role: userRole,
    loginTime: new Date().toISOString()
  };
  storageSave("user", userObj);

  let currentProfile = storageLoad("profile", null);
  if (!currentProfile || currentProfile.role !== userRole) {
    const baseProfile = userRole === "Teacher" ? demoTeacherProfile : demoStudentProfile;
    const newProfile = Object.assign({}, baseProfile, { name: cleanName, role: userRole });
    storageSave("profile", newProfile);
  } else {
    currentProfile.name = cleanName;
    storageSave("profile", currentProfile);
  }

  updateAuthUI();
  navigateToHash("#/home");
}

function loginAsDemoStudent() {
  storageSave("profile", Object.assign({}, demoStudentProfile));
  storageSave("user", { name: demoStudentProfile.name, role: "Student" });
  updateAuthUI();
  showToast("Logged in as Demo Student!", "info");
  navigateToHash("#/home");
}

function loginAsDemoTeacher() {
  storageSave("profile", Object.assign({}, demoTeacherProfile));
  storageSave("user", { name: demoTeacherProfile.name, role: "Teacher" });
  updateAuthUI();
  showToast("Logged in as Demo Teacher!", "info");
  navigateToHash("#/home");
}

function logoutUser() {
  storageRemove("user");
  updateAuthUI();
  navigateToHash("#/login");
  showToast("Logged out successfully", "info");
}

/*
 * SECTION 3 — PROFILE SYNC AND TOP BAR
 * If config.js changed (new version), replaces the saved profile with the
 * new one. Then updates the top bar name, role and avatar.
 */
function syncConfigProfiles() {
  if (typeof config === "undefined") return;

  const hashObj = {
    s: config.studentProfile ? config.studentProfile.name : "",
    t: config.teacherProfile ? config.teacherProfile.name : "",
    v: config.version || ""
  };
  const currentHash = JSON.stringify(hashObj);
  const savedHash = storageLoad("config_hash", "");

  if (currentHash !== savedHash) {
    storageSave("config_hash", currentHash);
    const currentUser = getCurrentUser();
    if (currentUser) {
      const isTeacherUser = currentUser.role === "Teacher";
      const fresh = isTeacherUser ? demoTeacherProfile : demoStudentProfile;
      storageSave("profile", Object.assign({}, fresh));
      currentUser.name = fresh.name;
      storageSave("user", currentUser);
    }
  }
}

function updateAuthUI() {
  syncConfigProfiles();

  const user = getCurrentUser();

  const topBar = document.getElementById("topBar");
  const leftSidebar = document.getElementById("leftSidebar");
  const breadcrumbBar = document.getElementById("breadcrumbBar");
  const teacherControls = document.querySelectorAll(".teacher-only");

  if (!user) {
    if (topBar) topBar.style.display = "none";
    if (leftSidebar) leftSidebar.style.display = "none";
    if (breadcrumbBar) breadcrumbBar.style.display = "none";
    document.body.classList.add("not-logged-in");
    return;
  }

  document.body.classList.remove("not-logged-in");
  if (topBar) topBar.style.display = "flex";
  if (leftSidebar) leftSidebar.style.display = "flex";

  const profile = storageLoad("profile", user);
  const userNameEl = document.getElementById("headerUserName");
  const userRoleEl = document.getElementById("headerUserRole");
  const avatarEl = document.getElementById("headerAvatar");

  if (userNameEl) userNameEl.textContent = profile.name || user.name || "TEAM WebX";
  if (userRoleEl) userRoleEl.textContent = profile.role || user.role || "Student";
  if (avatarEl) renderUserAvatar(avatarEl, profile);

  const isTeacherUser = user.role === "Teacher";
  for (let i = 0; i < teacherControls.length; i++) {
    teacherControls[i].style.display = isTeacherUser ? "" : "none";
  }
}

function renderUserAvatar(containerEl, profile) {
  if (!containerEl) return;
  if (profile && profile.avatar) {
    containerEl.innerHTML = '<img src="' + profile.avatar + '" alt="' + escapeHtml(profile.name) + '" class="avatar-img">';
  } else {
    const initial = ((profile && profile.name) || "W").trim().charAt(0).toUpperCase();
    containerEl.innerHTML = '<span class="avatar-initial">' + initial + '</span>';
  }
}
