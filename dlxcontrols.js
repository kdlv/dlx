'use strict';

class DLXControls {
  constructor(runCB, displaySolutionCB, conflictCB) {
    this.runCB = runCB;
    this.displaySolutionCB = displaySolutionCB;
    this.conflictCB = conflictCB;

    this.controlsRun = document.getElementById('controlsRun');
    this.controlsProgress = document.getElementById('controlsProgress');
    this.controlsNodes = document.getElementById('controlsNodes');
    this.controlsSolutions = document.getElementById('controlsSolutions');
    this.controlsSolsPrev = document.getElementById('controlsSolsPrev');
    this.controlsSolsNext = document.getElementById('controlsSolsNext');
    this.controlsSolsRange = document.getElementById('controlsSolsRange');
    this.controlsShowingSol = document.getElementById('controlsShowingSol');

    this.saveSolutions = 1000;

    this.controlsRun.onclick = () => {
      if (this.solutions == null)
        this.run();
      else
        this.reset();
    };

    this.controlsSolsRange.oninput = () => {
      if (this.solutions == null)
        return;
      let rangeVal = Number.parseInt(this.controlsSolsRange.value) - 1;
      if (this.solutions.length >= 1)
        this.showSol = Math.min(rangeVal, this.solutions.length - 1);
      this.updateUI();
    };

    this.controlsSolsPrev.onclick = () => {
      this.controlsSolsRange.value -= +1;
      this.controlsSolsRange.oninput();
    };
    this.controlsSolsNext.onclick = () => {
      this.controlsSolsRange.value -= -1;
      this.controlsSolsRange.oninput();
    };

    this.reset();
  }

  run() {
    this.reset();

    this.solutions = [];
    this.foundSolutions = 0;
    this.showingSol = null;
    this.showSol = null;

    this.dlxworker = new Worker('dlxworker.js');
    this.dlxworker.onmessage = (e) => {
      let {conflict, solutions, updates, progress, nodes} = e.data;

      if (conflict) {
        let o1 = Object.assign(...conflict.row1);
        let o2 = Object.assign(...conflict.row2);
        this.reset();
        this.conflictCB(o1, o2);
        return;
      }

      this.updates = updates;
      this.progress = progress;
      this.nodes = nodes;

      for (let s of solutions) {
        if (this.solutions.length < this.saveSolutions)
          this.solutions.push(s);
        this.foundSolutions++;
      }
      if (this.solutions.length >= 1 && this.showSol == null)
        this.showSol = 0;

      this.updateUI();
    }

    this.dlxworker.postMessage(this.runCB());
  }

  reset() {
    if (this.dlxworker != null)
      this.dlxworker.terminate();

    this.solutions = null;
    this.foundSolutions = null;
    this.showingSol = null;
    this.showSol = null;
    this.progress = null;
    this.nodes = null;

    this.dlxworker = null;

    this.controlsSolsRange.min = 1;
    this.controlsSolsRange.max = 1;
    this.controlsSolsRange.value = 1;

    this.updateUI();
  }

  updateUI() {
    this.controlsSolsRange.max = (this.solutions || [0]).length;

    if (this.nodes == null)
      this.controlsNodes.textContent = '-';
    else
      this.controlsNodes.textContent = this.nodes;

    if (this.progress == null)
      this.controlsProgress.textContent = '-';
    else
      this.controlsProgress.textContent = `${(this.progress * 100).toFixed(2)}%`;

    if (this.foundSolutions == null)
      this.controlsSolutions.textContent = '-';
    else
      this.controlsSolutions.textContent = this.foundSolutions;

    if (this.showSol == null) {
      this.displaySolutionCB(null);
    }
    if (this.showSol != null && this.showingSol !== this.showSol) {
      this.showingSol = this.showSol;
      this.displaySolutionCB(this.solutions[this.showingSol]);
    }
    if (this.showingSol !== null)
      this.controlsShowingSol.textContent = this.showingSol + 1;
    else
      this.controlsShowingSol.textContent = '-';

    if (this.solutions == null)
      this.controlsRun.textContent = 'Run';
    else
      this.controlsRun.textContent = 'Reset';
  }
}
