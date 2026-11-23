/**
 * ============================================================================
 * MATH 319: MATHEMATICAL MODELING — DATA & CONFIGURATION FILE (data.js)
 * Project: Math Lab Staffing and Student Flow (Erlang-C & Shift Template Model)
 * Author:  Yusuf Osuntuyi (Fall 2026)
 * Based on: Osuntuyi_Proj1.xlsx
 * ============================================================================
 */

window.MATH_LAB_DEFAULT_DATA = {
  meta: {
    projectTitle: "Math Lab Staffing & Student Flow Optimization",
    course: "MATH 319 — Mathematical Modeling",
    author: "Yusuf Osuntuyi",
    instructor: "Prof. Andrew Ross",
    semester: "Fall 2026",
    dataSourceName: "Osuntuyi_Proj1.xlsx (Erlang-C Queueing & Shift Template Model)",
    operatingDays: ["Monday", "Tuesday", "Wednesday", "Thursday"],
    operatingHours: [
      { id: "08:00", label: "8:00 AM", short: "8am", hour24: 8 },
      { id: "09:00", label: "9:00 AM", short: "9am", hour24: 9 },
      { id: "10:00", label: "10:00 AM", short: "10am", hour24: 10 },
      { id: "11:00", label: "11:00 AM", short: "11am", hour24: 11 },
      { id: "12:00", label: "12:00 PM", short: "12pm", hour24: 12 },
      { id: "13:00", label: "1:00 PM", short: "1pm", hour24: 13 },
      { id: "14:00", label: "2:00 PM", short: "2pm", hour24: 14 },
      { id: "15:00", label: "3:00 PM", short: "3pm", hour24: 15 },
      { id: "16:00", label: "4:00 PM", short: "4pm", hour24: 16 },
      { id: "17:00", label: "5:00 PM", short: "5pm", hour24: 17 }
    ]
  },

  // --------------------------------------------------------------------------
  // 1. MODEL PARAMETERS (Exact Workbook Sheet 'Parameters')
  // --------------------------------------------------------------------------
  parameters: {
    lambdaStudent: 4,             // lambda_student: Hand-raises per student per hour (Workbook B2)
    muTutor: 20,                  // mu_tutor: Questions answered per tutor per hour (3 min/visit, Workbook B3)
    targetWaitMin: 3,             // Target_Wait_Min: Max allowed expected wait time (Wq in minutes, Workbook B4)
    numGAs: 9,                    // Num_GAs: Total Graduate Assistants available (Workbook B5)
    gaWeeklyHours: 20,            // GA_Weekly_Hours: Exact weekly hours per GA (= 20 constraint, Workbook B6)
    maxSIs: 4,                    // Max_SIs: Maximum Supplemental Instructors available (Workbook B7)
    siMaxHours: 8,                // SI_Max_Hours: Max weekly hours per SI (<= 8 constraint, Workbook B8)
    minOpenTutors: 1,             // Min_Open_Tutors: Minimum tutors on duty during any open lab hour (Workbook B9)
    safetyFactorBeta: 1.0,        // Safety factor for square-root staffing law: c = ceil(a + beta * sqrt(a))
    trafficSurgePercent: 0,       // Scenario slider: +% surge for midterms / finals
    demandSmoothingPercent: 0,    // Scenario slider: % peak traffic shifted to morning hours
    optimizationObjective: "erlang_c_weighted_wait"
  },

  // --------------------------------------------------------------------------
  // 2. SHIFT PATTERN TEMPLATES (Exact Workbook Sheet 'Queueing_&_Schedule' R3:R13)
  // --------------------------------------------------------------------------
  shiftTemplates: [
    {
      id: "GA-T1",
      name: "GA-T1",
      role: "GA",
      weeklyHours: 20,
      description: "M/W 8am-1pm + T/Th 8am-1pm",
      defaultAssigned: 1,
      optimalAssigned: 2
    },
    {
      id: "GA-T2",
      name: "GA-T2",
      role: "GA",
      weeklyHours: 20,
      description: "M/W 1pm-6pm + T/Th 11am-4pm",
      defaultAssigned: 1,
      optimalAssigned: 2
    },
    {
      id: "GA-T3",
      name: "GA-T3",
      role: "GA",
      weeklyHours: 20,
      description: "M/W 10am-4pm + T/Th 10am-2pm",
      defaultAssigned: 0,
      optimalAssigned: 1
    },
    {
      id: "GA-T4",
      name: "GA-T4",
      role: "GA",
      weeklyHours: 20,
      description: "M/W 12pm-6pm + T/Th 12pm-4pm",
      defaultAssigned: 0,
      optimalAssigned: 3
    },
    {
      id: "GA-T5",
      name: "GA-T5",
      role: "GA",
      weeklyHours: 20,
      description: "M/W Full Day 8am-6pm",
      defaultAssigned: 0,
      optimalAssigned: 0
    },
    {
      id: "GA-T6",
      name: "GA-T6",
      role: "GA",
      weeklyHours: 20,
      description: "M/W 9am-3pm + T/Th 11am-3pm",
      defaultAssigned: 0,
      optimalAssigned: 1
    },
    {
      id: "SI-T1",
      name: "SI-T1",
      role: "SI",
      weeklyHours: 8,
      description: "M/W Peak 11am-3pm",
      defaultAssigned: 0,
      optimalAssigned: 1
    },
    {
      id: "SI-T2",
      name: "SI-T2",
      role: "SI",
      weeklyHours: 8,
      description: "T/Th Peak 11am-3pm",
      defaultAssigned: 0,
      optimalAssigned: 1
    },
    {
      id: "SI-T3",
      name: "SI-T3",
      role: "SI",
      weeklyHours: 8,
      description: "M/W Midday 12pm-4pm",
      defaultAssigned: 0,
      optimalAssigned: 0
    },
    {
      id: "SI-T4",
      name: "SI-T4",
      role: "SI",
      weeklyHours: 8,
      description: "T/Th Midday 12pm-4pm",
      defaultAssigned: 0,
      optimalAssigned: 0
    },
    {
      id: "SI-T5",
      name: "SI-T5",
      role: "SI",
      weeklyHours: 8,
      description: "M/W/T/Th Lunch Surge 12pm-2pm",
      defaultAssigned: 0,
      optimalAssigned: 2
    }
  ],

  initialTemplateAssignments: {
    "GA-T1": 1,
    "GA-T2": 1,
    "GA-T3": 0,
    "GA-T4": 0,
    "GA-T5": 0,
    "GA-T6": 0,
    "SI-T1": 0,
    "SI-T2": 0,
    "SI-T3": 0,
    "SI-T4": 0,
    "SI-T5": 0
  },

  optimalTemplateAssignments: {
    "GA-T1": 2,
    "GA-T2": 2,
    "GA-T3": 1,
    "GA-T4": 3,
    "GA-T5": 0,
    "GA-T6": 1,
    "SI-T1": 1,
    "SI-T2": 1,
    "SI-T3": 0,
    "SI-T4": 0,
    "SI-T5": 2
  },

  // --------------------------------------------------------------------------
  // 3. EXACT 36-HOUR BASELINE DATA (From Sheet 'Queueing_&_Schedule' R17:R52)
  // --------------------------------------------------------------------------
  erlangBaselineRows: [
  {
    "rowNum": 17,
    "day": "Monday",
    "hour": 8,
    "hourId": "08:00",
    "avgArrivals": 1.4286,
    "avgOccupancy": 0.55,
    "handRaiseLambda": 2.2,
    "minTutors": 1,
    "baselineScheduled": 1,
    "baselineRho": 0.11,
    "baselinePWait": 0.11,
    "baselineWq": 0.3708
  },
  {
    "rowNum": 18,
    "day": "Monday",
    "hour": 9,
    "hourId": "09:00",
    "avgArrivals": 0.8571,
    "avgOccupancy": 1.0952,
    "handRaiseLambda": 4.381,
    "minTutors": 1,
    "baselineScheduled": 1,
    "baselineRho": 0.219,
    "baselinePWait": 0.219,
    "baselineWq": 0.8415
  },
  {
    "rowNum": 19,
    "day": "Monday",
    "hour": 10,
    "hourId": "10:00",
    "avgArrivals": 1.4286,
    "avgOccupancy": 1.65,
    "handRaiseLambda": 6.6,
    "minTutors": 1,
    "baselineScheduled": 1,
    "baselineRho": 0.33,
    "baselinePWait": 0.33,
    "baselineWq": 1.4776
  },
  {
    "rowNum": 20,
    "day": "Monday",
    "hour": 11,
    "hourId": "11:00",
    "avgArrivals": 3.4286,
    "avgOccupancy": 2.0429,
    "handRaiseLambda": 8.1714,
    "minTutors": 1,
    "baselineScheduled": 1,
    "baselineRho": 0.4086,
    "baselinePWait": 0.4086,
    "baselineWq": 2.0725
  },
  {
    "rowNum": 21,
    "day": "Monday",
    "hour": 12,
    "hourId": "12:00",
    "avgArrivals": 9.7143,
    "avgOccupancy": 7.8762,
    "handRaiseLambda": 31.5048,
    "minTutors": 3,
    "baselineScheduled": 1,
    "baselineRho": 1.5752,
    "baselinePWait": 1.0,
    "baselineWq": 999.0
  },
  {
    "rowNum": 22,
    "day": "Monday",
    "hour": 13,
    "hourId": "13:00",
    "avgArrivals": 2.5714,
    "avgOccupancy": 8.5071,
    "handRaiseLambda": 34.0286,
    "minTutors": 3,
    "baselineScheduled": 1,
    "baselineRho": 1.7014,
    "baselinePWait": 1.0,
    "baselineWq": 999.0
  },
  {
    "rowNum": 23,
    "day": "Monday",
    "hour": 14,
    "hourId": "14:00",
    "avgArrivals": 1.7143,
    "avgOccupancy": 4.431,
    "handRaiseLambda": 17.7238,
    "minTutors": 2,
    "baselineScheduled": 1,
    "baselineRho": 0.8862,
    "baselinePWait": 0.8862,
    "baselineWq": 23.3598
  },
  {
    "rowNum": 24,
    "day": "Monday",
    "hour": 15,
    "hourId": "15:00",
    "avgArrivals": 1.4286,
    "avgOccupancy": 3.4429,
    "handRaiseLambda": 13.7714,
    "minTutors": 2,
    "baselineScheduled": 1,
    "baselineRho": 0.6886,
    "baselinePWait": 0.6886,
    "baselineWq": 6.633
  },
  {
    "rowNum": 25,
    "day": "Monday",
    "hour": 16,
    "hourId": "16:00",
    "avgArrivals": 0.8571,
    "avgOccupancy": 2.8405,
    "handRaiseLambda": 11.3619,
    "minTutors": 2,
    "baselineScheduled": 1,
    "baselineRho": 0.5681,
    "baselinePWait": 0.5681,
    "baselineWq": 3.946
  },
  {
    "rowNum": 26,
    "day": "Monday",
    "hour": 17,
    "hourId": "17:00",
    "avgArrivals": 1.1429,
    "avgOccupancy": 2.8738,
    "handRaiseLambda": 11.4952,
    "minTutors": 2,
    "baselineScheduled": 1,
    "baselineRho": 0.5748,
    "baselinePWait": 0.5748,
    "baselineWq": 4.0549
  },
  {
    "rowNum": 27,
    "day": "Tuesday",
    "hour": 8,
    "hourId": "08:00",
    "avgArrivals": 0.4286,
    "avgOccupancy": 0.119,
    "handRaiseLambda": 0.4762,
    "minTutors": 1,
    "baselineScheduled": 1,
    "baselineRho": 0.0238,
    "baselinePWait": 0.0238,
    "baselineWq": 0.0732
  },
  {
    "rowNum": 28,
    "day": "Tuesday",
    "hour": 9,
    "hourId": "09:00",
    "avgArrivals": 0.1429,
    "avgOccupancy": 0.1071,
    "handRaiseLambda": 0.4286,
    "minTutors": 1,
    "baselineScheduled": 1,
    "baselineRho": 0.0214,
    "baselinePWait": 0.0214,
    "baselineWq": 0.0657
  },
  {
    "rowNum": 29,
    "day": "Tuesday",
    "hour": 10,
    "hourId": "10:00",
    "avgArrivals": 2.8571,
    "avgOccupancy": 1.219,
    "handRaiseLambda": 4.8762,
    "minTutors": 1,
    "baselineScheduled": 1,
    "baselineRho": 0.2438,
    "baselinePWait": 0.2438,
    "baselineWq": 0.9673
  },
  {
    "rowNum": 30,
    "day": "Tuesday",
    "hour": 11,
    "hourId": "11:00",
    "avgArrivals": 5.1429,
    "avgOccupancy": 3.6333,
    "handRaiseLambda": 14.5333,
    "minTutors": 2,
    "baselineScheduled": 2,
    "baselineRho": 0.3633,
    "baselinePWait": 0.1937,
    "baselineWq": 0.4563
  },
  {
    "rowNum": 31,
    "day": "Tuesday",
    "hour": 12,
    "hourId": "12:00",
    "avgArrivals": 12.7143,
    "avgOccupancy": 12.081,
    "handRaiseLambda": 48.3238,
    "minTutors": 4,
    "baselineScheduled": 2,
    "baselineRho": 1.2081,
    "baselinePWait": 1.0,
    "baselineWq": 999.0
  },
  {
    "rowNum": 32,
    "day": "Tuesday",
    "hour": 13,
    "hourId": "13:00",
    "avgArrivals": 2.7143,
    "avgOccupancy": 14.1643,
    "handRaiseLambda": 56.6571,
    "minTutors": 4,
    "baselineScheduled": 1,
    "baselineRho": 2.8329,
    "baselinePWait": 1.0,
    "baselineWq": 999.0
  },
  {
    "rowNum": 33,
    "day": "Tuesday",
    "hour": 14,
    "hourId": "14:00",
    "avgArrivals": 1.0,
    "avgOccupancy": 4.7524,
    "handRaiseLambda": 19.0095,
    "minTutors": 2,
    "baselineScheduled": 1,
    "baselineRho": 0.9505,
    "baselinePWait": 0.9505,
    "baselineWq": 57.5769
  },
  {
    "rowNum": 34,
    "day": "Tuesday",
    "hour": 15,
    "hourId": "15:00",
    "avgArrivals": 1.2857,
    "avgOccupancy": 3.9762,
    "handRaiseLambda": 15.9048,
    "minTutors": 2,
    "baselineScheduled": 1,
    "baselineRho": 0.7952,
    "baselinePWait": 0.7952,
    "baselineWq": 11.6512
  },
  {
    "rowNum": 35,
    "day": "Wednesday",
    "hour": 8,
    "hourId": "08:00",
    "avgArrivals": 0.4,
    "avgOccupancy": 0.03,
    "handRaiseLambda": 0.12,
    "minTutors": 1,
    "baselineScheduled": 1,
    "baselineRho": 0.006,
    "baselinePWait": 0.006,
    "baselineWq": 0.0181
  },
  {
    "rowNum": 36,
    "day": "Wednesday",
    "hour": 9,
    "hourId": "09:00",
    "avgArrivals": 0.8,
    "avgOccupancy": 0.61,
    "handRaiseLambda": 2.44,
    "minTutors": 1,
    "baselineScheduled": 1,
    "baselineRho": 0.122,
    "baselinePWait": 0.122,
    "baselineWq": 0.4169
  },
  {
    "rowNum": 37,
    "day": "Wednesday",
    "hour": 10,
    "hourId": "10:00",
    "avgArrivals": 7.6,
    "avgOccupancy": 2.33,
    "handRaiseLambda": 9.32,
    "minTutors": 1,
    "baselineScheduled": 1,
    "baselineRho": 0.466,
    "baselinePWait": 0.466,
    "baselineWq": 2.618
  },
  {
    "rowNum": 38,
    "day": "Wednesday",
    "hour": 11,
    "hourId": "11:00",
    "avgArrivals": 9.2,
    "avgOccupancy": 5.0333,
    "handRaiseLambda": 20.1333,
    "minTutors": 2,
    "baselineScheduled": 1,
    "baselineRho": 1.0067,
    "baselinePWait": 1.0,
    "baselineWq": 999.0
  },
  {
    "rowNum": 39,
    "day": "Wednesday",
    "hour": 12,
    "hourId": "12:00",
    "avgArrivals": 12.4,
    "avgOccupancy": 9.18,
    "handRaiseLambda": 36.72,
    "minTutors": 3,
    "baselineScheduled": 1,
    "baselineRho": 1.836,
    "baselinePWait": 1.0,
    "baselineWq": 999.0
  },
  {
    "rowNum": 40,
    "day": "Wednesday",
    "hour": 13,
    "hourId": "13:00",
    "avgArrivals": 3.0,
    "avgOccupancy": 10.5033,
    "handRaiseLambda": 42.0133,
    "minTutors": 3,
    "baselineScheduled": 1,
    "baselineRho": 2.1007,
    "baselinePWait": 1.0,
    "baselineWq": 999.0
  },
  {
    "rowNum": 41,
    "day": "Wednesday",
    "hour": 14,
    "hourId": "14:00",
    "avgArrivals": 3.0,
    "avgOccupancy": 5.3133,
    "handRaiseLambda": 21.2533,
    "minTutors": 2,
    "baselineScheduled": 1,
    "baselineRho": 1.0627,
    "baselinePWait": 1.0,
    "baselineWq": 999.0
  },
  {
    "rowNum": 42,
    "day": "Wednesday",
    "hour": 15,
    "hourId": "15:00",
    "avgArrivals": 1.0,
    "avgOccupancy": 5.89,
    "handRaiseLambda": 23.56,
    "minTutors": 2,
    "baselineScheduled": 1,
    "baselineRho": 1.178,
    "baselinePWait": 1.0,
    "baselineWq": 999.0
  },
  {
    "rowNum": 43,
    "day": "Wednesday",
    "hour": 16,
    "hourId": "16:00",
    "avgArrivals": 0.8,
    "avgOccupancy": 4.2667,
    "handRaiseLambda": 17.0667,
    "minTutors": 2,
    "baselineScheduled": 1,
    "baselineRho": 0.8533,
    "baselinePWait": 0.8533,
    "baselineWq": 17.4546
  },
  {
    "rowNum": 44,
    "day": "Wednesday",
    "hour": 17,
    "hourId": "17:00",
    "avgArrivals": 0.2,
    "avgOccupancy": 1.25,
    "handRaiseLambda": 5.0,
    "minTutors": 1,
    "baselineScheduled": 1,
    "baselineRho": 0.25,
    "baselinePWait": 0.25,
    "baselineWq": 1.0
  },
  {
    "rowNum": 45,
    "day": "Thursday",
    "hour": 8,
    "hourId": "08:00",
    "avgArrivals": 1.0,
    "avgOccupancy": 0.6433,
    "handRaiseLambda": 2.5733,
    "minTutors": 1,
    "baselineScheduled": 1,
    "baselineRho": 0.1287,
    "baselinePWait": 0.1287,
    "baselineWq": 0.443
  },
  {
    "rowNum": 46,
    "day": "Thursday",
    "hour": 9,
    "hourId": "09:00",
    "avgArrivals": 0.4,
    "avgOccupancy": 0.6633,
    "handRaiseLambda": 2.6533,
    "minTutors": 1,
    "baselineScheduled": 1,
    "baselineRho": 0.1327,
    "baselinePWait": 0.1327,
    "baselineWq": 0.4589
  },
  {
    "rowNum": 47,
    "day": "Thursday",
    "hour": 10,
    "hourId": "10:00",
    "avgArrivals": 4.0,
    "avgOccupancy": 2.3267,
    "handRaiseLambda": 9.3067,
    "minTutors": 1,
    "baselineScheduled": 1,
    "baselineRho": 0.4653,
    "baselinePWait": 0.4653,
    "baselineWq": 2.611
  },
  {
    "rowNum": 48,
    "day": "Thursday",
    "hour": 11,
    "hourId": "11:00",
    "avgArrivals": 5.6,
    "avgOccupancy": 4.42,
    "handRaiseLambda": 17.68,
    "minTutors": 2,
    "baselineScheduled": 2,
    "baselineRho": 0.442,
    "baselinePWait": 0.271,
    "baselineWq": 0.7284
  },
  {
    "rowNum": 49,
    "day": "Thursday",
    "hour": 12,
    "hourId": "12:00",
    "avgArrivals": 10.6,
    "avgOccupancy": 12.8967,
    "handRaiseLambda": 51.5867,
    "minTutors": 4,
    "baselineScheduled": 2,
    "baselineRho": 1.2897,
    "baselinePWait": 1.0,
    "baselineWq": 999.0
  },
  {
    "rowNum": 50,
    "day": "Thursday",
    "hour": 13,
    "hourId": "13:00",
    "avgArrivals": 4.6,
    "avgOccupancy": 16.0,
    "handRaiseLambda": 64.0,
    "minTutors": 4,
    "baselineScheduled": 1,
    "baselineRho": 3.2,
    "baselinePWait": 1.0,
    "baselineWq": 999.0
  },
  {
    "rowNum": 51,
    "day": "Thursday",
    "hour": 14,
    "hourId": "14:00",
    "avgArrivals": 0.8,
    "avgOccupancy": 7.6833,
    "handRaiseLambda": 30.7333,
    "minTutors": 3,
    "baselineScheduled": 1,
    "baselineRho": 1.5367,
    "baselinePWait": 1.0,
    "baselineWq": 999.0
  },
  {
    "rowNum": 52,
    "day": "Thursday",
    "hour": 15,
    "hourId": "15:00",
    "avgArrivals": 1.0,
    "avgOccupancy": 4.85,
    "handRaiseLambda": 19.4,
    "minTutors": 2,
    "baselineScheduled": 1,
    "baselineRho": 0.97,
    "baselinePWait": 0.97,
    "baselineWq": 97.0
  }
],

  // --------------------------------------------------------------------------
  // 4. SQUARE-ROOT STAFFING LAW CHECK TABLE (Sheet 'Check_Erlang_C_sqrt')
  // --------------------------------------------------------------------------
  erlangSqrtCheckRows: [
  {
    "lambda": 20.0,
    "offeredLoad": 1.0,
    "minServersSqrt": 2,
    "scheduledServers": 2,
    "utilization": 0.5,
    "pWait": 0.3333,
    "wqMinutes": 1.0
  },
  {
    "lambda": 40.0,
    "offeredLoad": 2.0,
    "minServersSqrt": 4,
    "scheduledServers": 4,
    "utilization": 0.5,
    "pWait": 0.1739,
    "wqMinutes": 0.2609
  },
  {
    "lambda": 60.0,
    "offeredLoad": 3.0,
    "minServersSqrt": 5,
    "scheduledServers": 5,
    "utilization": 0.6,
    "pWait": 0.2362,
    "wqMinutes": 0.3542
  },
  {
    "lambda": 80.0,
    "offeredLoad": 4.0,
    "minServersSqrt": 6,
    "scheduledServers": 6,
    "utilization": 0.6667,
    "pWait": 0.2848,
    "wqMinutes": 0.4271
  },
  {
    "lambda": 100.0,
    "offeredLoad": 5.0,
    "minServersSqrt": 8,
    "scheduledServers": 8,
    "utilization": 0.625,
    "pWait": 0.1673,
    "wqMinutes": 0.1673
  },
  {
    "lambda": 120.0,
    "offeredLoad": 6.0,
    "minServersSqrt": 9,
    "scheduledServers": 9,
    "utilization": 0.6667,
    "pWait": 0.196,
    "wqMinutes": 0.196
  },
  {
    "lambda": 140.0,
    "offeredLoad": 7.0,
    "minServersSqrt": 10,
    "scheduledServers": 10,
    "utilization": 0.7,
    "pWait": 0.2217,
    "wqMinutes": 0.2217
  },
  {
    "lambda": 160.0,
    "offeredLoad": 8.0,
    "minServersSqrt": 11,
    "scheduledServers": 11,
    "utilization": 0.7273,
    "pWait": 0.245,
    "wqMinutes": 0.245
  },
  {
    "lambda": 180.0,
    "offeredLoad": 9.0,
    "minServersSqrt": 12,
    "scheduledServers": 12,
    "utilization": 0.75,
    "pWait": 0.266,
    "wqMinutes": 0.266
  },
  {
    "lambda": 200.0,
    "offeredLoad": 10.0,
    "minServersSqrt": 14,
    "scheduledServers": 14,
    "utilization": 0.7143,
    "pWait": 0.1741,
    "wqMinutes": 0.1306
  },
  {
    "lambda": 220.0,
    "offeredLoad": 11.0,
    "minServersSqrt": 15,
    "scheduledServers": 15,
    "utilization": 0.7333,
    "pWait": 0.1898,
    "wqMinutes": 0.1423
  },
  {
    "lambda": 240.0,
    "offeredLoad": 12.0,
    "minServersSqrt": 16,
    "scheduledServers": 16,
    "utilization": 0.75,
    "pWait": 0.2046,
    "wqMinutes": 0.1534
  },
  {
    "lambda": 260.0,
    "offeredLoad": 13.0,
    "minServersSqrt": 17,
    "scheduledServers": 17,
    "utilization": 0.7647,
    "pWait": 0.2185,
    "wqMinutes": 0.1639
  },
  {
    "lambda": 280.0,
    "offeredLoad": 14.0,
    "minServersSqrt": 18,
    "scheduledServers": 18,
    "utilization": 0.7778,
    "pWait": 0.2317,
    "wqMinutes": 0.1738
  },
  {
    "lambda": 300.0,
    "offeredLoad": 15.0,
    "minServersSqrt": 19,
    "scheduledServers": 19,
    "utilization": 0.7895,
    "pWait": 0.2442,
    "wqMinutes": 0.1832
  },
  {
    "lambda": 320.0,
    "offeredLoad": 16.0,
    "minServersSqrt": 20,
    "scheduledServers": 20,
    "utilization": 0.8,
    "pWait": 0.2561,
    "wqMinutes": 0.1921
  },
  {
    "lambda": 340.0,
    "offeredLoad": 17.0,
    "minServersSqrt": 22,
    "scheduledServers": 22,
    "utilization": 0.7727,
    "pWait": 0.181,
    "wqMinutes": 0.1086
  },
  {
    "lambda": 360.0,
    "offeredLoad": 18.0,
    "minServersSqrt": 23,
    "scheduledServers": 23,
    "utilization": 0.7826,
    "pWait": 0.1907,
    "wqMinutes": 0.1144
  },
  {
    "lambda": 380.0,
    "offeredLoad": 19.0,
    "minServersSqrt": 24,
    "scheduledServers": 24,
    "utilization": 0.7917,
    "pWait": 0.2001,
    "wqMinutes": 0.12
  },
  {
    "lambda": 400.0,
    "offeredLoad": 20.0,
    "minServersSqrt": 25,
    "scheduledServers": 25,
    "utilization": 0.8,
    "pWait": 0.2091,
    "wqMinutes": 0.1255
  },
  {
    "lambda": 420.0,
    "offeredLoad": 21.0,
    "minServersSqrt": 26,
    "scheduledServers": 26,
    "utilization": 0.8077,
    "pWait": 0.2178,
    "wqMinutes": 0.1307
  },
  {
    "lambda": 440.0,
    "offeredLoad": 22.0,
    "minServersSqrt": 27,
    "scheduledServers": 27,
    "utilization": 0.8148,
    "pWait": 0.2263,
    "wqMinutes": 0.1358
  },
  {
    "lambda": 460.0,
    "offeredLoad": 23.0,
    "minServersSqrt": 28,
    "scheduledServers": 28,
    "utilization": 0.8214,
    "pWait": 0.2344,
    "wqMinutes": 0.1406
  },
  {
    "lambda": 480.0,
    "offeredLoad": 24.0,
    "minServersSqrt": 29,
    "scheduledServers": 29,
    "utilization": 0.8276,
    "pWait": 0.2423,
    "wqMinutes": 0.1454
  },
  {
    "lambda": 500.0,
    "offeredLoad": 25.0,
    "minServersSqrt": 30,
    "scheduledServers": 30,
    "utilization": 0.8333,
    "pWait": 0.2499,
    "wqMinutes": 0.1499
  },
  {
    "lambda": 520.0,
    "offeredLoad": 26.0,
    "minServersSqrt": 32,
    "scheduledServers": 32,
    "utilization": 0.8125,
    "pWait": 0.1865,
    "wqMinutes": 0.0933
  },
  {
    "lambda": 540.0,
    "offeredLoad": 27.0,
    "minServersSqrt": 33,
    "scheduledServers": 33,
    "utilization": 0.8182,
    "pWait": 0.1931,
    "wqMinutes": 0.0965
  },
  {
    "lambda": 560.0,
    "offeredLoad": 28.0,
    "minServersSqrt": 34,
    "scheduledServers": 34,
    "utilization": 0.8235,
    "pWait": 0.1995,
    "wqMinutes": 0.0998
  },
  {
    "lambda": 580.0,
    "offeredLoad": 29.0,
    "minServersSqrt": 35,
    "scheduledServers": 35,
    "utilization": 0.8286,
    "pWait": 0.2058,
    "wqMinutes": 0.1029
  },
  {
    "lambda": 600.0,
    "offeredLoad": 30.0,
    "minServersSqrt": 36,
    "scheduledServers": 36,
    "utilization": 0.8333,
    "pWait": 0.2119,
    "wqMinutes": 0.1059
  },
  {
    "lambda": 620.0,
    "offeredLoad": 31.0,
    "minServersSqrt": 37,
    "scheduledServers": 37,
    "utilization": 0.8378,
    "pWait": 0.2179,
    "wqMinutes": 0.1089
  },
  {
    "lambda": 640.0,
    "offeredLoad": 32.0,
    "minServersSqrt": 38,
    "scheduledServers": 38,
    "utilization": 0.8421,
    "pWait": 0.2237,
    "wqMinutes": 0.1118
  },
  {
    "lambda": 660.0,
    "offeredLoad": 33.0,
    "minServersSqrt": 39,
    "scheduledServers": 39,
    "utilization": 0.8462,
    "pWait": 0.2294,
    "wqMinutes": 0.1147
  },
  {
    "lambda": 680.0,
    "offeredLoad": 34.0,
    "minServersSqrt": 40,
    "scheduledServers": 40,
    "utilization": 0.85,
    "pWait": 0.2349,
    "wqMinutes": 0.1175
  },
  {
    "lambda": 700.0,
    "offeredLoad": 35.0,
    "minServersSqrt": 41,
    "scheduledServers": 41,
    "utilization": 0.8537,
    "pWait": 0.2404,
    "wqMinutes": 0.1202
  },
  {
    "lambda": 720.0,
    "offeredLoad": 36.0,
    "minServersSqrt": 42,
    "scheduledServers": 42,
    "utilization": 0.8571,
    "pWait": 0.2457,
    "wqMinutes": 0.1228
  },
  {
    "lambda": 740.0,
    "offeredLoad": 37.0,
    "minServersSqrt": 44,
    "scheduledServers": 44,
    "utilization": 0.8409,
    "pWait": 0.1909,
    "wqMinutes": 0.0818
  },
  {
    "lambda": 760.0,
    "offeredLoad": 38.0,
    "minServersSqrt": 45,
    "scheduledServers": 45,
    "utilization": 0.8444,
    "pWait": 0.1957,
    "wqMinutes": 0.0839
  },
  {
    "lambda": 780.0,
    "offeredLoad": 39.0,
    "minServersSqrt": 46,
    "scheduledServers": 46,
    "utilization": 0.8478,
    "pWait": 0.2003,
    "wqMinutes": 0.0858
  },
  {
    "lambda": 800.0,
    "offeredLoad": 40.0,
    "minServersSqrt": 47,
    "scheduledServers": 47,
    "utilization": 0.8511,
    "pWait": 0.2049,
    "wqMinutes": 0.0878
  },
  {
    "lambda": 820.0,
    "offeredLoad": 41.0,
    "minServersSqrt": 48,
    "scheduledServers": 48,
    "utilization": 0.8542,
    "pWait": 0.2094,
    "wqMinutes": 0.0897
  },
  {
    "lambda": 840.0,
    "offeredLoad": 42.0,
    "minServersSqrt": 49,
    "scheduledServers": 49,
    "utilization": 0.8571,
    "pWait": 0.2138,
    "wqMinutes": 0.0916
  }
],

  // --------------------------------------------------------------------------
  // 5. MATH SUBJECTS TRACKED IN THE LAB
  // --------------------------------------------------------------------------
  subjects: [
    { id: "alg",   name: "College Algebra", short: "Algebra", color: "#3b82f6", courseCode: "MATH 111" },
    { id: "trig",  name: "Trigonometry",    short: "Trig",    color: "#f59e0b", courseCode: "MATH 112" },
    { id: "pre",   name: "Precalculus",     short: "Precalc", color: "#8b5cf6", courseCode: "MATH 115" },
    { id: "calc",  name: "Calculus I/II",   short: "Calculus",color: "#10b981", courseCode: "MATH 161" },
    { id: "stats", name: "Statistics",      short: "Stats",   color: "#ec4899", courseCode: "MATH 200" }
  ],

  // --------------------------------------------------------------------------
  // 6. TUTOR ROSTER (9 Graduate Assistants @ 20h + 4 Supplemental Instructors @ 8h)
  // --------------------------------------------------------------------------
  tutors: [
    { id: "ga-1", name: "Grad Assistant 1 (Alex)", role: "GA", tierLabel: "Graduate Assistant", contractHours: 20, monThuLabHours: 20, hourlyWage: 18.00, competencies: ["alg", "trig", "pre", "calc", "stats"], notes: "Full coverage; template GA-T1" },
    { id: "ga-2", name: "Grad Assistant 2 (Brianna)", role: "GA", tierLabel: "Graduate Assistant", contractHours: 20, monThuLabHours: 20, hourlyWage: 18.00, competencies: ["alg", "pre", "calc", "stats"], notes: "Specializes in Applied Stats; template GA-T2" },
    { id: "ga-3", name: "Grad Assistant 3 (Carlos)", role: "GA", tierLabel: "Graduate Assistant", contractHours: 20, monThuLabHours: 20, hourlyWage: 18.00, competencies: ["alg", "trig", "pre", "calc"], notes: "Trigonometry & Calculus; template GA-T3" },
    { id: "ga-4", name: "Grad Assistant 4 (Diana)", role: "GA", tierLabel: "Graduate Assistant", contractHours: 20, monThuLabHours: 20, hourlyWage: 18.00, competencies: ["alg", "trig", "stats"], notes: "Gateway courses specialist; template GA-T4" },
    { id: "ga-5", name: "Grad Assistant 5 (Ethan)", role: "GA", tierLabel: "Graduate Assistant", contractHours: 20, monThuLabHours: 20, hourlyWage: 18.00, competencies: ["alg", "calc", "stats"], notes: "Calculus lead; template GA-T4" },
    { id: "ga-6", name: "Grad Assistant 6 (Fiona)", role: "GA", tierLabel: "Graduate Assistant", contractHours: 20, monThuLabHours: 20, hourlyWage: 18.00, competencies: ["alg", "trig", "pre", "calc", "stats"], notes: "Senior GA; template GA-T4" },
    { id: "ga-7", name: "Grad Assistant 7 (Gabriel)", role: "GA", tierLabel: "Graduate Assistant", contractHours: 20, monThuLabHours: 20, hourlyWage: 18.00, competencies: ["alg", "pre", "calc"], notes: "Precalculus & Calculus; template GA-T1" },
    { id: "ga-8", name: "Grad Assistant 8 (Hannah)", role: "GA", tierLabel: "Graduate Assistant", contractHours: 20, monThuLabHours: 20, hourlyWage: 18.00, competencies: ["alg", "trig", "stats"], notes: "Trig & Stats focus; template GA-T2" },
    { id: "ga-9", name: "Grad Assistant 9 (Ian)", role: "GA", tierLabel: "Graduate Assistant", contractHours: 20, monThuLabHours: 20, hourlyWage: 18.00, competencies: ["alg", "trig", "pre", "calc", "stats"], notes: "Full STEM coverage; template GA-T6" },
    { id: "ug-donnie", name: "Donnie (SI Lead)", role: "SI", tierLabel: "Supplemental Instructor", contractHours: 8, monThuLabHours: 8, hourlyWage: 15.00, competencies: ["alg", "trig", "pre"], notes: "Assigned to peak template SI-T1" },
    { id: "ug-mariah", name: "Mariah (SI Lead)", role: "SI", tierLabel: "Supplemental Instructor", contractHours: 8, monThuLabHours: 8, hourlyWage: 15.00, competencies: ["alg", "trig", "stats"], notes: "Assigned to peak template SI-T2" },
    { id: "ug-taylor", name: "Taylor (SI Surge)", role: "SI", tierLabel: "Supplemental Instructor", contractHours: 8, monThuLabHours: 8, hourlyWage: 15.00, competencies: ["alg", "trig", "pre", "calc"], notes: "Assigned to lunch surge template SI-T5" },
    { id: "ug-joe", name: "Joe (SI Surge)", role: "SI", tierLabel: "Supplemental Instructor", contractHours: 8, monThuLabHours: 8, hourlyWage: 15.00, competencies: ["alg", "pre", "calc"], notes: "Assigned to lunch surge template SI-T5" }
  ],

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

  // --------------------------------------------------------------------------
  // 7. HOURLY STUDENT DEMAND (Arrivals & Occupancy from Workbook)
  // --------------------------------------------------------------------------
  hourlyArrivals: {
    "Monday": {
        "08:00": {
            "avgArrivals": 1.4286,
            "avgOccupancy": 0.55,
            "handRaiseLambda": 2.2,
            "minTutors": 1,
            "_total": 2.2
        },
        "09:00": {
            "avgArrivals": 0.8571,
            "avgOccupancy": 1.0952,
            "handRaiseLambda": 4.381,
            "minTutors": 1,
            "_total": 4.381
        },
        "10:00": {
            "avgArrivals": 1.4286,
            "avgOccupancy": 1.65,
            "handRaiseLambda": 6.6,
            "minTutors": 1,
            "_total": 6.6
        },
        "11:00": {
            "avgArrivals": 3.4286,
            "avgOccupancy": 2.0429,
            "handRaiseLambda": 8.1714,
            "minTutors": 1,
            "_total": 8.1714
        },
        "12:00": {
            "avgArrivals": 9.7143,
            "avgOccupancy": 7.8762,
            "handRaiseLambda": 31.5048,
            "minTutors": 3,
            "_total": 31.5048
        },
        "13:00": {
            "avgArrivals": 2.5714,
            "avgOccupancy": 8.5071,
            "handRaiseLambda": 34.0286,
            "minTutors": 3,
            "_total": 34.0286
        },
        "14:00": {
            "avgArrivals": 1.7143,
            "avgOccupancy": 4.431,
            "handRaiseLambda": 17.7238,
            "minTutors": 2,
            "_total": 17.7238
        },
        "15:00": {
            "avgArrivals": 1.4286,
            "avgOccupancy": 3.4429,
            "handRaiseLambda": 13.7714,
            "minTutors": 2,
            "_total": 13.7714
        },
        "16:00": {
            "avgArrivals": 0.8571,
            "avgOccupancy": 2.8405,
            "handRaiseLambda": 11.3619,
            "minTutors": 2,
            "_total": 11.3619
        },
        "17:00": {
            "avgArrivals": 1.1429,
            "avgOccupancy": 2.8738,
            "handRaiseLambda": 11.4952,
            "minTutors": 2,
            "_total": 11.4952
        }
    },
    "Tuesday": {
        "08:00": {
            "avgArrivals": 0.4286,
            "avgOccupancy": 0.119,
            "handRaiseLambda": 0.4762,
            "minTutors": 1,
            "_total": 0.4762
        },
        "09:00": {
            "avgArrivals": 0.1429,
            "avgOccupancy": 0.1071,
            "handRaiseLambda": 0.4286,
            "minTutors": 1,
            "_total": 0.4286
        },
        "10:00": {
            "avgArrivals": 2.8571,
            "avgOccupancy": 1.219,
            "handRaiseLambda": 4.8762,
            "minTutors": 1,
            "_total": 4.8762
        },
        "11:00": {
            "avgArrivals": 5.1429,
            "avgOccupancy": 3.6333,
            "handRaiseLambda": 14.5333,
            "minTutors": 2,
            "_total": 14.5333
        },
        "12:00": {
            "avgArrivals": 12.7143,
            "avgOccupancy": 12.081,
            "handRaiseLambda": 48.3238,
            "minTutors": 4,
            "_total": 48.3238
        },
        "13:00": {
            "avgArrivals": 2.7143,
            "avgOccupancy": 14.1643,
            "handRaiseLambda": 56.6571,
            "minTutors": 4,
            "_total": 56.6571
        },
        "14:00": {
            "avgArrivals": 1.0,
            "avgOccupancy": 4.7524,
            "handRaiseLambda": 19.0095,
            "minTutors": 2,
            "_total": 19.0095
        },
        "15:00": {
            "avgArrivals": 1.2857,
            "avgOccupancy": 3.9762,
            "handRaiseLambda": 15.9048,
            "minTutors": 2,
            "_total": 15.9048
        }
    },
    "Wednesday": {
        "08:00": {
            "avgArrivals": 0.4,
            "avgOccupancy": 0.03,
            "handRaiseLambda": 0.12,
            "minTutors": 1,
            "_total": 0.12
        },
        "09:00": {
            "avgArrivals": 0.8,
            "avgOccupancy": 0.61,
            "handRaiseLambda": 2.44,
            "minTutors": 1,
            "_total": 2.44
        },
        "10:00": {
            "avgArrivals": 7.6,
            "avgOccupancy": 2.33,
            "handRaiseLambda": 9.32,
            "minTutors": 1,
            "_total": 9.32
        },
        "11:00": {
            "avgArrivals": 9.2,
            "avgOccupancy": 5.0333,
            "handRaiseLambda": 20.1333,
            "minTutors": 2,
            "_total": 20.1333
        },
        "12:00": {
            "avgArrivals": 12.4,
            "avgOccupancy": 9.18,
            "handRaiseLambda": 36.72,
            "minTutors": 3,
            "_total": 36.72
        },
        "13:00": {
            "avgArrivals": 3.0,
            "avgOccupancy": 10.5033,
            "handRaiseLambda": 42.0133,
            "minTutors": 3,
            "_total": 42.0133
        },
        "14:00": {
            "avgArrivals": 3.0,
            "avgOccupancy": 5.3133,
            "handRaiseLambda": 21.2533,
            "minTutors": 2,
            "_total": 21.2533
        },
        "15:00": {
            "avgArrivals": 1.0,
            "avgOccupancy": 5.89,
            "handRaiseLambda": 23.56,
            "minTutors": 2,
            "_total": 23.56
        },
        "16:00": {
            "avgArrivals": 0.8,
            "avgOccupancy": 4.2667,
            "handRaiseLambda": 17.0667,
            "minTutors": 2,
            "_total": 17.0667
        },
        "17:00": {
            "avgArrivals": 0.2,
            "avgOccupancy": 1.25,
            "handRaiseLambda": 5.0,
            "minTutors": 1,
            "_total": 5.0
        }
    },
    "Thursday": {
        "08:00": {
            "avgArrivals": 1.0,
            "avgOccupancy": 0.6433,
            "handRaiseLambda": 2.5733,
            "minTutors": 1,
            "_total": 2.5733
        },
        "09:00": {
            "avgArrivals": 0.4,
            "avgOccupancy": 0.6633,
            "handRaiseLambda": 2.6533,
            "minTutors": 1,
            "_total": 2.6533
        },
        "10:00": {
            "avgArrivals": 4.0,
            "avgOccupancy": 2.3267,
            "handRaiseLambda": 9.3067,
            "minTutors": 1,
            "_total": 9.3067
        },
        "11:00": {
            "avgArrivals": 5.6,
            "avgOccupancy": 4.42,
            "handRaiseLambda": 17.68,
            "minTutors": 2,
            "_total": 17.68
        },
        "12:00": {
            "avgArrivals": 10.6,
            "avgOccupancy": 12.8967,
            "handRaiseLambda": 51.5867,
            "minTutors": 4,
            "_total": 51.5867
        },
        "13:00": {
            "avgArrivals": 4.6,
            "avgOccupancy": 16.0,
            "handRaiseLambda": 64.0,
            "minTutors": 4,
            "_total": 64.0
        },
        "14:00": {
            "avgArrivals": 0.8,
            "avgOccupancy": 7.6833,
            "handRaiseLambda": 30.7333,
            "minTutors": 3,
            "_total": 30.7333
        },
        "15:00": {
            "avgArrivals": 1.0,
            "avgOccupancy": 4.85,
            "handRaiseLambda": 19.4,
            "minTutors": 2,
            "_total": 19.4
        }
    }
},

  // --------------------------------------------------------------------------
  // 8. CURRENT / INITIAL SCHEDULE TUTORS BY HOUR (Workbook Baseline)
  // --------------------------------------------------------------------------
  currentScheduleTutorsByHour: {
    "Monday": {
        "08:00": [
            "ga-1"
        ],
        "09:00": [
            "ga-1"
        ],
        "10:00": [
            "ga-1"
        ],
        "11:00": [
            "ga-1"
        ],
        "12:00": [
            "ga-1"
        ],
        "13:00": [
            "ga-2"
        ],
        "14:00": [
            "ga-2"
        ],
        "15:00": [
            "ga-2"
        ],
        "16:00": [
            "ga-2"
        ],
        "17:00": [
            "ga-2"
        ]
    },
    "Tuesday": {
        "08:00": [
            "ga-1"
        ],
        "09:00": [
            "ga-1"
        ],
        "10:00": [
            "ga-1"
        ],
        "11:00": [
            "ga-1",
            "ga-2"
        ],
        "12:00": [
            "ga-1",
            "ga-2"
        ],
        "13:00": [
            "ga-2"
        ],
        "14:00": [
            "ga-2"
        ],
        "15:00": [
            "ga-2"
        ]
    },
    "Wednesday": {
        "08:00": [
            "ga-1"
        ],
        "09:00": [
            "ga-1"
        ],
        "10:00": [
            "ga-1"
        ],
        "11:00": [
            "ga-1"
        ],
        "12:00": [
            "ga-1"
        ],
        "13:00": [
            "ga-2"
        ],
        "14:00": [
            "ga-2"
        ],
        "15:00": [
            "ga-2"
        ],
        "16:00": [
            "ga-2"
        ],
        "17:00": [
            "ga-2"
        ]
    },
    "Thursday": {
        "08:00": [
            "ga-1"
        ],
        "09:00": [
            "ga-1"
        ],
        "10:00": [
            "ga-1"
        ],
        "11:00": [
            "ga-1",
            "ga-2"
        ],
        "12:00": [
            "ga-1",
            "ga-2"
        ],
        "13:00": [
            "ga-2"
        ],
        "14:00": [
            "ga-2"
        ],
        "15:00": [
            "ga-2"
        ]
    }
},

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

