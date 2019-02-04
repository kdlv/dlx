'use strict';

function parseMatrix(str) {
  return str.split(/\n+/).map(l => l.trim()).filter(l => l).map(l => l.split(/ +/)).map(
    l => l.map(c => c === "0" ? false : true)
  );
}

window.onload = function() {
  const inputMatrix = document.getElementById("inputMatrix");
  const runMatrix = document.getElementById("runMatrix");
  const outputMatrix = document.getElementById("outputMatrix");

  runMatrix.focus();
  outputMatrix.value = "";

  runMatrix.onclick = function() {
    let matrix = parseMatrix(inputMatrix.value);

    let dlxMatrix = genMatrix(
      matrix[0].map((_, i) => i),
      matrix.map(row => ({
        cols: row.map((val, i) => val ? i : null).filter(x => x != null)
      }))
    );

    let stats = {};
    let solutions = [...dlx(dlxMatrix, stats)];

    outputMatrix.value = `${solutions.length} solutions, ${stats.nodes} nodes, ${stats.updates} updates\n\n` +
      solutions.map(solution =>
        solution.map(row =>
          matrix[0].map((_, i) => row.includes(i) ? '1' : '0').join(' ')
        ).join('\n')
      ).join('\n\n');
  }
}
