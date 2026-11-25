# HOW IT WORKS — LPU Campus Hub Architecture & Viva Guide

> **Campus Notice and Circular Management System**  
> Developed by **TEAM WebX** for Lovely Professional University  
> *A plain-English code walkthrough, click lifecycle analysis, and Viva exam guide.*

---

## 📂 Section 1: File-by-File Explanation

### 1. `index.html`
- **Purpose:** The single-page application structure.
- **How it works:** Contains the fixed top bar, left sidebar navigation drawer, breadcrumb bar, floating toast container, confirmation modal, and individual `<section class="page">` elements. Only the section matching the current URL hash receives the `.active` class and displays. All scripts are loaded at the bottom in strict sequential order.

### 2. `css/style.css`
- **Purpose:** Design system, typography, animations, dark mode, and responsive layout.
- **How it works:** Defines CSS custom properties (`--navy`, `--accent`, `--bg`, `--card`, `--text`, `--border`) under `:root`. Dark mode switches these exact same variables under `body.dark`, ensuring zero CSS specificity bugs. Features card hover transforms, pulsing animation keyframes for new badges, color-coded deadline chips, and a clean print stylesheet.

### 3. `js/config.js`
- **Purpose:** Centralized, editable college and team configuration.
- **How it works:** Stores university contact numbers, helpdesk email, working hours, team credit (`TEAM WebX`), and asset image paths in a single `config` object. Other scripts read from `config` rather than hardcoding strings.

### 4. `js/data.js`
- **Purpose:** Built-in seed data and date calculation helpers.
- **How it works:** Provides the `dayOffset(days)` function which computes dates relative to today, ensuring demo circulars never appear expired. Seeds 5 demo notices (1 per category) and 12 notifications, reads the motivational quotes, the search bar tips and the student and faculty profiles from `config.js`. Also exports HTML sanitization (`escapeHtml`) to prevent cross-site scripting (XSS).

### 5. `js/storage.js`
- **Purpose:** Safe persistence abstraction layer.
- **How it works:** The *only* file in the application that touches `window.localStorage`. Every storage read and write is wrapped in `try/catch` and backed by an in-memory dictionary fallback (`memoryStorage`). If a user opens the application in private or incognito mode where `localStorage` is blocked, the application continues running smoothly without crashing.

### 6. `js/auth.js`
- **Purpose:** User session, role verification, and profile synchronization.
- **How it works:** Manages active sessions (`Student` vs `Teacher`). Handles demo logins, profile synchronization, logout, and layout visibility. Controls the display of `.teacher-only` elements and guards teacher routes against student access.

### 7. `js/notices.js`
- **Purpose:** Notice filtering, sorting, card generation, details view, bookmarks, and statistics.
- **How it works:** Aggregates visible non-expired notices from demo and user-created data. Powers the professor's category filter buttons (All, Department, Exams, Fees, Events, Placement) on both Home and Notices pages. Generates notice cards with pulsing badges, deadline countdowns, bookmark toggles, attachment downloads, and print formatting.

### 8. `js/post.js`
- **Purpose:** Faculty circular creation, editing, deletion, and file attachment handling.
- **How it works:** Accessible only to the Teacher role. Automatically generates standard university circular numbers (`generateCircularNumber`) based on the chosen category and current year. Converts uploaded files (up to 3 files, 1MB max) into base64 data URLs via `FileReader`. Automatically triggers a university-wide notification whenever a new notice is published.

### 9. `js/pages.js`
- **Purpose:** Interactive secondary pages: Notifications Center, Calendar, Profile, Settings, and Contact Support.
- **How it works:**
  - *Notifications:* Handles unread badges, keyword search, type filtering, and mark-as-read triggers.
  - *Calendar:* Computes month grids and cross-references dates with notice issue dates and submission deadlines.
  - *Profile:* Manages role-specific fields, completeness percentage calculations, and client-side photo resizing via HTML5 Canvas.
  - *Settings:* Applies dark mode, 5 accent colors, text sizes, density modes, and reset actions.
  - *Contact Us:* Generates pre-filled `mailto:` links with issue details under 1800 characters.

### 10. `js/app.js`
- **Purpose:** URL hash routing, global search, rotating placeholder, toasts, modals, and bootup.
- **How it works:** Listens to `window.location.hash` changes and renders the targeted view. Runs the rotating tip ticker in the search bar. Coordinates breadcrumb trail generation, animated floating toasts, and confirmation dialog modals.

---

## 🔄 Section 2: Click Walkthroughs (Tracing Function Calls)

### Walkthrough 1: Clicking the "Exams" Category Filter on Home or Notices
1. User clicks the `<button class="cat-btn" data-cat="Exams">` button.
2. In `notices.js`, `renderHomeLatestNotices("Exams")` or `setNoticesFilter("exams")` is called.
3. The function highlights the active button and calls `getAllVisibleNotices()`.
4. Notices are filtered: `n.category.toLowerCase() === "exams"`.
5. For each matching notice, `createNoticeCardHtml(notice)` is invoked to produce card HTML with category badges, deadline countdown chips, and circular numbers.
6. The container `innerHTML` is updated with the matching notices.
7. If on the Notices page, `updateCategoryCardsCounts()` updates the category count numbers, and `window.location.hash` updates to `#/notices/exams`, adding an entry to the browser's history and updating the breadcrumb trail.

---

### Walkthrough 2: Searching for "datesheet" in the Top Search Bar
1. User types `datesheet` into `#globalSearchInput` and presses Enter (or clicks the 🔍 icon).
2. The keydown listener in `app.js` triggers `triggerGlobalSearch()`.
3. `triggerGlobalSearch()` reads the input text and updates the URL hash to `#/search/datesheet`.
4. The `hashchange` event listener in `app.js` catches the new route and calls `handleRouting()`.
5. `handleRouting()` activates `pageSearch` and calls `renderSearchResultsPage("datesheet")`.
6. Inside `app.js`, `searchNotices("datesheet")` executes:
   - Queries `getAllVisibleNotices()`.
   - Normalizes text and searches across `title`, `circular`, `department`, `description`, and `category`.
   - Applies any active filters from `searchFilterState` (priority, date range, sort order).
7. `renderSearchResultsPage` generates active filter tags and renders matching cards or a friendly empty state.

---

### Walkthrough 3: Faculty Member Publishing a New Notice
1. A faculty member logs in as Teacher and navigates to `#/post`.
2. `renderPostNoticePage()` verifies `isTeacher() === true`, initializes default department from profile, and calls `generateCircularNumber("Department")` to populate the read-only circular number field.
3. User changes category to "Exams": `updateCircularInput()` fires, automatically generating the next sequential exam circular number (e.g. `EXAM/2026/051`).
4. User selects a PDF file: `handleFileUpload(event)` checks file size (≤1MB) and count (≤3), and uses `FileReader.readAsDataURL()` to encode the file into base64.
5. User clicks "Publish Notice 🚀": `submitNoticeForm(event)` validates title, expiry date, and description.
6. A notice object is generated:
   ```js
   {
     id: "notice-user-" + Date.now(),
     title: "...",
     category: "Exams",
     circular: "EXAM/2026/051",
     ...
   }
   ```
7. `userNotices` is loaded from `storageLoad()`, updated with `unshift()`, and persisted via `storageSave("userNotices", list)`.
8. A matching new alert is appended to `userNotifs` in storage.
9. `updateNotificationBadges()` updates the unread counters on the bell icon and sidebar.
10. `showToast("Notice published successfully! 🚀", "success")` displays an animated feedback banner.
11. `navigateToHash("#/notice/" + newNoticeId)` navigates directly to the full notice details view.

---

## 🎓 Section 3: 15 Likely Viva Questions & Answers

#### Q1: Why is this application called a Single Page Application (SPA)?
**Answer:** Because only one HTML document (`index.html`) is loaded. When navigating between pages (Home, Notices, Calendar, etc.), the browser does not make a full page reload; JavaScript dynamically shows and hides section views by manipulating CSS classes (`.active`) based on the URL hash.

#### Q2: How does routing work without a backend or web server?
**Answer:** Routing is managed through URL hash anchors (`window.location.hash`, e.g., `#/notices/exams`). When the hash changes, the `hashchange` event listener fires `handleRouting()`, which parses the route parameters, activates the matching section, and updates the breadcrumbs.

#### Q3: What happens if a user opens the application in private/incognito mode where `localStorage` is blocked?
**Answer:** Many browsers throw a `SecurityError` or `QuotaExceededError` when accessing `localStorage` in private mode. Our `js/storage.js` wraps all calls in `try/catch` and falls back to an in-memory JavaScript object dictionary (`memoryStorage`), so the application never crashes.

#### Q4: How did you implement the Professor's Must-Have category filter buttons?
**Answer:** We implemented active category filter buttons for **Department**, **Exams**, **Fees**, **Events**, **Placement**, and **All** on both Home and Notices pages. When clicked, JavaScript filters the notices array by comparing `notice.category.toLowerCase()` and re-renders the grid without reloading.

#### Q5: How do notice circular numbers generate automatically?
**Answer:** In `js/post.js`, `generateCircularNumber(category)` maps categories to their official prefixes (`DEP`, `EXAM`, `FEE`, `EVT`, `PLM`), checks existing notices to find the highest sequence number in that category for the current year, increments it by 1, and zero-pads it to 3 digits (e.g. `EXAM/2026/051`).

#### Q6: Why do demo notice dates never look old or expired?
**Answer:** Instead of hardcoding static calendar dates like `2024-01-10`, `js/data.js` uses a `dayOffset(days)` helper function that calculates dates relative to `new Date()`. For instance, `dayOffset(5)` is always 5 days in the future from whichever day the website is opened.

#### Q7: How does Dark Mode work without breaking CSS specificity?
**Answer:** Dark mode is controlled entirely through CSS variables in `:root` and overridden under `body.dark`. We never write brittle specific selectors like `body.dark .my-card-title`; instead, every element inherits semantic color variables like `var(--card)` and `var(--text)`.

#### Q8: How are file attachments uploaded and stored without a backend database?
**Answer:** Attachments are read by the HTML5 `FileReader` API as Base64 Data URLs (`reader.readAsDataURL(file)`) and stored directly within the notice object in `localStorage`. File size is restricted to 1MB to respect local storage quotas.

#### Q9: How are attachments downloaded if there is no backend server?
**Answer:** For uploaded files, a dynamic anchor tag `<a>` is created with its `href` set to the Base64 data URL and triggered programmatically (`link.click()`). For demo notices, a JavaScript `Blob` containing official circular text is generated in memory and downloaded as a document file.

#### Q10: How are XSS (Cross-Site Scripting) vulnerabilities prevented?
**Answer:** All user-supplied inputs (notice titles, descriptions, student names) are passed through `escapeHtml()` in `js/data.js`, which sanitizes `<`, `>`, `&`, `"`, and `'` characters into safe HTML entities before inserting them into the DOM.

#### Q11: How does the rotating search placeholder work?
**Answer:** In `js/app.js`, `setInterval` runs every 4 seconds to cycle through the short tips in `searchTipsList` (set in `config.js`). It monitors `isSearchInputFocused` and pauses rotation whenever the user is actively typing or focusing on the search input.

#### Q12: How is role-based access control (RBAC) enforced between Student and Teacher?
**Answer:** The active user object in storage has a `role` property (`Student` or `Teacher`). In `auth.js` and `app.js`, if `user.role !== "Teacher"`, elements with the `.teacher-only` class are hidden, and direct URL navigation to `#/post` or `#/myposts` redirects immediately to `#/home`.

#### Q13: How does the profile photo upload and thumbnail cropping work?
**Answer:** In `js/pages.js`, `handleProfilePhotoUpload` loads the chosen image into an HTML5 `<canvas>`, calculates a center square crop, resizes it to 200×200 pixels, and exports it as a lightweight JPEG Data URL (`canvas.toDataURL("image/jpeg", 0.85)`).

#### Q14: How does the Contact Us form integrate with the student's email app?
**Answer:** Instead of a dummy submission, it collects the student's profile details and grievance subject, encodes them into a standard `mailto:` URI, and sets `window.location.href = mailtoUrl`, launching the user's default email client (Outlook, Gmail, Apple Mail) with the email ready to send.

#### Q15: How does the "Manage Data" reset system work?
**Answer:** On both the Notices and Notifications pages, a "Manage Data" dropdown allows users to:
1. Hide demo items (`hideDemoNotices = true`).
2. Remove everything (hides demo items and clears custom user notices).
3. Restore demo only (brings back demo items and clears custom additions).
Each option prompts an accessible confirmation modal before modifying storage.

---

*Compiled by **TEAM WebX** for LPU Campus Hub Viva Examination.*
