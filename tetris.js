(() => {
  'use strict';

  const WIDTH = 10;
  const HEIGHT = 20;
  const HIGH_SCORE_KEY = 'angelina-tetris-high-score';
  const PIECES = {
    I: [[1, 1, 1, 1]],
    O: [[1, 1], [1, 1]],
    T: [[0, 1, 0], [1, 1, 1]],
    S: [[0, 1, 1], [1, 1, 0]],
    Z: [[1, 1, 0], [0, 1, 1]],
    J: [[1, 0, 0], [1, 1, 1]],
    L: [[0, 0, 1], [1, 1, 1]]
  };
  const COLORS = { I: '#2876c7', O: '#b88700', T: '#7946b8', S: '#2c9650', Z: '#e95757', J: '#4e55b8', L: '#e88735' };
  const board = document.querySelector('#tetris-board');
  const nextBoard = document.querySelector('#tetris-next');
  const scoreEl = document.querySelector('#tetris-score');
  const levelEl = document.querySelector('#tetris-level');
  const highScoreEl = document.querySelector('#tetris-high-score');
  const statusEl = document.querySelector('#tetris-status');
  const startButton = document.querySelector('#tetris-start');
  const pauseButton = document.querySelector('#tetris-pause');
  const restartButton = document.querySelector('#tetris-restart');
  if (!board || !nextBoard || !scoreEl || !levelEl || !highScoreEl || !statusEl || !startButton || !pauseButton || !restartButton) return;

  const cells = [];
  const nextCells = [];
  let grid = [];
  let current = null;
  let currentX = 0;
  let currentY = 0;
  let nextType = null;
  let score = 0;
  let lines = 0;
  let level = 1;
  let highScore = Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
  let timerId = null;
  let running = false;
  let paused = false;

  for (let i = 0; i < WIDTH * HEIGHT; i += 1) { const cell = document.createElement('div'); cell.className = 'tetris-cell'; cell.setAttribute('role', 'gridcell'); board.appendChild(cell); cells.push(cell); }
  for (let i = 0; i < 16; i += 1) { const cell = document.createElement('div'); cell.className = 'tetris-cell'; nextBoard.appendChild(cell); nextCells.push(cell); }
  const clone = (matrix) => matrix.map((row) => [...row]);
  const randomType = () => Object.keys(PIECES)[Math.floor(Math.random() * 7)];
  const rotate = (matrix) => matrix[0].map((_, x) => matrix.map((row) => row[x]).reverse());
  const collides = (piece, x, y) => piece.some((row, py) => row.some((value, px) => value && (x + px < 0 || x + px >= WIDTH || y + py >= HEIGHT || (y + py >= 0 && grid[y + py][x + px]))));
  const setStatus = (text) => { statusEl.textContent = text; };
  const updateScore = () => { scoreEl.textContent = String(score); levelEl.textContent = String(level); highScoreEl.textContent = String(highScore); };
  const speed = () => Math.max(100, 800 - (level - 1) * 70);

  function renderNext() {
    nextCells.forEach((cell) => { cell.className = 'tetris-cell'; cell.style.removeProperty('--tetris-color'); });
    const piece = PIECES[nextType] || [[]];
    piece.forEach((row, y) => row.forEach((value, x) => { if (value) { const cell = nextCells[y * 4 + x]; cell.classList.add('filled'); cell.style.setProperty('--tetris-color', COLORS[nextType]); } }));
  }

  function render() {
    cells.forEach((cell) => { cell.className = 'tetris-cell'; cell.style.removeProperty('--tetris-color'); });
    grid.forEach((row, y) => row.forEach((type, x) => { if (type) { const cell = cells[y * WIDTH + x]; cell.classList.add('filled'); cell.style.setProperty('--tetris-color', COLORS[type]); } }));
    if (current) current.forEach((row, y) => row.forEach((value, x) => { if (value && currentY + y >= 0) { const cell = cells[(currentY + y) * WIDTH + currentX + x]; if (cell) { cell.classList.add('filled'); cell.style.setProperty('--tetris-color', COLORS[current.type]); } } }));
    updateScore();
  }

  function stopTimer() { if (timerId !== null) { window.clearInterval(timerId); timerId = null; } }
  function spawn() { const type = nextType || randomType(); nextType = randomType(); current = { type, matrix: clone(PIECES[type]) }; currentX = Math.floor((WIDTH - current.matrix[0].length) / 2); currentY = -1; renderNext(); if (collides(current.matrix, currentX, currentY)) gameOver(); }
  function merge() { current.matrix.forEach((row, y) => row.forEach((value, x) => { if (value && currentY + y >= 0) grid[currentY + y][currentX + x] = current.type; })); }
  function clearLines() { let cleared = 0; grid = grid.filter((row) => { if (row.every(Boolean)) { cleared += 1; return false; } return true; }); while (grid.length < HEIGHT) grid.unshift(Array(WIDTH).fill(null)); if (cleared) { lines += cleared; score += [0, 100, 300, 500, 800][cleared] * level; level = Math.floor(lines / 10) + 1; if (score > highScore) { highScore = score; localStorage.setItem(HIGH_SCORE_KEY, String(highScore)); } stopTimer(); timerId = window.setInterval(tick, speed()); } }
  function lock() { merge(); clearLines(); spawn(); }
  function tick() { if (!running || paused || !current) return; if (!collides(current.matrix, currentX, currentY + 1)) currentY += 1; else lock(); render(); }
  function startGame() { stopTimer(); grid = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(null)); score = 0; lines = 0; level = 1; running = true; paused = false; nextType = randomType(); pauseButton.disabled = false; pauseButton.textContent = '일시정지'; setStatus('게임 중'); spawn(); render(); timerId = window.setInterval(tick, speed()); }
  function gameOver() { running = false; paused = false; stopTimer(); pauseButton.disabled = true; setStatus('게임 오버! 재시작해 보세요.'); render(); }
  function move(dx) { if (running && !paused && current && !collides(current.matrix, currentX + dx, currentY)) { currentX += dx; render(); } }
  function softDrop() { if (running && !paused) tick(); }
  function hardDrop() { if (!running || paused || !current) return; while (!collides(current.matrix, currentX, currentY + 1)) currentY += 1; tick(); }
  function rotatePiece() { if (!running || paused || !current) return; const rotated = rotate(current.matrix); if (!collides(rotated, currentX, currentY)) { current.matrix = rotated; render(); } }
  function togglePause() { if (!running) return; paused = !paused; pauseButton.textContent = paused ? '계속하기' : '일시정지'; setStatus(paused ? '일시정지' : '게임 중'); }

  const actions = { left: move.bind(null, -1), right: move.bind(null, 1), down: softDrop, rotate: rotatePiece, drop: hardDrop };
  document.addEventListener('keydown', (event) => { if (event.key === 'ArrowLeft') { event.preventDefault(); actions.left(); } else if (event.key === 'ArrowRight') { event.preventDefault(); actions.right(); } else if (event.key === 'ArrowDown') { event.preventDefault(); actions.down(); } else if (event.key === 'ArrowUp') { event.preventDefault(); actions.rotate(); } else if (event.code === 'Space') { event.preventDefault(); actions.drop(); } else if (event.key.toLowerCase() === 'p') { event.preventDefault(); togglePause(); } });
  document.querySelectorAll('[data-tetris-action]').forEach((button) => button.addEventListener('click', () => actions[button.dataset.tetrisAction]()));
  startButton.addEventListener('click', startGame); pauseButton.addEventListener('click', togglePause); restartButton.addEventListener('click', startGame); updateScore(); renderNext(); render();
})();
