// Extra screens for the user-manual video: the salary typed in, the
// overtime stepper, a day typed into an empty sheet, a payslip entered,
// End of Service reasons and Settings opened from the gear. Invented figures
// only. Needs the app's dev server on APP_URL. Writes shared/captures/man-*.png
// and shared/captures/man-values.json (figures the video shows beside them).
//
//   node tools/capture-manual.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import puppeteer from 'puppeteer-core';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'shared/captures');
const APP = process.env.APP_URL || 'http://localhost:8080/';
const chrome = execFileSync('npx', ['--yes', 'hyperframes@0.8.96', 'browser', 'path'], { encoding: 'utf8' }).trim().split('\n').pop();

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--hide-scrollbars'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
page.on('dialog', (d) => d.accept());
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const only = process.argv.slice(2);
const want = (name) => !only.length || only.includes(name);
const valuesFile = path.join(out, 'man-values.json');
const values = fs.existsSync(valuesFile) ? JSON.parse(fs.readFileSync(valuesFile, 'utf8')) : {};
const shot = async (name) => {
  await wait(350);
  await page.screenshot({ path: path.join(out, `man-${name}.png`) });
  console.log('  ', name);
};
const find = (text, sel = 'button, [role=radio], [role=menuitem], label, span, a') => page.evaluateHandle(
  (t, s) => [...document.querySelectorAll(s)].find((el) => el.textContent.trim() === t && el.offsetParent !== null) ?? null,
  text, sel,
);
const click = async (text, sel) => {
  const el = (await find(text, sel)).asElement();
  if (!el) throw new Error(`not found: ${text}`);
  await el.click();
  await wait(450);
};
/** Centre and size of an element in CSS px, for the video's tap rings. */
const boxOf = (sel) => page.evaluate((s) => {
  const el = document.querySelector(s);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return [Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2), Math.round(r.width), Math.round(r.height)];
}, sel);
const boxOfText = (text, sel = 'button, span, label, div') => page.evaluate((t, s) => {
  const el = [...document.querySelectorAll(s)].find((e) => e.textContent.trim() === t && e.offsetParent !== null);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return [Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2), Math.round(r.width), Math.round(r.height)];
}, text, sel);
const earned = () => page.evaluate(() => document.body.innerText.match(/EARNED THIS MONTH\n([^\n]+)/i)?.[1] ?? '');
const seed = async (entries) => {
  await page.goto(APP);
  await page.evaluate((e) => {
    localStorage.clear();
    localStorage.setItem('otc.onboarded.v1', '1');
    for (const [k, v] of Object.entries(e)) localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v));
  }, entries);
  await page.goto(APP);
  await wait(900);
};
const draft = (over) => ({ month: '2026-09', basicPay: '2000', allowance: '400', otHours: '', ...over });

/* ---------- salary, typed ---------- */
if (want('salary')) {
  console.log('salary');
  await seed({ 'otc.draft.v1': draft({ basicPay: '', allowance: '' }) });
  values.basicBox = await boxOf('#basicPay');
  values.allowanceBox = await boxOf('#allowance');
  await shot('sal-0');
  await page.click('#basicPay');
  for (const [i, k] of ['2', '0', '0', '0'].entries()) {
    await page.keyboard.type(k);
    await shot(`sal-b${i + 1}`);
  }
  await page.click('#allowance');
  for (const [i, k] of ['4', '0', '0'].entries()) {
    await page.keyboard.type(k);
    await shot(`sal-a${i + 1}`);
  }
  await page.evaluate(() => document.activeElement?.blur());
  await shot('sal-done');
  values.salaryEarned = await earned();
}

/* ---------- month and the stepper ---------- */
if (want('stepper')) {
  console.log('stepper');
  await seed({ 'otc.draft.v1': draft({ otHours: '10' }) });
  await page.evaluate(() => document.getElementById('otHours')?.scrollIntoView({ block: 'center' }));
  await wait(400);
  values.stepY = await page.evaluate(() => scrollY);
  values.monthBox = await boxOf('input[type=month], #month');
  values.plusBox = await boxOf('[aria-label="Half an hour more"]');
  values.minusBox = await boxOf('[aria-label="Half an hour less"]') ?? null;
  values.earned = {};
  await shot('step-10');
  values.earned['10'] = await earned();
  await page.click('[aria-label="Half an hour more"]');
  await shot('step-10.5');
  values.earned['10.5'] = await earned();
  await page.click('[aria-label="Half an hour more"]');
  await shot('step-11');
  values.earned['11'] = await earned();
}

/* ---------- a day typed into an empty sheet ---------- */
if (want('daysheet')) {
  console.log('day sheet');
  await seed({ 'otc.draft.v1': draft({ month: '2026-08' }) });
  await click('Count it day by day instead', 'button');
  await shot('ds-empty');
  values.day3 = await boxOf('[aria-label^="3 August"]');
  await page.click('[aria-label^="3 August"]');
  await wait(500);
  await page.evaluate(() => { const b = document.querySelector('.day-body'); b?.scrollTo(0, b.scrollHeight); });
  await wait(300);
  await shot('ds-day');
  values.hoursBox = await boxOf('[aria-label="Hours on day 3 hours"]');
  values.nextBox = await boxOf('[aria-label="Next day"]');
  await page.click('[aria-label="Hours on day 3 hours"]');
  await page.keyboard.type('11');
  await shot('ds-h');
  await page.keyboard.type('47');
  await page.evaluate(() => document.activeElement?.blur());
  await shot('ds-hm');
  values.kinds = {};
  for (const k of ['Normal', 'Friday', 'Holiday', 'Absent', 'Medical leave']) values.kinds[k] = await boxOfText(k, 'button');
  await page.click('[aria-label="Next day"]');
  await wait(400);
  await page.evaluate(() => { const b = document.querySelector('.day-body'); b?.scrollTo(0, b.scrollHeight); });
  await shot('ds-next');
}

/* ---------- a payslip, entered ---------- */
if (want('payslip')) {
  console.log('payslip');
  // One saved August, 60:18 of overtime, nothing paid yet.
  await seed({ 'otc.draft.v1': draft({ month: '2026-08', otHours: '60.3' }) });
  await click('Save this month', 'button');
  await wait(600);
  await click('Save', 'button');
  await wait(600);
  console.log('   saved:', await page.evaluate(() => Object.keys(localStorage).filter((k) => /history/.test(k)).map((k) => k + '=' + localStorage.getItem(k).length).join(' ')));
  await page.evaluate(() => [...document.querySelectorAll('nav button, button')].reverse().find((b) => b.innerText.trim() === 'History')?.click());
  await wait(700);
  await shot('hist-waiting');
  values.enterPaid = await boxOfText('Enter what you were paid', 'button');
  await click('Enter what you were paid', 'button');
  await wait(500);
  await shot('paid-0');
  const typeInto = async (id, text) => {
    await page.click(`#${id}`, { clickCount: 3 });
    await page.keyboard.type(text);
  };
  await typeInto('recvBasic', '2000');
  await typeInto('recvAllowance', '400');
  await typeInto('recvOt', '800');
  await page.evaluate(() => document.activeElement?.blur());
  await shot('paid-typed');
  await click('Save', 'button');
  await wait(600);
  await shot('hist-short');
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot('hist-top');
}

/* ---------- End of Service ---------- */
if (want('esb')) {
  console.log('end of service');
  await seed({ 'otc.draft.v1': draft() });
  await click('End of Service', 'button');
  await click('Last monthly wage', 'span');
  await page.type('#lastWage', '2400');
  await click('Done', 'button');
  await click('Joining date', 'span');
  await shot('esb-joining');
  await page.evaluate(() => {
    const el = document.querySelector('input[type=date]');
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    set.call(el, '2022-03-01');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await click('Done', 'button');
  values.reasons = {};
  for (const r of ['I resigned', 'Employer ended it', 'Contract ended']) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await wait(200);
    values.reasons[r] = await boxOfText(r, 'button');
    await click(r, 'button');
    await shot(`esb-${r.split(' ')[0].toLowerCase()}`);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot('esb-top');
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.startsWith('Add leave and air ticket'))?.click());
  await wait(600);
  await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.startsWith('Add leave and air ticket'))?.scrollIntoView({ block: 'start' }));
  await wait(300);
  await shot('esb-leave');
  await click('Add a stretch of unpaid leave', 'button');
  await page.type('#stretch-0', '30');
  await page.evaluate(() => document.activeElement?.blur());
  await page.evaluate(() => document.getElementById('stretch-0')?.scrollIntoView({ block: 'center' }));
  await shot('esb-stretch');
}

/* ---------- Settings, from the gear ---------- */
if (want('settings')) {
  console.log('settings');
  await seed({ 'otc.draft.v1': draft({ otHours: '11' }) });
  values.gear = await boxOf('[aria-label="Settings"]');
  await shot('home');
  await page.click('[aria-label="Settings"]');
  await wait(500);
  await shot('settings');
  await click('Working day', 'span');
  await shot('workday');
  await page.evaluate(() => document.querySelector('#absenceMonthDays')?.scrollIntoView({ block: 'center' }));
  await shot('workday-shift');
}

fs.writeFileSync(path.join(out, 'man-values.json'), JSON.stringify(values, null, 2));
console.log(JSON.stringify(values));
await browser.close();
