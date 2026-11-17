/**
 * ============================================================================
 * MATH 319: MATHEMATICAL MODELING — DATA & CONFIGURATION FILE (data.js)
 * Project: Math Lab Staffing and Student Flow
 * Author:  Yusuf Osuntuyi (Fall 2026)
 * ============================================================================
 *
 * HOW TO EDIT THIS FILE LATER:
 * 1. You can edit any number, tutor name, weekly hour limit, subject, or arrival
 *    rate directly in this file and refresh your browser.
 * 2. OR you can edit everything visually inside the Dashboard's "Data & Roster
 *    Editor" tab and click "Export data.js / JSON / CSV" or upload your Excel
 *    file ("Copy of Math Lab Participation Tracker 2026-2027.xlsx").
 * ============================================================================
 */

window.MATH_LAB_DEFAULT_DATA = {
  meta: {
    projectTitle: "Math Lab Staffing & Student Flow Optimization",
    course: "MATH 319 — Mathematical Modeling",
    author: "Yusuf Osuntuyi",
    instructor: "Prof. Ross",
    semester: "Fall 2026",
    dataSourceName: "Copy of Math Lab Participation Tracker 2026-2027.xlsx",
    operatingDays: ["Monday", "Tuesday", "Wednesday", "Thursday"],
    operatingHours: [
      { id: "09:00", label: "9:00 AM", short: "9am", hour24: 9 },
      { id: "10:00", label: "10:00 AM", short: "10am", hour24: 10 },
      { id: "11:00", label: "11:00 AM", short: "11am", hour24: 11 },
      { id: "12:00", label: "12:00 PM", short: "12pm", hour24: 12 },
      { id: "13:00", label: "1:00 PM", short: "1pm", hour24: 13 },
      { id: "14:00", label: "2:00 PM", short: "2pm", hour24: 14 },
      { id: "15:00", label: "3:00 PM", short: "3pm", hour24: 15 },
      { id: "16:00", label: "4:00 PM", short: "4pm", hour24: 16 }
    ]
  },

  // --------------------------------------------------------------------------
  // 1. MODEL PARAMETERS (Default Baseline)
  // --------------------------------------------------------------------------
  parameters: {
    avgSessionMinutes: 18,        // 1/mu: Average active tutor time per student (15 to 25 mins -> mu = 3.33/hr)
    targetWaitMinutes: 8,         // Target maximum average wait time (8-10 mins, Proposal Graph 2)
    idealStudentsPerTutor: 3.2,   // Beyond this load per tutor, students risk being "overlooked"
    maxRoomTutorCapacity: 10,     // Physical table/seating cap for tutors on duty at once
    minTutorsPerHour: 1,          // Minimum coverage bound at all open hours
    trafficSurgePercent: 0,       // Scenario slider: +30% for midterm/final exam weeks
    budgetCutPercent: 0,          // Scenario slider: -15% budget cut test
    demandSmoothingPercent: 0,    // Scenario slider: % of peak students nudged to quiet morning hours
    gaLabAllocationRatio: 1.0,    // Portion of GA weekly hours scheduled in Mon-Thu lab grid
    optimizationObjective: "balanced" // "balanced" | "subject_match" | "min_cost"
  },

  // --------------------------------------------------------------------------
  // 2. MATH SUBJECTS TRACKED IN THE LAB
  // --------------------------------------------------------------------------
  subjects: [
    { id: "alg",   name: "College Algebra", short: "Algebra", color: "#3b82f6", courseCode: "MATH 111" },
    { id: "trig",  name: "Trigonometry",    short: "Trig",    color: "#f59e0b", courseCode: "MATH 112" },
    { id: "pre",   name: "Precalculus",     short: "Precalc", color: "#8b5cf6", courseCode: "MATH 115" },
    { id: "calc",  name: "Calculus I/II",   short: "Calculus",color: "#10b981", courseCode: "MATH 161" },
    { id: "stats", name: "Statistics",      short: "Stats",   color: "#ec4899", courseCode: "MATH 200" }
  ],

  // --------------------------------------------------------------------------
  // 3. TUTOR ROSTER & CONSTRAINTS (From Math Lab Meeting Audio & Proposal)
  //    - 6 Graduate Assistants (GAs) @ 20 hrs/week (16 hrs Mon-Thu Lab + 4 hrs Fri/Prep,
  //      or configurable up to 20 hrs directly in the grid)
  //    - Donnie (10 hrs/wk), Mariah (10 hrs/wk), Taylor (10 hrs/wk), Joe (8 hrs/wk)
  //    - Additional Undergrad Student Workers @ 8 hrs/wk
  // --------------------------------------------------------------------------
  tutors: [
    {
      id: "ga-1",
      name: "Grad Assistant 1 (Alex)",
      role: "GA",
      tierLabel: "Graduate Assistant",
      contractHours: 20,
      monThuLabHours: 20, // 4 days x 4 hrs/day in Mon-Thu window (20h contract w/ Friday/prep)
      hourlyWage: 18.00,
      competencies: ["alg", "trig", "pre", "calc", "stats"],
      notes: "Full STEM coverage; strong in Calculus & Trigonometry"
    },
    {
      id: "ga-2",
      name: "Grad Assistant 2 (Brianna)",
      role: "GA",
      tierLabel: "Graduate Assistant",
      contractHours: 20,
      monThuLabHours: 20,
      hourlyWage: 18.00,
      competencies: ["alg", "pre", "calc", "stats"],
      notes: "Specializes in Applied Stats & Precalculus"
    },
    {
      id: "ga-3",
      name: "Grad Assistant 3 (Carlos)",
      role: "GA",
      tierLabel: "Graduate Assistant",
      contractHours: 20,
      monThuLabHours: 20,
      hourlyWage: 18.00,
      competencies: ["alg", "trig", "pre", "calc"],
      notes: "Strong Trigonometry & Calculus tutor"
    },
    {
      id: "ga-4",
      name: "Grad Assistant 4 (Diana)",
      role: "GA",
      tierLabel: "Graduate Assistant",
      contractHours: 20,
      monThuLabHours: 20,
      hourlyWage: 18.00,
      competencies: ["alg", "trig", "stats"],
      notes: "Gateway courses & Statistics specialist"
    },
    {
      id: "ga-5",
      name: "Grad Assistant 5 (Ethan)",
      role: "GA",
      tierLabel: "Graduate Assistant",
      contractHours: 20,
      monThuLabHours: 20,
      hourlyWage: 18.00,
      competencies: ["alg", "pre", "calc"],
      notes: "Algebra through Calculus sequence"
    },
    {
      id: "ga-6",
      name: "Grad Assistant 6 (Fatima)",
      role: "GA",
      tierLabel: "Graduate Assistant",
      contractHours: 20,
      monThuLabHours: 20,
      hourlyWage: 18.00,
      competencies: ["alg", "trig", "pre", "stats"],
      notes: "High engagement in Trig, Precalc & Stats"
    },
    {
      id: "ug-donnie",
      name: "Donnie",
      role: "UG_10",
      tierLabel: "Lead Undergrad (10h)",
      contractHours: 10,
      monThuLabHours: 10,
      hourlyWage: 13.50,
      competencies: ["alg", "trig", "pre", "calc"],
      notes: "Maxed at 10 hrs/wk; comfortable with Trig & Calc rushes"
    },
    {
      id: "ug-mariah",
      name: "Mariah",
      role: "UG_10",
      tierLabel: "Undergrad Tutor (10h)",
      contractHours: 10,
      monThuLabHours: 10,
      hourlyWage: 13.50,
      competencies: ["alg", "trig", "stats"],
      notes: "Maxed at 10 hrs/wk; strong with Trig & Statistics"
    },
    {
      id: "ug-taylor",
      name: "Taylor",
      role: "UG_10",
      tierLabel: "Undergrad Tutor (10h)",
      contractHours: 10,
      monThuLabHours: 10,
      hourlyWage: 13.50,
      competencies: ["alg", "pre", "stats"],
      notes: "Maxed at 10 hrs/wk; College Algebra & Precalculus focus"
    },
    {
      id: "ug-joe",
      name: "Joe",
      role: "UG_8",
      tierLabel: "Student Worker (8h)",
      contractHours: 8,
      monThuLabHours: 8,
      hourlyWage: 12.50,
      competencies: ["alg", "trig"],
      notes: "Maxed at 8 hrs/wk; great for 10am Trig & Algebra support"
    },
    {
      id: "ug-sam",
      name: "Sam (Student Worker)",
      role: "UG_8",
      tierLabel: "Student Worker (8h)",
      contractHours: 8,
      monThuLabHours: 8,
      hourlyWage: 12.50,
      competencies: ["alg", "stats"],
      notes: "8 hrs/wk student worker; gateway Algebra & Stats"
    },
    {
      id: "ug-maya",
      name: "Maya (Student Worker)",
      role: "UG_8",
      tierLabel: "Student Worker (8h)",
      contractHours: 8,
      monThuLabHours: 8,
      hourlyWage: 12.50,
      competencies: ["alg", "pre", "calc"],
      notes: "8 hrs/wk student worker; Precalc & Calculus"
    }
  ],

  // --------------------------------------------------------------------------
  // 4. CLASS SCHEDULE & ENROLLMENT DRIVERS (Why Students Arrive in Fluxes)
  //    Captures the phenomenon discussed in the meeting: when specific classes
  //    let out (e.g., 10:00 AM Trig release, 1:00 PM - 3:00 PM lectures),
  //    waves of students walk directly into the Math Lab.
  // --------------------------------------------------------------------------
  lecturers: [
    "Dr. Brandon Alberts",
    "Dr. Steve Blair",
    "Dr. Ovidiu Calin",
    "Dr. Stephanie Casey",
    "Dr. Rita Chattopadhyay",
    "Dr. John Curran",
    "Dr. Gabriela Dumitrascu",
    "Dr. David Folk",
    "Dr. Jason Gibson",
    "Dr. Khairul Islam",
    "Dr. Roxanne Katus",
    "Dr. Lon Mitchell",
    "Dr. Andrew Ross",
    "Dr. Tanweer Shapla",
    "Dr. Bingwu Wang",
    "Dr. Andrew Wilfong",
    "Dr. Peng Xu",
    "Prof. Mary Walker",
    "Prof. Fadia Haidar",
    "Prof. Adrienne Hirschfelder",
    "Prof. Sandra Johnson",
    "Prof. Ali Mahdavi",
    "Prof. Lisa Stop",
    "Prof. Michelle Rose"
  ],

  classSchedule: [
    {
      code: "MATH 112-01",
      subject: "trig",
      title: "Trigonometry (Morning Section)",
      lecturers: ["Dr. Andrew Ross"],
      days: ["Monday", "Wednesday"],
      classTime: "9:00 AM – 9:50 AM",
      releaseHour: "10:00",
      enrolled: 68,
      walkIns: 12,
      expectedLabCapturePct: 18,
      impactNote: "Major 10:00 AM Trigonometry rush right after class ends"
    },
    {
      code: "MATH 112-02",
      subject: "trig",
      title: "Trigonometry (Tue/Thu Morning)",
      lecturers: ["Dr. Roxanne Katus"],
      days: ["Tuesday", "Thursday"],
      classTime: "8:30 AM – 9:50 AM",
      releaseHour: "10:00",
      enrolled: 62,
      walkIns: 10,
      expectedLabCapturePct: 16,
      impactNote: "Creates 10:00 AM Trig bottleneck if Trig tutors aren't scheduled"
    },
    {
      code: "MATH 105-01/02",
      subject: "alg",
      title: "College Algebra (3 Lecture Sections)",
      lecturers: ["Prof. Mary Walker", "Dr. Gabriela Dumitrascu"],
      days: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      classTime: "12:00 PM – 12:50 PM",
      releaseHour: "13:00",
      enrolled: 145,
      walkIns: 15,
      expectedLabCapturePct: 10,
      impactNote: "Triggers the 1:00 PM afternoon influx of Algebra students"
    },
    {
      code: "MATH 115-01/02",
      subject: "pre",
      title: "Precalculus (Midday Combined)",
      lecturers: ["Dr. Lon Mitchell"],
      days: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      classTime: "1:00 PM – 1:50 PM",
      releaseHour: "14:00",
      enrolled: 110,
      walkIns: 12,
      expectedLabCapturePct: 11,
      impactNote: "Compounds the 2:00 PM peak queue buildup"
    },
    {
      code: "STAT 170-01/02",
      subject: "stats",
      title: "Elementary Statistics",
      lecturers: ["Dr. Khairul Islam", "Dr. Tanweer Shapla"],
      days: ["Monday", "Wednesday", "Thursday"],
      classTime: "1:00 PM – 2:15 PM",
      releaseHour: "14:00",
      enrolled: 95,
      walkIns: 9,
      expectedLabCapturePct: 9,
      impactNote: "Afternoon Statistics wave between 2:00 PM and 4:00 PM"
    },
    {
      code: "MATH 120-01",
      subject: "calc",
      title: "Calculus I",
      lecturers: ["Dr. John Curran"],
      days: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      classTime: "2:00 PM – 2:50 PM",
      releaseHour: "15:00",
      enrolled: 74,
      walkIns: 7,
      expectedLabCapturePct: 10,
      impactNote: "3:00 PM Calculus problem-session rush"
    }
  ],

  // --------------------------------------------------------------------------
  // 5. HOURLY STUDENT ARRIVAL RATES (lambda_t) BY DAY & SUBJECT
  //    Each entry represents average student arrivals/hr for [alg, trig, pre, calc, stats]
  //    Notice:
  //    - 9:00 AM & 11:00 AM: Quiet mornings (4-8 students total), yet heavily overstaffed
  //      in the current schedule.
  //    - 10:00 AM: Sharp Trigonometry spike (~11-12 Trig students out of ~17 total).
  //    - 1:00 PM - 4:00 PM: Severe afternoon rush (24 to 34 students/hr across subjects).
  // --------------------------------------------------------------------------
  hourlyArrivals: {
    Monday: {
      "09:00": { alg: 2, trig: 1, pre: 1, calc: 0, stats: 1 }, // Total: 5  (Quiet morning)
      "10:00": { alg: 2, trig: 11, pre: 2, calc: 1, stats: 1 }, // Total: 17 (10am Trig Class Release Spike!)
      "11:00": { alg: 2, trig: 2, pre: 1, calc: 1, stats: 1 }, // Total: 7  (Lull before lunch)
      "12:00": { alg: 4, trig: 2, pre: 3, calc: 2, stats: 2 }, // Total: 13 (Midday build-up)
      "13:00": { alg: 10, trig: 2, pre: 5, calc: 3, stats: 4 }, // Total: 24 (1pm Post-Lecture Rush)
      "14:00": { alg: 8, trig: 3, pre: 7, calc: 4, stats: 6 }, // Total: 28 (2pm Peak Lab Traffic Jam)
      "15:00": { alg: 6, trig: 2, pre: 5, calc: 6, stats: 4 }, // Total: 23 (3pm Calc/Precalc Wave)
      "16:00": { alg: 3, trig: 1, pre: 2, calc: 1, stats: 2 }  // Total: 9  (Late afternoon taper)
    },
    Tuesday: {
      "09:00": { alg: 2, trig: 1, pre: 1, calc: 0, stats: 0 }, // Total: 4
      "10:00": { alg: 2, trig: 10, pre: 1, calc: 1, stats: 1 }, // Total: 15 (10am Tue/Thu Trig Spike)
      "11:00": { alg: 2, trig: 1, pre: 1, calc: 1, stats: 1 }, // Total: 6
      "12:00": { alg: 4, trig: 1, pre: 3, calc: 2, stats: 2 }, // Total: 12
      "13:00": { alg: 9, trig: 2, pre: 5, calc: 2, stats: 4 }, // Total: 22
      "14:00": { alg: 8, trig: 2, pre: 6, calc: 4, stats: 5 }, // Total: 25
      "15:00": { alg: 6, trig: 2, pre: 4, calc: 5, stats: 4 }, // Total: 21
      "16:00": { alg: 3, trig: 1, pre: 1, calc: 1, stats: 2 }  // Total: 8
    },
    Wednesday: {
      "09:00": { alg: 2, trig: 1, pre: 1, calc: 1, stats: 1 }, // Total: 6
      "10:00": { alg: 3, trig: 11, pre: 2, calc: 1, stats: 1 }, // Total: 18 (10am Trig Rush)
      "11:00": { alg: 3, trig: 1, pre: 2, calc: 1, stats: 1 }, // Total: 8
      "12:00": { alg: 4, trig: 2, pre: 3, calc: 2, stats: 2 }, // Total: 13
      "13:00": { alg: 11, trig: 2, pre: 5, calc: 3, stats: 4 }, // Total: 25
      "14:00": { alg: 9, trig: 3, pre: 7, calc: 4, stats: 6 }, // Total: 29
      "15:00": { alg: 6, trig: 2, pre: 5, calc: 6, stats: 5 }, // Total: 24
      "16:00": { alg: 3, trig: 1, pre: 2, calc: 2, stats: 2 }  // Total: 10
    },
    Thursday: {
      "09:00": { alg: 1, trig: 1, pre: 1, calc: 1, stats: 0 }, // Total: 4
      "10:00": { alg: 2, trig: 10, pre: 2, calc: 1, stats: 1 }, // Total: 16 (10am Trig Rush)
      "11:00": { alg: 2, trig: 1, pre: 1, calc: 1, stats: 1 }, // Total: 6
      "12:00": { alg: 4, trig: 1, pre: 3, calc: 2, stats: 2 }, // Total: 12
      "13:00": { alg: 9, trig: 2, pre: 5, calc: 3, stats: 3 }, // Total: 22
      "14:00": { alg: 8, trig: 2, pre: 6, calc: 4, stats: 5 }, // Total: 25
      "15:00": { alg: 6, trig: 2, pre: 4, calc: 5, stats: 4 }, // Total: 21
      "16:00": { alg: 3, trig: 1, pre: 1, calc: 1, stats: 2 }  // Total: 8
    }
  },

  // --------------------------------------------------------------------------
  // 6. "WHAT HAPPENED THIS SEMESTER" — CURRENT / UNOPTIMIZED SCHEDULE
  //    Reflects the exact issue described in the audio & proposal:
  //    - Tutors were placed mostly by convenience / static morning blocks
  //    - 9am & 11am have 5-6 tutors sitting with only 4-8 students ("mainly tutors
  //      and no students")
  //    - 10am has only 2-3 tutors (and only 1 Trig-capable tutor) during the Trig rush
  //    - 1pm-3pm peak has only 4-5 tutors for 28-35 students ("traffic jam / overlooked")
  // --------------------------------------------------------------------------
  currentScheduleTutorsByHour: {
    Monday: {
      "09:00": ["ga-1", "ga-2", "ga-3", "ga-5", "ug-taylor", "ug-sam", "ug-maya"], // 7 tutors for 5 students!
      "10:00": ["ga-2", "ga-5", "ug-taylor"],                                      // 3 tutors (0 Trig specialists!) for 17 students (11 Trig!)
      "11:00": ["ga-1", "ga-2", "ga-3", "ga-4", "ga-5", "ga-6", "ug-donnie", "ug-joe"], // 8 tutors for 7 students!
      "12:00": ["ga-1", "ga-3", "ga-4", "ga-6", "ug-mariah", "ug-joe"],            // 6 tutors for 13 students
      "13:00": ["ga-4", "ga-6", "ug-mariah", "ug-sam"],                            // Only 4 tutors for 24 students!
      "14:00": ["ga-1", "ga-4", "ug-taylor", "ug-maya"],                           // Only 4 tutors for 28 students!
      "15:00": ["ga-3", "ga-6", "ug-donnie", "ug-sam"],                            // Only 4 tutors for 23 students!
      "16:00": ["ga-1", "ga-2", "ga-3", "ga-4", "ga-5", "ga-6", "ug-donnie", "ug-mariah"] // 8 tutors for 9 students!
    },
    Tuesday: {
      "09:00": ["ga-1", "ga-2", "ga-3", "ga-5", "ug-taylor", "ug-sam", "ug-maya"],
      "10:00": ["ga-2", "ga-5", "ug-sam"],
      "11:00": ["ga-1", "ga-2", "ga-3", "ga-4", "ga-5", "ga-6", "ug-donnie", "ug-mariah"],
      "12:00": ["ga-1", "ga-3", "ga-4", "ga-6", "ug-joe", "ug-maya"],
      "13:00": ["ga-2", "ga-6", "ug-taylor", "ug-sam"],
      "14:00": ["ga-1", "ga-4", "ug-mariah", "ug-joe"],
      "15:00": ["ga-3", "ga-6", "ug-donnie", "ug-maya"],
      "16:00": ["ga-1", "ga-2", "ga-3", "ga-4", "ga-5", "ga-6", "ug-taylor"]
    },
    Wednesday: {
      "09:00": ["ga-1", "ga-2", "ga-3", "ga-5", "ug-taylor", "ug-sam", "ug-maya"],
      "10:00": ["ga-2", "ga-5", "ug-taylor"],
      "11:00": ["ga-1", "ga-2", "ga-3", "ga-4", "ga-5", "ga-6", "ug-donnie", "ug-joe"],
      "12:00": ["ga-1", "ga-3", "ga-4", "ga-6", "ug-mariah", "ug-joe"],
      "13:00": ["ga-4", "ga-6", "ug-mariah", "ug-sam"],
      "14:00": ["ga-1", "ga-4", "ug-taylor", "ug-maya"],
      "15:00": ["ga-3", "ga-6", "ug-donnie", "ug-sam"],
      "16:00": ["ga-1", "ga-2", "ga-3", "ga-4", "ga-5", "ga-6", "ug-donnie", "ug-mariah"]
    },
    Thursday: {
      "09:00": ["ga-1", "ga-2", "ga-3", "ga-5", "ug-taylor", "ug-joe"],
      "10:00": ["ga-2", "ga-5", "ug-maya"],
      "11:00": ["ga-1", "ga-2", "ga-3", "ga-4", "ga-5", "ga-6", "ug-donnie", "ug-mariah"],
      "12:00": ["ga-1", "ga-3", "ga-4", "ga-6", "ug-joe", "ug-maya"],
      "13:00": ["ga-2", "ga-6", "ug-donnie", "ug-joe"],
      "14:00": ["ga-1", "ga-4", "ug-mariah", "ug-donnie"],
      "15:00": ["ga-3", "ga-6", "ug-mariah"],
      "16:00": ["ga-1", "ga-2", "ga-3", "ga-4", "ga-5", "ga-6"]
    }
  },

  // --------------------------------------------------------------------------
  // 7. QR CODE CHECK-IN / CHECK-OUT LOG (Tracks Who Comes In & Session Duration)
  //    Each record tracks student ID/name, course section, lecturer, subject,
  //    day, hour block, check-in time, check-out time, and durationMinutes (1/mu).
  // --------------------------------------------------------------------------
  qrConfig: {
    checkInUrl: "https://yusuf-osuntuyi.github.io/math319-math-lab-dashboard/checkin.html?mode=in",
    checkOutUrl: "https://yusuf-osuntuyi.github.io/math319-math-lab-dashboard/checkin.html?mode=out",
    autoSyncArrivals: true
  },

  // --------------------------------------------------------------------------
  // 8. GAMIFIED STUDENT PROFILES (Enables 1-Step "Name Only" QR Check-In)
  //    Each student's profile stores their First Name, Last Name, Major, Hobbies,
  //    16-Bit Cartoon Avatar, Course Section, Subject, and Lecturer!
  // --------------------------------------------------------------------------
  studentProfiles: [
    {
      name: "Jordan Miles",
      firstName: "Jordan",
      lastName: "Miles",
      major: "Mechanical Engineering",
      hobbies: "Robotics club, 16-bit retro RPGs, 3D printing, pickup basketball",
      avatarId: "pixel-wizard",
      courseCode: "MATH 112-01",
      subject: "trig",
      lecturer: "Dr. Andrew Ross",
      xp: 640,
      streak: 5,
      visits: 6,
      totalMinutes: 112,
      badges: ["🔥 5-Day Streak", "🎯 10 AM Trig Regular", "⏱️ 100+ Min Club"]
    },
    {
      name: "Amina Bello",
      firstName: "Amina",
      lastName: "Bello",
      major: "Computer Science",
      hobbies: "Hackathons, indie game design, matcha lattes, chess club",
      avatarId: "pixel-coder",
      courseCode: "MATH 112-01",
      subject: "trig",
      lecturer: "Dr. Andrew Ross",
      xp: 520,
      streak: 4,
      visits: 5,
      totalMinutes: 94,
      badges: ["🔥 4-Day Streak", "🎯 10 AM Trig Regular"]
    },
    {
      name: "Devon Brooks",
      firstName: "Devon",
      lastName: "Brooks",
      major: "Architecture & Urban Design",
      hobbies: "Digital sketching, lo-fi beats production, skateboarding",
      avatarId: "pixel-knight",
      courseCode: "MATH 105-01/02",
      subject: "alg",
      lecturer: "Prof. Mary Walker",
      xp: 310,
      streak: 3,
      visits: 3,
      totalMinutes: 64,
      badges: ["🔥 3-Day Streak", "📐 Algebra Builder"]
    },
    {
      name: "Chloe Nguyen",
      firstName: "Chloe",
      lastName: "Nguyen",
      major: "Aerospace Engineering",
      hobbies: "Model rocketry, stargazing, badminton, sci-fi novels",
      avatarId: "pixel-astro",
      courseCode: "MATH 112-02",
      subject: "trig",
      lecturer: "Dr. Roxanne Katus",
      xp: 890,
      streak: 7,
      visits: 8,
      totalMinutes: 156,
      badges: ["👑 Lab Legend", "🔥 7-Day Streak", "⏱️ 100+ Min Club", "⚡ 2x Quiet-Hour Strategist"]
    },
    {
      name: "Marcus Vance",
      firstName: "Marcus",
      lastName: "Vance",
      major: "Biochemistry (Pre-Med)",
      hobbies: "Campus EMS volunteer, acoustic guitar, marathon running",
      avatarId: "pixel-cat",
      courseCode: "MATH 115-01/02",
      subject: "pre",
      lecturer: "Dr. Lon Mitchell",
      xp: 430,
      streak: 3,
      visits: 4,
      totalMinutes: 86,
      badges: ["🔥 3-Day Streak", "🚀 Precalc Pro"]
    },
    {
      name: "Sofia Patel",
      firstName: "Sofia",
      lastName: "Patel",
      major: "Applied Mathematics & Data Science",
      hobbies: "Putnam math team, speedcubing, baking sourdough, tennis",
      avatarId: "pixel-hero",
      courseCode: "MATH 120-01",
      subject: "calc",
      lecturer: "Dr. John Curran",
      xp: 750,
      streak: 6,
      visits: 7,
      totalMinutes: 138,
      badges: ["🔥 6-Day Streak", "∫ Calculus Ace", "⏱️ 100+ Min Club"]
    },
    {
      name: "Liam O'Connor",
      firstName: "Liam",
      lastName: "O'Connor",
      major: "Quantitative Finance & Economics",
      hobbies: "Intramural soccer, sports analytics podcast, vintage synthesizers",
      avatarId: "pixel-ninja",
      courseCode: "STAT 170-01/02",
      subject: "stats",
      lecturer: "Dr. Khairul Islam",
      xp: 240,
      streak: 2,
      visits: 2,
      totalMinutes: 40,
      badges: ["📊 Stats Explorer", "⚡ 2x Quiet-Hour Strategist"]
    }
  ],

  attendanceLog: [
    {
      id: "chk-101",
      studentName: "Jordan Miles",
      courseCode: "MATH 112-01",
      lecturer: "Dr. Andrew Ross",
      subject: "trig",
      day: "Monday",
      hourBlock: "10:00",
      checkInTime: "10:02 AM",
      checkOutTime: null,
      durationMinutes: 18,
      xpEarned: 50,
      status: "active"
    },
    {
      id: "chk-102",
      studentName: "Amina Bello",
      courseCode: "MATH 112-01",
      lecturer: "Dr. Andrew Ross",
      subject: "trig",
      day: "Monday",
      hourBlock: "10:00",
      checkInTime: "10:05 AM",
      checkOutTime: null,
      durationMinutes: 15,
      xpEarned: 50,
      status: "active"
    },
    {
      id: "chk-103",
      studentName: "Devon Brooks",
      courseCode: "MATH 105-01/02",
      lecturer: "Prof. Mary Walker",
      subject: "alg",
      day: "Monday",
      hourBlock: "13:00",
      checkInTime: "1:04 PM",
      checkOutTime: null,
      durationMinutes: 22,
      xpEarned: 50,
      status: "active"
    },
    {
      id: "chk-098",
      studentName: "Chloe Nguyen",
      courseCode: "MATH 112-02",
      lecturer: "Dr. Roxanne Katus",
      subject: "trig",
      day: "Monday",
      hourBlock: "10:00",
      checkInTime: "9:56 AM",
      checkOutTime: "10:15 AM",
      durationMinutes: 19,
      xpEarned: 145,
      status: "completed"
    },
    {
      id: "chk-099",
      studentName: "Marcus Vance",
      courseCode: "MATH 115-01/02",
      lecturer: "Dr. Lon Mitchell",
      subject: "pre",
      day: "Monday",
      hourBlock: "14:00",
      checkInTime: "2:03 PM",
      checkOutTime: "2:25 PM",
      durationMinutes: 22,
      xpEarned: 160,
      status: "completed"
    },
    {
      id: "chk-100",
      studentName: "Sofia Patel",
      courseCode: "MATH 120-01",
      lecturer: "Dr. John Curran",
      subject: "calc",
      day: "Tuesday",
      hourBlock: "15:00",
      checkInTime: "3:01 PM",
      checkOutTime: "3:20 PM",
      durationMinutes: 19,
      xpEarned: 145,
      status: "completed"
    }
  ]
};

// ============================================================================
// 16-BIT CARTOON PIXEL-ART AVATAR COLLECTION (8 Retro RPG / Campus Characters)
// Rendered via crisp 16x16 pixel grids (shape-rendering="crispEdges")
// ============================================================================
window.PIXEL_AVATARS_16BIT = [
  {
    id: "pixel-wizard",
    label: "16-Bit Math Mage",
    bg: "#1e1b4b",
    svgBody: `
      <rect width="16" height="16" fill="#1e1b4b"/>
      <rect x="6" y="1" width="4" height="1" fill="#7c3aed"/>
      <rect x="5" y="2" width="6" height="1" fill="#7c3aed"/>
      <rect x="7" y="2" width="2" height="1" fill="#facc15"/>
      <rect x="4" y="3" width="8" height="1" fill="#6d28d9"/>
      <rect x="2" y="4" width="12" height="1" fill="#facc15"/>
      <rect x="1" y="5" width="14" height="1" fill="#5b21b6"/>
      <rect x="4" y="6" width="8" height="5" fill="#fed7aa"/>
      <rect x="4" y="7" width="3" height="2" fill="#38bdf8"/>
      <rect x="9" y="7" width="3" height="2" fill="#38bdf8"/>
      <rect x="7" y="7" width="2" height="1" fill="#facc15"/>
      <rect x="5" y="7" width="1" height="1" fill="#ffffff"/>
      <rect x="10" y="7" width="1" height="1" fill="#ffffff"/>
      <rect x="6" y="10" width="4" height="1" fill="#ea580c"/>
      <rect x="3" y="11" width="10" height="5" fill="#6d28d9"/>
      <rect x="6" y="11" width="4" height="5" fill="#facc15"/>
      <rect x="7" y="12" width="2" height="3" fill="#4c1d95"/>
    `
  },
  {
    id: "pixel-coder",
    label: "Cyber Hoodie Hacker",
    bg: "#042f2e",
    svgBody: `
      <rect width="16" height="16" fill="#042f2e"/>
      <rect x="4" y="2" width="8" height="2" fill="#0d9488"/>
      <rect x="3" y="4" width="10" height="7" fill="#14b8a6"/>
      <rect x="4" y="4" width="8" height="6" fill="#f5d0fe"/>
      <rect x="5" y="5" width="6" height="5" fill="#fdba74"/>
      <rect x="4" y="6" width="8" height="2" fill="#22d3ee"/>
      <rect x="5" y="6" width="2" height="1" fill="#ffffff"/>
      <rect x="9" y="6" width="2" height="1" fill="#ffffff"/>
      <rect x="7" y="9" width="2" height="1" fill="#9a3412"/>
      <rect x="2" y="6" width="1" height="3" fill="#10b981"/>
      <rect x="13" y="6" width="1" height="3" fill="#10b981"/>
      <rect x="2" y="11" width="12" height="5" fill="#0f766e"/>
      <rect x="6" y="11" width="4" height="4" fill="#2dd4bf"/>
    `
  },
  {
    id: "pixel-knight",
    label: "Paladin of Pi",
    bg: "#1e293b",
    svgBody: `
      <rect width="16" height="16" fill="#1e293b"/>
      <rect x="6" y="1" width="5" height="1" fill="#ef4444"/>
      <rect x="7" y="2" width="5" height="1" fill="#dc2626"/>
      <rect x="4" y="3" width="8" height="8" fill="#cbd5e1"/>
      <rect x="5" y="4" width="6" height="2" fill="#e2e8f0"/>
      <rect x="4" y="6" width="8" height="2" fill="#0f172a"/>
      <rect x="5" y="6" width="2" height="1" fill="#38bdf8"/>
      <rect x="9" y="6" width="2" height="1" fill="#38bdf8"/>
      <rect x="7" y="8" width="2" height="3" fill="#facc15"/>
      <rect x="3" y="11" width="10" height="5" fill="#94a3b8"/>
      <rect x="5" y="12" width="6" height="4" fill="#ef4444"/>
      <rect x="7" y="12" width="2" height="4" fill="#facc15"/>
    `
  },
  {
    id: "pixel-astro",
    label: "Starlight Astronaut",
    bg: "#090d16",
    svgBody: `
      <rect width="16" height="16" fill="#090d16"/>
      <rect x="2" y="2" width="1" height="1" fill="#fde047"/>
      <rect x="13" y="3" width="1" height="1" fill="#38bdf8"/>
      <rect x="4" y="2" width="8" height="9" fill="#f8fafc"/>
      <rect x="3" y="4" width="10" height="6" fill="#e2e8f0"/>
      <rect x="4" y="4" width="8" height="5" fill="#f59e0b"/>
      <rect x="5" y="5" width="6" height="3" fill="#fbbf24"/>
      <rect x="5" y="5" width="2" height="1" fill="#fef08a"/>
      <rect x="3" y="11" width="10" height="5" fill="#f8fafc"/>
      <rect x="4" y="11" width="8" height="1" fill="#f97316"/>
      <rect x="6" y="13" width="4" height="2" fill="#3b82f6"/>
    `
  },
  {
    id: "pixel-cat",
    label: "Prof. Whiskers 16-Bit",
    bg: "#31102f",
    svgBody: `
      <rect width="16" height="16" fill="#31102f"/>
      <rect x="3" y="2" width="2" height="3" fill="#fb923c"/>
      <rect x="11" y="2" width="2" height="3" fill="#fb923c"/>
      <rect x="4" y="3" width="1" height="2" fill="#fda4af"/>
      <rect x="11" y="3" width="1" height="2" fill="#fda4af"/>
      <rect x="3" y="4" width="10" height="7" fill="#fb923c"/>
      <rect x="5" y="5" width="6" height="6" fill="#ffedd5"/>
      <rect x="4" y="6" width="3" height="2" fill="#0f172a"/>
      <rect x="9" y="6" width="3" height="2" fill="#0f172a"/>
      <rect x="5" y="6" width="1" height="1" fill="#ffffff"/>
      <rect x="10" y="6" width="1" height="1" fill="#ffffff"/>
      <rect x="7" y="8" width="2" height="1" fill="#f43f5e"/>
      <rect x="3" y="11" width="10" height="5" fill="#1e293b"/>
      <rect x="6" y="11" width="4" height="2" fill="#10b981"/>
      <rect x="7" y="11" width="2" height="2" fill="#34d399"/>
    `
  },
  {
    id: "pixel-ninja",
    label: "Shadow Calculus Ninja",
    bg: "#172554",
    svgBody: `
      <rect width="16" height="16" fill="#172554"/>
      <rect x="4" y="2" width="8" height="9" fill="#0f172a"/>
      <rect x="3" y="4" width="10" height="2" fill="#ef4444"/>
      <rect x="13" y="5" width="2" height="2" fill="#dc2626"/>
      <rect x="4" y="6" width="8" height="2" fill="#fde68a"/>
      <rect x="5" y="6" width="2" height="2" fill="#0f172a"/>
      <rect x="9" y="6" width="2" height="2" fill="#0f172a"/>
      <rect x="5" y="6" width="1" height="1" fill="#ffffff"/>
      <rect x="9" y="6" width="1" height="1" fill="#ffffff"/>
      <rect x="3" y="11" width="10" height="5" fill="#0f172a"/>
      <rect x="5" y="11" width="6" height="5" fill="#1e293b"/>
      <rect x="7" y="12" width="2" height="3" fill="#ef4444"/>
    `
  },
  {
    id: "pixel-robot",
    label: "TI-84 Mecha Bot",
    bg: "#1e1b4b",
    svgBody: `
      <rect width="16" height="16" fill="#1e1b4b"/>
      <rect x="7" y="1" width="2" height="1" fill="#f43f5e"/>
      <rect x="7" y="2" width="2" height="2" fill="#94a3b8"/>
      <rect x="3" y="4" width="10" height="7" fill="#64748b"/>
      <rect x="4" y="5" width="8" height="5" fill="#cbd5e1"/>
      <rect x="5" y="6" width="2" height="2" fill="#06b6d4"/>
      <rect x="9" y="6" width="2" height="2" fill="#06b6d4"/>
      <rect x="5" y="9" width="6" height="1" fill="#0f172a"/>
      <rect x="6" y="9" width="1" height="1" fill="#22c55e"/>
      <rect x="8" y="9" width="1" height="1" fill="#22c55e"/>
      <rect x="10" y="9" width="1" height="1" fill="#22c55e"/>
      <rect x="3" y="11" width="10" height="5" fill="#475569"/>
      <rect x="6" y="12" width="4" height="3" fill="#facc15"/>
    `
  },
  {
    id: "pixel-hero",
    label: "Crowned RPG Scholar",
    bg: "#064e3b",
    svgBody: `
      <rect width="16" height="16" fill="#064e3b"/>
      <rect x="4" y="1" width="1" height="2" fill="#facc15"/>
      <rect x="7" y="1" width="2" height="2" fill="#facc15"/>
      <rect x="11" y="1" width="1" height="2" fill="#facc15"/>
      <rect x="4" y="3" width="8" height="1" fill="#eab308"/>
      <rect x="7" y="3" width="2" height="1" fill="#ef4444"/>
      <rect x="3" y="4" width="10" height="3" fill="#78350f"/>
      <rect x="4" y="5" width="8" height="6" fill="#fdba74"/>
      <rect x="5" y="7" width="2" height="2" fill="#1e3a8a"/>
      <rect x="9" y="7" width="2" height="2" fill="#1e3a8a"/>
      <rect x="5" y="7" width="1" height="1" fill="#ffffff"/>
      <rect x="9" y="7" width="1" height="1" fill="#ffffff"/>
      <rect x="7" y="10" width="2" height="1" fill="#c2410c"/>
      <rect x="3" y="11" width="10" height="5" fill="#10b981"/>
      <rect x="6" y="11" width="4" height="5" fill="#fef08a"/>
    `
  }
];

window.renderStudentAvatar = function (profileOrId, sizePx) {
  const sz = sizePx || 36;
  const list = window.PIXEL_AVATARS_16BIT || [];
  if (profileOrId && typeof profileOrId === "object" && profileOrId.customAvatarDataUrl) {
    return `<img src="${profileOrId.customAvatarDataUrl}" alt="${(profileOrId.name || 'Student').replace(/"/g, '&quot;')}" width="${sz}" height="${sz}" style="width:${sz}px;height:${sz}px;border-radius:8px;object-fit:cover;border:2px solid var(--accent-primary);flex-shrink:0;image-rendering:pixelated;" />`;
  }
  const avatarId = (profileOrId && typeof profileOrId === "object") ? profileOrId.avatarId : profileOrId;
  const found = list.find(a => a.id === avatarId) || list[0];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="${sz}" height="${sz}" shape-rendering="crispEdges" role="img" aria-label="${found.label}" style="width:${sz}px;height:${sz}px;border-radius:8px;border:2px solid rgba(59,130,246,0.55);flex-shrink:0;display:inline-block;vertical-align:middle;">${found.svgBody}</svg>`;
};

