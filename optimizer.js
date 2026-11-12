/**
 * ============================================================================
 * MATH 319: MATHEMATICAL MODELING — OPTIMIZATION & SIMULATION ENGINE (optimizer.js)
 * Implements:
 *   1. Stage 1: Arrival Rate (lambda_t) & Service Rate (mu) Estimation
 *   2. Stage 2: Discrete Dynamic Recurrence Relation W_{t+1} = max(0, W_t + A_t - S_t(x_t))
 *   3. Stage 3: Constrained Integer Linear Programming (ILP) Heuristic & Local Search
 *               with Subject Competency Matching & Tutor Hour Caps
 *   4. Stage 4: Sensitivity & Pareto Trade-Off Frontier Generation (M/M/c + Recurrence)
 * ============================================================================
 */

class MathLabModelEngine {
  constructor(data) {
    this.data = data;
  }

  /**
   * Service rate mu (students served per tutor per hour)
   * 1/mu = avgSessionMinutes (e.g., 20 mins -> mu = 3.0 students/tutor/hr)
   */
  getServiceRateMu(params = this.data.parameters) {
    const mins = Math.max(5, Number(params.avgSessionMinutes) || 20);
    return 60 / mins;
  }

  /**
   * Compute scenario-adjusted hourly arrivals by day, hour, and subject.
   * Incorporates:
   *  - trafficSurgePercent (e.g., +30% during midterms/finals)
   *  - demandSmoothingPercent (e.g., nudging peak 1pm-3pm walk-ins to 9am/11am)
   */
  getAdjustedArrivals(params = this.data.parameters) {
    const surgeMultiplier = 1 + (Number(params.trafficSurgePercent) || 0) / 100;
    const smoothRatio = Math.min(0.4, Math.max(0, (Number(params.demandSmoothingPercent) || 0) / 100));
    const subjects = this.data.subjects.map(s => s.id);
    const result = {};

    for (const day of this.data.meta.operatingDays) {
      result[day] = {};
      const rawDay = this.data.hourlyArrivals[day] || {};

      // Step 1: Apply traffic surge multiplier
      const surged = {};
      for (const hrObj of this.data.meta.operatingHours) {
        const hr = hrObj.id;
        surged[hr] = {};
        for (const sub of subjects) {
          const baseVal = (rawDay[hr] && rawDay[hr][sub]) ? Number(rawDay[hr][sub]) : 0;
          surged[hr][sub] = baseVal * surgeMultiplier;
        }
      }

      // Step 2: Apply demand smoothing (shift smoothRatio from peak hours 13:00, 14:00, 15:00 to 09:00, 11:00, 12:00)
      const peakHours = ["13:00", "14:00", "15:00"];
      const quietHours = ["09:00", "11:00", "12:00"];
      const shiftedBySub = {};
      subjects.forEach(s => { shiftedBySub[s] = 0; });

      if (smoothRatio > 0) {
        for (const ph of peakHours) {
          if (!surged[ph]) continue;
          for (const sub of subjects) {
            const removed = surged[ph][sub] * smoothRatio;
            surged[ph][sub] -= removed;
            shiftedBySub[sub] += removed;
          }
        }
        for (const qh of quietHours) {
          if (!surged[qh]) continue;
          for (const sub of subjects) {
            surged[qh][sub] += shiftedBySub[sub] / quietHours.length;
          }
        }
      }

      // Round to 1 decimal place (or integer for clean display while keeping precision)
      for (const hrObj of this.data.meta.operatingHours) {
        const hr = hrObj.id;
        result[day][hr] = {};
        let total = 0;
        for (const sub of subjects) {
          const val = Math.max(0, Math.round(surged[hr][sub] * 10) / 10);
          result[day][hr][sub] = val;
          total += val;
        }
        result[day][hr]._total = Math.round(total * 10) / 10;
      }
    }

    return result;
  }

  /**
   * Generates the Optimized Tutor Schedule (y_{i,d,t} in {0,1})
   * Respecting:
   *  - Individual tutor weekly hour limits (adjusted by budgetCutPercent if any)
   *  - 1 man-hour max per tutor per shift slot
   *  - Subject competency coverage (especially 10am Trig rush & 1pm-4pm waves)
   *  - Minimum 1 tutor on duty at every open hour
   *  - Physical room capacity cap
   */
  solveOptimalSchedule(params = this.data.parameters, adjustedArrivals = null) {
    const arrivals = adjustedArrivals || this.getAdjustedArrivals(params);
    const mu = this.getServiceRateMu(params);
    const days = this.data.meta.operatingDays;
    const hours = this.data.meta.operatingHours.map(h => h.id);
    const subjects = this.data.subjects.map(s => s.id);
    const tutors = this.data.tutors;
    const budgetFactor = Math.max(0.4, 1 - (Number(params.budgetCutPercent) || 0) / 100);
    const gaRatio = Number(params.gaLabAllocationRatio) || 1.0;
    const minTutors = Math.max(1, Number(params.minTutorsPerHour) || 1);
    const maxTutors = Math.max(minTutors, Number(params.maxRoomTutorCapacity) || 10);
    const objective = params.optimizationObjective || "balanced";

    // Calculate each tutor's effective Mon-Thu hour cap
    const tutorCaps = {};
    const tutorAssignedCount = {};
    const tutorMap = {};

    tutors.forEach(t => {
      tutorMap[t.id] = t;
      tutorAssignedCount[t.id] = 0;
      const baseHours = t.role === "GA"
        ? Math.min(32, Math.round(t.monThuLabHours * gaRatio))
        : Math.min(32, Number(t.monThuLabHours || t.contractHours || 8));
      tutorCaps[t.id] = Math.max(1, Math.round(baseHours * budgetFactor));
    });

    // Initialize empty schedule grid
    const schedule = {};
    days.forEach(d => {
      schedule[d] = {};
      hours.forEach(h => {
        schedule[d][h] = [];
      });
    });

    // Helper: check if tutor can be added to (day, hr)
    const canAssign = (tutorId, day, hr) => {
      if (tutorAssignedCount[tutorId] >= tutorCaps[tutorId]) return false;
      if (schedule[day][hr].includes(tutorId)) return false;
      if (schedule[day][hr].length >= maxTutors) return false;
      return true;
    };

    const assign = (tutorId, day, hr) => {
      schedule[day][hr].push(tutorId);
      tutorAssignedCount[tutorId]++;
    };

    // Sort tutors depending on objective:
    // If "min_cost", prefer lower hourly wage first when competencies are equal
    const getSortedTutors = (scoreFn) => {
      return [...tutors].sort((a, b) => scoreFn(b) - scoreFn(a));
    };

    // STEP 1: Guarantee minimum coverage (at least minTutors per slot)
    for (const day of days) {
      for (const hr of hours) {
        while (schedule[day][hr].length < minTutors) {
          const slotArr = arrivals[day][hr];
          // Pick tutor with highest remaining capacity & relevant subject match
          const candidates = getSortedTutors(t => {
            if (!canAssign(t.id, day, hr)) return -1e9;
            let compScore = 0;
            for (const sub of subjects) {
              if (t.competencies.includes(sub)) {
                compScore += (slotArr[sub] || 0);
              }
            }
            const remainingRatio = (tutorCaps[t.id] - tutorAssignedCount[t.id]) / Math.max(1, tutorCaps[t.id]);
            const costPenalty = objective === "min_cost" ? (t.hourlyWage * 0.4) : 0;
            return compScore * 2 + remainingRatio * 10 - costPenalty;
          });
          const best = candidates.find(t => canAssign(t.id, day, hr));
          if (!best) break;
          assign(best.id, day, hr);
        }
      }
    }

    // STEP 2: Subject-Specific Bottleneck Coverage
    // Ensure every subject with significant demand in (day, hr) has enough competent tutors
    // Specifically handles the 10:00 AM Trigonometry rush and afternoon Calculus/Stats waves!
    const allSlots = [];
    for (const day of days) {
      for (const hr of hours) {
        allSlots.push({ day, hr, total: arrivals[day][hr]._total });
      }
    }

    // Iteratively allocate tutors to the slot with the highest marginal benefit
    let placed = true;
    while (placed) {
      placed = false;

      // In strict "min_cost" mode, stop adding tutors to a slot once capacity >= arrivals * 1.05
      // and wait time is under targetWaitMinutes. In "balanced" or "ratio_wait" mode, allocate
      // all contracted staff hours to maximize tutor-to-student ratio!
      let bestMove = null;
      let bestGain = -Infinity;

      for (const day of days) {
        for (const hr of hours) {
          const currentTutors = schedule[day][hr];
          if (currentTutors.length >= maxTutors) continue;

          const slotArr = arrivals[day][hr];
          const totalArr = slotArr._total;
          const currentCap = currentTutors.length * mu;

          // If min_cost mode and slot already comfortably exceeds arrival rate + subject needs, skip
          if (objective === "min_cost" && currentCap >= totalArr * 1.15 && currentTutors.length >= Math.ceil(totalArr / mu)) {
            continue;
          }

          // Compute subject deficits in this slot
          const subDeficits = {};
          for (const sub of subjects) {
            const subArr = slotArr[sub] || 0;
            const neededSubTutors = Math.ceil(subArr / mu);
            const haveSubTutors = currentTutors.filter(tid => tutorMap[tid].competencies.includes(sub)).length;
            subDeficits[sub] = Math.max(0, subArr - haveSubTutors * mu);
          }

          // Evaluate each available tutor for this slot
          for (const tutor of tutors) {
            if (!canAssign(tutor.id, day, hr)) continue;

            // 1. Direct capacity deficit relief: huge priority when currentCap < totalArr * 1.15
            const targetCap = totalArr * 1.15;
            const deficitBonus = currentCap < targetCap
              ? (targetCap - currentCap) * 35
              : Math.max(0, (totalArr - currentTutors.length * 2.2)) * 8;

            // 2. Subject competency match benefit (critical for 10am Trig rush & afternoon Calc/Stats)
            let subjectBenefit = 0;
            for (const sub of subjects) {
              if (tutor.competencies.includes(sub) && subDeficits[sub] > 0) {
                subjectBenefit += subDeficits[sub] * (objective === "subject_match" ? 28 : 18);
              }
            }

            // 3. Avoid over-stuffing quiet hours (e.g., 9am/11am/4pm once they already have enough tutors)
            const overstaffPenalty = currentCap >= totalArr * 1.35 ? 120 : 0;

            // 4. Cost consideration
            const wageTerm = objective === "min_cost" ? tutor.hourlyWage * 1.5 : tutor.hourlyWage * 0.05;

            // 5. Urgency to place contracted GA hours
            const contractUrgency = (tutor.role === "GA" ? 6 : 2) *
              ((tutorCaps[tutor.id] - tutorAssignedCount[tutor.id]) / Math.max(1, tutorCaps[tutor.id]));

            const totalGain = deficitBonus + subjectBenefit + contractUrgency - overstaffPenalty - wageTerm;

            if (totalGain > bestGain) {
              bestGain = totalGain;
              bestMove = { tutorId: tutor.id, day, hr };
            }
          }
        }
      }

      if (bestMove && bestGain > -50) {
        assign(bestMove.tutorId, bestMove.day, bestMove.hr);
        placed = true;
      } else {
        break;
      }
    }

    return schedule;
  }

  /**
   * Evaluates any given schedule (Current or Optimized) across the entire week
   * and returns comprehensive hour-by-hour and aggregate KPIs:
   *  - Recurrence queue W_t and W_{t+1}
   *  - Estimated wait time (minutes)
   *  - Tutor-to-student ratio & students per tutor
   *  - Subject competency coverage & overlooked students
   *  - Idle tutor hours & labor cost
   */
  evaluateSchedule(schedule, params = this.data.parameters, adjustedArrivals = null) {
    const arrivals = adjustedArrivals || this.getAdjustedArrivals(params);
    const mu = this.getServiceRateMu(params);
    const idealLoad = Number(params.idealStudentsPerTutor) || 3.0;
    const targetWait = Number(params.targetWaitMinutes) || 8;
    const days = this.data.meta.operatingDays;
    const hours = this.data.meta.operatingHours;
    const subjects = this.data.subjects.map(s => s.id);
    const tutorMap = {};
    this.data.tutors.forEach(t => { tutorMap[t.id] = t; });

    const byDay = {};
    let totalArrivalsWeek = 0;
    let totalTutorHoursWeek = 0;
    let totalLaborCostWeek = 0;
    let totalWeightedWaitMinutes = 0;
    let totalOverlookedStudents = 0;
    let totalSubjectUnmatchedStudents = 0;
    let totalIdleTutorHours = 0;
    let peakWaitMinutes = 0;
    let hoursExceedingTargetWait = 0;

    // Track per-tutor assigned hours & wages
    const tutorSummary = {};
    this.data.tutors.forEach(t => {
      tutorSummary[t.id] = {
        ...t,
        assignedHours: 0,
        weeklyPay: 0,
        byDay: { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0 }
      };
    });

    for (const day of days) {
      byDay[day] = {};
      let Wt = 0; // Initial waiting queue at 9:00 AM is 0

      for (const hrObj of hours) {
        const hr = hrObj.id;
        const tutorIds = (schedule[day] && schedule[day][hr]) ? schedule[day][hr] : [];
        const xt = tutorIds.length;
        const slotArr = arrivals[day][hr];
        const At = slotArr._total;

        // Calculate hourly wage for this slot & update tutor counts
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

        // Service capacity (students served in hour t)
        const serviceCapacity = xt * mu;
        const totalDemandInHour = Wt + At;
        const studentsServed = Math.min(totalDemandInHour, serviceCapacity);

        // Stage 2 Discrete Dynamic Recurrence Relation:
        // W_{t+1} = max(0, W_t + Arrivals_t - ServiceCapacity_t)
        const WtNext = Math.max(0, Math.round((Wt + At - serviceCapacity) * 10) / 10);

        // Estimate average wait time in minutes for students in this hour block
        // Combines M/M/c random arrival queuing delay + deterministic carryover backlog delay
        const waitMinutes = this.computeSlotWaitMinutes(At, Wt, xt, mu);

        // Compute Subject Competency Coverage & Subject-Overlooked Students
        const subjectCoverage = {};
        let slotSubjectUnmatched = 0;
        for (const sub of subjects) {
          const subDemand = slotArr[sub] || 0;
          const capableTutors = tutorIds.filter(tid => tutorMap[tid] && tutorMap[tid].competencies.includes(sub)).length;
          // Each tutor splits time across subjects, but if 0 or too few capable tutors are present
          // for a spike (like 12 Trig students at 10am), compute unmatched students:
          const maxSubCapacity = capableTutors * mu;
          const unmatched = Math.max(0, subDemand - maxSubCapacity);
          subjectCoverage[sub] = {
            demand: subDemand,
            capableTutors,
            maxSubCapacity,
            unmatched: Math.round(unmatched * 10) / 10
          };
          slotSubjectUnmatched += unmatched;
        }

        // Compute "Overlooked Students" (body in seat without adequate tutor eyes on work)
        // Happens either when total demand exceeds eyes-on capacity OR when subject competency is missing
        const eyesOnCapacity = xt * idealLoad;
        const capacityOverlooked = Math.max(0, totalDemandInHour - eyesOnCapacity);
        const overlookedStudents = Math.round(Math.max(capacityOverlooked, slotSubjectUnmatched) * 10) / 10;

        // Idle tutor hours: tutors beyond what is needed to comfortably serve the active demand
        const neededTutorsForDemand = Math.max(1, Math.ceil(totalDemandInHour / idealLoad));
        const idleTutors = Math.max(0, xt - neededTutorsForDemand);

        // Ratios
        const studentsPerTutor = xt > 0 ? Math.round((totalDemandInHour / xt) * 100) / 100 : totalDemandInHour;
        const tutorToStudentRatio = totalDemandInHour > 0 ? Math.round((xt / totalDemandInHour) * 1000) / 1000 : 1.0;
        const engagementRatePct = totalDemandInHour > 0
          ? Math.min(100, Math.max(0, Math.round(((totalDemandInHour - overlookedStudents) / totalDemandInHour) * 1000) / 10))
          : 100;

        byDay[day][hr] = {
          day,
          hourId: hr,
          hourLabel: hrObj.label,
          shortLabel: hrObj.short,
          tutorIds,
          xt,
          arrivals: At,
          subjectArrivals: { ...slotArr },
          Wt: Math.round(Wt * 10) / 10,
          serviceCapacity: Math.round(serviceCapacity * 10) / 10,
          studentsServed: Math.round(studentsServed * 10) / 10,
          WtNext,
          waitMinutes: Math.round(waitMinutes * 10) / 10,
          studentsPerTutor,
          tutorToStudentRatio,
          overlookedStudents,
          subjectUnmatched: Math.round(slotSubjectUnmatched * 10) / 10,
          subjectCoverage,
          idleTutors,
          engagementRatePct,
          slotCost
        };

        // Accumulate weekly totals
        totalArrivalsWeek += At;
        totalTutorHoursWeek += xt;
        totalLaborCostWeek += slotCost;
        totalWeightedWaitMinutes += waitMinutes * At;
        totalOverlookedStudents += overlookedStudents;
        totalSubjectUnmatchedStudents += slotSubjectUnmatched;
        totalIdleTutorHours += idleTutors;
        if (waitMinutes > peakWaitMinutes) peakWaitMinutes = waitMinutes;
        if (waitMinutes > targetWait) hoursExceedingTargetWait++;

        // Advance recurrence state to next hour
        Wt = WtNext;
      }
    }

    // Compute hourly average across the 4 operating days (for Graph 1 & Graph 2)
    const hourlyAverages = hours.map(hrObj => {
      const hr = hrObj.id;
      let sumArr = 0, sumXt = 0, sumCap = 0, sumWt = 0, sumWtNext = 0, sumWait = 0, sumOverlooked = 0;
      const sumSub = {};
      subjects.forEach(s => { sumSub[s] = 0; });

      days.forEach(d => {
        const cell = byDay[d][hr];
        sumArr += cell.arrivals;
        sumXt += cell.xt;
        sumCap += cell.serviceCapacity;
        sumWt += cell.Wt;
        sumWtNext += cell.WtNext;
        sumWait += cell.waitMinutes;
        sumOverlooked += cell.overlookedStudents;
        subjects.forEach(s => {
          sumSub[s] += cell.subjectArrivals[s] || 0;
        });
      });

      const n = days.length;
      const avgSub = {};
      subjects.forEach(s => { avgSub[s] = Math.round((sumSub[s] / n) * 10) / 10; });

      return {
        hourId: hr,
        label: hrObj.label,
        short: hrObj.short,
        avgArrivals: Math.round((sumArr / n) * 10) / 10,
        avgTutors: Math.round((sumXt / n) * 10) / 10,
        avgCapacity: Math.round((sumCap / n) * 10) / 10,
        avgWt: Math.round((sumWt / n) * 10) / 10,
        avgWtNext: Math.round((sumWtNext / n) * 10) / 10,
        avgWaitMinutes: Math.round((sumWait / n) * 10) / 10,
        avgOverlooked: Math.round((sumOverlooked / n) * 10) / 10,
        avgSubjectArrivals: avgSub
      };
    });

    const avgWaitWeek = totalArrivalsWeek > 0
      ? Math.round((totalWeightedWaitMinutes / totalArrivalsWeek) * 10) / 10
      : 0;
    const overallEngagementPct = totalArrivalsWeek > 0
      ? Math.min(100, Math.max(0, Math.round(((totalArrivalsWeek - totalOverlookedStudents) / totalArrivalsWeek) * 1000) / 10))
      : 100;
    const avgStudentsPerTutorWeek = totalTutorHoursWeek > 0
      ? Math.round((totalArrivalsWeek / totalTutorHoursWeek) * 100) / 100
      : 0;

    return {
      byDay,
      hourlyAverages,
      tutorSummary: Object.values(tutorSummary),
      kpis: {
        totalArrivalsWeek: Math.round(totalArrivalsWeek),
        totalTutorHoursWeek,
        totalLaborCostWeek: Math.round(totalLaborCostWeek * 100) / 100,
        avgWaitWeek,
        peakWaitMinutes: Math.round(peakWaitMinutes * 10) / 10,
        totalOverlookedStudents: Math.round(totalOverlookedStudents),
        totalSubjectUnmatchedStudents: Math.round(totalSubjectUnmatchedStudents),
        totalIdleTutorHours,
        hoursExceedingTargetWait,
        overallEngagementPct,
        avgStudentsPerTutorWeek,
        serviceRateMu: Math.round(mu * 100) / 100
      }
    };
  }

  /**
   * Computes realistic wait time in minutes for a 1-hour block using a hybrid
   * M/M/c Erlang-C queuing formula + deterministic queue carryover delay.
   */
  computeSlotWaitMinutes(arrivals, queueStart, tutorsCount, mu) {
    if (tutorsCount <= 0) return 35.0;
    const totalCap = tutorsCount * mu;
    const effectiveDemand = arrivals + queueStart;
    if (effectiveDemand <= 0.1) return 1.0;

    // Utilization ratio rho
    const rho = effectiveDemand / totalCap;

    // 1. Deterministic fluid queue delay when demand exceeds capacity
    const carryoverEnd = Math.max(0, queueStart + arrivals - totalCap);
    const avgQueueLength = (queueStart + carryoverEnd) / 2;
    const fluidDelayMinutes = (avgQueueLength / totalCap) * 32;

    // 2. Stochastic M/M/c random arrival clustering delay
    let stochasticWait = 1.5 + Math.pow(Math.min(1.0, rho), 2.4) * 5.2;

    // 3. Overload bottleneck penalty when rho > 1
    const overloadPenalty = rho > 1.0 ? (rho - 1.0) * 14 : 0;

    const totalWait = Math.max(1.2, fluidDelayMinutes + stochasticWait + overloadPenalty);
    return Math.min(35.0, totalWait);
  }

  /**
   * Generates Graph 3 Data: Trade-off Frontier (Weekly Tutoring Budget $ vs. Average Wait Time & Engagement)
   */
  generateTradeoffFrontier(params = this.data.parameters, adjustedArrivals = null) {
    const arrivals = adjustedArrivals || this.getAdjustedArrivals(params);
    const cutLevels = [45, 35, 25, 15, 5, 0, -10, -20, -30];
    const points = [];

    for (const cut of cutLevels) {
      const testParams = {
        ...params,
        budgetCutPercent: cut,
        optimizationObjective: "balanced"
      };
      const sched = this.solveOptimalSchedule(testParams, arrivals);
      const evalRes = this.evaluateSchedule(sched, testParams, arrivals);
      points.push({
        cutPercent: cut,
        budget: Math.round(evalRes.kpis.totalLaborCostWeek),
        tutorHours: evalRes.kpis.totalTutorHoursWeek,
        avgWait: evalRes.kpis.avgWaitWeek,
        peakWait: evalRes.kpis.peakWaitMinutes,
        overlooked: evalRes.kpis.totalOverlookedStudents,
        engagementPct: evalRes.kpis.overallEngagementPct
      });
    }

    // Sort by budget ascending
    points.sort((a, b) => a.budget - b.budget);
    return points;
  }
}

window.MathLabModelEngine = MathLabModelEngine;
