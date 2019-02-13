'use strict';

importScripts('exact-cover.js');

let dlxGen;

onmessage = (e) => {
  let {items, itemsSecondary, options, yieldAfterUpdates} = e.data;

  dlxGen = dlx(items, itemsSecondary, options, yieldAfterUpdates);
  for (let u of dlxGen) {
    postMessage(u);
  }
};
