// Shared pieces for the tutorial videos: fonts, the phone, tap rings,
// captions. Each video's build.mjs writes its HyperFrames scene files from
// these, so both videos keep one look (frame.md) without hand-copied CSS.
import fs from 'node:fs';
import path from 'node:path';

/* ---------- canvas and phone geometry (1080 x 1920) ---------- */

export const W = 1080;
export const H = 1920;
// The phone: 55% of the width, centred, 9:19, its screen showing a capture
// taken at 390 CSS px wide. K turns capture CSS px into canvas px.
export const PHONE = { left: 243, top: 281, width: 594, height: 1254, border: 13 };
export const SCREEN = {
  left: PHONE.left + PHONE.border,
  top: PHONE.top + PHONE.border,
  width: PHONE.width - 2 * PHONE.border,
  height: PHONE.height - 2 * PHONE.border,
};
export const K = SCREEN.width / 390;
/** Moves the phone up or down (each video's layout); call before writing scenes. */
export function setPhoneTop(top) {
  PHONE.top = top;
  SCREEN.top = top + PHONE.border;
}
/** A point in a capture (CSS px) as a point on the canvas. */
export const at = (cx, cy) => [+(SCREEN.left + cx * K).toFixed(1), +(SCREEN.top + cy * K).toFixed(1)];
/** A length in capture CSS px as canvas px. */
export const px = (n) => +(n * K).toFixed(1);

export const C = {
  bg: '#0A2620',
  glass: '#16382F',
  ink: '#ECF7F2',
  soft: '#C3D9CF',
  acc: '#10B981',
  acc2: '#059669',
  acc3: '#6EE7B7',
  amber: '#F59E0B',
};

/* ---------- CSS ---------- */

export const fontFaces = `
@font-face{font-family:'Montserrat';font-weight:700;src:url('assets/fonts/montserrat-latin-700-normal.woff2') format('woff2')}
@font-face{font-family:'Montserrat';font-weight:800;src:url('assets/fonts/montserrat-latin-800-normal.woff2') format('woff2')}
@font-face{font-family:'Montserrat';font-weight:900;src:url('assets/fonts/montserrat-latin-900-normal.woff2') format('woff2')}
@font-face{font-family:'Roboto';font-weight:400;src:url('assets/fonts/roboto-latin-400-normal.woff2') format('woff2')}
@font-face{font-family:'Roboto';font-weight:500;src:url('assets/fonts/roboto-latin-500-normal.woff2') format('woff2')}
@font-face{font-family:'Roboto';font-weight:700;src:url('assets/fonts/roboto-latin-700-normal.woff2') format('woff2')}`;

/** Scene CSS, scoped to one scene's prefix so scenes never collide. */
export const sceneCss = (p) => `
#root{position:absolute;inset:0;overflow:hidden;font-family:'Roboto',sans-serif;color:${C.ink}}
.${p}-k1{position:absolute;left:76px;top:58px;font:900 42px/1 'Montserrat',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:${C.acc3}}
.${p}-k2{position:absolute;left:76px;top:112px;right:60px;font:900 64px/1.05 'Montserrat',sans-serif;letter-spacing:-.01em;color:${C.ink}}
.${p}-phone{position:absolute;left:${PHONE.left}px;top:${PHONE.top}px;width:${PHONE.width}px;height:${PHONE.height}px;border-radius:76px;background:#0c1f1a;border:${PHONE.border}px solid #22473d;box-shadow:0 32px 86px rgba(0,0,0,.55);overflow:hidden}
.${p}-scr{position:absolute;inset:0;overflow:hidden;border-radius:63px;background:#0b2621}
.${p}-notch{position:absolute;top:12px;left:50%;margin-left:-13px;width:26px;height:26px;border-radius:50%;background:#000;box-shadow:0 0 0 3px rgba(255,255,255,.06);z-index:20}
.${p}-shot{position:absolute;left:0;top:0;width:${SCREEN.width}px;display:block}
.${p}-tap{position:absolute;width:108px;height:108px;margin:-54px 0 0 -54px;border-radius:50%;border:10px solid ${C.amber};background:rgba(245,158,11,.22);box-sizing:border-box;opacity:0;z-index:30}
.${p}-mark{position:absolute;border:6px solid ${C.amber};border-radius:14px;box-sizing:border-box;opacity:0;z-index:25}
.${p}-ok{border-color:${C.acc3}}
.${p}-flash{position:absolute;inset:0;background:#fff;opacity:0;z-index:15}`;

/* ---------- markup helpers ---------- */

export const kicker = (p, small, big) =>
  `<div class="${p}-k1" id="${p}-k1" data-layout-allow-overlap>${small}</div><div class="${p}-k2" id="${p}-k2" data-layout-allow-overlap>${big}</div>`;

/** The phone with its screen; `inner` is the screen's contents. */
export const phone = (p, inner, extra = '') =>
  `<div class="${p}-phone" id="${p}-phone"${extra}><div class="${p}-scr" id="${p}-scr">${inner}<div class="${p}-notch"></div></div></div>`;

export const shot = (p, id, file, style = '') =>
  `<img class="${p}-shot" id="${p}-${id}" src="assets/img/${file}.png" alt="" style="${style}">`;

/** Tap rings, one element each, placed by the timeline helper. */
export const taps = (p, n) => Array.from({ length: n }, (_, i) => `<div class="${p}-tap" id="${p}-tap${i}"></div>`).join('');

/** A highlight box around a capture region given in CSS px. */
export const mark = (p, id, [x, y, w, h], pad = 6, tone = "") => {
  const [l, t] = at(x - pad, y - pad);
  return `<div class="${p}-mark${tone ? " " + p + "-" + tone : ""}" id="${p}-${id}" style="left:${l}px;top:${t}px;width:${px(w + 2 * pad)}px;height:${px(h + 2 * pad)}px"></div>`;
};

/* ---------- timeline helpers (inlined into each scene's script) ---------- */

export const helpersJs = (p) => `
  const P = '#${p}-';
  const K = ${K}, SX = ${SCREEN.left}, SY = ${SCREEN.top};
  let tapN = 0;
  // A finger tap: the ring lands, presses and lifts at time t.
  const tap = (cx, cy, t) => {
    const el = P + 'tap' + tapN++;
    tl.set(el, { left: SX + cx * K, top: SY + cy * K }, 0);
    tl.fromTo(el, { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out', immediateRender: false }, t - 0.4);
    tl.to(el, { scale: 0.78, duration: 0.1, ease: 'power1.in' }, t);
    tl.to(el, { scale: 1.2, opacity: 0, duration: 0.35, ease: 'power2.out' }, t + 0.12);
  };
  // The next screen: instant, or faded over d seconds.
  const show = (id, t, d = 0) => d
    ? tl.fromTo(P + id, { opacity: 0 }, { opacity: 1, duration: d, ease: 'power1.inOut', immediateRender: false }, t)
    : tl.set(P + id, { opacity: 1 }, t);
  const kick = (t = 0.15) => {
    tl.fromTo([P + 'k1', P + 'k2'], { opacity: 0, x: 60 }, { opacity: 1, x: 0, duration: 0.6, ease: 'expo.out', stagger: 0.12 }, t);
  };
  const flash = (t) => {
    tl.fromTo(P + 'flash', { opacity: 0.85 }, { opacity: 0, duration: 0.45, ease: 'power2.out', immediateRender: false }, t);
  };
  const markOn = (id, t) => {
    tl.fromTo(P + id, { opacity: 0, scale: 1.15 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)', immediateRender: false }, t);
  };`;

/* ---------- files ---------- */

export const sceneFile = ({ id, p, css = '', body, script }) => `<template>
<style>${fontFaces}
${sceneCss(p)}
${css}
</style>
<div id="root" data-composition-id="${id}" data-width="${W}" data-height="${H}">
${body}
</div>
<script>
(() => {
  const tl = gsap.timeline({ paused: true });
${helpersJs(p)}
${script}
  window.__timelines['${id}'] = tl;
})();
</script>
</template>
`;

/* ---------- captions ---------- */

/**
 * Caption groups from the script's own words on the transcriber's timings
 * (the transcriber mishears names; the script is right). Breaks at
 * punctuation or after 6 words.
 */
export function captionGroups(scriptText, words, offset) {
  const tokens = scriptText.split(/\s+/).filter(Boolean);
  const timed = alignWords(tokens, words, scriptText);
  const groups = [];
  let cur = [];
  tokens.forEach((text, i) => {
    cur.push({ text, start: +(offset + timed[i].start).toFixed(3), end: +(offset + timed[i].end).toFixed(3) });
    if (/[.,:;!?]$/.test(text) || cur.length >= 6) {
      groups.push(cur);
      cur = [];
    }
  });
  if (cur.length) groups.push(cur);
  // Short tails read badly on their own: fold a 1-word group into the one before.
  for (let i = groups.length - 1; i > 0; i--) {
    if (groups[i].length === 1 && groups[i - 1].length < 6) {
      groups[i - 1].push(...groups[i]);
      groups.splice(i, 1);
    }
  }
  return groups;
}

/**
 * One timing per script word. Same count: position by position. Otherwise the
 * transcriber split a word ("over time", "pay slip"): join its pieces until
 * their letters make the script word.
 */
function alignWords(tokens, words, scriptText) {
  if (tokens.length === words.length) return words.map((w) => ({ start: Number(w.start), end: Number(w.end) }));
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
  const out = [];
  let j = 0;
  for (const tok of tokens) {
    const target = norm(tok);
    const w = words[j];
    if (!w) throw new Error(`caption timings ran out at "${tok}": ${scriptText}`);
    let text = norm(w.text);
    let end = Number(w.end);
    j += 1;
    while (text !== target && words[j] && target.startsWith(text + norm(words[j].text))) {
      text += norm(words[j].text);
      end = Number(words[j].end);
      j += 1;
    }
    out.push({ start: Number(w.start), end });
  }
  if (j !== words.length) throw new Error(`caption words ${tokens.length} != timings ${words.length}: ${scriptText}`);
  return out;
}

export function writeFile(root, rel, text) {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
  console.log('  wrote', rel);
}

/** The caption track as its own sub-composition: karaoke pills in the bottom band. */
export function captionsFile(groups, total) {
  const html = groups.map((g, gi) => `<div class="cc-cap" id="cc-cap${gi}"><span class="cc-pill">${g.map((w, wi) => `<span class="cc-w" id="cc-w${gi}_${wi}">${w.text}</span>`).join(' ')}</span></div>`).join('\n');
  const js = groups.map((g, gi) => {
    const on = Math.max(0, g[0].start - 0.08);
    const next = groups[gi + 1];
    const off = Math.min(g.at(-1).end + 0.5, next ? Math.max(0, next[0].start - 0.08) : total);
    return [
      `tl.set('#cc-cap${gi}', { opacity: 1 }, ${on.toFixed(3)});`,
      `tl.set('#cc-cap${gi}', { opacity: 0 }, ${off.toFixed(3)});`,
      ...g.map((w, wi) => `tl.set('#cc-w${gi}_${wi}', { color: '${C.acc3}', opacity: 1 }, ${w.start.toFixed(3)});` +
        (g[wi + 1] ? ` tl.set('#cc-w${gi}_${wi}', { color: '#ffffff' }, ${g[wi + 1].start.toFixed(3)});` : '')),
    ].join(' ');
  }).join('\n  ');
  return `<template>
<style>${fontFaces}
#root{position:absolute;inset:0;pointer-events:none}
.cc-cap{position:absolute;left:50px;right:50px;top:1600px;height:300px;display:flex;align-items:center;justify-content:center;text-align:center;opacity:0}
.cc-pill{display:inline;font:700 46px/1.5 'Montserrat',sans-serif;color:#fff;background:rgba(0,0,0,.62);padding:10px 26px;border-radius:20px;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.cc-w{opacity:.55}
</style>
<div id="root" data-composition-id="captions" data-width="${W}" data-height="${H}">
${html}
</div>
<script>
(() => {
  const tl = gsap.timeline({ paused: true });
  ${js}
  window.__timelines['captions'] = tl;
})();
</script>
</template>
`;
}
