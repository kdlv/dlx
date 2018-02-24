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
}
