#!/usr/bin/env python3
"""
Generates MATH319_Math_Lab_Dashboard_User_Guide.pdf
A complete, plain-English step-by-step guide explaining every single feature,
slider, button, chart, table, and mathematical model in the dashboard.
"""
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)

OUT_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "MATH319_Math_Lab_Dashboard_User_Guide.pdf"
)

def build_pdf():
    doc = SimpleDocTemplate(
        OUT_PATH,
        pagesize=letter,
        leftMargin=0.6 * inch,
        rightMargin=0.6 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
        title="MATH 319 Math Lab Dashboard - Complete Plain-English User Guide",
        author="Yusuf Osuntuyi",
    )

    styles = getSampleStyleSheet()

    # Custom color palette
    navy = colors.HexColor("#0F172A")
    blue = colors.HexColor("#1D4ED8")
    light_blue = colors.HexColor("#EFF6FF")
    border_blue = colors.HexColor("#BFDBFE")
    emerald = colors.HexColor("#047857")
    light_emerald = colors.HexColor("#ECFDF5")
    slate = colors.HexColor("#334155")
    muted = colors.HexColor("#64748B")

    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=19,
        leading=23,
        textColor=navy,
        alignment=0,
        spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=muted,
        spaceAfter=10,
    )
    h1_style = ParagraphStyle(
        "SectionH1",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=blue,
        spaceBefore=12,
        spaceAfter=5,
        keepWithNext=True,
    )
    body_style = ParagraphStyle(
        "BodyPlain",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13.5,
        textColor=slate,
        spaceAfter=5,
    )
    bullet_style = ParagraphStyle(
        "BulletPlain",
        parent=body_style,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=3.5,
    )
    callout_style = ParagraphStyle(
        "CalloutText",
        parent=body_style,
        fontName="Helvetica",
        fontSize=9.3,
        leading=13,
        textColor=navy,
        spaceAfter=0,
    )
    table_header_style = ParagraphStyle(
        "TblHeader",
        parent=body_style,
        fontName="Helvetica-Bold",
        fontSize=9.0,
        leading=12,
        textColor=colors.white,
    )
    table_cell_style = ParagraphStyle(
        "TblCell",
        parent=body_style,
        fontName="Helvetica",
        fontSize=8.8,
        leading=12.2,
        textColor=slate,
        spaceAfter=0,
    )
    table_cell_bold = ParagraphStyle(
        "TblCellBold",
        parent=table_cell_style,
        fontName="Helvetica-Bold",
        textColor=navy,
    )

    def make_callout(text, bg=light_blue, border=border_blue):
        t = Table([[Paragraph(text, callout_style)]], colWidths=[7.3 * inch])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), bg),
            ("BOX", (0, 0), (-1, -1), 1, border),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ]))
        return t

    def make_feature_table(rows, col_widths=(2.15 * inch, 5.15 * inch)):
        data = [[
            Paragraph("Feature / Button / Control", table_header_style),
            Paragraph("What It Does in Plain English &amp; How to Use It", table_header_style)
        ]]
        for name, desc in rows:
            data.append([
                Paragraph(name, table_cell_bold),
                Paragraph(desc, table_cell_style)
            ])
        t = Table(data, colWidths=list(col_widths), repeatRows=1)
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), navy),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 5.5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5.5),
        ]))
        return t

    story = []

    # HEADER BLOCK
    story.append(Paragraph("Math Lab Staffing &amp; Student Flow Dashboard", title_style))
    story.append(Paragraph(
        "<b>Complete Plain-English User Guide</b> &bull; Course: MATH 319 (Mathematical Modeling) &bull; Author: Yusuf Osuntuyi<br/>"
        "<b>Live Web Link:</b> <font color='#1D4ED8'>https://yusuf-osuntuyi.github.io/math319-math-lab-dashboard/</font>",
        subtitle_style
    ))
    story.append(HRFlowable(width="100%", thickness=1.5, color=blue, spaceAfter=8))

    # SECTION 1: THE BIG PICTURE
    story.append(Paragraph("1. The Big Picture: What Does This Website Do?", h1_style))
    story.append(Paragraph(
        "Think of the university Math Lab like a grocery store checkout area or a busy highway:",
        body_style
    ))
    story.append(Paragraph(
        "&bull; <b>The Problem (\"What Happened This Semester\"):</b> Student traffic comes in big waves right after "
        "math lectures let out (for example, a huge wave of Trigonometry students at <b>10:00 AM</b> and a big rush between "
        "<b>1:00 PM and 4:00 PM</b>). However, the old tutor schedule kept roughly the same number of tutors on duty all day. "
        "During quiet hours, tutors sat idle; during rush hours, tutors were overwhelmed, wait times jumped over 18+ minutes, "
        "and students left without enough \"eyes on their work.\"",
        bullet_style
    ))
    story.append(Paragraph(
        "&bull; <b>The Solution (\"What Could Have Happened\"):</b> Without spending an extra dollar or hiring extra staff, "
        "this dashboard uses a smart math scheduling engine to move existing tutor hours out of empty time slots and into "
        "the exact hours (and exact math subjects) where students actually need help.",
        bullet_style
    ))
    story.append(Spacer(1, 3))
    story.append(make_callout(
        "<b>Key Rule Built Into the Dashboard:</b> One tutor can only work <b>1 man-hour per 1-hour shift</b>, and every "
        "tutor has a strict weekly hour limit (20 hrs/wk for the 6 Graduate Assistants; 10 hrs/wk for Donnie, Mariah, and Taylor; "
        "8 hrs/wk for Joe and student workers). The dashboard never breaks these rules."
    ))

    # SECTION 2: TOP HEADER & NAVIGATION BAR
    story.append(Paragraph("2. The Top Navigation Bar &amp; Action Buttons", h1_style))
    story.append(Paragraph(
        "At the very top of the page, you will see the project title, 4 navigation tabs in the middle, and 2 action buttons on the far right:",
        body_style
    ))
    header_rows = [
        ("4 Navigation Tabs\n(Overview, Schedule, 4-Hr Prototype, Edit Data)",
         "Click any of these 4 buttons to switch screens. You never lose your work when switching tabs—all 4 tabs stay connected to the same live numbers."),
        ("Light Mode / Dark Mode Button\n(Top Right)",
         "Switches the background between Dark Mode (great for laptop screens) and Light Mode (great for classroom projectors or printing screenshots)."),
        ("Save data.js Button\n(Green Button, Top Right)",
         "Downloads your current numbers as a file named <b>data.js</b>. Use this whenever you edit tutor hours or student counts and want to save your changes permanently."),
    ]
    story.append(make_feature_table(header_rows))

    # SECTION 3: THE GLOBAL SCENARIO & SENSITIVITY RIBBON
    story.append(Paragraph("3. The Control Strip: \"What-If\" Sliders, Objectives &amp; Presets", h1_style))
    story.append(Paragraph(
        "Right underneath the top header is a control bar that stays visible on every tab. Moving any slider or menu here "
        "instantly recalculates every graph, waiting line, and schedule across the entire website:",
        body_style
    ))
    control_rows = [
        ("Traffic Surge (λt) Slider\n[-20% to +50%]",
         "<b>Plain English:</b> \"What if more (or fewer) students walk into the Math Lab?\"<br/>"
         "Slide it right to <b>+30%</b> to simulate a busy Midterm Exam week. Slide it left to <b>-15%</b> to simulate a quiet week."),
        ("Session Length (1/μ) Slider\n[12 min to 35 min]",
         "<b>Plain English:</b> \"How many minutes does it take a tutor to help one student?\"<br/>"
         "At the default <b>20 minutes</b>, 1 tutor can help <b>3 students per hour</b> (60 &divide; 20 = 3). If you slide this up to "
         "<b>30 minutes</b> (harder homework), each tutor can only help <b>2 students per hour</b>, so waiting lines grow faster."),
        ("Budget / Hour Trim Slider\n[-20% to +35%]",
         "<b>Plain English:</b> \"What if the university cuts our tutoring budget?\"<br/>"
         "Slide this to <b>15%</b> or <b>25%</b> to force the scheduler to cut weekly tutor hours. It automatically trims hours from "
         "the quietest times first so students feel as little disruption as possible."),
        ("Nudge Peak to Quiet Hrs\n[0% to 30%]",
         "<b>Plain English:</b> \"What if professors convince some afternoon students to visit during quiet morning hours instead?\"<br/>"
         "Sliding this to <b>15%</b> moves 15% of the crowded peak-hour traffic into quieter morning slots, showing how much wait time drops for free."),
        ("Optimization Objective Dropdown\n(3 Modes)",
         "Changes the computer's main goal when building the schedule:<br/>"
         "1. <b>Maximize Ratio &amp; Competency Match (Full Roster):</b> Uses all available staff hours to keep lines short and match subjects.<br/>"
         "2. <b>Strict Subject Spike Coverage (10am Trig / 1–4pm):</b> Prioritizes putting Trigonometry and Calculus tutors on duty right when those specific classes let out.<br/>"
         "3. <b>Minimize Weekly Cost (Subject to Wait &le; 8m):</b> Uses the fewest paid hours possible while still keeping average wait times under 8 minutes."),
        ("Preset Pills\n(5 Quick Buttons)",
         "One-click shortcuts on the right side of the control bar (<b>Baseline Semester</b>, <b>+30% Midterm Rush</b>, "
         "<b>30-Min Sessions</b>, <b>-15% Budget Cut</b>, <b>15% Quiet-Hour Nudge</b>). Click any pill during a presentation to jump straight to that scenario; click <b>Baseline Semester</b> to reset all sliders back to normal."),
    ]
    story.append(make_feature_table(control_rows))

    # SECTION 4: TAB 1 EXPLAINED
    story.append(Paragraph("4. Tab 1: \"Overview &amp; Proposal Graphs\" Explained", h1_style))
    story.append(Paragraph(
        "This first tab is your executive summary. It compares the old static schedule against the new optimized schedule using "
        "5 headline scorecards and 4 visual graphs.",
        body_style
    ))
    tab1_rows = [
        ("Blue Insight Banner &amp;\n\"View Day\" Dropdown",
         "At the top of Tab 1, a blue banner summarizes the exact improvement in plain sentences (how much wait time dropped and how many "
         "more students got help). On the right side of that banner, use the <b>View Day</b> dropdown to look at the <b>Weekly Average (Mon–Thu)</b> "
         "or zoom into <b>Monday, Tuesday, Wednesday, or Thursday</b>."),
        ("Card 1: Peak Hour Student Wait Time",
         "Shows the worst-case waiting time during the busiest rush hour. Under the old schedule, students waited ~18+ minutes; "
         "under the optimized schedule, wait time drops below the 8–10 minute target."),
        ("Card 2: Students-to-Tutor Ratio (Peak)",
         "Shows how many students a single tutor has to juggle at once during peak hours. The green badge shows the new ratio getting "
         "as close as possible to the ideal <b>3:1 ratio</b> (3 students per 1 tutor)."),
        ("Card 3: \"Eyes on Work\" — Overlooked Students",
         "Counts how many student visits per week happen when tutors are either completely swamped OR when no tutor on duty knows the student's "
         "math subject (like Trigonometry or Statistics). Lower is better!"),
        ("Card 4: 10:00 AM Trig Spike Coverage",
         "Specifically checks the <b>10:00 AM hour</b> (when Trigonometry lectures let out) and shows how many Trig-qualified tutors are on duty "
         "in the Optimized schedule versus the old schedule."),
        ("Card 5: Weekly Payroll &amp; Staff Utilization",
         "Shows the total weekly cost in dollars and how many Mon–Thu lab hours are scheduled out of your total staff pool."),
        ("Graph 1: Hourly Student Inflow vs. Tutoring Capacity",
         "<b>How to read it:</b><br/>"
         "&bull; <b>Stacked Colored Bars:</b> How many students walk in each hour, color-coded by subject (Blue = Algebra, Orange = Trig, Purple = Precalc, Green = Calculus, Pink = Stats).<br/>"
         "&bull; <b>Red Dashed Line:</b> How many students the <i>Old Schedule</i> could serve per hour.<br/>"
         "&bull; <b>Green Solid Line:</b> How many students the <i>Optimized Schedule</i> can serve per hour.<br/>"
         "<i>Simple takeaway:</i> Whenever the bars poke above the red line (like at 10 AM and 1–3 PM), a backlog forms. The green line rises to cover those peaks!"),
        ("Graph 2: Simulated Student Wait Time by Hour",
         "<b>How to read it:</b><br/>"
         "&bull; <b>Red Curve:</b> Wait time (in minutes) by hour under the old schedule—notice how it snowballs in the afternoon like a highway traffic jam.<br/>"
         "&bull; <b>Green Curve:</b> Wait time under the optimized schedule—staying flat and fast.<br/>"
         "&bull; <b>Yellow Dashed Line:</b> The 8-minute maximum wait-time goal."),
        ("Graph 3: Trade-Off Frontier (Budget vs. Wait Time)",
         "<b>How to read it:</b><br/>"
         "Plots Weekly Payroll Cost (bottom axis) against Average Wait Time (left axis). Moving from left to right shows that spending a little more "
         "money dramatically cuts wait times at first, until the curve flattens out (diminishing returns). The <b>green dot</b> marks your current scenario."),
        ("Graph 4: \"Eyes on Work\" — Overlooked Students",
         "<b>How to read it:</b><br/>"
         "Side-by-side red bars (Old Schedule) vs. green bars (Optimized Schedule) showing how many students each hour are left waiting without a tutor "
         "or missing a subject-qualified tutor."),
    ]
    story.append(make_feature_table(tab1_rows))

    # SECTION 5: TAB 2 EXPLAINED
    story.append(Paragraph("5. Tab 2: \"What Happened vs. Optimized\" Explained", h1_style))
    story.append(Paragraph(
        "This tab shows the actual hour-by-hour work schedule for every single tutor on your team (the 6 Graduate Assistants, "
        "Donnie, Mariah, Taylor, Joe, and student workers) and lets you manually tweak shifts with a click.",
        body_style
    ))
    tab2_rows = [
        ("Select Day Dropdown\n(Monday – Thursday)",
         "Pick which day of the week you want to inspect or edit."),
        ("Side-by-Side Comparison Table",
         "For every hour block from <b>9:00–10:00 AM</b> through <b>4:00–5:00 PM</b>, each row shows:<br/>"
         "1. <b>Class Release Driver:</b> Which lectures just dismissed (e.g., <i>10 AM Trig Wave</i>).<br/>"
         "2. <b>Arrivals (λt):</b> Total students arriving and a breakdown by subject.<br/>"
         "3. <b>What Happened (Current):</b> How many tutors were actually there, the student-to-tutor ratio, and the wait time.<br/>"
         "4. <b>What Could Have Happened (Optimized):</b> The new tutor count, improved ratio, new wait time, and clickable tutor name badges."),
        ("Interactive Tutor Chips\n(Click Any Name Badge!)",
         "In the far-right column, every tutor is shown as a small pill/button:<br/>"
         "&bull; <b>Highlighted Badge:</b> That tutor is <b>ON DUTY</b> during that hour.<br/>"
         "&bull; <b>Dimmed / Faded Badge:</b> That tutor is <b>OFF DUTY</b> during that hour.<br/>"
         "<b>Try clicking any tutor's name!</b> Clicking toggles them on or off for that hour and immediately updates all wait times and ratios so you can test custom schedule tweaks by hand."),
        ("Re-Run ILP Optimizer Button",
         "If you clicked around to test manual tutor swaps and want the computer to rebuild the mathematically best schedule again, click this blue button."),
        ("Staff Roster Utilization Table\n(Bottom Card)",
         "Lists every tutor on your roster, their tier (GA vs. Undergrad), their total contract hours (e.g., 20h, 10h, 8h), their Mon–Thu lab cap, "
         "how many hours they are currently assigned, their hourly wage, which math subjects they can teach, and a green <b>Within Cap</b> status badge."),
    ]
    story.append(make_feature_table(tab2_rows))

    # SECTION 6: TAB 3 EXPLAINED
    story.append(Paragraph("6. Tab 3: \"4-Hr Prototype &amp; ILP Math\" Explained", h1_style))
    story.append(Paragraph(
        "This tab opens the hood on the math models required by the MATH 319 proposal so you can explain the equations clearly during your presentation.",
        body_style
    ))
    tab3_rows = [
        ("Stage 2: The Queue Formula\nW(t+1) = max(0, W(t) + Arrivals - μ·x(t))",
         "<b>Plain-English Meaning:</b> Think of the Math Lab waiting line like a bathtub:<br/>"
         "&bull; <b>W(t)</b> is how many students were already waiting left over from last hour.<br/>"
         "&bull; <b>+ Arrivals(t)</b> is how many new students walk in the door this hour.<br/>"
         "&bull; <b>&minus; μ &middot; x(t)</b> is how many students get helped and leave this hour (number of tutors <i>x</i> multiplied by how many students each tutor helps per hour <i>μ</i>).<br/>"
         "&bull; <b>max(0, ...)</b> simply means a waiting line can never be negative (if tutors can help 15 students and only 10 show up, the leftover line is 0, not &minus;5)."),
        ("Day &amp; 4-Hour Window Dropdowns",
         "Choose any day (Monday–Thursday) and switch between the <b>12:00 PM – 4:00 PM Afternoon Rush</b> (from your proposal) or the "
         "<b>9:00 AM – 1:00 PM Morning Window</b> (which includes the 10:00 AM Trigonometry spike)."),
        ("Live Sandbox: Test Custom Tutors (xt) Input Boxes",
         "In the far-right column of the Stage 2 table, you will see blue number boxes where you can type any number of tutors (1, 2, 3, 4, 5...) "
         "for each hour block. As soon as you change a number, watch the equation right next to it recalculate the exact leftover student line <b>W(t+1)</b>!"),
        ("Stage 3: Integer Linear Programming (ILP) Card",
         "Explains how the computer solves the puzzle:<br/>"
         "&bull; <b>Binary Variable y(i,d,t) in {0, 1}:</b> A fancy math way of saying a tutor is either working that hour (<b>1</b>) or not working that hour (<b>0</b>)—no one can work \"2 hours inside 1 hour.\"<br/>"
         "&bull; <b>Dual Objectives:</b> Minimize waiting lines/overlooked students AND keep payroll costs efficient.<br/>"
         "&bull; <b>4 Constraints:</b> Keep wait times under 8–10 minutes, obey everyone's weekly hour limits, match tutor subjects to student subjects, and stay within room limits."),
        ("Class Schedule Release Drivers Table",
         "Shows the real-world reason why traffic spikes happen: lists the exact lecture dismissal times (like 9:50 AM Trigonometry and 12:50 PM Algebra/Calc) "
         "and shows how each dismissal creates a wave of students walking into the Math Lab 5–10 minutes later."),
    ]
    story.append(make_feature_table(tab3_rows))

    # SECTION 7: TAB 4 EXPLAINED
    story.append(Paragraph("7. Tab 4: \"Edit Data, Roster &amp; Excel Import\" Explained", h1_style))
    story.append(Paragraph(
        "This tab turns the dashboard into a long-term tool that the Math Lab can continue using next semester or next year. "
        "Every number in the dashboard can be edited right here:",
        body_style
    ))
    tab4_rows = [
        ("Upload Excel (.xlsx) / CSV / JSON Button",
         "Click this button to upload your Excel participation tracker (such as <i>Copy of Math Lab Participation Tracker 2026-2027.xlsx</i>) or a CSV/JSON file. "
         "The dashboard reads the spreadsheet and updates the arrival numbers automatically."),
        ("Download Updated data.js Button",
         "Downloads a fresh copy of <b>data.js</b> containing all the edits you made in the tables below."),
        ("Export Full Report (.xlsx) Button",
         "Generates and downloads a complete Microsoft Excel spreadsheet (<b>Math319_Math_Lab_Optimization_Report.xlsx</b>) with two clean sheets: "
         "<i>Schedule_Comparison</i> (every hour's old vs. new numbers and assigned tutors) and <i>Tutor_Roster</i> (pay, hours, and subjects)."),
        ("Reset to Default Baseline Button",
         "Erases any custom edits stored in your browser and restores the original Fall 2026 baseline data."),
        ("Table 1: Edit Tutor Roster &amp; Subject Checkboxes",
         "&bull; Type directly into any box to change a tutor's <b>Name</b>, <b>Role/Tier</b>, <b>Total Weekly Contract Hours</b>, <b>Mon–Thu Lab Cap</b>, or <b>Hourly Wage ($)</b>.<br/>"
         "&bull; Check or uncheck the subject boxes (<b>College Algebra, Trigonometry, Precalculus, Calculus, Statistics</b>) to change which subjects each tutor is qualified to help with.<br/>"
         "&bull; Click <b>+ Add New Tutor</b> to add a new hire, or click the red <b>X</b> button on the right to remove a tutor."),
        ("Table 2: Edit Hourly Student Arrivals by Day &amp; Subject",
         "Use the <b>Edit Day</b> dropdown (Monday–Thursday) to pick a day, then type directly into any cell to change how many students arrive "
         "for each math subject during each hour from 9:00 AM to 4:00 PM."),
    ]
    story.append(make_feature_table(tab4_rows))

    # SECTION 8: HOW SAVING WORKS
    story.append(Paragraph("8. How Saving Works: Your Browser vs. Your Live Website", h1_style))
    story.append(make_callout(
        "<b>1. Automatic Browser Save (Instant):</b> Every time you edit a tutor or arrival number in Tab 4, your browser automatically "
        "saves those changes in its own memory (<i>localStorage</i>). Even if you refresh the page, your browser remembers your edits.<br/><br/>"
        "<b>2. Updating the Live Website for Other People (3 Simple Steps):</b> Because browser memory only lives on <i>your</i> computer, "
        "if you want your professor or classmates visiting <b>https://yusuf-osuntuyi.github.io/math319-math-lab-dashboard/</b> to see your new numbers:<br/>"
        "&nbsp;&nbsp;&bull; <b>Step 1:</b> Click the green <b>Save data.js</b> button in the top-right corner of the dashboard.<br/>"
        "&nbsp;&nbsp;&bull; <b>Step 2:</b> Move that downloaded <b>data.js</b> file into your project folder (replacing the old <b>data.js</b>).<br/>"
        "&nbsp;&nbsp;&bull; <b>Step 3:</b> Push the update to GitHub (or ask Antigravity: <i>\"Push my updated data.js to GitHub\"</i>).",
        bg=light_emerald,
        border=emerald
    ))

    doc.build(story)
    print(f"Generated PDF: {OUT_PATH} ({os.path.getsize(OUT_PATH):,} bytes)")

if __name__ == "__main__":
    build_pdf()
