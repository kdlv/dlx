// class DLXData {
//   constructor(left, right, up, down, column) {
//     this.left = left;
//     this.right = right
//     this.up = up;
//     this.down = down;
//     this.column = column;
//   }
// }

// class DLXColumn {
//   constructor(left, right, up, down, column, name, size) {
//     this.left = left;
//     this.right = right
//     this.up = up;
//     this.down = down;
//     this.column = column;
//     this.name = name;
//     this.size = size;
//   }
// }

// class DLXRoot {
//   constructor(left, right) {
//     this.left = left;
//     this.right = right
//   }
// }

function parseMatrix(str) {
  return str.split(/\n+/).filter(l => !l.match(/^ *$/)).map(l => l.split(/ +/)).map(
    l => l.map(c => c === "0" ? false : true)
  );
}

function doughnut(matrix) {
  let root = {};

  let headers = matrix[0].map((_, i) => ({name: i, size: 0}));
  for (let i = 0; i < headers.length; i++) {
    headers[i].up = headers[i].down = headers[i];
    headers[i].left = i - 1 < 0 ? root : headers[i - 1];
    headers[i].right = i + 1 >= headers.length ? root : headers[i + 1];
  }
  root.left = headers[headers.length - 1];
  root.right = headers[0];

  for (let row = 0; row < matrix.length; row++) {
    lastThisRow = null;
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col]) {
        let cell = {column: headers[col]};

        // Insert cell right of lastThisRow
        if (lastThisRow === null) {
          lastThisRow = cell;
        } else {
          lastThisRow.right.left = cell;
          lastThisRow.right = cell;
        }
        cell.right = lastThisRow;
        cell.left = lastThisRow;
        lastThisRow = cell;

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
