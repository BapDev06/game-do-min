let board = [];
let gameOver = false;
let currentLevel = 1;

const levelMines = { 1: 10, 2: 20, 3: 30 };

function createBoard(rows, cols, mines) {
  board = [];
  for (let i = 0; i < rows; i++) {
    board.push([]);
    for (let j = 0; j < cols; j++) {
      board[i].push({
        mine: false,
        revealed: false,
        count: 0,
        flagged: false
      });
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
  if (board[i][j].revealed || board[i][j].flagged || gameOver) return;


  const cellEl = $(`.cell[data-row=${i}][data-col=${j}]`);
  board[i][j].revealed = true;
  cellEl.addClass('revealed');

  if (board[i][j].mine) {
    cellEl.addClass('mine');
    gameOver = true;
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
    alert('🎉 Bạn thắng rồi!');
    saveScore(0);
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
  scores.forEach((s, i) => list.append(`<li>${i + 1}. ${s} điểm</li>`));
}

function applyTheme() {
  document.documentElement.style.setProperty('--cell-unrevealed', $('#color-unrevealed').val());
  document.documentElement.style.setProperty('--cell-revealed', $('#color-revealed').val());
  document.documentElement.style.setProperty('--cell-mine', $('#color-mine').val());
  document.documentElement.style.setProperty('--cell-border', $('#cell-border').val());
}

$('#start').click(() => {
  const rows = parseInt($('#rows').val());
  const cols = parseInt($('#cols').val());
  currentLevel = parseInt($('#level').val());
  const mines = levelMines[currentLevel];

  createBoard(rows, cols, mines);
  renderBoard(rows, cols);
  gameOver = false;
});

$('#game-board').on('click', '.cell', function () {
  const i = parseInt($(this).attr('data-row'));
  const j = parseInt($(this).attr('data-col'));
  revealCell(i, j, board.length, board[0].length);
});

$('#game-board').on('contextmenu', '.cell', function (e) {
  e.preventDefault(); // chặn menu chuột phải

  const i = parseInt($(this).attr('data-row'));
  const j = parseInt($(this).attr('data-col'));

  if (board[i][j].revealed) return;

  board[i][j].flagged = !board[i][j].flagged;
  $(this).toggleClass('flagged');
});


$('#apply-theme').click(applyTheme);

$('#restart').click(() => {
  const rows = parseInt($('#rows').val());
  const cols = parseInt($('#cols').val());
  const mines = levelMines[currentLevel];

  createBoard(rows, cols, mines);
  renderBoard(rows, cols);
  gameOver = false;
});

$('#reset-scores').click(() => {
  localStorage.removeItem('scores'); // Xoá dữ liệu điểm khỏi trình duyệt
  renderScores(); // Cập nhật lại bảng điểm
});


$(document).ready(() => {
  renderScores();
  applyTheme();
});
