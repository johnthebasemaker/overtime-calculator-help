// Writes the "Import your attendance" scenes and index.html from the
// storyboard's voiceover lines, audio_meta.json (real voice timings) and the
// captures in assets/img. Re-run after changing any of those:
//
//   node build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  C, H, W, SCREEN, at, px, captionGroups, captionsFile, fontFaces, kicker, mark, phone, sceneFile, shot, taps, writeFile,
} from '../../tools/video-kit.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const meta = JSON.parse(fs.readFileSync(path.join(root, 'audio_meta.json'), 'utf8'));
const board = fs.readFileSync(path.join(root, 'STORYBOARD.md'), 'utf8');
const lines = [...board.matchAll(/## Frame (\d+)[^\n]*\n[\s\S]*?- voiceover: "(.*)"/g)].map((m) => m[2]);

/* ---------- scenes ---------- */
// Durations are the voice length plus room for the action; fade: the scene
// crossfades in (the seam map), else a cut.
const scenes = [];
const scene = (s) => scenes.push(s);

// Screens a worker takes down the table (CSS px scroll offsets) — the same
// stops tools/capture.mjs used for ocr-1..5.
const STOPS = [0, 640, 1280, 1920, 2458];
const THUMB = { left: 925, top: 330, step: 70, width: 110, height: 238 };
const thumbCss = (p) => `.${p}-th{position:absolute;left:${THUMB.left}px;width:${THUMB.width}px;height:${THUMB.height}px;border:5px solid #fff;border-radius:14px;box-sizing:border-box;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.55);background:#f3f4f7;z-index:40}
.${p}-th img{width:100%;display:block}`;
const thumb = (p, i, style = '') => `<div class="${p}-th" id="${p}-th${i}" style="top:${THUMB.top + i * THUMB.step}px;${style}"><img src="assets/img/ocr-${i + 1}.png" alt=""></div>`;
// A thumbnail leaves the phone at screen size and shrinks into its slot.
const flyJs = `
  const fly = (i, t) => {
    const cx = ${THUMB.left + THUMB.width / 2}, cy = ${THUMB.top} + i * ${THUMB.step} + ${THUMB.height / 2};
    tl.fromTo(P + 'th' + i, { opacity: 1, x: ${SCREEN.left + SCREEN.width / 2} - cx, y: ${SCREEN.top + SCREEN.height / 2} - cy, scale: ${(SCREEN.width / THUMB.width).toFixed(3)} },
      { x: 0, y: 0, scale: 1, duration: 0.6, ease: 'power3.inOut', immediateRender: false }, t);
  };`;
const barOverlay = (p) => `<div id="${p}-bar" style="position:absolute;left:0;top:0;width:${SCREEN.width}px;height:${px(52)}px;background:url('assets/img/portal-table.png') 0 0/${SCREEN.width}px auto;z-index:12"></div>`;

scene({
  id: '01-promise', p: 'f01', dur: 5, lead: 0.15,
  css: `.f01-icon{position:absolute;left:86px;top:300px;width:200px;height:200px;border-radius:46px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.f01-icon img{width:100%;height:100%;display:block}
.f01-title{position:absolute;left:86px;right:60px;top:590px}
.f01-l{display:block;font:900 100px/1.06 'Montserrat',sans-serif;letter-spacing:-.02em;color:${C.ink};transform-origin:0 70%}
.f01-acc{color:${C.acc3}}
.f01-sc{position:absolute;top:1100px;width:170px;height:368px;border:6px solid #fff;border-radius:18px;overflow:hidden;box-shadow:0 18px 44px rgba(0,0,0,.55);background:#f3f4f7}
.f01-sc img{width:100%;display:block}`,
  body: `<div class="f01-icon" id="f01-icon"><img src="assets/img/app-icon.png" alt=""></div>
<div class="f01-title" id="f01-title"><span class="f01-l" id="f01-l1">Your whole</span><span class="f01-l" id="f01-l2">month.</span><span class="f01-l" id="f01-l3">From a few</span><span class="f01-l f01-acc" id="f01-l4">screenshots.</span></div>
<div class="f01-sc" id="f01-s1" style="left:250px"><img src="assets/img/ocr-1.png" alt=""></div>
<div class="f01-sc" id="f01-s2" style="left:455px"><img src="assets/img/ocr-3.png" alt=""></div>
<div class="f01-sc" id="f01-s3" style="left:660px"><img src="assets/img/ocr-5.png" alt=""></div>`,
  script: `
  tl.fromTo(P + 'icon', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.8)' }, 0.1);
  tl.fromTo(P + 'l1', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, 0.35);
  tl.fromTo(P + 'l2', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, 0.95);
  tl.fromTo(P + 'l3', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, 2.3);
  tl.fromTo(P + 'l4', { opacity: 0, scale: 0.55 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(2.2)' }, 2.85);
  tl.fromTo([P + 's1', P + 's2', P + 's3'], { opacity: 0, y: 160, rotation: (i) => [-14, 0, 14][i] },
    { opacity: 1, y: 0, rotation: (i) => [-7, 0, 7][i], duration: 0.7, ease: 'back.out(1.6)', stagger: 0.12 }, 3.3);
  tl.fromTo(P + 'title', { y: 0 }, { y: -14, duration: 5, ease: 'none' }, 0);`,
});

scene({
  id: '02-open-report', p: 'f02', dur: 7, fade: true,
  body: kicker('f02', 'Step 1', 'Open the report') + phone('f02',
    shot('f02', 'dash', 'portal-dashboard') + shot('f02', 'menu', 'portal-menu', 'opacity:0')) +
    mark('f02', 'daily', [0, 489, 390, 34], 0) + taps('f02', 3),
  script: `
  kick();
  tap(26, 26, 2.75);
  tl.fromTo(P + 'menu', { opacity: 1, x: -${SCREEN.width} }, { x: 0, duration: 0.45, ease: 'power3.out', immediateRender: false }, 2.9);
  tl.set(P + 'menu', { opacity: 0 }, 0);
  tap(195, 275, 3.6);
  tap(195, 506, 5.0);
  markOn('daily', 5.2);`,
});

scene({
  id: '03-dates-search', p: 'f03', dur: 5,
  body: kicker('f03', 'Step 2', 'Dates, then Search') + phone('f03',
    shot('f03', 'form', 'portal-form') + shot('f03', 'cal', 'portal-calendar', 'opacity:0') +
    shot('f03', 'from', 'portal-fromset', 'opacity:0') + shot('f03', 'calto', 'portal-calendarTo', 'opacity:0') +
    shot('f03', 'filled', 'portal-filled', 'opacity:0') + shot('f03', 'table', 'portal-table', 'opacity:0')) + taps('f03', 5),
  script: `
  kick();
  tap(195, 210, 0.55); show('cal', 0.7, 0.15);
  tap(286, 342, 1.15); show('from', 1.3);
  tap(195, 292, 1.65); show('calto', 1.8, 0.15);
  tap(88, 579, 2.15); show('filled', 2.3);
  tap(76, 349, 2.95);
  tl.fromTo(P + 'table', { opacity: 1, x: ${SCREEN.width} }, { x: 0, duration: 0.5, ease: 'power3.out', immediateRender: false }, 3.2);`,
});

scene({
  id: '04-screenshots', p: 'f04', dur: 7.5,
  css: thumbCss('f04'),
  body: kicker('f04', 'Step 3', 'Screenshot the table') + phone('f04',
    shot('f04', 'full', 'portal-table-full').replace('<img', '<img data-layout-allow-overflow') + barOverlay('f04') + '<div class="f04-flash" id="f04-flash"></div>') +
    mark('f04', 'total', [4, 713 - 4, 382, 48], 0) +
    [0, 1, 2, 3, 4].map((i) => thumb('f04', i, 'opacity:0')).join(''),
  script: `
  kick();${flyJs}
  const stops = ${JSON.stringify(STOPS)}.map((s) => -s * ${px(1)});
  const flashes = [0.6, 1.7, 2.6, 3.5, 4.45];
  stops.forEach((y, i) => {
    if (i) tl.to(P + 'full', { y, duration: 0.5, ease: 'power2.inOut' }, flashes[i] - 0.7);
    flash(flashes[i]);
    fly(i, flashes[i] + 0.15);
  });
  markOn('total', 4.15);
  tl.to([P + 'th0', P + 'th1', P + 'th2', P + 'th3', P + 'th4'], { x: -10, duration: 0.25, ease: 'power2.out', stagger: 0.08, yoyo: true, repeat: 1 }, 5.0);`,
});

scene({
  id: '05-sideways', p: 'f05', dur: 8,
  css: thumbCss('f05') + `
.f05-swipe{position:absolute;width:108px;height:108px;margin:-54px 0 0 -54px;border-radius:50%;border:10px solid ${C.amber};background:rgba(245,158,11,.22);box-sizing:border-box;opacity:0;z-index:30}`,
  body: kicker('f05', 'Step 4', 'One more, sideways') + phone('f05',
    shot('f05', 'full', 'portal-table-full', `transform:translateY(-${px(STOPS[4])}px)`).replace('<img', '<img data-layout-allow-overflow') +
    shot('f05', 'side', 'portal-sideways', 'opacity:0') + barOverlay('f05') + '<div class="f05-flash" id="f05-flash"></div>') +
    mark('f05', 'sick', [266, 414, 120, 36], 2) +
    `<div class="f05-swipe" id="f05-swipe" style="left:760px;top:1180px"></div>` +
    [0, 1, 2, 3, 4].map((i) => thumb('f05', i)).join('') +
    thumb('f05', 5, 'opacity:0'),
  script: `
  kick();${flyJs}
  tl.fromTo(P + 'swipe', { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }, 1.0);
  tl.to(P + 'swipe', { x: -380, duration: 0.7, ease: 'power2.inOut' }, 1.35);
  tl.to(P + 'swipe', { opacity: 0, duration: 0.25 }, 2.05);
  tl.fromTo(P + 'full', { x: 0, y: -${px(STOPS[4])} }, { x: -${SCREEN.width}, y: -${px(STOPS[4])}, duration: 0.7, ease: 'power2.inOut' }, 1.35);
  tl.fromTo(P + 'side', { x: ${SCREEN.width}, opacity: 1 }, { x: 0, duration: 0.7, ease: 'power2.inOut', immediateRender: false }, 1.35);
  flash(3.45);
  fly(5, 3.6);
  markOn('sick', 5.3);`,
});

scene({
  id: '06-upload', p: 'f06', dur: 9.5, fade: true,
  css: `.f06-pick{position:absolute;inset:0;background:rgba(5,22,18,.93);opacity:0;z-index:14}
.f06-pt{position:absolute;width:150px;height:325px;border:4px solid #fff;border-radius:14px;overflow:hidden;background:#f3f4f7;box-sizing:border-box;opacity:0}
.f06-pt img{width:100%;display:block}
.f06-ok{position:absolute;right:-2px;top:-2px;width:52px;height:52px;border-radius:0 12px 0 16px;background:${C.acc};display:grid;place-items:center;opacity:0}
.f06-bar{position:absolute;left:${px(38)}px;top:${px(734)}px;height:${px(7)}px;width:${px(314)}px;border-radius:99px;background:#244a40;z-index:13;opacity:0;overflow:hidden}
.f06-fill{width:100%;height:100%;border-radius:99px;background:${C.acc};transform-origin:0 50%}
.f06-chip{position:absolute;left:76px;top:200px;display:flex;align-items:center;gap:12px;padding:10px 22px 10px 16px;border-radius:99px;background:rgba(16,185,129,.18);border:2px solid rgba(110,231,183,.5);font:800 34px/1 'Montserrat',sans-serif;color:${C.acc3};opacity:0}`,
  body: kicker('f06', 'Step 5', 'Import in the app') +
    `<div class="f06-chip" id="f06-chip"><svg width="30" height="34" viewBox="0 0 24 28" fill="none" stroke="${C.acc3}" stroke-width="3"><rect x="2" y="12" width="20" height="14" rx="3"/><path d="M6 12V8a6 6 0 0 1 12 0v4"/></svg>Offline</div>` +
    phone('f06',
      shot('f06', 'home', 'app-home-daybyday') + shot('f06', 'sheet', 'app-daysheet-empty', 'opacity:0') +
      shot('f06', 'import', 'app-import', 'opacity:0') + shot('f06', 'read', 'app-import-reading', 'opacity:0') +
      `<div class="f06-bar" id="f06-bar"><div class="f06-fill" id="f06-fill"></div></div>` +
      `<div class="f06-pick" id="f06-pick">${[0, 1, 2, 3, 4, 5].map((i) => {
        const l = 39 + (i % 3) * 170, t = 250 + Math.floor(i / 3) * 360;
        return `<div class="f06-pt" id="f06-pt${i}" style="left:${l}px;top:${t}px"><img src="assets/img/ocr-${i + 1}.png" alt=""><div class="f06-ok" id="f06-ok${i}"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg></div></div>`;
      }).join('')}</div>`) + taps('f06', 3),
  script: `
  kick();
  const up = (id, t) => tl.fromTo(P + id, { opacity: 1, y: ${SCREEN.height} }, { y: 0, duration: 0.45, ease: 'power3.out', immediateRender: false }, t);
  tap(195, 422, 2.1); up('sheet', 2.3);
  tap(195, 274, 3.3); up('import', 3.5);
  tap(195, 712, 4.2);
  tl.fromTo(P + 'pick', { opacity: 0 }, { opacity: 1, duration: 0.25, immediateRender: false }, 4.45);
  const pts = [0, 1, 2, 3, 4, 5].map((i) => P + 'pt' + i), oks = [0, 1, 2, 3, 4, 5].map((i) => P + 'ok' + i);
  tl.fromTo(pts, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.8)', stagger: 0.08, immediateRender: false }, 4.55);
  tl.fromTo(oks, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.5)', stagger: 0.08, immediateRender: false }, 5.05);
  tl.to(P + 'pick', { opacity: 0, duration: 0.3 }, 5.95);
  show('read', 5.95);
  tl.set(P + 'bar', { opacity: 1 }, 5.95);
  tl.fromTo(P + 'fill', { scaleX: 0.04 }, { scaleX: 0.92, duration: 3.2, ease: 'power1.inOut', immediateRender: false }, 6.0);
  tl.fromTo(P + 'chip', { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.5, ease: 'expo.out', immediateRender: false }, 7.45);`,
});

scene({
  id: '07-check', p: 'f07', dur: 7.5,
  css: `.f07-dim{position:absolute;inset:0;background:rgba(6,20,16,.62);opacity:0;z-index:5}
.f07-card{position:absolute;left:70px;right:70px;top:560px;padding:44px 48px 30px;border-radius:30px;background:#123a30;border:3px solid rgba(16,185,129,.55);box-shadow:0 30px 80px rgba(0,0,0,.55);z-index:40}
.f07-head{display:flex;align-items:center;gap:20px;font:800 52px/1.1 'Montserrat',sans-serif;color:${C.ink};margin-bottom:22px}
.f07-row{display:grid;grid-template-columns:1fr auto 66px;align-items:center;gap:22px;padding:22px 0;border-top:2px solid rgba(195,217,207,.14)}
.f07-lab{font:500 36px/1.2 'Roboto',sans-serif;color:${C.soft}}
.f07-lab small{display:block;font-size:27px;margin-top:6px;color:rgba(195,217,207,.7)}
.f07-val{font:800 54px/1 'Montserrat',sans-serif;color:${C.ink};font-variant-numeric:tabular-nums;text-align:right}
.f07-tick{width:66px;height:66px;border-radius:50%;background:${C.acc};display:grid;place-items:center;opacity:0}`,
  body: kicker('f07', 'Proof', 'It checks itself') +
    phone('f07', shot('f07', 'prev', 'app-import-preview') + '<div class="f07-dim" id="f07-dim"></div>') +
    `<div class="f07-card" id="f07-card"><div class="f07-head"><svg width="58" height="58" viewBox="0 0 24 24" fill="none" stroke="${C.acc3}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6.5"/></svg>Matches the report</div>
${[['Days read', 'of 31', '0'], ['Work Hrs', 'report 282:32', '0:00'], ['Overtime', 'report 57:32', '0:00']].map(([l, s, v], i) =>
  `<div class="f07-row"><div class="f07-lab">${l}<small>${s}</small></div><div class="f07-val" id="f07-v${i}">${v}</div><div class="f07-tick" id="f07-t${i}"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg></div></div>`).join('')}
</div>`,
  script: `
  kick();
  tl.fromTo(P + 'dim', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.4);
  tl.fromTo(P + 'card', { opacity: 0, y: 90 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }, 0.5);
  const hm = (m) => Math.floor(m / 60) + ':' + String(Math.round(m % 60)).padStart(2, '0');
  const count = (i, to, fmt, t, d) => {
    const el = document.querySelector(P + 'v' + i), o = { v: 0 };
    tl.to(o, { v: to, duration: d, ease: 'power2.out', onUpdate: () => { el.textContent = fmt(o.v); } }, t);
    tl.fromTo(P + 't' + i, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2.6)', immediateRender: false }, t + d + 0.05);
  };
  count(0, 31, (v) => String(Math.round(v)), 1.0, 0.8);
  count(1, 282 * 60 + 32, (v) => hm(Math.round(v)), 1.95, 0.95);
  count(2, 57 * 60 + 32, (v) => hm(Math.round(v)), 3.0, 0.8);
  [0, 1, 2].forEach((i) => tl.to(P + 't' + i, { scale: 1.25, duration: 0.18, ease: 'power2.out', yoyo: true, repeat: 1 }, 4.8 + i * 0.3));
  tl.to(P + 'card', { borderColor: '${C.acc3}', duration: 0.5 }, 5.7);`,
});

scene({
  id: '08-worked-out', p: 'f08', dur: 8,
  css: `.f08-dim{position:absolute;inset:0;background:rgba(6,20,16,.6);opacity:0;z-index:5}
.f08-card{position:absolute;left:70px;right:70px;padding:30px 40px 34px;border-radius:28px;background:#123a30;border:3px solid rgba(16,185,129,.4);box-shadow:0 24px 60px rgba(0,0,0,.5);z-index:40;opacity:0}
.f08-card.warn{border-color:rgba(245,158,11,.75);border-left-width:12px}
.f08-lab{font:500 28px/1 'Roboto',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:${C.soft};margin-bottom:20px}
.f08-row{display:flex;align-items:center;gap:22px}
.f08-from{padding:14px 24px;border-radius:16px;background:#244a40;font:500 38px/1 'Roboto',sans-serif;color:${C.ink};white-space:nowrap}
.f08-to{padding:14px 26px;border-radius:16px;background:${C.acc2};font:800 40px/1 'Montserrat',sans-serif;color:#fff;white-space:nowrap}`,
  body: kicker('f08', 'Handled', 'What it works out') +
    phone('f08', shot('f08', 'rows', 'app-import-rows') + '<div class="f08-dim" id="f08-dim"></div>') +
    [['Missed punch', 'First In -nil-', 'From 07:30', 540, ' warn'], ['Weekly off', 'Weekly Off', 'Friday', 830, ''], ['Sick leave', 'Sick Leave', 'Medical leave', 1120, '']]
      .map(([l, a, b, top, cls], i) => `<div class="f08-card${cls}" id="f08-c${i}" style="top:${top}px"><div class="f08-lab">${l}</div><div class="f08-row"><span class="f08-from">${a}</span><svg width="54" height="30" viewBox="0 0 54 30" fill="none" stroke="${C.acc3}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 15h44M35 4l12 11-12 11"/></svg><span class="f08-to" id="f08-to${i}">${b}</span></div></div>`).join(''),
  script: `
  kick();
  tl.fromTo(P + 'dim', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.3);
  [[0.45, 1.5], [3.65, 4.1], [5.2, 5.65]].forEach(([t, t2], i) => {
    tl.fromTo(P + 'c' + i, { opacity: 0, x: 140 }, { opacity: 1, x: 0, duration: 0.6, ease: 'expo.out', immediateRender: false }, t);
    tl.fromTo(P + 'to' + i, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2.2)', immediateRender: false }, t2);
  });`,
});

scene({
  id: '09-fill-in', p: 'f09', dur: 5.5,
  css: `.f09-dim{position:absolute;inset:0;background:rgba(3,14,11,.5);opacity:0;z-index:8}
.f09-pop{position:absolute;left:${px(13)}px;top:${px(635)}px;width:${px(364)}px;height:${px(196)}px;border-radius:26px;overflow:hidden;background:url('assets/img/app-filled-popup.png') -${px(13)}px -${px(635)}px/${SCREEN.width}px auto;box-shadow:0 20px 50px rgba(0,0,0,.6);z-index:10;opacity:0}`,
  body: kicker('f09', 'Step 6', 'Fill in') + phone('f09',
    shot('f09', 'rows', 'app-import-rows') + shot('f09', 'empty', 'app-daysheet-empty', 'opacity:0') +
    shot('f09', 'filled', 'app-daysheet-filled', 'opacity:0') + '<div class="f09-dim" id="f09-dim"></div>' +
    shot('f09', 'done', 'app-filled-popup', 'opacity:0;z-index:9') + '<div class="f09-pop" id="f09-pop"></div>') + taps('f09', 1),
  script: `
  kick();
  tap(195, 718, 0.7);
  show('empty', 0.95, 0.2);
  tl.fromTo(P + 'filled', { opacity: 1, clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power2.inOut', immediateRender: false }, 1.15);
  tl.set(P + 'filled', { opacity: 0 }, 0);
  tl.fromTo(P + 'dim', { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, 2.45);
  tl.fromTo(P + 'pop', { opacity: 1, y: ${px(260)} }, { y: 0, duration: 0.6, ease: 'back.out(1.5)', immediateRender: false }, 2.5);
  show('done', 3.15);`,
});

scene({
  id: '10-done', p: 'f10', dur: 4, fade: true,
  css: `.f10-icon{position:absolute;left:86px;top:420px;width:160px;height:160px;border-radius:38px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.5)}
.f10-icon img{width:100%;height:100%;display:block}
.f10-title{position:absolute;left:86px;right:60px;top:660px}
.f10-l{display:block;font:900 110px/1.05 'Montserrat',sans-serif;letter-spacing:-.02em;color:${C.ink}}
.f10-acc{color:${C.acc3}}
.f10-p{margin-top:56px;font:700 44px/1.35 'Montserrat',sans-serif;color:${C.soft}}`,
  body: `<div class="f10-icon" id="f10-icon"><img src="assets/img/app-icon.png" alt=""></div>
<div class="f10-title"><span class="f10-l" id="f10-l1">Stays on</span><span class="f10-l f10-acc" id="f10-l2">your phone.</span><div class="f10-p" id="f10-p">Full guide: Help, in the app</div></div>`,
  script: `
  tl.fromTo(P + 'icon', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, 0.2);
  tl.fromTo([P + 'l1', P + 'l2'], { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.15 }, 0.35);
  tl.fromTo(P + 'p', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' }, 1.3);`,
});

/* ---------- timing ---------- */

let t = 0;
scenes.forEach((s, i) => {
  s.start = t;
  s.vo = +(t + (s.lead ?? (s.fade ? 0.5 : 0.3))).toFixed(2);
  const voice = meta.voices[i];
  if (s.vo - s.start + voice.duration_s > s.dur) throw new Error(`${s.id}: voice ${voice.duration_s}s does not fit ${s.dur}s`);
  t = +(t + s.dur).toFixed(2);
});
const total = t;
scenes.forEach((s, i) => { s.hold = s.dur + (scenes[i + 1]?.fade ? 0.5 : 0); });

/* ---------- write ---------- */

for (const s of scenes) writeFile(root, `compositions/frames/${s.id}.html`, sceneFile(s));

const groups = scenes.flatMap((s, i) => captionGroups(lines[i], meta.voices[i].words, s.vo));
const fades = scenes.map((s, i) => (s.fade && i ? `
    tl.fromTo('#el-${s.id}', { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power1.inOut' }, ${s.start});
    tl.to('#el-${scenes[i - 1].id}', { opacity: 0, duration: 0.3, ease: 'power1.in' }, ${s.start + 0.2});` : '')).join('');

const index = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <title>Import your attendance</title>
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
${meta.voices.map((v, i) => `      <audio id="vo-${v.id}" src="${v.path}" data-start="${scenes[i].vo}" data-duration="${v.duration_s}" data-track-index="10" data-volume="1"></audio>`).join('\n')}
      <div id="el-captions" data-track-kind="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="${total}" data-track-index="5" data-width="${W}" data-height="${H}" style="z-index:50"></div>
    </div>
    <script>
    const tl = gsap.timeline({ paused: true });${fades}
    window.__timelines['main'] = tl;
    </script>
  </body>
</html>
`;
writeFile(root, 'compositions/captions.html', captionsFile(groups, total));
writeFile(root, 'index.html', index);
console.log('total', total, 's ·', groups.length, 'caption groups');
