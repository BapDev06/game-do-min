let board = [];
let timerInterval;
let timer = 0;
let gameOver = false;
let currentLevel = 1;

const levelMines = { 1: 10, 2: 20, 3: 30 };

function createBoard(rows, cols, mines) {
  board = [];
  for (let i = 0; i < rows; i++) {
    board.push([]);
    for (let j = 0; j < cols; j++) {
      board[i].push({ mine: false, revealed: false, count: 0 });
    }
  }

  let placed = 0;
  while (placed < mines) {
    let r = Math.floor(Math.random() * rows);
    let c = Math.floor(Math.random() * cols);
    if (!board[r][c].mine) {
      board[r][c].mine = true;
      placed++;
    }
  }

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (!board[i][j].mine) {
        board[i][j].count = countAdjacentMines(i, j, rows, cols);
      }
    }
  }
}

function countAdjacentMines(i, j, rows, cols) {
  let count = 0;
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      let ni = i + x, nj = j + y;
      if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && board[ni][nj].mine) count++;
    }
  }
  return count;
}

function renderBoard(rows, cols) {
  const boardEl = $('#game-board');
  boardEl.empty();
  boardEl.css('grid-template-columns', `repeat(${cols}, 30px)`);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const cell = $('<div></div>').addClass('cell');
      cell.attr('data-row', i);
      cell.attr('data-col', j);
      boardEl.append(cell);
    }
  }
}

function revealCell(i, j, rows, cols) {
  if (board[i][j].revealed || gameOver) return;

  const cellEl = $(`.cell[data-row=${i}][data-col=${j}]`);
  board[i][j].revealed = true;
  cellEl.addClass('revealed');

  if (board[i][j].mine) {
    cellEl.addClass('mine');
    gameOver = true;
    clearInterval(timerInterval);
    playSound("lose-sound");
    alert('💥 Bạn thua rồi!');
    return;
  }

  if (board[i][j].count > 0) {
    cellEl.text(board[i][j].count);
  } else {
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        let ni = i + x, nj = j + y;
        if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
          revealCell(ni, nj, rows, cols);
        }
      }
    }
  }

  checkWin(rows, cols);
}

function checkWin(rows, cols) {
  let revealed = 0;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (board[i][j].revealed) revealed++;
    }
  }
  if (revealed === rows * cols - levelMines[currentLevel]) {
    gameOver = true;
    clearInterval(timerInterval);
    playSound("win-sound");
    alert('🎉 Bạn thắng rồi!');
    saveScore(timer);
    currentLevel = Math.min(currentLevel + 1, 3);
  }
}

function saveScore(score) {
  let scores = JSON.parse(localStorage.getItem('scores')) || [];
  scores.push(score);
  scores.sort((a, b) => a - b);
  scores = scores.slice(0, 10);
  localStorage.setItem('scores', JSON.stringify(scores));
  renderScores();
}

function renderScores() {
  const list = $('#top-scores');
  list.empty();
  const scores = JSON.parse(localStorage.getItem('scores')) || [];
  scores.forEach((s, i) => list.append(`<li>${i + 1}. ${s} giây</li>`));
}

function startTimer() {
  timer = 0;
  $('#timer').text(timer);
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer++;
    $('#timer').text(timer);
  }, 1000);
}

function applyTheme() {
  document.documentElement.style.setProperty('--cell-unrevealed', $('#color-unrevealed').val());
  document.documentElement.style.setProperty('--cell-revealed', $('#color-revealed').val());
  document.documentElement.style.setProperty('--cell-mine', $('#color-mine').val());
  document.documentElement.style.setProperty('--cell-border', $('#cell-border').val());
}

function playSound(id) {
  const sound = document.getElementById(id);
  if (sound) {
    sound.pause();
    sound.currentTime = 0;
    sound.play().catch(e => console.warn("Không phát được âm thanh:", e));
  }
}

$('#start').click(() => {
  const rows = parseInt($('#rows').val());
  const cols = parseInt($('#cols').val());
  currentLevel = parseInt($('#level').val());
  const mines = levelMines[currentLevel];

  createBoard(rows, cols, mines);
  renderBoard(rows, cols);
  startTimer();
  gameOver = false;
});

$('#game-board').on('click', '.cell', function () {
  const i = parseInt($(this).attr('data-row'));
  const j = parseInt($(this).attr('data-col'));
  revealCell(i, j, board.length, board[0].length);
});

$('#apply-theme').click(applyTheme);

$(document).ready(() => {
  renderScores();
  applyTheme();
});
