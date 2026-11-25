/*
 * app.js — ROUTING, SEARCH, POP-UPS AND START-UP
 * The main controller. It decides which page to show for the address in the
 * browser (#/home, #/notices ...), runs the search bar, shows toasts and
 * confirm boxes, and starts the whole site. Loaded last.
 */

/*
 * SECTION 1 — SEARCH AND TIMER VARIABLES
 * Remember the selected search filters, the rotating quote in the search
 * bar and whether the search box is being typed in.
 */
let searchFilterState = {
  category: "all",
  priority: "all",
  posted: "any",
  sort: "newest"
};

let placeholderTimer = null;
let currentPlaceholderIdx = 0;
let isSearchInputFocused = false;

/*
 * SECTION 2 — PAGE ROUTING
 * Reads the address after #, blocks pages the user may not see (for example
 * Post Notice for students), shows the right page, highlights the sidebar
 * link and builds the breadcrumb and Back button.
 */
function navigateToHash(hash) {
  window.location.hash = hash;
}

function routeGuard(user, hash) {
  if (!user && hash !== "#/login") {
    navigateToHash("#/login");
    return false;
  }
  if (user && hash === "#/login") {
    navigateToHash("#/home");
    return false;
  }
  if (user && user.role !== "Teacher") {
    if (hash.indexOf("#/post") === 0 || hash === "#/myposts") {
      showToast("Access restricted to faculty accounts", "warning");
      navigateToHash("#/home");
      return false;
    }
  }
  return true;
}

function hideAllPages() {
  const pages = document.querySelectorAll(".page");
  for (let i = 0; i < pages.length; i++) {
    pages[i].classList.remove("active");
  }
}

function activatePage(pageId) {
  const page = document.getElementById(pageId);
  if (page) page.classList.add("active");
}

function dispatchRoute(baseRoute, param) {
  const routes = {
    login: function() { activatePage("pageLogin"); },
    home: function() { activatePage("pageHome"); renderHomePage(); },
    notices: function() { activatePage("pageNotices"); renderNoticesPage(param || "all"); },
    notice: function() { activatePage("pageNoticeDetails"); renderNoticeDetailsPage(param); },
    search: function() { activatePage("pageSearch"); renderSearchResultsPage(decodeURIComponent(param)); },
    notifications: function() { activatePage("pageNotifications"); renderNotificationsPage(); },
    calendar: function() { activatePage("pageCalendar"); renderCalendarPage(); },
    profile: function() { activatePage("pageProfile"); renderProfilePage(); },
    settings: function() { activatePage("pageSettings"); renderSettingsPage(); },
    contact: function() { activatePage("pageContact"); renderContactPage(); },
    post: function() { activatePage("pagePost"); renderPostNoticePage(param || null); },
    myposts: function() { activatePage("pageMyPosts"); renderMyPostsPage(); },
    saved: function() { activatePage("pageSaved"); renderSavedPage(); }
  };

  const handler = routes[baseRoute] || routes["home"];
  handler();
}

function handleRouting() {
  const hash = window.location.hash || "#/home";
  const user = getCurrentUser();

  if (!routeGuard(user, hash)) return;

  hideAllPages();
  closeMobileSidebar();

  const parts = hash.slice(2).split("/");
  const baseRoute = parts[0] || "home";
  const param = parts[1] || "";

  dispatchRoute(baseRoute, param);
  updateSidebarActiveLink(baseRoute);
  updateBreadcrumbs(baseRoute, param);
  window.scrollTo(0, 0);
}

function updateSidebarActiveLink(baseRoute) {
  const links = document.querySelectorAll("#sidebarNav .nav-item");
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const route = link.getAttribute("data-route");
    if (route === baseRoute) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  }
}

function buildBreadcrumbsList(baseRoute, param) {
  const crumbs = [`<a href="#/home" class="crumb-link">Home</a>`];

  if (baseRoute === "notices") {
    crumbs.push(`<a href="#/notices" class="crumb-link">Notices</a>`);
    if (param && param !== "all") {
      const label = param.charAt(0).toUpperCase() + param.slice(1);
      crumbs.push(`<span class="crumb-current">${escapeHtml(label)}</span>`);
    }
  } else if (baseRoute === "notice") {
    const notice = getNoticeById(param);
    crumbs.push(`<a href="#/notices" class="crumb-link">Notices</a>`);
    if (notice) {
      crumbs.push(`<a href="#/notices/${notice.category.toLowerCase()}" class="crumb-link">${escapeHtml(notice.category)}</a>`);
      crumbs.push(`<span class="crumb-current">${escapeHtml(notice.title)}</span>`);
    } else {
      crumbs.push(`<span class="crumb-current">Notice Details</span>`);
    }
  } else if (baseRoute === "search") {
    crumbs.push(`<span class="crumb-current">Search Results</span>`);
  } else if (baseRoute === "saved") {
    crumbs.push(`<a href="#/notices" class="crumb-link">Notices</a>`);
    crumbs.push(`<span class="crumb-current">Saved Bookmarks</span>`);
  } else if (baseRoute === "myposts") {
    crumbs.push(`<a href="#/notices" class="crumb-link">Notices</a>`);
    crumbs.push(`<span class="crumb-current">My Posts</span>`);
  } else if (baseRoute === "post") {
    crumbs.push(`<a href="#/notices" class="crumb-link">Notices</a>`);
    crumbs.push(`<span class="crumb-current">${param ? 'Edit Notice' : 'Post Notice'}</span>`);
  } else if (baseRoute === "notifications") {
    crumbs.push(`<span class="crumb-current">Notifications</span>`);
  } else if (baseRoute === "calendar") {
    crumbs.push(`<span class="crumb-current">Academic Calendar</span>`);
  } else if (baseRoute === "profile") {
    crumbs.push(`<span class="crumb-current">My Profile</span>`);
  } else if (baseRoute === "settings") {
    crumbs.push(`<span class="crumb-current">Settings</span>`);
  } else if (baseRoute === "contact") {
    crumbs.push(`<span class="crumb-current">Contact Us & Support</span>`);
  }

  return crumbs;
}

function updateBreadcrumbs(baseRoute, param) {
  const bar = document.getElementById("breadcrumbBar");
  const trail = document.getElementById("breadcrumbTrail");
  if (!bar || !trail) return;

  if (baseRoute === "home" || baseRoute === "login") {
    bar.style.display = "none";
    return;
  }

  bar.style.display = "flex";
  const crumbs = buildBreadcrumbsList(baseRoute, param);
  trail.innerHTML = crumbs.join(`<span class="crumb-sep">›</span>`);
}

function goBackHistory() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    navigateToHash("#/home");
  }
}

/*
 * SECTION 3 — SEARCH BAR QUOTES AND FILTER PANEL
 * Rotates a new tip (from config.js searchTips) in the search box every few seconds and opens,
 * closed, applies and clears the Filters panel.
 */
function tickSearchPlaceholder(input) {
  if (!isSearchInputFocused && (!input.value || input.value.trim() === "")) {
    currentPlaceholderIdx = (currentPlaceholderIdx + 1) % searchTipsList.length;
    input.setAttribute("placeholder", searchTipsList[currentPlaceholderIdx]);
  }
}

function startSearchPlaceholderRotation() {
  const input = document.getElementById("globalSearchInput");
  if (!input) return;

  input.setAttribute("placeholder", searchTipsList[0]);
  if (placeholderTimer) clearInterval(placeholderTimer);
  placeholderTimer = setInterval(function() {
    tickSearchPlaceholder(input);
  }, 4000);
}

function toggleSearchFiltersPanel(event) {
  if (event) event.stopPropagation();
  const panel = document.getElementById("searchFiltersPanel");
  if (panel) {
    panel.classList.toggle("open");
  }
}

function closeSearchFiltersPanel() {
  const panel = document.getElementById("searchFiltersPanel");
  if (panel) panel.classList.remove("open");
}

function applySearchFilters() {
  searchFilterState.category = document.getElementById("sfCategory").value;
  searchFilterState.priority = document.getElementById("sfPriority").value;
  searchFilterState.posted = document.getElementById("sfPosted").value;
  searchFilterState.sort = document.getElementById("sfSort").value;

  closeSearchFiltersPanel();
  triggerGlobalSearch();
}

function clearSearchFilters() {
  searchFilterState = { category: "all", priority: "all", posted: "any", sort: "newest" };
  document.getElementById("sfCategory").value = "all";
  document.getElementById("sfPriority").value = "all";
  document.getElementById("sfPosted").value = "any";
  document.getElementById("sfSort").value = "newest";
  closeSearchFiltersPanel();
  triggerGlobalSearch();
}

function triggerGlobalSearch() {
  const input = document.getElementById("globalSearchInput");
  const query = input ? (input.value || "").trim() : "";
  navigateToHash(`#/search/${encodeURIComponent(query)}`);
}

/*
 * SECTION 4 — SEARCH LOGIC AND RESULTS PAGE
 * Checks every notice against the typed words and the selected filters
 * and draws the results page with removable filter chips.
 */
function noticeMatchesQuery(notice, q) {
  if (!q) return true;
  return (notice.title || "").toLowerCase().indexOf(q) !== -1 ||
         (notice.circular || "").toLowerCase().indexOf(q) !== -1 ||
         (notice.department || "").toLowerCase().indexOf(q) !== -1 ||
         (notice.description || "").toLowerCase().indexOf(q) !== -1 ||
         (notice.category || "").toLowerCase().indexOf(q) !== -1;
}

function noticeMatchesFilters(notice, filterState) {
  if (filterState.category !== "all") {
    if ((notice.category || "").toLowerCase() !== filterState.category.toLowerCase()) return false;
  }
  if (filterState.priority === "urgent" && !notice.urgent) return false;

  const days = getDaysRemaining(notice.posted);
  if (filterState.posted === "today" && days !== 0) return false;
  if (filterState.posted === "7days" && (days < -7 || days > 0)) return false;
  if (filterState.posted === "30days" && (days < -30 || days > 0)) return false;

  return true;
}

function searchNotices(query) {
  const q = (query || "").trim().toLowerCase();
  let notices = getAllVisibleNotices();

  notices = notices.filter(function(n) {
    return noticeMatchesQuery(n, q) && noticeMatchesFilters(n, searchFilterState);
  });

  if (searchFilterState.sort === "oldest") {
    notices.sort(function(a, b) { return new Date(a.posted) - new Date(b.posted); });
  } else if (searchFilterState.sort === "urgent") {
    notices.sort(function(a, b) {
      if (a.urgent && !b.urgent) return -1;
      if (!a.urgent && b.urgent) return 1;
      return new Date(b.posted) - new Date(a.posted);
    });
  } else {
    notices.sort(function(a, b) { return new Date(b.posted) - new Date(a.posted); });
  }

  return notices;
}

function getActiveFilterChips() {
  const chips = [];
  if (searchFilterState.category !== "all") {
    chips.push({ label: `Category: ${searchFilterState.category}`, key: "category" });
  }
  if (searchFilterState.priority === "urgent") {
    chips.push({ label: "Priority: Urgent Only", key: "priority" });
  }
  if (searchFilterState.posted !== "any") {
    chips.push({ label: `Posted: ${searchFilterState.posted}`, key: "posted" });
  }
  if (searchFilterState.sort !== "newest") {
    chips.push({ label: `Sort: ${searchFilterState.sort}`, key: "sort" });
  }
  return chips;
}

function renderSearchResultsPage(query) {
  const container = document.getElementById("searchResultsGrid");
  const titleEl = document.getElementById("searchHeadingQuery");
  const chipsEl = document.getElementById("searchActiveChips");
  const countEl = document.getElementById("searchResultCount");

  titleEl.textContent = query ? `Results for "${query}"` : "All Circulars";

  const chips = getActiveFilterChips();
  chipsEl.innerHTML = chips.map(function(chip) {
    return `<span class="active-filter-chip">${escapeHtml(chip.label)} <button type="button" onclick="removeSearchFilterChip('${chip.key}')">✕</button></span>`;
  }).join("");

  const results = searchNotices(query);
  countEl.textContent = `Found ${results.length} circular${results.length === 1 ? '' : 's'}`;

  if (results.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-icon">🔍</p>
        <p class="empty-title">No matching circulars found</p>
        <p class="empty-subtitle">Try searching for broader keywords such as "exam", "fee", "internship", or clear active filters.</p>
        <button class="btn btn-secondary" onclick="clearSearchFilters()">Clear All Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = results.map(createNoticeCardHtml).join("");
}

function removeSearchFilterChip(key) {
  if (key === "category") searchFilterState.category = "all";
  if (key === "priority") searchFilterState.priority = "all";
  if (key === "posted") searchFilterState.posted = "any";
  if (key === "sort") searchFilterState.sort = "newest";
  triggerGlobalSearch();
}

/*
 * SECTION 5 — SMALL PAGE PARTS
 * Profile menu, mobile sidebar, toast messages, the Yes/No confirm box
 * and the saved-notices badge.
 */
function toggleProfileDropdown(event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById("profileDropdownMenu");
  if (menu) menu.classList.toggle("open");
}

function closeProfileDropdown() {
  const menu = document.getElementById("profileDropdownMenu");
  if (menu) menu.classList.remove("open");
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById("leftSidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  if (sidebar) sidebar.classList.toggle("open");
  if (backdrop) backdrop.classList.toggle("open");
}

function closeMobileSidebar() {
  const sidebar = document.getElementById("leftSidebar");
  const backdrop = document.getElementById("sidebarBackdrop");
  if (sidebar) sidebar.classList.remove("open");
  if (backdrop) backdrop.classList.remove("open");
}

function showToast(message, type) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type || 'info'}`;
  toast.innerHTML = `<span class="toast-msg">${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(function() {
    toast.classList.add("hiding");
    setTimeout(function() {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 3200);
}

let confirmCallback = null;

function showConfirmModal(title, message, onConfirm) {
  const modal = document.getElementById("confirmModal");
  const titleEl = document.getElementById("confirmModalTitle");
  const msgEl = document.getElementById("confirmModalMessage");
  if (!modal || !titleEl || !msgEl) return;

  titleEl.textContent = title;
  msgEl.textContent = message;
  confirmCallback = onConfirm;
  modal.classList.add("open");
}

function closeConfirmModal() {
  const modal = document.getElementById("confirmModal");
  if (modal) modal.classList.remove("open");
  confirmCallback = null;
}

function executeConfirmAction() {
  if (typeof confirmCallback === "function") {
    confirmCallback();
  }
  closeConfirmModal();
}

function updateSavedBadges() {
  const saved = storageLoad("saved", demoSavedIds);
  const badge = document.getElementById("noticesSavedCountBadge");
  if (badge) {
    badge.textContent = `(${saved.length})`;
  }
}

/*
 * SECTION 6 — START-UP
 * Applies saved dark mode and text size, copies config.js values into the
 * page, sets up listeners and shows the first page.
 */
function applyInitialAppearance() {
  const isDark = storageLoad("dark", false);
  if (isDark) document.body.classList.add("dark");

  const accentColor = storageLoad("accent", "#5b5ef0");
  document.documentElement.style.setProperty("--accent", accentColor);

  const textSize = storageLoad("textSize", "medium");
  document.body.classList.add(`text-${textSize}`);

  const isCompact = storageLoad("compact", false);
  if (isCompact) document.body.classList.add("compact-mode");
}

function setupSearchInputListeners() {
  const searchInput = document.getElementById("globalSearchInput");
  if (searchInput) {
    searchInput.addEventListener("focus", function() { isSearchInputFocused = true; });
    searchInput.addEventListener("blur", function() { isSearchInputFocused = false; });
    searchInput.addEventListener("keydown", function(e) {
      if (e.key === "Enter") triggerGlobalSearch();
    });
  }
}

function applyConfigToUI() {
  if (typeof config === "undefined") return;
  const topLogo = document.querySelector(".logo-circle img");
  if (topLogo && config.images && config.images.logoIcon) topLogo.src = config.images.logoIcon;
  const loginLogo = document.querySelector(".login-logo");
  if (loginLogo && config.images && config.images.logo) loginLogo.src = config.images.logo;
  const brandTitle = document.querySelector(".brand-title");
  if (brandTitle && config.siteName) brandTitle.textContent = config.siteName;
  const brandSub = document.querySelector(".brand-subtitle");
  if (brandSub && config.subtitle) brandSub.textContent = config.subtitle;
  const teamCredit = document.querySelector(".sidebar-credit-love");
  if (teamCredit && config.teamCredit) teamCredit.textContent = config.teamCredit;
  const teamName = document.querySelector(".sidebar-team-webx");
  if (teamName && config.teamName) teamName.textContent = config.teamName;
  const sidebarArt = document.querySelector(".sidebar-art-box");
  if (sidebarArt && config.images && config.images.sidebarArt) {
    sidebarArt.style.backgroundImage = `url("${config.images.sidebarArt}")`;
  }
  if (config.siteName && config.subtitle) {
    document.title = `${config.siteName} - ${config.subtitle}`;
  }
}

function initApp() {
  applyInitialAppearance();
  applyConfigToUI();

  document.addEventListener("click", function() {
    closeProfileDropdown();
    closeSearchFiltersPanel();
  });

  setupSearchInputListeners();

  const sfPanel = document.getElementById("searchFiltersPanel");
  if (sfPanel) {
    sfPanel.addEventListener("click", function(e) { e.stopPropagation(); });
  }

  updateNotificationBadges();
  updateSavedBadges();
  updateAuthUI();
  startSearchPlaceholderRotation();

  window.addEventListener("hashchange", handleRouting);
  handleRouting();
}

// Attach initialization handler to document ready
document.addEventListener("DOMContentLoaded", initApp);
