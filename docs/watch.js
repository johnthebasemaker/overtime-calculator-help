// Jump to a chapter: from the buttons, and from a link such as manual.html#t=48.2
// (the app's "Watch how" links use it).
const video = document.querySelector('video');
const seek = (t) => {
  const go = () => { video.currentTime = t; };
  if (video.readyState >= 1) go();
  else video.addEventListener('loadedmetadata', go, { once: true });
};
const fromHash = () => {
  const t = Number(new URLSearchParams(location.hash.slice(1)).get('t'));
  if (t > 0) seek(t);
};
document.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', () => {
  seek(Number(b.dataset.t));
  video.play().catch(() => {});
}));
window.addEventListener('hashchange', fromHash);
fromHash();
