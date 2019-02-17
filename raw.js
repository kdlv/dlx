'use strict';

let dlxControls;

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
  const inputNames = document.getElementById("inputNames");
  const outputNames = document.getElementById("outputNames");

  outputNames.value = "";

  dlxControls = new DLXControls(
    () => {
      let {columns, columnsSecondary, rows} = parseNames(inputNames.value);
      return {
        items: [].concat(columns, columnsSecondary),
        options: rows,
        yieldAfterUpdates: 1000000
      };
    },
    (sol) => {
      if (sol == null)
        return;
      outputNames.value = sol.map(row => row.map(c => c.n + (c._color != null ? `:${c._color}` : '')).join(' ')).join('\n');
    }
  );
}
