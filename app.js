/**
 * ============================================================================
 * MATH 319: MATHEMATICAL MODELING — INTERACTIVE APPLICATION CONTROLLER (app.js)
 * Connects data.js, optimizer.js (Erlang-C & Shift Templates), Chart.js visualizations,
 * and the Live Student Profile / QR Check-in System.
 * Based on: Osuntuyi_Proj1.xlsx
 * ============================================================================
 */

(function () {
  const STORAGE_KEY = "MATH319_LAB_DASHBOARD_STATE_V2_ERLANG";

  // Deep clone utility
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Ensure all data structures are properly populated and backward-compatible
  function normalizeAppData(data) {
    const def = window.MATH_LAB_DEFAULT_DATA;
    const legacyProfMap = {
      "Prof. Ross": "Dr. Andrew Ross",
      "Dr. Carter": "Dr. Roxanne Katus",
      "Prof. Reynolds": "Prof. Mary Walker",
      "Dr. Lin": "Dr. Gabriela Dumitrascu",
      "Prof. Alvarez": "Dr. Lon Mitchell",
      "Dr. Patel": "Dr. Khairul Islam"
    };
    const mapProfName = (name) => legacyProfMap[name] || name;

    if (!data.parameters) data.parameters = clone(def.parameters);
    if (!data.parameters.lambdaStudent) data.parameters.lambdaStudent = 4;
    if (!data.parameters.muTutor) data.parameters.muTutor = 20;
    if (!data.parameters.targetWaitMin) data.parameters.targetWaitMin = 3;
    if (!data.parameters.safetyFactorBeta) data.parameters.safetyFactorBeta = 1.0;

    if (!data.templateAssignments || typeof data.templateAssignments !== "object") {
      data.templateAssignments = clone(def.optimalTemplateAssignments || def.initialTemplateAssignments);
    }

    if (!Array.isArray(data.shiftTemplates) || data.shiftTemplates.length === 0) {
      data.shiftTemplates = clone(def.shiftTemplates || []);
    }
    if (!Array.isArray(data.erlangBaselineRows) || data.erlangBaselineRows.length === 0) {
      data.erlangBaselineRows = clone(def.erlangBaselineRows || []);
    }
    if (!Array.isArray(data.erlangSqrtCheckRows) || data.erlangSqrtCheckRows.length === 0) {
      data.erlangSqrtCheckRows = clone(def.erlangSqrtCheckRows || []);
    }

    if (!Array.isArray(data.lecturers) || data.lecturers.length === 0) {
      data.lecturers = clone(def.lecturers || []);
    } else {
      data.lecturers = data.lecturers.map(mapProfName);
      (def.lecturers || []).forEach(emuProf => {
        if (!data.lecturers.includes(emuProf)) {
          data.lecturers.push(emuProf);
        }
      });
    }

    if (!Array.isArray(data.classSchedule)) {
      data.classSchedule = clone(def.classSchedule);
    }
    data.classSchedule.forEach((c, i) => {
      const defItem = (def.classSchedule && def.classSchedule[i]) || {};
      if (!Array.isArray(c.lecturers)) {
        c.lecturers = Array.isArray(defItem.lecturers) ? clone(defItem.lecturers) : ["Dr. Andrew Ross"];
      } else {
        c.lecturers = c.lecturers.map(mapProfName);
      }
      c.lecturers.forEach(prof => {
        if (prof && !data.lecturers.includes(prof)) {
          data.lecturers.push(prof);
        }
      });
      if (!Array.isArray(c.days) || c.days.length === 0) {
        c.days = ["Monday", "Tuesday", "Wednesday", "Thursday"];
      }
      if (typeof c.walkIns !== "number" || isNaN(c.walkIns)) {
        c.walkIns = Math.round(((c.enrolled || 0) * (c.expectedLabCapturePct || 10)) / 100);
      }
    });

    if (!data.qrConfig || typeof data.qrConfig !== "object") {
      data.qrConfig = clone(def.qrConfig || {
        checkInUrl: "https://yusuf-osuntuyi.github.io/math319-math-lab-dashboard/checkin.html?mode=in",
        checkOutUrl: "https://yusuf-osuntuyi.github.io/math319-math-lab-dashboard/checkin.html?mode=out",
        autoSyncArrivals: true
      });
    }
    if (!data.qrConfig.checkInUrl) {
      data.qrConfig.checkInUrl = "https://yusuf-osuntuyi.github.io/math319-math-lab-dashboard/checkin.html?mode=in";
    }
    if (!data.qrConfig.checkOutUrl) {
      data.qrConfig.checkOutUrl = "https://yusuf-osuntuyi.github.io/math319-math-lab-dashboard/checkin.html?mode=out";
    }
    if (!Array.isArray(data.attendanceLog)) {
      data.attendanceLog = clone(def.attendanceLog || []);
    }
    if (!Array.isArray(data.studentProfiles)) {
      data.studentProfiles = clone(def.studentProfiles || []);
    }
    const avatarList = window.PIXEL_AVATARS_16BIT || [];
    data.studentProfiles.forEach((p, idx) => {
      const defProf = (def.studentProfiles || []).find(dp => dp.name.toLowerCase() === (p.name || "").toLowerCase());
      const parts = (p.name || "Student").trim().split(/\s+/);
      if (!p.firstName) p.firstName = (defProf && defProf.firstName) || parts[0] || "Student";
      if (!p.lastName) p.lastName = (defProf && defProf.lastName) || parts.slice(1).join(" ") || "";
      p.name = `${p.firstName} ${p.lastName}`.trim();
      if (!p.major) p.major = (defProf && defProf.major) || "STEM / Mathematics";
      if (!p.hobbies) p.hobbies = (defProf && defProf.hobbies) || "Campus study groups, retro gaming, intramural sports";
      if (!p.avatarId) p.avatarId = (defProf && defProf.avatarId) || (avatarList[idx % Math.max(1, avatarList.length)] ? avatarList[idx % avatarList.length].id : "pixel-wizard");
      if (p.lecturer) p.lecturer = mapProfName(p.lecturer);
    });

    data.attendanceLog.forEach(r => {
      if (typeof r.studentName === "string") {
        r.studentName = r.studentName.replace(/\s*\(#\d+\)\s*$/, "").trim();
      }
      if (r.lecturer) r.lecturer = mapProfName(r.lecturer);
    });

    if (!Array.isArray(data.tutors) || data.tutors.length === 0) {
      data.tutors = clone(def.tutors || []);
    }

    return data;
  }

  // Load state from localStorage or fallback to window.MATH_LAB_DEFAULT_DATA
  function loadInitialState() {
    try {
      let saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        saved = localStorage.getItem("MATH319_LAB_DASHBOARD_STATE_V1");
      }
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.tutors && parsed.parameters) {
          return normalizeAppData(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not read saved state from localStorage:", e);
    }
    return normalizeAppData(clone(window.MATH_LAB_DEFAULT_DATA));
  }

  let appData = loadInitialState();
  let engine = new MathLabModelEngine(appData);
  let templateEval = null;
  let baselineEval = null;
  let optimizedSchedule = null;
  let currentEval = null;
  let optimizedEval = null;

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

  // Recompute Erlang-C evaluations and shift schedules
  function recomputeModels(reoptimize = true) {
    engine = new MathLabModelEngine(appData);
    templateEval = engine.evaluateTemplateAssignments(appData.templateAssignments, appData.parameters);
    baselineEval = engine.evaluateTemplateAssignments(window.MATH_LAB_DEFAULT_DATA.initialTemplateAssignments, appData.parameters);

    optimizedSchedule = engine.solveOptimalSchedule(appData.parameters);
    currentEval = engine.evaluateSchedule(appData.currentScheduleTutorsByHour, appData.parameters);
    optimizedEval = engine.evaluateSchedule(optimizedSchedule, appData.parameters);
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
    renderQrTab();
  }

  function renderHeaderMeta() {
    document.getElementById("header-project-title").textContent = appData.meta.projectTitle;
    document.getElementById("header-author").textContent = appData.meta.author;
    document.getElementById("header-datasource").textContent = "Data: " + appData.meta.dataSourceName;
  }

  // ==========================================================================
  // TAB 1: EXECUTIVE OVERVIEW, SHIFT ALLOCATOR & ERLANG-C CHARTS
  // ==========================================================================
  function renderOverviewTab() {
    const kpi = templateEval.kpis;
    const baseKpi = baselineEval.kpis;

    // 1. Dynamic insight banner
    const bannerEl = document.getElementById("overview-insight-banner");
    if (bannerEl) {
      const isTargetMet = kpi.meetsTargetAllHours;
      bannerEl.innerHTML = `
        <strong>M/M/c Erlang-C Modeling Insight:</strong> Under baseline staffing (GA-T1: 1, GA-T2: 1), peak demand at 12:00–1:00 PM creates severe server saturation (&rho; &gt; 1.5), causing queues to overflow to <strong>${baseKpi.maxWait} minutes</strong> (weighted avg: <strong>${baseKpi.weightedAvgWait} min</strong>). Under the Shift Template formulation using all <strong>9 GAs (20h each)</strong> and <strong>4 SIs (8h each)</strong>, maximum wait drops to <strong>${kpi.maxWait} min</strong> and weighted wait to <strong>${kpi.weightedAvgWait} min</strong> (${isTargetMet ? '✅ Target &lt; 3.0 min met across all 36 open lab hours!' : '⚠️ ' + kpi.slotsExceedingTarget + ' hours exceed target'}).
      `;
    }

    // 2. Render Shift Template Allocator Studio Cards
    const allocGrid = document.getElementById("template-allocation-inputs-grid");
    if (allocGrid) {
      const templates = appData.shiftTemplates || [];
      allocGrid.innerHTML = templates.map(tpl => {
        const count = Number(appData.templateAssignments[tpl.id]) || 0;
        const isGA = tpl.role === "GA";
        return `
          <div style="background:var(--bg-subtle);border:1px solid var(--border-subtle);border-radius:8px;padding:0.75rem;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.35rem;">
              <strong style="color:var(--text-primary);font-size:0.85rem;">${tpl.name}</strong>
              <span class="badge ${isGA ? 'badge-blue' : 'badge-emerald'}" style="font-size:0.72rem;">
                ${tpl.role} (${tpl.weeklyHours}h/wk)
              </span>
            </div>
            <div style="font-size:0.75rem;color:var(--text-secondary);min-height:32px;margin-bottom:0.5rem;">
              ${tpl.description}
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;background:var(--bg-card);border:1px solid var(--border-color);border-radius:6px;padding:0.25rem 0.5rem;">
              <span style="font-size:0.75rem;font-weight:600;color:var(--text-secondary);">Tutors Assigned:</span>
              <div style="display:flex;align-items:center;gap:0.35rem;">
                <button type="button" class="btn-tpl-minus" data-id="${tpl.id}" style="background:none;border:none;color:var(--text-primary);cursor:pointer;font-weight:800;font-size:0.9rem;padding:0 0.35rem;line-height:1;">&minus;</button>
                <input type="number" class="num-input tpl-input" data-id="${tpl.id}" min="0" max="9" value="${count}" style="width:45px;text-align:center;padding:0.2rem 0.3rem;font-size:0.82rem;font-weight:700;" />
                <button type="button" class="btn-tpl-plus" data-id="${tpl.id}" style="background:none;border:none;color:var(--text-primary);cursor:pointer;font-weight:800;font-size:0.9rem;padding:0 0.35rem;line-height:1;">+</button>
              </div>
            </div>
          </div>
        `;
      }).join("");

      // Bind increment/decrement and direct inputs
      allocGrid.querySelectorAll(".btn-tpl-minus").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const id = e.currentTarget.getAttribute("data-id");
          const cur = Number(appData.templateAssignments[id]) || 0;
          if (cur > 0) {
            appData.templateAssignments[id] = cur - 1;
            saveState();
            renderAll(false);
          }
        });
      });

      allocGrid.querySelectorAll(".btn-tpl-plus").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const id = e.currentTarget.getAttribute("data-id");
          const cur = Number(appData.templateAssignments[id]) || 0;
          appData.templateAssignments[id] = cur + 1;
          saveState();
          renderAll(false);
        });
      });

      allocGrid.querySelectorAll(".tpl-input").forEach(inp => {
        inp.addEventListener("change", (e) => {
          const id = e.currentTarget.getAttribute("data-id");
          const val = Math.max(0, parseInt(e.target.value, 10) || 0);
          appData.templateAssignments[id] = val;
          saveState();
          renderAll(false);
        });
      });
    }

    // 3. Update Allocator Status Badges
    const badgeGAs = document.getElementById("badge-total-gas");
    if (badgeGAs) {
      badgeGAs.textContent = `GAs Scheduled: ${kpi.totalGAs} / 9`;
      badgeGAs.className = `badge ${kpi.totalGAs === 9 ? 'badge-blue' : 'badge-amber'}`;
    }
    const badgeSIs = document.getElementById("badge-total-sis");
    if (badgeSIs) {
      badgeSIs.textContent = `SIs Scheduled: ${kpi.totalSIs} / 4`;
      badgeSIs.className = `badge ${kpi.totalSIs <= 4 ? 'badge-emerald' : 'badge-rose'}`;
    }
    const badgeHours = document.getElementById("badge-total-hours");
    if (badgeHours) {
      badgeHours.textContent = `Total Hours: ${kpi.totalWeeklyHours} / 212 hrs`;
      badgeHours.className = `badge ${kpi.totalWeeklyHours === 212 ? 'badge-purple' : 'badge-amber'}`;
    }
    const badgeStatus = document.getElementById("badge-target-status");
    if (badgeStatus) {
      badgeStatus.textContent = kpi.meetsTargetAllHours ? "✅ Target Met: All 36 Hours < 3.0m" : `⚠️ Exceeds Target in ${kpi.slotsExceedingTarget} Hours`;
      badgeStatus.className = `badge ${kpi.meetsTargetAllHours ? 'badge-emerald' : 'badge-rose'}`;
    }

    // Bind Quick Action Buttons
    const btnOpt = document.getElementById("btn-apply-optimal-tpl");
    if (btnOpt && !btnOpt._bound) {
      btnOpt._bound = true;
      btnOpt.addEventListener("click", () => {
        appData.templateAssignments = clone(window.MATH_LAB_DEFAULT_DATA.optimalTemplateAssignments);
        saveState("Applied Optimal Full Staffing (9 GAs + 4 SIs)");
        renderAll(false);
      });
    }

    const btnBase = document.getElementById("btn-load-baseline-tpl");
    if (btnBase && !btnBase._bound) {
      btnBase._bound = true;
      btnBase.addEventListener("click", () => {
        appData.templateAssignments = clone(window.MATH_LAB_DEFAULT_DATA.initialTemplateAssignments);
        saveState("Loaded Workbook Baseline Schedule (GA-T1: 1, GA-T2: 1)");
        renderAll(false);
      });
    }

    // 4. Render Top 6 KPI Comparison Cards
    const kpiGrid = document.getElementById("kpi-summary-grid");
    if (kpiGrid) {
      kpiGrid.innerHTML = `
        <!-- KPI 1: Target Wait Bound -->
        <div class="kpi-card emerald">
          <div class="kpi-header">
            <span>Target Max Wait (W_q)</span>
            <span>🎯 Workbook B4</span>
          </div>
          <div class="kpi-comparison">
            <span class="kpi-main-val">&le; ${kpi.targetWaitMin} min</span>
            <span class="kpi-old-val">c &ge; minTutors</span>
          </div>
          <div class="kpi-delta good">
            ${kpi.meetsTargetAllHours ? '✅ 100% Satisfied' : '⚠️ ' + kpi.slotsExceedingTarget + ' hrs exceed'}
          </div>
          <div class="kpi-footnote">
            Max allowed expected wait time in queue
          </div>
        </div>

        <!-- KPI 2: Max Wait Time -->
        <div class="kpi-card ${kpi.maxWait <= kpi.targetWaitMin ? 'emerald' : 'rose'}">
          <div class="kpi-header">
            <span>Peak Wait Time</span>
            <span>⏱️ Erlang-C W_q</span>
          </div>
          <div class="kpi-comparison">
            <span class="kpi-main-val">${kpi.maxWait} min</span>
            <span class="kpi-old-val">was ${baseKpi.maxWait} min</span>
          </div>
          <div class="kpi-delta ${kpi.maxWait <= kpi.targetWaitMin ? 'good' : 'warn'}">
            ${kpi.maxWait < baseKpi.maxWait ? '&minus;' + (baseKpi.maxWait - kpi.maxWait).toFixed(1) + ' min reduction' : 'Unbalanced peak'}
          </div>
          <div class="kpi-footnote">
            Longest expected wait at any peak hour
          </div>
        </div>

        <!-- KPI 3: Weighted Average Wait Time -->
        <div class="kpi-card ${kpi.weightedAvgWait <= 1.0 ? 'emerald' : 'amber'}">
          <div class="kpi-header">
            <span>Weighted Avg Wait</span>
            <span>&Sigma;&lambda;W / &Sigma;&lambda;</span>
          </div>
          <div class="kpi-comparison">
            <span class="kpi-main-val">${kpi.weightedAvgWait} min</span>
            <span class="kpi-old-val">was ${baseKpi.weightedAvgWait} min</span>
          </div>
          <div class="kpi-delta good">
            Weighted by student requests-for-help (&lambda;)
          </div>
          <div class="kpi-footnote">
            Workbook row 58: SUMPRODUCT(&lambda;, Wq) / SUM(&lambda;)
          </div>
        </div>

        <!-- KPI 4: Graduate Assistants Scheduled -->
        <div class="kpi-card blue">
          <div class="kpi-header">
            <span>Graduate Assistants</span>
            <span>Constraint = 9</span>
          </div>
          <div class="kpi-comparison">
            <span class="kpi-main-val">${kpi.totalGAs} / 9 GAs</span>
            <span class="kpi-old-val">${kpi.totalGAs * 20} hrs/wk</span>
          </div>
          <div class="kpi-delta ${kpi.totalGAs === 9 ? 'good' : 'warn'}">
            ${kpi.totalGAs === 9 ? '✅ Exactly 9 GAs Scheduled' : (kpi.totalGAs < 9 ? '⚠️ ' + (9 - kpi.totalGAs) + ' GAs Unallocated' : '⚠️ Exceeds 9 GAs')}
          </div>
          <div class="kpi-footnote">
            Exact 20 hrs/week contract per GA
          </div>
        </div>

        <!-- KPI 5: Supplemental Instructors Scheduled -->
        <div class="kpi-card purple">
          <div class="kpi-header">
            <span>Supplemental Instructors</span>
            <span>Constraint &le; 4</span>
          </div>
          <div class="kpi-comparison">
            <span class="kpi-main-val">${kpi.totalSIs} / 4 SIs</span>
            <span class="kpi-old-val">${kpi.totalSIs * 8} hrs/wk</span>
          </div>
          <div class="kpi-delta ${kpi.totalSIs <= 4 ? 'good' : 'warn'}">
            ${kpi.totalSIs <= 4 ? '✅ Within SI Budget Cap' : '⚠️ Exceeds Max 4 SIs'}
          </div>
          <div class="kpi-footnote">
            Up to 8 hrs/week contract per SI
          </div>
        </div>

        <!-- KPI 6: Tutor Service Rate (mu) -->
        <div class="kpi-card">
          <div class="kpi-header">
            <span>Tutoring Speed (&mu;)</span>
            <span>⚡ 3 min / visit</span>
          </div>
          <div class="kpi-comparison">
            <span class="kpi-main-val">${appData.parameters.muTutor || 20} / hr</span>
            <span class="kpi-old-val">1/&mu; = 3 min</span>
          </div>
          <div class="kpi-delta good">
            Offered Load a = &lambda; / ${appData.parameters.muTutor || 20}
          </div>
          <div class="kpi-footnote">
            Workbook row 3: Questions answered per tutor/hr
          </div>
        </div>
      `;
    }

    renderOverviewCharts();
  }

  // ==========================================================================
  // RENDER 4 OVERVIEW CHARTS (ERLANG-C & SQUARE-ROOT STAFFING)
  // ==========================================================================
  function renderOverviewCharts() {
    const dayKey = (document.getElementById("select-overview-day")?.value) || "AVG";
    const baseRows = baselineEval.evaluatedRows;
    const activeRows = templateEval.evaluatedRows;
    const mu = engine.getServiceRateMu(appData.parameters);

    const isLight = document.body.classList.contains("light-theme");
    const textColor = isLight ? "#334155" : "#cbd5e1";
    const gridColor = isLight ? "rgba(148, 163, 184, 0.25)" : "rgba(51, 65, 85, 0.55)";

    let chartLabels = [];
    let seriesLambda = [];
    let seriesCapacityActive = [];
    let seriesCapacityBase = [];
    let seriesWaitActive = [];
    let seriesWaitBase = [];
    let seriesTutorsActive = [];
    let seriesTutorsMin = [];

    if (dayKey === "AVG") {
      const hourMap = {};
      appData.meta.operatingHours.forEach(h => {
        hourMap[h.hour24] = {
          label: h.label,
          sumLam: 0,
          sumCapActive: 0,
          sumCapBase: 0,
          sumWaitActive: 0,
          sumWaitBase: 0,
          sumTutorsActive: 0,
          sumTutorsMin: 0,
          count: 0
        };
      });

      activeRows.forEach((r, idx) => {
        const b = baseRows[idx];
        const hObj = hourMap[r.hour];
        if (hObj) {
          hObj.sumLam += r.handRaiseLambda;
          hObj.sumCapActive += r.scheduledTutors * mu;
          hObj.sumCapBase += b ? b.scheduledTutors * mu : 0;
          hObj.sumWaitActive += Math.min(60, r.wqMinutes);
          hObj.sumWaitBase += b ? Math.min(60, b.wqMinutes) : 0;
          hObj.sumTutorsActive += r.scheduledTutors;
          hObj.sumTutorsMin += r.minTutorsCalculated;
          hObj.count++;
        }
      });

      appData.meta.operatingHours.forEach(h => {
        const hObj = hourMap[h.hour24];
        if (hObj && hObj.count > 0) {
          chartLabels.push(hObj.label);
          seriesLambda.push(Math.round((hObj.sumLam / hObj.count) * 10) / 10);
          seriesCapacityActive.push(Math.round((hObj.sumCapActive / hObj.count) * 10) / 10);
          seriesCapacityBase.push(Math.round((hObj.sumCapBase / hObj.count) * 10) / 10);
          seriesWaitActive.push(Math.round((hObj.sumWaitActive / hObj.count) * 100) / 100);
          seriesWaitBase.push(Math.round((hObj.sumWaitBase / hObj.count) * 100) / 100);
          seriesTutorsActive.push(Math.round((hObj.sumTutorsActive / hObj.count) * 10) / 10);
          seriesTutorsMin.push(Math.round((hObj.sumTutorsMin / hObj.count) * 10) / 10);
        }
      });
    } else {
      const filteredActive = activeRows.filter(r => r.day === dayKey);
      const filteredBase = baseRows.filter(r => r.day === dayKey);

      filteredActive.forEach((r, idx) => {
        const b = filteredBase[idx];
        chartLabels.push(`${r.hour}:00`);
        seriesLambda.push(r.handRaiseLambda);
        seriesCapacityActive.push(r.scheduledTutors * mu);
        seriesCapacityBase.push(b ? b.scheduledTutors * mu : 0);
        seriesWaitActive.push(Math.min(60, r.wqMinutes));
        seriesWaitBase.push(b ? Math.min(60, b.wqMinutes) : 0);
        seriesTutorsActive.push(r.scheduledTutors);
        seriesTutorsMin.push(r.minTutorsCalculated);
      });
    }

    // ------------------------------------------------------------------------
    // GRAPH 1: Hand-Raise Arrival Rate vs. Tutoring Capacity
    // ------------------------------------------------------------------------
    const ctx1 = document.getElementById("chart-inflow-capacity")?.getContext("2d");
    if (ctx1) {
      if (chartInflow) chartInflow.destroy();
      chartInflow = new Chart(ctx1, {
        data: {
          labels: chartLabels,
          datasets: [
            {
              type: "bar",
              label: "Hand-Raise Rate (λ = 4 × N)",
              data: seriesLambda,
              backgroundColor: "rgba(59, 130, 246, 0.65)",
              borderColor: "#3b82f6",
              borderWidth: 1.5,
              order: 3
            },
            {
              type: "line",
              label: "Scheduled Tutoring Capacity (c_t · μ)",
              data: seriesCapacityActive,
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
              label: "Baseline Capacity (What Happened: GA-T1 & GA-T2 only)",
              data: seriesCapacityBase,
              borderColor: "#f43f5e",
              borderDash: [6, 4],
              borderWidth: 2.5,
              pointRadius: 3.5,
              pointBackgroundColor: "#f43f5e",
              tension: 0.25,
              order: 2
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
                footer: (items) => {
                  const idx = items[0].dataIndex;
                  return `Hand-Raises: ${seriesLambda[idx]}/hr | Active Cap: ${seriesCapacityActive[idx]}/hr | Baseline Cap: ${seriesCapacityBase[idx]}/hr`;
                }
              }
            }
          },
          scales: {
            x: { ticks: { color: textColor }, grid: { color: gridColor } },
            y: {
              beginAtZero: true,
              title: { display: true, text: "Questions & Capacity per Hour", color: textColor },
              ticks: { color: textColor },
              grid: { color: gridColor }
            }
          }
        }
      });
    }

    // ------------------------------------------------------------------------
    // GRAPH 2: Erlang-C Expected Wait Time (W_q) vs. 3-Minute Target Line
    // ------------------------------------------------------------------------
    const ctx2 = document.getElementById("chart-wait-time")?.getContext("2d");
    if (ctx2) {
      if (chartWait) chartWait.destroy();
      const targetLine = Array(chartLabels.length).fill(Number(appData.parameters.targetWaitMin) || 3.0);

      chartWait = new Chart(ctx2, {
        type: "line",
        data: {
          labels: chartLabels,
          datasets: [
            {
              label: "Scheduled Staffing Wait Time (W_q in min)",
              data: seriesWaitActive,
              borderColor: "#10b981",
              backgroundColor: "rgba(16, 185, 129, 0.2)",
              fill: true,
              borderWidth: 3,
              pointRadius: 4.5,
              pointBackgroundColor: "#10b981",
              tension: 0.25
            },
            {
              label: "Baseline Wait Time (Severe ≥ 999m Peak Overflow)",
              data: seriesWaitBase,
              borderColor: "#f43f5e",
              borderDash: [5, 4],
              borderWidth: 2.5,
              pointRadius: 3.5,
              pointBackgroundColor: "#f43f5e",
              tension: 0.25
            },
            {
              label: "Target Wait Bound (3.0 Min Max Target)",
              data: targetLine,
              borderColor: "#f59e0b",
              borderDash: [4, 4],
              borderWidth: 2,
              pointRadius: 0
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
                label: (ctx) => {
                  let val = ctx.parsed.y;
                  if (ctx.dataset.label.includes("Baseline") && val >= 60) {
                    return `${ctx.dataset.label}: 999 min (Queue Overflow / Saturated)`;
                  }
                  return `${ctx.dataset.label}: ${val} min`;
                }
              }
            }
          },
          scales: {
            x: { ticks: { color: textColor }, grid: { color: gridColor } },
            y: {
              beginAtZero: true,
              max: Math.max(10, Math.min(65, Math.max(...seriesWaitBase) + 5)),
              title: { display: true, text: "Expected Wait Time W_q (Minutes)", color: textColor },
              ticks: { color: textColor },
              grid: { color: gridColor }
            }
          }
        }
      });
    }

    // ------------------------------------------------------------------------
    // GRAPH 3: Square-Root Staffing Law Verification Curve (Check_Erlang_C_sqrt)
    // ------------------------------------------------------------------------
    const ctx3 = document.getElementById("chart-tradeoff-frontier")?.getContext("2d");
    if (ctx3) {
      if (chartFrontier) chartFrontier.destroy();
      const sqrtCheckRows = appData.erlangSqrtCheckRows || [];
      const sampled = sqrtCheckRows.filter((_, idx) => idx % 2 === 0);

      chartFrontier = new Chart(ctx3, {
        type: "line",
        data: {
          labels: sampled.map(r => `a=${r.offeredLoad}`),
          datasets: [
            {
              label: "Recommended Minimum Servers (c = ceil(a + β√a))",
              data: sampled.map(r => r.minServersSqrt),
              borderColor: "#f59e0b",
              backgroundColor: "rgba(245, 158, 11, 0.2)",
              borderWidth: 3,
              pointRadius: 3,
              tension: 0.15,
              yAxisID: "yServers"
            },
            {
              label: "Erlang-C Expected Wait W_q (min, all < 1m)",
              data: sampled.map(r => r.wqMinutes),
              borderColor: "#10b981",
              borderDash: [5, 4],
              borderWidth: 2,
              pointRadius: 2.5,
              tension: 0.2,
              yAxisID: "yWait"
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { labels: { color: textColor, font: { size: 10 } } },
            tooltip: {
              callbacks: {
                footer: (items) => {
                  const idx = items[0].dataIndex;
                  const item = sampled[idx];
                  return `λ=${item.lambda}/hr | Utilization: ${(item.utilization * 100).toFixed(1)}% | P(Wait): ${(item.pWait * 100).toFixed(1)}%`;
                }
              }
            }
          },
          scales: {
            x: { ticks: { color: textColor, maxTicksLimit: 12 }, grid: { color: gridColor } },
            yServers: {
              type: "linear",
              position: "left",
              beginAtZero: true,
              title: { display: true, text: "Recommended Servers (c)", color: textColor },
              ticks: { color: textColor },
              grid: { color: gridColor }
            },
            yWait: {
              type: "linear",
              position: "right",
              beginAtZero: true,
              max: 2.0,
              title: { display: true, text: "Wait W_q (min)", color: "#10b981" },
              ticks: { color: "#10b981" },
              grid: { drawOnChartArea: false }
            }
          }
        }
      });
    }

    // ------------------------------------------------------------------------
    // GRAPH 4: Scheduled Tutors on Duty vs. Minimum Tutors for W_q < 3m
    // ------------------------------------------------------------------------
    const ctx4 = document.getElementById("chart-overlooked")?.getContext("2d");
    if (ctx4) {
      if (chartOverlooked) chartOverlooked.destroy();
      chartOverlooked = new Chart(ctx4, {
        type: "bar",
        data: {
          labels: chartLabels,
          datasets: [
            {
              label: "Scheduled Tutors on Duty (c_t)",
              data: seriesTutorsActive,
              backgroundColor: "rgba(16, 185, 129, 0.65)",
              borderColor: "#10b981",
              borderWidth: 1.5,
              order: 2
            },
            {
              type: "line",
              label: "Min Tutors for W_q < 3.0 min (Workbook Col F)",
              data: seriesTutorsMin,
              borderColor: "#8b5cf6",
              borderWidth: 2.5,
              pointRadius: 4,
              pointBackgroundColor: "#8b5cf6",
              tension: 0.15,
              order: 1
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
                footer: (items) => {
                  const idx = items[0].dataIndex;
                  return `Scheduled: ${seriesTutorsActive[idx]} tutors | Min Required: ${seriesTutorsMin[idx]} tutors`;
                }
              }
            }
          },
          scales: {
            x: { ticks: { color: textColor }, grid: { color: gridColor } },
            y: {
              beginAtZero: true,
              title: { display: true, text: "Tutors Headcount on Duty", color: textColor },
              ticks: { color: textColor, stepSize: 1 },
              grid: { color: gridColor }
            }
          }
        }
      });
    }
  }

  // ==========================================================================
  // TAB 2: SHIFT TEMPLATES MATRIX & 36-HOUR ERLANG-C TABLE
  // ==========================================================================
  function renderScheduleTab() {
    const selectedDay = document.getElementById("select-schedule-day")?.value || "ALL";
    const activeRows = templateEval.evaluatedRows;
    const baseRows = baselineEval.evaluatedRows;
    const filteredRows = selectedDay === "ALL" ? activeRows : activeRows.filter(r => r.day === selectedDay);

    // 1. Render Shift Pattern Template Matrix
    const tplMatrixWrap = document.getElementById("template-matrix-wrap");
    if (tplMatrixWrap) {
      const templates = appData.shiftTemplates || [];
      const tplRowsHtml = templates.map(tpl => {
        const assigned = Number(appData.templateAssignments[tpl.id]) || 0;
        const isGA = tpl.role === "GA";
        return `
          <tr>
            <td><strong style="color:var(--text-primary);">${tpl.id}</strong></td>
            <td><strong>${tpl.description}</strong></td>
            <td><span class="badge ${isGA ? 'badge-blue' : 'badge-emerald'}">${tpl.role}</span></td>
            <td style="font-family:'JetBrains Mono',monospace;">${tpl.weeklyHours} hrs</td>
            <td style="font-family:'JetBrains Mono',monospace;font-weight:700;color:var(--accent-primary);font-size:0.95rem;">${assigned}</td>
            <td style="font-size:0.78rem;color:var(--text-secondary);">
              ${tpl.weeklyHours === 20 ? (tpl.id === 'GA-T5' ? 'Mon & Wed 8:00 AM – 6:00 PM (10h × 2 days)' : 'Mon–Thu open schedule coverage') : 'Midday peak support window'}
            </td>
          </tr>
        `;
      }).join("");

      tplMatrixWrap.innerHTML = `
        <table class="data-table">
          <thead>
            <tr>
              <th>Template ID</th>
              <th>Shift Pattern Description</th>
              <th>Staffing Tier</th>
              <th>Weekly Hours</th>
              <th>Tutors Assigned</th>
              <th>Coverage Window</th>
            </tr>
          </thead>
          <tbody>${tplRowsHtml}</tbody>
        </table>
      `;
    }

    // 2. Render 36-Hour Erlang-C Schedule Performance Table
    const schedTableWrap = document.getElementById("schedule-comparison-table-wrap");
    if (schedTableWrap) {
      const rowsHtml = filteredRows.map(r => {
        const base = baseRows.find(b => b.day === r.day && b.hour === r.hour) || {};
        const isUnstable = r.isUnstable;
        const exceedsTarget = r.exceedsTarget;

        let statusBadge = `<span class="badge badge-emerald">✅ Optimal (${r.wqMinutes}m)</span>`;
        if (isUnstable) {
          statusBadge = `<span class="badge badge-rose">⚠️ Saturated (ρ ≥ 1)</span>`;
        } else if (exceedsTarget) {
          statusBadge = `<span class="badge badge-amber">⚠️ Exceeds 3m (${r.wqMinutes}m)</span>`;
        }

        return `
          <tr>
            <td>
              <strong>${r.day}</strong>
              <div style="font-size:0.75rem;color:var(--text-secondary);">${r.hour}:00 &ndash; ${r.hour + 1}:00</div>
            </td>
            <td style="font-family:'JetBrains Mono',monospace;">${r.avgArrivals}</td>
            <td style="font-family:'JetBrains Mono',monospace;">${r.avgOccupancy}</td>
            <td style="font-family:'JetBrains Mono',monospace;font-weight:700;">${r.handRaiseLambda}</td>
            <td style="font-family:'JetBrains Mono',monospace;font-weight:700;color:var(--accent-purple);">${r.minTutorsCalculated}</td>
            <td style="font-family:'JetBrains Mono',monospace;color:var(--accent-rose);">${base.scheduledTutors || 1} (Wq: ${base.wqMinutes || 999}m)</td>
            <td style="font-family:'JetBrains Mono',monospace;font-weight:700;color:var(--accent-emerald);font-size:0.95rem;">${r.scheduledTutors}</td>
            <td style="font-family:'JetBrains Mono',monospace;">${(r.utilizationRho * 100).toFixed(1)}%</td>
            <td style="font-family:'JetBrains Mono',monospace;">${(r.pWait * 100).toFixed(1)}%</td>
            <td style="font-family:'JetBrains Mono',monospace;font-weight:700;color:${r.wqMinutes <= 3 ? 'var(--accent-emerald)' : 'var(--accent-rose)'};">
              ${r.wqMinutes} min
            </td>
            <td>${statusBadge}</td>
          </tr>
        `;
      }).join("");

      schedTableWrap.innerHTML = `
        <table class="data-table">
          <thead>
            <tr>
              <th>Day &amp; Hour</th>
              <th>Avg Arrivals</th>
              <th>Occupancy (N)</th>
              <th>Hand-Raises (&lambda; = 4N)</th>
              <th>Min Tutors (Wq&lt;3m)</th>
              <th>Baseline Staffing (c)</th>
              <th>Scheduled Tutors (c)</th>
              <th>Utilization (&rho;)</th>
              <th>P(Wait)</th>
              <th>Expected Wait (Wq)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      `;
    }

    // 3. Render Staff Roster Utilization Table (9 GAs + 4 SIs)
    const rosterWrap = document.getElementById("roster-utilization-table-wrap");
    if (rosterWrap) {
      const tutorSummary = optimizedEval.tutorSummary || [];
      const rosterRowsHtml = tutorSummary.map(t => {
        const isGA = t.role === "GA";
        return `
          <tr>
            <td><strong>${t.name}</strong></td>
            <td><span class="badge ${isGA ? 'badge-blue' : 'badge-emerald'}">${t.tierLabel}</span></td>
            <td style="font-family:'JetBrains Mono',monospace;">${t.contractHours} hrs/wk</td>
            <td style="font-family:'JetBrains Mono',monospace;font-weight:700;color:var(--accent-emerald);">
              ${t.assignedHours} hrs (M:${t.byDay.Monday} T:${t.byDay.Tuesday} W:${t.byDay.Wednesday} Th:${t.byDay.Thursday})
            </td>
            <td style="font-family:'JetBrains Mono',monospace;">$${t.weeklyPay.toFixed(2)}</td>
            <td style="font-size:0.75rem;color:var(--text-secondary);">${t.notes || 'Assigned via template'}</td>
          </tr>
        `;
      }).join("");

      rosterWrap.innerHTML = `
        <table class="data-table">
          <thead>
            <tr>
              <th>Staff Member</th>
              <th>Staffing Tier</th>
              <th>Contract Hours</th>
              <th>Scheduled Hours (Mon&ndash;Thu)</th>
              <th>Weekly Labor Pay</th>
              <th>Assigned Template</th>
            </tr>
          </thead>
          <tbody>${rosterRowsHtml}</tbody>
        </table>
      `;
    }
  }

  // ==========================================================================
  // TAB 3: LIVE ERLANG-C CALCULATOR & MATHEMATICAL FORMULATION
  // ==========================================================================
  function renderModelsTab() {
    // 1. Live Interactive Erlang-C Queue Calculator
    const sliderLam = document.getElementById("calc-slider-lam");
    const sliderMu = document.getElementById("calc-slider-mu");
    const sliderC = document.getElementById("calc-slider-c");
    const sliderBeta = document.getElementById("calc-slider-beta");

    const valLam = document.getElementById("calc-val-lam");
    const valMu = document.getElementById("calc-val-mu");
    const valC = document.getElementById("calc-val-c");
    const valBeta = document.getElementById("calc-val-beta");
    const outGrid = document.getElementById("calc-outputs-grid");

    function updateCalculator() {
      if (!sliderLam || !sliderMu || !sliderC || !sliderBeta || !outGrid) return;
      const lam = Number(sliderLam.value) || 32.0;
      const mu = Number(sliderMu.value) || 20.0;
      const c = Number(sliderC.value) || 3;
      const beta = Number(sliderBeta.value) || 1.0;

      valLam.textContent = lam.toFixed(1);
      valMu.textContent = mu.toFixed(1);
      valC.textContent = c;
      valBeta.textContent = beta.toFixed(2);

      const a = lam / mu;
      const rho = c > 0 ? (lam / (c * mu)) : 999.0;
      const pWait = engine.erlangC_PWait(c, lam, mu);
      const wq = engine.calculateWq(c, lam, mu);
      const recC = engine.squareRootStaffing(lam, mu, beta);
      const minTargetC = engine.calculateMinTutors(lam, mu, 3.0);

      const isStable = rho < 1.0;
      const meetsTarget = isStable && wq < 3.0;

      outGrid.innerHTML = `
        <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.75rem;">
          <div style="font-size:0.72rem;color:var(--text-secondary);font-weight:700;">OFFERED LOAD (a = &lambda; / &mu;)</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:1.25rem;font-weight:800;color:var(--text-primary);margin-top:0.2rem;">
            ${a.toFixed(2)} Erlangs
          </div>
          <div style="font-size:0.72rem;color:var(--text-muted);margin-top:0.15rem;">Total tutor-hours demanded / hr</div>
        </div>

        <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.75rem;">
          <div style="font-size:0.72rem;color:var(--text-secondary);font-weight:700;">TUTOR UTILIZATION (&rho;)</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:1.25rem;font-weight:800;color:${isStable ? 'var(--accent-emerald)' : 'var(--accent-rose)'};margin-top:0.2rem;">
            ${(rho * 100).toFixed(1)}%
          </div>
          <div style="font-size:0.72rem;color:var(--text-muted);margin-top:0.15rem;">${isStable ? 'Queue Stable (&rho; &lt; 100%)' : 'Queue Overloaded (&rho; &ge; 100%)'}</div>
        </div>

        <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.75rem;">
          <div style="font-size:0.72rem;color:var(--text-secondary);font-weight:700;">PROBABILITY OF WAITING P(Wait)</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:1.25rem;font-weight:800;color:var(--accent-primary);margin-top:0.2rem;">
            ${(pWait * 100).toFixed(1)}%
          </div>
          <div style="font-size:0.72rem;color:var(--text-muted);margin-top:0.15rem;">Erlang-C formula C(c, a)</div>
        </div>

        <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.75rem;">
          <div style="font-size:0.72rem;color:var(--text-secondary);font-weight:700;">EXPECTED WAIT TIME (W_q)</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:1.25rem;font-weight:800;color:${meetsTarget ? 'var(--accent-emerald)' : 'var(--accent-rose)'};margin-top:0.2rem;">
            ${isStable ? wq.toFixed(2) + ' min' : '999 min (Overflow)'}
          </div>
          <div style="font-size:0.72rem;color:var(--text-muted);margin-top:0.15rem;">Target: &lt; 3.0 min</div>
        </div>

        <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.75rem;">
          <div style="font-size:0.72rem;color:var(--text-secondary);font-weight:700;">SQUARE-ROOT LAW (c_sqrt)</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:1.25rem;font-weight:800;color:var(--accent-amber);margin-top:0.2rem;">
            ${recC} Tutors
          </div>
          <div style="font-size:0.72rem;color:var(--text-muted);margin-top:0.15rem;">c = ceil(a + &beta;&radic;a)</div>
        </div>

        <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:8px;padding:0.75rem;">
          <div style="font-size:0.72rem;color:var(--text-secondary);font-weight:700;">MIN TUTORS FOR W_q &lt; 3m</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:1.25rem;font-weight:800;color:var(--accent-purple);margin-top:0.2rem;">
            ${minTargetC} Tutors
          </div>
          <div style="font-size:0.72rem;color:var(--text-muted);margin-top:0.15rem;">Workbook Column F formula</div>
        </div>
      `;
    }

    if (sliderLam && !sliderLam._bound) {
      sliderLam._bound = true;
      sliderLam.addEventListener("input", updateCalculator);
      sliderMu.addEventListener("input", updateCalculator);
      sliderC.addEventListener("input", updateCalculator);
      sliderBeta.addEventListener("input", updateCalculator);
    }
    updateCalculator();

    // 2. Render Lecturer Pool Bar
    const poolBarEl = document.getElementById("lecturer-pool-bar");
    if (poolBarEl) {
      const profChips = (appData.lecturers || []).map(prof => `
        <span class="tutor-chip active" style="display:inline-flex;align-items:center;gap:0.35rem;padding:0.22rem 0.55rem;font-size:0.76rem;">
          <span>👨‍🏫 ${prof}</span>
          <button type="button" class="btn-remove-pool-prof" data-prof="${prof.replace(/"/g, '&quot;')}" title="Remove ${prof}" style="background:none;border:none;color:var(--accent-rose);cursor:pointer;font-weight:800;font-size:0.78rem;padding:0 0.1rem;line-height:1;">✕</button>
        </span>
      `).join("");

      poolBarEl.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.6rem;padding:0.65rem 0.85rem;background:var(--bg-elevated);border:1px solid var(--border-subtle);border-radius:8px;">
          <div style="display:flex;align-items:center;flex-wrap:wrap;gap:0.4rem;">
            <span style="font-size:0.76rem;font-weight:700;color:var(--text-secondary);margin-right:0.25rem;">Department Lecturers Pool:</span>
            ${profChips || '<span style="font-size:0.75rem;color:var(--text-muted);">No lecturers in pool yet</span>'}
          </div>
          <div style="display:flex;align-items:center;gap:0.4rem;">
            <input type="text" id="input-new-pool-prof" class="text-input" placeholder="e.g. Dr. Williams" style="width:155px;padding:0.28rem 0.55rem;font-size:0.78rem;" />
            <button type="button" class="btn btn-emerald" id="btn-add-pool-prof" style="padding:0.28rem 0.65rem;font-size:0.76rem;">+ Add Lecturer</button>
          </div>
        </div>
      `;

      const addPoolBtn = document.getElementById("btn-add-pool-prof");
      const addPoolInp = document.getElementById("input-new-pool-prof");
      const handleAddPoolProf = () => {
        const name = (addPoolInp.value || "").trim();
        if (!name) return;
        if (!appData.lecturers.includes(name)) {
          appData.lecturers.push(name);
          saveState(`Added ${name} to Lecturers dropdown list`);
          renderModelsTab();
        } else {
          showToast(`${name} is already in the Lecturer list`);
        }
      };
      if (addPoolBtn) addPoolBtn.addEventListener("click", handleAddPoolProf);
      if (addPoolInp) addPoolInp.addEventListener("keydown", e => {
        if (e.key === "Enter") handleAddPoolProf();
      });

      poolBarEl.querySelectorAll(".btn-remove-pool-prof").forEach(btn => {
        btn.addEventListener("click", e => {
          const profName = e.currentTarget.getAttribute("data-prof");
          appData.lecturers = appData.lecturers.filter(p => p !== profName);
          appData.classSchedule.forEach(c => {
            if (Array.isArray(c.lecturers)) {
              c.lecturers = c.lecturers.filter(p => p !== profName);
            }
          });
          saveState(`Removed ${profName} from Lecturers list`);
          renderModelsTab();
        });
      });
    }

    // 3. Render Class Schedule Summary Table
    const subMap = {};
    (appData.subjects || []).forEach(s => { subMap[s.id] = s; });

    const classTableWrap = document.getElementById("class-schedule-summary-wrap");
    if (classTableWrap) {
      const classRows = appData.classSchedule.map((c, idx) => {
        const s = subMap[c.subject] || appData.subjects[0];
        const assignedList = Array.isArray(c.lecturers) ? c.lecturers : [];
        const assignedBadges = assignedList.map(prof => `
          <span class="badge badge-blue" style="display:inline-flex;align-items:center;gap:0.28rem;margin:0.12rem 0.2rem 0.12rem 0;padding:0.2rem 0.48rem;font-size:0.73rem;">
            <span>${prof}</span>
            <button type="button" class="btn-remove-class-prof" data-idx="${idx}" data-prof="${prof.replace(/"/g, '&quot;')}" title="Remove ${prof}" style="background:none;border:none;color:inherit;cursor:pointer;font-weight:800;font-size:0.75rem;padding:0;line-height:1;">✕</button>
          </span>
        `).join("");

        const unassignedProfs = (appData.lecturers || []).filter(p => !assignedList.includes(p));
        const profDropdownOptions = unassignedProfs.map(p => `<option value="${p.replace(/"/g, '&quot;')}">${p}</option>`).join("");

        return `
          <tr>
            <td>
              <input type="text" class="text-input cs-field" data-idx="${idx}" data-field="code" value="${c.code}" style="width:105px;font-weight:700;" />
              <input type="text" class="text-input cs-field" data-idx="${idx}" data-field="title" value="${c.title}" style="width:100%;font-size:0.75rem;margin-top:0.25rem;" />
            </td>
            <td>
              <div style="min-height:26px;margin-bottom:0.3rem;">
                ${assignedBadges || '<span style="font-size:0.74rem;color:var(--text-muted);font-style:italic;">No lecturer assigned</span>'}
              </div>
              <div style="display:flex;align-items:center;gap:0.3rem;">
                <select class="text-input select-add-class-prof" data-idx="${idx}" style="padding:0.2rem 0.4rem;font-size:0.74rem;max-width:140px;">
                  <option value="">+ Assign Lecturer...</option>
                  ${profDropdownOptions}
                </select>
              </div>
            </td>
            <td style="font-family:'JetBrains Mono',monospace;">${c.classTime}</td>
            <td style="font-family:'JetBrains Mono',monospace;font-weight:700;color:var(--accent-primary);">Lets out &rarr; ${c.releaseHour}:00</td>
            <td style="font-family:'JetBrains Mono',monospace;">${c.enrolled} enrolled</td>
            <td style="font-family:'JetBrains Mono',monospace;font-weight:700;color:var(--accent-rose);">+${c.walkIns || 0} hand-raises</td>
            <td>
              <button type="button" class="btn btn-rose btn-remove-class-row" data-idx="${idx}" style="padding:0.25rem 0.55rem;font-size:0.74rem;">✕</button>
            </td>
          </tr>
        `;
      }).join("");

      classTableWrap.innerHTML = `
        <table class="data-table">
          <thead>
            <tr>
              <th>Course &amp; Title</th>
              <th>Assigned Lecturer(s)</th>
              <th>Meeting Time</th>
              <th>Release Hour</th>
              <th>Enrolled</th>
              <th>Expected Lab Arrivals</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>${classRows}</tbody>
        </table>
      `;

      // Bind class lecturer assignment dropdowns
      classTableWrap.querySelectorAll(".select-add-class-prof").forEach(sel => {
        sel.addEventListener("change", e => {
          const idx = parseInt(e.target.getAttribute("data-idx"), 10);
          const prof = e.target.value;
          if (!prof || !appData.classSchedule[idx]) return;
          if (!Array.isArray(appData.classSchedule[idx].lecturers)) {
            appData.classSchedule[idx].lecturers = [];
          }
          if (!appData.classSchedule[idx].lecturers.includes(prof)) {
            appData.classSchedule[idx].lecturers.push(prof);
            saveState(`Assigned ${prof} to ${appData.classSchedule[idx].code}`);
            renderModelsTab();
          }
        });
      });

      // Bind remove class prof buttons
      classTableWrap.querySelectorAll(".btn-remove-class-prof").forEach(btn => {
        btn.addEventListener("click", e => {
          const idx = parseInt(e.currentTarget.getAttribute("data-idx"), 10);
          const prof = e.currentTarget.getAttribute("data-prof");
          if (appData.classSchedule[idx] && Array.isArray(appData.classSchedule[idx].lecturers)) {
            appData.classSchedule[idx].lecturers = appData.classSchedule[idx].lecturers.filter(p => p !== prof);
            saveState(`Removed ${prof} from ${appData.classSchedule[idx].code}`);
            renderModelsTab();
          }
        });
      });

      // Bind delete class section button
      classTableWrap.querySelectorAll(".btn-remove-class-row").forEach(btn => {
        btn.addEventListener("click", e => {
          const idx = parseInt(e.currentTarget.getAttribute("data-idx"), 10);
          const removed = appData.classSchedule.splice(idx, 1)[0];
          saveState(`Removed course section ${removed.code}`);
          renderModelsTab();
        });
      });
    }
  }

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
  // TAB 5: QR CODE CHECK-IN / CHECK-OUT KIOSK, 2X XP BAR & STUDENT BIO MODAL
  // ==========================================================================
  let selectedCheckInHour = "09:00"; // Default to a 2x XP Quiet Hour or user-clicked hour
  let editingBioAvatarId = "pixel-wizard";
  let editingBioCustomDataUrl = null;

  function isQuietBonusHour(hourId, dayName = "Monday") {
    const dayObj = (appData.hourlyArrivals && appData.hourlyArrivals[dayName]) || {};
    const slot = dayObj[hourId];
    if (!slot) return hourId === "09:00" || hourId === "11:00" || hourId === "16:00";
    const total = (Number(slot.alg) || 0) + (Number(slot.trig) || 0) + (Number(slot.pre) || 0) + (Number(slot.calc) || 0) + (Number(slot.stats) || 0);
    return total <= 10;
  }

  function getMeasuredAvgSessionMinutes() {
    const completed = (appData.attendanceLog || []).filter(r => r.status === "completed" && Number(r.durationMinutes) > 0);
    if (completed.length === 0) return appData.parameters.avgSessionMinutes || 20;
    const sum = completed.reduce((acc, r) => acc + Number(r.durationMinutes), 0);
    return Math.round(sum / completed.length);
  }

  function getStudentLevelInfo(xp) {
    const val = Number(xp) || 0;
    if (val >= 800) return { level: 4, title: "👑 Math Lab Legend", nextXp: 1200, pct: Math.min(100, Math.round(((val - 800) / 400) * 100)) };
    if (val >= 450) return { level: 3, title: "⚡ Theorem Master", nextXp: 800, pct: Math.round(((val - 450) / 350) * 100) };
    if (val >= 200) return { level: 2, title: "📐 Problem Solver", nextXp: 450, pct: Math.round(((val - 200) / 250) * 100) };
    return { level: 1, title: "🌱 Lab Rookie", nextXp: 200, pct: Math.round((val / 200) * 100) };
  }

  function findOrCreateStudentProfile(rawName, saveIfNew = false) {
    const clean = (rawName || "").replace(/\s*\(#\d+\)\s*$/, "").trim();
    if (!clean) return null;
    if (!Array.isArray(appData.studentProfiles)) appData.studentProfiles = [];
    const existing = appData.studentProfiles.find(p => p.name.toLowerCase() === clean.toLowerCase());
    if (existing) return existing;

    const parts = clean.split(/\s+/);
    const firstName = parts[0] || "Student";
    const lastName = parts.slice(1).join(" ") || "";
    const avatarList = window.PIXEL_AVATARS_16BIT || [];
    const pickAvatar = avatarList[appData.studentProfiles.length % Math.max(1, avatarList.length)];

    const firstClass = (appData.classSchedule && appData.classSchedule[0]) || {
      code: "MATH 112-01",
      subject: "trig",
      lecturers: ["Prof. Ross"]
    };
    const newProfile = {
      name: clean,
      firstName: firstName,
      lastName: lastName,
      major: "Mathematics / STEM",
      hobbies: "Study groups, retro arcade games, campus intramurals",
      avatarId: pickAvatar ? pickAvatar.id : "pixel-wizard",
      courseCode: firstClass.code || "MATH 112-01",
      subject: firstClass.subject || "trig",
      lecturer: Array.isArray(firstClass.lecturers) && firstClass.lecturers.length > 0 ? firstClass.lecturers.join(", ") : "Prof. Ross",
      xp: 100,
      streak: 1,
      visits: 1,
      totalMinutes: 20,
      badges: ["🌱 New Explorer"]
    };
    if (saveIfNew) {
      appData.studentProfiles.unshift(newProfile);
    }
    return newProfile;
  }

  function permanentlyDeleteStudentProfile(idxOrName, skipBroadcast) {
    let idx = typeof idxOrName === "number" ? idxOrName : -1;
    if (typeof idxOrName === "string") {
      const clean = idxOrName.trim().toLowerCase();
      idx = (appData.studentProfiles || []).findIndex(p => p.name.toLowerCase() === clean);
    }
    if (idx < 0 || idx >= (appData.studentProfiles || []).length) return;
    const removed = appData.studentProfiles.splice(idx, 1)[0];
    if (!removed) return;
    const targetLower = removed.name.toLowerCase();
    // Also remove from attendanceLog so they are completely & permanently erased
    appData.attendanceLog = (appData.attendanceLog || []).filter(
      r => (r.studentName || "").toLowerCase() !== targetLower
    );
    const nameInp = document.getElementById("checkin-student-name");
    if (nameInp && nameInp.value.trim().toLowerCase() === targetLower) {
      nameInp.value = "";
    }
    const dialog = document.getElementById("student-bio-dialog");
    if (dialog && dialog.open) {
      dialog.close();
    }
    saveState(`🗑️ Permanently deleted student profile: ${removed.name}`);
    renderAll(false);
    if (!skipBroadcast) {
      broadcastCloudSync("delete_profile", { name: removed.name });
    }
  }

  function openStudentBioModal(nameOrIdx) {
    const dialog = document.getElementById("student-bio-dialog");
    if (!dialog) return;
    let idx = typeof nameOrIdx === "number" ? nameOrIdx : -1;
    if (typeof nameOrIdx === "string") {
      const clean = nameOrIdx.trim().toLowerCase();
      idx = (appData.studentProfiles || []).findIndex(p => p.name.toLowerCase() === clean);
      if (idx === -1 && clean) {
        findOrCreateStudentProfile(nameOrIdx, true);
        idx = 0;
      }
    }
    const prof = appData.studentProfiles[idx];
    if (!prof) return;

    document.getElementById("bio-profile-index").value = String(idx);
    document.getElementById("bio-first-name").value = prof.firstName || prof.name.split(" ")[0] || "";
    document.getElementById("bio-last-name").value = prof.lastName !== undefined ? prof.lastName : prof.name.split(" ").slice(1).join(" ");
    document.getElementById("bio-major").value = prof.major || "";
    document.getElementById("bio-hobbies").value = prof.hobbies || "";

    editingBioAvatarId = prof.avatarId || "pixel-wizard";
    editingBioCustomDataUrl = prof.customAvatarDataUrl || null;

    const lvl = getStudentLevelInfo(prof.xp);
    document.getElementById("bio-modal-level-badge").textContent = `${lvl.title} • Level ${lvl.level} (${prof.xp} XP)`;
    document.getElementById("bio-dialog-title").textContent = prof.name;
    document.getElementById("bio-modal-subtitle").innerHTML = `
      <strong>Major:</strong> ${prof.major || "Undeclared"} &bull; <strong>Course:</strong> ${prof.courseCode} (${prof.lecturer}) &bull; <span style="color:var(--accent-amber);font-weight:700;">🔥 ${prof.streak}-Visit Streak</span>
    `;

    // Populate course select in modal
    const courseSel = document.getElementById("bio-course-select");
    if (courseSel) {
      courseSel.innerHTML = (appData.classSchedule || []).map(c => {
        const profName = Array.isArray(c.lecturers) && c.lecturers.length > 0 ? c.lecturers.join(", ") : "Staff";
        return `<option value="${c.code}" ${c.code === prof.courseCode ? "selected" : ""}>${c.code} — ${c.title} (${profName})</option>`;
      }).join("");
    }

    function refreshModalAvatarUI() {
      const previewWrap = document.getElementById("bio-modal-avatar-preview");
      if (previewWrap) {
        previewWrap.innerHTML = window.renderStudentAvatar({
          name: prof.name,
          avatarId: editingBioAvatarId,
          customAvatarDataUrl: editingBioCustomDataUrl
        }, 72);
      }
      const grid = document.getElementById("bio-avatar-picker-grid");
      if (grid) {
        grid.innerHTML = (window.PIXEL_AVATARS_16BIT || []).map(av => {
          const isSel = !editingBioCustomDataUrl && av.id === editingBioAvatarId;
          return `
            <button type="button" class="avatar-option-btn ${isSel ? 'selected' : ''}" data-avid="${av.id}">
              ${window.renderStudentAvatar(av.id, 42)}
              <span>${av.label}</span>
            </button>
          `;
        }).join("");

        grid.querySelectorAll(".avatar-option-btn").forEach(btn => {
          btn.addEventListener("click", e => {
            editingBioAvatarId = e.currentTarget.getAttribute("data-avid");
            editingBioCustomDataUrl = null;
            refreshModalAvatarUI();
          });
        });
      }
    }

    refreshModalAvatarUI();
    dialog._refreshAvatarUI = refreshModalAvatarUI;
    dialog.showModal();
  }

  function renderCheckinProfilePreview(nameVal) {
    const previewEl = document.getElementById("checkin-profile-preview-card");
    if (!previewEl) return;
    const clean = (nameVal || "").trim();
    const subMap = {};
    appData.subjects.forEach(s => { subMap[s.id] = s; });
    const isBonusHr = isQuietBonusHour(selectedCheckInHour);
    const xpAward = isBonusHr ? 100 : 50;

    if (!clean) {
      previewEl.innerHTML = `
        <div style="font-size:0.78rem;color:var(--text-secondary);text-align:center;padding:0.2rem 0;">
          👆 Type a student's name (or tap a student chip above) — their <strong>16-Bit Avatar, Bio, Course, Lecturer &amp; Streak</strong> load automatically!
        </div>
      `;
      return;
    }

    const prof = findOrCreateStudentProfile(clean, false);
    const isExisting = (appData.studentProfiles || []).some(p => p.name.toLowerCase() === clean.toLowerCase());
    const lvl = getStudentLevelInfo(prof.xp);
    const subObj = subMap[prof.subject] || appData.subjects[0];
    const badgesHtml = (prof.badges || []).map(b => `<span class="badge badge-amber" style="font-size:0.65rem;margin-right:0.25rem;">${b}</span>`).join("");

    previewEl.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:0.65rem;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:0.65rem;">
          ${window.renderStudentAvatar(prof, 46)}
          <div>
            <div style="font-weight:800;font-size:0.92rem;color:var(--text-primary);display:flex;align-items:center;gap:0.35rem;flex-wrap:wrap;">
              <button type="button" class="student-bio-trigger btn-open-bio-by-name" data-name="${prof.name.replace(/"/g, '&quot;')}" title="Click to open Student Bio Pop-Up">
                <span>${prof.name}</span>
              </button>
              ${isExisting
                ? '<span class="badge badge-emerald" style="font-size:0.62rem;">🔍 Click Name for Bio</span>'
                : '<span class="badge badge-blue" style="font-size:0.62rem;">+ Auto-Creates Profile</span>'}
            </div>
            <div style="font-size:0.74rem;color:var(--text-secondary);margin-top:0.12rem;">
              🎓 <strong>${prof.major}</strong> &bull; <em>Hobbies:</em> ${prof.hobbies}
            </div>
            <div style="font-size:0.74rem;color:var(--text-secondary);margin-top:0.1rem;">
              📚 <strong>${prof.courseCode}</strong> (👨‍🏫 ${prof.lecturer}) &bull; <span class="subject-pill" style="background:${subObj.color}">${subObj.short}</span>
            </div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:800;font-size:0.78rem;color:var(--accent-primary);">${lvl.title} (Lvl ${lvl.level})</div>
          <div style="font-size:0.73rem;color:var(--accent-amber);font-weight:700;">🔥 ${prof.streak}-Visit Streak &bull; ${prof.xp} XP</div>
          <div style="font-size:0.7rem;color:var(--accent-emerald);font-weight:800;margin-top:0.1rem;">
            Next Scan: +${xpAward} XP ${isBonusHr ? "(⚡ 2x Quiet Bonus!)" : ""}
          </div>
        </div>
      </div>
      <div style="width:100%;height:7px;background:rgba(148,163,184,0.2);border-radius:99px;overflow:hidden;margin-top:0.4rem;">
        <div style="width:${lvl.pct}%;height:100%;background:linear-gradient(90deg,#10b981,#3b82f6);border-radius:99px;"></div>
      </div>
      <div style="margin-top:0.35rem;">${badgesHtml}</div>
    `;

    previewEl.querySelectorAll(".btn-open-bio-by-name").forEach(btn => {
      btn.addEventListener("click", e => {
        openStudentBioModal(e.currentTarget.getAttribute("data-name"));
      });
    });
  }

  function renderQrCodeToElement(containerId, url, altText) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const safeUrl = (url || "https://yusuf-osuntuyi.github.io/math319-math-lab-dashboard/checkin.html").trim();
    const qrGenerator = (typeof qrcode === "function") ? qrcode : (typeof window !== "undefined" && typeof window.qrcode === "function" ? window.qrcode : (typeof globalThis !== "undefined" && typeof globalThis.qrcode === "function" ? globalThis.qrcode : null));
    if (qrGenerator) {
      try {
        const qr = qrGenerator(0, "M");
        qr.addData(safeUrl);
        qr.make();
        container.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
        const svgEl = container.querySelector("svg");
        if (svgEl) {
          svgEl.setAttribute("width", "168");
          svgEl.setAttribute("height", "168");
          svgEl.setAttribute("style", "max-width:100%;height:auto;display:block;border-radius:6px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.06));background:#fff;padding:4px;");
        }
        return;
      } catch (err) {
        console.warn("SVG QR generator warning:", err);
      }
    }
    container.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=168x168&data=${encodeURIComponent(safeUrl)}" alt="${altText}" width="168" height="168" style="max-width:100%;height:auto;display:block;border-radius:6px;background:#fff;padding:4px;" />`;
  }

  function renderQrTab() {
    const log = appData.attendanceLog || [];
    const activeList = log.filter(r => r.status === "active");
    const completedList = log.filter(r => r.status === "completed");
    const measuredMuMin = getMeasuredAvgSessionMinutes();
    const measuredRatePerHr = (60 / Math.max(1, measuredMuMin)).toFixed(2);

    const subMap = {};
    appData.subjects.forEach(s => { subMap[s.id] = s; });

    // Find top course/lecturer in log
    const courseCounts = {};
    log.forEach(r => {
      const key = `${r.courseCode} (${r.lecturer || "Staff"})`;
      courseCounts[key] = (courseCounts[key] || 0) + 1;
    });
    const topCourseEntry = Object.entries(courseCounts).sort((a, b) => b[1] - a[1])[0];
    const topCourseLabel = topCourseEntry ? topCourseEntry[0] : "MATH 112-01 (Prof. Ross)";
    const topCourseVisits = topCourseEntry ? topCourseEntry[1] : 0;

    // 1. Render Top 4 QR KPI Cards
    const kpiGrid = document.getElementById("qr-kpi-grid");
    if (kpiGrid) {
      kpiGrid.innerHTML = `
        <div class="kpi-card">
          <div class="kpi-label">Students Currently in Lab</div>
          <div class="kpi-main">
            <span class="kpi-value" style="color:var(--accent-emerald);">${activeList.length}</span>
            <span class="kpi-unit">checked in now</span>
          </div>
          <div class="kpi-compare">
            <span class="delta-good">${log.length} total QR scans</span> logged in tracker
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Measured Session Duration (1/&mu;)</div>
          <div class="kpi-main">
            <span class="kpi-value" style="color:var(--accent-primary);">${measuredMuMin}</span>
            <span class="kpi-unit">min avg</span>
          </div>
          <div class="kpi-compare">
            &mu; = <strong>${measuredRatePerHr} students/hr</strong> per tutor (Model slider: ${appData.parameters.avgSessionMinutes}m)
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Completed Check-Out Sessions</div>
          <div class="kpi-main">
            <span class="kpi-value">${completedList.length}</span>
            <span class="kpi-unit">verified visits</span>
          </div>
          <div class="kpi-compare">
            Captures exact <strong>Check-In &rarr; Check-Out</strong> dwell time
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Top Course &amp; Lecturer Traffic Driver</div>
          <div class="kpi-main">
            <span class="kpi-value" style="font-size:1.05rem;">${topCourseLabel}</span>
          </div>
          <div class="kpi-compare">
            <span class="delta-good">${topCourseVisits} check-ins</span> linked to lecture release
          </div>
        </div>
      `;
    }

    // 1B. Render Idea #1: 2x Double XP Quiet-Hour Busyness Forecast Bar
    const busynessGrid = document.getElementById("qr-busyness-bar-grid");
    const activeHrBadge = document.getElementById("qr-active-hour-bonus-badge");
    const submitBtn = document.getElementById("btn-submit-checkin");
    const isCurrentQuiet = isQuietBonusHour(selectedCheckInHour, "Monday");

    if (activeHrBadge) {
      const hrObj = appData.meta.operatingHours.find(h => h.id === selectedCheckInHour) || { label: selectedCheckInHour };
      activeHrBadge.className = isCurrentQuiet ? "badge badge-emerald" : "badge badge-blue";
      activeHrBadge.textContent = isCurrentQuiet
        ? `Active Check-In Hour: ${hrObj.label} (⚡ 2x Quiet Bonus: +100 XP!)`
        : `Active Check-In Hour: ${hrObj.label} (Standard: +50 XP)`;
    }
    if (submitBtn) {
      submitBtn.innerHTML = isCurrentQuiet
        ? `✅ Check In (+100 XP ⚡ 2x Quiet Bonus!)`
        : `✅ Check In (+50 XP)`;
    }

    if (busynessGrid) {
      busynessGrid.innerHTML = appData.meta.operatingHours.map(h => {
        const slot = (appData.hourlyArrivals.Monday && appData.hourlyArrivals.Monday[h.id]) || {};
        const totalArr = (Number(slot.alg) || 0) + (Number(slot.trig) || 0) + (Number(slot.pre) || 0) + (Number(slot.calc) || 0) + (Number(slot.stats) || 0);
        const isQuiet = totalArr <= 10;
        const isModerate = totalArr > 10 && totalArr <= 18;
        const statusDot = isQuiet ? "🟢 Quiet" : (isModerate ? "🟡 Busy" : "🔴 Rush");
        const xpTag = isQuiet
          ? `<span style="color:var(--accent-emerald);font-weight:800;font-size:0.71rem;">⚡ 2x (+100 XP)</span>`
          : `<span style="color:var(--text-secondary);font-size:0.69rem;">+50 XP</span>`;

        return `
          <button type="button" class="busyness-slot ${isQuiet ? 'quiet-bonus' : ''} ${h.id === selectedCheckInHour ? 'selected-hour' : ''}" data-hr="${h.id}">
            <div style="font-weight:800;font-size:0.78rem;">${h.label}</div>
            <div style="font-size:0.71rem;margin:0.15rem 0;">${statusDot} (${totalArr}/hr)</div>
            <div>${xpTag}</div>
          </button>
        `;
      }).join("");

      busynessGrid.querySelectorAll(".busyness-slot").forEach(btn => {
        btn.addEventListener("click", e => {
          selectedCheckInHour = e.currentTarget.getAttribute("data-hr");
          renderQrTab();
        });
      });
    }

    // 2. Render Both QR Code Graphics (QR #1 Check-In & QR #2 Check-Out) & URL inputs
    const defaultOrigin = (window.location.protocol.startsWith("http") && !window.location.hostname.includes("localhost") && !window.location.hostname.includes("127.0.0.1"))
      ? window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, "")
      : "https://yusuf-osuntuyi.github.io/math319-math-lab-dashboard";

    const defaultCheckIn = defaultOrigin + "/checkin.html?mode=in";
    const defaultCheckOut = defaultOrigin + "/checkin.html?mode=out";

    const checkInUrl = (appData.qrConfig && appData.qrConfig.checkInUrl) || defaultCheckIn;
    const checkOutUrl = (appData.qrConfig && appData.qrConfig.checkOutUrl) || defaultCheckOut;
    renderQrCodeToElement("qr-code-checkin-container", checkInUrl, "Math Lab Check-In QR Code");
    renderQrCodeToElement("qr-code-checkout-container", checkOutUrl, "Math Lab Check-Out QR Code");

    const inUrlInput = document.getElementById("qr-checkin-url-input");
    if (inUrlInput && document.activeElement !== inUrlInput) {
      inUrlInput.value = checkInUrl;
    }
    const outUrlInput = document.getElementById("qr-checkout-url-input");
    if (outUrlInput && document.activeElement !== outUrlInput) {
      outUrlInput.value = checkOutUrl;
    }
    const autoSyncChk = document.getElementById("checkin-autosync-toggle");
    if (autoSyncChk) {
      autoSyncChk.checked = appData.qrConfig ? appData.qrConfig.autoSyncArrivals !== false : true;
    }

    // 3. Populate Name-Only Datalist, 1-Tap Profile Chips & Live Profile Preview
    const dl = document.getElementById("student-profile-datalist");
    if (dl) {
      dl.innerHTML = (appData.studentProfiles || []).map(p => {
        const lvl = getStudentLevelInfo(p.xp);
        return `<option value="${p.name}">${p.courseCode} (${p.lecturer}) — ${lvl.title}</option>`;
      }).join("");
    }

    const nameInp = document.getElementById("checkin-student-name");
    const chipsWrap = document.getElementById("checkin-profile-quick-chips");
    if (chipsWrap) {
      if (!appData.studentProfiles || appData.studentProfiles.length === 0) {
        chipsWrap.innerHTML = `<span style="font-size:0.74rem;color:var(--text-muted);">No saved profiles yet — type any name above or click "+ Add Student Profile" below!</span>`;
      } else {
        chipsWrap.innerHTML = (appData.studentProfiles || []).map(p => `
          <button type="button" class="tutor-chip chip-pick-student-profile" data-name="${p.name.replace(/"/g, '&quot;')}" style="font-size:0.73rem;padding:0.2rem 0.52rem;display:inline-flex;align-items:center;gap:0.35rem;">
            ${window.renderStudentAvatar(p, 20)}
            <span>${p.name}</span>
          </button>
        `).join("");

        chipsWrap.querySelectorAll(".chip-pick-student-profile").forEach(btn => {
          btn.addEventListener("click", e => {
            const chosen = e.currentTarget.getAttribute("data-name");
            if (nameInp) {
              nameInp.value = chosen;
              nameInp.removeAttribute("aria-invalid");
            }
            renderCheckinProfilePreview(chosen);
          });
        });
      }
    }
    renderCheckinProfilePreview(nameInp ? nameInp.value : "");

    // 4. Render Active Students Table (1-Tap Check-Out with +100 XP)
    const activeWrap = document.getElementById("qr-active-students-wrap");
    if (activeWrap) {
      if (activeList.length === 0) {
        activeWrap.innerHTML = `
          <div style="padding:1.5rem;text-align:center;color:var(--text-secondary);font-size:0.84rem;">
            No students are currently checked in. Enter a name on the left (or click <strong>⚡ Demo +5 Trig Rush</strong>) to check students in!
          </div>
        `;
      } else {
        const activeRows = activeList.map(r => {
          const s = subMap[r.subject] || appData.subjects[0];
          const prof = findOrCreateStudentProfile(r.studentName, false);
          const lvl = getStudentLevelInfo(prof ? prof.xp : 150);
          return `
            <tr>
              <td>
                <div style="display:flex;align-items:center;gap:0.5rem;">
                  ${window.renderStudentAvatar(prof, 32)}
                  <div>
                    <button type="button" class="student-bio-trigger btn-open-bio-by-name" data-name="${r.studentName.replace(/"/g, '&quot;')}" title="Click to open Student Bio Pop-Up">
                      <span>${r.studentName}</span>
                    </button>
                    <span style="font-size:0.7rem;color:var(--accent-amber);font-weight:700;margin-left:0.25rem;">🔥 ${prof ? prof.streak : 1}</span><br/>
                    <span style="font-size:0.71rem;color:var(--text-secondary);">${lvl.title} &bull; ${r.day} (${r.hourBlock})</span>
                  </div>
                </div>
              </td>
              <td>
                <strong>${r.courseCode}</strong><br/>
                <span style="font-size:0.73rem;color:var(--text-secondary);">👨‍🏫 ${r.lecturer || "Staff"}</span>
              </td>
              <td>
                <span class="subject-pill" style="background:${s.color}">${s.short}</span>
              </td>
              <td>
                <div style="display:flex;align-items:center;gap:0.3rem;">
                  <input type="number" class="num-input qr-active-dur-input" data-id="${r.id}" min="1" max="180" value="${r.durationMinutes || 20}" style="width:54px;" title="Minutes spent in lab (1/mu)" />
                  <span style="font-size:0.72rem;color:var(--text-secondary);">min</span>
                </div>
              </td>
              <td>
                <button type="button" class="btn btn-primary btn-qr-checkout" data-id="${r.id}" style="padding:0.32rem 0.65rem;font-size:0.75rem;font-weight:700;">
                  👋 Check Out (+100 XP)
                </button>
              </td>
            </tr>
          `;
        }).join("");

        activeWrap.innerHTML = `
          <table class="data-table">
            <thead>
              <tr>
                <th>Student (Click Name for Bio)</th>
                <th>Auto-Tracked Course</th>
                <th>Subject</th>
                <th>Duration (1/&mu;)</th>
                <th>1-Tap Check-Out</th>
              </tr>
            </thead>
            <tbody>${activeRows}</tbody>
          </table>
        `;

        activeWrap.querySelectorAll(".btn-open-bio-by-name").forEach(btn => {
          btn.addEventListener("click", e => {
            openStudentBioModal(e.currentTarget.getAttribute("data-name"));
          });
        });

        activeWrap.querySelectorAll(".btn-qr-checkout").forEach(btn => {
          btn.addEventListener("click", e => {
            const id = e.currentTarget.getAttribute("data-id");
            const durInp = activeWrap.querySelector(`.qr-active-dur-input[data-id="${id}"]`);
            const mins = durInp ? Math.max(1, parseInt(durInp.value, 10) || 20) : 20;
            const rec = appData.attendanceLog.find(x => x.id === id);
            if (rec) {
              rec.status = "completed";
              rec.durationMinutes = mins;
              rec.checkOutTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              rec.xpEarned = (rec.xpEarned || 50) + 100;

              const prof = findOrCreateStudentProfile(rec.studentName, true);
              if (prof) {
                prof.xp = (Number(prof.xp) || 0) + 100;
                prof.totalMinutes = (Number(prof.totalMinutes) || 0) + mins;
                if (prof.totalMinutes >= 100 && !(prof.badges || []).includes("⏱️ 100+ Min Club")) {
                  prof.badges.push("⏱️ 100+ Min Club");
                }
              }
              saveState(`🎉 Checked out ${rec.studentName} (+100 XP • ${mins} min session)!`);
              renderQrTab();
              playChime("checkout");
              broadcastCloudSync("checkout", {
                recordId: rec.id,
                studentName: rec.studentName,
                checkOutTime: rec.checkOutTime,
                durationMinutes: mins,
                xpBonus: 100
              });
            }
          });
        });
      }
    }

    // 5. Render Gamified Student Profiles & Leaderboard Studio
    const profilesWrap = document.getElementById("qr-student-profiles-wrap");
    if (profilesWrap) {
      const sortedProfiles = (appData.studentProfiles || []).slice().sort((a, b) => (Number(b.xp) || 0) - (Number(a.xp) || 0));
      if (sortedProfiles.length === 0) {
        profilesWrap.innerHTML = `
          <div style="padding:1.5rem;text-align:center;color:var(--text-secondary);font-size:0.84rem;">
            All student profiles have been permanently deleted. Click <strong>+ Add Student Profile</strong> above to create a new student profile!
          </div>
        `;
      } else {
        const profRows = sortedProfiles.map((p, rankIdx) => {
          const realIdx = appData.studentProfiles.indexOf(p);
          const lvl = getStudentLevelInfo(p.xp);
          const s = subMap[p.subject] || appData.subjects[0];
          const courseOptions = (appData.classSchedule || []).map(c => {
            const profName = Array.isArray(c.lecturers) && c.lecturers.length > 0 ? c.lecturers.join(", ") : "Staff";
            return `<option value="${c.code}" ${c.code === p.courseCode ? "selected" : ""}>${c.code} — ${c.title} (${profName})</option>`;
          }).join("");
          const badgesHtml = (p.badges || []).map(b => `<span class="badge badge-amber" style="font-size:0.65rem;margin-right:0.25rem;">${b}</span>`).join("");

          return `
            <tr>
              <td style="font-family:'JetBrains Mono',monospace;font-weight:800;color:var(--accent-primary);">
                #${rankIdx + 1}
              </td>
              <td style="min-width:210px;">
                <div style="display:flex;align-items:center;gap:0.6rem;">
                  ${window.renderStudentAvatar(p, 40)}
                  <div>
                    <button type="button" class="student-bio-trigger btn-open-bio-modal" data-idx="${realIdx}" title="Click to open Student Bio Pop-Up">
                      <span>${p.name}</span>
                    </button>
                    <div style="font-size:0.72rem;color:var(--text-secondary);margin-top:0.15rem;">
                      🎓 ${p.major || "STEM"}
                    </div>
                    <button type="button" class="btn btn-open-bio-modal" data-idx="${realIdx}" style="padding:0.12rem 0.42rem;font-size:0.66rem;margin-top:0.2rem;">
                      🪪 View / Edit Bio &amp; Avatar
                    </button>
                  </div>
                </div>
              </td>
              <td style="min-width:225px;">
                <select class="text-input edit-student-prof-course" data-idx="${realIdx}" style="width:100%;padding:0.26rem 0.45rem;font-size:0.76rem;">
                  ${courseOptions}
                </select>
                <div style="font-size:0.71rem;color:var(--text-secondary);margin-top:0.2rem;">
                  👨‍🏫 Lecturer: <strong>${p.lecturer}</strong> &bull; <span class="subject-pill" style="background:${s.color}">${s.name}</span>
                </div>
              </td>
              <td style="min-width:185px;">
                <div style="display:flex;justify-content:space-between;font-size:0.76rem;font-weight:700;">
                  <span style="color:var(--accent-primary);">${lvl.title}</span>
                  <span style="font-family:'JetBrains Mono',monospace;">${p.xp} XP</span>
                </div>
                <div style="width:100%;height:7px;background:rgba(148,163,184,0.2);border-radius:99px;overflow:hidden;margin-top:0.25rem;">
                  <div style="width:${lvl.pct}%;height:100%;background:linear-gradient(90deg,#10b981,#3b82f6);border-radius:99px;"></div>
                </div>
              </td>
              <td style="font-family:'JetBrains Mono',monospace;font-size:0.79rem;">
                <span style="color:var(--accent-amber);font-weight:800;">🔥 ${p.streak} streak</span><br/>
                <span style="font-size:0.72rem;color:var(--text-secondary);">${p.visits} visits &bull; ${p.totalMinutes}m total</span>
              </td>
              <td>
                ${badgesHtml || '<span style="font-size:0.72rem;color:var(--text-muted);">No badges yet</span>'}
              </td>
              <td>
                <div style="display:flex;gap:0.3rem;">
                  <button type="button" class="btn btn-emerald btn-quick-checkin-profile" data-name="${p.name.replace(/"/g, '&quot;')}" title="1-Click Check In this student" style="padding:0.22rem 0.5rem;font-size:0.72rem;">
                    ✅ Check In
                  </button>
                  <button type="button" class="btn btn-delete-student-profile" data-idx="${realIdx}" title="Permanently delete student profile" style="padding:0.22rem 0.5rem;font-size:0.72rem;color:var(--accent-rose);border-color:rgba(244,63,94,0.35);">
                    🗑️ Delete
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join("");

        profilesWrap.innerHTML = `
          <table class="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student &amp; 16-Bit Avatar (Click Name for Bio)</th>
                <th>Default Course &amp; Lecturer (Auto-Used at QR Scan)</th>
                <th>Gamified Level &amp; XP Progress</th>
                <th>Visit Streak &amp; Time</th>
                <th>Earned Badges</th>
                <th>Permanent Actions</th>
              </tr>
            </thead>
            <tbody>${profRows}</tbody>
          </table>
        `;

        profilesWrap.querySelectorAll(".btn-open-bio-modal").forEach(btn => {
          btn.addEventListener("click", e => {
            const idx = Number(e.currentTarget.getAttribute("data-idx"));
            openStudentBioModal(idx);
          });
        });

        profilesWrap.querySelectorAll(".edit-student-prof-course").forEach(sel => {
          sel.addEventListener("change", e => {
            const idx = Number(e.target.getAttribute("data-idx"));
            const code = e.target.value;
            const matched = (appData.classSchedule || []).find(c => c.code === code);
            if (matched && appData.studentProfiles[idx]) {
              appData.studentProfiles[idx].courseCode = matched.code;
              appData.studentProfiles[idx].subject = matched.subject;
              appData.studentProfiles[idx].lecturer = Array.isArray(matched.lecturers) ? matched.lecturers.join(", ") : "Staff";
              saveState(`Linked ${appData.studentProfiles[idx].name} profile to ${matched.code} (${appData.studentProfiles[idx].lecturer})`);
              renderQrTab();
            }
          });
        });

        profilesWrap.querySelectorAll(".btn-quick-checkin-profile").forEach(btn => {
          btn.addEventListener("click", e => {
            const chosen = e.currentTarget.getAttribute("data-name");
            if (nameInp) {
              nameInp.value = chosen;
              nameInp.removeAttribute("aria-invalid");
            }
            const formEl = document.getElementById("qr-checkin-form");
            if (formEl) formEl.requestSubmit();
          });
        });

        profilesWrap.querySelectorAll(".btn-delete-student-profile").forEach(btn => {
          btn.addEventListener("click", e => {
            const idx = Number(e.currentTarget.getAttribute("data-idx"));
            permanentlyDeleteStudentProfile(idx);
          });
        });
      }
    }

    // 5. Render Completed Check-In / Check-Out History Table
    const completedWrap = document.getElementById("qr-completed-log-wrap");
    if (completedWrap) {
      if (completedList.length === 0) {
        completedWrap.innerHTML = `
          <div style="padding:1.25rem;text-align:center;color:var(--text-secondary);font-size:0.83rem;">
            No completed check-out sessions yet. Click <strong>👋 Check Out</strong> on an active student above to log their session duration.
          </div>
        `;
      } else {
        const compRows = completedList.map(r => {
          const s = subMap[r.subject] || appData.subjects[0];
          return `
            <tr>
              <td><strong>${r.studentName}</strong></td>
              <td><strong>${r.courseCode}</strong></td>
              <td>👨‍🏫 ${r.lecturer || "Staff"}</td>
              <td><span class="subject-pill" style="background:${s.color}">${s.name}</span></td>
              <td>${r.day} (${r.hourBlock})</td>
              <td style="font-family:'JetBrains Mono',monospace;font-size:0.78rem;">
                ${r.checkInTime} &rarr; <strong>${r.checkOutTime || "Done"}</strong>
              </td>
              <td style="font-family:'JetBrains Mono',monospace;font-weight:700;color:var(--accent-primary);">
                ${r.durationMinutes} min
              </td>
              <td>
                <button type="button" class="btn btn-delete-qr-rec" data-id="${r.id}" style="padding:0.2rem 0.45rem;font-size:0.74rem;color:var(--accent-rose);">✕</button>
              </td>
            </tr>
          `;
        }).join("");

        completedWrap.innerHTML = `
          <table class="data-table">
            <thead>
              <tr>
                <th>Student Name / ID</th>
                <th>Course Section</th>
                <th>Lecturer</th>
                <th>Subject</th>
                <th>Day &amp; Hour Block</th>
                <th>Check-In &rarr; Check-Out</th>
                <th>Measured Duration (1/&mu;)</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>${compRows}</tbody>
          </table>
        `;

        completedWrap.querySelectorAll(".btn-delete-qr-rec").forEach(btn => {
          btn.addEventListener("click", e => {
            const id = e.currentTarget.getAttribute("data-id");
            appData.attendanceLog = appData.attendanceLog.filter(x => x.id !== id);
            saveState("Removed attendance log entry");
            renderQrTab();
          });
        });
      }
    }
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

    // Sheet 3: Class Schedule Release Drivers
    const classDriverRows = (appData.classSchedule || []).map(c => ({
      Course_Section: c.code,
      Title: c.title,
      Subject: c.subject,
      Lecturers: Array.isArray(c.lecturers) ? c.lecturers.join(", ") : "",
      Lecture_Time: c.classTime,
      Release_Hour: c.releaseHour,
      Enrolled: c.enrolled,
      Walk_Ins_Per_Hr: typeof c.walkIns === "number" ? c.walkIns : Math.round((c.enrolled * (c.expectedLabCapturePct || 10)) / 100),
      Impact_Note: c.impactNote
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(classDriverRows), "Class_Release_Drivers");

    // Sheet 4: QR Check-In / Check-Out Attendance Log
    const qrLogRows = (appData.attendanceLog || []).map(r => ({
      Record_ID: r.id,
      Student_Name_ID: r.studentName,
      Course_Section: r.courseCode,
      Lecturer: r.lecturer || "Staff",
      Subject: r.subject,
      Day: r.day,
      Hour_Block: r.hourBlock,
      Check_In_Time: r.checkInTime,
      Check_Out_Time: r.checkOutTime || "In Lab (Active)",
      Duration_Minutes: r.durationMinutes,
      Status: r.status
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(qrLogRows), "QR_Attendance_Log");

    XLSX.writeFile(wb, "Math319_Math_Lab_Optimization_Report.xlsx");
    showToast("Exported Excel report (.xlsx)!");
  }

  function exportQrAttendanceExcel() {
    if (typeof XLSX === "undefined") {
      showToast("SheetJS library not loaded");
      return;
    }
    const wb = XLSX.utils.book_new();
    const qrLogRows = (appData.attendanceLog || []).map(r => ({
      Record_ID: r.id,
      Student_Name_ID: r.studentName,
      Course_Section: r.courseCode,
      Lecturer: r.lecturer || "Staff",
      Subject: r.subject,
      Day: r.day,
      Hour_Block: r.hourBlock,
      Check_In_Time: r.checkInTime,
      Check_Out_Time: r.checkOutTime || "In Lab (Active)",
      Duration_Minutes: r.durationMinutes,
      Status: r.status
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(qrLogRows), "QR_Attendance_Log");
    XLSX.writeFile(wb, "Math319_QR_CheckIn_Attendance_Log.xlsx");
    showToast("Exported QR Check-In / Check-Out Log (.xlsx)!");
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
            appData = normalizeAppData(parsed);
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

  // ========================================================================
  // REAL-TIME CROSS-DEVICE CLOUD RELAY (Phone <-> Dashboard Instant Sync)
  // ========================================================================
  const SYNC_TOPIC = "emu_math319_lab_yusuf_2026_v2";
  const SYNC_URL = "https://ntfy.sh/" + SYNC_TOPIC;
  const DEVICE_ID = "dash-" + Math.random().toString(36).slice(2, 9);
  const seenEventIds = new Set();
  let syncBroadcastChannel = null;
  try {
    if (typeof BroadcastChannel === "function") {
      syncBroadcastChannel = new BroadcastChannel("emu_math319_sync");
    }
  } catch (e) {}

  function updateSyncStatusUi(connected) {
    const badge = document.getElementById("qr-cloud-sync-status-badge");
    if (!badge) return;
    if (connected) {
      badge.className = "badge badge-emerald";
      badge.textContent = "🟢 Live Mobile Sync: Connected";
    } else {
      badge.className = "badge badge-amber";
      badge.textContent = "🟡 Mobile Sync: Reconnecting...";
    }
  }

  function playChime(type) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
      if (type === "checkout") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(440.00, now + 0.12);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      }
    } catch (e) {}
  }

  function broadcastCloudSync(actionType, payload) {
    const msgBody = {
      sender: DEVICE_ID,
      ts: Date.now(),
      action: actionType,
      payload: payload
    };
    if (syncBroadcastChannel) {
      try { syncBroadcastChannel.postMessage(msgBody); } catch (e) {}
    }
    try {
      fetch(SYNC_URL, {
        method: "POST",
        headers: {
          "Title": "EMU Math Lab Dashboard Event",
          "Priority": "high"
        },
        body: JSON.stringify(msgBody)
      }).catch(err => console.debug("Cloud sync post notice:", err));
    } catch (e) {}
  }

  function handleIncomingSyncEvent(data) {
    if (!data || data.sender === DEVICE_ID) return;
    const action = data.action;
    const payload = data.payload || {};

    if (action === "checkin" && payload.record) {
      const rec = payload.record;
      if (!appData.attendanceLog.some(r => r.id === rec.id)) {
        appData.attendanceLog.unshift(rec);
        if (payload.profile) {
          const p = payload.profile;
          const existing = (appData.studentProfiles || []).find(x => x.name.toLowerCase() === (p.name || "").toLowerCase());
          if (existing) {
            Object.assign(existing, p);
          } else {
            appData.studentProfiles.unshift(p);
          }
        }
        const day = rec.day || "Monday";
        const hr = rec.hourBlock || "09:00";
        const sub = rec.subject || "alg";
        if (appData.qrConfig && appData.qrConfig.autoSyncArrivals !== false) {
          if (appData.hourlyArrivals[day] && appData.hourlyArrivals[day][hr]) {
            appData.hourlyArrivals[day][hr][sub] = (Number(appData.hourlyArrivals[day][hr][sub]) || 0) + 1;
          }
        }
        saveState();
        renderAll(true);
        playChime("checkin");
        showToast(`📱 Live Mobile Check-In: ${rec.studentName} checked in to ${rec.courseCode}! +${rec.xpEarned || 50} XP`);
      }
    } else if (action === "checkout") {
      const recordId = payload.recordId;
      const studentName = payload.studentName;
      const rec = appData.attendanceLog.find(r => r.id === recordId || (r.status === "active" && (r.studentName || "").toLowerCase() === (studentName || "").toLowerCase()));
      if (rec && rec.status === "active") {
        rec.status = "completed";
        rec.checkOutTime = payload.checkOutTime || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        rec.durationMinutes = payload.durationMinutes || 20;
        rec.xpEarned = (rec.xpEarned || 50) + (payload.xpBonus || 100);

        const prof = findOrCreateStudentProfile(rec.studentName, true);
        if (prof) {
          prof.xp = (Number(prof.xp) || 0) + (payload.xpBonus || 100);
          prof.totalMinutes = (Number(prof.totalMinutes) || 0) + rec.durationMinutes;
          if (prof.totalMinutes >= 100 && !(prof.badges || []).includes("⏱️ 100+ Min Club")) {
            prof.badges.push("⏱️ 100+ Min Club");
          }
        }
        saveState();
        renderAll(true);
        playChime("checkout");
        showToast(`👋 Live Mobile Check-Out: ${rec.studentName} completed visit (${rec.durationMinutes} min)!`);
      }
    } else if (action === "bio_update" && payload.profile) {
      const p = payload.profile;
      const existing = (appData.studentProfiles || []).find(x => x.name.toLowerCase() === (p.name || "").toLowerCase());
      if (existing) {
        Object.assign(existing, p);
      } else {
        appData.studentProfiles.unshift(p);
      }
      saveState();
      renderQrTab();
      showToast(`📝 Updated student profile: ${p.name}`);
    } else if (action === "delete_profile" && payload.name) {
      permanentlyDeleteStudentProfile(payload.name, true);
      showToast(`🗑️ Student profile removed: ${payload.name}`);
    }
  }

  let sseClient = null;
  function initCrossDeviceCloudSync() {
    if (syncBroadcastChannel) {
      syncBroadcastChannel.onmessage = (e) => {
        try { handleIncomingSyncEvent(e.data); } catch (err) {}
      };
    }

    function connectSse() {
      try {
        if (sseClient) { try { sseClient.close(); } catch (e) {} }
        sseClient = new EventSource(SYNC_URL + "/sse");
        sseClient.onopen = () => updateSyncStatusUi(true);
        sseClient.onmessage = (e) => {
          try {
            const raw = JSON.parse(e.data);
            if (!raw || !raw.id || seenEventIds.has(raw.id)) return;
            seenEventIds.add(raw.id);
            const data = JSON.parse(raw.message || "{}");
            handleIncomingSyncEvent(data);
          } catch (err) {}
        };
        sseClient.onerror = () => {
          updateSyncStatusUi(false);
          try { sseClient.close(); } catch (e) {}
          setTimeout(connectSse, 5000);
        };
      } catch (e) {
        updateSyncStatusUi(false);
        setTimeout(connectSse, 5000);
      }
    }
    connectSse();

    let lastPollTs = Math.floor(Date.now() / 1000) - 10;
    setInterval(async () => {
      try {
        const res = await fetch(`${SYNC_URL}/json?since=${lastPollTs}`);
        if (!res.ok) return;
        const text = await res.text();
        const lines = text.trim().split("\n");
        for (const line of lines) {
          if (!line) continue;
          const msgObj = JSON.parse(line);
          if (!msgObj || !msgObj.id || seenEventIds.has(msgObj.id)) continue;
          seenEventIds.add(msgObj.id);
          if (msgObj.time) lastPollTs = Math.max(lastPollTs, msgObj.time);
          try {
            const data = JSON.parse(msgObj.message || "{}");
            handleIncomingSyncEvent(data);
          } catch (e) {}
        }
      } catch (e) {}
    }, 3500);
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
      sliderSurge.value = p.trafficSurgePercent || 0;
      document.getElementById("val-surge").textContent = (p.trafficSurgePercent >= 0 ? "+" : "") + (p.trafficSurgePercent || 0) + "%";

      sliderSession.value = p.muTutor || 20;
      document.getElementById("val-session").textContent = (p.muTutor || 20) + " / hr";

      sliderBudgetCut.value = p.safetyFactorBeta || 1.0;
      document.getElementById("val-budget-cut").textContent = "β = " + Number(p.safetyFactorBeta || 1.0).toFixed(2);

      sliderSmoothing.value = p.demandSmoothingPercent || 0;
      document.getElementById("val-smoothing").textContent = (p.demandSmoothingPercent || 0) + "%";

      selectObjective.value = p.optimizationObjective || "erlang_c_weighted_wait";
    }

    sliderSurge.addEventListener("input", e => {
      appData.parameters.trafficSurgePercent = Number(e.target.value);
      syncSlidersToUI();
      renderAll(true);
    });

    sliderSession.addEventListener("input", e => {
      appData.parameters.muTutor = Number(e.target.value);
      syncSlidersToUI();
      renderAll(true);
    });

    sliderBudgetCut.addEventListener("input", e => {
      appData.parameters.safetyFactorBeta = Number(e.target.value);
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
          appData.parameters.muTutor = 20;
          appData.parameters.safetyFactorBeta = 1.0;
          appData.parameters.demandSmoothingPercent = 0;
          appData.templateAssignments = clone(window.MATH_LAB_DEFAULT_DATA.initialTemplateAssignments);
        } else if (preset === "optimal") {
          appData.parameters.trafficSurgePercent = 0;
          appData.parameters.muTutor = 20;
          appData.parameters.safetyFactorBeta = 1.0;
          appData.parameters.demandSmoothingPercent = 0;
          appData.templateAssignments = clone(window.MATH_LAB_DEFAULT_DATA.optimalTemplateAssignments);
        } else if (preset === "midterm") {
          appData.parameters.trafficSurgePercent = 30;
          appData.parameters.muTutor = 20;
          appData.parameters.demandSmoothingPercent = 0;
        } else if (preset === "demand_nudge") {
          appData.parameters.trafficSurgePercent = 0;
          appData.parameters.muTutor = 20;
          appData.parameters.demandSmoothingPercent = 15;
        }
        syncSlidersToUI();
        renderAll(true);
        showToast(`Applied preset: ${pill.textContent}`);
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

    // Add New Course Section button in Tab 3 (Class Schedule Release Drivers)
    const btnAddClassSection = document.getElementById("btn-add-class-section");
    if (btnAddClassSection) {
      btnAddClassSection.addEventListener("click", () => {
        const nextNum = appData.classSchedule.length + 1;
        const defaultProf = (appData.lecturers && appData.lecturers[0]) ? [appData.lecturers[0]] : ["Dr. Andrew Ross"];
        const newSection = {
          code: `MATH 10${nextNum}-01`,
          subject: "alg",
          title: "New Course Section (Mon–Thu)",
          lecturers: defaultProf,
          days: ["Monday", "Tuesday", "Wednesday", "Thursday"],
          classTime: "11:00 AM – 11:50 AM",
          releaseHour: "12:00",
          enrolled: 50,
          walkIns: 6,
          expectedLabCapturePct: 12,
          impactNote: "Custom lecture release wave added via Dashboard"
        };
        appData.classSchedule.push(newSection);
        appData.meta.operatingDays.forEach(d => {
          if (appData.hourlyArrivals[d] && appData.hourlyArrivals[d]["12:00"]) {
            appData.hourlyArrivals[d]["12:00"].alg = Math.max(0, (appData.hourlyArrivals[d]["12:00"].alg || 0) + 6);
          }
        });
        saveState(`Added course section ${newSection.code}`);
        renderAll(true);
      });
    }

    // ========================================================================
    // MY.EMICH SEMESTER SCHEDULE PASTE / EXCEL AUTO-PARSER & IMPORTER
    // ========================================================================
    const emichDialog = document.getElementById("emich-import-dialog");
    const btnOpenEmich = document.getElementById("btn-open-emich-import");
    const btnLoadSampleEmich = document.getElementById("btn-load-sample-emich");
    const emichPasteForm = document.getElementById("emich-paste-form");
    const emichFileInput = document.getElementById("emich-schedule-file-input");

    function inferSubjectFromCourseAndTitle(codeStr, titleStr) {
      const combined = `${codeStr || ""} ${titleStr || ""}`.toLowerCase();
      if (combined.includes("stat") || /math\s*200|stat\s*170|stat\s*260|stat\s*360/i.test(combined)) return "stats";
      if (combined.includes("trig") || /math\s*112/i.test(combined)) return "trig";
      if (combined.includes("calc") && !combined.includes("precalc")) return "calc";
      if (/math\s*120|math\s*121|math\s*122|math\s*161|math\s*223/i.test(combined)) return "calc";
      if (combined.includes("precalc") || /math\s*115|math\s*118|math\s*119/i.test(combined)) return "pre";
      return "alg";
    }

    function matchEmuInstructor(rawInstructor) {
      const raw = (rawInstructor || "").trim();
      if (!raw) return ["Dr. Andrew Ross"];
      // Split multiple instructors if separated by "/" or ";" or "&"
      const parts = raw.split(/\s*[\/;&]\s*/).filter(Boolean);
      const matchedList = [];

      parts.forEach(part => {
        let candidate = part.trim();
        // Handle Banner "Last, First" format (e.g. "Ross, Andrew")
        if (candidate.includes(",")) {
          const [last, first] = candidate.split(",").map(s => s.trim());
          if (last && first) candidate = `${first} ${last}`;
        }
        const lowerCand = candidate.toLowerCase();
        const foundInPool = (appData.lecturers || []).find(prof => {
          const pLower = prof.toLowerCase();
          if (pLower === lowerCand || pLower.includes(lowerCand)) return true;
          const lastWord = prof.split(/\s+/).pop().toLowerCase();
          return lastWord.length > 2 && lowerCand.includes(lastWord);
        });
        if (foundInPool) {
          if (!matchedList.includes(foundInPool)) matchedList.push(foundInPool);
        } else {
          const formatted = /^(dr\.|prof\.)/i.test(candidate) ? candidate : `Dr. ${candidate}`;
          if (!appData.lecturers.includes(formatted)) {
            appData.lecturers.push(formatted);
          }
          if (!matchedList.includes(formatted)) matchedList.push(formatted);
        }
      });

      return matchedList.length > 0 ? matchedList : ["Dr. Andrew Ross"];
    }

    function parseMeetingTimeAndReleaseHour(rawTimeStr) {
      const raw = (rawTimeStr || "").trim();
      // Extract days if prefixed like "MW 9:00 AM - 9:50 AM" or "TR 8:30 AM - 9:50 AM" or "MTWR ..."
      const days = [];
      const dayPrefixMatch = raw.match(/^([MTWRF]+)\b/i);
      if (dayPrefixMatch) {
        const dCode = dayPrefixMatch[1].toUpperCase();
        if (dCode.includes("M")) days.push("Monday");
        if (dCode.includes("T")) days.push("Tuesday");
        if (dCode.includes("W")) days.push("Wednesday");
        if (dCode.includes("R")) days.push("Thursday");
      }
      const cleanTime = raw.replace(/^[MTWRF]+\s+/i, "").trim() || "9:00 AM – 9:50 AM";

      // Find end time in range (e.g., "- 9:50 AM" or "– 12:50 PM" or "- 2:15 PM")
      const timeMatches = [...cleanTime.matchAll(/(\d{1,2}):(\d{2})\s*(AM|PM)?/gi)];
      let releaseHour = "10:00";
      if (timeMatches.length > 0) {
        const endMatch = timeMatches[timeMatches.length - 1];
        let hr = parseInt(endMatch[1], 10);
        const min = parseInt(endMatch[2], 10);
        const ampm = (endMatch[3] || "").toUpperCase();
        if (ampm === "PM" && hr < 12) hr += 12;
        if (ampm === "AM" && hr === 12) hr = 0;
        if (!ampm && hr >= 1 && hr <= 6) hr += 12; // e.g. "1:50" -> 13:50

        // If lecture ends at :40, :45, :50, :55, students arrive at the next hour (hr + 1)
        const targetHr24 = min >= 30 ? hr + 1 : hr;
        const clampedHr = Math.min(16, Math.max(9, targetHr24));
        releaseHour = (clampedHr < 10 ? "0" : "") + clampedHr + ":00";
      }

      return {
        days: days.length > 0 ? days : ["Monday", "Tuesday", "Wednesday", "Thursday"],
        classTime: cleanTime,
        releaseHour: releaseHour
      };
    }

    function applyImportedEmichSections(parsedSections, replaceExisting) {
      if (!parsedSections || parsedSections.length === 0) {
        showToast("Could not find valid course rows to import");
        return;
      }
      if (replaceExisting) {
        // Subtract old classSchedule walk-ins from hourlyArrivals, then add new ones
        appData.classSchedule.forEach(oldC => {
          const w = typeof oldC.walkIns === "number" ? oldC.walkIns : 0;
          (oldC.days || appData.meta.operatingDays).forEach(d => {
            if (appData.hourlyArrivals[d] && appData.hourlyArrivals[d][oldC.releaseHour]) {
              const cur = Number(appData.hourlyArrivals[d][oldC.releaseHour][oldC.subject]) || 0;
              appData.hourlyArrivals[d][oldC.releaseHour][oldC.subject] = Math.max(1, cur - w);
            }
          });
        });
        appData.classSchedule = parsedSections;
      } else {
        appData.classSchedule.push(...parsedSections);
      }

      // Add imported walk-in waves into hourlyArrivals
      parsedSections.forEach(c => {
        (c.days || appData.meta.operatingDays).forEach(d => {
          if (appData.hourlyArrivals[d] && appData.hourlyArrivals[d][c.releaseHour]) {
            const cur = Number(appData.hourlyArrivals[d][c.releaseHour][c.subject]) || 0;
            appData.hourlyArrivals[d][c.releaseHour][c.subject] = Math.max(1, cur + (c.walkIns || 0));
          }
        });
      });

      if (emichDialog && emichDialog.open) emichDialog.close();
      saveState(`✅ Imported ${parsedSections.length} EMU course sections from my.emich & updated release waves!`);
      renderAll(true);
    }

    function parseRawEmichText(rawText) {
      const lines = (rawText || "").split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith("#"));
      const results = [];

      lines.forEach(line => {
        // Skip header lines
        if (/^course\b/i.test(line) && /instructor|time|enrolled/i.test(line)) return;
        const cols = line.includes("|")
          ? line.split("|").map(s => s.trim())
          : (line.includes("\t") ? line.split("\t").map(s => s.trim()) : line.split(",").map(s => s.trim()));

        if (cols.length >= 2) {
          const code = cols[0] || "MATH 112-01";
          const title = cols[1] || "EMU Mathematics Lecture";
          const profRaw = cols[2] || "Dr. Andrew Ross";
          const timeRaw = cols[3] || "MW 9:00 AM – 9:50 AM";
          const enrolledNum = parseInt((cols[4] || "60").replace(/[^\d]/g, ""), 10) || 60;

          const sub = inferSubjectFromCourseAndTitle(code, title);
          const lecturers = matchEmuInstructor(profRaw);
          const { days, classTime, releaseHour } = parseMeetingTimeAndReleaseHour(timeRaw);
          const capturePct = sub === "trig" ? 17 : 11;
          const walkIns = Math.max(2, Math.round((enrolledNum * capturePct) / 100));

          results.push({
            code: code,
            subject: sub,
            title: title,
            lecturers: lecturers,
            days: days,
            classTime: classTime,
            releaseHour: releaseHour,
            enrolled: enrolledNum,
            walkIns: walkIns,
            expectedLabCapturePct: capturePct,
            impactNote: `Imported from my.emich (${lecturers.join(", ")} → ${releaseHour} release)`
          });
        }
      });
      return results;
    }

    if (emichDialog) {
      if (!("closedBy" in HTMLDialogElement.prototype)) {
        emichDialog.addEventListener("click", (event) => {
          if (event.target !== emichDialog) return;
          const rect = emichDialog.getBoundingClientRect();
          const inside = rect.top <= event.clientY && event.clientY <= rect.top + rect.height && rect.left <= event.clientX && event.clientX <= rect.left + rect.width;
          if (!inside) emichDialog.close();
        });
      }
    }

    if (btnOpenEmich && emichDialog) {
      btnOpenEmich.addEventListener("click", () => {
        emichDialog.showModal();
      });
    }

    if (btnLoadSampleEmich) {
      btnLoadSampleEmich.addEventListener("click", () => {
        const ta = document.getElementById("emich-paste-textarea");
        if (ta) {
          ta.value = [
            "MATH 112-01 | Topics in Precalculus (Trigonometry) | Dr. Andrew Ross | MW 9:00 AM – 9:50 AM | 68",
            "MATH 112-02 | Topics in Precalculus (Tue/Thu Trig) | Dr. Roxanne Katus | TR 8:30 AM – 9:50 AM | 62",
            "MATH 105-01/02 | College Algebra (Combined Lectures) | Prof. Mary Walker / Dr. Gabriela Dumitrascu | MTWR 12:00 PM – 12:50 PM | 145",
            "MATH 115-01 | Precalculus | Dr. Lon Mitchell / Dr. Brandon Alberts | MTWR 1:00 PM – 1:50 PM | 110",
            "STAT 170-01/02 | Elementary Statistics | Dr. Khairul Islam / Dr. Tanweer Shapla | MWR 1:00 PM – 2:15 PM | 95",
            "MATH 120-01 | Calculus I | Dr. John Curran / Dr. Ovidiu Calin | MTWR 2:00 PM – 2:50 PM | 74"
          ].join("\n");
          showToast("Loaded sample EMU Semester Schedule! Click 'Parse & Import' below.");
        }
      });
    }

    if (emichPasteForm) {
      emichPasteForm.addEventListener("submit", e => {
        e.preventDefault();
        const ta = document.getElementById("emich-paste-textarea");
        const replaceChk = document.getElementById("emich-replace-existing");
        const parsed = parseRawEmichText(ta ? ta.value : "");
        applyImportedEmichSections(parsed, replaceChk ? replaceChk.checked : true);
      });
    }

    if (emichFileInput) {
      emichFileInput.addEventListener("change", e => {
        const file = e.target.files && e.target.files[0];
        if (!file || typeof XLSX === "undefined") return;
        const reader = new FileReader();
        reader.onload = ev => {
          try {
            const data = new Uint8Array(ev.target.result);
            const wb = XLSX.read(data, { type: "array" });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(sheet);
            const parsed = rows.map(r => {
              const code = String(r.Course || r.Course_Section || r.Code || r.Subject_Course || "MATH 112-01").trim();
              const title = String(r.Title || r.Course_Title || r.Description || "EMU Math Course").trim();
              const profRaw = String(r.Instructor || r.Lecturers || r.Professor || r.Faculty || "Dr. Andrew Ross").trim();
              const timeRaw = String(r.Time || r.Lecture_Time || r.Meeting_Time || "9:00 AM – 9:50 AM").trim();
              const enrolledNum = parseInt(r.Enrolled || r.Act || r.Enrollment || 60, 10) || 60;
              const sub = inferSubjectFromCourseAndTitle(code, title);
              const lecturers = matchEmuInstructor(profRaw);
              const { days, classTime, releaseHour } = parseMeetingTimeAndReleaseHour(timeRaw);
              const capturePct = sub === "trig" ? 17 : 11;
              const walkIns = parseInt(r.Walk_Ins_Per_Hr || r.WalkIns, 10) || Math.max(2, Math.round((enrolledNum * capturePct) / 100));
              return {
                code,
                subject: sub,
                title,
                lecturers,
                days,
                classTime,
                releaseHour,
                enrolled: enrolledNum,
                walkIns,
                expectedLabCapturePct: capturePct,
                impactNote: `Imported from ${file.name} (${lecturers.join(", ")})`
              };
            });
            const replaceChk = document.getElementById("emich-replace-existing");
            applyImportedEmichSections(parsed, replaceChk ? replaceChk.checked : true);
          } catch (err) {
            showToast("Could not parse my.emich spreadsheet file");
          }
        };
        reader.readAsArrayBuffer(file);
      });
    }

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
      localStorage.removeItem("MATH319_LAB_DASHBOARD_STATE_V1");
      appData = clone(window.MATH_LAB_DEFAULT_DATA);
      customPrototypeXt = {};
      syncSlidersToUI();
      renderAll(true);
      showToast("Reset all data & schedules to baseline!");
    });

    // ========================================================================
    // QR CODE CHECK-IN / CHECK-OUT KIOSK LISTENERS (NAME-ONLY + PROFILES)
    // ========================================================================
    const qrForm = document.getElementById("qr-checkin-form");
    const qrNameInput = document.getElementById("checkin-student-name");

    if (qrForm && qrNameInput) {
      const syncAriaInvalid = (input) => {
        if (!input.checkValidity()) {
          input.setAttribute("aria-invalid", "true");
        } else {
          input.removeAttribute("aria-invalid");
        }
      };

      qrForm.addEventListener("blur", e => {
        if (e.target.matches("input[required]")) syncAriaInvalid(e.target);
      }, true);

      qrNameInput.addEventListener("input", () => {
        if (qrNameInput.checkValidity()) {
          qrNameInput.removeAttribute("aria-invalid");
        }
        renderCheckinProfilePreview(qrNameInput.value);
      });

      qrForm.addEventListener("submit", e => {
        e.preventDefault();
        const rawName = (qrNameInput.value || "").trim();
        if (!rawName) {
          qrNameInput.setAttribute("aria-invalid", "true");
          qrNameInput.focus();
          return;
        }

        const prof = findOrCreateStudentProfile(rawName, true);
        const day = "Monday";
        const hr = selectedCheckInHour || "09:00";
        const isQuietBonus = isQuietBonusHour(hr, day);
        const earnedXp = isQuietBonus ? 100 : 50;

        prof.xp = (Number(prof.xp) || 0) + earnedXp;
        prof.streak = (Number(prof.streak) || 0) + 1;
        prof.visits = (Number(prof.visits) || 0) + 1;
        if (!Array.isArray(prof.badges)) prof.badges = [];
        if (prof.streak >= 3 && !prof.badges.some(b => b.includes("Streak"))) {
          prof.badges.push(`🔥 ${prof.streak}-Day Streak`);
        }
        if (isQuietBonus && !prof.badges.includes("⚡ 2x Quiet-Hour Strategist")) {
          prof.badges.push("⚡ 2x Quiet-Hour Strategist");
        }

        const sub = prof.subject || "trig";
        const autoSync = document.getElementById("checkin-autosync-toggle") ? document.getElementById("checkin-autosync-toggle").checked : true;
        const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        const newRec = {
          id: "chk-" + Date.now(),
          studentName: prof.name,
          courseCode: prof.courseCode,
          lecturer: prof.lecturer,
          subject: sub,
          day: day,
          hourBlock: hr,
          checkInTime: nowStr,
          checkOutTime: null,
          durationMinutes: appData.parameters.avgSessionMinutes || 20,
          xpEarned: earnedXp,
          status: "active"
        };

        appData.attendanceLog.unshift(newRec);
        if (autoSync && appData.hourlyArrivals[day] && appData.hourlyArrivals[day][hr]) {
          appData.hourlyArrivals[day][hr][sub] = (Number(appData.hourlyArrivals[day][hr][sub]) || 0) + 1;
        }

        qrNameInput.value = "";
        qrNameInput.removeAttribute("aria-invalid");
        saveState(`🎉 Checked in ${prof.name} at ${hr}! +${earnedXp} XP ${isQuietBonus ? "(⚡ 2x Quiet-Hour Bonus!)" : ""} & 🔥 ${prof.streak}-Visit Streak!`);
        renderAll(true);
        playChime("checkin");
        broadcastCloudSync("checkin", { record: newRec, profile: prof });
      });
    }

    // Add New Student Profile button (opens Bio Modal immediately!)
    const btnAddStudentProfile = document.getElementById("btn-add-student-profile");
    if (btnAddStudentProfile) {
      btnAddStudentProfile.addEventListener("click", () => {
        const firstClass = (appData.classSchedule && appData.classSchedule[0]) || {
          code: "MATH 112-01",
          subject: "trig",
          lecturers: ["Prof. Ross"]
        };
        const nextIdx = (appData.studentProfiles || []).length + 1;
        const avatarList = window.PIXEL_AVATARS_16BIT || [];
        const pickAv = avatarList[nextIdx % Math.max(1, avatarList.length)];
        const newProf = {
          name: `Alex Rivera ${nextIdx}`,
          firstName: "Alex",
          lastName: `Rivera ${nextIdx}`,
          major: "Computer Science & Mathematics",
          hobbies: "16-bit retro games, chess club, campus hackathons",
          avatarId: pickAv ? pickAv.id : "pixel-wizard",
          courseCode: firstClass.code || "MATH 112-01",
          subject: firstClass.subject || "trig",
          lecturer: Array.isArray(firstClass.lecturers) ? firstClass.lecturers.join(", ") : "Prof. Ross",
          xp: 150,
          streak: 1,
          visits: 1,
          totalMinutes: 20,
          badges: ["🌱 New Explorer"]
        };
        appData.studentProfiles.unshift(newProf);
        saveState(`Added new student profile: ${newProf.name}`);
        renderQrTab();
        openStudentBioModal(0);
      });
    }

    // ========================================================================
    // STUDENT BIO POP-UP MODAL (<dialog closedby="any">) LISTENERS & FALLBACK
    // ========================================================================
    const bioDialog = document.getElementById("student-bio-dialog");
    if (bioDialog) {
      // Fallback for browsers without native closedby="any" support (e.g., Safari)
      if (!("closedBy" in HTMLDialogElement.prototype)) {
        bioDialog.addEventListener("click", (event) => {
          if (event.target !== bioDialog) return;
          const rect = bioDialog.getBoundingClientRect();
          const isDialogContent = (
            rect.top <= event.clientY &&
            event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX &&
            event.clientX <= rect.left + rect.width
          );
          if (isDialogContent) return;
          bioDialog.close();
        });
      }

      const customAvatarInp = document.getElementById("bio-custom-avatar-input");
      if (customAvatarInp) {
        customAvatarInp.addEventListener("change", e => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = ev => {
            editingBioCustomDataUrl = ev.target.result;
            if (typeof bioDialog._refreshAvatarUI === "function") {
              bioDialog._refreshAvatarUI();
            }
          };
          reader.readAsDataURL(file);
        });
      }

      const bioForm = document.getElementById("student-bio-form");
      if (bioForm) {
        bioForm.addEventListener("submit", e => {
          e.preventDefault();
          const idx = Number(document.getElementById("bio-profile-index").value);
          const prof = appData.studentProfiles[idx];
          if (!prof) return;

          const oldName = prof.name;
          const fName = (document.getElementById("bio-first-name").value || "").trim() || "Student";
          const lName = (document.getElementById("bio-last-name").value || "").trim();
          const fullName = `${fName} ${lName}`.trim();

          prof.firstName = fName;
          prof.lastName = lName;
          prof.name = fullName;
          prof.major = (document.getElementById("bio-major").value || "").trim() || "Undeclared";
          prof.hobbies = (document.getElementById("bio-hobbies").value || "").trim() || "None listed";
          prof.avatarId = editingBioAvatarId || "pixel-wizard";
          if (editingBioCustomDataUrl) {
            prof.customAvatarDataUrl = editingBioCustomDataUrl;
          } else {
            delete prof.customAvatarDataUrl;
          }

          const courseCode = document.getElementById("bio-course-select").value;
          const matchedCourse = (appData.classSchedule || []).find(c => c.code === courseCode);
          if (matchedCourse) {
            prof.courseCode = matchedCourse.code;
            prof.subject = matchedCourse.subject;
            prof.lecturer = Array.isArray(matchedCourse.lecturers) ? matchedCourse.lecturers.join(", ") : "Staff";
          }

          // Update any attendanceLog entries matching the student's previous name
          if (oldName && oldName !== fullName) {
            (appData.attendanceLog || []).forEach(r => {
              if ((r.studentName || "").toLowerCase() === oldName.toLowerCase()) {
                r.studentName = fullName;
              }
            });
          }

          bioDialog.close();
          saveState(`💾 Saved Student Bio & 16-Bit Avatar for ${prof.name}!`);
          renderQrTab();
          broadcastCloudSync("bio_update", { profile: prof });
        });
      }

      const btnBioDelete = document.getElementById("btn-bio-delete-permanent");
      if (btnBioDelete) {
        btnBioDelete.addEventListener("click", () => {
          const idx = Number(document.getElementById("bio-profile-index").value);
          permanentlyDeleteStudentProfile(idx);
        });
      }
    }

    // Demo +5 Trig Rush button
    const btnSimTrigWave = document.getElementById("btn-sim-trig-wave");
    if (btnSimTrigWave) {
      btnSimTrigWave.addEventListener("click", () => {
        const sampleNames = [
          "Liam O'Connor",
          "Zara Al-Mansoor",
          "Noah Takahashi",
          "Maya Robinson",
          "Caleb Wright"
        ];
        const day = "Monday";
        const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        sampleNames.forEach((sName, i) => {
          const prof = findOrCreateStudentProfile(sName, true);
          prof.xp = (Number(prof.xp) || 0) + 50;
          prof.streak = (Number(prof.streak) || 0) + 1;
          prof.visits = (Number(prof.visits) || 0) + 1;

          appData.attendanceLog.unshift({
            id: "chk-" + Date.now() + "-" + i,
            studentName: prof.name,
            courseCode: prof.courseCode,
            lecturer: prof.lecturer,
            subject: prof.subject,
            day: day,
            hourBlock: "10:00",
            checkInTime: nowStr,
            checkOutTime: null,
            durationMinutes: 18 + (i % 5),
            xpEarned: 50,
            status: "active"
          });
        });

        if (appData.hourlyArrivals[day] && appData.hourlyArrivals[day]["10:00"]) {
          appData.hourlyArrivals[day]["10:00"].trig = (Number(appData.hourlyArrivals[day]["10:00"].trig) || 0) + 5;
        }
        saveState(`⚡ Simulated +5 Student Profile Check-Ins at 10:00 AM (+50 XP each)!`);
        renderAll(true);
      });
    }

    // Sync Measured 1/mu to Model button
    const btnApplyMeasuredMu = document.getElementById("btn-apply-measured-mu");
    if (btnApplyMeasuredMu) {
      btnApplyMeasuredMu.addEventListener("click", () => {
        const measured = Math.min(35, Math.max(12, getMeasuredAvgSessionMinutes()));
        appData.parameters.avgSessionMinutes = measured;
        syncSlidersToUI();
        saveState(`Synced model Session Length (1/μ) to measured QR average: ${measured} min!`);
        renderAll(true);
      });
    }

    // Update QR #1 (Check-In) and QR #2 (Check-Out) Target URLs
    const btnUpdateInUrl = document.getElementById("btn-update-qr-checkin-url");
    if (btnUpdateInUrl) {
      btnUpdateInUrl.addEventListener("click", () => {
        const urlInp = document.getElementById("qr-checkin-url-input");
        if (urlInp && urlInp.value.trim()) {
          appData.qrConfig.checkInUrl = urlInp.value.trim();
          saveState("Updated QR #1 (Check-In) link!");
          renderQrTab();
        }
      });
    }

    const btnUpdateOutUrl = document.getElementById("btn-update-qr-checkout-url");
    if (btnUpdateOutUrl) {
      btnUpdateOutUrl.addEventListener("click", () => {
        const urlInp = document.getElementById("qr-checkout-url-input");
        if (urlInp && urlInp.value.trim()) {
          appData.qrConfig.checkOutUrl = urlInp.value.trim();
          saveState("Updated QR #2 (Check-Out) link!");
          renderQrTab();
        }
      });
    }

    function openPrintableQrPosters(mode) {
      const inContainer = document.getElementById("qr-code-checkin-container");
      const outContainer = document.getElementById("qr-code-checkout-container");
      const inHtml = inContainer ? inContainer.innerHTML : "";
      const outHtml = outContainer ? outContainer.innerHTML : "";
      const inUrl = (appData.qrConfig && appData.qrConfig.checkInUrl) || "https://yusuf-osuntuyi.github.io/math319-math-lab-dashboard/checkin.html?mode=in";
      const outUrl = (appData.qrConfig && appData.qrConfig.checkOutUrl) || "https://yusuf-osuntuyi.github.io/math319-math-lab-dashboard/checkin.html?mode=out";

      const posterInBlock = `
        <div class="poster poster-in">
          <span class="badge badge-in">ENTRANCE &bull; QR CODE #1</span>
          <h1>✅ Scan to Check In</h1>
          <p>Arriving at the Math Lab? Scan with your phone camera, pick your Course &amp; Lecturer, and tap <strong>Check In</strong>!</p>
          <div class="qr-wrap qr-in">${inHtml}</div>
          <div class="url">${inUrl}</div>
        </div>
      `;
      const posterOutBlock = `
        <div class="poster poster-out">
          <span class="badge badge-out">EXIT &bull; QR CODE #2</span>
          <h1>👋 Scan to Check Out</h1>
          <p>Leaving the Math Lab? Scan with your phone camera and tap <strong>Check Out</strong> next to your name!</p>
          <div class="qr-wrap qr-out">${outHtml}</div>
          <div class="url">${outUrl}</div>
        </div>
      `;

      const bodyHtml = mode === "in"
        ? posterInBlock
        : (mode === "out" ? posterOutBlock : `<div class="grid-both">${posterInBlock}${posterOutBlock}</div>`);

      const win = window.open("", "_blank", "width=900,height=760");
      if (win) {
        win.document.write(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <title>Math Lab QR Check-In &amp; Check-Out Posters</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; text-align: center; padding: 1.75rem; color: #0f172a; }
              .grid-both { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; max-width: 920px; margin: 0 auto; }
              .poster { border-radius: 16px; padding: 2rem 1.5rem; max-width: 430px; margin: 0 auto; }
              .poster-in { border: 4px solid #059669; }
              .poster-out { border: 4px solid #2563eb; }
              .badge { font-weight: 800; padding: 0.32rem 0.85rem; border-radius: 99px; font-size: 0.82rem; display: inline-block; }
              .badge-in { background: #d1fae5; color: #047857; }
              .badge-out { background: #dbeafe; color: #1d4ed8; }
              h1 { font-size: 1.75rem; margin: 0.75rem 0 0.4rem; }
              p { color: #475569; font-size: 0.95rem; line-height: 1.45; }
              .qr-wrap { margin: 1.25rem auto; display: inline-block; padding: 0.85rem; border-radius: 12px; }
              .qr-in { border: 2px dashed #34d399; }
              .qr-out { border: 2px dashed #93c5fd; }
              .qr-wrap svg, .qr-wrap img { width: 220px !important; height: 220px !important; }
              .url { font-family: monospace; font-size: 0.72rem; color: #64748b; margin-top: 0.75rem; word-break: break-all; }
            </style>
          </head>
          <body>
            ${bodyHtml}
            <script>window.onload = () => window.print();<\/script>
          </body>
          </html>
        `);
        win.document.close();
      }
    }

    const btnPrintIn = document.getElementById("btn-print-qr-checkin");
    if (btnPrintIn) btnPrintIn.addEventListener("click", () => openPrintableQrPosters("in"));

    const btnPrintOut = document.getElementById("btn-print-qr-checkout");
    if (btnPrintOut) btnPrintOut.addEventListener("click", () => openPrintableQrPosters("out"));

    const btnPrintBoth = document.getElementById("btn-print-both-posters");
    if (btnPrintBoth) btnPrintBoth.addEventListener("click", () => openPrintableQrPosters("both"));

    // Export QR Log to Excel & Clear Completed Log
    const btnExportQrExcel = document.getElementById("btn-export-qr-excel");
    if (btnExportQrExcel) {
      btnExportQrExcel.addEventListener("click", exportQrAttendanceExcel);
    }

    const btnClearCompleted = document.getElementById("btn-clear-completed-log");
    if (btnClearCompleted) {
      btnClearCompleted.addEventListener("click", () => {
        appData.attendanceLog = (appData.attendanceLog || []).filter(r => r.status === "active");
        saveState("Cleared completed check-out history");
        renderQrTab();
      });
    }

    // Listen for live check-ins from checkin.html across browser tabs
    window.addEventListener("storage", e => {
      if (e.key === STORAGE_KEY) {
        appData = loadInitialState();
        syncSlidersToUI();
        renderAll(true);
        showToast("Synced live student QR Check-In / Check-Out!");
      }
    });

    // Start Cross-Device Real-Time Cloud Sync (ntfy.sh SSE + BroadcastChannel)
    initCrossDeviceCloudSync();

    syncSlidersToUI();
  }

  // Boot application on DOMContentLoaded
  document.addEventListener("DOMContentLoaded", () => {
    initEventListeners();
    renderAll(true);
  });
})();

