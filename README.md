# Project: FocusForge - Smart Study Planner & Productivity Suite
## Software Requirement Specification
**Document Version:** 1.0.0  
**Standard:** IEEE Std 830-1998 / ISO/IEC/IEEE 29148  
**Date:** September 2026  

---

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to provide a complete Software Requirements Specification (SRS) for **FocusForge**, an all-in-one web-based academic planner, habit tracker, and smart focus-session environment. This document defines the functional and non-functional requirements, data architecture, user interface specifications, and operating constraints of the system.

### 1.2 Scope
**FocusForge** is a client-side single-page application (SPA) backed by Google Firebase services (Firebase Authentication and Cloud Firestore). The system is engineered to help students and self-learners organize coursework, manage assignment deadlines, track exam schedules, enforce distraction-free study intervals using a drift-free Pomodoro timer with real-time idle tracking, access language compilers, and review productivity analytics.

**Core Capabilities:**
- User Authentication (Email/Password & Google OAuth).
- Central Dashboard with daily streaks and active schedule tracking.
- Interactive 7-day academic timetable engine with live class status indicators.
- Assignment and task manager with priority tagging, date filters, and status detection (Upcoming, Due Today, Overdue).
- Exam milestone tracker with day countdowns and syllabus progress calculation.
- Background Web Worker-driven Pomodoro timer with idle detection, sound alerts, strict tab-switch tracking, and auto-break transitions.
- Subject-wise Resources and Quick Notes manager.
- Integrated quick-launch online compilers directory with live search.
- Weekly study analytics with daily hour distribution bars and subject breakdowns.

### 1.3 Definitions, Acronyms, and Abbreviations
- **SRS:** Software Requirements Specification
- **SPA:** Single Page Application
- **UI/UX:** User Interface / User Experience
- **OAuth:** Open Authorization standard
- **Firestore:** Google Cloud NoSQL document database
- **Web Worker:** Background JavaScript thread independent of user interface scripts
- **Web Audio API:** High-level JavaScript API for processing and synthesizing audio in web applications
- **XSS:** Cross-Site Scripting

---

## 2. Overall Description

### 2.1 Product Perspective
FocusForge operates as a self-contained, serverless client-side web application deployed on Firebase Hosting. It interfaces directly with Firebase Authentication for identity management and Cloud Firestore for document synchronization and offline persistence.

```
+-------------------------------------------------------------------------+
|                              CLIENT BROWSER                             |
|  +---------------------+  +--------------------+  +------------------+  |
|  |   UI / DOM Views    |  |  Web Audio API     |  |   Web Worker     |  |
|  | (Dashboard, Tasks,  |  |  (Audio Alerts)    |  | (Drift-Free Timer|  |
|  |  Exams, Timetable)  |  +--------------------+  |  & Idle Monitor) |  |
|  +----------+----------+                          +--------+---------+  |
|             |                                              |            |
|  +----------v----------------------------------------------v----------+  |
|  |                  Application State & Event Engine                  |  |
|  |           (LocalStorage Cache & IndexedDB Persistence)             |  |
|  +---------------------------------+----------------------------------+  |
+------------------------------------|------------------------------------+
                                     | HTTPS / WSS
                                     v
+-------------------------------------------------------------------------+
|                           GOOGLE FIREBASE CLOUD                         |
|  +---------------------------------+  +------------------------------+  |
|  |      Firebase Authentication    |  |        Cloud Firestore       |  |
|  |   (Email/Pass & Google OAuth)   |  |   (Users, Schedules, Stats)  |  |
|  +---------------------------------+  +------------------------------+  |
+-------------------------------------------------------------------------+
```

### 2.2 Product Features Summary
1. **Authentication & Profile:** Multi-method login, user streak calculation, logout modal with confirmation.
2. **Dynamic Dashboard:** Real-time summary cards, current time schedule highlight (`LIVE`, `Done`, `Up next`), inline subject creator.
3. **Course & Subject Engine:** Subject creation with unique color assignment from a curated palette.
4. **Timetable System:** Weekly 5-slot grid with conflict-free slot assignments and instant removal.
5. **Assignment / Task Tracker:** Categorization by priority (`High`, `Medium`, `Low`) and date filter (`All`, `Today`, `Upcoming`, `Overdue`).
6. **Exam Countdown & Syllabus Tracker:** Real-time countdown to test dates with automated completion flags and subject coverage progress bars.
7. **Pomodoro Focus Timer:** Multi-duration sessions (15–90 min) with Web Worker ticking, strict mode tab-visibility triggers, adjustable idle tolerance (30s–900s), and automatic rest intervals.
8. **Resources & Digital Notebook:** Subject-filtered quick notes auto-save and external URL resource bookmarking.
9. **Online Compilers Hub:** Pre-indexed compiler shortcuts (Python, Java, JS, C++, C, C#, Go, MySQL) with instant query filtering.
10. **Analytics Engine:** Weekly performance charts, study hours accumulator, focus score rating, and midnight rollover reset daemon.

### 2.3 User Classes and Characteristics
- **Primary Users (Students / Learners):** Individuals enrolled in academic programs requiring schedule management, deadline tracking, and distraction mitigation.
- **Secondary Users (Self-Taught Developers / Professionals):** Individuals preparing for certifications or technical interviews utilizing the Pomodoro session timer and online compilers.

### 2.4 Operating Environment
- **Client Platforms:** Modern desktop and mobile browsers (Google Chrome 90+, Mozilla Firefox 88+, Apple Safari 14+, Microsoft Edge 90+).
- **Hosting:** Firebase Hosting CDN with HTTPS enforcement.
- **Cloud Backend:** Google Cloud Platform / Firebase multi-region infrastructure.

### 2.5 Design and Implementation Constraints
- **Zero-Build Dependency Architecture:** Pure standard ES6 JavaScript and HTML5/CSS3 without requiring external npm bundle builders at runtime.
- **Client-Side Security:** Input sanitization (`escapeHTML`) applied to prevent stored Cross-Site Scripting (XSS).
- **Single Point of Storage:** User-scoped document schema stored under `users/{uid}` in Cloud Firestore.
- **Audio Autoplay Restrictions:** AudioContext initialization deferred until explicit user gesture (`click` on start focus/toggle).

---

## 3. Specific Requirements & System Features

### 3.1 Module 1: Authentication and Account Lifecycle
- **FR-AUTH-01:** System shall permit registration using Full Name, Email Address, and Password (minimum 8 characters).
- **FR-AUTH-02:** System shall allow one-click authentication via Google OAuth popup (`GoogleAuthProvider`).
- **FR-AUTH-03:** System shall initialize a new document in the `users` collection upon first login containing default streaks and timestamps.
- **FR-AUTH-04 (Daily Streak Calculation):**
  - If `lastLogin` is exactly 1 day prior to current access, streak count shall increment by 1.
  - If `lastLogin` is older than 1 day, streak count shall reset to 1.
- **FR-AUTH-05:** System shall maintain user session persistence across browser refreshes and offer explicit logout with session teardown.

### 3.2 Module 2: Dashboard & Real-Time Schedule
- **FR-DASH-01:** Dashboard shall display:
  - Welcome banner with current daily streak count.
  - Metric counters: Today's Classes, Assignments Completed / Total, Total Upcoming Exams.
- **FR-DASH-02 (Live Schedule Engine):**
  - Evaluate system local time against the timetable timeslots (`08:00`, `10:00`, `12:00`, `14:00`, `16:00`).
  - Mark class as `● LIVE` if current time falls within start and end time (+2 hours).
  - Mark class as `Done` if current time exceeds end time.
  - Mark class as `Up next` if start time is later in the day.
- **FR-DASH-03 (Active Subjects Widget):** Enable quick addition of new subjects inline with automated random hex-color assignment from an accessible palette.

### 3.3 Module 3: Academic Timetable Management
- **FR-TT-01:** Present a 7-column (Sun through Sat) by 5-row time matrix.
- **FR-TT-02:** User shall add a class by selecting subject, day of the week, and timeslot.
- **FR-TT-03:** Classes shall render with subject-specific border accents and colors.
- **FR-TT-04:** Deletion of an existing class shall trigger a custom modal confirmation.

### 3.4 Module 4: Assignment & Task Manager
- **FR-TASK-01:** Allow creation of tasks with Title, Subject association, Priority (`High`, `Medium`, `Low`), and Due Date.
- **FR-TASK-02:** Tasks shall automatically calculate operational status:
  - `Overdue`: Due date is prior to today and task is incomplete.
  - `Today`: Due date matches current system date.
  - `Upcoming`: Due date is in the future.
  - `Done`: Completed status toggled by checkbox.
- **FR-TASK-03:** Filtering buttons shall support views for `All`, `Today`, `Upcoming`, and `Overdue`.
- **FR-TASK-04 (Syllabus Coverage):** Automatically compute coverage percentage per subject based on completed versus total assignments.

### 3.5 Module 5: Exam Countdown & Milestones
- **FR-EXAM-01:** Users shall record upcoming exams with Title, Associated Subject, and Target Date.
- **FR-EXAM-02:** Real-time calculation of remaining days until test date.
- **FR-EXAM-03:** Exams whose target date has passed shall display a completed checkmark (`✓`) and be sorted to the bottom of the list.

### 3.6 Module 6: Pomodoro Focus Session & Idle Monitor
- **FR-FOC-01 (Timer Execution):** Timekeeping must run via a Web Worker thread to prevent background tab throttling and timer drift.
- **FR-FOC-02 (Session Durations):** Support configurable lengths: 15, 30, 45, 60, 75, or 90 minutes.
- **FR-FOC-03 (Auto-Break Scheduling):** Automatically partition sessions into focus intervals separated by 2.5 to 5-minute rest periods.
- **FR-FOC-04 (Idle Tracking):**
  - Listen for user activity events: mouse movement, key presses, scrolling, touch events, and clicks.
  - Configurable slider threshold for idle timeout: 30 seconds to 15 minutes.
  - Warning stage triggered at 75% of threshold; Idle Alert modal and alarm triggered when threshold is exceeded.
- **FR-FOC-05 (Strict Mode):** Listen to `document.visibilitychange`. If user switches browser tab while Strict Mode is enabled, immediately trip the idle alert.
- **FR-FOC-06 (Focus Score Algorithm):** Penalize idle interruptions with weighted factor and update visual focus ring score.
- **FR-FOC-07 (Audio Synthesis):** Synthesize dual-tone chime (800 Hz triangle oscillator) on session phase transitions via Web Audio API without relying on external audio assets.

### 3.7 Module 7: Resources & Digital Notebook
- **FR-RES-01:** Provide subject-specific digital memo area with manual save and visual confirmation feedback.
- **FR-RES-02:** Provide link bookmarking engine supporting link title and validated URL with one-click external navigation.

### 3.8 Module 8: Online Compilers Directory
- **FR-COMP-01:** Provide direct links to external sandbox compilers for Python, Java, JavaScript, C++, C, C#, Go, and MySQL.
- **FR-COMP-02:** Provide dynamic search input that filters compiler cards in real time matching language names or descriptions.

### 3.9 Module 9: Productivity Analytics & Midnight Daemon
- **FR-ANLY-01:** Render a weekly bar chart depicting daily accumulated study hours for Sunday through Saturday.
- **FR-ANLY-02:** Aggregate metrics: Weekly Study Hours, Average Focus Score, Total Idle Events, Total Sessions.
- **FR-ANLY-03 (Midnight Rollover Daemon):** Run an interval check once every second to automatically reset daily metrics at midnight and weekly analytics on Sunday.

---

## 4. Non-Functional Requirements

### 4.1 Performance & Reliability
- **Client Load Time:** Initial page load under 1.5 seconds on broadband connections.
- **Timer Accuracy:** Clock drift shall not exceed ±500 ms over a 90-minute session by utilizing dedicated Web Workers.
- **Offline Fault Tolerance:** All task, exam, and note modifications cache locally in IndexedDB and synchronize upon reconnection.

### 4.2 Security & Integrity
- **XSS Mitigation:** All dynamic inputs pass through `escapeHTML()` entity encoding prior to innerHTML injection.
- **Authentication Credentials:** Handled securely via Google Firebase token exchange.
- **Firestore Authorization:** Database security rules restrict access strictly to `request.auth.uid == userId`.

---
