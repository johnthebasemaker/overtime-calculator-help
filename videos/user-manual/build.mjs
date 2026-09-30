// Writes the "Using Overtime Calculator" scenes and index.html from the
// storyboard's voiceover lines, audio_meta.json (real voice timings) and the
// captures in assets/img. Re-run after changing any of those:
//
//   node build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  C, H, W, SCREEN, px, setPhoneTop, captionGroups, captionsFile, fontFaces, mark, phone, sceneFile, shot, taps, writeFile,
} from '../../tools/video-kit.mjs';

// The manual's sketches hold the phone higher: no step label above it.
setPhoneTop(151);

const root = path.dirname(fileURLToPath(import.meta.url));
const meta = JSON.parse(fs.readFileSync(path.join(root, 'audio_meta.json'), 'utf8'));
const board = fs.readFileSync(path.join(root, 'STORYBOARD.md'), 'utf8');
const lines = Object.fromEntries(
  [...board.matchAll(/## Frame (\d+)[^\n]*\n[\s\S]*?- voiceover: "(.*)"/g)].map((m) => [m[1].padStart(2, '0'), m[2]]),
);
const voices = Object.fromEntries(meta.voices.map((v) => [v.id, v]));

const scenes = [];
const scene = (s) => scenes.push(s);
const n = (s) => s.id.slice(0, 2);

/* ---------- shared scene parts ---------- */

// A figure or note that sits under the phone, above the captions.
const underCss = (p) => `.${p}-under{position:absolute;left:60px;right:60px;top:1432px;height:130px;display:flex;align-items:center;justify-content:center;z-index:45}
.${p}-pill{display:flex;align-items:center;gap:22px;padding:18px 34px;border-radius:26px;background:#123a30;border:3px solid rgba(16,185,129,.45);box-shadow:0 18px 44px rgba(0,0,0,.45);opacity:0}
.${p}-pl{font:500 30px/1.1 'Roboto',sans-serif;color:${C.soft};letter-spacing:.06em;text-transform:uppercase}
.${p}-pv{font:800 48px/1 'Montserrat',sans-serif;color:${C.ink};font-variant-numeric:tabular-nums;white-space:nowrap}`;
const dimCss = (p) => `.${p}-dim{position:absolute;inset:0;background:rgba(6,20,16,.6);opacity:0;z-index:16}`;
const listCss = (p) => `.${p}-card{position:absolute;left:70px;right:70px;padding:26px 36px;border-radius:26px;background:#123a30;border:3px solid rgba(16,185,129,.4);box-shadow:0 22px 56px rgba(0,0,0,.5);z-index:40;opacity:0}
.${p}-card.warn{border-color:rgba(245,158,11,.75);border-left-width:12px}
.${p}-ct{font:800 44px/1.1 'Montserrat',sans-serif;color:${C.ink}}
.${p}-cs{margin-top:10px;font:500 32px/1.25 'Roboto',sans-serif;color:${C.soft}}`;
const card = (p, i, top, title, sub, cls = '') =>
  `<div class="${p}-card${cls}" id="${p}-c${i}" style="top:${top}px"><div class="${p}-ct">${title}</div><div class="${p}-cs">${sub}</div></div>`;
const cardIn = (i, t) => `tl.fromTo(P + 'c${i}', { opacity: 0, x: 140 }, { opacity: 1, x: 0, duration: 0.6, ease: 'expo.out', immediateRender: false }, ${t});`;
const up = `const up = (id, t) => tl.fromTo(P + id, { opacity: 1, y: ${SCREEN.height} }, { y: 0, duration: 0.45, ease: 'power3.out', immediateRender: false }, t);
  const slide = (id, t) => tl.fromTo(P + id, { opacity: 1, x: ${SCREEN.width} }, { x: 0, duration: 0.5, ease: 'power3.inOut', immediateRender: false }, t);`;

// Chapter card: the big numeral fades up, the name slides in, the rule draws.
const chapter = (id, num, title) => scene({
  id, p: `m${id.slice(0, 2)}`, dur: 2.5, silent: true,
  css: `.m${id.slice(0, 2)}-box{position:absolute;left:86px;right:70px;top:640px}
.m${id.slice(0, 2)}-num{display:block;font:900 330px/.8 'Montserrat',sans-serif;color:rgba(16,185,129,.4)}
.m${id.slice(0, 2)}-t{margin-top:30px;font:900 96px/1.05 'Montserrat',sans-serif;color:${C.ink};letter-spacing:-.01em}
.m${id.slice(0, 2)}-rule{margin-top:44px;width:330px;height:15px;border-radius:99px;background:${C.acc};transform-origin:0 50%}`,
  body: `<div class="m${id.slice(0, 2)}-box"><span class="m${id.slice(0, 2)}-num" id="m${id.slice(0, 2)}-num">${num}</span><div class="m${id.slice(0, 2)}-t" id="m${id.slice(0, 2)}-t">${title}</div><div class="m${id.slice(0, 2)}-rule" id="m${id.slice(0, 2)}-rule"></div></div>`,
  script: `
  tl.fromTo(P + 'num', { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, 0.1);
  tl.fromTo(P + 't', { opacity: 0, x: 90 }, { opacity: 1, x: 0, duration: 0.6, ease: 'expo.out' }, 0.35);
  tl.fromTo(P + 'rule', { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power3.inOut' }, 0.6);`,
});

/* ---------- 1 · open ---------- */
scene({
  id: '01-open', p: 'm01', dur: 8.2,
  css: `.m01-icon{position:absolute;left:86px;top:300px;width:190px;height:190px;border-radius:44px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.m01-icon img{width:100%;height:100%;display:block}
.m01-title{position:absolute;left:86px;right:60px;top:560px}
.m01-l{display:block;font:900 118px/1.04 'Montserrat',sans-serif;letter-spacing:-.02em;color:${C.ink}}
.m01-acc{color:${C.acc3}}
.m01-p{margin-top:50px;max-width:880px;font:700 50px/1.3 'Montserrat',sans-serif;color:${C.soft}}
.m01-chip{position:absolute;left:86px;top:1180px;display:flex;align-items:center;gap:16px;padding:16px 30px 16px 22px;border-radius:99px;background:rgba(16,185,129,.18);border:3px solid rgba(110,231,183,.5);font:800 44px/1 'Montserrat',sans-serif;color:${C.acc3};opacity:0}`,
  body: `<div class="m01-icon" id="m01-icon"><img src="assets/img/app-icon.png" alt=""></div>
<div class="m01-title" id="m01-title"><span class="m01-l" id="m01-l1">Overtime</span><span class="m01-l m01-acc" id="m01-l2">Calculator</span><div class="m01-p" id="m01-p">Your pay, worked out the way your company does it.</div></div>
<div class="m01-chip" id="m01-chip"><svg width="40" height="46" viewBox="0 0 24 28" fill="none" stroke="${C.acc3}" stroke-width="3"><rect x="2" y="12" width="20" height="14" rx="3"/><path d="M6 12V8a6 6 0 0 1 12 0v4"/></svg>On your phone</div>`,
  script: `
  tl.fromTo(P + 'icon', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.8)' }, 0.1);
  tl.fromTo(P + 'l1', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.55, ease: 'expo.out' }, 0.7);
  tl.fromTo(P + 'l2', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(2)', transformOrigin: '0% 70%' }, 1.5);
  tl.fromTo(P + 'p', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }, 2.9);
  tl.fromTo(P + 'chip', { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.6, ease: 'expo.out' }, 6.3);
  tl.fromTo(P + 'title', { y: 0 }, { y: -16, duration: 8.2, ease: 'none' }, 0);`,
});

chapter('02-ch1', '1', 'Salary and hours');

/* ---------- 3 · your salary ---------- */
scene({
  id: '03-salary', p: 'm03', dur: 7.5, fade: true,
  body: phone('m03', ['sal-0', 'sal-b1', 'sal-b2', 'sal-b3', 'sal-b4', 'sal-a1', 'sal-a2', 'sal-a3', 'sal-done']
    .map((f, i) => shot('m03', f, `man-${f}`, i ? 'opacity:0' : '')).join('')) +
    mark('m03', 'earn', [14, 104, 362, 122], 4, 'ok') + mark('m03', 'card', [12, 468, 366, 188], 4, 'ok') + taps('m03', 2),
  script: `
  tap(131, 607, 2.2);
  ['sal-b1', 'sal-b2', 'sal-b3', 'sal-b4'].forEach((id, i) => show(id, 2.4 + i * 0.14));
  tap(296, 607, 3.35);
  ['sal-a1', 'sal-a2', 'sal-a3'].forEach((id, i) => show(id, 3.55 + i * 0.14));
  show('sal-done', 4.05);
  markOn('earn', 4.2);
  markOn('card', 5.2);`,
});

/* ---------- 4 · the month and its overtime ---------- */
const pay = (h) => {
  const v = JSON.parse(fs.readFileSync(path.join(root, '../../shared/captures/man-values.json'), 'utf8'));
  return v.earned[h];
};
scene({
  id: '04-month', p: 'm04', dur: 8.2,
  css: underCss('m04') + `.m04-vs{position:relative;display:block;min-width:400px;height:52px}
.m04-v{position:absolute;right:0;top:0;opacity:0}`,
  body: phone('m04', shot('m04', 's10', 'man-step-10') + shot('m04', 's105', 'man-step-10.5', 'opacity:0') + shot('m04', 's11', 'man-step-11', 'opacity:0')) +
    mark('m04', 'ot', [12, 385, 366, 70], 4) + taps('m04', 3) +
    `<div class="m04-under"><div class="m04-pill" id="m04-pill"><span class="m04-pl">Earned</span><span class="m04-vs">${['10', '10.5', '11'].map((h, i) => `<span class="m04-pv m04-v" id="m04-v${i}">${pay(h)}</span>`).join('')}</span></div></div>`,
  script: `
  tap(264, 308, 1.1);
  markOn('ot', 2.6);
  tl.fromTo(P + 'pill', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, 3.4);
  tl.set(P + 'v0', { opacity: 1 }, 3.4);
  tap(329, 422, 5.0); show('s105', 5.1); tl.set(P + 'v0', { opacity: 0 }, 5.1); tl.set(P + 'v1', { opacity: 1 }, 5.1);
  tap(329, 422, 6.3); show('s11', 6.4); tl.set(P + 'v1', { opacity: 0 }, 6.4); tl.set(P + 'v2', { opacity: 1 }, 6.4);
  tl.fromTo(P + 'pill', { scale: 1 }, { scale: 1.06, duration: 0.15, yoyo: true, repeat: 1, immediateRender: false }, 5.1);
  tl.fromTo(P + 'pill', { scale: 1 }, { scale: 1.06, duration: 0.15, yoyo: true, repeat: 1, immediateRender: false }, 6.4);`,
});

/* ---------- 5 · day by day ---------- */
scene({
  id: '05-day-sheet', p: 'm05', dur: 11.8, fade: true,
  css: underCss('m05') + `.m05-f{display:flex;align-items:baseline;gap:16px;padding:20px 30px;border-radius:26px;background:#123a30;border:3px solid rgba(16,185,129,.45);box-shadow:0 18px 44px rgba(0,0,0,.45);font:800 46px/1 'Montserrat',sans-serif;color:${C.ink};white-space:nowrap}
.m05-f span{opacity:0}.m05-f small{font:500 30px 'Roboto',sans-serif;color:${C.soft}}.m05-f b{color:${C.acc3}}`,
  body: phone('m05', ['ds-empty', 'ds-day', 'ds-h', 'ds-hm', 'ds-next'].map((f, i) => shot('m05', f, `man-${f}`, i ? 'opacity:0' : '')).join('')) +
    mark('m05', 'sum', [10, 556, 370, 26], 4) + mark('m05', 'tot', [10, 722, 370, 30], 4, 'ok') + taps('m05', 3) +
    `<div class="m05-under"><div class="m05-f" id="m05-f"><span id="m05-a">11:47</span><span id="m05-b">− 1:00 <small>lunch</small></span><span id="m05-c">− 8:00</span><span id="m05-d">= <b>2:47</b></span></div></div>`,
  script: `
  tap(92, 412, 1.9); show('ds-day', 2.1, 0.2);
  tap(169, 554, 3.0); show('ds-h', 3.35); show('ds-hm', 3.9);
  markOn('sum', 5.4);
  const part = (id, t) => tl.fromTo(P + id, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'expo.out' }, t);
  part('a', 5.3); part('b', 5.9); part('c', 7.2); part('d', 8.1);
  markOn('tot', 8.3);
  tap(337, 470, 9.9); show('ds-next', 10.1, 0.15);`,
});

/* ---------- 6 · what each day means ---------- */
scene({
  id: '06-day-types', p: 'm06', dur: 10,
  css: dimCss('m06') + listCss('m06'),
  body: phone('m06', shot('m06', 'hm', 'man-ds-hm') + '<div class="m06-dim" id="m06-dim"></div>') +
    [['Normal', 'Overtime after 9 hrs at work', ''], ['Friday', 'Everything after lunch is overtime', ''], ['Holiday', 'Everything after lunch is overtime', ''],
      ['Absent', "A day's pay is deducted", ' warn'], ['Medical leave', 'Paid, with no overtime', '']]
      .map(([t, s, c], i) => card('m06', i, 250 + i * 230, t, s, c)).join(''),
  script: `
  tl.fromTo(P + 'dim', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.2);
  ${cardIn(0, 0.3)} ${cardIn(1, 0.6)} ${cardIn(2, 1.3)} ${cardIn(3, 4.8)} ${cardIn(4, 6.5)}`,
});

chapter('07-ch2', '2', 'Import your attendance');

/* ---------- 8 · import ---------- */
scene({
  id: '08-import', p: 'm08', dur: 10.6, fade: true,
  css: underCss('m08') + `.m08-pick{position:absolute;inset:0;background:rgba(5,22,18,.93);opacity:0;z-index:14}
.m08-pt{position:absolute;width:150px;height:325px;border:4px solid #fff;border-radius:14px;overflow:hidden;background:#f3f4f7;box-sizing:border-box;opacity:0}
.m08-pt img{width:100%;display:block}
.m08-bar{position:absolute;left:${px(38)}px;top:${px(734)}px;height:${px(7)}px;width:${px(314)}px;border-radius:99px;background:#244a40;z-index:13;opacity:0;overflow:hidden}
.m08-fill{width:100%;height:100%;border-radius:99px;background:${C.acc};transform-origin:0 50%}`,
  body: phone('m08', shot('m08', 'imp', 'app-import') + shot('m08', 'read', 'app-import-reading', 'opacity:0') +
    `<div class="m08-bar" id="m08-bar"><div class="m08-fill" id="m08-fill"></div></div>` +
    shot('m08', 'prev', 'app-import-preview', 'opacity:0') +
    `<div class="m08-pick" id="m08-pick">${[0, 1, 2, 3, 4, 5].map((i) => `<div class="m08-pt" id="m08-pt${i}" style="left:${39 + (i % 3) * 170}px;top:${250 + Math.floor(i / 3) * 360}px"><img src="assets/img/ocr-${i + 1}.png" alt=""></div>`).join('')}</div>`) +
    mark('m08', 'chk', [8, 200, 374, 116], 4, 'ok') + taps('m08', 1) +
    `<div class="m08-under"><div class="m08-pill" id="m08-pill"><svg width="44" height="44" viewBox="0 0 24 24" fill="${C.acc3}"><circle cx="12" cy="12" r="11" fill="none" stroke="${C.acc3}" stroke-width="2"/><path d="M10 8l6 4-6 4z"/></svg><span class="m08-pv" style="font-size:40px">Full steps: the Import video</span></div></div>`,
  script: `
  tap(195, 712, 1.5);
  tl.fromTo(P + 'pick', { opacity: 0 }, { opacity: 1, duration: 0.25, immediateRender: false }, 1.7);
  tl.fromTo([0, 1, 2, 3, 4, 5].map((i) => P + 'pt' + i), { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.8)', stagger: 0.08, immediateRender: false }, 1.8);
  tl.to(P + 'pick', { opacity: 0, duration: 0.3 }, 3.3);
  show('read', 3.3); tl.set(P + 'bar', { opacity: 1 }, 3.3);
  tl.fromTo(P + 'fill', { scaleX: 0.04 }, { scaleX: 0.95, duration: 1.8, ease: 'power1.inOut', immediateRender: false }, 3.35);
  show('prev', 5.25, 0.25); tl.set(P + 'bar', { opacity: 0 }, 5.25);
  markOn('chk', 5.9);
  tl.fromTo(P + 'pill', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, 7.9);`,
});

chapter('09-ch3', '3', 'History and your payslip');

/* ---------- 10 · a finished month files itself ---------- */
scene({
  id: '10-history', p: 'm10', dur: 8, fade: true,
  css: `.m10-dim{position:absolute;inset:0;background:rgba(3,14,11,.5);opacity:0;z-index:8}
.m10-pop{position:absolute;left:${px(13)}px;top:${px(635)}px;width:${px(364)}px;height:${px(196)}px;border-radius:26px;overflow:hidden;background:url('assets/img/app-filled-popup.png') -${px(13)}px -${px(635)}px/${SCREEN.width}px auto;box-shadow:0 20px 50px rgba(0,0,0,.6);z-index:10;opacity:0}`,
  body: phone('m10', shot('m10', 'filled', 'app-daysheet-filled') + '<div class="m10-dim" id="m10-dim"></div>' +
    shot('m10', 'done', 'app-filled-popup', 'opacity:0;z-index:9') + '<div class="m10-pop" id="m10-pop"></div>' +
    shot('m10', 'hist', 'man-hist-waiting', 'opacity:0;z-index:11')) + mark('m10', 'card', [16, 382, 358, 192], 4, 'ok'),
  script: `
  ${up}
  tl.fromTo(P + 'dim', { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, 2.6);
  tl.fromTo(P + 'pop', { opacity: 1, y: ${px(260)} }, { y: 0, duration: 0.6, ease: 'back.out(1.5)', immediateRender: false }, 2.65);
  show('done', 3.3);
  slide('hist', 4.7);
  markOn('card', 5.4);`,
});

/* ---------- 11 · check your payslip ---------- */
scene({
  id: '11-payslip', p: 'm11', dur: 10.2,
  body: phone('m11', shot('m11', 'wait', 'man-hist-waiting') + shot('m11', 'p0', 'man-paid-0', 'opacity:0') +
    shot('m11', 'p1', 'man-paid-typed', 'opacity:0') + shot('m11', 'short', 'man-hist-short', 'opacity:0')) +
    mark('m11', 'diff', [12, 682, 366, 72], 4) + mark('m11', 'when', [22, 457, 262, 22], 4, 'ok') + taps('m11', 3),
  script: `
  ${up}
  tap(195, 532, 1.9); up('p0', 2.1);
  tap(195, 498, 3.0); show('p1', 3.3);
  markOn('diff', 4.4);
  tap(195, 800, 5.4); show('short', 5.7, 0.2);
  tl.set(P + 'diff', { opacity: 0 }, 5.7);
  markOn('when', 6.9);`,
});

/* ---------- 12 · your year ---------- */
scene({
  id: '12-year', p: 'm12', dur: 9,
  css: `.m12-card{position:absolute;left:70px;right:70px;top:1010px;padding:34px 40px;border-radius:28px;background:#123a30;border:3px solid rgba(16,185,129,.5);box-shadow:0 26px 70px rgba(0,0,0,.55);z-index:40;opacity:0}
.m12-l{font:500 32px/1 'Roboto',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:${C.soft}}
.m12-v{margin-top:16px;font:800 76px/1 'Montserrat',sans-serif;color:${C.ink};font-variant-numeric:tabular-nums}
.m12-v small{font:700 38px 'Montserrat',sans-serif;color:${C.soft}}
.m12-track{margin-top:24px;height:22px;border-radius:99px;background:#244a40;overflow:hidden}
.m12-fill{width:100%;height:100%;background:${C.acc};border-radius:99px;transform-origin:0 50%}
.m12-docs{display:flex;gap:18px;margin-top:28px}
.m12-doc{display:flex;align-items:center;gap:12px;padding:12px 24px;border-radius:18px;background:#1c4a3e;font:800 36px/1 'Montserrat',sans-serif;color:${C.ink};opacity:0}`,
  body: phone('m12', shot('m12', 'hist', 'man-hist-short')) + mark('m12', 'lim', [12, 232, 366, 54], 4, 'ok') +
    `<div class="m12-card" id="m12-card"><div class="m12-l">Overtime this year</div><div class="m12-v"><span id="m12-n">0:00</span> <small>of 720 hrs</small></div><div class="m12-track"><div class="m12-fill" id="m12-fill"></div></div>
<div class="m12-docs">${['PDF', 'Spreadsheet'].map((d, i) => `<div class="m12-doc" id="m12-d${i}"><svg width="30" height="36" viewBox="0 0 20 24" fill="none" stroke="${C.acc3}" stroke-width="2.2"><path d="M3 1h9l5 5v17H3z"/><path d="M12 1v5h5"/></svg>${d}</div>`).join('')}</div></div>`,
  script: `
  markOn('lim', 1.2);
  tl.fromTo(P + 'card', { opacity: 0, y: 70 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, 2.3);
  const el = document.querySelector(P + 'n'), o = { v: 0 };
  tl.to(o, { v: 60 * 60 + 18, duration: 1.6, ease: 'power2.out', onUpdate: () => { const m = Math.round(o.v); el.textContent = Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0'); } }, 2.6);
  tl.fromTo(P + 'fill', { scaleX: 0 }, { scaleX: ${(60.3 / 720).toFixed(4)}, duration: 1.6, ease: 'power2.out' }, 2.6);
  tl.fromTo([P + 'd0', P + 'd1'], { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2)', stagger: 0.2 }, 7.4);`,
});

chapter('13-ch4', '4', 'End of Service');

/* ---------- 14 · if you left today ---------- */
scene({
  id: '14-esb', p: 'm14', dur: 11.8, fade: true,
  body: phone('m14', shot('m14', 'join', 'man-esb-joining') + shot('m14', 'res', 'man-esb-i', 'opacity:0') + shot('m14', 'end', 'man-esb-contract', 'opacity:0')) +
    mark('m14', 'hint', [18, 712, 354, 30], 4, 'ok') + mark('m14', 'third', [12, 104, 366, 140], 4) + mark('m14', 'full', [12, 104, 366, 150], 4, 'ok') + taps('m14', 2),
  script: `
  tap(195, 674, 3.3);
  markOn('hint', 4.1);
  show('res', 5.7, 0.25); tl.set(P + 'hint', { opacity: 0 }, 5.7);
  markOn('third', 6.3);
  tap(304, 702, 9.1); show('end', 9.35); tl.set(P + 'third', { opacity: 0 }, 9.35);
  markOn('full', 9.7);`,
});

/* ---------- 15 · leave, ticket, unpaid leave ---------- */
scene({
  id: '15-leave', p: 'm15', dur: 9.4,
  body: phone('m15', shot('m15', 'leave', 'man-esb-leave') + shot('m15', 'str', 'man-esb-stretch', 'opacity:0') + shot('m15', 'top', 'app-esb-top', 'opacity:0')) +
    mark('m15', 'bal', [12, 726, 366, 32], 4, 'ok') + mark('m15', 'note', [12, 318, 366, 56], 4, 'ok') + taps('m15', 1),
  script: `
  markOn('bal', 0.9);
  tap(195, 180, 2.9); show('str', 3.2, 0.2); tl.set(P + 'bal', { opacity: 0 }, 3.2);
  show('top', 5.9, 0.25);
  markOn('note', 6.4);`,
});

chapter('16-ch5', '5', 'Settings');

/* ---------- 17 · your working day ---------- */
scene({
  id: '17-working-day', p: 'm17', dur: 10.2, fade: true,
  css: `.m17-ring{position:absolute;width:150px;height:150px;margin:-75px 0 0 -75px;border-radius:50%;border:8px solid ${C.acc3};opacity:0;z-index:31}`,
  body: phone('m17', shot('m17', 'home', 'man-home') + shot('m17', 'set', 'man-settings', 'opacity:0') +
    shot('m17', 'day', 'man-workday', 'opacity:0') + shot('m17', 'shift', 'man-workday-shift', 'opacity:0')) +
    `<div class="m17-ring" id="m17-ring"></div>` +
    mark('m17', 'hrs', [12, 200, 366, 56], 4, 'ok') + mark('m17', 'lunch', [12, 334, 366, 58], 4, 'ok') +
    mark('m17', 'sh', [12, 345, 366, 62], 4, 'ok') + mark('m17', 'abs', [12, 488, 366, 80], 4, 'ok') + taps('m17', 2),
  script: `
  ${up}
  // The gear, lit first: it is where every rule below lives.
  tl.set(P + 'ring', { left: SX + 352 * K, top: SY + 58 * K }, 0);
  tl.fromTo(P + 'ring', { opacity: 0, scale: 1.8 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2)' }, 0.3);
  tl.to(P + 'ring', { scale: 1.15, duration: 0.25, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 0.8);
  tap(352, 58, 1.35);
  tl.to(P + 'ring', { opacity: 0, duration: 0.25 }, 1.4);
  up('set', 1.55);
  tap(195, 495, 2.5); show('day', 2.75, 0.2);
  markOn('hrs', 3.4); markOn('lunch', 4.3);
  show('shift', 5.2, 0.25); tl.set([P + 'hrs', P + 'lunch'], { opacity: 0 }, 5.2);
  markOn('sh', 5.5); markOn('abs', 7.6);`,
});

/* ---------- 18 · the rest of Settings ---------- */
scene({
  id: '18-settings', p: 'm18', dur: 8.7,
  body: phone('m18', shot('m18', 'set', 'man-settings') + shot('m18', 'more', 'app-settings-more', 'opacity:0')) +
    mark('m18', 'paid', [8, 280, 374, 168], 4, 'ok') + mark('m18', 'exp', [8, 442, 374, 42], 4, 'ok') +
    mark('m18', 'lang', [8, 500, 374, 42], 4, 'ok') + mark('m18', 'bak', [8, 656, 374, 54], 4, 'ok'),
  script: `
  markOn('paid', 0.6);
  tl.fromTo(P + 'more', { opacity: 1, y: ${px(300)} }, { y: 0, duration: 0.5, ease: 'power3.out', immediateRender: false }, 2.3);
  tl.fromTo(P + 'more', { opacity: 0 }, { opacity: 1, duration: 0.2, immediateRender: false }, 2.3);
  tl.set(P + 'paid', { opacity: 0 }, 2.3);
  markOn('exp', 2.9); markOn('lang', 5.7); markOn('bak', 7.0);`,
});

/* ---------- 19 · close ---------- */
scene({
  id: '19-close', p: 'm19', dur: 4.5, fade: true,
  css: `.m19-icon{position:absolute;left:86px;top:420px;width:160px;height:160px;border-radius:38px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.m19-icon img{width:100%;height:100%;display:block}
.m19-title{position:absolute;left:86px;right:60px;top:660px}
.m19-l{display:block;font:900 118px/1.04 'Montserrat',sans-serif;letter-spacing:-.02em;color:${C.ink}}
.m19-acc{color:${C.acc3}}
.m19-p{margin-top:56px;font:700 48px/1.35 'Montserrat',sans-serif;color:${C.soft}}`,
  body: `<div class="m19-icon" id="m19-icon"><img src="assets/img/app-icon.png" alt=""></div>
<div class="m19-title"><span class="m19-l" id="m19-l1">Your pay,</span><span class="m19-l m19-acc" id="m19-l2">checked.</span><div class="m19-p" id="m19-p">Everything stays on your phone.</div></div>`,
  script: `
  tl.fromTo(P + 'icon', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, 0.2);
  tl.fromTo([P + 'l1', P + 'l2'], { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.4 }, 0.45);
  tl.fromTo(P + 'p', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, 1.8);`,
});

/* ---------- timing ---------- */

let t = 0;
for (const s of scenes) {
  s.start = t;
  s.voice = voices[n(s)];
  if (s.voice) {
    s.vo = +(t + (s.lead ?? (s.fade ? 0.5 : 0.3))).toFixed(2);
    if (s.vo - s.start + s.voice.duration_s > s.dur) throw new Error(`${s.id}: voice ${s.voice.duration_s}s does not fit ${s.dur}s`);
  }
  t = +(t + s.dur).toFixed(2);
}
const total = t;
scenes.forEach((s, i) => { s.hold = +(s.dur + (scenes[i + 1]?.fade ? 0.5 : 0)).toFixed(2); });

/* ---------- write ---------- */

for (const s of scenes) writeFile(root, `compositions/frames/${s.id}.html`, sceneFile(s));
const groups = scenes.filter((s) => s.voice).flatMap((s) => captionGroups(lines[n(s)], s.voice.words, s.vo));
writeFile(root, 'compositions/captions.html', captionsFile(groups, total));

const fades = scenes.map((s, i) => (s.fade && i ? `
    tl.fromTo('#el-${s.id}', { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power1.inOut' }, ${s.start});
    tl.to('#el-${scenes[i - 1].id}', { opacity: 0, duration: 0.3, ease: 'power1.in' }, ${+(s.start + 0.2).toFixed(2)});` : '')).join('');

const index = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <title>Using Overtime Calculator</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>${fontFaces}
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; background: ${C.bg}; }
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; background: ${C.bg}; }
      #bg { position: absolute; inset: 0; background:
        radial-gradient(640px 640px at 82% 12%, rgba(16,185,129,.20), transparent 70%),
        radial-gradient(760px 760px at 10% 88%, rgba(5,150,105,.14), transparent 70%); }
      [data-composition-src] { position: absolute; inset: 0; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="${W}" data-height="${H}">
      <div id="bg" class="clip" data-start="0" data-duration="${total}" data-track-index="0"></div>
${scenes.map((s, i) => `      <div id="el-${s.id}" data-composition-id="${s.id}" data-composition-src="compositions/frames/${s.id}.html" data-start="${s.start}" data-duration="${s.hold}" data-track-index="${1 + (i % 2)}" data-width="${W}" data-height="${H}" style="z-index:${i + 1}"></div>`).join('\n')}
${scenes.filter((s) => s.voice).map((s) => `      <audio id="vo-${n(s)}" src="${s.voice.path}" data-start="${s.vo}" data-duration="${s.voice.duration_s}" data-track-index="10" data-volume="1"></audio>`).join('\n')}
      <div id="el-captions" data-track-kind="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="${total}" data-track-index="5" data-width="${W}" data-height="${H}" style="z-index:50"></div>
    </div>
    <script>
    const tl = gsap.timeline({ paused: true });${fades}
    window.__timelines['main'] = tl;
    </script>
  </body>
</html>
`;
writeFile(root, 'index.html', index);

// Chapter start times: the app's "Watch how" links jump to these.
const chapters = scenes.filter((s) => /-ch\d/.test(s.id)).map((s) => ({ id: s.id, start: s.start }));
writeFile(root, 'chapters.json', JSON.stringify({ total, chapters }, null, 2) + '\n');
console.log('total', total, 's ·', groups.length, 'caption groups ·', chapters.map((c) => `${c.id}@${c.start}`).join(' '));
