'use strict';

window.onload = function() {
  const input = document.getElementById("input");
  const run = document.getElementById("run");
  const output = document.getElementById("output");

  run.focus();
  output.value = "";

  run.onclick = function() {
    let matrix = parseMatrix(input.value);

    let {nodes, updates, solutions} = dlx(genMatrix(
      matrix[0].map((_, i) => i),
      matrix.map(row => ({
        cols: row.map((val, i) => val ? i : null).filter(x => x != null)
      }))
    ));

    output.value = `${solutions.length} solutions, ${nodes} nodes, ${updates} updates\n\n` +
      solutions.map(solution =>
        solution.map(row =>
          matrix[0].map((_, i) => row.includes(i) ? '1' : '0').join(' ')
        ).join('\n')
      ).join('\n\n');
  }
}
