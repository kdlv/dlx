'use strict';

function getColumnIdentifier(colname) {
  if (colname instanceof Object)
    return JSON.stringify(Object.entries(colname).sort(x => x[0]));
  return colname;
}

class ConflictingRowsError extends Error {}

function genMatrix(columns, columnsSecondary, rows) {
  let root = {type: 'root'};
  root.left = root.right = root;

  let rootSecondary = {type: 'rootSecondary'};
  rootSecondary.left = rootSecondary.right = rootSecondary;

  let headers = {};
  for (let name of columns) {
    let header = {type: 'header', name, size: 0};
    header.up = header.down = header;
    header.right = root;
    header.left = root.left;
    root.left.right = header;
    root.left = header;
    headers[getColumnIdentifier(name)] = header;
  };
  for (let name of columnsSecondary) {
    let header = {type: 'header', name, size: 0};
    header.up = header.down = header;
    header.right = rootSecondary;
    header.left = rootSecondary.left;
    rootSecondary.left.right = header;
    rootSecondary.left = header;
    headers[getColumnIdentifier(name)] = header;
  };

  let included = [];

  let col = root.right;
  for (let {include, cols} of rows) {
    let firstThisRow = null;
    for (let colName of cols) {
      let col = headers[getColumnIdentifier(colName)];

      let cell = {type: 'cell', column: col};

      // Insert cell left of firstThisRow (i.e. last)
      if (firstThisRow === null) {
        firstThisRow = cell;
        cell.left = cell;
        cell.right = cell;
        if (include) {
          included.push(cell);
        }
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

  for (let row of included) {
    let j = row;
    do {
      let c = j.column;
      if (c.removedBy) {
        let err = new ConflictingRowsError("Tried to include conflicting rows");
        err.row1 = getRowColumns(c.removedBy);
        err.row2 = getRowColumns(row);
        err.column = c.name;
        throw err;
      }
      c.removedBy = row;
      c.right.left = c.left;
      c.left.right = c.right;
      for (let i = c.down; i !== c; i = i.down) {
        for (let j = i.right; j !== i; j = j.right) {
          j.down.up = j.up;
          j.up.down = j.down;
          j.column.size--;
        }
      }
      j = j.right;
    } while (j !== row);
  }

  return root;
}

function getRowColumns(row) {
  let cols = [];
  let r = row;
  do {
    cols.push(r.column.name);
    r = r.right;
  } while (r !== row);
  return cols;
}

function dlx(items, itemsSecondary, options, stats) {
  if (stats == null)
    stats = {};
  stats.nodes = 1;
  stats.updates = 0;

  let root = genMatrix(items, itemsSecondary, options);
  for (let r = root.right; r !== root; r = r.right) {
    stats.nodes += r.size + 1;
  }

  let selectedRows = [];

  function* search(k) {
    if (root.right === root) {
      yield selectedRows.map(row => getRowColumns(row));
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
      selectedRows.push(r);
      for (let j = r.right; j !== r; j = j.right) {
        cover_col(j.column);
      }
      yield* search(k + 1);
      selectedRows.pop();
      for (let j = r.left; j !== r; j = j.left) {
        uncover_col(j.column);
      }
    }
    uncover_col(c);
  }

  function cover_col(c) {
    stats.updates++;
    c.right.left = c.left;
    c.left.right = c.right;
    for (let i = c.down; i !== c; i = i.down) {
      for (let j = i.right; j !== i; j = j.right) {
        stats.updates++;
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

  return search(0);
}
