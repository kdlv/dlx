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
  [...board.childNodes].forEach(c => c.remove());
  txtN.textContent = N;
  cells = [];

  for (let i = 0; i < N; i++) {
    let major = document.createElement('div');
    board.appendChild(major);
    for (let j = 0; j < N; j++) {
      let cell = document.createElement('div');
      major.appendChild(cell);
      cells.push(cell);
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
      for (let c = 0, i = 0; c < N; c++, i = i >= 0 ? -i - 1 : -i) {
        let row = Math.floor(N / 2) + i;
        let col = Math.floor(N / 2) + i;
        yield {row};
        yield {col};
      }
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
    1000
  );

  let solutions = [];
  let nodes, updates;
  for (let u of solGen) {
    solutions = [].concat(solutions, u.solutions);
    nodes = u.nodes;
    updates = u.updates;
  }

  console.log(`N: ${N}`);
  console.log(`Solutions: ${solutions.length}`);
  console.log(`Updates: ${updates}`);
  console.log(`Nodes: ${nodes}`);
  displaySolution(solutions[0]);
}

function displaySolution(solution) {
  for (let c of cells)
    c.textContent = '';
  for (let {row, col} of solution.map(r => Object.assign({}, ...r))) {
    cells[col*N + row].textContent = '♛';
  }
}
