/**
 * ============================================================================
 * MATH 319: MATHEMATICAL MODELING — INTERACTIVE APPLICATION CONTROLLER (app.js)
 * Connects data.js, optimizer.js, Chart.js visualizations, and the Live Data Studio
 * ============================================================================
 */

(function () {
  const STORAGE_KEY = "MATH319_LAB_DASHBOARD_STATE_V1";

  // Deep clone utility
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Load state from localStorage or fallback to window.MATH_LAB_DEFAULT_DATA
  function loadInitialState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.tutors && parsed.hourlyArrivals) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not read saved state from localStorage:", e);
    }
    return clone(window.MATH_LAB_DEFAULT_DATA);
  }

  let appData = loadInitialState();
  let engine = new MathLabModelEngine(appData);
  let optimizedSchedule = null;
  let currentEval = null;
  let optimizedEval = null;

  // Custom prototype tutor counts for Tab 3 interactive recurrence sandbox
  let customPrototypeXt = {};

  // Chart.js instances
  let chartInflow = null;
  let chartWait = null;
  let chartFrontier = null;
  let chartOverlooked = null;

  // Save current appData to localStorage
  function saveState(message) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
      if (message) showToast(message);
    } catch (e) {
      console.warn("Could not save state:", e);
    }
  }

  function showToast(msg) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  // Recompute optimization and evaluations
  function recomputeModels(reoptimize = true) {
    engine = new MathLabModelEngine(appData);
    const adjArrivals = engine.getAdjustedArrivals(appData.parameters);
    if (reoptimize || !optimizedSchedule) {
      optimizedSchedule = engine.solveOptimalSchedule(appData.parameters, adjArrivals);
    }
    currentEval = engine.evaluateSchedule(appData.currentScheduleTutorsByHour, appData.parameters, adjArrivals);
    optimizedEval = engine.evaluateSchedule(optimizedSchedule, appData.parameters, adjArrivals);
  }

  // ==========================================================================
  // RENDER ALL VIEWS
  // ==========================================================================
  function renderAll(reoptimize = true) {
    recomputeModels(reoptimize);
    renderHeaderMeta();
    renderOverviewTab();
    renderScheduleTab();
    renderModelsTab();
    renderEditorTab();
  }

  function renderHeaderMeta() {
    document.getElementById("header-project-title").textContent = appData.meta.projectTitle;
    document.getElementById("header-author").textContent = appData.meta.author;
    document.getElementById("header-datasource").textContent = "Data: " + appData.meta.dataSourceName;
  }

  // ==========================================================================
  // TAB 1: OVERVIEW KPI CARDS & 4 CHARTS
  // ==========================================================================
  function renderOverviewTab() {
    const cur = currentEval.kpis;
    const opt = optimizedEval.kpis;

    // Update dynamic insight banner
    const waitReductionPct = cur.avgWaitWeek > 0
      ? Math.round(((cur.avgWaitWeek - opt.avgWaitWeek) / cur.avgWaitWeek) * 100)
      : 0;
    const overlookedSaved = Math.max(0, cur.totalOverlookedStudents - opt.totalOverlookedStudents);

    const bannerEl = document.getElementById("overview-insight-banner");
    bannerEl.innerHTML = `
      <strong>Key Modeling Finding:</strong> Using the <em>exact same ${appData.tutors.length} staff members</em> (6 GAs + ${appData.tutors.length - 6} Undergrad Tutors), reallocating idle morning/4pm shifts to the <strong>10:00 AM Trigonometry rush</strong> and <strong>1:00–4:00 PM peak</strong> cuts average student wait time by <strong>${waitReductionPct}%</strong> (${cur.avgWaitWeek}m &rarr; ${opt.avgWaitWeek}m), prevents <strong>${overlookedSaved} students/week</strong> from being overlooked, and raises active tutor-to-student engagement from <strong>${cur.overallEngagementPct}% to ${opt.overallEngagementPct}%</strong>.
    `;

    // Render 5 KPI Comparison Cards
    const kpiGrid = document.getElementById("kpi-summary-grid");
    kpiGrid.innerHTML = `
      <!-- KPI 1: Engagement / Eyes on Work -->
      <div class="kpi-card emerald">
        <div class="kpi-header">
          <span>"Eyes on Work" Engagement</span>
          <span>🎯 Goal #1</span>
        </div>
        <div class="kpi-comparison">
          <span class="kpi-main-val">${opt.overallEngagementPct}%</span>
          <span class="kpi-old-val">was ${cur.overallEngagementPct}%</span>
        </div>
        <div class="kpi-delta good">
          +${(opt.overallEngagementPct - cur.overallEngagementPct).toFixed(1)}% Active Tutor Coverage
        </div>
        <div class="kpi-footnote">
          Students receiving direct, subject-matched tutor attention
        </div>
      </div>

      <!-- KPI 2: Average Student Wait Time -->
      <div class="kpi-card">
        <div class="kpi-header">
          <span>Avg Student Wait Time</span>
          <span>⏱️ Target &le; ${appData.parameters.targetWaitMinutes}m</span>
        </div>
        <div class="kpi-comparison">
          <span class="kpi-main-val">${opt.avgWaitWeek} min</span>
          <span class="kpi-old-val">was ${cur.avgWaitWeek} min</span>
        </div>
        <div class="kpi-delta ${opt.avgWaitWeek <= appData.parameters.targetWaitMinutes ? 'good' : 'warn'}">
          &minus;${(cur.avgWaitWeek - opt.avgWaitWeek).toFixed(1)} min (Peak: ${opt.peakWaitMinutes}m vs ${cur.peakWaitMinutes}m)
        </div>
        <div class="kpi-footnote">
          Flattens the 1–4 PM "highway traffic jam" bottleneck
        </div>
      </div>

      <!-- KPI 3: Overlooked Students Prevented -->
      <div class="kpi-card rose">
        <div class="kpi-header">
          <span>Overlooked Students / Wk</span>
          <span>👀 Capacity + Subject</span>
        </div>
        <div class="kpi-comparison">
          <span class="kpi-main-val">${opt.totalOverlookedStudents}</span>
          <span class="kpi-old-val">was ${cur.totalOverlookedStudents}</span>
        </div>
        <div class="kpi-delta good">
          ${overlookedSaved} Fewer Students Overlooked
        </div>
        <div class="kpi-footnote">
          Includes 10:00 AM Trig rush &amp; afternoon lecture releases
        </div>
      </div>

      <!-- KPI 4: Idle Tutor Hours Reallocated -->
      <div class="kpi-card amber">
        <div class="kpi-header">
          <span>Idle Overstaffed Hours</span>
          <span>🔄 Shift Reallocation</span>
        </div>
        <div class="kpi-comparison">
          <span class="kpi-main-val">${opt.totalIdleTutorHours} hrs</span>
          <span class="kpi-old-val">was ${cur.totalIdleTutorHours} hrs</span>
        </div>
        <div class="kpi-delta good">
          ${Math.max(0, cur.totalIdleTutorHours - opt.totalIdleTutorHours)} Idle Hours Moved to Peak
        </div>
        <div class="kpi-footnote">
          Eliminates "mainly tutors &amp; no students" at 9am/11am/4pm
        </div>
      </div>

      <!-- KPI 5: Weekly Tutor Hours & Payroll -->
      <div class="kpi-card purple">
        <div class="kpi-header">
          <span>Weekly Lab Staffing &amp; Cost</span>
          <span>💰 Budget Limit</span>
        </div>
        <div class="kpi-comparison">
          <span class="kpi-main-val">$${opt.totalLaborCostWeek.toLocaleString()}</span>
          <span class="kpi-old-val">${opt.totalTutorHoursWeek} hrs</span>
        </div>
        <div class="kpi-delta good">
          Service Rate &mu; = ${opt.serviceRateMu}/hr (${appData.parameters.avgSessionMinutes}m/session)
        </div>
        <div class="kpi-footnote">
          Total Mon–Thu Demand: ${opt.totalArrivalsWeek} student check-ins
        </div>
      </div>
    `;

    renderOverviewCharts();
  }

  function getSelectedDaySeries(evalObj, dayKey) {
    if (dayKey === "AVG") {
      return evalObj.hourlyAverages;
    }
    const dayMap = evalObj.byDay[dayKey];
    return appData.meta.operatingHours.map(h => {
      const cell = dayMap[h.id];
      return {
        hourId: h.id,
        label: h.label,
        short: h.short,
        avgArrivals: cell.arrivals,
        avgTutors: cell.xt,
        avgCapacity: cell.serviceCapacity,
        avgWt: cell.Wt,
        avgWtNext: cell.WtNext,
        avgWaitMinutes: cell.waitMinutes,
        avgOverlooked: cell.overlookedStudents,
        avgSubjectArrivals: cell.subjectArrivals
      };
    });
  }

  function renderOverviewCharts() {
    const dayKey = document.getElementById("select-overview-day").value || "AVG";
    const curSeries = getSelectedDaySeries(currentEval, dayKey);
    const optSeries = getSelectedDaySeries(optimizedEval, dayKey);
    const labels = curSeries.map(d => d.label);

    const isLight = document.body.classList.contains("light-theme");
    const textColor = isLight ? "#334155" : "#cbd5e1";
    const gridColor = isLight ? "rgba(148, 163, 184, 0.25)" : "rgba(51, 65, 85, 0.55)";

    // ------------------------------------------------------------------------
    // GRAPH 1: Hourly Student Inflow (Stacked by Subject) vs. Tutoring Capacity
    // ------------------------------------------------------------------------
    const ctx1 = document.getElementById("chart-inflow-capacity").getContext("2d");
    if (chartInflow) chartInflow.destroy();

    const subjectDatasets = appData.subjects.map(sub => ({
      type: "bar",
      label: sub.short,
      data: optSeries.map(d => d.avgSubjectArrivals[sub.id] || 0),
      backgroundColor: sub.color + "cc",
      borderColor: sub.color,
      borderWidth: 1,
      stack: "arrivals",
      order: 3
    }));

    chartInflow = new Chart(ctx1, {
      data: {
        labels,
        datasets: [
          {
            type: "line",
            label: "Optimized Service Capacity (μ · x_t)",
            data: optSeries.map(d => d.avgCapacity),
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.15)",
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: "#10b981",
            tension: 0.25,
            order: 1
          },
          {
            type: "line",
            label: "Current Static Capacity (What Happened)",
            data: curSeries.map(d => d.avgCapacity),
            borderColor: "#f43f5e",
            borderDash: [6, 4],
            borderWidth: 2.5,
            pointRadius: 3.5,
            pointBackgroundColor: "#f43f5e",
            tension: 0.25,
            order: 2
          },
          ...subjectDatasets
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { labels: { color: textColor, font: { size: 11 } } },
          tooltip: {
            callbacks: {
              footer: (items) => {
                const idx = items[0].dataIndex;
                return `Total Arrivals: ${optSeries[idx].avgArrivals} students | Opt Tutors: ${optSeries[idx].avgTutors} (was ${curSeries[idx].avgTutors})`;
              }
            }
          }
        },
        scales: {
          x: { stacked: true, ticks: { color: textColor }, grid: { color: gridColor } },
          y: {
            stacked: true,
            beginAtZero: true,
            title: { display: true, text: "Students / Hour (Arrivals vs. Service Capacity)", color: textColor },
            ticks: { color: textColor },
            grid: { color: gridColor }
          }
        }
      }
    });

    // ------------------------------------------------------------------------
    // GRAPH 2: Simulated Student Wait Time by Hour
    // ------------------------------------------------------------------------
    const ctx2 = document.getElementById("chart-wait-time").getContext("2d");
    if (chartWait) chartWait.destroy();

    const targetLine = Array(labels.length).fill(Number(appData.parameters.targetWaitMinutes) || 8);

    chartWait = new Chart(ctx2, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Current Schedule Wait Time (Severe Peak Bottleneck)",
            data: curSeries.map(d => d.avgWaitMinutes),
            borderColor: "#f43f5e",
            backgroundColor: "rgba(244, 63, 94, 0.14)",
            fill: true,
            borderWidth: 3,
            pointRadius: 4.5,
            tension: 0.3
          },
          {
            label: "Optimized Dynamic Staffing Wait Time",
            data: optSeries.map(d => d.avgWaitMinutes),
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.16)",
            fill: true,
            borderWidth: 3,
            pointRadius: 4.5,
            tension: 0.3
          },
          {
            label: `${appData.parameters.targetWaitMinutes}-Minute Target Threshold`,
            data: targetLine,
            borderColor: "#f59e0b",
            borderDash: [5, 5],
            borderWidth: 2,
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { labels: { color: textColor, font: { size: 11 } } }
        },
        scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: {
            beginAtZero: true,
            title: { display: true, text: "Estimated Student Wait Time (Minutes)", color: textColor },
            ticks: { color: textColor },
            grid: { color: gridColor }
          }
        }
      }
    });

    // ------------------------------------------------------------------------
    // GRAPH 3: Trade-off Frontier (Budget vs. Average Wait Time)
    // ------------------------------------------------------------------------
    const frontierPoints = engine.generateTradeoffFrontier(appData.parameters);
    const ctx3 = document.getElementById("chart-tradeoff-frontier").getContext("2d");
    if (chartFrontier) chartFrontier.destroy();

    chartFrontier = new Chart(ctx3, {
      type: "line",
      data: {
        labels: frontierPoints.map(p => `$${p.budget}`),
        datasets: [
          {
            label: "Lab-Wide Avg Wait Time (min)",
            data: frontierPoints.map(p => p.avgWait),
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.18)",
            fill: true,
            borderWidth: 3,
            pointRadius: 5,
            pointBackgroundColor: frontierPoints.map(p =>
              p.cutPercent === Number(appData.parameters.budgetCutPercent) ? "#f59e0b" : "#3b82f6"
            ),
            tension: 0.3,
            yAxisID: "y"
          },
          {
            label: "Active Engagement Rate (%)",
            data: frontierPoints.map(p => p.engagementPct),
            borderColor: "#10b981",
            borderDash: [4, 4],
            borderWidth: 2.5,
            pointRadius: 4,
            tension: 0.3,
            yAxisID: "y1"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { labels: { color: textColor, font: { size: 11 } } },
          tooltip: {
            callbacks: {
              afterBody: (items) => {
                const p = frontierPoints[items[0].dataIndex];
                return `Staff Hours: ${p.tutorHours} hrs/wk | Overlooked: ${p.overlooked} students`;
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: "Weekly Tutoring Payroll Budget ($)", color: textColor },
            ticks: { color: textColor },
            grid: { color: gridColor }
          },
          y: {
            type: "linear",
            position: "left",
            beginAtZero: true,
            title: { display: true, text: "Avg Wait Time (min)", color: textColor },
            ticks: { color: textColor },
            grid: { color: gridColor }
          },
          y1: {
            type: "linear",
            position: "right",
            min: 40,
            max: 100,
            title: { display: true, text: "Engagement Rate (%)", color: textColor },
            ticks: { color: textColor },
            grid: { drawOnChartArea: false }
          }
        }
      }
    });

    // ------------------------------------------------------------------------
    // GRAPH 4: Overlooked Students by Hour (Current vs. Optimized)
    // ------------------------------------------------------------------------
    const ctx4 = document.getElementById("chart-overlooked").getContext("2d");
    if (chartOverlooked) chartOverlooked.destroy();

    chartOverlooked = new Chart(ctx4, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Current Schedule: Overlooked Students (Capacity / Subject Gap)",
            data: curSeries.map(d => d.avgOverlooked),
            backgroundColor: "rgba(244, 63, 94, 0.78)",
            borderColor: "#f43f5e",
            borderWidth: 1,
            borderRadius: 5
          },
          {
            label: "Optimized Schedule: Overlooked Students",
            data: optSeries.map(d => d.avgOverlooked),
            backgroundColor: "rgba(16, 185, 129, 0.82)",
            borderColor: "#10b981",
            borderWidth: 1,
            borderRadius: 5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { labels: { color: textColor, font: { size: 11 } } }
        },
        scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: {
            beginAtZero: true,
            title: { display: true, text: "Students Overlooked / Unmatched per Hour", color: textColor },
            ticks: { color: textColor },
            grid: { color: gridColor }
          }
        }
      }
    });
  }

  // ==========================================================================
  // TAB 2: "WHAT HAPPENED" VS. "WHAT COULD HAVE HAPPENED" SCHEDULE EXPLORER
  // ==========================================================================
  function renderScheduleTab() {
    const selectedDay = document.getElementById("select-schedule-day").value || "Monday";
    const curDay = currentEval.byDay[selectedDay];
    const optDay = optimizedEval.byDay[selectedDay];
    const tutorMap = {};
    appData.tutors.forEach(t => { tutorMap[t.id] = t; });
    const subMap = {};
    appData.subjects.forEach(s => { subMap[s.id] = s; });

    let rowsHtml = "";
    for (const hrObj of appData.meta.operatingHours) {
      const hr = hrObj.id;
      const c = curDay[hr];
      const o = optDay[hr];

      // Build Subject Demand badges for this hour
      const subBadges = appData.subjects
        .filter(s => (o.subjectArrivals[s.id] || 0) > 0)
        .map(s => `<span class="subject-pill" style="background:${s.color}" title="${s.name}">${s.short}: ${o.subjectArrivals[s.id]}</span>`)
        .join("");

      // Current Tutors List
      const curChips = c.tutorIds.map(tid => {
        const t = tutorMap[tid];
        if (!t) return "";
        const shortName = t.name.replace("Grad Assistant ", "GA ");
        return `<span class="tutor-chip ${t.role === 'GA' ? 'ga' : 'ug'}" title="${t.name} (${t.competencies.join(', ')})">${shortName}</span>`;
      }).join("");

      // Optimized Interactive Tutors List (click any tutor to toggle in/out of this hour!)
      const optChips = appData.tutors.map(t => {
        const isAssigned = o.tutorIds.includes(t.id);
        const shortName = t.name.replace("Grad Assistant ", "GA ").replace(" (Student Worker)", "");
        return `<span class="tutor-chip ${t.role === 'GA' ? 'ga' : 'ug'} ${isAssigned ? 'assigned' : ''}"
                      data-toggle-tutor="${t.id}" data-day="${selectedDay}" data-hr="${hr}"
                      title="Click to ${isAssigned ? 'remove' : 'assign'} ${t.name} | Subjects: ${t.competencies.map(k => subMap[k]?.short).join(', ')}">
                  ${isAssigned ? '✓ ' : '+ '}${shortName}
                </span>`;
      }).join("");

      // Status classes
      const curStatusClass = c.overlookedStudents > 3
        ? "status-critical"
        : (c.idleTutors >= 2 ? "status-idle" : "status-warning");
      const curStatusLabel = c.overlookedStudents > 3
        ? `⚠️ ${c.overlookedStudents} Overlooked (${c.waitMinutes}m wait)`
        : (c.idleTutors >= 2 ? `💤 ${c.idleTutors} Idle Tutors` : `Wait: ${c.waitMinutes}m`);

      const optStatusClass = o.overlookedStudents <= 1 && o.waitMinutes <= appData.parameters.targetWaitMinutes
        ? "status-optimal"
        : (o.overlookedStudents <= 3 ? "status-warning" : "status-critical");
      const optStatusLabel = o.overlookedStudents <= 1
        ? `✅ Optimal (${o.waitMinutes}m wait)`
        : `⚡ ${o.overlookedStudents} Overlooked (${o.waitMinutes}m wait)`;

      rowsHtml += `
        <tr>
          <td>
            <div style="font-weight:700;color:var(--text-primary);">${hrObj.label}</div>
            <div style="font-size:0.74rem;color:var(--text-secondary);margin-top:0.15rem;">
              <strong>${o.arrivals}</strong> arrivals ${hr === '10:00' ? '🔥 <em>(Trig Release)</em>' : ''}
            </div>
            <div style="margin-top:0.3rem;">${subBadges}</div>
          </td>
          <td>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.35rem;">
              <span><strong>${c.xt} Tutors</strong> (1 : ${c.studentsPerTutor} stu)</span>
              <span class="status-cell ${curStatusClass}">${curStatusLabel}</span>
            </div>
            <div class="tutor-chip-list">${curChips}</div>
          </td>
          <td>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.35rem;">
              <span><strong>${o.xt} Tutors</strong> (1 : ${o.studentsPerTutor} stu)</span>
              <span class="status-cell ${optStatusClass}">${optStatusLabel}</span>
            </div>
            <div class="tutor-chip-list">${optChips}</div>
          </td>
        </tr>
      `;
    }

    document.getElementById("schedule-comparison-table-wrap").innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:20%;">Hour Block &amp; Subject Demand</th>
            <th style="width:36%;">What Happened This Semester (Current Static)</th>
            <th style="width:44%;">What Could Have Happened (ILP Optimized — Click Chips to Edit)</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    `;

    // Bind click events to toggle tutor chips in the optimized schedule
    document.querySelectorAll("[data-toggle-tutor]").forEach(chip => {
      chip.addEventListener("click", () => {
        const tid = chip.getAttribute("data-toggle-tutor");
        const day = chip.getAttribute("data-day");
        const hr = chip.getAttribute("data-hr");
        const list = optimizedSchedule[day][hr];
        const idx = list.indexOf(tid);
        if (idx >= 0) {
          if (list.length <= 1) {
            showToast("Minimum coverage bound requires at least 1 tutor on duty!");
            return;
          }
          list.splice(idx, 1);
        } else {
          list.push(tid);
        }
        renderAll(false);
        showToast(`Updated ${day} ${hr} shift assignment`);
      });
    });

    // Render Roster Utilization Summary Table
    let rosterRows = "";
    const curTutorMap = {};
    currentEval.tutorSummary.forEach(t => { curTutorMap[t.id] = t; });

    optimizedEval.tutorSummary.forEach(t => {
      const curT = curTutorMap[t.id] || { assignedHours: 0 };
      const subPills = t.competencies.map(cid => {
        const s = subMap[cid];
        return s ? `<span class="subject-pill" style="background:${s.color}">${s.short}</span>` : "";
      }).join("");

      const targetHrs = Math.round(
        (t.role === "GA" ? t.monThuLabHours * appData.parameters.gaLabAllocationRatio : t.monThuLabHours) *
        (1 - (appData.parameters.budgetCutPercent || 0) / 100)
      );

      rosterRows += `
        <tr>
          <td><strong>${t.name}</strong></td>
          <td><span class="badge ${t.role === 'GA' ? 'badge-blue' : 'badge-emerald'}">${t.tierLabel}</span></td>
          <td>${subPills}</td>
          <td style="font-family:'JetBrains Mono',monospace;">${t.contractHours} hrs/wk (${targetHrs}h Mon–Thu cap)</td>
          <td style="font-family:'JetBrains Mono',monospace;">${curT.assignedHours} hrs</td>
          <td style="font-family:'JetBrains Mono',monospace;font-weight:700;color:var(--accent-emerald);">
            ${t.assignedHours} hrs (M:${t.byDay.Monday} T:${t.byDay.Tuesday} W:${t.byDay.Wednesday} R:${t.byDay.Thursday})
          </td>
          <td style="font-family:'JetBrains Mono',monospace;">$${t.weeklyPay.toFixed(2)}</td>
        </tr>
      `;
    });

    document.getElementById("roster-utilization-table-wrap").innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Tutor Name</th>
            <th>Staffing Tier</th>
            <th>Subject Competencies</th>
            <th>Contract Limit</th>
            <th>Current Hrs</th>
            <th>Optimized Hrs (Mon–Thu Breakdown)</th>
            <th>Weekly Pay</th>
          </tr>
        </thead>
        <tbody>${rosterRows}</tbody>
      </table>
    `;
  }

  // ==========================================================================
  // TAB 3: 4-HOUR PROTOTYPE & MATHEMATICAL MODELS
  // ==========================================================================
  function renderModelsTab() {
    const day = document.getElementById("proto-day-select").value || "Monday";
    const winType = document.getElementById("proto-window-select").value || "afternoon";
    const mu = engine.getServiceRateMu(appData.parameters);

    document.getElementById("proto-mu-label").textContent = appData.parameters.avgSessionMinutes;
    document.getElementById("proto-rate-label").textContent = mu.toFixed(2);

    const windowHours = winType === "afternoon"
      ? ["12:00", "13:00", "14:00", "15:00"]
      : ["09:00", "10:00", "11:00", "12:00"];

    const adjArrivals = engine.getAdjustedArrivals(appData.parameters);
    let WtCur = 0;
    let WtOpt = 0;
    let WtCustom = 0;

    let protoRows = "";
    windowHours.forEach(hr => {
      const hrObj = appData.meta.operatingHours.find(h => h.id === hr);
      const At = adjArrivals[day][hr]._total;
      const xtCur = appData.currentScheduleTutorsByHour[day][hr].length;
      const xtOpt = optimizedSchedule[day][hr].length;
      const customKey = `${day}_${hr}`;
      const xtCust = customPrototypeXt[customKey] !== undefined ? customPrototypeXt[customKey] : xtOpt;

      const capCur = Math.round(xtCur * mu * 10) / 10;
      const capOpt = Math.round(xtOpt * mu * 10) / 10;
      const capCust = Math.round(xtCust * mu * 10) / 10;

      const nextCur = Math.max(0, Math.round((WtCur + At - capCur) * 10) / 10);
      const nextOpt = Math.max(0, Math.round((WtOpt + At - capOpt) * 10) / 10);
      const nextCust = Math.max(0, Math.round((WtCustom + At - capCust) * 10) / 10);

      protoRows += `
        <tr>
          <td><strong>${hrObj.label}</strong></td>
          <td style="font-family:'JetBrains Mono',monospace;font-weight:700;">${At} students</td>
          <td style="font-family:'JetBrains Mono',monospace;">
            x<sub>t</sub> = ${xtCur} &rarr; Cap = ${capCur}<br/>
            <span style="color:var(--accent-rose);">W<sub>t</sub>=${WtCur} &rarr; <strong>W<sub>t+1</sub> = ${nextCur}</strong></span>
          </td>
          <td style="font-family:'JetBrains Mono',monospace;">
            x<sub>t</sub> = ${xtOpt} &rarr; Cap = ${capOpt}<br/>
            <span style="color:var(--accent-emerald);">W<sub>t</sub>=${WtOpt} &rarr; <strong>W<sub>t+1</sub> = ${nextOpt}</strong></span>
          </td>
          <td>
            <div style="display:flex;align-items:center;gap:0.5rem;">
              <input type="number" class="num-input proto-xt-input" data-key="${customKey}" min="1" max="12" value="${xtCust}" />
              <span style="font-family:'JetBrains Mono',monospace;font-size:0.78rem;">
                Cap=${capCust} | W<sub>t</sub>=${WtCustom} &rarr; <strong style="color:var(--accent-primary);">W<sub>t+1</sub>=${nextCust}</strong>
              </span>
            </div>
          </td>
        </tr>
      `;

      WtCur = nextCur;
      WtOpt = nextOpt;
      WtCustom = nextCust;
    });

    document.getElementById("prototype-table-wrap").innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Hour Block (<em>t</em>)</th>
            <th>Arrivals (&lambda;<sub>t</sub>)</th>
            <th>Current Staffing Recurrence (W<sub>t+1</sub>)</th>
            <th>Optimized Staffing Recurrence (W<sub>t+1</sub>)</th>
            <th>Live Sandbox: Test Custom Tutors (x<sub>t</sub>)</th>
          </tr>
        </thead>
        <tbody>${protoRows}</tbody>
      </table>
    `;

    document.querySelectorAll(".proto-xt-input").forEach(inp => {
      inp.addEventListener("input", (e) => {
        const key = e.target.getAttribute("data-key");
        customPrototypeXt[key] = Math.max(1, parseInt(e.target.value, 10) || 1);
        renderModelsTab();
      });
    });

    // Render Class Schedule Release Drivers table
    const subMap = {};
    appData.subjects.forEach(s => { subMap[s.id] = s; });

    const classRows = appData.classSchedule.map(c => {
      const s = subMap[c.subject];
      const estWalkins = Math.round((c.enrolled * c.expectedLabCapturePct) / 100);
      return `
        <tr>
          <td><strong>${c.code}</strong><br/><span style="font-size:0.74rem;color:var(--text-secondary);">${c.title}</span></td>
          <td><span class="subject-pill" style="background:${s ? s.color : '#3b82f6'}">${s ? s.short : c.subject}</span></td>
          <td style="font-size:0.78rem;">${c.classTime}<br/><strong style="color:var(--accent-amber);">Lets out &rarr; ${c.releaseHour}</strong></td>
          <td style="font-family:'JetBrains Mono',monospace;">${c.enrolled} enrolled<br/><span style="color:var(--accent-emerald);">~${estWalkins} walk-ins/hr</span></td>
          <td style="font-size:0.77rem;color:var(--text-secondary);">${c.impactNote}</td>
        </tr>
      `;
    }).join("");

    document.getElementById("class-schedule-summary-wrap").innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Course Section</th>
            <th>Subject</th>
            <th>Lecture &amp; Release Time</th>
            <th>Enrolled / Walk-Ins</th>
            <th>Lab Impact</th>
          </tr>
        </thead>
        <tbody>${classRows}</tbody>
      </table>
    `;
  }

  // ==========================================================================
  // TAB 4: LIVE DATA, ROSTER & ARRIVALS STUDIO
  // ==========================================================================
  function renderEditorTab() {
    // 1. Render Editable Tutor Roster Table
    let tutorRows = "";
    appData.tutors.forEach((t, idx) => {
      const compChecks = appData.subjects.map(sub => {
        const checked = t.competencies.includes(sub.id) ? "checked" : "";
        return `
          <label style="display:inline-flex;align-items:center;gap:0.25rem;margin-right:0.65rem;font-size:0.76rem;cursor:pointer;">
            <input type="checkbox" class="edit-tutor-comp" data-idx="${idx}" data-sub="${sub.id}" ${checked} />
            <span style="color:${sub.color};font-weight:700;">${sub.short}</span>
          </label>
        `;
      }).join("");

      tutorRows += `
        <tr>
          <td>
            <input type="text" class="text-input edit-tutor-name" data-idx="${idx}" value="${t.name}" style="width:185px;" />
          </td>
          <td>
            <select class="text-input edit-tutor-role" data-idx="${idx}">
              <option value="GA" ${t.role === 'GA' ? 'selected' : ''}>Grad Assistant (20h)</option>
              <option value="UG_10" ${t.role === 'UG_10' ? 'selected' : ''}>Undergrad Tutor (10h)</option>
              <option value="UG_8" ${t.role === 'UG_8' ? 'selected' : ''}>Student Worker (8h)</option>
            </select>
          </td>
          <td>
            <input type="number" class="num-input edit-tutor-contract" data-idx="${idx}" min="1" max="40" value="${t.contractHours}" />
          </td>
          <td>
            <input type="number" class="num-input edit-tutor-labhrs" data-idx="${idx}" min="1" max="32" value="${t.monThuLabHours}" />
          </td>
          <td>
            <input type="number" class="num-input edit-tutor-wage" data-idx="${idx}" min="8" max="45" step="0.5" value="${t.hourlyWage}" />
          </td>
          <td>${compChecks}</td>
          <td>
            <button class="btn btn-amber btn-delete-tutor" data-idx="${idx}" style="padding:0.28rem 0.55rem;font-size:0.74rem;">✕</button>
          </td>
        </tr>
      `;
    });

    document.getElementById("editor-tutor-table-wrap").innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Tutor Name</th>
            <th>Staffing Tier</th>
            <th>Contract Hrs/Wk</th>
            <th>Mon–Thu Lab Hrs</th>
            <th>Hourly Wage ($)</th>
            <th>Subject Competencies (Check All Comfortable Topics)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>${tutorRows}</tbody>
      </table>
    `;

    // Attach tutor editor listeners
    document.querySelectorAll(".edit-tutor-name").forEach(el => {
      el.addEventListener("change", e => {
        const i = Number(e.target.getAttribute("data-idx"));
        appData.tutors[i].name = e.target.value.trim() || "Tutor";
        saveState("Updated tutor name");
        renderAll(true);
      });
    });

    document.querySelectorAll(".edit-tutor-role").forEach(el => {
      el.addEventListener("change", e => {
        const i = Number(e.target.getAttribute("data-idx"));
        const val = e.target.value;
        appData.tutors[i].role = val;
        appData.tutors[i].tierLabel = val === "GA" ? "Graduate Assistant" : (val === "UG_10" ? "Undergrad Tutor (10h)" : "Student Worker (8h)");
        saveState("Updated tutor tier");
        renderAll(true);
      });
    });

    document.querySelectorAll(".edit-tutor-contract").forEach(el => {
      el.addEventListener("change", e => {
        const i = Number(e.target.getAttribute("data-idx"));
        appData.tutors[i].contractHours = Math.max(1, Number(e.target.value) || 8);
        saveState("Updated contract hours");
        renderAll(true);
      });
    });

    document.querySelectorAll(".edit-tutor-labhrs").forEach(el => {
      el.addEventListener("change", e => {
        const i = Number(e.target.getAttribute("data-idx"));
        appData.tutors[i].monThuLabHours = Math.max(1, Math.min(32, Number(e.target.value) || 8));
        saveState("Updated Mon-Thu lab hours");
        renderAll(true);
      });
    });

    document.querySelectorAll(".edit-tutor-wage").forEach(el => {
      el.addEventListener("change", e => {
        const i = Number(e.target.getAttribute("data-idx"));
        appData.tutors[i].hourlyWage = Math.max(5, Number(e.target.value) || 12.5);
        saveState("Updated tutor wage");
        renderAll(true);
      });
    });

    document.querySelectorAll(".edit-tutor-comp").forEach(el => {
      el.addEventListener("change", e => {
        const i = Number(e.target.getAttribute("data-idx"));
        const sub = e.target.getAttribute("data-sub");
        const list = appData.tutors[i].competencies;
        if (e.target.checked && !list.includes(sub)) {
          list.push(sub);
        } else if (!e.target.checked && list.includes(sub)) {
          if (list.length <= 1) {
            e.target.checked = true;
            showToast("Each tutor must have at least 1 subject competency");
            return;
          }
          appData.tutors[i].competencies = list.filter(x => x !== sub);
        }
        saveState("Updated tutor subject competencies");
        renderAll(true);
      });
    });

    document.querySelectorAll(".btn-delete-tutor").forEach(el => {
      el.addEventListener("click", e => {
        if (appData.tutors.length <= 2) {
          showToast("Cannot remove all tutors!");
          return;
        }
        const i = Number(e.currentTarget.getAttribute("data-idx"));
        const removed = appData.tutors.splice(i, 1)[0];
        // Also remove from currentScheduleTutorsByHour if present
        appData.meta.operatingDays.forEach(d => {
          appData.meta.operatingHours.forEach(h => {
            appData.currentScheduleTutorsByHour[d][h.id] =
              (appData.currentScheduleTutorsByHour[d][h.id] || []).filter(id => id !== removed.id);
          });
        });
        saveState(`Removed ${removed.name}`);
        renderAll(true);
      });
    });

    // 2. Render Editable Hourly Arrivals Table
    const editDay = document.getElementById("editor-arrival-day").value || "Monday";
    const dayArrivals = appData.hourlyArrivals[editDay];

    let arrHeaderCols = appData.subjects.map(s => `<th style="color:${s.color}">${s.name} (${s.short})</th>`).join("");
    let arrRows = "";

    appData.meta.operatingHours.forEach(hrObj => {
      const hr = hrObj.id;
      const rowData = dayArrivals[hr] || {};
      let total = 0;
      const inputsHtml = appData.subjects.map(s => {
        const val = Number(rowData[s.id]) || 0;
        total += val;
        return `
          <td>
            <input type="number" class="num-input edit-arrival-cell"
                   data-day="${editDay}" data-hr="${hr}" data-sub="${s.id}"
                   min="0" max="100" step="1" value="${val}" />
          </td>
        `;
      }).join("");

      arrRows += `
        <tr>
          <td><strong>${hrObj.label}</strong></td>
          ${inputsHtml}
          <td style="font-family:'JetBrains Mono',monospace;font-weight:800;color:var(--accent-primary);">
            ${total} students/hr
          </td>
        </tr>
      `;
    });

    document.getElementById("editor-arrivals-table-wrap").innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Hour Block (${editDay})</th>
            ${arrHeaderCols}
            <th>Hourly Total (&lambda;<sub>t</sub>)</th>
          </tr>
        </thead>
        <tbody>${arrRows}</tbody>
      </table>
    `;

    document.querySelectorAll(".edit-arrival-cell").forEach(el => {
      el.addEventListener("change", e => {
        const d = e.target.getAttribute("data-day");
        const h = e.target.getAttribute("data-hr");
        const s = e.target.getAttribute("data-sub");
        appData.hourlyArrivals[d][h][s] = Math.max(0, Number(e.target.value) || 0);
        saveState(`Updated ${d} ${h} arrivals`);
        renderAll(true);
      });
    });
  }

  // ==========================================================================
  // FILE EXPORT & EXCEL/CSV/JSON IMPORT HANDLERS
  // ==========================================================================
  function downloadUpdatedDataJs() {
    const content = `/**
 * ============================================================================
 * MATH 319: MATHEMATICAL MODELING — DATA & CONFIGURATION FILE (data.js)
 * Exported from Dashboard on ${new Date().toLocaleString()}
 * ============================================================================
 */

window.MATH_LAB_DEFAULT_DATA = ${JSON.stringify(appData, null, 2)};
`;
    const blob = new Blob([content], { type: "application/javascript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.js";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded updated data.js!");
  }

  function exportExcelWorkbook() {
    if (typeof XLSX === "undefined") {
      showToast("SheetJS library not loaded");
      return;
    }
    const wb = XLSX.utils.book_new();

    // Sheet 1: Optimized Schedule & KPIs by Day/Hour
    const schedRows = [];
    appData.meta.operatingDays.forEach(d => {
      appData.meta.operatingHours.forEach(h => {
        const c = currentEval.byDay[d][h.id];
        const o = optimizedEval.byDay[d][h.id];
        schedRows.push({
          Day: d,
          Hour: h.label,
          Arrivals_Total: o.arrivals,
          Algebra: o.subjectArrivals.alg,
          Trigonometry: o.subjectArrivals.trig,
          Precalculus: o.subjectArrivals.pre,
          Calculus: o.subjectArrivals.calc,
          Statistics: o.subjectArrivals.stats,
          Current_Tutors: c.xt,
          Current_Wait_Min: c.waitMinutes,
          Current_Overlooked: c.overlookedStudents,
          Optimized_Tutors: o.xt,
          Optimized_Wait_Min: o.waitMinutes,
          Optimized_Overlooked: o.overlookedStudents,
          Assigned_Roster: o.tutorIds.join(", ")
        });
      });
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(schedRows), "Schedule_Comparison");

    // Sheet 2: Tutor Roster Summary
    const rosterRows = optimizedEval.tutorSummary.map(t => ({
      Tutor_ID: t.id,
      Name: t.name,
      Tier: t.tierLabel,
      Contract_Hours: t.contractHours,
      MonThu_Lab_Hours: t.monThuLabHours,
      Assigned_Hours: t.assignedHours,
      Hourly_Wage: t.hourlyWage,
      Weekly_Pay: t.weeklyPay,
      Competencies: t.competencies.join(", ")
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rosterRows), "Tutor_Roster");

    XLSX.writeFile(wb, "Math319_Math_Lab_Optimization_Report.xlsx");
    showToast("Exported Excel report (.xlsx)!");
  }

  function handleFileUpload(file) {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "json") {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (parsed.tutors && parsed.hourlyArrivals) {
            appData = parsed;
            appData.meta.dataSourceName = file.name;
            saveState(`Imported ${file.name}`);
            renderAll(true);
          } else {
            showToast("JSON file missing required fields");
          }
        } catch (err) {
          showToast("Invalid JSON file");
        }
      };
      reader.readAsText(file);
      return;
    }

    // Handle .xlsx, .xls, or .csv via SheetJS
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(firstSheet);

        if (rows && rows.length > 0) {
          let updatedCount = 0;
          rows.forEach(r => {
            const day = r.Day || r.day || r.DAY;
            const hrRaw = String(r.Hour || r.hour || r.Time || "").trim();
            if (day && appData.hourlyArrivals[day]) {
              const matchedHr = appData.meta.operatingHours.find(
                h => h.id === hrRaw || h.label.toLowerCase() === hrRaw.toLowerCase() || h.short.toLowerCase() === hrRaw.toLowerCase()
              );
              if (matchedHr) {
                const target = appData.hourlyArrivals[day][matchedHr.id];
                if (r.Algebra !== undefined) target.alg = Number(r.Algebra) || 0;
                if (r.Trigonometry !== undefined) target.trig = Number(r.Trigonometry) || 0;
                if (r.Precalculus !== undefined) target.pre = Number(r.Precalculus) || 0;
                if (r.Calculus !== undefined) target.calc = Number(r.Calculus) || 0;
                if (r.Statistics !== undefined) target.stats = Number(r.Statistics) || 0;
                updatedCount++;
              }
            }
          });
          appData.meta.dataSourceName = file.name;
          saveState(`Loaded ${file.name} (${updatedCount > 0 ? updatedCount + ' hourly slots updated' : rows.length + ' records analyzed'})`);
          renderAll(true);
        }
      } catch (err) {
        console.error(err);
        showToast("Could not parse spreadsheet file");
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // ==========================================================================
  // INITIALIZE EVENT LISTENERS
  // ==========================================================================
  function initEventListeners() {
    // Tab switching
    document.querySelectorAll(".nav-tab").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".nav-tab").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        const tabId = btn.getAttribute("data-tab");
        document.getElementById(tabId).classList.add("active");
        if (tabId === "tab-overview") {
          renderOverviewCharts();
        }
      });
    });

    // Dark / Light mode toggle
    document.getElementById("btn-theme-toggle").addEventListener("click", (e) => {
      document.body.classList.toggle("light-theme");
      const isLight = document.body.classList.contains("light-theme");
      e.currentTarget.textContent = isLight ? "🌙 Dark Mode" : "☀️ Light Mode";
      renderOverviewCharts();
    });

    // Global sensitivity sliders
    const sliderSurge = document.getElementById("slider-surge");
    const sliderSession = document.getElementById("slider-session");
    const sliderBudgetCut = document.getElementById("slider-budget-cut");
    const sliderSmoothing = document.getElementById("slider-smoothing");
    const selectObjective = document.getElementById("select-objective");

    function syncSlidersToUI() {
      const p = appData.parameters;
      sliderSurge.value = p.trafficSurgePercent;
      document.getElementById("val-surge").textContent = (p.trafficSurgePercent >= 0 ? "+" : "") + p.trafficSurgePercent + "%";

      sliderSession.value = p.avgSessionMinutes;
      document.getElementById("val-session").textContent = p.avgSessionMinutes + " min";

      sliderBudgetCut.value = p.budgetCutPercent;
      document.getElementById("val-budget-cut").textContent = (p.budgetCutPercent > 0 ? "-" : (p.budgetCutPercent < 0 ? "+" : "")) + Math.abs(p.budgetCutPercent) + "%";

      sliderSmoothing.value = p.demandSmoothingPercent;
      document.getElementById("val-smoothing").textContent = p.demandSmoothingPercent + "%";

      selectObjective.value = p.optimizationObjective;
    }

    sliderSurge.addEventListener("input", e => {
      appData.parameters.trafficSurgePercent = Number(e.target.value);
      syncSlidersToUI();
      renderAll(true);
    });

    sliderSession.addEventListener("input", e => {
      appData.parameters.avgSessionMinutes = Number(e.target.value);
      syncSlidersToUI();
      renderAll(true);
    });

    sliderBudgetCut.addEventListener("input", e => {
      appData.parameters.budgetCutPercent = Number(e.target.value);
      syncSlidersToUI();
      renderAll(true);
    });

    sliderSmoothing.addEventListener("input", e => {
      appData.parameters.demandSmoothingPercent = Number(e.target.value);
      syncSlidersToUI();
      renderAll(true);
    });

    selectObjective.addEventListener("change", e => {
      appData.parameters.optimizationObjective = e.target.value;
      renderAll(true);
    });

    // Scenario Presets
    document.querySelectorAll(".preset-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        document.querySelectorAll(".preset-pill").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        const preset = pill.getAttribute("data-preset");
        if (preset === "baseline") {
          appData.parameters.trafficSurgePercent = 0;
          appData.parameters.avgSessionMinutes = 20;
          appData.parameters.budgetCutPercent = 0;
          appData.parameters.demandSmoothingPercent = 0;
        } else if (preset === "midterm") {
          appData.parameters.trafficSurgePercent = 30;
          appData.parameters.avgSessionMinutes = 20;
          appData.parameters.budgetCutPercent = 0;
          appData.parameters.demandSmoothingPercent = 0;
        } else if (preset === "long_sessions") {
          appData.parameters.trafficSurgePercent = 0;
          appData.parameters.avgSessionMinutes = 30;
          appData.parameters.budgetCutPercent = 0;
          appData.parameters.demandSmoothingPercent = 0;
        } else if (preset === "budget_cut") {
          appData.parameters.trafficSurgePercent = 0;
          appData.parameters.avgSessionMinutes = 20;
          appData.parameters.budgetCutPercent = 15;
          appData.parameters.demandSmoothingPercent = 0;
        } else if (preset === "demand_nudge") {
          appData.parameters.trafficSurgePercent = 0;
          appData.parameters.avgSessionMinutes = 20;
          appData.parameters.budgetCutPercent = 0;
          appData.parameters.demandSmoothingPercent = 15;
        }
        syncSlidersToUI();
        renderAll(true);
        showToast(`Applied scenario preset: ${pill.textContent}`);
      });
    });

    // Day selectors across tabs
    document.getElementById("select-overview-day").addEventListener("change", () => renderOverviewCharts());
    document.getElementById("select-schedule-day").addEventListener("change", () => renderScheduleTab());
    document.getElementById("btn-reoptimize-schedule").addEventListener("click", () => {
      renderAll(true);
      showToast("Re-computed optimal ILP schedule!");
    });

    document.getElementById("proto-day-select").addEventListener("change", () => renderModelsTab());
    document.getElementById("proto-window-select").addEventListener("change", () => renderModelsTab());
    document.getElementById("editor-arrival-day").addEventListener("change", () => renderEditorTab());

    // Add New Tutor button
    document.getElementById("btn-add-tutor").addEventListener("click", () => {
      const newId = "ug-custom-" + (appData.tutors.length + 1);
      appData.tutors.push({
        id: newId,
        name: "New Tutor " + (appData.tutors.length + 1),
        role: "UG_8",
        tierLabel: "Student Worker (8h)",
        contractHours: 8,
        monThuLabHours: 8,
        hourlyWage: 12.50,
        competencies: ["alg", "trig"],
        notes: "Added via Dashboard Studio"
      });
      saveState("Added new tutor to roster");
      renderAll(true);
    });

    // Export / Import / Reset buttons
    document.getElementById("btn-export-datajs").addEventListener("click", downloadUpdatedDataJs);
    document.getElementById("btn-download-datajs-2").addEventListener("click", downloadUpdatedDataJs);
    document.getElementById("btn-export-excel").addEventListener("click", exportExcelWorkbook);

    document.getElementById("file-upload-input").addEventListener("change", e => {
      if (e.target.files && e.target.files[0]) {
        handleFileUpload(e.target.files[0]);
      }
    });

    document.getElementById("btn-reset-defaults").addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEY);
      appData = clone(window.MATH_LAB_DEFAULT_DATA);
      customPrototypeXt = {};
      syncSlidersToUI();
      renderAll(true);
      showToast("Reset all data & schedules to baseline!");
    });

    syncSlidersToUI();
  }

  // Boot application on DOMContentLoaded
  document.addEventListener("DOMContentLoaded", () => {
    initEventListeners();
    renderAll(true);
  });
})();

