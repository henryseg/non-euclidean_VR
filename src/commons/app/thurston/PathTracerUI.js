import {bind} from "../../../utils.js";

export const STATE_SLEEPING = 0;
export const STATE_DIALOG = 1;
export const STATE_TRACING = 2;


/**
 * @class
 *
 * @classdesc
 * A class handling a dialog box for the path tracer settings
 */
export class PathTracerUI {

    constructor(thurston) {
        /**
         * The Thurston object controlled by this controls
         * @type {Thurston}
         */
        this.thurston = thurston
        /**
         * State of the UI
         * The possible states are defined as constants
         * @type {number}
         */
        this.state = STATE_SLEEPING;
        /**
         * Wrap of the dialog box
         * @type {HTMLElement}
         */
        this.dialogBoxWrap = document.getElementById('thurstonDialogBoxWrap');
        /**
         * Download button
         * @type {HTMLElement}
         */
        this.downloadButton = document.getElementById('thurstonDownloadButton');

        const _onPressP = bind(this, this.onPressP);
        window.addEventListener('keydown', _onPressP);
        const _onClickGo = bind(this, this.onClickGo);
        document.querySelector('#thurstonDialogBox input[type=submit]').addEventListener('click', _onClickGo);
        const _onClickDownload = bind(this, this.onClickDownload);
        document.getElementById('thurstonDownloadButton').addEventListener('click', _onClickDownload);


    }

    /**
     * When user press the key P, enter/leave the path tracer UI
     * @param {KeyboardEvent} event
     */
    onPressP(event) {
        if (event.key === 'p') {
            switch (this.state) {
                case STATE_SLEEPING:
                    const widthInput = document.getElementById('widthInput');
                    widthInput.value = window.innerWidth;
                    const heightInput = document.getElementById('heightInput');
                    heightInput.value = window.innerHeight;
                    this.dialogBoxWrap.classList.add('visible');
                    this.state = STATE_DIALOG;
                    break;
                case STATE_TRACING:
                    this.downloadButton.classList.remove('visible');
                    this.thurston.setSize(window.innerWidth, window.innerHeight);
                    this.thurston.switchRenderer();
                    this.state = STATE_SLEEPING;
                    break;
                default:
                    this.dialogBoxWrap.classList.remove('visible');
                    this.state = STATE_SLEEPING;
            }
        }
    }

    /**
     * When the user validate the choice of resolution
     * @param {MouseEvent} event
     */
    onClickGo(event) {
        if (this.state === STATE_DIALOG) {
            const widthInput = document.getElementById('widthInput');
            const heightInput = document.getElementById('heightInput');
            this.thurston.setSize(widthInput.value, heightInput.value);
            this.thurston.ptCamera.aspect = widthInput.value / heightInput.value;
            this.thurston.ptCamera.updateProjectionMatrix();
            this.dialogBoxWrap.classList.remove('visible');
            this.downloadButton.classList.add('visible');
            this.thurston.switchRenderer();
            this.state = STATE_TRACING;
        }
    }

    /**
     * When the user start the download
     * @param {MouseEvent} event
     */
    onClickDownload(event) {
        if (this.state === STATE_TRACING) {
            this.thurston.ptRenderer.renderAccTarget();
            this.downloadButton.href = this.thurston.ptRenderer.domElement.toDataURL('image/png', 1);
            this.downloadButton.download = 'export.png';
        }
    }

}