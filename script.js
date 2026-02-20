const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestScoreEl = document.getElementById("best-score");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const restartBtn = document.getElementById("restart-btn");
const dirButtons = document.querySelectorAll(".dir");

const GRID_SIZE = 20;
const CELL = canvas.width / GRID_SIZE;
const TICK_MS = 120;

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let gameLoop = null;
let isRunning = false;
let isGameOver = false;

const BEST_KEY = "snake-best-score";
let bestScore = Number(localStorage.getItem(BEST_KEY) || 0);
bestScoreEl.textContent = bestScore;

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  isGameOver = false;
  scoreEl.textContent = score;
  placeFood();
  draw();
}

function placeFood() {
  let nextFood;
  do {
    nextFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some((part) => part.x === nextFood.x && part.y === nextFood.y));
  food = nextFood;
}

function setDirection(dir) {
  if (dir.x === -direction.x && dir.y === -direction.y) {
    return;
  }
  nextDirection = dir;
}

function update() {
  if (isGameOver) return;

  direction = nextDirection;
  const head = snake[0];
  const nextHead = {
    x: head.x + direction.x,
    y: head.y + direction.y,
  };

  const hitWall =
    nextHead.x < 0 ||
    nextHead.x >= GRID_SIZE ||
    nextHead.y < 0 ||
    nextHead.y >= GRID_SIZE;

  const willEat = nextHead.x === food.x && nextHead.y === food.y;
  const bodyToCheck = willEat ? snake : snake.slice(0, -1);
  const hitSelf = bodyToCheck.some(
    (part) => part.x === nextHead.x && part.y === nextHead.y
  );

  if (hitWall || hitSelf) {
    stopGame();
    isGameOver = true;
    draw();
    return;
  }

  snake.unshift(nextHead);

  if (willEat) {
    score += 1;
    scoreEl.textContent = score;
    if (score > bestScore) {
      bestScore = score;
      bestScoreEl.textContent = bestScore;
      localStorage.setItem(BEST_KEY, String(bestScore));
    }
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function drawCell(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * CELL, y * CELL, CELL - 1, CELL - 1);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < GRID_SIZE; y += 1) {
    for (let x = 0; x < GRID_SIZE; x += 1) {
      drawCell(x, y, "#ece7d8");
    }
  }

  snake.forEach((part, i) => {
    drawCell(part.x, part.y, i === 0 ? "#2a9d63" : "#1f7a4d");
  });

  drawCell(food.x, food.y, "#d64045");

  if (isGameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 32px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 6);
    ctx.font = "16px sans-serif";
    ctx.fillText("Nhấn Restart để chơi lại", canvas.width / 2, canvas.height / 2 + 24);
  }
}

function startGame() {
  if (isRunning || isGameOver) return;
  isRunning = true;
  gameLoop = setInterval(update, TICK_MS);
}

function stopGame() {
  isRunning = false;
  if (gameLoop) {
    clearInterval(gameLoop);
    gameLoop = null;
  }
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (key === "arrowup" || key === "w") setDirection({ x: 0, y: -1 });
  if (key === "arrowdown" || key === "s") setDirection({ x: 0, y: 1 });
  if (key === "arrowleft" || key === "a") setDirection({ x: -1, y: 0 });
  if (key === "arrowright" || key === "d") setDirection({ x: 1, y: 0 });
});

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", stopGame);
restartBtn.addEventListener("click", () => {
  stopGame();
  resetGame();
});

dirButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const dir = btn.getAttribute("data-dir");
    if (dir === "up") setDirection({ x: 0, y: -1 });
    if (dir === "down") setDirection({ x: 0, y: 1 });
    if (dir === "left") setDirection({ x: -1, y: 0 });
    if (dir === "right") setDirection({ x: 1, y: 0 });
  });
});

resetGame();
