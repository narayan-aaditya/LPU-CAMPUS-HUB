/*
 * pages.js — NOTIFICATIONS, CALENDAR, PROFILE, SETTINGS AND CONTACT
 * The five smaller pages of the site live here, one section for each.
 * Each section draws its page and runs the buttons on that page.
 */

/*
 * SECTION 1 — PAGE MEMORY
 * Variables that remember what is selected: the notification filter and
 * search text, and the month and date chosen on the calendar.
 */
let activeNotifFilter = "all";
let activeNotifQuery = "";

let calCurrentYear = new Date().getFullYear();
let calCurrentMonth = new Date().getMonth();
let calSelectedDateStr = dayOffset(0);

/*
 * SECTION 2 — NOTIFICATIONS PAGE
 * Collects the notifications (demo ones plus new ones), counts the unread
 * badge on the bell, filters and searches them, marks them as read, and
 * runs the reset options for notifications.
 */
function getAllNotifications() {
  const hideDemo = storageLoad("hideDemoNotifs", false);
  const demoList = hideDemo ? [] : getDemoNotifications();
  const userList = storageLoad("userNotifs", []);
  const readList = storageLoad("readNotifs", []);
  const combined = userList.concat(demoList);

  return combined.map(function(n) {
    const isMarkedRead = readList.indexOf(n.id) !== -1;
    return Object.assign({}, n, { read: n.read || isMarkedRead });
  });
}

function markNotificationAsRead(notifId) {
  let readList = storageLoad("readNotifs", []);
  if (readList.indexOf(notifId) === -1) {
    readList.push(notifId);
    storageSave("readNotifs", readList);
    updateNotificationBadges();
  }
}

function markNotificationReadByNoticeId(noticeId) {
  if (!noticeId) return;
  const list = getAllNotifications();
  for (let i = 0; i < list.length; i++) {
    if (list[i].noticeId === noticeId && !list[i].read) {
      markNotificationAsRead(list[i].id);
    }
  }
}

function markAllNotificationsAsRead() {
  const list = getAllNotifications();
  const readList = list.map(function(n) { return n.id; });
  storageSave("readNotifs", readList);
  updateNotificationBadges();
  renderNotificationsPage();
  showToast("All notifications marked as read! ✔️", "success");
}

function updateNotificationBadges() {
  const list = getAllNotifications();
  let unreadCount = 0;
  for (let i = 0; i < list.length; i++) {
    if (!list[i].read) unreadCount++;
  }

  const headerBadge = document.getElementById("headerNotifBadge");
  const sidebarBadge = document.getElementById("sidebarNotifBadge");

  if (headerBadge) {
    headerBadge.textContent = unreadCount > 99 ? "99+" : unreadCount;
    headerBadge.style.display = unreadCount > 0 ? "flex" : "none";
  }
  if (sidebarBadge) {
    sidebarBadge.textContent = unreadCount > 99 ? "99+" : unreadCount;
    sidebarBadge.style.display = unreadCount > 0 ? "inline-flex" : "none";
  }
}

function updateNotifFilterChipsUI() {
  const chips = document.querySelectorAll("#notifFilterChips .chip-btn");
  for (let i = 0; i < chips.length; i++) {
    const btn = chips[i];
    if (btn.getAttribute("data-filter") === activeNotifFilter) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  }
}

function filterNotificationsList() {
  let list = getAllNotifications();

  if (activeNotifFilter === "unread") {
    list = list.filter(function(n) { return !n.read; });
  } else if (activeNotifFilter !== "all") {
    list = list.filter(function(n) {
      return (n.type || "").toLowerCase() === activeNotifFilter.toLowerCase();
    });
  }

  if (activeNotifQuery) {
    list = list.filter(function(n) {
      return (n.title || "").toLowerCase().indexOf(activeNotifQuery) !== -1 ||
             (n.text || "").toLowerCase().indexOf(activeNotifQuery) !== -1;
    });
  }

  return list;
}

function createNotificationItemHtml(item) {
  let icon = "🔔";
  if (item.type === "Urgent") icon = "⚡";
  else if (item.type === "New") icon = "🆕";
  else if (item.type === "Reminder") icon = "⏰";
  else if (item.type === "System") icon = "⚙️";

  return `
    <div class="notif-item ${item.read ? 'read' : 'unread'}" onclick="handleNotifClick('${item.id}', '${item.noticeId || ''}')">
      <div class="notif-icon-col">${icon}</div>
      <div class="notif-content-col">
        <div class="notif-title-row">
          <h4 class="notif-item-title">${escapeHtml(item.title)}</h4>
          <span class="notif-time">${escapeHtml(item.time)}</span>
        </div>
        <p class="notif-text">${escapeHtml(item.text)}</p>
      </div>
      ${!item.read ? '<span class="unread-dot" title="Unread notification"></span>' : ''}
    </div>
  `;
}

function renderNotificationsPage() {
  const container = document.getElementById("notificationsList");
  const searchInput = document.getElementById("notifSearchInput");
  activeNotifQuery = searchInput ? (searchInput.value || "").trim().toLowerCase() : "";

  updateNotifFilterChipsUI();
  const list = filterNotificationsList();

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-icon">🔔</p>
        <p class="empty-title">No notifications found</p>
        <p class="empty-subtitle">You are all caught up with campus announcements.</p>
        <button class="btn btn-secondary" onclick="setNotifFilter('all')">Clear Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(createNotificationItemHtml).join("");
}

function setNotifFilter(filterType) {
  activeNotifFilter = filterType;
  renderNotificationsPage();
}

function handleNotifClick(notifId, noticeId) {
  markNotificationAsRead(notifId);
  renderNotificationsPage();
  if (noticeId) {
    navigateToHash(`#/notice/${noticeId}`);
  }
}

function resetNotifsData(action) {
  if (action === "hide_demo") {
    showConfirmModal(
      "Remove Demo Notifications?",
      "This will hide default demo notifications. Any alerts triggered by new notices will remain.",
      function() {
        storageSave("hideDemoNotifs", true);
        showToast("Demo notifications hidden", "info");
        renderNotificationsPage();
      }
    );
  } else if (action === "remove_all") {
    showConfirmModal(
      "Remove All Notifications?",
      "This will clear all notifications and alerts from your inbox.",
      function() {
        storageSave("hideDemoNotifs", true);
        storageSave("userNotifs", []);
        storageSave("readNotifs", []);
        showToast("All notifications removed", "warning");
        renderNotificationsPage();
      }
    );
  } else if (action === "restore") {
    showConfirmModal(
      "Restore Demo Notifications?",
      "This will bring back default demo notifications and alerts.",
      function() {
        storageSave("hideDemoNotifs", false);
        storageSave("userNotifs", []);
        storageSave("readNotifs", []);
        showToast("Demo notifications restored! 🔔", "success");
        renderNotificationsPage();
      }
    );
  }
}

/*
 * SECTION 3 — CALENDAR PAGE
 * Draws a month grid with a dot on every date that has a notice.
 * The arrows change the month and clicking a date lists its notices.
 */
function buildNoticeCalendarMap() {
  const allNotices = getAllVisibleNotices();
  const dateMap = {};
  for (let n = 0; n < allNotices.length; n++) {
    const item = allNotices[n];
    if (item.posted) {
      if (!dateMap[item.posted]) dateMap[item.posted] = [];
      dateMap[item.posted].push({ type: "posted", notice: item });
    }
    if (item.expires) {
      if (!dateMap[item.expires]) dateMap[item.expires] = [];
      dateMap[item.expires].push({ type: "expires", notice: item });
    }
  }
  return dateMap;
}

function buildCalendarGridHtml(firstDayIndex, daysInMonth, dateMap, todayStr) {
  let html = "";
  for (let s = 0; s < firstDayIndex; s++) {
    html += `<div class="cal-day cal-empty"></div>`;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = String(d).padStart(2, "0");
    const mStr = String(calCurrentMonth + 1).padStart(2, "0");
    const fullDate = `${calCurrentYear}-${mStr}-${dStr}`;
    const isToday = fullDate === todayStr;
    const isSelected = fullDate === calSelectedDateStr;
    const entries = dateMap[fullDate] || [];
    const hasEvents = entries.length > 0;

    html += `
      <div class="cal-day ${isToday ? 'cal-today' : ''} ${isSelected ? 'cal-selected' : ''} ${hasEvents ? 'has-events' : ''}" onclick="selectCalendarDate('${fullDate}')">
        <span class="day-number">${d}</span>
        ${hasEvents ? `<span class="event-dot" title="${entries.length} notice event(s)"></span>` : ''}
      </div>
    `;
  }
  return html;
}

function renderCalendarPage() {
  const monthNameEl = document.getElementById("calMonthYear");
  const gridEl = document.getElementById("calDaysGrid");
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  monthNameEl.textContent = `${monthNames[calCurrentMonth]} ${calCurrentYear}`;

  const firstDayIndex = new Date(calCurrentYear, calCurrentMonth, 1).getDay();
  const daysInMonth = new Date(calCurrentYear, calCurrentMonth + 1, 0).getDate();
  const todayStr = dayOffset(0);
  const dateMap = buildNoticeCalendarMap();

  gridEl.innerHTML = buildCalendarGridHtml(firstDayIndex, daysInMonth, dateMap, todayStr);
  renderCalendarDateNotices(calSelectedDateStr, dateMap[calSelectedDateStr] || []);
}

function prevCalendarMonth() {
  calCurrentMonth--;
  if (calCurrentMonth < 0) {
    calCurrentMonth = 11;
    calCurrentYear--;
  }
  renderCalendarPage();
}

function nextCalendarMonth() {
  calCurrentMonth++;
  if (calCurrentMonth > 11) {
    calCurrentMonth = 0;
    calCurrentYear++;
  }
  renderCalendarPage();
}

function selectCalendarDate(dateStr) {
  calSelectedDateStr = dateStr;
  renderCalendarPage();
}

function renderCalendarDateNotices(dateStr, entries) {
  const container = document.getElementById("calSelectedDetails");
  const headingEl = document.getElementById("calSelectedHeading");
  if (!container || !headingEl) return;

  headingEl.textContent = `Circulars & Deadlines on ${formatDate(dateStr)}`;

  if (!entries || entries.length === 0) {
    container.innerHTML = `<p class="muted-note">No notices or circular deadlines scheduled for this date.</p>`;
    return;
  }

  container.innerHTML = entries.map(function(entry) {
    const notice = entry.notice;
    const isDeadline = entry.type === "expires";
    return `
      <div class="cal-notice-item" onclick="navigateToHash('#/notice/${notice.id}')">
        <span class="cal-badge ${isDeadline ? 'cal-deadline-badge' : 'cal-posted-badge'}">
          ${isDeadline ? '⏳ Deadline' : '📢 Issued'}
        </span>
        <div class="cal-item-info">
          <p class="cal-item-title">${escapeHtml(notice.title)}</p>
          <span class="cal-item-meta">${escapeHtml(notice.circular)} · ${escapeHtml(notice.department)}</span>
        </div>
        <span class="cal-arrow">→</span>
      </div>
    `;
  }).join("");
}

/*
 * SECTION 4 — PROFILE PAGE
 * Fills the profile form from the saved profile, shows the completeness
 * bar, handles photo upload, remove and reset, and saves the form.
 */
function populateStudentFields(profile) {
  document.getElementById("profStudName").value = profile.name || "";
  document.getElementById("profStudRoll").value = profile.rollNo || "";
  document.getElementById("profStudReg").value = profile.regNo || "";
  document.getElementById("profStudCourse").value = profile.course || "";
  document.getElementById("profStudDept").value = profile.department || "";
  document.getElementById("profStudSection").value = profile.section || "";
  document.getElementById("profStudBatch").value = profile.batch || "";
  document.getElementById("profStudSem").value = profile.semester || "";
  document.getElementById("profStudGender").value = profile.gender || "Male";
  document.getElementById("profStudDob").value = profile.dob || "";
  document.getElementById("profStudEmail").value = profile.email || "";
  document.getElementById("profStudPhone").value = profile.phone || "";
  document.getElementById("profStudAddress").value = profile.address || "";
  document.getElementById("profStudCity").value = profile.city || "";
  document.getElementById("profStudState").value = profile.state || "";
  document.getElementById("profStudPin").value = profile.pin || "";
  document.getElementById("profStudEmerName").value = profile.emergencyContact || "";
  document.getElementById("profStudEmerPhone").value = profile.emergencyPhone || "";
}

function populateTeacherFields(profile) {
  document.getElementById("profTeachName").value = profile.name || "";
  document.getElementById("profTeachEmpId").value = profile.empId || "";
  document.getElementById("profTeachDesig").value = profile.designation || "";
  document.getElementById("profTeachDept").value = profile.department || "";
  document.getElementById("profTeachSubjects").value = profile.subjects || "";
  document.getElementById("profTeachCabin").value = profile.cabin || "";
  document.getElementById("profTeachEmail").value = profile.email || "";
  document.getElementById("profTeachPhone").value = profile.phone || "";
  document.getElementById("profTeachAddress").value = profile.address || "";
}

function renderProfilePage() {
  const user = getCurrentUser() || demoStudentProfile;
  const isTeacherUser = user.role === "Teacher";
  const defaultProfile = isTeacherUser ? demoTeacherProfile : demoStudentProfile;
  const profile = storageLoad("profile", defaultProfile);

  document.getElementById("profileHeaderName").textContent = profile.name || user.name || "Student User";
  document.getElementById("profileHeaderRole").textContent = profile.role || user.role || "Student";
  document.getElementById("profileHeaderDept").textContent = profile.department || "LPU Campus";

  const avatarBox = document.getElementById("profileAvatarBox");
  renderUserAvatar(avatarBox, profile);

  const studentForm = document.getElementById("profileStudentFields");
  const teacherForm = document.getElementById("profileTeacherFields");
  if (studentForm && teacherForm) {
    studentForm.style.display = isTeacherUser ? "none" : "block";
    teacherForm.style.display = isTeacherUser ? "block" : "none";
  }

  if (isTeacherUser) {
    populateTeacherFields(profile);
  } else {
    populateStudentFields(profile);
  }

  updateProfileMeter(profile, isTeacherUser);
}

function updateProfileMeter(profile, isTeacherUser) {
  const fields = isTeacherUser
    ? ["name", "empId", "designation", "department", "subjects", "cabin", "email", "phone", "address"]
    : ["name", "rollNo", "regNo", "course", "department", "section", "batch", "semester", "gender", "dob", "email", "phone", "address", "city", "state", "pin", "emergencyContact", "emergencyPhone"];

  let filled = 0;
  for (let i = 0; i < fields.length; i++) {
    if (profile[fields[i]] && String(profile[fields[i]]).trim() !== "") filled++;
  }
  const pct = Math.round((filled / fields.length) * 100);

  const fillBar = document.getElementById("profileMeterFill");
  const pctText = document.getElementById("profileMeterPercent");
  if (fillBar) fillBar.style.width = pct + "%";
  if (pctText) pctText.textContent = pct + "% Complete";
}

function cropImageToSquareCanvas(img) {
  const canvas = document.createElement("canvas");
  canvas.width = 200;
  canvas.height = 200;
  const ctx = canvas.getContext("2d");
  const minDim = Math.min(img.width, img.height);
  const startX = (img.width - minDim) / 2;
  const startY = (img.height - minDim) / 2;
  ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, 200, 200);
  return canvas.toDataURL("image/jpeg", 0.85);
}

function handleProfilePhotoUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const dataUrl = cropImageToSquareCanvas(img);
      const profile = storageLoad("profile", demoStudentProfile);
      profile.avatar = dataUrl;
      storageSave("profile", profile);

      updateAuthUI();
      renderProfilePage();
      showToast("Profile photo updated! 📸", "success");
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  event.target.value = "";
}

function removeProfilePhoto() {
  const profile = storageLoad("profile", demoStudentProfile);
  profile.avatar = "";
  storageSave("profile", profile);
  updateAuthUI();
  renderProfilePage();
  showToast("Profile photo removed", "info");
}

function resetProfileToConfig() {
  const isTeacherUser = isTeacher();
  const baseProfile = isTeacherUser ? demoTeacherProfile : demoStudentProfile;
  storageSave("profile", Object.assign({}, baseProfile));
  const user = getCurrentUser();
  if (user) {
    user.name = baseProfile.name;
    storageSave("user", user);
  }
  updateAuthUI();
  renderProfilePage();
  showToast("Profile reset to config.js defaults! 🔄", "success");
}

function readStudentFormFields(profile) {
  profile.name = (document.getElementById("profStudName").value || "").trim() || "Student";
  profile.rollNo = document.getElementById("profStudRoll").value.trim();
  profile.regNo = document.getElementById("profStudReg").value.trim();
  profile.course = document.getElementById("profStudCourse").value.trim();
  profile.department = document.getElementById("profStudDept").value.trim();
  profile.section = document.getElementById("profStudSection").value.trim();
  profile.batch = document.getElementById("profStudBatch").value.trim();
  profile.semester = document.getElementById("profStudSem").value.trim();
  profile.gender = document.getElementById("profStudGender").value;
  profile.dob = document.getElementById("profStudDob").value;
  profile.email = document.getElementById("profStudEmail").value.trim();
  profile.phone = document.getElementById("profStudPhone").value.trim();
  profile.address = document.getElementById("profStudAddress").value.trim();
  profile.city = document.getElementById("profStudCity").value.trim();
  profile.state = document.getElementById("profStudState").value.trim();
  profile.pin = document.getElementById("profStudPin").value.trim();
  profile.emergencyContact = document.getElementById("profStudEmerName").value.trim();
  profile.emergencyPhone = document.getElementById("profStudEmerPhone").value.trim();
}

function readTeacherFormFields(profile) {
  profile.name = (document.getElementById("profTeachName").value || "").trim() || "Faculty Member";
  profile.empId = document.getElementById("profTeachEmpId").value.trim();
  profile.designation = document.getElementById("profTeachDesig").value.trim();
  profile.department = document.getElementById("profTeachDept").value.trim();
  profile.subjects = document.getElementById("profTeachSubjects").value.trim();
  profile.cabin = document.getElementById("profTeachCabin").value.trim();
  profile.email = document.getElementById("profTeachEmail").value.trim();
  profile.phone = document.getElementById("profTeachPhone").value.trim();
  profile.address = document.getElementById("profTeachAddress").value.trim();
}

function saveProfileForm(event) {
  if (event) event.preventDefault();
  const user = getCurrentUser() || demoStudentProfile;
  const isTeacherUser = user.role === "Teacher";
  const profile = storageLoad("profile", isTeacherUser ? demoTeacherProfile : demoStudentProfile);

  if (isTeacherUser) {
    readTeacherFormFields(profile);
  } else {
    readStudentFormFields(profile);
  }

  storageSave("profile", profile);
  if (user) {
    user.name = profile.name;
    storageSave("user", user);
  }

  updateAuthUI();
  renderProfilePage();
  showToast("Profile details saved successfully! 💾", "success");
}

/*
 * SECTION 5 — SETTINGS PAGE
 * Dark mode, accent colour, text size and compact mode, notification
 * preferences, and the buttons that clear history, saved notices or all sample data.
 */
function renderAppearanceControls() {
  const isDark = storageLoad("dark", false);
  const darkToggle = document.getElementById("settingDarkMode");
  if (darkToggle) darkToggle.checked = isDark;

  const currentAccent = storageLoad("accent", "#5b5ef0");
  const swatches = document.querySelectorAll(".accent-swatch");
  for (let i = 0; i < swatches.length; i++) {
    const sw = swatches[i];
    if (sw.getAttribute("data-color") === currentAccent) {
      sw.classList.add("active");
    } else {
      sw.classList.remove("active");
    }
  }

  const currentSize = storageLoad("textSize", "medium");
  const sizeSelect = document.getElementById("settingTextSize");
  if (sizeSelect) sizeSelect.value = currentSize;

  const isCompact = storageLoad("compact", false);
  const compactToggle = document.getElementById("settingCompactMode");
  if (compactToggle) compactToggle.checked = isCompact;
}

function renderNotificationPreferences() {
  const toggles = storageLoad("toggles", {
    newNotices: true,
    urgentAlerts: true,
    deadlineReminders: true,
    showRecent: true
  });
  if (document.getElementById("settingNewNotices")) {
    document.getElementById("settingNewNotices").checked = toggles.newNotices !== false;
    document.getElementById("settingUrgentAlerts").checked = toggles.urgentAlerts !== false;
    document.getElementById("settingDeadlineReminders").checked = toggles.deadlineReminders !== false;
    document.getElementById("settingShowRecent").checked = toggles.showRecent !== false;
  }

  const followed = storageLoad("followed", ["Department", "Exams", "Fees", "Events", "Placement"]);
  const followBoxes = document.querySelectorAll(".follow-cat-checkbox");
  for (let j = 0; j < followBoxes.length; j++) {
    const box = followBoxes[j];
    box.checked = followed.indexOf(box.value) !== -1;
  }
}

function renderSettingsPage() {
  renderAppearanceControls();
  renderNotificationPreferences();
}

function toggleDarkMode(enabled) {
  storageSave("dark", enabled);
  if (enabled) {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
  showToast(enabled ? "Dark mode activated 🌙" : "Light mode activated ☀️", "info");
}

function setAccentColor(colorHex) {
  storageSave("accent", colorHex);
  document.documentElement.style.setProperty("--accent", colorHex);
  renderSettingsPage();
  showToast("Accent colour updated! 🎨", "success");
}

function setTextSize(size) {
  storageSave("textSize", size);
  document.body.classList.remove("text-small", "text-medium", "text-large");
  document.body.classList.add(`text-${size}`);
  showToast(`Text size set to ${size}`, "info");
}

function toggleCompactMode(enabled) {
  storageSave("compact", enabled);
  if (enabled) {
    document.body.classList.add("compact-mode");
  } else {
    document.body.classList.remove("compact-mode");
  }
  showToast(enabled ? "Compact card view enabled" : "Standard card view enabled", "info");
}

function saveNotificationToggles() {
  const toggles = {
    newNotices: document.getElementById("settingNewNotices").checked,
    urgentAlerts: document.getElementById("settingUrgentAlerts").checked,
    deadlineReminders: document.getElementById("settingDeadlineReminders").checked,
    showRecent: document.getElementById("settingShowRecent").checked
  };
  storageSave("toggles", toggles);

  const boxes = document.querySelectorAll(".follow-cat-checkbox");
  const followed = [];
  for (let i = 0; i < boxes.length; i++) {
    if (boxes[i].checked) followed.push(boxes[i].value);
  }
  storageSave("followed", followed);
  showToast("Preferences saved! ⚙️", "success");
}

function clearRecentHistory() {
  storageSave("recent", []);
  showToast("Recently viewed history cleared", "info");
}

function clearSavedBookmarks() {
  storageSave("saved", []);
  updateSavedBadges();
  showToast("Saved bookmarks cleared", "info");
}

function resetAllSampleData() {
  showConfirmModal(
    "Reset All Sample Data?",
    "This will reset all notices, notifications, saved bookmarks, and recent history back to their initial state.",
    function() {
      storageRemove("hideDemoNotices");
      storageRemove("userNotices");
      storageRemove("hideDemoNotifs");
      storageRemove("userNotifs");
      storageRemove("readNotifs");
      storageSave("saved", demoSavedIds);
      storageSave("recent", demoRecentIds);
      updateNotificationBadges();
      updateSavedBadges();
      showToast("All sample data successfully reset! 🔄", "success");
      navigateToHash("#/home");
    }
  );
}

/*
 * SECTION 6 — CONTACT US PAGE
 * Shows the user's details and the help desk details, builds the email text
 * from the form, and opens the email app when Send Email is clicked.
 */
function renderContactPage() {
  const profile = storageLoad("profile", demoStudentProfile);
  const user = getCurrentUser() || demoStudentProfile;
  const isTeacherUser = user.role === "Teacher";

  document.getElementById("contactUserName").textContent = profile.name || user.name || "Student User";
  document.getElementById("contactUserRole").textContent = profile.role || user.role || "Student";
  document.getElementById("contactUserId").textContent = isTeacherUser ? (profile.empId || "N/A") : (profile.rollNo || "N/A");
  document.getElementById("contactUserDept").textContent = profile.department || "LPU Campus";
  document.getElementById("contactUserEmail").textContent = profile.email || "student@lpu.in";
  document.getElementById("contactUserPhone").textContent = profile.phone || "+91 98765 43210";

  document.getElementById("contactPreviewTo").textContent = config.helpEmail || "support@lpu.co.in";
  document.getElementById("contactPreviewFrom").textContent = profile.email || "student@lpu.in";

  document.getElementById("helpDeskEmail").textContent = config.helpEmail;
  document.getElementById("helpDeskPhone").textContent = config.helpPhone;
  document.getElementById("helpDeskHours").textContent = config.helpHours;
  document.getElementById("helpDeskLocation").textContent = config.campusLocation;
}

function formatSupportEmailBody(profile, user, idValue, dept, issue, priority, desc) {
  let body = `LPU CAMPUS HUB — GRIEVANCE / INQUIRY TICKET\n`;
  body += `==============================================\n`;
  body += `Applicant Name: ${profile.name || user.name}\n`;
  body += `Role: ${user.role} | ID: ${idValue}\n`;
  body += `Department: ${profile.department || "LPU"}\n`;
  body += `Phone: ${profile.phone || "N/A"}\n`;
  body += `Category: ${dept} | Issue: ${issue} | Priority: ${priority}\n`;
  body += `==============================================\n\n`;
  body += `Description:\n${desc}\n\n`;
  body += `Submitted via LPU Campus Hub (Notice & Circular Management System)`;
  if (body.length > 1750) {
    body = body.substring(0, 1750) + "\n...[truncated]";
  }
  return body;
}

function sendContactEmail(event) {
  if (event) event.preventDefault();

  const dept = document.getElementById("contactDept").value;
  const issue = document.getElementById("contactIssue").value;
  const priority = document.getElementById("contactPriority").value;
  const subject = (document.getElementById("contactSubject").value || "").trim();
  const desc = (document.getElementById("contactMessage").value || "").trim();

  if (!subject || !desc) {
    showToast("Please provide both a subject and issue description", "danger");
    return;
  }

  const profile = storageLoad("profile", demoStudentProfile);
  const user = getCurrentUser() || demoStudentProfile;
  const idValue = user.role === "Teacher" ? (profile.empId || "Faculty") : (profile.rollNo || "Student");

  const emailSubject = `[${issue}] ${subject} — ${profile.name || user.name} (${idValue})`;
  const emailBody = formatSupportEmailBody(profile, user, idValue, dept, issue, priority, desc);
  const mailtoUrl = `mailto:${encodeURIComponent(config.helpEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  window.location.href = mailtoUrl;
  showToast("Opening email application to dispatch inquiry... ✉️", "success");
}
