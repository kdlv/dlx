'use strict';

let board;
let decN;
let incN;
let txtN;
let run;

let cells = [];

let N = 8;
let solutions = [];
let stats = {};

function createBoard() {
  [...board.children].forEach(c => c.remove());
  txtN.textContent = N;
  cells = [];

  for (let row = 1; row <= N; row++) {
    let tr = document.createElement('tr');
    board.appendChild(tr);
    for (let col = 1; col <= N; col++) {
      let td = document.createElement('td');
      tr.appendChild(td);
      cells.push(td);
    }
  }
}

window.onload = function() {
  board = document.getElementById('board');
  decN = document.getElementById('decN');
  incN = document.getElementById('incN');
  txtN = document.getElementById('txtN');
  run = document.getElementById('run');

  decN.onclick = () => {
    N = Math.max(1, N - 1);
    createBoard();
  };
  incN.onclick = () => {
    N++;
    createBoard();
  };

  run.onclick = findSolutions;

  createBoard();
}

function findSolutions() {
  stats = {};

  let solGen = dlx(
    function*() {
      for (let row = 0; row < N; row++)
        yield {row};
      for (let col = 0; col < N; col++)
        yield {col};
    }(),
    function*() {
      for (let n = 0; n < 2*N - 1; n++) {
        yield {diag: n};
        yield {diag: -n};
      }
    }(),
    function*() {
      for (let row = 0; row < N; row++) {
        for (let col = 0; col < N; col++) {
          yield {
            cols: [
              {row}, {col},
              {diag: row + col},
              {diag: -(N-1 - row) - col}
            ]
          };
        }
      }
    }(),
    stats
  );

  solutions = [...solGen];
  displaySolution(solutions[0]);
  console.log(stats);
  console.log(solutions.length);
  // let s1 = solGen.next().value;
  // displaySolution(s1);
}

function displaySolution(solution) {
  for (let c of cells)
    c.textContent = '';
  for (let {row, col} of solution.map(r => Object.assign({}, ...r))) {
    cells[row*N + col].textContent = 'Q';
  }
}
