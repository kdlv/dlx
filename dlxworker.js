'use strict';

importScripts('exact-cover.js');

let dlxGen;

onmessage = (e) => {
  let {items, options, yieldAfterUpdates} = e.data;

  try {
    dlxGen = dlx(items, options, yieldAfterUpdates);
  }
  catch (e) {
    if (!(e instanceof ConflictingRowsError))
      throw e;
    postMessage({conflict: {row1: e.row1, row2: e.row2}});
    return;
  }

  for (let u of dlxGen) {
    postMessage(u);
  }
};
