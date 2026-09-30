// A redrawn attendance portal for the tutorials, built from report-data.mjs.
// It follows the real portal's layout (purple bar, side menu, the report
// table) so a worker recognises the route, but carries no identity: no
// company, no logo, no photo, "Worker name" and code 00000.
//
// One file, many states: tools/capture.mjs opens it with ?state=… and
// screenshots each one. Writes shared/portal.html.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rows, totals, cell } from './report-data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const tableRows = rows
  .map(
    (r) => `<tr><td class="n">${r.day}</td><td class="d">${r.date.slice(0, 3)}<br>${r.date.slice(3, 6)}<br>${r.date.slice(6)}</td>
<td>${cell.in(r)}</td><td>${cell.out(r)}</td><td>${cell.work(r)}</td><td>${cell.late(r)}</td>
<td>${''}</td><td>${cell.ot(r)}</td><td class="st">${r.status.replace('(', '<br>(').replace(' accepted', '<br><em>accepted</em>')}</td></tr>`,
  )
  .join('\n');

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Attendance portal</title>
<style>
*{box-sizing:border-box;margin:0}
body{font-family:Roboto,system-ui,sans-serif;background:#ecf0f5;color:#333;font-size:15px}
.bar{position:sticky;top:0;z-index:5;background:#56489a;color:#fff;height:52px;display:flex;align-items:center;gap:14px;padding:0 16px;font-weight:700}
.bar .burger{font-size:22px}
.url{background:#fff;color:#555;padding:10px 16px;font-size:14px;border-bottom:1px solid #ddd}
.side{background:#fff;min-height:calc(100vh - 52px);padding:14px 0}
.who{display:flex;align-items:center;gap:12px;padding:6px 18px 16px}
.who i{width:44px;height:44px;border-radius:50%;background:#cfd6e2;display:block}
.who b{display:block}.who small{color:#3a3}
.nav-h{color:#889;font-size:13px;padding:8px 18px}
.nav{padding:13px 18px;font-weight:700;display:flex;justify-content:space-between}
.nav.open{background:#f3f4f7}
.sub{padding:10px 18px 10px 34px;color:#666;background:#f3f4f7}
.sub.on{color:#111;font-weight:700;background:#e4e7ee}
.page{padding:16px}
.h1{font-size:22px;margin:6px 0 14px}
.card{background:#fff;border-top:3px solid #3c8dbc;padding:16px;margin-bottom:14px}
.lab{font-weight:700;font-size:14px;margin:12px 0 6px}
.field{border:1px solid #ccc;padding:10px 12px;display:flex;gap:10px;align-items:center;background:#fff}
.field.focus{border-color:#3c8dbc;box-shadow:0 0 0 2px #3c8dbc33}
.btns{display:flex;gap:6px;margin-top:14px}
.btn{padding:10px 18px;border-radius:3px;font-weight:700}
.go{background:#00a65a;color:#fff}.reset{background:#f4f4f4;border:1px solid #ddd}
.cal{position:absolute;z-index:6;left:16px;top:252px;width:300px;background:#fff;border:1px solid #ccc;box-shadow:0 6px 16px #0003;padding:10px}
.cal .mh{display:flex;justify-content:space-between;font-weight:700;padding:4px 6px 10px}
.cal table{width:100%;border-collapse:collapse;text-align:center}.cal td,.cal th{padding:7px 0;font-size:14px}
.cal .pick{background:#337ab7;color:#fff;border-radius:4px}.cal .mute{color:#bbb}
.dash{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.tile{color:#fff;padding:14px;border-radius:3px}.tile b{display:block;font-size:26px}
.search{display:flex;justify-content:center;align-items:center;gap:10px;padding:12px 0}
.search span{border:1px solid #ccc;width:150px;height:30px;background:#fff}
.tw{background:#fff;padding:0 6px 16px;overflow:hidden}
table.r{border-collapse:collapse;width:100%;table-layout:fixed}
table.r th{font-weight:700;text-align:left;padding:14px 6px;border-bottom:2px solid #eee;vertical-align:bottom}
table.r td{padding:12px 6px;vertical-align:top;border-bottom:1px solid #f0f0f0;line-height:1.5}
table.r tr:nth-child(even) td{background:#f5f5f5}
table.r .n{text-align:right}
table.r .info td{background:#f2f2f2!important;font-style:italic;line-height:1.7}
table.r .tot td{font-weight:700;background:#fff!important}
.st em{color:#c0392b;font-style:normal}
.show{text-align:center;padding:18px 0 8px;color:#444}
.pager{display:flex;justify-content:center}.pager span{border:1px solid #ddd;padding:8px 14px;background:#fff}.pager .cur{background:#337ab7;color:#fff}
/* phone view: six columns fit; the rest sit off to the right */
.phoneview table.r{width:660px}
.phoneview table.r col.n{width:36px}.phoneview col.d{width:56px}.phoneview col.t{width:62px}.phoneview col.w{width:66px}
.phoneview col.s{width:70px}.phoneview col.st{width:128px}
.sideways .tw{direction:ltr}
.sideways table.r{margin-left:-270px}
</style></head><body>
<div class="bar"><span class="burger">☰</span><span>Attendance portal</span></div>
<div id="app"></div>
<template id="dashboard"><div class="page"><div class="h1">Dashboard</div>
<div class="dash"><div class="tile" style="background:#00a65a">Present Days<b>22</b></div><div class="tile" style="background:#dd4b39">Absent Days<b>0</b></div>
<div class="tile" style="background:#00c0ef">Leaves Taken<b>1</b></div><div class="tile" style="background:#f39c12">Holidays<b>0</b></div></div>
<div class="card" style="margin-top:14px"><b>Upcoming Holidays</b><p style="margin-top:8px;color:#666">No upcoming holidays</p></div></div></template>
<template id="menu"><div class="side"><div class="who"><i></i><div><b>Worker name</b><small>● Online</small></div></div>
<div class="nav-h">MAIN NAVIGATION</div><div class="nav">Dashboard</div><div class="nav">Request Forms <span>‹</span></div>
<div class="nav open">Request Lists <span>⌄</span></div>
<div class="sub">Leave/Travel Applications List</div><div class="sub">Exit Entry Request List</div><div class="sub">General Request List</div>
<div class="sub">Duty Joining Request List</div><div class="sub">Driver OT Request List</div>
<div class="sub on" id="target">Daily Attendance Report</div><div class="sub">Payslip Download</div><div class="nav">Profile</div></div></template>
<template id="form"><div class="page"><div class="h1">Employee Attendance Report <small style="color:#999;font-size:14px">List</small></div>
<div class="card"><b>Search Form</b><div class="lab">Attendance Date From</div><div class="field" id="from">📅 <span></span></div>
<div class="lab">Attendance Date To</div><div class="field" id="to">📅 <span></span></div>
<div class="btns"><span class="btn go" id="search">Search</span><span class="btn reset">Reset</span></div></div>
<div class="card"><b>Employee Attendance Report</b><p style="color:#888;margin-top:10px">No data available in table</p></div></div></template>
<template id="table"><div class="page phoneview" style="padding:10px"><div class="tw"><div class="search">Search: <span></span></div>
<table class="r"><colgroup><col class="n"><col class="d"><col class="t"><col class="t"><col class="w"><col class="t"><col class="s"><col class="s"><col class="st"></colgroup>
<thead><tr><th class="n">Sl.</th><th>Date</th><th>First In</th><th>Last Out</th><th>Work Hrs</th><th>Late In</th><th>Early Out</th><th>Overtime</th><th>Status</th></tr></thead>
<tbody><tr class="info"><td colspan="9">Code: <b>00000</b><br>Name: <b>Worker name</b></td></tr>
${tableRows}
<tr class="tot"><td></td><td></td><td></td><td>Total</td><td>${cell.total(totals.work)}</td><td>${totals.late ? cell.total(totals.late) : ''}</td><td></td><td>${cell.total(totals.ot)}</td><td></td></tr>
</tbody></table><div class="show">Showing 1 to 31 of 31 entries</div><div class="pager"><span>«</span><span>‹</span><span class="cur">1</span><span>›</span><span>»</span></div></div></div></template>
<script>
const q = new URLSearchParams(location.search);
const state = q.get('state') || 'dashboard';
const base = { calendar: 'form', fromset: 'form', calendarTo: 'form', filled: 'form', sideways: 'table' }[state] || state;
document.getElementById('app').append(document.getElementById(base).content.cloneNode(true));
if (state === 'sideways') document.body.classList.add('sideways');
const set = (id, v) => { const el = document.querySelector('#' + id + ' span'); if (el) el.textContent = v; };
if (state === 'calendar' || state === 'calendarTo') {
  const to = state === 'calendarTo';
  set('from', '01-08-2026'); if (to) set('to', '31-08-2026');
  document.getElementById(to ? 'to' : 'from').classList.add('focus');
  const days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  let cells = '<tr>' + days.map((d) => '<th>' + d + '</th>').join('') + '</tr><tr>';
  const lead = 6; // 1 August 2026 is a Saturday
  for (let i = 0; i < lead; i++) cells += '<td class="mute">' + (26 + i) + '</td>';
  for (let d = 1; d <= 31; d++) { cells += '<td' + (d === (to ? 31 : 1) ? ' class="pick"' : '') + '>' + d + '</td>'; if ((lead + d) % 7 === 0) cells += '</tr><tr>'; }
  cells += '</tr>';
  const cal = document.createElement('div'); cal.className = 'cal';
  if (to) cal.style.top = '334px';
  cal.innerHTML = '<div class="mh"><span>←</span><span>August 2026</span><span>→</span></div><table>' + cells + '</table>';
  document.getElementById('app').append(cal);
}
if (state === 'filled') { set('from', '01-08-2026'); set('to', '31-08-2026'); }
if (state === 'fromset') set('from', '01-08-2026');
</script></body></html>`;

fs.mkdirSync(path.join(root, 'shared'), { recursive: true });
fs.writeFileSync(path.join(root, 'shared/portal.html'), html);
console.log('wrote shared/portal.html');
