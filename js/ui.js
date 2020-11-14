/**
 * @module User Interface
 *
 * @description
 * Control the panel used to change the parameters of the scene.
 * Rely on {@link https://github.com/dataarts/dat.gui| dat.GUI}
 */

import {
  GUI
} from "./lib/dat.gui.module.js"


let stats;
let gui;

/**
 * Init the User Interface.
 */
function initUI() {
  let guiInfo = {
    help: function () {
      window.open('https://github.com/henryseg/non-euclidean_VR');
    },
  };
  gui = new GUI();
  gui.close();
  gui.add(guiInfo, 'help').name("Help/About");
}

/**
 * Init the Stats pannel.
 * @todo Understand how to make it work as a module…
 */
function initStats() {
  stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
}


initUI();
initStats();

export{
    gui,
    stats,
};
