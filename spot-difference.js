(() => {
  'use strict';
  const left = document.querySelector('#spot-left');
  const right = document.querySelector('#spot-right');
  const start = document.querySelector('#spot-start');
  const restart = document.querySelector('#spot-restart');
  const foundEl = document.querySelector('#spot-found');
  const totalEl = document.querySelector('#spot-total');
  const message = document.querySelector('#spot-message');
  if (!left || !right || !start || !restart || !foundEl || !totalEl || !message) return;
  const scenes = [left.getContext('2d'), right.getContext('2d')];
  // Match hit regions to the actual visual changes drawn in drawScene.
  const differences = [{ x: 97, y: 152, r: 18 }, { x: 220, y: 170, r: 16 }, { x: 191, y: 112, r: 16 }];
  let started = false;
  let found = new Set();
  totalEl.textContent = String(differences.length);
  const drawScene = (ctx, variant) => {
    ctx.clearRect(0, 0, 360, 240); ctx.fillStyle = '#c9efff'; ctx.fillRect(0, 0, 360, 240); ctx.fillStyle = '#ffe27a'; ctx.beginPath(); ctx.arc(300, 48, 25, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#8bd18b'; ctx.fillRect(0, 185, 360, 55);
    ctx.fillStyle = '#ff9f68'; ctx.fillRect(48, 112, 105, 73); ctx.fillStyle = '#a56bd4'; ctx.beginPath(); ctx.moveTo(38, 112); ctx.lineTo(100, 65); ctx.lineTo(163, 112); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillRect(83, 140, 28, 45); ctx.fillStyle = '#6c48c7'; ctx.beginPath(); ctx.arc(220, 170, 25, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(212, 164, 5, 0, Math.PI * 2); ctx.arc(228, 164, 5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#2c9650'; ctx.fillRect(185, 118, 12, 55); ctx.fillStyle = '#e95757'; ctx.beginPath(); ctx.arc(191, 112, 25, 0, Math.PI * 2); ctx.fill();
    if (variant) { ctx.fillStyle = '#fff'; ctx.fillRect(83, 140, 28, 25); ctx.fillStyle = '#2876c7'; ctx.beginPath(); ctx.arc(220, 170, 15, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#e88735'; ctx.beginPath(); ctx.arc(191, 112, 15, 0, Math.PI * 2); ctx.fill(); }
  };
  const draw = () => { drawScene(scenes[0], false); drawScene(scenes[1], true); found.forEach((index) => { [left, right].forEach((canvas) => { const ctx = canvas.getContext('2d'); const d = differences[index]; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.stroke(); }); }); };
  const pixelDiffers = (x, y) => {
    const px = Math.max(0, Math.min(left.width - 1, Math.round(x)));
    const py = Math.max(0, Math.min(left.height - 1, Math.round(y)));
    const a = scenes[0].getImageData(px, py, 1, 1).data;
    const b = scenes[1].getImageData(px, py, 1, 1).data;
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]) > 24;
  };
  const reset = () => { found = new Set(); started = true; foundEl.textContent = '0'; message.textContent = '차이를 찾아보세요.'; draw(); };
  const hit = (event) => { if (!started) return; const rect = event.currentTarget.getBoundingClientRect(); const scaleX = event.currentTarget.width / rect.width; const scaleY = event.currentTarget.height / rect.height; const x = (event.clientX - rect.left) * scaleX; const y = (event.clientY - rect.top) * scaleY; differences.forEach((d, index) => { if (Math.hypot(x - d.x, y - d.y) <= d.r && pixelDiffers(x, y)) found.add(index); }); foundEl.textContent = String(found.size); if (found.size === differences.length) { message.textContent = '모든 차이를 찾았습니다!'; started = false; } else draw(); };
  [left, right].forEach((canvas) => canvas.addEventListener('click', hit)); start.addEventListener('click', reset); restart.addEventListener('click', reset); draw();
})();
