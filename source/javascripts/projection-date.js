var projectionDate = 1;

var pdButtons = document.getElementsByClassName("projection-date");

for (var i=0; i < pdButtons.length; i++) {
    pdButtons[i].addEventListener("click", setProjectionDate, false);
    //pdButtons[i].style.backgroundColor = "lightblue";
}

function setProjectionDate() {
    projectionDate = parseInt(this.dataset.value);
}
