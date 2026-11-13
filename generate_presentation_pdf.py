#!/usr/bin/env python3
"""
Generates MATH319_5Min_Presentation_Slides_and_Script.pdf
A 6-slide widescreen/landscape presentation deck + 2-page minute-by-minute
speaker script & live demo cue sheet for the 5-minute MATH 319 class presentation.
"""
import os
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
)

OUT_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "MATH319_5Min_Presentation_Slides_and_Script.pdf"
)

def build_presentation_pdf():
    doc = SimpleDocTemplate(
        OUT_PATH,
        pagesize=landscape(letter),
        leftMargin=0.65 * inch,
        rightMargin=0.65 * inch,
        topMargin=0.55 * inch,
        bottomMargin=0.55 * inch,
        title="MATH 319 - 5-Minute Presentation Slides & Speaker Script",
        author="Yusuf Osuntuyi",
    )

    styles = getSampleStyleSheet()

    navy = colors.HexColor("#0F172A")
    blue = colors.HexColor("#1D4ED8")
    light_blue = colors.HexColor("#EFF6FF")
    border_blue = colors.HexColor("#93C5FD")
    emerald = colors.HexColor("#047857")
    light_emerald = colors.HexColor("#ECFDF5")
    rose = colors.HexColor("#BE123C")
    light_rose = colors.HexColor("#FFF1F2")
    amber = colors.HexColor("#B45309")
    light_amber = colors.HexColor("#FFFBEB")
    slate = colors.HexColor("#1E293B")
    muted = colors.HexColor("#64748B")

    slide_tag = ParagraphStyle(
        "SlideTag",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        textColor=blue,
        spaceAfter=4,
    )
    slide_title = ParagraphStyle(
        "SlideTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=29,
        textColor=navy,
        alignment=0,
        spaceAfter=6,
    )
    slide_subtitle = ParagraphStyle(
        "SlideSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=12.5,
        leading=17,
        textColor=muted,
        spaceAfter=12,
    )
    slide_body = ParagraphStyle(
        "SlideBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=12.5,
        leading=18,
        textColor=slate,
        spaceAfter=8,
    )
    slide_bullet = ParagraphStyle(
        "SlideBullet",
        parent=slide_body,
        leftIndent=18,
        firstLineIndent=-12,
        spaceAfter=7,
    )
    box_title = ParagraphStyle(
        "BoxTitle",
        parent=slide_body,
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=navy,
        spaceAfter=4,
    )
    box_text = ParagraphStyle(
        "BoxText",
        parent=slide_body,
        fontName="Helvetica",
        fontSize=11.5,
        leading=16,
        textColor=slate,
        spaceAfter=0,
    )
    cue_style = ParagraphStyle(
        "CueBar",
        parent=slide_body,
        fontName="Helvetica-Bold",
        fontSize=10.5,
        leading=14,
        textColor=navy,
        spaceAfter=0,
    )
    tbl_hdr = ParagraphStyle(
        "TblHdr",
        parent=slide_body,
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=14,
        textColor=colors.white,
    )
    tbl_cell = ParagraphStyle(
        "TblCell",
        parent=slide_body,
        fontName="Helvetica",
        fontSize=10.8,
        leading=14.5,
        textColor=slate,
        spaceAfter=0,
    )
    tbl_cell_bold = ParagraphStyle(
        "TblCellBold",
        parent=tbl_cell,
        fontName="Helvetica-Bold",
        textColor=navy,
    )

    def make_speaker_footer(time_label, say_text, click_text):
        content = (
            f"<b>[{time_label}] LIVE DEMO CUE:</b> {click_text}<br/>"
            f"<b>WHAT TO SAY:</b> <i>\"{say_text}\"</i>"
        )
        t = Table([[Paragraph(content, cue_style)]], colWidths=[9.7 * inch])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), light_amber),
            ("BOX", (0, 0), (-1, -1), 1.2, colors.HexColor("#F59E0B")),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ]))
        return t

    story = []

    # =========================================================================
    # SLIDE 1: TITLE & THE PROBLEM ("WHAT HAPPENED THIS SEMESTER")
    # =========================================================================
    story.append(Paragraph("SLIDE 1 OF 6 &bull; TIME: 0:00 – 0:45 (45 SECONDS)", slide_tag))
    story.append(Paragraph("Optimizing University Math Lab Staffing &amp; Student Flow", slide_title))
    story.append(Paragraph(
        "<b>MATH 319: Mathematical Modeling (Fall 2026)</b> &bull; Presenter: <b>Yusuf Osuntuyi</b><br/>"
        "Live Interactive Model: <font color='#1D4ED8'>https://yusuf-osuntuyi.github.io/math319-math-lab-dashboard/</font>",
        slide_subtitle
    ))
    story.append(HRFlowable(width="100%", thickness=2, color=blue, spaceAfter=14))

    col_data_1 = [[
        Paragraph(
            "<b>The Problem: \"What Happened This Semester\"</b><br/><br/>"
            "&bull; <b>486 student visits/week</b> (Mon–Thu, 9 AM – 5 PM), but arrivals come in sharp waves right after lectures dismiss.<br/>"
            "&bull; <b>10:00 AM Trigonometry Spike:</b> Lecture lets out at 9:50 AM &rarr; sudden surge of Trig students.<br/>"
            "&bull; <b>1:00 – 4:00 PM Afternoon Rush:</b> Heavy back-to-back waves across Algebra, Precalc, Calc &amp; Stats.<br/>"
            "&bull; <b>Static Staffing Failure:</b> Keeping ~5–6 tutors flat all day wastes <b>39 idle tutor-hours</b> in quiet mornings while afternoon wait times hit <b>35 minutes</b>!",
            box_text
        ),
        Paragraph(
            "<b>The Goal: \"What Could Have Happened\"</b><br/><br/>"
            "&bull; Use the <b>exact same tutor roster</b>—no extra hiring required:<br/>"
            "&nbsp;&nbsp;&ndash; <b>6 Graduate Assistants (GAs):</b> 20 hrs/wk contract<br/>"
            "&nbsp;&nbsp;&ndash; <b>Donnie, Mariah, Taylor:</b> 10 hrs/wk each<br/>"
            "&nbsp;&nbsp;&ndash; <b>Joe &amp; Student Workers:</b> 8 hrs/wk each<br/>"
            "&bull; Enforce strict real-world rules: <b>max 1 man-hour per shift</b> and match tutor <b>subject competencies</b>.<br/>"
            "&bull; Maximize \"eyes on student work\" (target &le; 3:1 ratio and &le; 8 min wait).",
            box_text
        )
    ]]
    t1 = Table(col_data_1, colWidths=[4.75 * inch, 4.75 * inch])
    t1.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), light_rose),
        ("BACKGROUND", (1, 0), (1, 0), light_emerald),
        ("BOX", (0, 0), (0, 0), 1.2, rose),
        ("BOX", (1, 0), (1, 0), 1.2, emerald),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
    ]))
    story.append(t1)
    story.append(Spacer(1, 14))
    story.append(make_speaker_footer(
        "0:00 – 0:45",
        "Hi everyone, my project models staffing and student flow in our university Math Lab. This semester, 486 students visited per week between Monday and Thursday, but they don't arrive evenly—they arrive in big waves right when lectures let out, especially the 10 AM Trigonometry rush and the 1 to 4 PM afternoon rush. Because our old schedule kept staffing flat all day, tutors sat idle in quiet hours while peak wait times hit 35 minutes. My goal was to prove what COULD have happened using our exact same staff—6 GAs, Donnie, Mariah, Taylor, Joe, and student workers—just by mathematically rearranging their shifts.",
        "Open Tab 1 (Overview & Proposal Graphs) on the projector screen."
    ))

    story.append(PageBreak())

    # =========================================================================
    # SLIDE 2: THE 4-STAGE MATHEMATICAL MODEL (QUEUE RECURRENCE & ILP)
    # =========================================================================
    story.append(Paragraph("SLIDE 2 OF 6 &bull; TIME: 0:45 – 1:45 (60 SECONDS)", slide_tag))
    story.append(Paragraph("How the Math Works: Queue Recurrence &amp; Integer Programming", slide_title))
    story.append(Paragraph(
        "Connecting discrete dynamical systems (how lines build up) with operations research (how to assign shifts)",
        slide_subtitle
    ))
    story.append(HRFlowable(width="100%", thickness=2, color=blue, spaceAfter=12))

    math_rows = [
        ["Stage 1: Arrival & Service Rates",
         "• Hourly student inflow λ(d,t,s) tracked by Day (d), Hour (t), and Subject (s in {Alg, Trig, Precalc, Calc, Stats}).\n"
         "• Average session length 1/μ = 18–20 min  =>  Each tutor serves μ = 3.0 to 3.33 students per hour."],
        ["Stage 2: Dynamic Queue Equation\n(The 'Bathtub' Recurrence)",
         "W(t+1) = max( 0,  W(t) + Arrivals(t) - μ · x(t) )\n"
         "• In plain English: Next hour's waiting line equals leftover waiting students W(t), plus new arrivals, minus students helped by x(t) tutors. If demand exceeds capacity at 1 PM, that backlog snowballs into 2 PM and 3 PM!"],
        ["Stage 3: Binary ILP Optimizer\n(Assigning Named Tutors)",
         "• Binary Decision Variable: y(i,d,t) in {0, 1}  =>  1 if tutor i works day d, hour t; 0 otherwise.\n"
         "• Enforces that 1 tutor = at most 1 man-hour per shift (x(d,t) = Sum of y(i,d,t)).\n"
         "• Obeys weekly hour caps (20h GAs; 10h Donnie/Mariah/Taylor; 8h Joe/SWs) and Subject Competency matching."],
    ]
    t2_data = [[Paragraph("Model Stage", tbl_hdr), Paragraph("Plain-English Mathematical Meaning", tbl_hdr)]]
    for r in math_rows:
        t2_data.append([Paragraph(r[0], tbl_cell_bold), Paragraph(r[1].replace("\n", "<br/>"), tbl_cell)])
    t2 = Table(t2_data, colWidths=[2.8 * inch, 6.9 * inch])
    t2.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), navy),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, light_blue]),
        ("GRID", (0, 0), (-1, -1), 0.6, border_blue),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
    ]))
    story.append(t2)
    story.append(Spacer(1, 14))
    story.append(make_speaker_footer(
        "0:45 – 1:45",
        "Click Tab 3 (4-Hr Prototype & ILP Math). Our model has three core stages. First, we measure hourly student arrivals by subject and tutor service rate—about 3 students per tutor per hour. Second, we model the waiting line using a discrete recurrence relation: next hour's backlog W(t+1) equals the current line W(t) plus new arrivals minus the students our tutors can serve. Watch what happens when I type a different number of tutors into this live sandbox box—the queue equation updates immediately. Third, we use Integer Linear Programming with a binary 0-or-1 variable for every tutor so nobody works more than 1 man-hour per shift or exceeds their weekly contract.",
        "Switch to Tab 3 ('4-Hr Prototype & ILP Math'). Change a number in the blue 'Test Custom Tutors (xt)' box to show the equation updating live."
    ))

    story.append(PageBreak())

    # =========================================================================
    # SLIDE 3: RESULTS — WHAT HAPPENED VS. WHAT COULD HAVE HAPPENED
    # =========================================================================
    story.append(Paragraph("SLIDE 3 OF 6 &bull; TIME: 1:45 – 3:00 (75 SECONDS)", slide_tag))
    story.append(Paragraph("Baseline vs. Optimized Results (Same Tutor Roster!)", slide_title))
    story.append(Paragraph(
        "By shifting hours from empty slots into the 10 AM Trig spike &amp; 1–4 PM rush, wait times drop by 81%",
        slide_subtitle
    ))
    story.append(HRFlowable(width="100%", thickness=2, color=blue, spaceAfter=12))

    kpi_rows = [
        ["Performance Metric (Mon–Thu Lab)", "What Happened (Current)", "What Could Have Happened (ILP)", "Net Improvement"],
        ["Average Student Wait Time", "26.6 minutes", "5.0 minutes", "-21.6 min (-81% faster)"],
        ["Peak Rush-Hour Wait Time", "35.0 minutes", "5.5 minutes", "Stays well under 8-min goal!"],
        ["Overlooked / Queue-Swamped Visits", "389 visits/week", "0 visits/week", "100% 'Eyes on Work'"],
        ["Subject-Unmatched Visits (e.g. 10 AM Trig)", "57 students/week", "0 students/week", "100% Subject Competency Match"],
        ["Idle / Wasted Tutor Hours", "39 hours/week", "8 hours/week", "31 idle hours redeployed to peaks"],
        ["Weekly Tutor Hours Used (Mon–Thu)", "171 hours", "174 hours", "Same staff pool, 100% contract compliant"],
    ]
    t3_data = [[Paragraph(c, tbl_hdr) for c in kpi_rows[0]]]
    for r in kpi_rows[1:]:
        t3_data.append([
            Paragraph(r[0], tbl_cell_bold),
            Paragraph(f"<font color='#BE123C'><b>{r[1]}</b></font>", tbl_cell),
            Paragraph(f"<font color='#047857'><b>{r[2]}</b></font>", tbl_cell),
            Paragraph(f"<b>{r[3]}</b>", tbl_cell),
        ])
    t3 = Table(t3_data, colWidths=[3.1 * inch, 2.0 * inch, 2.3 * inch, 2.3 * inch])
    t3.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), navy),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ("GRID", (0, 0), (-1, -1), 0.6, colors.HexColor("#CBD5E1")),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(t3)
    story.append(Spacer(1, 12))
    story.append(make_speaker_footer(
        "1:45 – 3:00",
        "Let's look at Tab 1 (Overview Graphs). In Graph 1, the colored bars show students arriving by subject, and the red dashed line is our old staffing capacity. Notice how at 10 AM and 1 to 4 PM, arrivals shoot way above the red line—creating the 35-minute traffic jam shown in red on Graph 2. Now look at the green line: our ILP optimizer redeploys 31 wasted morning tutor-hours directly into those peak waves. Average wait time drops from 26.6 minutes down to 5 minutes, peak wait time stays at 5.5 minutes, and overlooked or subject-unmatched students drop to zero.",
        "Switch back to Tab 1 ('Overview & Proposal Graphs') and point to Graph 1 (Inflow vs Capacity) and Graph 2 (Simulated Wait Time)."
    ))

    story.append(PageBreak())

    # =========================================================================
    # SLIDE 4: NAMED ROSTER SCHEDULE & SUBJECT COMPETENCY COVERAGE
    # =========================================================================
    story.append(Paragraph("SLIDE 4 OF 6 &bull; TIME: 3:00 – 3:50 (50 SECONDS)", slide_tag))
    story.append(Paragraph("Actionable Schedule: Every Tutor Assigned by Hour &amp; Subject", slide_title))
    story.append(Paragraph(
        "Solving the 10:00 AM Trigonometry spike while respecting every GA &amp; undergraduate hour limit",
        slide_subtitle
    ))
    story.append(HRFlowable(width="100%", thickness=2, color=blue, spaceAfter=12))

    roster_Bullets = [
        "&bull; <b>Fixing the 10:00 AM Trigonometry Spike:</b> Right after the 9:50 AM Trig lecture dismisses, the optimizer schedules Trig-qualified GAs alongside <b>Donnie</b> and <b>Mariah</b> so every Trigonometry student gets immediate subject-qualified help.",
        "&bull; <b>Covering the 1:00 – 4:00 PM Multi-Course Wave:</b> Scales staffing up to 7–9 tutors during peak afternoon hours, pairing Calculus/Statistics specialists (<b>GA-1, GA-2, Taylor, Joe</b>) with Algebra/Precalc tutors.",
        "&bull; <b>100% Contract Compliance:</b> At the bottom of Tab 2, the utilization table verifies that all 6 GAs stay within their Mon–Thu lab cap (16h Mon–Thu + 4h Fri = 20h), Donnie/Mariah/Taylor work 10h, and Joe works 8h.",
        "&bull; <b>Live Interactive Override:</b> Coordinators can click any tutor badge (e.g., <i>Donnie</i> or <i>GA-3</i>) to manually toggle a shift on or off and watch the wait time and student-to-tutor ratio recalculate instantly."
    ]
    for b in roster_Bullets:
        story.append(Paragraph(b, slide_bullet))

    story.append(Spacer(1, 14))
    story.append(make_speaker_footer(
        "3:00 – 3:50",
        "If we click Tab 2 ('What Happened vs. Optimized'), this isn't just an abstract math formula—it builds the actual Monday-through-Thursday shift calendar for every named tutor. At 10 AM, when the Trigonometry class lets out, it automatically schedules Trig-qualified tutors like Donnie, Mariah, and our GAs. Even better, if a coordinator wants to swap someone's shift, I can click any tutor's badge right here on screen to toggle them on or off, and the wait time recalculates live. And the bottom table proves no one exceeds their 20, 10, or 8-hour weekly contract.",
        "Switch to Tab 2 ('What Happened vs. Optimized'). Click one tutor badge (like Donnie) to show live manual toggling, then click 'Re-Run ILP Optimizer'."
    ))

    story.append(PageBreak())

    # =========================================================================
    # SLIDE 5: SENSITIVITY ANALYSIS ("WHAT-IF" STRESS TESTING)
    # =========================================================================
    story.append(Paragraph("SLIDE 5 OF 6 &bull; TIME: 3:50 – 4:30 (40 SECONDS)", slide_tag))
    story.append(Paragraph("Stage 4: Sensitivity Analysis &amp; Budget Trade-Off Frontier", slide_title))
    story.append(Paragraph(
        "Testing how the schedule holds up under Midterm Surges, 30-Minute Sessions, and University Budget Cuts",
        slide_subtitle
    ))
    story.append(HRFlowable(width="100%", thickness=2, color=blue, spaceAfter=12))

    sens_rows = [
        ["Scenario (Top Control Ribbon)", "What We Change in the Model", "Key Finding / Policy Recommendation"],
        ["+30% Midterm Exam Rush\n(Preset Pill 2)",
         "Increases arrival rate λ(t) by +30% across all hours.",
         "Static schedule collapses (>45 min wait). Optimized schedule absorbs the surge first; if wait exceeds 10m, shows exact peak hours needing 1 extra floater."],
        ["Longer 30-Min Sessions\n(Preset Pill 3)",
         "Increases session duration 1/μ from 20 min to 30 min (μ drops to 2.0/hr).",
         "Service capacity drops by 33%. Recommends pairing group-table tutoring for students working on the same homework assignment."],
        ["-15% Budget / Hour Trim\n(Preset Pill 4 & Graph 3)",
         "Trims total weekly tutor hours by 15% along the Pareto Frontier.",
         "Trims quiet morning/late-afternoon hours first so peak wait times barely move, proving where budget cuts hurt least."],
        ["15% Quiet-Hour Nudge\n(Preset Pill 5)",
         "Shifts 15% of 1–3 PM peak arrivals into quieter morning hours.",
         "Completely free policy: professors announcing 'visit before noon for zero wait' cuts peak congestion without spending $1."],
    ]
    t5_data = [[Paragraph(c, tbl_hdr) for c in sens_rows[0]]]
    for r in sens_rows[1:]:
        t5_data.append([Paragraph(r[0], tbl_cell_bold), Paragraph(r[1], tbl_cell), Paragraph(r[2], tbl_cell)])
    t5 = Table(t5_data, colWidths=[2.3 * inch, 3.0 * inch, 4.4 * inch])
    t5.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), navy),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, light_blue]),
        ("GRID", (0, 0), (-1, -1), 0.6, border_blue),
        ("LEFTPADDING", (0, 0), (-1, -1), 9),
        ("RIGHTPADDING", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.append(t5)
    story.append(Spacer(1, 12))
    story.append(make_speaker_footer(
        "3:50 – 4:30",
        "To test how robust our model is, I built a live sensitivity ribbon at the top. If I click '+30% Midterm Rush' or '-15% Budget Cut', the optimizer re-solves in real time. Graph 3 on Tab 1 shows our Pareto Trade-Off Frontier: if the university cuts our budget, the model trims hours from the quietest morning slots first so peak wait times stay protected. And if professors nudge just 15% of afternoon students into quiet morning hours, peak congestion drops for free.",
        "Click the '+30% Midterm Rush' preset pill, then '-15% Budget Cut', then click 'Baseline Semester' to reset."
    ))

    story.append(PageBreak())

    # =========================================================================
    # SLIDE 6: LONG-TERM TOOL FOR FUTURE SEMESTERS & CONCLUSION
    # =========================================================================
    story.append(Paragraph("SLIDE 6 OF 6 &bull; TIME: 4:30 – 5:00 (30 SECONDS)", slide_tag))
    story.append(Paragraph("Built for the Future: Live Excel Import &amp; Next-Semester Studio", slide_title))
    story.append(Paragraph(
        "A permanent, reusable decision-support web app for the Math Department",
        slide_subtitle
    ))
    story.append(HRFlowable(width="100%", thickness=2, color=blue, spaceAfter=12))

    col_data_6 = [[
        Paragraph(
            "<b>Why This Model Lasts Beyond Fall 2026 (Tab 4):</b><br/><br/>"
            "&bull; <b>Direct Excel (.xlsx) Upload:</b> Next semester, the coordinator can upload the new <i>Math Lab Participation Tracker.xlsx</i> directly in the browser.<br/>"
            "&bull; <b>Editable Tutor Roster:</b> When GAs graduate or new undergrads are hired, anyone can edit tutor names, hour caps, wages, or subject checkboxes with zero coding.<br/>"
            "&bull; <b>One-Click Excel Report Export:</b> Exports a ready-to-print 2-sheet Excel workbook (<i>Schedule_Comparison</i> &amp; <i>Tutor_Roster</i>).",
            box_text
        ),
        Paragraph(
            "<b>Final Takeaway for MATH 319:</b><br/><br/>"
            "&bull; <b>Same Staff, 81% Less Waiting:</b> Cut average wait time from <b>26.6 min &rarr; 5.0 min</b> and peak wait from <b>35 min &rarr; 5.5 min</b>.<br/>"
            "&bull; <b>100% Engagement &amp; Subject Match:</b> Eliminated all 389 overlooked student visits and covered the 10 AM Trig spike.<br/>"
            "&bull; <b>Live on the Web:</b> Anyone can test scenarios right now at:<br/>"
            "<font color='#1D4ED8'><b>yusuf-osuntuyi.github.io/math319-math-lab-dashboard/</b></font>",
            box_text
        )
    ]]
    t6 = Table(col_data_6, colWidths=[4.75 * inch, 4.75 * inch])
    t6.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), light_blue),
        ("BACKGROUND", (1, 0), (1, 0), light_emerald),
        ("BOX", (0, 0), (0, 0), 1.2, blue),
        ("BOX", (1, 0), (1, 0), 1.2, emerald),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 14),
        ("RIGHTPADDING", (0, 0), (-1, -1), 14),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
    ]))
    story.append(t6)
    story.append(Spacer(1, 14))
    story.append(make_speaker_footer(
        "4:30 – 5:00",
        "Finally, on Tab 4, I designed this website so the Math Lab can actually use it every semester after I graduate. When next semester's class schedule comes out, the coordinator can upload the new Excel participation tracker, check off which subjects each new tutor knows, and click 'Export Full Report (.xlsx)' to get a finished schedule in seconds. Without spending an extra dollar, mathematical modeling cut wait times by 81% and gave every student eyes on their work. Thank you—I'd love to take any questions!",
        "Switch to Tab 4 ('Edit Data, Roster & Excel Import'), point to 'Upload Excel' and the tutor subject checkboxes, and conclude!"
    ))

    story.append(PageBreak())

    # =========================================================================
    # PAGE 7: 1-PAGE PRINTABLE PODIUM CHEAT SHEET (5-MINUTE SCRIPT AT A GLANCE)
    # =========================================================================
    story.append(Paragraph("PODIUM CHEAT SHEET &bull; PRINT THIS single PAGE FOR YOUR PRESENTATION", slide_tag))
    story.append(Paragraph("5-Minute Presentation Script &amp; Click-by-Click Demo Guide", ParagraphStyle(
        "CheatTitle", parent=slide_title, fontSize=20, leading=24, spaceAfter=4
    )))
    story.append(HRFlowable(width="100%", thickness=1.5, color=navy, spaceAfter=6))

    cheat_cell = ParagraphStyle("CheatCell", parent=tbl_cell, fontSize=9.2, leading=12.2)
    cheat_bold = ParagraphStyle("CheatBold", parent=tbl_cell_bold, fontSize=9.2, leading=12.2)
    cheat_hdr = ParagraphStyle("CheatHdr", parent=tbl_hdr, fontSize=9.5, leading=12.5)

    script_rows = [
        ["Time Block", "What to Click on Your Website", "Exact Words to Say (Plain, Confident & Natural)"],
        ["0:00 – 0:45\n(45 sec)\nThe Problem",
         "Open live site on Tab 1:\nyusuf-osuntuyi.github.io/math319-math-lab-dashboard/",
         "\"Hi everyone. My project models staffing and student flow in the Math Lab. This semester we had 486 student visits per week Mon–Thu, but students arrive in big waves right after lectures dismiss—especially the 10 AM Trigonometry spike and the 1 to 4 PM afternoon rush. Because our old schedule kept tutor counts flat all day, 39 tutor-hours were wasted in quiet mornings while afternoon wait times hit 35 minutes. I modeled what COULD have happened using our exact same staff pool—6 GAs, Donnie, Mariah, Taylor, Joe, and student workers.\""],
        ["0:45 – 1:45\n(60 sec)\nThe Math Model",
         "Click Tab 3:\n'4-Hr Prototype & ILP Math'\nType '6' in a blue sandbox box.",
         "\"Here on Tab 3 is the math behind the dashboard. First, each tutor serves about 3 students per hour. Second, we model the waiting line like a bathtub using a discrete recurrence equation: next hour's waiting line W(t+1) equals the current line W(t), plus new arrivals, minus students helped. If I type a new tutor count into this blue sandbox box, watch the queue equation recalculate live. Third, our Integer Linear Program uses a binary 0-or-1 variable so no tutor works more than 1 man-hour per shift or breaks their weekly hour limit.\""],
        ["1:45 – 3:00\n(75 sec)\nKey Results",
         "Click Tab 1:\n'Overview & Proposal Graphs'\nPoint to Graph 1 & Graph 2.",
         "\"Switching back to Tab 1, look at Graph 1. The stacked bars are student arrivals by subject, and the red dashed line is old capacity—every time bars poke above the red line, a backlog forms. The green line is our optimized schedule: it moves 31 idle morning hours into the 10 AM and afternoon rushes. As you can see in Graph 2 and the top cards, average wait time drops 81%—from 26.6 minutes down to 5 minutes—peak wait stays at 5.5 minutes, and overlooked students drop from 389 to zero.\""],
        ["3:00 – 3:50\n(50 sec)\nThe Schedule",
         "Click Tab 2:\n'What Happened vs. Optimized'\nClick a tutor badge, then click 'Re-Run ILP Optimizer'.",
         "\"On Tab 2, the model generates the actual hour-by-hour schedule for every tutor. At 10 AM, it puts Trig-qualified tutors like Donnie, Mariah, and our GAs on duty for the Trig wave. It's also interactive: I can click any tutor's name badge right here to manually toggle their shift on or off, and the ratios update live. And the bottom table proves every GA stays within 20 hours and every undergrad stays within 10 or 8 hours.\""],
        ["3:50 – 4:30\n(40 sec)\nWhat-If Tests",
         "Use the Top Control Bar:\nClick '+30% Midterm Rush', then '-15% Budget Cut', then 'Baseline Semester'.",
         "\"Using the top control bar, we can stress-test the lab. Clicking '+30% Midterm Rush' or '-15% Budget Cut' re-solves the model instantly. If the budget is cut, it trims quiet hours first so peak wait times stay safe. And if professors nudge just 15% of peak students into quiet morning hours, congestion drops for free.\""],
        ["4:30 – 5:00\n(30 sec)\nFuture Use",
         "Click Tab 4:\n'Edit Data, Roster & Excel Import'",
         "\"Finally, on Tab 4, I built this so the Math Lab can use it every semester. Next semester, they can upload their new Excel tracker, check off which subjects new tutors teach, and export a finished Excel schedule in one click. Thank you—I'm happy to answer any questions!\""],
    ]
    t7_data = [[Paragraph(c, cheat_hdr) for c in script_rows[0]]]
    for r in script_rows[1:]:
        t7_data.append([
            Paragraph(r[0], cheat_bold),
            Paragraph(r[1].replace("\n", "<br/>"), cheat_bold),
            Paragraph(r[2], cheat_cell),
        ])
    t7 = Table(t7_data, colWidths=[1.2 * inch, 2.3 * inch, 6.2 * inch])
    t7.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), navy),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ("GRID", (0, 0), (-1, -1), 0.6, colors.HexColor("#CBD5E1")),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(t7)

    doc.build(story)
    print(f"Generated Presentation PDF: {OUT_PATH} ({os.path.getsize(OUT_PATH):,} bytes)")

if __name__ == "__main__":
    build_presentation_pdf()
