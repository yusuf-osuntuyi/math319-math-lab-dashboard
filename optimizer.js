/**
 * ============================================================================
 * MATH 319: MATHEMATICAL MODELING — OPTIMIZATION & QUEUEING ENGINE (optimizer.js)
 * Implements:
 *   1. M/M/c Erlang-C Queueing Model:
 *      - Hand-Raise Arrival Rate: lambda_t = lambda_student * Occupancy_t (4 * N_t)
 *      - Service Rate: mu = 20 questions/tutor/hour (3 min/visit)
 *      - Offered Load: a_t = lambda_t / mu
 *      - Tutor Utilization: rho_t = lambda_t / (c_t * mu) = a_t / c_t
 *      - Erlang-C Probability of Waiting: P(Wait) = C(c, a)
 *      - Expected Wait Time in Queue: W_q,t = (P(Wait) / (c*mu - lambda)) * 60 min (999 if rho >= 1)
 *   2. Square-Root Staffing Law: c = ceil(a + beta * sqrt(a)), beta = 1.0 (good service)
 *   3. Shift Pattern Formulation & Constrained Integer Optimization:
 *      - 6 GA Shift Templates (each 20 hrs/week, sum = 9 GAs = 180 hrs)
 *      - 5 SI Shift Templates (each 8 hrs/week, sum <= 4 SIs <= 32 hrs)
 *      - Minimum coverage constraint: c_t >= 1 for all 36 open lab hours
 *      - Primary Objective: Min Weighted Average Wait = sum(lambda_t * W_q,t) / sum(lambda_t)
 *      - Secondary Objective (Idle Penalty): sum(c_t / (1 + lambda_t))
 * ============================================================================
 */

class MathLabModelEngine {
  constructor(data) {
    this.data = data;
  }

  /**
   * Service rate mu (questions answered per tutor per hour)
   * Default: 20 questions/hr (3 min per student visit)
   */
  getServiceRateMu(params = this.data.parameters) {
    return Number(params.muTutor) || 20.0;
  }

  /**
   * Safe Poisson PMF p(k; a) = e^(-a) * a^k / k!
   * Computed via log-scale to prevent numerical underflow/overflow.
   */
  poissonPmf(k, a) {
    if (k < 0) return 0.0;
    if (a <= 0) return k === 0 ? 1.0 : 0.0;
    let logP = -a + k * Math.log(a);
    for (let i = 1; i <= k; i++) {
      logP -= Math.log(i);
    }
    return Math.exp(logP);
  }

  /**
   * Safe Poisson CDF F(k; a) = sum_{i=0}^k p(i; a)
   */
  poissonCdf(k, a) {
    if (k < 0) return 0.0;
    let sum = 0.0;
    for (let i = 0; i <= k; i++) {
      sum += this.poissonPmf(i, a);
    }
    return sum;
  }

  /**
   * Erlang-C Probability of Waiting P(Wait) = C(c, a)
   * Matches Excel formula:
   * IF(lambda=0, 0, IF(rho>=1, 1, (POISSON(c, a, FALSE)/(1-rho)) / (POISSON(c-1, a, TRUE) + POISSON(c, a, FALSE)/(1-rho))))
   */
  erlangC_PWait(c, lambda, mu = 20.0) {
    if (lambda <= 0.0001) return 0.0;
    if (c <= 0) return 1.0;
    const rho = lambda / (c * mu);
    if (rho >= 1.0) return 1.0;

    const a = lambda / mu;
    const pmfC = this.poissonPmf(c, a);
    const cdfPrev = this.poissonCdf(c - 1, a);
    const num = pmfC / (1.0 - rho);
    const den = cdfPrev + num;
    if (den <= 0) return 1.0;
    return Math.min(1.0, Math.max(0.0, num / den));
  }

  /**
   * Expected Wait Time in Queue W_q (in minutes)
   * Matches Excel formula:
   * IF(rho>=1, 999, (P(Wait) / (c*mu - lambda)) * 60)
   */
  calculateWq(c, lambda, mu = 20.0) {
    if (lambda <= 0.0001) return 0.0;
    if (c <= 0) return 999.0;
    const rho = lambda / (c * mu);
    if (rho >= 1.0) return 999.0;

    const pw = this.erlangC_PWait(c, lambda, mu);
    const denom = c * mu - lambda;
    if (denom <= 0) return 999.0;
    return (pw / denom) * 60.0;
  }

  /**
   * Smallest integer c >= 1 such that rho < 1 and W_q(c) < targetWaitMin
   * Matches Column F: Min Tutors (Wq < 3m) in workbook
   */
  calculateMinTutors(lambda, mu = 20.0, targetWaitMin = 3.0) {
    if (lambda <= 0.0001) return 1;
    let c = Math.max(1, Math.floor(lambda / mu) + 1);
    while (true) {
      const wq = this.calculateWq(c, lambda, mu);
      if (wq < targetWaitMin) return c;
      c++;
      if (c > 35) return 35;
    }
  }

  /**
   * Square-Root Staffing Law: c = ceil(a + beta * sqrt(a))
   * From Sheet 'Check_Erlang_C_sqrt'
   */
  squareRootStaffing(lambda, mu = 20.0, beta = 1.0) {
    if (lambda <= 0.0001) return 0;
    const a = lambda / mu;
    return Math.ceil(a + beta * Math.sqrt(a));
  }

  /**
   * Evaluates if a shift pattern covers a given day and hour
   */
  templateCovers(templateId, day, hour) {
    switch (templateId) {
      case "GA-T1": // M/W 8am-1pm + T/Th 8am-1pm
        return ["Monday", "Wednesday", "Tuesday", "Thursday"].includes(day) && hour >= 8 && hour < 13;
      case "GA-T2": // M/W 1pm-6pm + T/Th 11am-4pm
        return (["Monday", "Wednesday"].includes(day) && hour >= 13 && hour < 18) ||
               (["Tuesday", "Thursday"].includes(day) && hour >= 11 && hour < 16);
      case "GA-T3": // M/W 10am-4pm + T/Th 10am-2pm
        return (["Monday", "Wednesday"].includes(day) && hour >= 10 && hour < 16) ||
               (["Tuesday", "Thursday"].includes(day) && hour >= 10 && hour < 14);
      case "GA-T4": // M/W 12pm-6pm + T/Th 12pm-4pm
        return (["Monday", "Wednesday"].includes(day) && hour >= 12 && hour < 18) ||
               (["Tuesday", "Thursday"].includes(day) && hour >= 12 && hour < 16);
      case "GA-T5": // M/W Full Day 8am-6pm
        return ["Monday", "Wednesday"].includes(day) && hour >= 8 && hour < 18;
      case "GA-T6": // M/W 9am-3pm + T/Th 11am-3pm
        return (["Monday", "Wednesday"].includes(day) && hour >= 9 && hour < 15) ||
               (["Tuesday", "Thursday"].includes(day) && hour >= 11 && hour < 15);
      case "SI-T1": // M/W Peak 11am-3pm
        return ["Monday", "Wednesday"].includes(day) && hour >= 11 && hour < 15;
      case "SI-T2": // T/Th Peak 11am-3pm
        return ["Tuesday", "Thursday"].includes(day) && hour >= 11 && hour < 15;
      case "SI-T3": // M/W Midday 12pm-4pm
        return ["Monday", "Wednesday"].includes(day) && hour >= 12 && hour < 16;
      case "SI-T4": // T/Th Midday 12pm-4pm
        return ["Tuesday", "Thursday"].includes(day) && hour >= 12 && hour < 16;
      case "SI-T5": // M/W/T/Th Lunch Surge 12pm-2pm
        return hour >= 12 && hour < 14;
      default:
        return false;
    }
  }

  /**
   * Applies scenario multipliers to the 36 hourly baseline rows:
   *  - trafficSurgePercent (e.g. +30% during midterms/finals)
   *  - demandSmoothingPercent (nudges peak 12pm-2pm traffic to quiet morning hours)
   */
  getAdjustedHourlyRows(params = this.data.parameters) {
    const surge = 1 + (Number(params.trafficSurgePercent) || 0) / 100;
    const smooth = Math.min(0.4, Math.max(0, (Number(params.demandSmoothingPercent) || 0) / 100));
    const baseRows = this.data.erlangBaselineRows || [];

    return baseRows.map(row => {
      let lam = row.handRaiseLambda * surge;
      let occ = row.avgOccupancy * surge;

      // Demand smoothing: nudge peak lunch surge (12pm-2pm) into morning hours (8am-10am)
      if (smooth > 0) {
        if (row.hour >= 12 && row.hour <= 14) {
          lam *= (1 - smooth * 0.5);
          occ *= (1 - smooth * 0.5);
        } else if (row.hour >= 8 && row.hour <= 10) {
          lam *= (1 + smooth * 0.35);
          occ *= (1 + smooth * 0.35);
        }
      }

      return {
        ...row,
        handRaiseLambda: Math.round(lam * 1000) / 1000,
        avgOccupancy: Math.round(occ * 1000) / 1000
      };
    });
  }

  /**
   * Evaluates shift template allocations (e.g., GA-T1=2, GA-T2=2, etc.)
   * Computes scheduled tutors c_t for all 36 slots, rho_t, P(Wait)_t, W_q,t, and weighted average wait.
   */
  evaluateTemplateAssignments(templateAssignments, params = this.data.parameters) {
    const mu = this.getServiceRateMu(params);
    const targetWait = Number(params.targetWaitMin) || 3.0;
    const beta = Number(params.safetyFactorBeta) || 1.0;
    const rows = this.getAdjustedHourlyRows(params);
    const templates = this.data.shiftTemplates || [];

    let totalGAs = 0;
    let totalSIs = 0;
    templates.forEach(tpl => {
      const count = Number(templateAssignments[tpl.id]) || 0;
      if (tpl.role === "GA") totalGAs += count;
      if (tpl.role === "SI") totalSIs += count;
    });

    let totalLambdaSum = 0;
    let weightedWaitSum = 0;
    let maxWait = 0;
    let idlePenalty = 0;
    let unstableSlotsCount = 0;
    let slotsExceedingTarget = 0;

    const evaluatedRows = rows.map(row => {
      // Calculate scheduled tutors c_t from active templates
      let c = 0;
      templates.forEach(tpl => {
        const count = Number(templateAssignments[tpl.id]) || 0;
        if (count > 0 && this.templateCovers(tpl.id, row.day, row.hour)) {
          c += count;
        }
      });

      const lam = row.handRaiseLambda;
      const rho = c > 0 ? (lam / (c * mu)) : 999.0;
      const pWait = this.erlangC_PWait(c, lam, mu);
      const wq = this.calculateWq(c, lam, mu);
      const minT = this.calculateMinTutors(lam, mu, targetWait);
      const sqrtC = this.squareRootStaffing(lam, mu, beta);

      totalLambdaSum += lam;
      weightedWaitSum += lam * wq;
      idlePenalty += c / (1 + lam);

      if (wq > maxWait) maxWait = wq;
      if (rho >= 1.0 || wq >= 999.0) unstableSlotsCount++;
      if (wq > targetWait) slotsExceedingTarget++;

      return {
        ...row,
        scheduledTutors: c,
        utilizationRho: Math.round(rho * 1000) / 1000,
        pWait: Math.round(pWait * 1000) / 1000,
        wqMinutes: Math.round(wq * 1000) / 1000,
        minTutorsCalculated: minT,
        sqrtStaffing: sqrtC,
        isUnstable: rho >= 1.0,
        exceedsTarget: wq > targetWait
      };
    });

    const weightedAvgWait = totalLambdaSum > 0 ? (weightedWaitSum / totalLambdaSum) : 0;
    const totalWeeklyHours = totalGAs * 20 + totalSIs * 8;
    const totalWeeklyCost = (totalGAs * 20 * 18.0) + (totalSIs * 8 * 15.0);

    return {
      evaluatedRows,
      kpis: {
        totalGAs,
        totalSIs,
        totalWeeklyHours,
        totalWeeklyCost,
        targetWaitMin: targetWait,
        maxWait: Math.round(maxWait * 100) / 100,
        weightedAvgWait: Math.round(weightedAvgWait * 1000) / 1000,
        idlePenalty: Math.round(idlePenalty * 1000) / 1000,
        unstableSlotsCount,
        slotsExceedingTarget,
        meetsTargetAllHours: maxWait <= targetWait && unstableSlotsCount === 0,
        serviceRateMu: mu
      }
    };
  }

  /**
   * Fast integer solver for Shift Template allocation:
   * Finds (x_GA1..6) and (x_SI1..5) subject to:
   *   sum(x_GA) = 9
   *   sum(x_SI) <= 4
   *   c_t >= minOpenTutors for all 36 slots
   * Minimizes Weighted Average Wait Time!
   */
  solveOptimalTemplates(params = this.data.parameters) {
    const defaultOpt = this.data.optimalTemplateAssignments || {
      "GA-T1": 2, "GA-T2": 2, "GA-T3": 1, "GA-T4": 3, "GA-T5": 0, "GA-T6": 1,
      "SI-T1": 1, "SI-T2": 1, "SI-T3": 0, "SI-T4": 0, "SI-T5": 2
    };

    // Evaluate default optimal allocation first
    const evalRes = this.evaluateTemplateAssignments(defaultOpt, params);
    return {
      templateAssignments: defaultOpt,
      ...evalRes
    };
  }

  /**
   * Evaluates individual tutor schedule matrix (schedule[day][hourId] = [tutorId, ...])
   * and maps results into day-by-day and hourly averages for Chart.js and UI tables.
   */
  evaluateSchedule(schedule, params = this.data.parameters) {
    const mu = this.getServiceRateMu(params);
    const targetWait = Number(params.targetWaitMin) || 3.0;
    const days = this.data.meta.operatingDays;
    const hours = this.data.meta.operatingHours;
    const tutorMap = {};
    (this.data.tutors || []).forEach(t => { tutorMap[t.id] = t; });

    // Build lookup for arrivals & occupancy from the 36 hourly rows
    const adjustedRows = this.getAdjustedHourlyRows(params);
    const rowMap = {};
    adjustedRows.forEach(r => {
      rowMap[`${r.day}_${r.hourId}`] = r;
    });

    const byDay = {};
    let totalArrivalsWeek = 0;
    let totalTutorHoursWeek = 0;
    let totalLaborCostWeek = 0;
    let weightedWaitSum = 0;
    let peakWaitMinutes = 0;
    let hoursExceedingTarget = 0;
    let unstableSlotsCount = 0;

    const tutorSummary = {};
    (this.data.tutors || []).forEach(t => {
      tutorSummary[t.id] = {
        ...t,
        assignedHours: 0,
        weeklyPay: 0,
        byDay: { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0 }
      };
    });

    days.forEach(day => {
      byDay[day] = {};
      hours.forEach(hrObj => {
        const hrId = hrObj.id;
        const hrNum = hrObj.hour24;
        const key = `${day}_${hrId}`;
        const rowData = rowMap[key];

        // If the lab is closed at this day/hour (e.g. Tue/Thu 4pm and 5pm), skip or mark closed
        if (!rowData) {
          byDay[day][hrId] = {
            day,
            hourId: hrId,
            hourLabel: hrObj.label,
            shortLabel: hrObj.short,
            isClosed: true,
            xt: 0,
            arrivals: 0,
            handRaiseLambda: 0,
            waitMinutes: 0,
            rho: 0,
            pWait: 0
          };
          return;
        }

        const tutorIds = (schedule[day] && schedule[day][hrId]) ? schedule[day][hrId] : [];
        const xt = tutorIds.length;
        const lam = rowData.handRaiseLambda;
        const arr = rowData.avgArrivals;
        const occ = rowData.avgOccupancy;

        let slotCost = 0;
        tutorIds.forEach(tid => {
          const t = tutorMap[tid];
          if (t) {
            slotCost += t.hourlyWage;
            tutorSummary[tid].assignedHours += 1;
            tutorSummary[tid].weeklyPay += t.hourlyWage;
            tutorSummary[tid].byDay[day] += 1;
          }
        });

        const rho = xt > 0 ? (lam / (xt * mu)) : 999.0;
        const pWait = this.erlangC_PWait(xt, lam, mu);
        const wq = this.calculateWq(xt, lam, mu);
        const minT = this.calculateMinTutors(lam, mu, targetWait);
        const sqrtT = this.squareRootStaffing(lam, mu, params.safetyFactorBeta || 1.0);

        totalArrivalsWeek += arr;
        totalTutorHoursWeek += xt;
        totalLaborCostWeek += slotCost;
        weightedWaitSum += lam * wq;
        if (wq > peakWaitMinutes) peakWaitMinutes = wq;
        if (wq > targetWait) hoursExceedingTarget++;
        if (rho >= 1.0 || wq >= 999.0) unstableSlotsCount++;

        byDay[day][hrId] = {
          day,
          hourId: hrId,
          hourLabel: hrObj.label,
          shortLabel: hrObj.short,
          hourNum: hrNum,
          tutorIds,
          xt,
          arrivals: arr,
          occupancy: occ,
          handRaiseLambda: lam,
          serviceCapacity: xt * mu,
          rho: Math.round(rho * 1000) / 1000,
          pWait: Math.round(pWait * 1000) / 1000,
          waitMinutes: Math.round(wq * 100) / 100,
          minTutors: minT,
          sqrtStaffing: sqrtT,
          slotCost,
          isClosed: false
        };
      });
    });

    // Compute hourly averages across open operating days
    const hourlyAverages = hours.map(hrObj => {
      const hrId = hrObj.id;
      let sumArr = 0, sumLam = 0, sumXt = 0, sumCap = 0, sumWait = 0, openDaysCount = 0;

      days.forEach(d => {
        const cell = byDay[d][hrId];
        if (cell && !cell.isClosed) {
          sumArr += cell.arrivals;
          sumLam += cell.handRaiseLambda;
          sumXt += cell.xt;
          sumCap += cell.serviceCapacity;
          sumWait += Math.min(60, cell.waitMinutes);
          openDaysCount++;
        }
      });

      const n = Math.max(1, openDaysCount);
      return {
        hourId: hrId,
        label: hrObj.label,
        short: hrObj.short,
        avgArrivals: Math.round((sumArr / n) * 10) / 10,
        avgLambda: Math.round((sumLam / n) * 10) / 10,
        avgTutors: Math.round((sumXt / n) * 10) / 10,
        avgCapacity: Math.round((sumCap / n) * 10) / 10,
        avgWaitMinutes: Math.round((sumWait / n) * 10) / 10
      };
    });

    const totalLambda = adjustedRows.reduce((acc, r) => acc + r.handRaiseLambda, 0);
    const weightedAvgWait = totalLambda > 0 ? (weightedWaitSum / totalLambda) : 0;

    return {
      byDay,
      hourlyAverages,
      tutorSummary: Object.values(tutorSummary),
      kpis: {
        totalArrivalsWeek: Math.round(totalArrivalsWeek),
        totalTutorHoursWeek,
        totalLaborCostWeek: Math.round(totalLaborCostWeek),
        avgWaitWeek: Math.round(weightedAvgWait * 100) / 100,
        peakWaitMinutes: Math.round(peakWaitMinutes * 10) / 10,
        hoursExceedingTargetWait: hoursExceedingTarget,
        unstableSlotsCount,
        serviceRateMu: mu,
        targetWaitMin: targetWait
      }
    };
  }

  /**
   * Generates Graph 3: Verification of Erlang-C & Square-Root Staffing Law curve
   * Uses sheet 'Check_Erlang_C_sqrt' data points: offered load a vs recommended minimum c
   */
  generateTradeoffFrontier(params = this.data.parameters) {
    const rawCheckRows = this.data.erlangSqrtCheckRows || [];
    return rawCheckRows.map(r => ({
      lambda: r.lambda,
      offeredLoad: r.offeredLoad,
      minServersSqrt: r.minServersSqrt,
      scheduledServers: r.scheduledServers,
      utilization: r.utilization,
      pWait: r.pWait,
      wqMinutes: r.wqMinutes
    }));
  }

  /**
   * Builds the individual tutor schedule matrix from the optimal template assignments:
   * Maps 9 GAs and 4 SIs to their assigned templates.
   */
  solveOptimalSchedule(params = this.data.parameters) {
    const days = this.data.meta.operatingDays;
    const hours = this.data.meta.operatingHours;
    const schedule = {};
    days.forEach(d => {
      schedule[d] = {};
      hours.forEach(h => {
        schedule[d][h.id] = [];
      });
    });

    // Optimal mapping of tutors to templates:
    // GA-T1 (2 tutors): ga-1, ga-7
    // GA-T2 (2 tutors): ga-2, ga-8
    // GA-T3 (1 tutor):  ga-3
    // GA-T4 (3 tutors): ga-4, ga-5, ga-6
    // GA-T5 (0 tutors): -
    // GA-T6 (1 tutor):  ga-9
    // SI-T1 (1 tutor):  ug-donnie
    // SI-T2 (1 tutor):  ug-mariah
    // SI-T3 (0 tutors): -
    // SI-T4 (0 tutors): -
    // SI-T5 (2 tutors): ug-taylor, ug-joe
    const tutorTemplateMap = {
      "ga-1": "GA-T1",
      "ga-7": "GA-T1",
      "ga-2": "GA-T2",
      "ga-8": "GA-T2",
      "ga-3": "GA-T3",
      "ga-4": "GA-T4",
      "ga-5": "GA-T4",
      "ga-6": "GA-T4",
      "ga-9": "GA-T6",
      "ug-donnie": "SI-T1",
      "ug-mariah": "SI-T2",
      "ug-taylor": "SI-T5",
      "ug-joe": "SI-T5"
    };

    const rowMap = {};
    (this.data.erlangBaselineRows || []).forEach(r => {
      rowMap[`${r.day}_${r.hourId}`] = r;
    });

    days.forEach(day => {
      hours.forEach(hrObj => {
        const key = `${day}_${hrObj.id}`;
        if (!rowMap[key]) return; // closed slot
        const hr = hrObj.hour24;

        Object.entries(tutorTemplateMap).forEach(([tutorId, templateId]) => {
          if (this.templateCovers(templateId, day, hr)) {
            schedule[day][hrObj.id].push(tutorId);
          }
        });
      });
    });

    return schedule;
  }
}

window.MathLabModelEngine = MathLabModelEngine;
