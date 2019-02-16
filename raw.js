'use strict';

function parseMatrix(str) {
  return str.split(/\n+/).map(l => l.trim()).filter(l => l).map(l => l.split(/ +/)).map(
    l => l.map(c => c === "0" ? false : true)
  );
}

function parseNames(str) {
  let lines = str.split(/\n+/).map(l => l.trim()).filter(l => l);
  let [columns, columnsSecondary] = lines.shift().split(/\|/, 2).map(cs => cs.trim().split(/ +/));
  columnsSecondary = columnsSecondary || [];
  columns = columns.map(n => ({n}));
  columnsSecondary = columnsSecondary.map(n => ({n, _secondary: true}));
  let rows = lines.map(l => l.split(/ +/));
  rows = rows.map(r => ({
    cols: r.map(c => {
      let [n, _color] = c.split(':');
      return {n, _color};
    })
  }));
  return {columns, columnsSecondary, rows};
}

window.onload = function() {
  const inputMatrix = document.getElementById("inputMatrix");
  const runMatrix = document.getElementById("runMatrix");
  const outputMatrix = document.getElementById("outputMatrix");
  const inputNames = document.getElementById("inputNames");
  const runNames = document.getElementById("runNames");
  const outputNames = document.getElementById("outputNames");

  runMatrix.focus();
  outputMatrix.value = "";

  runMatrix.onclick = function() {
    let matrix = parseMatrix(inputMatrix.value);

    let gen = dlx(
      matrix[0].map((_, i) => i),
      matrix.map(row => ({
        cols: row.map((val, i) => val ? i : null).filter(x => x != null)
      }))
    );

    let solutions = [];
    let nodes, updates;
    for (let u of gen) {
      solutions = [].concat(solutions, u.solutions);
      nodes = u.nodes;
      updates = u.updates;
    }

    outputMatrix.value = `${solutions.length} solutions, ${nodes} nodes, ${updates} updates\n\n` +
      solutions.map(solution =>
        solution.map(row =>
          matrix[0].map((_, i) => row.includes(i) ? '1' : '0').join(' ')
        ).join('\n')
      ).join('\n\n');
  }

  outputNames.value = "";

  runNames.onclick = function() {
    let {columns, columnsSecondary, rows} = parseNames(inputNames.value);

    let gen = dlx([].concat(columns, columnsSecondary), rows);

    let solutions = [];
    let nodes, updates;
    for (let u of gen) {
      solutions = [].concat(solutions, u.solutions);
      nodes = u.nodes;
      updates = u.updates;
    }

    outputNames.value = `${solutions.length} solutions, ${nodes} nodes, ${updates} updates\n\n` +
      solutions.map(solution =>
        solution.map(row => row.map(c => c.n + (c._color != null ? `:${c._color}` : '')).join(' ')).join('\n')
      ).join('\n\n');
  }
}
