var projectionDate;

var pdButtons = document.getElementsByClassName("projection-date");

for (var i=0; i < pdButtons.length; i++) {
    pdButtons[i].addEventListener("click", setProjectionDate, false);
}

function setProjectionDate() {
    projectionDate = parseInt(this.dataset.value);
}
