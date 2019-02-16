'use strict';

let board;
let decN;
let incN;
let txtN;
let run;

let dlxControls;

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

  dlxControls = new DLXControls(
    () => ({
      items: [...function*() {
        for (let c = 0, i = 0; c < N; c++, i = i >= 0 ? -i - 1 : -i) {
          let row = Math.floor(N / 2) + i;
          let col = Math.floor(N / 2) + i;
          yield {row};
          yield {col};
        }
        for (let n = 0; n < 2*N - 1; n++) {
          yield {_secondary: true, diag: n};
          yield {_secondary: true, diag: -n};
        }
      }()],
      options: [...function*() {
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
      }()],
      yieldAfterUpdates: 100000
    }),
    displaySolution
  );

  decN.onclick = () => {
    dlxControls.reset();
    N = Math.max(1, N - 1);
    createBoard();
  };
  incN.onclick = () => {
    dlxControls.reset();
    N++;
    createBoard();
  };

  createBoard();
}

function displaySolution(solution) {
  for (let c of cells)
    c.textContent = '';
  for (let {row, col} of (solution || []).map(r => Object.assign({}, ...r))) {
    cells[col*N + row].textContent = '♛';
  }
}
