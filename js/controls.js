/**
 * Keyboard commands.
 * Each main entry correspond to a keyboard type (American, French, etc).
 * @type {{fr: {}, us: {}}}
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
 * @class
 *
 * @classdesc
 * Class handling interactions with the keyboard, phone, VR set, etc.
 * @todo Merge with events.js ?
 */
class Controls {


    /**
     * Constructor.
     */
    constructor() {
    }

    /**
     *
     * @param {string} keyboard - the keyboard code
     */
    setKeyboard(keyboard){
    }

    /**
     * Initialize all the parameters for the controls
     * @todo How much of this should be part of the constructor?
     */
    init(){
    }

    /**
     * Update the data from the input (keyboard, phone, VR set, etc).
     */
    update(){}



}

export {
    Controls
}
