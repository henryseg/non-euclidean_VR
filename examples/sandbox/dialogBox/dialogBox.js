function onKeyDown(event) {
    if (event.key === 'p') {
        const widthInput = document.getElementById("widthInput");
        widthInput.value = window.innerWidth;
        const heightInput = document.getElementById("heightInput");
        heightInput.value = window.innerHeight;
        const dialogWrap = document.getElementById('dialogBoxWrap');
        dialogWrap.classList.toggle("visible");
    }
}

function submit(event) {
    const widthInput = document.getElementById("widthInput");
    const heightInput = document.getElementById("heightInput");
    console.log(widthInput.value, heightInput.value);
    const dialogWrap = document.getElementById('dialogBoxWrap');
    dialogWrap.classList.toggle("visible");
}


window.addEventListener('keydown', onKeyDown, false);
const submitButton = document.getElementById("submit");
submitButton.addEventListener('click', submit)