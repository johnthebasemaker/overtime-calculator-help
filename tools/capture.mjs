// Screens for the tutorial videos, captured from the real app and the
// redrawn portal, with invented data only. Needs the app's dev server
// (glass-ot-green, npm run dev) on APP_URL. Writes shared/captures/*.png.
//
//   node tools/capture.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import puppeteer from 'puppeteer-core';
import { expected } from './report-data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'shared/captures');
fs.mkdirSync(out, { recursive: true });
const APP = process.env.APP_URL || 'http://localhost:8080/';
const PORTAL = pathToFileURL(path.join(root, 'shared/portal.html')).href;
const chrome = execFileSync('npx', ['--yes', 'hyperframes@0.8.96', 'browser', 'path'], { encoding: 'utf8' }).trim().split('\n').pop();

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--hide-scrollbars'] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const shot = async (name, opts = {}) => {
  await wait(350);
  await page.screenshot({ path: path.join(out, `${name}.png`), ...opts });
  console.log('  ', name);
};
const byText = async (text, sel = 'button, [role=radio], label, div, span') => {
  const h = await page.evaluateHandle(
    (t, s) => [...document.querySelectorAll(s)].find((el) => el.textContent.trim() === t && el.offsetParent !== null),
    text, sel,
  );
  const el = h.asElement();
  if (!el) throw new Error(`not found: ${text}`);
  return el;
};
const click = async (text, sel) => { await (await byText(text, sel)).click(); await wait(450); };
const clickLabel = async (label) => { await page.click(`[aria-label="${label}"]`); await wait(450); };

/* ---------- the portal ---------- */
console.log('portal');
for (const state of ['dashboard', 'menu', 'form', 'calendar', 'fromset', 'calendarTo', 'filled', 'table']) {
  await page.goto(`${PORTAL}?state=${state}`);
  await shot(`portal-${state}`);
}
await page.goto(`${PORTAL}?state=table`);
await shot('portal-table-full', { fullPage: true });
await page.goto(`${PORTAL}?state=sideways`);
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await shot('portal-sideways');

// What a worker screenshots on their phone: down the table, then sideways.
console.log('ocr input');
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2.77, isMobile: true, hasTouch: true });
await page.goto(`${PORTAL}?state=table`);
const height = await page.evaluate(() => document.body.scrollHeight);
const ocr = [];
for (let y = 0, i = 1; ; y += 640, i += 1) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  const file = path.join(out, `ocr-${i}.png`);
  await wait(150);
  await page.screenshot({ path: file });
  ocr.push(file);
  if (y + 844 >= height) break;
}
await page.goto(`${PORTAL}?state=sideways`);
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await wait(150);
const side = path.join(out, `ocr-${ocr.length + 1}.png`);
await page.screenshot({ path: side });
ocr.push(side);
console.log('  ', ocr.length, 'screenshots');
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });

/* ---------- the app ---------- */
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

console.log('app: calculator');
await seed({ 'otc.draft.v1': draft({ basicPay: '' }) });
await shot('app-home-empty');
await seed({ 'otc.draft.v1': draft() });
await shot('app-home');
await seed({ 'otc.draft.v1': draft({ otHours: '11' }) });
await shot('app-home-ot');
await page.evaluate(() => document.getElementById('otHours')?.scrollIntoView({ block: 'center' }));
await shot('app-ot-stepper');
await page.evaluate(() => window.scrollTo(0, 0));

console.log('app: import');
await seed({ 'otc.draft.v1': draft({ month: '2026-08' }) });
await shot('app-home-aug');
await click('Count it day by day instead');
await shot('app-daysheet-empty');
await click('Import');
await wait(900);
await shot('app-import');
const input = await page.$('input[type=file][accept="image/*"]');
await input.uploadFile(...ocr);
await wait(1200);
await shot('app-import-reading');
await page.waitForFunction(() => !document.body.innerText.includes('Reading your screenshots'), { timeout: 240000 });
await wait(600);
const check = await page.evaluate(() => document.body.innerText.match(/Matches the report|Does not match the report yet/)?.[0] ?? 'no check');
const otText = await page.evaluate(() => document.body.innerText.match(/Overtime in these days\n[^\n]*/)?.[0] ?? '');
console.log('   check:', check, '|', otText.replace('\n', ' '), '| expected', expected.ot);
await shot('app-import-preview');
await page.evaluate(() => {
  const target = [...document.querySelectorAll('span')].find((s) => /Missed clock-in/.test(s.textContent));
  target?.scrollIntoView({ block: 'center' });
});
await shot('app-import-rows');
await page.evaluate(() => {
  const target = [...document.querySelectorAll('span')].find((s) => s.textContent.trim() === 'Sick Leave');
  target?.scrollIntoView({ block: 'center' });
});
await shot('app-import-rows-2');
await click((await page.evaluate(() => [...document.querySelectorAll('button')].map((b) => b.textContent.trim()).find((t) => /^Fill in \d+ days$/.test(t)))), 'button');
await wait(900);
await shot('app-filled-popup');
const popup = await page.evaluate(() => /saved to History/.test(document.body.innerText));
console.log('   popup:', popup);
if (popup) await click('OK', 'button');
await page.evaluate(() => document.querySelector('.day-body')?.scrollTo(0, 0));
await shot('app-daysheet-filled');

console.log('app: day editor');
await page.click('[aria-label^="10 August"]');
await wait(500);
await page.evaluate(() => { const b = document.querySelector('.day-body'); b?.scrollTo(0, b.scrollHeight); });
await shot('app-editor-before');
await page.click('[aria-label="Hours on day 10 hours"]');
await page.keyboard.down('Meta'); await page.keyboard.press('KeyA'); await page.keyboard.up('Meta');
await page.keyboard.type('11');
await page.keyboard.type('47');
await page.evaluate(() => document.activeElement?.blur());
await wait(500);
await shot('app-editor');
await clickLabel('Close');

console.log('app: history');
await page.evaluate(() => {
  const list = JSON.parse(localStorage.getItem('otc.history.v1') || '[]');
  for (const r of list) r.received = { basic: r.calculated.basic, allowance: r.calculated.allowance, ot: r.calculated.ot, deduction: r.calculated.deduction };
  localStorage.setItem('otc.history.v1', JSON.stringify(list));
});
await page.goto(APP);
await wait(900);
await click('History', 'button');
await shot('app-history');
await page.evaluate(() => window.scrollTo(0, 420));
await shot('app-history-card');

console.log('app: end of service');
await page.evaluate(() => window.scrollTo(0, 0));
await click('End of Service', 'button');
await click('Last monthly wage', 'span');
await page.type('#lastWage', '2400');
await click('Done', 'button');
await click('Joining date', 'span');
await page.evaluate(() => {
  const el = document.querySelector('input[type=date]');
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  set.call(el, '2022-03-01');
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
});
await click('Done', 'button');
await click('Contract ended', 'button');
await shot('app-esb');
await click('I resigned', 'button');
await shot('app-esb-resigned');
await click('Contract ended', 'button');
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.startsWith('Add leave and air ticket'))?.click());
await wait(600);
await click('Add a stretch of unpaid leave', 'button');
await page.type('#stretch-0', '30');
await page.evaluate(() => document.getElementById('stretch-0')?.scrollIntoView({ block: 'center' }));
await shot('app-esb-stretch');
await page.evaluate(() => window.scrollTo(0, 0));
await shot('app-esb-top');

console.log('app: settings');
await clickLabel('Settings');
await shot('app-settings');
await click('Working day', 'span');
await shot('app-settings-workday');
await page.evaluate(() => document.querySelector('#absenceMonthDays')?.scrollIntoView({ block: 'center' }));
await shot('app-settings-shift');
await clickLabel('Back');
await page.evaluate(() => { const s = [...document.querySelectorAll('*')].find((e) => e.scrollHeight > e.clientHeight + 40 && getComputedStyle(e).overflowY === 'auto'); s?.scrollTo(0, 600); });
await shot('app-settings-more');

await browser.close();
console.log('done:', fs.readdirSync(out).length, 'files');
