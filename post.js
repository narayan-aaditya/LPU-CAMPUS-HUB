/*
 * post.js — POST NOTICE FORM AND MY POSTS (TEACHER ONLY)
 * Lets a teacher create, edit and delete notices. The notice is stored in
 * the browser, so it appears for the same browser only.
 */

/*
 * SECTION 1 — FORM MEMORY AND CIRCULAR NUMBER
 * Remembers the attached files and the notice being edited. The circular
 * number is built automatically from the category, the year and the next free number.
 */
let currentFormAttachments = [];
let editingNoticeId = null;

function getCategoryCircularPrefix(category) {
  const cat = (category || "").toLowerCase();
  if (cat === "exams") return "EXAM";
  if (cat === "fees") return "FEE";
  if (cat === "events") return "EVT";
  if (cat === "placement") return "PLM";
  return "DEP";
}

function getHighestCircularSequence(allNotices, prefix) {
  let highestNum = 0;
  for (let i = 0; i < allNotices.length; i++) {
    const circ = allNotices[i].circular || "";
    const parts = circ.split("/");
    if (parts.length === 3 && parts[0] === prefix) {
      const num = parseInt(parts[2], 10);
      if (!isNaN(num) && num > highestNum) {
        highestNum = num;
      }
    }
  }
  return highestNum;
}

function generateCircularNumber(category) {
  const prefix = getCategoryCircularPrefix(category);
  const currentYear = new Date().getFullYear();
  const allNotices = getAllVisibleNotices();
  const highest = getHighestCircularSequence(allNotices, prefix);
  const nextNum = String(highest + 1).padStart(3, "0");
  return `${prefix}/${currentYear}/${nextNum}`;
}

function updateCircularInput() {
  const catSelect = document.getElementById("postCategory");
  const circInput = document.getElementById("postCircular");
  if (!catSelect || !circInput) return;
  if (!editingNoticeId) {
    circInput.value = generateCircularNumber(catSelect.value);
  }
}

/*
 * SECTION 2 — FILLING AND RESETTING THE FORM
 * Quick expiry buttons, loading an old notice into the form for editing,
 * clearing the form, and drawing the Post Notice page.
 */
function setExpiryQuick(days) {
  const expiryInput = document.getElementById("postExpires");
  if (expiryInput) {
    expiryInput.value = dayOffset(days);
  }
}

function populatePostFormForEdit(notice) {
  document.getElementById("postFormHeading").textContent = "Edit Campus Notice";
  document.getElementById("postSubmitBtn").textContent = "Save Changes";
  document.getElementById("postTitle").value = notice.title || "";
  document.getElementById("postCategory").value = notice.category || "Department";
  document.getElementById("postCircular").value = notice.circular || generateCircularNumber(notice.category);
  document.getElementById("postDepartment").value = notice.department || "";
  document.getElementById("postExpires").value = notice.expires || dayOffset(7);
  document.getElementById("postUrgent").checked = !!notice.urgent;
  document.getElementById("postDescription").value = notice.description || "";
  currentFormAttachments = (notice.attachments || []).slice(0);
}

function resetPostFormToNew(defaultDept) {
  document.getElementById("postFormHeading").textContent = "Create New Campus Notice";
  document.getElementById("postSubmitBtn").textContent = "Publish Notice";
  document.getElementById("postTitle").value = "";
  document.getElementById("postCategory").value = "Department";
  document.getElementById("postCircular").value = generateCircularNumber("Department");
  document.getElementById("postDepartment").value = defaultDept;
  document.getElementById("postExpires").value = dayOffset(14);
  document.getElementById("postUrgent").checked = false;
  document.getElementById("postDescription").value = "";
  currentFormAttachments = [];
}

function renderPostNoticePage(noticeId) {
  if (!isTeacher()) {
    showToast("Notice creation is restricted to faculty members", "warning");
    navigateToHash("#/home");
    return;
  }

  editingNoticeId = noticeId || null;
  const errorBox = document.getElementById("postFormErrors");
  if (errorBox) { errorBox.style.display = "none"; errorBox.innerHTML = ""; }

  const profile = storageLoad("profile", demoTeacherProfile);
  const defaultDept = profile.department || "School of Computer Science & Engineering";

  if (editingNoticeId) {
    const notice = getNoticeById(editingNoticeId);
    if (!notice) {
      showToast("Notice not found for editing", "danger");
      navigateToHash("#/myposts");
      return;
    }
    populatePostFormForEdit(notice);
  } else {
    resetPostFormToNew(defaultDept);
  }

  renderSelectedAttachments();
}

/*
 * SECTION 3 — FILE ATTACHMENTS
 * Reads each chosen file, checks its size and count, stores it inside the
 * notice and lists it on the form with a remove button.
 */
function processFileEntry(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    currentFormAttachments.push({
      name: file.name,
      size: file.size,
      type: file.type || "application/octet-stream",
      data: e.target.result
    });
    renderSelectedAttachments();
  };
  reader.readAsDataURL(file);
}

function handleFileUpload(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  const maxFileSize = 1024 * 1024;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (currentFormAttachments.length >= 3) {
      showToast("Maximum of 3 attachments allowed per circular", "warning");
      break;
    }
    if (file.size > maxFileSize) {
      showToast(`"${file.name}" exceeds the 1MB file size limit`, "danger");
      continue;
    }
    processFileEntry(file);
  }
  event.target.value = "";
}

function removeAttachment(index) {
  currentFormAttachments.splice(index, 1);
  renderSelectedAttachments();
}

function renderSelectedAttachments() {
  const container = document.getElementById("postAttachmentsList");
  if (!container) return;

  if (currentFormAttachments.length === 0) {
    container.innerHTML = `<span class="muted-note">No attachments added yet (Max 3 files, 1MB each).</span>`;
    return;
  }

  container.innerHTML = currentFormAttachments.map(function(att, idx) {
    const sizeKb = Math.round((att.size || 0) / 1024);
    return `
      <div class="attachment-chip">
        <span>📎 ${escapeHtml(att.name)} (${sizeKb} KB)</span>
        <button type="button" class="remove-chip-btn" onclick="removeAttachment(${idx})" title="Remove attachment">✕</button>
      </div>
    `;
  }).join("");
}

/*
 * SECTION 4 — SAVING A NOTICE
 * Reads the form, checks that required fields are filled, then creates a
 * new notice or updates the one being edited, and sends a notification.
 */
function readPostFormData() {
  return {
    title: (document.getElementById("postTitle").value || "").trim(),
    category: document.getElementById("postCategory").value,
    circular: document.getElementById("postCircular").value,
    department: (document.getElementById("postDepartment").value || "").trim(),
    expires: document.getElementById("postExpires").value,
    urgent: document.getElementById("postUrgent").checked,
    description: (document.getElementById("postDescription").value || "").trim()
  };
}

function validatePostFormData(data) {
  const errors = [];
  if (!data.title) errors.push("Please provide a notice title.");
  if (!data.department) errors.push("Please specify the issuing department.");
  if (!data.expires) errors.push("Please select an expiry date.");
  if (data.expires && data.expires < dayOffset(0)) errors.push("Expiry date cannot be in the past.");
  if (!data.description) errors.push("Please enter the circular description and instructions.");
  return errors;
}

function updateExistingNotice(noticeData, noticeId) {
  let userNotices = storageLoad("userNotices", []);
  let found = false;

  for (let i = 0; i < userNotices.length; i++) {
    if (userNotices[i].id === noticeId) {
      Object.assign(userNotices[i], noticeData, { attachments: currentFormAttachments });
      found = true;
      break;
    }
  }

  if (found) {
    storageSave("userNotices", userNotices);
    showToast("Notice updated successfully!", "success");
    navigateToHash(`#/notice/${noticeId}`);
  } else {
    showToast("Demo notices are read-only and cannot be edited", "warning");
  }
}

function createNewNotice(noticeData) {
  const user = getCurrentUser() || demoTeacherProfile;
  const newNoticeId = "notice-user-" + Date.now();
  const newNotice = Object.assign({}, noticeData, {
    id: newNoticeId,
    posted: dayOffset(0),
    attachments: currentFormAttachments,
    isDemo: false,
    postedBy: user.name || "Faculty Member"
  });

  const userNotices = storageLoad("userNotices", []);
  userNotices.unshift(newNotice);
  storageSave("userNotices", userNotices);

  dispatchNewNoticeNotification(noticeData.title, noticeData.description, newNoticeId, noticeData.urgent);
  showToast("Notice published successfully! 🚀", "success");
  navigateToHash(`#/notice/${newNoticeId}`);
}

function dispatchNewNoticeNotification(title, description, noticeId, urgent) {
  const userNotifs = storageLoad("userNotifs", []);
  const shortText = description.length > 90 ? description.substring(0, 90) + "..." : description;

  userNotifs.unshift({
    id: "notif-" + Date.now(),
    type: urgent ? "Urgent" : "New",
    title: (urgent ? "Urgent: " : "New Notice: ") + title,
    text: shortText,
    noticeId: noticeId,
    time: "Just now",
    read: false
  });
  storageSave("userNotifs", userNotifs);
  updateNotificationBadges();
}

function submitNoticeForm(event) {
  if (event) event.preventDefault();

  const data = readPostFormData();
  const errors = validatePostFormData(data);
  const errorBox = document.getElementById("postFormErrors");

  if (errors.length > 0) {
    if (errorBox) {
      errorBox.style.display = "block";
      errorBox.innerHTML = `<ul>${errors.map(function(e) { return `<li>${escapeHtml(e)}</li>`; }).join("")}</ul>`;
    }
    showToast("Please fill in all required fields", "danger");
    return;
  }

  if (editingNoticeId) {
    updateExistingNotice(data, editingNoticeId);
  } else {
    createNewNotice(data);
  }
}

/*
 * SECTION 5 — DELETING AND MY POSTS PAGE
 * Asks for confirmation before deleting, and lists all notices the
 * teacher has posted.
 */
function confirmDeleteNotice(noticeId) {
  showConfirmModal(
    "Delete Notice?",
    "Are you sure you want to permanently delete this notice? This action cannot be undone.",
    function() {
      deleteUserNotice(noticeId);
    }
  );
}

function deleteUserNotice(noticeId) {
  let userNotices = storageLoad("userNotices", []);
  userNotices = userNotices.filter(function(n) { return n.id !== noticeId; });
  storageSave("userNotices", userNotices);

  let saved = storageLoad("saved", demoSavedIds).filter(function(id) { return id !== noticeId; });
  storageSave("saved", saved);

  let recent = storageLoad("recent", demoRecentIds).filter(function(id) { return id !== noticeId; });
  storageSave("recent", recent);

  showToast("Notice deleted successfully", "info");

  if (window.location.hash === "#/myposts") {
    renderMyPostsPage();
  } else {
    navigateToHash("#/notices");
  }
}

function createMyPostCardHtml(notice) {
  const badgeClass = getCategoryBadgeClass(notice.category);
  const deadline = getDeadlineStatus(notice.expires);
  return `
    <div class="notice-card my-post-card">
      <div class="card-header">
        <div class="card-tags">
          <span class="category-tag ${badgeClass}">${escapeHtml(notice.category)}</span>
          ${notice.urgent ? '<span class="urgent-tag">⚡ URGENT</span>' : ''}
        </div>
        <div class="my-post-actions">
          <button class="btn btn-secondary btn-sm" onclick="navigateToHash('#/post/${notice.id}')" title="Edit notice">✏️ Edit</button>
          <button class="btn btn-danger btn-sm" onclick="confirmDeleteNotice('${notice.id}')" title="Delete notice">🗑️</button>
        </div>
      </div>
      <h3 class="card-title" onclick="navigateToHash('#/notice/${notice.id}')">${escapeHtml(notice.title)}</h3>
      <div class="card-meta">
        <span>${escapeHtml(notice.circular)}</span>
        <span class="meta-dot">·</span>
        <span>${escapeHtml(notice.department)}</span>
      </div>
      <p class="card-desc">${escapeHtml(notice.description)}</p>
      <div class="card-footer">
        <span class="meta-date">📅 ${formatDate(notice.posted)}</span>
        <span class="deadline-chip ${deadline.className}">⏳ ${deadline.label}</span>
        <button class="btn btn-outline btn-sm" onclick="navigateToHash('#/notice/${notice.id}')">View Details →</button>
      </div>
    </div>
  `;
}

function renderMyPostsPage() {
  if (!isTeacher()) {
    showToast("My Posts is only available for faculty accounts", "warning");
    navigateToHash("#/home");
    return;
  }

  const container = document.getElementById("myPostsGrid");
  const user = getCurrentUser();
  const userName = user ? user.name : "";
  const allUserNotices = storageLoad("userNotices", []);

  const myNotices = allUserNotices.filter(function(n) {
    return !n.postedBy || n.postedBy === userName || isTeacher();
  });

  if (myNotices.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-icon">📝</p>
        <p class="empty-title">You haven't posted any notices yet</p>
        <p class="empty-subtitle">Publish examination circulars, fee updates, or campus announcements for students.</p>
        <button class="btn btn-primary" onclick="navigateToHash('#/post')">+ Post Your First Notice</button>
      </div>
    `;
    return;
  }

  container.innerHTML = myNotices.map(createMyPostCardHtml).join("");
}
