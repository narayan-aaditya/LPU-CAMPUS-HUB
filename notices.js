/*
 * notices.js — HOME PAGE, NOTICES PAGE, NOTICE DETAILS AND SAVED NOTICES
 * Everything about showing notices lives here: the cards, the category
 * filter buttons, sorting, the details page, bookmarks and the data reset options.
 * The sample text comes from data.js and the images from config.js.
 */

/*
 * SECTION 1 — GETTING NOTICES AND KEEPING TRACK OF THEM
 * activeNoticesFilter and activeNoticesSort remember which category button
 * and sort option are selected. The functions below collect all notices
 * (demo ones plus ones a teacher posted), find one by its id, count the
 * numbers shown on the Home stat cards, and handle saved (starred) and
 * recently viewed notices.
 */
let activeNoticesFilter = "all";
let activeNoticesSort = "newest";

function getAllVisibleNotices() {
  const hideDemo = storageLoad("hideDemoNotices", false);
  const demoList = hideDemo ? [] : getDemoNotices();
  const userList = storageLoad("userNotices", []);
  const combined = demoList.concat(userList);

  const todayStr = dayOffset(0);
  return combined.filter(function(notice) {
    if (!notice.expires) return true;
    return notice.expires >= todayStr;
  });
}

function getNoticeById(id) {
  const list = getAllVisibleNotices();
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return null;
}

function calculateNoticeStats() {
  const notices = getAllVisibleNotices();
  let urgentCount = 0;
  let weekCount = 0;
  let newCount = 0;

  for (let i = 0; i < notices.length; i++) {
    const item = notices[i];
    if (item.urgent) urgentCount++;
    const daysSincePosted = getDaysRemaining(item.posted);
    if (daysSincePosted >= -7 && daysSincePosted <= 0) weekCount++;
    if (daysSincePosted >= -3 && daysSincePosted <= 0) newCount++;
  }

  return {
    total: notices.length,
    urgent: urgentCount,
    thisWeek: weekCount,
    isNew: newCount
  };
}

function isNoticeSaved(noticeId) {
  const savedIds = storageLoad("saved", demoSavedIds);
  return savedIds.indexOf(noticeId) !== -1;
}

function toggleSaveNotice(noticeId, event) {
  if (event) event.stopPropagation();
  let savedIds = storageLoad("saved", demoSavedIds);
  const index = savedIds.indexOf(noticeId);

  if (index === -1) {
    savedIds.push(noticeId);
    showToast("Notice saved to bookmarks ⭐", "success");
  } else {
    savedIds.splice(index, 1);
    showToast("Notice removed from bookmarks", "info");
  }

  storageSave("saved", savedIds);
  updateSavedBadges();

  const currentHash = window.location.hash;
  if (currentHash === "#/saved") {
    renderSavedPage();
  } else if (currentHash.indexOf("#/notices") === 0) {
    renderNoticesPage(activeNoticesFilter);
  } else if (currentHash === "#/home") {
    renderHomePage();
  }
}

function recordRecentlyViewed(noticeId) {
  let recentIds = storageLoad("recent", demoRecentIds);
  recentIds = recentIds.filter(function(id) { return id !== noticeId; });
  recentIds.unshift(noticeId);
  if (recentIds.length > 5) {
    recentIds = recentIds.slice(0, 5);
  }
  storageSave("recent", recentIds);
}

/*
 * SECTION 2 — NOTICE CARD
 * Builds the HTML of one notice card. Home, Notices and Saved all reuse it,
 * so changing the card here changes it everywhere.
 */
function createNoticeCardHtml(notice) {
  const saved = isNoticeSaved(notice.id);
  const badgeClass = getCategoryBadgeClass(notice.category);
  const deadline = getDeadlineStatus(notice.expires);
  const daysSincePosted = getDaysRemaining(notice.posted);
  const isPulseNew = daysSincePosted >= -3 && daysSincePosted <= 0;
  const attachCount = notice.attachments ? notice.attachments.length : 0;

  return `
    <article class="notice-card" onclick="navigateToHash('#/notice/${notice.id}')" tabindex="0" role="button" aria-label="${escapeHtml(notice.title)}">
      <div class="card-header">
        <div class="card-tags">
          <span class="category-tag ${badgeClass}">${escapeHtml(notice.category)}</span>
          ${notice.urgent ? '<span class="urgent-tag">⚡ URGENT</span>' : ''}
          ${isPulseNew ? '<span class="pulse-new-badge">NEW</span>' : ''}
        </div>
        <button type="button" class="save-star-btn ${saved ? 'saved' : ''}" onclick="toggleSaveNotice('${notice.id}', event)" title="${saved ? 'Remove bookmark' : 'Save bookmark'}">
          ${saved ? '★' : '☆'}
        </button>
      </div>
      <h3 class="card-title">${escapeHtml(notice.title)}</h3>
      <div class="card-meta">
        <span class="meta-circular">${escapeHtml(notice.circular)}</span>
        <span class="meta-dot">·</span>
        <span class="meta-dept">${escapeHtml(notice.department)}</span>
      </div>
      <p class="card-desc">${escapeHtml(notice.description)}</p>
      <div class="card-footer">
        <div class="footer-left">
          <span class="meta-date">📅 ${formatDate(notice.posted)}</span>
          <span class="deadline-chip ${deadline.className}">⏳ ${deadline.label}</span>
          ${attachCount > 0 ? `<span class="attach-chip" title="${attachCount} file attached">📎 ${attachCount}</span>` : ''}
        </div>
        <span class="view-link">View Details →</span>
      </div>
    </article>
  `;
}

/*
 * SECTION 3 — HOME PAGE
 * Draws everything on Home: the greeting with the campus banner, the stat
 * cards, the category buttons with the latest notices, and the right-hand
 * widgets (urgent notice, recently viewed, quote of the day, Stay Connected card).
 */
function getTimeGreeting() {
  const hours = new Date().getHours();
  if (hours >= 12 && hours < 17) return "Good Afternoon";
  if (hours >= 17) return "Good Evening";
  return "Good Morning";
}

function renderHomePage() {
  const user = getCurrentUser();
  const userName = user ? user.name : "TEAM WebX";
  const greetingEl = document.getElementById("homeGreeting");
  const bannerBgEl = document.getElementById("homeBannerBg");

  if (greetingEl) {
    greetingEl.innerHTML = `${getTimeGreeting()}, <span class="highlight-user">${escapeHtml(userName)}</span>! 👋`;
  }
  if (bannerBgEl && config.images && config.images.banner) {
    bannerBgEl.style.backgroundImage = `url('${config.images.banner}')`;
  }

  const stats = calculateNoticeStats();
  document.getElementById("statTotalCount").textContent = stats.total;
  document.getElementById("statUrgentCount").textContent = stats.urgent;
  document.getElementById("statWeekCount").textContent = stats.thisWeek;
  document.getElementById("statNewCount").textContent = stats.isNew;

  renderHomeLatestNotices("all");
  renderHomeUrgentWidget();
  renderHomeRecentlyViewed();
  renderHomeQuoteWidget();
  setupStayConnectedCard();
}

function highlightHomeCategoryButton(categoryFilter) {
  const buttons = document.querySelectorAll("#homeCategoryFilters .cat-btn");
  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i];
    if (btn.getAttribute("data-cat") === categoryFilter) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  }
}

function renderHomeLatestNotices(categoryFilter) {
  const container = document.getElementById("homeLatestGrid");
  highlightHomeCategoryButton(categoryFilter);

  let notices = getAllVisibleNotices();
  if (categoryFilter && categoryFilter !== "all") {
    notices = notices.filter(function(n) {
      return (n.category || "").toLowerCase() === categoryFilter.toLowerCase();
    });
  }

  notices.sort(function(a, b) {
    return new Date(b.posted) - new Date(a.posted);
  });
  const topSix = notices.slice(0, 6);

  if (topSix.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-icon">📭</p>
        <p class="empty-title">No notices found</p>
        <p class="empty-subtitle">There are currently no circulars in the "${escapeHtml(categoryFilter)}" category.</p>
        <button class="btn btn-secondary btn-sm" onclick="renderHomeLatestNotices('all')">View All Notices</button>
      </div>
    `;
    return;
  }

  container.innerHTML = topSix.map(createNoticeCardHtml).join("");
}

function renderHomeUrgentWidget() {
  const container = document.getElementById("homeUrgentBox");
  if (!container) return;
  const notices = getAllVisibleNotices();
  const urgentList = notices.filter(function(n) { return n.urgent; });
  urgentList.sort(function(a, b) { return new Date(b.posted) - new Date(a.posted); });

  if (urgentList.length === 0) {
    container.innerHTML = `<p class="muted-note">No active urgent notices right now.</p>`;
    return;
  }

  const topUrgent = urgentList[0];
  container.innerHTML = `
    <div class="urgent-highlight-card" onclick="navigateToHash('#/notice/${topUrgent.id}')">
      <div class="urgent-pill-row">
        <span class="urgent-tag">⚡ URGENT</span>
        <span class="category-tag ${getCategoryBadgeClass(topUrgent.category)}">${escapeHtml(topUrgent.category)}</span>
      </div>
      <h4 class="urgent-card-title">${escapeHtml(topUrgent.title)}</h4>
      <p class="urgent-card-desc">${escapeHtml(topUrgent.description)}</p>
      <div class="urgent-card-foot">
        <span>📅 ${formatDate(topUrgent.posted)}</span>
        <span class="urgent-link">Read circular →</span>
      </div>
    </div>
  `;
}

function renderHomeRecentlyViewed() {
  const container = document.getElementById("homeRecentList");
  if (!container) return;
  const showRecent = storageLoad("toggles", { showRecent: true }).showRecent !== false;

  if (!showRecent) {
    container.innerHTML = `<p class="muted-note">Recently viewed notices are turned off in Settings.</p>`;
    return;
  }

  const recentIds = storageLoad("recent", demoRecentIds);
  const items = [];
  for (let i = 0; i < recentIds.length; i++) {
    const item = getNoticeById(recentIds[i]);
    if (item) items.push(item);
  }

  if (items.length === 0) {
    container.innerHTML = `<p class="muted-note">No recently viewed notices yet.</p>`;
    return;
  }

  container.innerHTML = items.map(function(notice) {
    return `
      <div class="recent-item" onclick="navigateToHash('#/notice/${notice.id}')">
        <span class="recent-cat-dot ${getCategoryBadgeClass(notice.category)}"></span>
        <div class="recent-item-info">
          <p class="recent-title">${escapeHtml(notice.title)}</p>
          <span class="recent-sub">${escapeHtml(notice.circular)} · ${formatDate(notice.posted)}</span>
        </div>
      </div>
    `;
  }).join("");
}

let currentQuoteIndex = 0;

function renderHomeQuoteWidget() {
  const quoteTextEl = document.getElementById("quoteWidgetText");
  if (!quoteTextEl) return;
  quoteTextEl.textContent = quotesList[currentQuoteIndex % quotesList.length];
}

function nextQuote() {
  currentQuoteIndex = (currentQuoteIndex + 1) % quotesList.length;
  renderHomeQuoteWidget();
}

function setupStayConnectedCard() {
  const card = document.getElementById("stayConnectedCard");
  if (card && config.images && config.images.connectCard) {
    card.style.backgroundImage = `linear-gradient(rgba(22, 27, 58, 0.85), rgba(22, 27, 58, 0.95)), url('${config.images.connectCard}')`;
  }
}

/*
 * SECTION 4 — NOTICES PAGE (CATEGORY FILTERS AND SORTING)
 * Handles the Department / Exams / Fees / Events / Placement buttons, the
 * quick filters (urgent, this week, new) and the sort dropdown, then draws
 * the matching cards and the live counts.
 */
function applyNoticeFilterRules(list, filterName) {
  if (filterName === "urgent") return list.filter(function(n) { return n.urgent; });
  if (filterName === "week") {
    return list.filter(function(n) { const d = getDaysRemaining(n.posted); return d >= -7 && d <= 0; });
  }
  if (filterName === "new") {
    return list.filter(function(n) { const d = getDaysRemaining(n.posted); return d >= -3 && d <= 0; });
  }
  if (filterName && filterName !== "all") {
    return list.filter(function(n) { return (n.category || "").toLowerCase() === filterName.toLowerCase(); });
  }
  return list;
}

function filterAndSortNotices(filterName, sortOrder) {
  let list = applyNoticeFilterRules(getAllVisibleNotices(), filterName);

  if (sortOrder === "oldest") {
    list.sort(function(a, b) { return new Date(a.posted) - new Date(b.posted); });
  } else if (sortOrder === "urgent") {
    list.sort(function(a, b) {
      if (a.urgent && !b.urgent) return -1;
      if (!a.urgent && b.urgent) return 1;
      return new Date(b.posted) - new Date(a.posted);
    });
  } else {
    list.sort(function(a, b) { return new Date(b.posted) - new Date(a.posted); });
  }

  return list;
}

function renderNoticesPage(filterArg) {
  activeNoticesFilter = filterArg || "all";
  const sortSelect = document.getElementById("noticesSortSelect");
  if (sortSelect) activeNoticesSort = sortSelect.value || "newest";

  updateCategoryCardsCounts();
  updateNoticesFilterButtonsUI();

  const notices = filterAndSortNotices(activeNoticesFilter, activeNoticesSort);
  const container = document.getElementById("noticesGrid");
  const countHeader = document.getElementById("noticesCountHeader");

  const filterDisplayName = activeNoticesFilter === "all" ? "All" : (activeNoticesFilter.charAt(0).toUpperCase() + activeNoticesFilter.slice(1));
  if (countHeader) {
    countHeader.textContent = `Showing ${notices.length} ${filterDisplayName} notice${notices.length === 1 ? '' : 's'}`;
  }

  if (notices.length === 0) {
    const isAllRemoved = getAllVisibleNotices().length === 0;
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-icon">📭</p>
        <p class="empty-title">No notices to display</p>
        <p class="empty-subtitle">${isAllRemoved ? 'All demo notices and items have been removed.' : 'No notices match your current filter.'}</p>
        ${isAllRemoved ? '<button class="btn btn-primary" onclick="resetNoticesData(\'restore\')">Restore Demo Notices</button>' : '<button class="btn btn-secondary" onclick="setNoticesFilter(\'all\')">Clear Filter</button>'}
      </div>
    `;
    return;
  }

  container.innerHTML = notices.map(createNoticeCardHtml).join("");
}

function updateCategoryCardsCounts() {
  const notices = getAllVisibleNotices();
  const counts = { all: notices.length, department: 0, exams: 0, fees: 0, events: 0, placement: 0 };

  for (let i = 0; i < notices.length; i++) {
    const cat = (notices[i].category || "").toLowerCase();
    if (counts.hasOwnProperty(cat)) counts[cat]++;
  }

  const cardEls = document.querySelectorAll(".category-card");
  for (let j = 0; j < cardEls.length; j++) {
    const el = cardEls[j];
    const cat = el.getAttribute("data-cat");
    const countEl = el.querySelector(".cat-count");
    if (countEl && counts.hasOwnProperty(cat)) {
      countEl.textContent = `${counts[cat]} circular${counts[cat] === 1 ? '' : 's'}`;
    }
    if (cat === activeNoticesFilter) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  }
}

function updateNoticesFilterButtonsUI() {
  const buttons = document.querySelectorAll("#noticesCategoryFilters .cat-btn, #noticesQuickChips .chip-btn");
  for (let i = 0; i < buttons.length; i++) {
    const btn = buttons[i];
    const cat = btn.getAttribute("data-cat");
    if (cat === activeNoticesFilter) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  }
}

function setNoticesFilter(filterName) {
  activeNoticesFilter = filterName;
  navigateToHash(`#/notices/${filterName}`);
}

function handleNoticesSortChange() {
  const sortSelect = document.getElementById("noticesSortSelect");
  if (sortSelect) {
    activeNoticesSort = sortSelect.value;
    renderNoticesPage(activeNoticesFilter);
  }
}

/*
 * SECTION 5 — NOTICE DETAILS PAGE
 * Shows one full notice with its details and attachments, and runs the
 * Download, Share (copy link) and Print buttons.
 */
function renderNoticeAttachmentsHtml(notice) {
  if (!notice.attachments || notice.attachments.length === 0) {
    return `<p class="muted-note">No attachments provided with this circular.</p>`;
  }
  return notice.attachments.map(function(att, idx) {
    const sizeStr = att.size ? Math.round(att.size / 1024) + ' KB' : 'Standard Document';
    return `
      <div class="attachment-item">
        <div class="attach-icon">📎</div>
        <div class="attach-info">
          <span class="attach-name">${escapeHtml(att.name)}</span>
          <span class="attach-size">${sizeStr}</span>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" onclick="downloadAttachment('${notice.id}', ${idx})">
          ⬇️ Download
        </button>
      </div>
    `;
  }).join("");
}

function renderNoticeMetaGridHtml(notice, deadline) {
  return `
    <div class="detail-meta-grid">
      <div class="meta-box">
        <span class="meta-label">Issuing Department</span>
        <span class="meta-value">🏛️ ${escapeHtml(notice.department)}</span>
      </div>
      <div class="meta-box">
        <span class="meta-label">Date of Notice</span>
        <span class="meta-value">📅 ${formatDate(notice.posted)}</span>
      </div>
      <div class="meta-box">
        <span class="meta-label">Valid Until</span>
        <span class="meta-value">⏳ ${formatDate(notice.expires)} (${deadline.label})</span>
      </div>
      <div class="meta-box">
        <span class="meta-label">Authorized Signatory</span>
        <span class="meta-value">✍️ ${escapeHtml(notice.postedBy || 'University Administration')}</span>
      </div>
    </div>
  `;
}

function renderNoticeDetailsPage(noticeId) {
  const container = document.getElementById("noticeDetailsContent");
  const notice = getNoticeById(noticeId);

  if (!notice) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-icon">🔍</p>
        <p class="empty-title">Notice Not Found</p>
        <p class="empty-subtitle">The notice you requested does not exist or has expired.</p>
        <button class="btn btn-primary" onclick="navigateToHash('#/notices')">Back to All Notices</button>
      </div>
    `;
    return;
  }

  recordRecentlyViewed(notice.id);
  markNotificationReadByNoticeId(notice.id);

  const saved = isNoticeSaved(notice.id);
  const deadline = getDeadlineStatus(notice.expires);
  const badgeClass = getCategoryBadgeClass(notice.category);
  const currentUser = getCurrentUser();
  const isOwner = currentUser && (currentUser.name === notice.postedBy || isTeacher()) && !notice.isDemo;

  const related = getAllVisibleNotices()
    .filter(function(n) { return n.category === notice.category && n.id !== notice.id; })
    .slice(0, 3);

  container.innerHTML = `
    <div class="notice-detail-card">
      <div class="detail-header">
        <div class="detail-tags">
          <span class="category-tag ${badgeClass}">${escapeHtml(notice.category)}</span>
          ${notice.urgent ? '<span class="urgent-tag">⚡ URGENT</span>' : ''}
          <span class="circular-pill">Circular: ${escapeHtml(notice.circular)}</span>
        </div>
        <div class="detail-actions-top">
          <button class="btn btn-outline btn-sm ${saved ? 'saved-active' : ''}" onclick="toggleSaveNotice('${notice.id}', event)">
            ${saved ? '★ Saved' : '☆ Save'}
          </button>
          <button class="btn btn-outline btn-sm" onclick="shareNotice('${notice.id}')">🔗 Share</button>
          <button class="btn btn-outline btn-sm" onclick="printNotice()">🖨️ Print</button>
          ${isOwner ? `
            <button class="btn btn-secondary btn-sm" onclick="navigateToHash('#/post/${notice.id}')">✏️ Edit</button>
            <button class="btn btn-danger btn-sm" onclick="confirmDeleteNotice('${notice.id}')">🗑️ Delete</button>
          ` : ''}
        </div>
      </div>

      <h1 class="detail-title">${escapeHtml(notice.title)}</h1>
      ${renderNoticeMetaGridHtml(notice, deadline)}
      <hr class="divider">

      <div class="detail-body">
        <h3 class="section-heading">Circular Details & Instructions</h3>
        <p class="full-description">${escapeHtml(notice.description)}</p>
      </div>

      <div class="detail-attachments">
        <h3 class="section-heading">Official Attachments & Annexures</h3>
        <div class="attachments-list">
          ${renderNoticeAttachmentsHtml(notice)}
        </div>
      </div>
    </div>

    ${related.length > 0 ? `
      <div class="related-section">
        <h3 class="related-heading">Related Circulars in ${escapeHtml(notice.category)}</h3>
        <div class="cards-grid">${related.map(createNoticeCardHtml).join("")}</div>
      </div>
    ` : ''}
  `;
}

function downloadAttachment(noticeId, attachIndex) {
  const notice = getNoticeById(noticeId);
  if (!notice || !notice.attachments || !notice.attachments[attachIndex]) return;

  const att = notice.attachments[attachIndex];
  if (att.data) {
    const link = document.createElement("a");
    link.href = att.data;
    link.download = att.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded: ${att.name}`, "success");
    return;
  }

  const textContent = `LOVELY PROFESSIONAL UNIVERSITY\nCampus Circular Management System\n\nCircular No: ${notice.circular}\nTitle: ${notice.title}\nCategory: ${notice.category}\nDepartment: ${notice.department}\nDate: ${notice.posted}\n\nSummary:\n${notice.description}\n\nOfficial College Document Annexure.`;
  const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = att.name.replace(/\.[^/.]+$/, "") + ".txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast(`Downloaded circular document: ${att.name}`, "success");
}

function shareNotice(noticeId) {
  const notice = getNoticeById(noticeId);
  if (!notice) return;
  const shareUrl = window.location.origin + window.location.pathname + `#/notice/${notice.id}`;
  const shareText = `[LPU Circular: ${notice.circular}] ${notice.title}\nValid: ${formatDate(notice.expires)}\nRead more: ${shareUrl}`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(shareText).then(function() {
      showToast("Notice summary copied to clipboard! 📋", "success");
    }).catch(function() {
      fallbackCopyText(shareText);
    });
  } else {
    fallbackCopyText(shareText);
  }
}

function fallbackCopyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
    showToast("Notice summary copied to clipboard! 📋", "success");
  } catch (err) {
    showToast("Could not copy automatically. URL: " + window.location.href, "warning");
  }
  document.body.removeChild(textarea);
}

function printNotice() {
  window.print();
}

/*
 * SECTION 6 — SAVED NOTICES AND DATA RESET
 * renderSavedPage lists the starred notices. resetNoticesData runs the
 * three options in Settings: remove demo notices, remove everything, or
 * bring the demo notices back.
 */
function renderSavedPage() {
  const container = document.getElementById("savedGrid");
  const savedIds = storageLoad("saved", demoSavedIds);
  const notices = [];

  for (let i = 0; i < savedIds.length; i++) {
    const item = getNoticeById(savedIds[i]);
    if (item) notices.push(item);
  }

  if (notices.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-icon">⭐</p>
        <p class="empty-title">No saved notices yet</p>
        <p class="empty-subtitle">Click the star icon on any circular to bookmark it for quick access.</p>
        <button class="btn btn-primary" onclick="navigateToHash('#/notices')">Browse Notices</button>
      </div>
    `;
    return;
  }

  container.innerHTML = notices.map(createNoticeCardHtml).join("");
}

function resetNoticesData(action) {
  if (action === "hide_demo") {
    showConfirmModal(
      "Remove Demo Notices?",
      "This will hide the 5 built-in demo notices. Any notices you posted as a teacher will remain.",
      function() {
        storageSave("hideDemoNotices", true);
        showToast("Demo notices hidden", "info");
        renderNoticesPage(activeNoticesFilter);
      }
    );
  } else if (action === "remove_all") {
    showConfirmModal(
      "Remove Everything?",
      "This will hide demo notices AND delete all notices and files you have posted. This cannot be undone.",
      function() {
        storageSave("hideDemoNotices", true);
        storageSave("userNotices", []);
        showToast("All notices removed", "warning");
        renderNoticesPage(activeNoticesFilter);
      }
    );
  } else if (action === "restore") {
    showConfirmModal(
      "Restore Demo Notices?",
      "This will bring back all 5 demo notices and remove any custom notices you added.",
      function() {
        storageSave("hideDemoNotices", false);
        storageSave("userNotices", []);
        storageSave("saved", demoSavedIds);
        storageSave("recent", demoRecentIds);
        showToast("Demo notices successfully restored!", "success");
        renderNoticesPage("all");
      }
    );
  }
}
