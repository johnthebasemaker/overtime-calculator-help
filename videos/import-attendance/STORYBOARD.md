---
format: 1080x1920
duration: 72s
message: "Screenshot your attendance report, upload it, and the app fills your month, checked against the report's own totals."
arc: Promise → Portal steps → Screenshots → Import → Proof → Done
audience: workers using the Overtime Calculator app
mode: collaborative
---

## Changes from v1

- "change the figures to 2,000 + 400" (sample salary: basic 2,000, food allowance 400; SAR 14.17 an hour).

## Locked

- Layouts, copy and seams of every frame, confirmed by the user: "All other things are okay, you can build the motion".

## Frame 1 — A month in a minute

- scene: Big type: "Your whole month." then "From a few screenshots." over the app icon
- duration: 5s
- transition_in: cut
- status: built
- blueprint: kinetic-type-beats (Reproduce: statement build onto a spring-pop payoff)
- voiceover: "Fill a whole month of hours in under a minute, straight from your attendance report."
- src: compositions/frames/01-promise.html

The promise, first: the viewer should know in five seconds why the next minute is worth it.

## Frame 2 — Open the report

- scene: Mock portal on a phone. Tap the menu, tap Request Lists, tap Daily Attendance Report
- duration: 9s
- transition_in: crossfade
- status: built
- blueprint: cursor-ui-demo (Adapt: a finger-tap ring instead of a mouse cursor; locked stage, element swaps)
- voiceover: "Log in to the attendance portal. Open Request Lists, then Daily Attendance Report."
- src: compositions/frames/02-open-report.html

Neutral mock-up only: "Attendance portal", "Worker name", no logo, no company.

## Frame 3 — Dates, then Search

- scene: Attendance Date From → calendar, tap 1; Attendance Date To → tap 31; tap Search; the table appears
- duration: 8s
- transition_in: cut
- status: built
- blueprint: cursor-ui-demo (Adapt: tap ring, calendar pops, table fills)
- voiceover: "Pick the first and last day of the month, and tap Search."
- src: compositions/frames/03-dates-search.html

## Frame 4 — Screenshots down the table

- scene: The phone scrolls the table; a white flash and a thumbnail stack 1, 2, 3, 4; the last one shows the Total row
- duration: 9s
- transition_in: cut
- status: built
- blueprint: device-surface-showcase (Adapt: push-scroll inside the held phone, screenshot flashes)
- voiceover: "Take screenshots from the top of the table down to the Total row. Overlapping is fine."
- src: compositions/frames/04-screenshots.html

## Frame 5 — One more, sideways

- scene: At the bottom, a swipe slides the table left: Overtime and Status come into view with the Total row; one more flash
- duration: 7s
- transition_in: cut
- status: built
- blueprint: device-surface-showcase (Adapt: horizontal pan of the table, flash)
- voiceover: "At the bottom, swipe the table sideways and take one more, so the app can read Sick Leave or Holiday too."
- src: compositions/frames/05-sideways.html

## Frame 6 — Upload in the app

- scene: The app: Count it day by day → Import → Upload screenshots → five chosen → "Reading your screenshots" with a progress bar
- duration: 9s
- transition_in: crossfade
- status: built
- blueprint: cursor-ui-demo (Adapt: tap ring through real app captures)
- voiceover: "Now in the app: Count it day by day, Import, Upload screenshots, and pick them all. It's read on your phone. Nothing is uploaded."
- src: compositions/frames/06-upload.html

## Frame 7 — It checks itself

- scene: The "Matches the report" card; three ticks spring in: 31 of 31 days, Work Hrs 282:32, Overtime 57:32
- duration: 8s
- transition_in: cut
- status: built
- blueprint: dataviz-countup (Adapt: count-up to each total, then the tick)
- voiceover: "The app checks itself against the report's own totals. Three ticks means every day was read right."
- src: compositions/frames/07-check.html

The proof beat: this is why a worker can trust the number.

## Frame 8 — What it works out for you

- scene: Three rows assemble: "Missed clock-in: counted from 07:30", "Sick Leave → Medical leave", "Weekly Off → Friday"
- duration: 7s
- transition_in: cut
- status: built
- blueprint: grid-card-assemble (Reproduce: vertical list accumulates)
- voiceover: "Missed punches are filled the way payroll does it, and Fridays, holidays and leave come straight from the report."
- src: compositions/frames/08-worked-out.html

## Frame 9 — Fill in

- scene: A tap on "Fill in 31 days"; the calendar fills; "August saved to History" pops up
- duration: 6s
- transition_in: cut
- status: built
- blueprint: cta-morph-press (Adapt: the app's own button takes the press)
- voiceover: "Tap Fill in. Your month is done, and saved to History."
- src: compositions/frames/09-fill-in.html

## Frame 10 — Done

- scene: Calm card: "Stays on your phone." and "Full guide: Help in the app"
- duration: 4s
- transition_in: crossfade
- status: built
- blueprint: titlecard-reveal (Reproduce: one slide-up, still hold)
- voiceover: "That's it. Your report never leaves your phone."
- src: compositions/frames/10-done.html
