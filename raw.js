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
  let rows = lines.map(l => l.split(/ +/));
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

    let stats = {};
    let solutions = [...dlx(
      matrix[0].map((_, i) => i),
      [],
      matrix.map(row => ({
        cols: row.map((val, i) => val ? i : null).filter(x => x != null)
      })),
      stats
    )];

    outputMatrix.value = `${solutions.length} solutions, ${stats.nodes} nodes, ${stats.updates} updates\n\n` +
      solutions.map(solution =>
        solution.map(row =>
          matrix[0].map((_, i) => row.includes(i) ? '1' : '0').join(' ')
        ).join('\n')
      ).join('\n\n');
  }

  outputNames.value = "";

  runNames.onclick = function() {
    let {columns, columnsSecondary, rows} = parseNames(inputNames.value);

    let stats = {};
    let solutions = [...dlx(columns, columnsSecondary, rows.map(r => ({cols: r})), stats)];

    outputNames.value = `${solutions.length} solutions, ${stats.nodes} nodes, ${stats.updates} updates\n\n` +
      solutions.map(solution =>
        solution.map(row => row.join(' ')).join('\n')
      ).join('\n\n');
  }
}
