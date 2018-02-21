'use strict';

function parseMatrix(str) {
  return str.split(/\n+/).filter(l => !l.match(/^ *$/)).map(l => l.split(/ +/)).map(
    l => l.map(c => c === "0" ? false : true)
  );
}

function genMatrix(columns, rows) {
  let root = {type: 'root'};
  root.left = root.right = root;

  columns.forEach(name => {
    let header = {type: 'header', name, size: 0};
    header.up = header.down = header;
    header.right = root;
    header.left = root.left;
    root.left.right = header;
    root.left = header;
  });

  let col = root.right;
  for (let row of rows) {
    let firstThisRow = null;
    for (let colName of row) {
      while (col.name != colName) {
        col = col.right;
      }

      let cell = {type: 'cell', column: col};

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
      col.size++;
      cell.up = col.up;
      cell.down = col;
      col.up.down = cell;
      col.up = cell;
    }
  }

  return root;
}

function dlx(matrix) {
  let results = {nodes: 1, updates: 0, solutions: []};

  let root = matrix;
  for (let r = root.right; r !== root; r = r.right) {
    results.nodes += r.size + 1;
  }

  let O = [];

  function search(k) {
    if (root.right === root) {
      let solution = [];
      for (let row of O) {
        let cols = [];
        let r = row;
        do {
          cols.push(r.column.name);
          r = r.right;
        } while (r !== row);
        solution.push(cols);
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
      O.push(r);
      for (let j = r.right; j !== r; j = j.right) {
        cover_col(j.column);
      }
      search(k + 1);
      O.pop();
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
