'use strict';

importScripts('exact-cover.js');

let dlxGen;

onmessage = (e) => {
  let {items, options, yieldAfterUpdates} = e.data;

  dlxGen = dlx(items, options, yieldAfterUpdates);
  for (let u of dlxGen) {
    postMessage(u);
  }
};
