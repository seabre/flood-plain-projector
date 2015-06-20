toggle_density = document.getElementById('toggle_density');
toggle_markers = document.getElementById('toggle_markers');

toggle_density.addEventListener("click", toggleDensity, false);
toggle_markers.addEventListener("click", toggleMarkers, false);

function toggleDensity() {
  heatmap.setMap(heatmap.getMap() ? null : map);
}

function toggleMarkers() {
  for (var i = 0; i < markers.length; i++) {
    var mkr = markers[i];
    mkr.setVisible(!mkr.visible);
  }
}
