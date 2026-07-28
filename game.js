(() => {
  'use strict';

  const SIZE = 20;
  const HIGH_SCORE_KEY = 'angelina-snake-high-score';
  const LEVELS = {
    1: { interval: 240 },
    2: { interval: 180 },
    3: { interval: 120 }
  };
  const board = document.querySelector('#game-board');
  const scoreEl = document.querySelector('#score');
  const highScoreEl = document.querySelector('#high-score');
  const statusEl = document.querySelector('#game-status');
  const startButton = document.querySelector('#start-game');
  const pauseButton = document.querySelector('#pause-game');
  const restartButton = document.querySelector('#restart-game');
  const levelSelect = document.querySelector('#game-level');
  if (!board || !scoreEl || !highScoreEl || !statusEl || !startButton || !pauseButton || !restartButton || !levelSelect) return;

  const cells = [];
  let snake = [];
  let food = null;
  let direction = { x: 1, y: 0 };
  let nextDirection = { x: 1, y: 0 };
  let score = 0;
  let currentLevel = Number(levelSelect.value) || 2;
  let highScores = {};
  try { highScores = JSON.parse(localStorage.getItem(HIGH_SCORE_KEY)) || {}; } catch { highScores = {}; }
  let timerId = null;
  let running = false;
  let paused = false;

  for (let index = 0; index < SIZE * SIZE; index += 1) {
    const cell = document.createElement('div');
    cell.className = 'game-cell';
    cell.setAttribute('role', 'gridcell');
    board.appendChild(cell);
    cells.push(cell);
  }

  const samePoint = (a, b) => a.x === b.x && a.y === b.y;
  const cellAt = (point) => cells[point.y * SIZE + point.x];
  const setStatus = (message) => { statusEl.textContent = message; };
  const currentHighScore = () => Number(highScores[currentLevel]) || 0;
  const updateScores = () => {
    scoreEl.textContent = String(score);
    highScoreEl.textContent = String(currentHighScore());
  };

  function placeFood() {
    const free = [];
    for (let y = 0; y < SIZE; y += 1) {
      for (let x = 0; x < SIZE; x += 1) {
        if (!snake.some((part) => samePoint(part, { x, y }))) free.push({ x, y });
      }
    }
    food = free.length ? free[Math.floor(Math.random() * free.length)] : null;
  }

  function render() {
    cells.forEach((cell) => { cell.className = 'game-cell'; });
    snake.forEach((part, index) => {
      const cell = cellAt(part);
      if (cell) cell.classList.add(index === 0 ? 'snake-head' : 'snake');
    });
    if (food) cellAt(food).classList.add('food');
    updateScores();
  }

  function stopTimer() {
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  function gameOver() {
    running = false;
    paused = false;
    stopTimer();
    pauseButton.disabled = true;
    setStatus('게임 오버! 재시작해 보세요.');
  }

  function tick() {
    if (!running || paused) return;
    direction = nextDirection;
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    const hitWall = head.x < 0 || head.x >= SIZE || head.y < 0 || head.y >= SIZE;
    const hitSelf = snake.some((part) => samePoint(part, head));
    if (hitWall || hitSelf) { gameOver(); return; }
    snake.unshift(head);
    if (food && samePoint(head, food)) {
      score += 1;
      if (score > currentHighScore()) {
        highScores[currentLevel] = score;
        localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(highScores));
      }
      placeFood();
    } else {
      snake.pop();
    }
    render();
  }

  function startGame() {
    stopTimer();
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    running = true;
    paused = false;
    placeFood();
    pauseButton.disabled = false;
    pauseButton.textContent = '일시정지';
    setStatus('게임 중');
    render();
    timerId = window.setInterval(tick, LEVELS[currentLevel].interval);
  }

  function togglePause() {
    if (!running) return;
    paused = !paused;
    pauseButton.textContent = paused ? '계속하기' : '일시정지';
    setStatus(paused ? '일시정지' : '게임 중');
  }

  function changeDirection(next) {
    if (!running || paused) return;
    if (direction.x + next.x === 0 && direction.y + next.y === 0) return;
    if (nextDirection.x + next.x === 0 && nextDirection.y + next.y === 0) return;
    nextDirection = next;
  }

  const directions = {
    ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 }
  };
  document.addEventListener('keydown', (event) => {
    if (directions[event.key]) { event.preventDefault(); changeDirection(directions[event.key]); }
    if (event.code === 'Space') { event.preventDefault(); togglePause(); }
  });
  document.querySelectorAll('[data-direction]').forEach((button) => {
    button.addEventListener('click', () => changeDirection(directions[{ up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' }[button.dataset.direction]]));
  });
  let touchStart = null;
  board.addEventListener('touchstart', (event) => { touchStart = event.changedTouches[0]; }, { passive: true });
  board.addEventListener('touchend', (event) => {
    if (!touchStart) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStart.clientX;
    const dy = touch.clientY - touchStart.clientY;
    touchStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    const key = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft') : (dy > 0 ? 'ArrowDown' : 'ArrowUp');
    changeDirection(directions[key]);
  }, { passive: true });
  startButton.addEventListener('click', startGame);
  pauseButton.addEventListener('click', togglePause);
  restartButton.addEventListener('click', startGame);
  levelSelect.addEventListener('change', () => {
    currentLevel = Number(levelSelect.value) || 2;
    updateScores();
    if (running) startGame();
    else setStatus(`${currentLevel}단계 선택됨`);
  });
  updateScores();
  render();
})();
