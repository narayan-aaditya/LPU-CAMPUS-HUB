/*
 * data.js — SAMPLE DATA AND SMALL HELPER FUNCTIONS
 * Holds the 5 demo notices (one per category), the demo notifications,
 * the default student/teacher profiles and a few helpers that other files use.
 * Profiles and quotes are NOT typed here: they are read from config.js.
 * Only edit this file if you want different sample notices or notifications.
 * Loaded after config.js and before all other scripts.
 */

/*
 * SECTION 1 — DATE HELPERS
 * dayOffset gives a date some days from today (so samples never look old),
 * formatDate makes a date readable, and getDaysRemaining / getDeadlineStatus
 * work out the "days left" label and its colour.
 */
function dayOffset(days) {
  const dateObj = new Date();
  dateObj.setDate(dateObj.getDate() + days);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthIndex = parseInt(parts[1], 10) - 1;
  const dayNum = parseInt(parts[2], 10);
  const yearNum = parts[0];
  return `${dayNum} ${monthNames[monthIndex] || ""} ${yearNum}`;
}

function getDaysRemaining(expiresStr) {
  if (!expiresStr) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiresStr);
  exp.setHours(0, 0, 0, 0);
  const diffMs = exp.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function getDeadlineStatus(expiresStr) {
  const days = getDaysRemaining(expiresStr);
  if (days < 0) {
    return { label: "Expired", className: "deadline-expired" };
  }
  if (days === 0) {
    return { label: "Last day today", className: "deadline-critical" };
  }
  if (days <= 2) {
    return { label: `${days} day${days === 1 ? "" : "s"} left`, className: "deadline-urgent" };
  }
  if (days <= 7) {
    return { label: `${days} days left`, className: "deadline-warning" };
  }
  return { label: `${days} days left`, className: "deadline-normal" };
}

/*
 * SECTION 2 — TEXT AND CATEGORY HELPERS
 * escapeHtml makes user-typed text safe to show on the page.
 * getCategoryBadgeClass and getCategoryIcon give each category its colour and emoji.
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getCategoryBadgeClass(category) {
  const cat = (category || "").toLowerCase();
  if (cat === "exams") return "badge-exams";
  if (cat === "fees") return "badge-fees";
  if (cat === "events") return "badge-events";
  if (cat === "placement") return "badge-placement";
  return "badge-department";
}

function getCategoryIcon(category) {
  const cat = (category || "").toLowerCase();
  if (cat === "exams") return "📝";
  if (cat === "fees") return "💳";
  if (cat === "events") return "🎪";
  if (cat === "placement") return "💼";
  return "🏛️";
}

/*
 * SECTION 3 — QUOTES AND SEARCH TIPS
 * Uses the quotes and the search bar tips from config.js. If config.js has
 * none, built-in ones are used so the site never shows an empty text.
 */
const quotesList = (typeof config !== "undefined" && Array.isArray(config.quotes) && config.quotes.length > 0)
  ? config.quotes
  : [
      "Big dreams need good information. Stay connected! 🚀",
      "Consistency is the bridge between college dreams and career reality. 🌟",
      "Every deadline met is a step closer to your graduation cap. 🎓",
      "Knowledge shared is knowledge multiplied. Check circulars daily! 📚",
      "Excellence is not an act, but a habit. Keep learning! ✨",
      "Your time at Lovely Professional University shapes tomorrow's leader. 🏛️",
      "Opportunity knocks when preparation meets notice boards. 💼",
      "Stay informed, stay ahead of the curve. LPU Campus Hub. ⚡"
    ];

const searchTipsList = (typeof config !== "undefined" && Array.isArray(config.searchTips) && config.searchTips.length > 0)
  ? config.searchTips
  : ["Search notices and circulars"];

/*
 * SECTION 4 — DEFAULT PROFILES
 * Each profile starts with safe empty values and is then overwritten by the
 * details typed in config.js. Edit config.js, not this part.
 * The two field lists below are the fields counted by the
 * "profile completeness" bar on the Profile page.
 */
const studentProfileFields = [
  "name", "rollNo", "regNo", "course", "department", "section", "batch",
  "semester", "gender", "dob", "email", "phone", "address", "city",
  "state", "pin", "emergencyContact", "emergencyPhone"
];

const teacherProfileFields = [
  "name", "empId", "designation", "department", "subjects",
  "cabin", "email", "phone", "address"
];

const demoStudentProfile = Object.assign({
  name: "Student",
  role: "Student",
  rollNo: "", regNo: "", course: "", department: "", section: "",
  batch: "", semester: "", gender: "", dob: "", email: "", phone: "",
  address: "", city: "", state: "", pin: "",
  emergencyContact: "", emergencyPhone: "",
  avatar: ""
}, (typeof config !== "undefined" && config.studentProfile) ? config.studentProfile : {});

const demoTeacherProfile = Object.assign({
  name: "Faculty Member",
  role: "Teacher",
  empId: "", designation: "", department: "", subjects: "",
  cabin: "", email: "", phone: "", address: "",
  avatar: ""
}, (typeof config !== "undefined" && config.teacherProfile) ? config.teacherProfile : {});

/*
 * SECTION 5 — DEMO NOTICES
 * One sample notice per category. To add another, copy one block,
 * give it a new id and change the text.
 */
function getDemoNotices() {
  return [
    {
      id: "demo-dep-1",
      title: "Revised Lab Timings for Block 34 Computer Labs",
      category: "Department",
      circular: "DEP/2026/012",
      department: "School of Computer Science & Engineering",
      posted: dayOffset(-1),
      expires: dayOffset(14),
      urgent: false,
      attachments: [{ name: "Lab_Schedule_Block34.pdf", size: 482100, type: "application/pdf" }],
      description: "All computer science labs will remain operational until 9:00 PM on weekdays to support final year capstone project development and competitive programming practice sessions.",
      isDemo: true,
      postedBy: "School of Computer Science & Engineering"
    },
    {
      id: "demo-exam-1",
      title: "End Semester Theory Examination Schedule Nov-Dec 2026",
      category: "Exams",
      circular: "EXAM/2026/051",
      department: "Examination Division",
      posted: dayOffset(-1),
      expires: dayOffset(18),
      urgent: false,
      attachments: [{ name: "End_Sem_DateSheet_2026.pdf", size: 1048576, type: "application/pdf" }],
      description: "The complete datesheet for regular and re-appear theory examinations has been uploaded to the UMS portal. Students must carry valid admit cards and ID cards.",
      isDemo: true,
      postedBy: "Controller of Examinations"
    },
    {
      id: "demo-fee-1",
      title: "Last Date for Spring Term Tuition Fee Payment (Without Late Fine)",
      category: "Fees",
      circular: "FEE/2026/031",
      department: "Finance and Accounts Division",
      posted: dayOffset(-2),
      expires: dayOffset(5),
      urgent: true,
      attachments: [{ name: "Fee_Structure_Spring_2026.pdf", size: 712000, type: "application/pdf" }],
      description: "All students are advised to clear outstanding semester tuition and laboratory fees before the deadline to prevent automatic course registration cancellation.",
      isDemo: true,
      postedBy: "Finance & Accounts Division"
    },
    {
      id: "demo-evt-1",
      title: "One India Annual Cultural Festival 2026 Registrations",
      category: "Events",
      circular: "EVT/2026/042",
      department: "Division of Student Welfare",
      posted: dayOffset(0),
      expires: dayOffset(10),
      urgent: false,
      attachments: [{ name: "OneIndia_Rules_Rulebook.pdf", size: 950000, type: "application/pdf" }],
      description: "Celebrating India's vibrant diversity across states! Auditions for state dance ensembles, musical bands, street play, and regional food stalls are now live.",
      isDemo: true,
      postedBy: "Division of Student Welfare"
    },
    {
      id: "demo-plm-1",
      title: "Campus Recruitment Drive: Google & Amazon Software Engineer Interns",
      category: "Placement",
      circular: "PLM/2026/077",
      department: "Centre for Professional Enhancement",
      posted: dayOffset(-1),
      expires: dayOffset(7),
      urgent: false,
      attachments: [{ name: "Job_Description_SDE.pdf", size: 740000, type: "application/pdf" }],
      description: "Pre-placement talk and online coding screening for 2026 graduating batch students with CGPA 7.0 and above. Eligible students must apply via UMS Placement Tab.",
      isDemo: true,
      postedBy: "Centre for Professional Enhancement"
    }
  ];
}

/*
 * SECTION 6 — DEMO NOTIFICATIONS
 * Sample alerts. noticeId is the notice that opens when the alert is clicked
 * (null means it opens nothing).
 */
function getDemoNotifications() {
  return [
    {
      id: "notif-1",
      type: "Urgent",
      title: "Urgent: Fee Payment Deadline Approaching",
      text: "Last date for Spring Term tuition fee payment without late fine is in 5 days.",
      noticeId: "demo-fee-1",
      time: "1 hour ago",
      read: false
    },
    {
      id: "notif-2",
      type: "Urgent",
      title: "Urgent: Hall Ticket Generation Portal Open",
      text: "Admit cards for upcoming term examinations are ready for download.",
      noticeId: "demo-exam-1",
      time: "3 hours ago",
      read: false
    },
    {
      id: "notif-3",
      type: "New",
      title: "New Notice: Google & Amazon Placement Drive",
      text: "Pre-placement talk and registration link active for 2026 engineering batch.",
      noticeId: "demo-plm-1",
      time: "5 hours ago",
      read: false
    },
    {
      id: "notif-4",
      type: "New",
      title: "New Notice: One India 2026 Cultural Festival",
      text: "Auditions for cultural performances and state stalls are now open.",
      noticeId: "demo-evt-1",
      time: "1 day ago",
      read: false
    },
    {
      id: "notif-5",
      type: "Urgent",
      title: "Urgent: Department Notice for Computer Labs",
      text: "Block 34 computer labs now run until 9:00 PM. Check the new timings.",
      noticeId: "demo-dep-1",
      time: "1 day ago",
      read: false
    },
    {
      id: "notif-6",
      type: "Reminder",
      title: "Reminder: Lab Timings Have Changed",
      text: "Labs stay open late on weekdays during capstone project season.",
      noticeId: "demo-dep-1",
      time: "2 days ago",
      read: true
    },
    {
      id: "notif-7",
      type: "New",
      title: "New Notice: End Semester DateSheet Released",
      text: "The official datesheet for theory evaluations is uploaded to the portal.",
      noticeId: "demo-exam-1",
      time: "2 days ago",
      read: true
    },
    {
      id: "notif-8",
      type: "Reminder",
      title: "Reminder: One India Festival Auditions",
      text: "Auditions for dance, music and street play close soon.",
      noticeId: "demo-evt-1",
      time: "3 days ago",
      read: true
    },
    {
      id: "notif-9",
      type: "Reminder",
      title: "Reminder: Google & Amazon Drive Registration",
      text: "Apply through the UMS Placement tab before the deadline.",
      noticeId: "demo-plm-1",
      time: "4 days ago",
      read: true
    },
    {
      id: "notif-10",
      type: "System",
      title: "System Update: Welcome to LPU Campus Hub",
      text: "Your notice and circular dashboard has been configured by TEAM WebX.",
      noticeId: null,
      time: "5 days ago",
      read: true
    },
    {
      id: "notif-11",
      type: "System",
      title: "System Tip: Customize Notification Preferences",
      text: "Select categories you follow in Settings to filter alerts.",
      noticeId: null,
      time: "6 days ago",
      read: true
    },
    {
      id: "notif-12",
      type: "Reminder",
      title: "Reminder: Tuition Fee Deadline",
      text: "Clear pending fees online to avoid course registration cancellation.",
      noticeId: "demo-fee-1",
      time: "1 week ago",
      read: true
    }
  ];
}

/*
 * SECTION 7 — DEFAULT SAVED AND RECENTLY VIEWED
 * Ids of the notices shown as saved and recently viewed before the user does anything.
 */
const demoSavedIds = ["demo-exam-1", "demo-fee-1", "demo-plm-1", "demo-evt-1", "demo-dep-1"];

const demoRecentIds = ["demo-exam-1", "demo-dep-1", "demo-plm-1", "demo-fee-1", "demo-evt-1"];
