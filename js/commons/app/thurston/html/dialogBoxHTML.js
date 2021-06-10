// language = html
export default `
<div id="thurstonDialogBoxWrap">
    <div id="thurstonDialogBox">
    <p>
        Choose the resolution of the picture, and click on the "Go".
        You can download the image any time, with the "Download" button in the bottom right corner.
        To leave the path tracer mode hit 'p'.
    </p>
        <form action="javascript:void(0);">
            <label for="widthInput">Width :</label> <input id="widthInput" type="number"><br>
            <label for="heightInput">Height:</label> <input id="heightInput" type="number"><br>
            <input type="submit" value="Go!">
        </form>
    </div>
</div>
`