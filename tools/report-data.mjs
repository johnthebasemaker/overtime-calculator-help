// An invented month of attendance, August 2026, for the tutorial videos.
// Nothing here belongs to a real worker: the times come from a seeded
// generator, and the totals are worked out from the rows the same way the
// real report does it (Work Hrs = Last Out - First In; Overtime = Work Hrs
// past 9:00; Late In = First In past 07:30).

const pad = (n) => String(n).padStart(2, '0');
export const hm = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
const total = (m) => `${Math.floor(m / 60)}:${pad(m % 60)}`;

// Small seeded generator, so every run draws the same month.
let seed = 20260801;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);

const SHIFT_START = 7 * 60 + 30;
const DAY = 9 * 60;

export const month = { year: 2026, month: 8, label: 'August 2026' };

export const rows = Array.from({ length: 31 }, (_, i) => {
  const day = i + 1;
  const weekday = new Date(Date.UTC(2026, 7, day)).getUTCDay();
  const date = `${pad(day)}-08-2026`;
  if (weekday === 5) return { day, date, in: null, out: null, work: null, late: null, ot: null, status: 'Weekly Off' };
  if (day === 29) return { day, date, in: null, out: null, work: null, late: null, ot: null, status: 'Sick Leave' };
  const inM = 7 * 60 + Math.floor(rand() * 26); // 07:00 to 07:25
  const outM = day === 3 || day === 17 ? 16 * 60 + 35 + Math.floor(rand() * 20) : 17 * 60 + 40 + Math.floor(rand() * 115);
  if (day === 9) return { day, date, in: null, out: outM, work: null, late: null, ot: null, status: 'Present(Missing Punches) accepted' };
  const work = outM - inM;
  const late = inM > SHIFT_START ? inM - SHIFT_START : null;
  const ot = work > DAY ? work - DAY : null;
  return { day, date, in: inM, out: outM, work, late, ot, status: 'Present' };
});

export const totals = {
  work: rows.reduce((s, r) => s + (r.work ?? 0), 0),
  late: rows.reduce((s, r) => s + (r.late ?? 0), 0),
  ot: rows.reduce((s, r) => s + (r.ot ?? 0), 0),
};

export const cell = {
  in: (r) => (r.in === null ? '-nil-' : hm(r.in)),
  out: (r) => (r.out === null ? '-nil-' : hm(r.out)),
  work: (r) => (r.work === null ? '' : hm(r.work)),
  late: (r) => (r.late === null ? '' : hm(r.late)),
  ot: (r) => (r.ot === null ? '' : hm(r.ot)),
  total,
};

// What the app should end up with, for checking the captures.
export const expected = (() => {
  const shiftOt = rows[8].out - SHIFT_START - DAY; // the missed clock-in, from 07:30
  const otMinutes = totals.ot + Math.max(shiftOt, 0);
  return { otMinutes, ot: total(otMinutes) };
})();

if (process.argv[1]?.endsWith("report-data.mjs")) {
  console.log(rows.map((r) => `${r.date} ${cell.in(r)} ${cell.out(r)} ${cell.work(r)} ${cell.ot(r)} ${r.status}`).join('\n'));
  console.log('totals', total(totals.work), total(totals.late), total(totals.ot), 'app OT', expected.ot);
}
