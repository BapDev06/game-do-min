let board = [], rows = 8, cols = 8, mines = 10, level = 1;
let revealedCount = 0, totalSafeCells = 0;

$('#start').click(function () {
  rows = parseInt($('#rows').val());
  cols = parseInt($('#cols').val());
  level = parseInt($('#level').val());

  // Tính số mìn theo cấp độ
  mines = Math.floor((rows * cols) * (0.1 * level));
  totalSafeCells = rows * cols - mines;
  revealedCount = 0;

  generateBoard();
});

function generateBoard() {
  $('#game-board').empty();
  $('#game-board').css('grid-template-columns', `repeat(${cols}, 30px)`);

  board = [];
  for (let r = 0; r < rows; r++) {
    board[r] = [];
    for (let c = 0; c < cols; c++) {
      board[r][c] = { mine: false, revealed: false, count: 0 };
      const cell = $('<div class="cell"></div>');
      cell.attr('data-row', r).attr('data-col', c);
      $('#game-board').append(cell);
    }
  }

  // Gán mìn
  let placed = 0;
  while (placed < mines) {
    let r = Math.floor(Math.random() * rows);
    let c = Math.floor(Math.random() * cols);
    if (!board[r][c].mine) {
      board[r][c].mine = true;
      placed++;
    }
  }

  // Tính số mìn xung quanh
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!board[r][c].mine) {
        board[r][c].count = countMinesAround(r, c);
      }
    }
  }

  $('.cell').on('click', handleClick);
}

function countMinesAround(r, c) {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      let nr = r + i, nc = c + j;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].mine) {
        count++;
      }
    }
  }
  return count;
}

function handleClick() {
  let r = $(this).data('row');
  let c = $(this).data('col');
  let cellData = board[r][c];
  if (cellData.revealed) return;

  cellData.revealed = true;
  $(this).addClass('revealed');

  if (cellData.mine) {
    $(this).addClass('mine').text('💣');
    alert('Bạn thua!');
    $('.cell').off('click');
    return;
  }

  revealedCount++;
  if (cellData.count > 0) {
    $(this).text(cellData.count);
  } else {
    $(this).text('');
    revealAround(r, c);
  }

  if (revealedCount === totalSafeCells) {
    alert('Bạn thắng!');
    saveScore();
    autoUpgrade();
  }
}

function revealAround(r, c) {
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      let nr = r + i, nc = c + j;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !board[nr][nc].revealed) {
        $(`.cell[data-row=${nr}][data-col=${nc}]`).trigger('click');
      }
    }
  }
}

// Lưu điểm vào localStorage
function saveScore() {
  let scores = JSON.parse(localStorage.getItem('scores') || '[]');
  let name = prompt('Nhập tên bạn:');
  scores.push({ name: name, score: totalSafeCells });
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 10);
  localStorage.setItem('scores', JSON.stringify(scores));
  updateScoreboard();
}

function updateScoreboard() {
  let scores = JSON.parse(localStorage.getItem('scores') || '[]');
  $('#top-scores').empty();
  scores.forEach(s => {
    $('#top-scores').append(`<li>${s.name}: ${s.score}</li>`);
  });
}

// Tự nâng cấp cấp độ
function autoUpgrade() {
  if (level < 3) {
    $('#level').val(level + 1);
  }
}
