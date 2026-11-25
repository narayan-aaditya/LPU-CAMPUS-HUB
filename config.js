/*
 * config.js — THE ONE FILE YOU EDIT
 * Everything a beginner may want to change lives here: site name, images,
 * default student/teacher details, help desk details and quotes.
 * Other files only READ these values; they never need to be edited.
 *
 * Three rules while editing:
 *   1. Keep text inside "double quotes".
 *   2. Keep the comma at the end of every line.
 *   3. Never delete the { } or [ ] brackets.
 * If the page goes blank, press F12 and open Console to see the mistake.
 */

const config = {

  /*
   * SECTION 1 — SITE NAME AND COLLEGE
   * Shown in the top bar, the browser tab and the login page.
   * Change "version" whenever you edit profiles, so the browser
   * forgets the old saved profile and shows your new one.
   */
  siteName: "LPU Campus Hub",
  subtitle: "Notice & Circular Management",
  collegeName: "Lovely Professional University",
  collegeTagline: "Transforming Education, Transforming India",
  campusLocation: "Campus Address",
  version: "2.8.0",

  /*
   * SECTION 2 — TEAM CREDIT
   * Shown at the bottom of the left sidebar.
   */
  teamName: "TEAM WebX",
  teamCredit: "Made with love ❤️",

  /*
   * SECTION 3 — IMAGES
   * Each value is the path of a file inside the "images" folder.
   * To use your own picture: put it in "images" and change the file name here.
   *   logo        - wide logo on the login page
   *   logoIcon    - small round logo in the top bar and browser tab
   *   banner      - wide campus picture behind the greeting on Home
   *   connectCard - picture inside the dark "Stay Connected" card
   *   sidebarArt  - small picture at the bottom of the left sidebar
   */
  images: {
    logo: "images/logo.png",
    logoIcon: "images/logo-icon.png",
    banner: "images/campus.jpg",
    connectCard: "images/campus2.jpg",
    sidebarArt: "images/sidebar-art.jpg"
  },

  /*
   * SECTION 4 — DEFAULT STUDENT PROFILE
   * Loaded by "Try as Student". It fills the Profile page, the top bar
   * and the Contact Us page. Replace each placeholder with real details.
   * Leave avatar as "" to show a coloured initial instead of a photo.
   * Keep dob as "" or a date written like 2000-01-31.
   */
  studentProfile: {
    name: "TEAM WebX",
    role: "Student",
    rollNo: "Your Roll No",
    regNo: "Your Registration No",
    course: "Your Course",
    department: "Your Department",
    section: "Your Section",
    batch: "Your Batch",
    semester: "Your Semester",
    gender: "Your Gender",
    dob: "",
    email: "Your Email",
    phone: "Your Phone",
    address: "Your Address",
    city: "Your City",
    state: "Your State",
    pin: "Your Pin Code",
    emergencyContact: "Parent or Guardian Name",
    emergencyPhone: "Parent or Guardian Phone",
    avatar: ""
  },

  /*
   * SECTION 5 — DEFAULT TEACHER PROFILE
   * Loaded by "Try as Teacher". Teachers can post, edit and delete notices.
   */
  teacherProfile: {
    name: "Teacher Name",
    role: "Teacher",
    empId: "Your Employee ID",
    designation: "Your Designation",
    department: "Your Department",
    subjects: "Your Subjects",
    cabin: "Your Cabin",
    email: "Your Email",
    phone: "Your Phone",
    address: "Your Address",
    avatar: ""
  },

  /*
   * SECTION 6 — HELP DESK
   * Shown on the Contact Us page. helpEmail must be a real-looking
   * email address, because the "Send Email" button opens the email app with it.
   */
  helpEmail: "helpdesk@example.com",
  helpPhone: "Help Desk Phone",
  helpHours: "Help Desk Timings",
  helpOffice: "Help Desk Office",

  /*
   * SECTION 7 — SEARCH BAR TIPS
   * Short hints that rotate inside the search bar. Keep each one under
   * about 30 characters so it fits the bar and nothing gets hidden.
   * One tip per line, each in quotes, with a comma after it
   * (no comma after the last one).
   */
  searchTips: [
    "Try: End semester datesheet",
    "Try: Fee last date",
    "Try: Google & Amazon drive",
    "Try: Hostel or mess notice",
    "Try: One India fest",
    "Try: Central Library hours",
    "Tip: Press Enter to search",
    "Tip: Use Filters for urgent",
    "Tip: Star a notice to save it",
    "Tip: Check UMS for hall tickets"
  ],

  /*
   * SECTION 8 — QUOTES
   * These appear in the Home quote card and on the login page.
   * One quote per line, each in quotes, with a comma after it
   * (no comma after the last one).
   */
  quotes: [
    "Big dreams need good information. Stay connected! 🚀",
    "Consistency is the bridge between college dreams and career reality. 🌟",
    "Every deadline met is a step closer to your graduation cap. 🎓",
    "Knowledge shared is knowledge multiplied. Check circulars daily! 📚",
    "Excellence is not an act, but a habit. Keep learning! ✨",
    "Opportunity knocks when preparation meets notice boards. 💼",
    "Stay informed, stay ahead of the curve. LPU Campus Hub. ⚡",
    "Never miss a placement drive or exam schedule again! 🌟"
  ]
};
