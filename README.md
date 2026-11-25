# LPU Campus Hub — Campus Notice & Circular Management System

> **Campus Notice & Circular Management System** for Lovely Professional University (LPU).  
> Designed and built by **TEAM WebX**.  
> *Made with love ❤️ by TEAM WebX*

---

## 📌 Project Overview
LPU Campus Hub is a responsive, accessible, interactive web application developed to help university students and faculty members seamlessly access, filter, search, bookmark, and publish campus notices, circulars, examination schedules, fee updates, and placement drives.

### 🌐 Live Deployment
- **Live Demo Link:** *(add your GitHub Pages link here after publishing)*
- **Offline Mode:** Fully functional simply by double-clicking `index.html` in any modern web browser without any local web server, database, or build tools.

---

## 🚀 How to Run
1. Open the project folder `lpu-campus-hub/`.
2. Double-click `index.html` to launch directly in your browser.
3. On the welcome screen, choose either of the two convenient demo modes:
   - **🎓 Try as Student:** Explores the dashboard from a student's perspective (view notices, apply category filters, search circulars, download attachments, bookmark, and manage notifications).
   - **👨‍🏫 Try as Teacher:** Unlocks faculty administrative capabilities (authoring circulars with auto-generated circular numbers, uploading attachments, editing, and managing posts).

---

## ⭐ Core Features & Highlights

### 1. 🎯 Professor's Must-Have Category Filter Buttons (Prominent & Working)
- **Instant Category Filtering:** Prominently featured on both the **Home** dashboard and the **Notices** directory.
- Filters notices across the 5 university categories:
  - 🏛️ **Department:** Revised lab timings for the computer labs.
  - 📝 **Exams:** End-semester theory examination schedule.
  - 💳 **Fees:** Last date for spring term tuition fee payment.
  - 🎪 **Events:** One India annual cultural festival registrations.
  - 💼 **Placement:** Google and Amazon campus recruitment drive.
- Includes an **"All"** toggle and real-time count badges reflecting live data.

### 2. ⚡ Dynamic Notice Lifecycle & Visual Indicators
- **Real Expiry & Deadlines:** Dynamic `dayOffset()` date calculations relative to the current calendar date; sample circulars never look stale or expired.
- **Deadline Chips:** Color-coded countdown chips:
  - 🟢 Green (>7 days left)
  - 🟠 Orange (3 to 7 days left)
  - 🔴 Red (≤2 days left or "Last day today")
- **Pulsing "NEW" Badge:** Highlights newly issued circulars posted within the last 3 days.
- **Urgent Tag:** Flashes high-priority circular alerts with red indicator badges.

### 3. 🔍 Smart Global Search & Filters
- **Rotating Placeholder:** Ticks through short LPU search tips every ~4 seconds; pauses gracefully when focused or typing.
- **Advanced Filters Panel:** Multi-parameter search by Category, Priority (Urgent only), Date range (Today, 7 days, 30 days), and Sorting order (Newest, Oldest, Urgent).
- **Interactive Search Results:** Displays matching results across titles, circular numbers, issuing departments, descriptions, and categories with removable filter tags.

### 4. 📝 Faculty Notice Authoring (Teacher Role)
- **Auto Circular Numbering:** Automatically generates standardized circular numbers formatted as `[PREFIX]/[YEAR]/[SEQUENCE]` (e.g., `EXAM/2026/051`, `DEP/2026/029`) updating automatically whenever the category is switched.
- **File Uploads:** Supports up to 3 attachments per notice (up to 1MB each), stored safely in client-side storage as base64 data URLs.
- **Attachment Download:** Real uploaded files download immediately; demo notices generate verified document text files.
- **My Posts & Deletion:** Faculty can manage, edit, or delete notices authored by their account with modal confirmation safeguards.

### 5. 📅 Interactive Academic Calendar
- Full month calendar view displaying current date and university event dates.
- Visual indicator dots on dates featuring circular release dates or critical submission deadlines.
- Clicking any date lists all circulars and deadlines active on that specific day.

### 6. 🔔 Notification Center
- Synced unread badge counters on both the top navigation bar bell icon and sidebar link.
- Filters by All, Unread, Urgent, New, Reminder, and System notifications.
- Search notifications directly by keyword.
- Clicking any notification navigates directly to the relevant notice and automatically marks the notification as read.
- "Mark all as read" one-click action.

### 7. 👤 Complete Academic Profile & Customization
- Default Student and Teacher profiles with placeholder details; the name and details are set in `js/config.js`.
- Profile completeness progress meter.
- Profile photo upload with client-side canvas square thumbnail cropping and resizing.
- Real-time sync: updating your name immediately updates the top bar, avatar initial, and dashboard greeting.

### 8. ⚙️ Meta/Facebook Style Settings & Theme Customization
- **Dark Mode:** Dual-theme system using CSS variables with zero specificity clashes.
- **Accent Color Swatches:** Switch between 5 colors: Indigo `#5b5ef0`, LPU Orange `#f97316`, Emerald Green `#10b981`, Rose Pink `#ec4899`, and Teal `#14b8a6`.
- **Text Scale & Density:** Adjust reading font sizes (Small, Medium, Large) and Compact card view.
- **Data Management & Reset:** Clear individual datasets, hide demo entries, or perform a complete factory reset.

### 9. 💬 Administrative Help Desk & Contact
- Pre-filled read-only student verification details.
- Structured grievance submission generating validated `mailto:` dispatch tickets within email RFC specifications (<1800 chars).
- Frequently Asked Questions accordion.

---

## 🛡️ Architecture & Constraints Followed
- **Demo data:** 5 sample notices (one per category) and 12 sample notifications.
- **Images:** the LPU logos and campus photos are in the `images/` folder, listed in `js/config.js`.
- **No External Libraries or CDNs:** Pure HTML5, CSS3, and Vanilla JavaScript.
- **Browser Storage Safe:** All persistence is encapsulated through safe storage wrappers with in-memory fallbacks, preventing private/incognito mode exceptions.
- **Short, Maintainable Functions:** Every file starts with a short overview and each group of code has one comment block (SECTION 1, SECTION 2 ...) explaining it. There are no comments on every line.
- **Strict Separation of Config:** College names, contacts, and asset paths are isolated in `js/config.js`.
- **Zero Inactive UI:** Every button, card, chip, and link performs an active function.

---

## ⚠️ Known Demo Boundaries
1. **Client-side Storage:** Data is persisted in `localStorage` in the user's browser. It does not sync across multiple different computers or private incognito windows.
2. **File Upload Limit:** Attachments are capped at 1MB per file (max 3 files per notice) to conform to browser local storage quotas.

---

*Made with love ❤️ by **TEAM WebX***  
Lovely Professional University · 2026
