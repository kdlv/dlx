'use strict';

window.onload = function() {
  const sudoku = document.getElementById('sudoku');
  const run = document.getElementById('run');

  let cells = [];
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
      txt.setAttribute('maxlength', 1);
      td.appendChild(txt);
      cells.push(txt);
    }
  }

  [...'__7___5_8_9_5____4_2___3___5__3__6_9____5__4_91_____8___6___1______62___4__1___2_'].forEach(
    (d, i) => {
      if (/^[1-9]$/.test(d)) {
        cells[i].value = d;
      }
    });

  run.onclick = function() {
    let matrix = genMatrix(
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

    let {nodes, updates, solutions} = dlx(matrix);

    for (let solution of solutions.slice(0, 1)) {
      for (let rowCols of solution) {
        let {row, col, digit} = Object.assign(...rowCols);
        cells[row * 9 + col].value = digit;
        cells[row * 9 + col].classList.add('found');
      }
    }
  }
}
