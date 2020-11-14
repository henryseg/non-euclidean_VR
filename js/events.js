/**
 * @module events
 *
 * @description
 * Handling events for interactions
 *
 * @todo Add the events related to the VR set? Check how to do that.
 * Look at {@link https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API |WebXR} ?
 * @todo Merge with controls?
 */

import{
  renderer
} from "./thurston.js";



/**
 * Action when the window is resized
 * @param {Event} event
 * @todo update the screen resolution passed to the shader
 */
function onResize(event) {
  renderer.setSize(window.innerWidth, window.innerHeight);
}


/**
 * Move up
 */
function actionMoveUp(){

}
/**
 * Move down
 */
function actionMoveDown(){

}
/**
 * Move left
 */
function actionMoveLeft(){

}
/**
 * Move right
 */
function actionMoveRight(){

}
/**
 * Move forward
 */
function actionMoveForward(){

}
/**
 * Move backward
 */
function actionMoveBackward(){

}

/**
 * Keyboard commands.
 * Each main entry correspond to a keyboard type (American, French, etc).
 * @type {{'fr': {}, 'us': {}}}
 */
const keyboard = {
    'us': {
        65: {
            index: 1,
            sign: 1,
            active: 0
        }, // a
        68: {
            index: 1,
            sign: -1,
            active: 0
        }, // d
        87: {
            index: 0,
            sign: 1,
            active: 0
        }, // w
        83: {
            index: 0,
            sign: -1,
            active: 0
        }, // s
        81: {
            index: 2,
            sign: -1,
            active: 0
        }, // q
        69: {
            index: 2,
            sign: 1,
            active: 0
        }, // e
        38: {
            index: 3,
            sign: 1,
            active: 0
        }, // up
        40: {
            index: 3,
            sign: -1,
            active: 0
        }, // down
        37: {
            index: 4,
            sign: -1,
            active: 0
        }, // left
        39: {
            index: 4,
            sign: 1,
            active: 0
        }, // right
        222: {
            index: 5,
            sign: 1,
            active: 0
        }, // single quote
        191: {
            index: 5,
            sign: -1,
            active: 0
        }, // fwd slash
    },
    'fr': {
        81: {
            index: 1,
            sign: 1,
            active: 0
        }, // q
        68: {
            index: 1,
            sign: -1,
            active: 0
        }, // d
        90: {
            index: 0,
            sign: 1,
            active: 0
        }, // z
        83: {
            index: 0,
            sign: -1,
            active: 0
        }, // s
        65: {
            index: 2,
            sign: -1,
            active: 0
        }, // a
        69: {
            index: 2,
            sign: 1,
            active: 0
        }, // e
        38: {
            index: 3,
            sign: 1,
            active: 0
        }, // up
        40: {
            index: 3,
            sign: -1,
            active: 0
        }, // down
        37: {
            index: 4,
            sign: -1,
            active: 0
        }, // left
        39: {
            index: 4,
            sign: 1,
            active: 0
        }, // right
        165: {
            index: 5,
            sign: 1,
            active: 0
        }, // ù
        61: {
            index: 5,
            sign: -1,
            active: 0
        }, // =
    }
};



/**
 * Action when a key is pressed
 * @param {Event} event
 */
function onKey(event) {
  event.preventDefault();
  //console.log(event);
}


/**
 * Action for taps on a phone
 * @param {Event} event
 */
function onTap(event) {}


/**
 * Action when a click is detected
 * @param {Event} event
 */
function onClick(event) {}

/**
 * Init the events.
 * Add all necessary event listeners.
 */
function addListeners() {
  window.addEventListener("resize", onResize, false);
  document.addEventListener('keydown', onKey, false);
}

export{
    addListeners
};
