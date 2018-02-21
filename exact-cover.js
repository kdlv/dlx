'use strict';

function parseMatrix(str) {
  return str.split(/\n+/).filter(l => !l.match(/^ *$/)).map(l => l.split(/ +/)).map(
    l => l.map(c => c === "0" ? false : true)
  );
}

function doughnut(matrix, stats) {
  let root = {type: 'root'};
  stats.nodes++;

  let headers = matrix[0].map((_, i) => ({type: 'header', name: i, size: 0}));
  for (let i = 0; i < headers.length; i++) {
    stats.nodes++;
    headers[i].column = headers[i];
    headers[i].up = headers[i].down = headers[i];
    headers[i].left = i - 1 < 0 ? root : headers[i - 1];
    headers[i].right = i + 1 >= headers.length ? root : headers[i + 1];
  }
  root.left = headers[headers.length - 1];
  root.right = headers[0];

  for (let row = 0; row < matrix.length; row++) {
    let firstThisRow = null;
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col]) {
        let cell = {/* _y: row, _x: col, */ type: 'cell', column: headers[col]};
        stats.nodes++;

        // Insert cell left of firstThisRow (i.e. last)
        if (firstThisRow === null) {
          firstThisRow = cell;
          cell.left = cell;
          cell.right = cell;
        } else {
          cell.right = firstThisRow;
          cell.left = firstThisRow.left;
          firstThisRow.left.right = cell;
          firstThisRow.left = cell;
        }

        // Insert cell above the header (i.e. last)
        headers[col].size++;
        cell.up = headers[col].up;
        cell.down = headers[col];
        headers[col].up.down = cell;
        headers[col].up = cell;
      }
    }
  }

  return root;
}

function dlx(matrix) {
  let results = {nodes: 0, updates: 0, solutions: []};

  let root = doughnut(matrix, results);

  let O = [];

  function search(k) {
    if (root.right === root) {
      let solution = [];
      for (let row of O) {
        let cols = {};
        let r = row;
        do {
          cols[r.column.name] = true;
          r = r.right;
        } while (r !== row);
        solution.push(matrix[0].map((_, i) => cols.hasOwnProperty(i)));
      }
      results.solutions.push(solution);
      return;
    }

    // Choose a column
    let c = root.right;
    for (let j = c.right; j !== root; j = j.right) {
      if (j.size < c.size)
        c = j;
    }

    cover_col(c);

    for (let r = c.down; r !== c; r = r.down) {
      O[k] = r;
      for (let j = r.right; j !== r; j = j.right) {
        cover_col(j.column);
      }
      search(k + 1);
      r = O.pop();
      c = r.column;
      for (let j = r.left; j !== r; j = j.left) {
        uncover_col(j.column);
      }
    }

    uncover_col(c);
  }

  function cover_col(c) {
    results.updates++;
    c.right.left = c.left;
    c.left.right = c.right;
    for (let i = c.down; i !== c; i = i.down) {
      for (let j = i.right; j !== i; j = j.right) {
        results.updates++;
        j.down.up = j.up;
        j.up.down = j.down;
        j.column.size--;
      }
    }
  }

  function uncover_col(c) {
    for (let i = c.up; i !== c; i = i.up) {
      for (let j = i.left; j !== i; j = j.left) {
        j.column.size++;
        j.down.up = j;
        j.up.down = j;
      }
    }
    c.right.left = c;
    c.left.right = c;
  }

  search(0);

  return results;
}
