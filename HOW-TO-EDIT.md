# 🛠️ HOW TO EDIT LPU CAMPUS HUB — Beginner's Guide

> **Golden rule:** *Almost everything you will ever want to change lives in **one file**:
> `js/config.js`. You should rarely need to touch any other file.*

---

## 📂 1. Project Folder Structure

```
lpu-campus-hub/
├── index.html          ← the ONLY web page (all "pages" are sections inside it)
├── css/
│   └── style.css       ← colours, layout, dark mode (edit only if changing design)
├── js/
│   ├── config.js       ← ⭐⭐⭐ THE MASTER EDIT-ME FILE (images + names + contacts)
│   ├── data.js         ← demo notices/notifications + builds profiles FROM config.js
│   ├── storage.js      ← safe localStorage wrapper (core plumbing – don't edit)
│   ├── auth.js         ← login, roles, top-bar (reads profiles from data.js)
│   ├── notices.js      ← Home + Notices pages (reads images from config.js)
│   ├── post.js         ← teacher "Post Notice" form
│   ├── pages.js        ← Notifications, Calendar, Profile, Settings, Contact
│   └── app.js          ← router/search/toasts (core plumbing – don't edit)
└── images/             ← ⬇️ put your LPU pictures HERE
    ├── logo.png            (wide logo for the login screen)
    ├── logo-icon.png       (small round emblem in the top bar + tab icon)
    ├── campus.jpg          (wide home-page greeting banner photo)
    ├── campus2.jpg         ("Stay Connected" card photo)
    └── sidebar-art.jpg     (artwork at the bottom of the left sidebar)
```

---

## 🖼️ 2. How to Change the Images (2 ways — pick ONE)

### Way A — Easiest: replace the files (recommended)
1. Find/create your 5 LPU images (official logo from www.lpu.in works great).
2. **Rename your images to the exact names above** (logo.png, logo-icon.png,
   campus.jpg, campus2.jpg, sidebar-art.jpg).
3. Drop them into the `images/` folder, replacing the old files. Done!

### Way B — Keep your own file names
1. Put your images in the `images/` folder with any names you like,
   e.g. `images/lpu-official-logo.png`.
2. Open `js/config.js`, go to **section 3 (`images:`)** and update the path:
   ```js
   logo: "images/lpu-official-logo.png",
   ```
3. Save and reload the browser with **Ctrl + Shift + R** (hard reload).

**Image types:** PNG, JPG and SVG all work. Just keep the file name in `config.js` the same as the file in `images/`.

**Recommended sizes:** logo ~600×200 px (transparent PNG) · logo-icon ~200×200 px ·
banner ~1600×600 px · connectCard ~800×500 px · sidebarArt ~600×300 px.
Keep each file under ~300 KB so the site stays fast.

---

## 👤 3. How to Change the Default Student / Teacher Details

1. Open **`js/config.js`**.
2. **Section 4 (`studentProfile`)** → replace each placeholder (like `"Your Roll No"`) with the real detail. Keep `dob` empty or written like `2000-01-31`.
3. **Section 5 (`teacherProfile`)** → type the real faculty details.
4. **Bump the `version` string in section 1** (e.g. `"2.8.0"` → `"2.9.0"`).
   ⭐ *Why?* The browser **caches** the old profile in localStorage. The app
   compares your `version` with the cached one and refreshes automatically.
   Forgetting this is the #1 reason "my changes didn't show up!".
5. Reload with **Ctrl + Shift + R**.

> No other file needs editing — `data.js`, `auth.js` and `pages.js` all read
> from `config.js` automatically (see SECTION 4 of `data.js`).

---

## ⚠️ 4. The 3 Golden Rules of Editing JavaScript

| Rule | Example |
|------|---------|
| 1. Text stays inside `"double quotes"` | `name: "Rahul Verma",` |
| 2. Every line ends with a comma `,` (except the last of a block) | `phone: "+91 98XXX XXXXX",` |
| 3. Never delete `{ }`, `[ ]` or `,` structure | when in doubt, undo with **Ctrl + Z** |

If the page goes blank after an edit: open the browser console
(**F12 → Console**) — it tells you the exact file and line number of the mistake.

---

## 💾 5. Good to Know: How Data is Saved

- Logins, profiles, bookmarks and posted notices are saved in the browser's
  **localStorage** (file: `js/storage.js`). Nothing leaves the computer — this is
  a front-end only demo.
- To start completely fresh: open the site → **Settings → Reset Everything**.

---

*Made with love ❤️ by TEAM WebX*
