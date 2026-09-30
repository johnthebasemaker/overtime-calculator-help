---
format: 1080x1920
duration: 134s
message: "Enter your salary once and your hours each day, and the app works out your pay the way your company does."
arc: Promise → Salary & hours → Import → History & payslip → End of Service → Settings → Close
audience: workers using the Overtime Calculator app
mode: collaborative
---

## Changes from v1

- "change the figures to 2,000 + 400" (sample salary: basic 2,000, food allowance 400; SAR 14.17 an hour).

## Locked

- Layouts, copy and seams of every frame, confirmed by the user: "All other things are okay, you can build the motion".

## Frame 1 — Your pay, your company's way

- scene: "Overtime Calculator" then "Your pay, worked out the way your company does it." over the phone
- duration: 5s
- transition_in: cut
- status: built
- blueprint: kinetic-type-beats (Reproduce)
- voiceover: "This is Overtime Calculator. It works out your pay the way your company does, and it all stays on your phone."
- src: compositions/frames/01-open.html

## Frame 2 — Chapter 1: Salary and hours

- scene: Chapter card "1 · Salary and hours"
- duration: 2.5s
- transition_in: cut
- status: built
- blueprint: titlecard-reveal (Reproduce)
- voiceover: ""
- src: compositions/frames/02-ch1.html

## Frame 3 — Your salary, once

- scene: The salary card: type Basic pay 2,000 and Food allowance 400; the amber ring clears; the total updates
- duration: 9s
- transition_in: crossfade
- status: built
- blueprint: device-surface-showcase (Adapt: static phone hold, typing into the card)
- voiceover: "Start at the top. Enter your basic pay and food allowance once. The app carries them to every month."
- src: compositions/frames/03-salary.html

## Frame 4 — The month and its overtime

- scene: Month worked picker; the overtime stepper moves by half hours; the pay at the top updates
- duration: 9s
- transition_in: cut
- status: built
- blueprint: panel-edit-live-sync (Adapt: the stepper is the control, the pay figure is the bound surface)
- voiceover: "Pick the month you worked. If you know your overtime, type it in, or tap plus and minus half an hour at a time."
- src: compositions/frames/04-month.html

## Frame 5 — Day by day

- scene: Day sheet calendar; tap a day; hours 11 : minutes 47; the sum "11:47 − 1:00 lunch − 8:00 = 2:47"; Next moves on
- duration: 12s
- transition_in: crossfade
- status: built
- blueprint: cursor-ui-demo (Adapt: tap ring, keyboard Next)
- voiceover: "Or count it day by day. Enter your time at work, lunch included. The app takes lunch off and counts everything past nine hours. Next moves you to the next day."
- src: compositions/frames/05-day-sheet.html

## Frame 6 — What each day means

- scene: Five chips assemble with one line each: Normal, Friday, Holiday, Absent, Medical leave
- duration: 8s
- transition_in: cut
- status: built
- blueprint: grid-card-assemble (Reproduce: vertical list)
- voiceover: "On a Friday or a holiday, everything after lunch is overtime. Absent is deducted. Medical leave is paid, with no overtime."
- src: compositions/frames/06-day-types.html

## Frame 7 — Chapter 2: Import your attendance

- scene: Chapter card "2 · Import your attendance"
- duration: 2.5s
- transition_in: cut
- status: built
- blueprint: titlecard-reveal (Reproduce)
- voiceover: ""
- src: compositions/frames/07-ch2.html

## Frame 8 — Import in one go

- scene: Import → screenshots → "Matches the report ✓" → Fill in; a note: "Full steps: the Import video"
- duration: 10s
- transition_in: crossfade
- status: built
- blueprint: device-surface-showcase (Adapt: cursorless flow inside the held phone)
- voiceover: "Faster still: screenshot your attendance report and import it. The app checks it against the report's totals. The Import video shows every step."
- src: compositions/frames/08-import.html

## Frame 9 — Chapter 3: History and your payslip

- scene: Chapter card "3 · History and your payslip"
- duration: 2.5s
- transition_in: cut
- status: built
- blueprint: titlecard-reveal (Reproduce)
- voiceover: ""
- src: compositions/frames/09-ch3.html

## Frame 10 — A finished month files itself

- scene: The popup "August saved to History" with Undo; the History tab shows the month
- duration: 8s
- transition_in: crossfade
- status: built
- blueprint: cta-morph-press (Adapt: popup springs, Undo shown)
- voiceover: "When every day of a month is filled in, it saves itself to History. Change a day later, and History follows."
- src: compositions/frames/10-history.html

## Frame 11 — Check your payslip

- scene: A month card: enter what was paid; the difference appears; the note "August overtime is paid with September's salary"
- duration: 10s
- transition_in: cut
- status: built
- blueprint: panel-edit-live-sync (Adapt: paid figure typed, difference updates)
- voiceover: "When your payslip arrives, enter what you were paid. The app shows any difference, and reminds you that overtime comes with the next month's salary."
- src: compositions/frames/11-payslip.html

## Frame 12 — Your year at a glance

- scene: The year summary: overtime earned, still unpaid, and "hours of the 720-hour yearly limit"; PDF and spreadsheet icons
- duration: 7s
- transition_in: cut
- status: built
- blueprint: dataviz-countup (Adapt: count-up the year's overtime hours)
- voiceover: "Each year adds up your overtime against the legal limit of 720 hours, and any month can be shared as a PDF."
- src: compositions/frames/12-year.html

## Frame 13 — Chapter 4: End of Service

- scene: Chapter card "4 · End of Service"
- duration: 2.5s
- transition_in: cut
- status: built
- blueprint: titlecard-reveal (Reproduce)
- voiceover: ""
- src: compositions/frames/13-ch4.html

## Frame 14 — If you left today

- scene: End of Service: wage, joining date ("your first contract"), How it ended with three choices; the payable figure
- duration: 12s
- transition_in: crossfade
- status: built
- blueprint: panel-edit-live-sync (Adapt: tap each reason, the award updates)
- voiceover: "End of Service shows what you'd get if you left. Use the date of your first contract. Resigning pays less in the first ten years; a contract that ends pays in full."
- src: compositions/frames/14-esb.html

## Frame 15 — Leave, ticket, unpaid leave

- scene: Leave balance, air ticket, and unpaid leave entered one stretch at a time ("the first 20 days still count")
- duration: 8s
- transition_in: cut
- status: built
- blueprint: grid-card-assemble (Reproduce: vertical list)
- voiceover: "Add your leave and air ticket. Enter unpaid leave one stretch at a time. The first twenty days of each still count as service."
- src: compositions/frames/15-leave.html

## Frame 16 — Chapter 5: Settings

- scene: Chapter card "5 · Settings"
- duration: 2.5s
- transition_in: cut
- status: built
- blueprint: titlecard-reveal (Reproduce)
- voiceover: ""
- src: compositions/frames/16-ch5.html

## Frame 17 — Your working day

- scene: Settings, Working day: 8 hours, 1 hour lunch, shift 07:30 to 16:30, absences divide by 30
- duration: 10s
- transition_in: crossfade
- status: built
- blueprint: device-surface-showcase (Adapt: static phone, fields highlight in turn)
- voiceover: "Settings holds your company's rules: an eight-hour day plus lunch, your shift for missed punches, and a day's pay as one thirtieth of the month."
- src: compositions/frames/17-working-day.html

## Frame 18 — The rest of Settings

- scene: Rows highlight: When you get paid, Expiry reminders, Language (English / العربية), Back up and restore
- duration: 8s
- transition_in: cut
- status: built
- blueprint: grid-card-assemble (Reproduce: vertical list steps through)
- voiceover: "Set when overtime is paid, get reminders before your iqama expires, switch to Arabic, and back everything up."
- src: compositions/frames/18-settings.html

## Frame 19 — Close

- scene: "Your pay, checked." then "Everything stays on your phone."
- duration: 5s
- transition_in: crossfade
- status: built
- blueprint: titlecard-reveal (Reproduce: statement then hold)
- voiceover: "Your pay, checked. Everything stays on your phone."
- src: compositions/frames/19-close.html
