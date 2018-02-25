'use strict';

let sudoku;
let controls;
let run;
let clear;
let status;
let prev;
let next;

let cells;

let solutions = null;
let curSolution = null;

window.onload = function() {
  sudoku = document.getElementById('sudoku');
  controls = document.getElementById('controls');
  run = document.getElementById('run');
  clear = document.getElementById('clear');
  status = document.getElementById('status');
  next = document.getElementById('next');
  prev = document.getElementById('prev');

  createSudokuGrid();

  run.onclick = solveSudoku;
  clear.onclick = clearSudoku;
  next.onclick = () => {
    curSolution = Math.min(curSolution + 1, solutions.length - 1)
    update();
  }
  prev.onclick = () => {
    curSolution = Math.max(curSolution - 1, 0)
    update();
  }
}

function createSudokuGrid() {
  cells = [];
  for (let row = 1; row <= 9; row++) {
    let tr = document.createElement('tr');
    sudoku.appendChild(tr);
    for (let col = 1; col <= 9; col++) {
      let td = document.createElement('td');
      if (row % 3 == 0)
        td.classList.add('bottom');
      if (col % 3 == 0)
        td.classList.add('right');
      tr.appendChild(td);

      let txt = document.createElement('input');
      txt.id = `R${row}C${col}`;
      txt.setAttribute('type', 'text');
      txt.oninput = onCellInput;

      td.appendChild(txt);
      cells.push(txt);
    }
  }
}

function solveSudoku() {
  let cellsFilled = cells.filter(c => /^[1-9]$/.test(c.value)).length
  if (cellsFilled < 20) {
    status.textContent = `Enter at least 20 digits (${20 - cellsFilled} remaining)`;
    return;
  }

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
                include: cells[row * 9 + col].value == digit,
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

  ({solutions} = dlx(matrix));
  curSolution = 0;

  update();
}

function onCellInput(e) {
  solutions = null;
  switch (e.target.value.length) {
    case 0:
      break;

    case 81:
      [...e.target.value].forEach((d, i) => {
        cells[i].classList.remove('found');
        if (/^[1-9]$/.test(d))
          cells[i].value = d;
        else
          cells[i].value = '';
      });
      e.target.blur();
      break;

    default:
      e.target.classList.remove('found');
      let val = e.target.value[e.target.selectionEnd - 1];
      if (/^[1-9]$/.test(val))
        e.target.value = val;
      else
        e.target.value = '';
      break;
  }

  update();
}

function update() {
  status.textContent = '';
  controls.classList.toggle('solved', false);

  cells.forEach(c => c.classList.remove('found', 'conflict'));

  if (solutions && curSolution != null) {
    for (let rowCols of solutions[curSolution] || []) {
      let {row, col, digit} = Object.assign({}, ...rowCols);
      cells[row * 9 + col].value = digit;
      cells[row * 9 + col].classList.add('found');
    }

    if (solutions.length > 0) {
      status.textContent = `Solution ${curSolution + 1}/${solutions.length}`;
      controls.classList.toggle('solved', true);
    } else {
      status.textContent = `No solutions`;
    }
  }
}

function clearSudoku() {
  controls.classList.toggle('solved', false);
  solutions = null;
  status.textContent = '';
  cells.forEach(c => {
    c.classList.remove('found', 'conflict');
    c.value = '';
  });
}