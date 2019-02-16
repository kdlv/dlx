'use strict';

function getColumnIdentifier(colname) {
  if (colname instanceof Object)
    return JSON.stringify(Object.entries(colname).sort(x => x[0]));
  return colname;
}

function removeMeta(colname) {
  if (colname instanceof Object)
    for (let k of Object.keys(colname).filter(k => k[0] == '_'))
      delete colname[k];
  return colname;
}

class ConflictingRowsError extends Error {}

function genMatrix(columns, rows) {
  let root = {type: 'root'};
  root.left = root.right = root;

  let rootSecondary = {type: 'root'};
  rootSecondary.left = rootSecondary.right = rootSecondary;

  let headers = {};
  for (let name of columns) {
    let r = name._secondary ? rootSecondary : root;
    name = removeMeta(name);
    let header = {type: 'header', name, size: 0};
    header.up = header.down = header;
    header.right = r;
    header.left = r.left;
    r.left.right = header;
    r.left = header;
    headers[getColumnIdentifier(name)] = header;
  }

  let included = [];

  let col = root.right;
  for (let {include, cols} of rows) {
    let firstThisRow = null;
    for (let colName of cols) {
      let color = colName._color;
      colName = removeMeta(colName);
      let col = headers[getColumnIdentifier(colName)];

      let cell = {type: 'cell', column: col};
      if (color != null)
        cell.color = color;

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
    cols.push(Object.assign({}, r.column.name));
    r = r.right;
  } while (r !== row);
  return cols;
}

function dlx(items, options, yieldAfterUpdates) {
  if (yieldAfterUpdates == null)
    yieldAfterUpdates = 1;
  let nextUpdate = yieldAfterUpdates;
  let stats = {};
  stats.nodes = 0;
  stats.updates = 0;

  let root = genMatrix(items, options);

  let solutions = [];
  let selectedRows = [];
  let levels = [];

  function* search(k) {
    stats.nodes++;
    if (root.right === root) {
      solutions.push(selectedRows.map(row => getRowColumns(row)));
      return;
    }
    if (stats.updates >= nextUpdate) {
      yield {solutions, nodes: stats.nodes, updates: stats.updates, levels, progress: progress_approx()};
      solutions = [];
      nextUpdate += yieldAfterUpdates;
    }

    // Choose a column
    let c = root.right;
    for (let j = c.right; j !== root; j = j.right) {
      if (j.size < c.size)
        c = j;
    }
    levels.push({current: null, options: c.size});

    cover_col(c);
    for (let r = c.down, lvlchoice = 1; r !== c; r = r.down) {
      levels[k].current = lvlchoice++;
      selectedRows.push(r);
      for (let j = r.right; j !== r; j = j.right) {
        if (j.color === undefined)
          cover_col(j.column);
        else if (j.color !== null)
          purify(j);
      }
      yield* search(k + 1);
      selectedRows.pop();
      for (let j = r.left; j !== r; j = j.left) {
        if (j.color === undefined)
          uncover_col(j.column);
        else if (j.color !== null)
          unpurify(j);
      }
    }
    uncover_col(c);

    if (k === 0)
      yield {solutions, nodes: stats.nodes, updates: stats.updates, levels, progress: 1};
    levels.pop();
  }

  function purify(p) {
    p.column.name._color = p.color;
    for (let q = p.column.down; q !== p.column; q = q.down) {
      if (q.color !== p.color)
        hide(q);
      else
        q.color = null;
    }
  }

  function unpurify(p) {
    p.column.name._color = undefined;
    for (let q = p.column.down; q !== p.column; q = q.down) {
      if (q.color === null)
        q.color = p.color;
      else
        unhide(q);
    }
  }

  function hide(p) {
    for (let j = p.right; j !== p; j = j.right) {
      if (j.color === null)
        continue;
      stats.updates++;
      j.down.up = j.up;
      j.up.down = j.down;
      j.column.size--;
    }
  }

  function unhide(p) {
    for (let j = p.left; j !== p; j = j.left) {
      if (j.color === null)
        continue;
      j.column.size++;
      j.down.up = j;
      j.up.down = j;
    }
  }

  function cover_col(c) {
    stats.updates++;
    c.right.left = c.left;
    c.left.right = c.right;
    for (let i = c.down; i !== c; i = i.down) {
      hide(i);
    }
  }

  function uncover_col(c) {
    for (let i = c.up; i !== c; i = i.up) {
      unhide(i);
    }
    c.right.left = c;
    c.left.right = c;
  }

  function progress_approx() {
    let t = 1, ret = 0;
    for (let c of levels) {
      t *= c.options;
      ret += (c.current - 1) / t;
    }
    return ret;
  }

  return search(0);
}
