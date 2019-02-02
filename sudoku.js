'use strict';

let sudoku;
let controls;
let run;
let clear;
let status;

let cells;

let solutions = null;

window.onload = function() {
  sudoku = document.getElementById('sudoku');
  controls = document.getElementById('controls');
  run = document.getElementById('run');
  clear = document.getElementById('clear');
  status = document.getElementById('status');

  createSudokuGrid();

  run.onclick = solveSudoku;
  clear.onclick = clearSudoku;
}

function createSudokuGrid() {
  cells = [];
  for (let row = 1; row <= 9; row++) {
    let tr = document.createElement('tr');
    sudoku.appendChild(tr);
    for (let col = 1; col <= 9; col++) {
      let td = document.createElement('td');
      tr.appendChild(td);

      let txt = document.createElement('div');
      txt.id = `R${row}C${col}`;
      txt.classList.add('cell');
      txt.setAttribute('contenteditable', true);
      txt.oninput = onCellInput;
      txt.onkeydown = onCellKeyDown;

      td.appendChild(txt);
      cells.push(txt);
    }
  }
}

function solveSudoku() {
  let matrix;
  try {
    matrix = genMatrix(
      function*() {
        for (let row = 0; row < 9; row++)
          for (let col = 0; col < 9; col++)
            yield {row, col};
        for (let row = 0; row < 9; row++)
          for (let digit = 1; digit <= 9; digit++)
            yield {row, digit};
        for (let col = 0; col < 9; col++)
          for (let digit = 1; digit <= 9; digit++)
            yield {col, digit};
        for (let box = 0; box < 9; box++)
          for (let digit = 1; digit <= 9; digit++)
            yield {box, digit};
      }(),
      function*() {
        for (let row = 0; row < 9; row++)
          for (let col = 0; col < 9; col++)
            for (let digit = 1; digit <= 9; digit++)
              yield {
                include: cells[row * 9 + col].textContent == digit,
                cols: [{row, col}, {row, digit}, {col, digit}, {
                  box: Math.floor(row / 3) * 3 + Math.floor(col / 3),
                  digit
                }]
              };
      }()
    );
  }
  catch (e) {
    if (!(e instanceof ConflictingRowsError))
      throw e;
    let r1 = Object.assign(...e.row1);
    let r2 = Object.assign(...e.row2);
    cells[r1.row * 9 + r1.col].classList.add('conflict');
    cells[r2.row * 9 + r2.col].classList.add('conflict');
    return;
  }

  let solutionsGen = dlx(matrix);
  solutions = [];
  for (let i = 0; i < 2; i++) {
    let solution = solutionsGen.next().value;
    if (solution === undefined)
      break;
    solutions.push(solution);
  }

  update();
}

function onCellInput(e) {
  solutions = null;
  switch (e.target.textContent.length) {
    case 0:
      break;

    case 81:
      [...e.target.textContent].forEach((d, i) => {
        if (/^[1-9]$/.test(d))
          cells[i].textContent = d;
        else
          cells[i].textContent = '';
      });
      e.target.blur();
      break;

    default:
      let val = e.target.textContent;
      let sel = window.getSelection();
      if (sel.focusNode.parentNode === e.target && sel.rangeCount > 0) {
        val = e.target.textContent[sel.getRangeAt(0).endOffset - 1];
      }
      if (/^[1-9]$/.test(val))
        e.target.textContent = val;
      else
        e.target.textContent = '';
      break;
  }

  update();
}

function onCellKeyDown(e) {
  function nav(x, y) {
    e.preventDefault();
    let [, row, col] = e.target.id.match(/^R(\d)C(\d)$/);
    row = ((+row - 1 + y + 9) % 9) + 1;
    col = ((+col - 1 + x + 9) % 9) + 1;
    document.getElementById(`R${row}C${col}`).focus();
  }
  switch (e.key) {
    case 'ArrowUp':
      nav(0, -1);
      break;
    case 'ArrowDown':
      nav(0, 1);
      break;
    case 'ArrowLeft':
      nav(-1, 0);
      break;
    case 'ArrowRight':
      nav(1, 0);
      break;
  }
}

function update() {
  status.textContent = '';
  controls.classList.toggle('solved', false);

  cells.forEach(c => c.classList.remove('found', 'conflict'));

  if (solutions) {
    for (let rowCols of solutions[0] || []) {
      let {row, col, digit} = Object.assign({}, ...rowCols);
      cells[row * 9 + col].textContent = digit;
      cells[row * 9 + col].classList.add('found');
    }

    if (solutions.length === 1) {
      status.textContent = `Solved`;
      controls.classList.toggle('solved', true);
    } else if (solutions.length > 1) {
      status.textContent = `There is more than one solution`;
      controls.classList.toggle('solved', true);
    } else {
      status.textContent = `No solutions`;
    }
  }
}

function clearSudoku() {
  solutions = null;
  status.textContent = '';

  if (!controls.classList.contains('solved')) {
    cells.forEach(c => {
      c.classList.remove('found', 'conflict');
      c.textContent = '';
    });
  } else {
    cells.forEach(c => {
      c.classList.remove('conflict');
      if (c.classList.contains('found')) {
        c.textContent = '';
        c.classList.remove('found');
      }
    });
  }

  controls.classList.toggle('solved', false);
}
