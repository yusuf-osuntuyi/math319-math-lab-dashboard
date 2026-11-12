# Math Lab Staffing & Student Flow — Interactive Dashboard
**Course:** MATH 319 (Mathematical Modeling, Fall 2026)  
**Author:** Yusuf Osuntuyi  

## Quick Start
1. **Open Directly in Any Browser:** Double-click `index.html` (no terminal or server required), or serve locally via `python3 -m http.server 8080`.
2. **Recommend Setting Active Workspace:** In Antigravity, set `/Users/osuntuyi_y/.gemini/antigravity/scratch/math319-math-lab-dashboard` as your active workspace folder for easy editing.

## Project File Structure
- `index.html` — Main 4-tab dashboard interface (Executive Overview & Proposal Graphs, What Happened vs. Optimized Schedule, 4-Hour Recurrence Prototype & ILP Math, and Live Data & Roster Studio).
- `data.js` — **Your central configuration & data file.** Contains:
  - Model parameters ($\frac{1}{\mu}$ session duration, wait time target, ideal students-per-tutor ratio).
  - The exact staff roster discussed in the meeting: **6 Graduate Assistants (GAs)** at 20 hrs/week, **Donnie** (10h), **Mariah** (10h), **Taylor** (10h), **Joe** (8h), and student workers (8h), along with their subject competencies (**College Algebra, Trigonometry, Precalculus, Calculus, Statistics**).
  - Class release schedule drivers (including the **10:00 AM Trigonometry release spike** and **1:00–4:00 PM lecture releases**).
  - Hourly student arrivals ($\lambda_{d,t,s}$) and the current baseline schedule ("What Happened This Semester").
- `optimizer.js` — Mathematical modeling engine implementing:
  - Stage 1: Arrival rate ($\lambda_t$) & service rate ($\mu$) estimation with scenario modifiers.
  - Stage 2: Discrete dynamic queue recurrence relation $W_{t+1} = \max(0, W_t + \text{Arrivals}_t - \mu \cdot x_t)$.
  - Stage 3: Constrained Integer Linear Programming (ILP) schedule optimizer respecting individual weekly hour caps, 1 man-hour per shift ($y_{i,d,t} \in \{0,1\}$), and subject competency coverage.
  - Stage 4: Sensitivity & Pareto Trade-Off Frontier generator.
- `app.js` — UI controller, Chart.js graphs, interactive shift toggling, and Excel (`.xlsx`) / CSV / `data.js` import & export.
- `styles.css` — Dark/Light academic analytics theme.

## How to Edit Your Data Later
- **Option 1 (Inside the Dashboard UI):** Go to the **"✏️ Edit Data, Roster & Excel Import"** tab. Edit any tutor's hours, wage, or subject checkboxes, or edit hourly arrival counts. Changes save automatically to your browser's `localStorage`. Click **"💾 Save data.js"** in the top-right to download the updated `data.js` file and drop it into this folder.
- **Option 2 (Upload Excel/CSV):** In the **"✏️ Edit Data, Roster & Excel Import"** tab, click **"📂 Upload Excel (.xlsx) / CSV / JSON"** to load `Copy of Math Lab Participation Tracker 2026-2027.xlsx`.
- **Option 3 (Edit Code Directly):** Open `data.js` in your editor, change any number or array, and refresh the browser.

