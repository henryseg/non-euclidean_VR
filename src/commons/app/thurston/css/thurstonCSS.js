// language=css
export default `
    #thurstonDialogBoxWrap {
        margin: 0;
        background: rgba(0, 0, 0, 0.8);
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        visibility: hidden;
    }

    #thurstonDialogBox {
        background: #9b9b9b;
        opacity: 1;
        width: 300px;
        margin-top: 100px;
        margin-left: auto;
        margin-right: auto;
        padding: 20px;
    }

    #thurstonDownloadButton {
        display: block;
        position: fixed;
        bottom: 0;
        right: 0;
        padding: 10px;
        background: black;
        color: white;
        visibility: hidden;
    }

    #thurstonDialogBoxWrap.visible,
    #thurstonDownloadButton.visible {
        visibility: visible;
    }
`