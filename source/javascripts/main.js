var locations = [];
var location_coords = [];
var markers = [];
var map;
var elevator;
var hatchery_infowindow;

function fetch_tile(base_url, coord, zoom) {
  return base_url + zoom + "/" + coord.x + "/" + coord.y + ".png";
}
function flood_fetch_tile(coord, zoom) {
  return fetch_tile("http://floodmap.floodplainprojector.com/flood/", coord, zoom);
}

function osm_fetch_tile(coord, zoom) {
  return fetch_tile("http://a.tile.stamen.com/toner/", coord, zoom);
}

var mapTypeIds = [];
for(var type in google.maps.MapTypeId) {
  mapTypeIds.push(google.maps.MapTypeId[type]);
}

mapTypeIds.push("OSM");

osm_options = {
  getTileUrl: osm_fetch_tile,
  tileSize: new google.maps.Size(256, 256),
  maxZoom: 18,
  isPng: true,
  name: "Toner"
}

flood_options = {
  getTileUrl: flood_fetch_tile,
  tileSize: new google.maps.Size(256, 256),
  isPng: true
}

flood = new google.maps.ImageMapType(flood_options);

function round_results(num) {
  return Math.round(num * 100) / 100;
}

/* http://scenarios.globalchange.gov/sites/default/files/NOAA_SLR_r3_0.pdf
 * E(t) = 0.0017 * t + bt^2
 * Where t represents years (starting in 1992)
 * b is a constant representing SLR scenarios
 * */
var HIGHEST = 0.000156;
var INTERMEDIATE_HIGH = 0.0000871;
var INTERMEDIATE_LOW = 0.0000271;

function sea_level_rise(year, model) {
  var t = (year - 1992);
  return 0.0017 * t + model * (Math.pow(t,2));
}

/* We want to start from a particular year and show change from the year you are currently in.*/
function sea_level_rise_starting_at(start_y, desired_y, model) {
  return sea_level_rise(desired_y, model) - sea_level_rise(start_y, model);
}

function initialize() {
  elevator = new google.maps.ElevationService();
  hatchery_infowindow = new google.maps.InfoWindow();
  var mapOptions = {
      minZoom: 9,
      zoom: 9,
      mapTypeId: "OSM",
      mapTypeControlOptions: {
        mapTypeIds: mapTypeIds,
        position: google.maps.ControlPosition.LEFT_BOTTOM
      },
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_TOP
      }
  };

  map = new google.maps.Map(document.getElementById('map'),
      mapOptions);

  map.controls[google.maps.ControlPosition.RIGHT_TOP].push(
        document.getElementById('legend'));
  map.mapTypes.set("OSM", new google.maps.ImageMapType(osm_options));

  map.overlayMapTypes.push(flood);

  // Try HTML5 geolocation
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);

      var request = {
        location: pos,
        radius: 160900.34,
        query: "fish hatcheries near Nearby"
      };


      var service = new google.maps.places.PlacesService(map);
      service.textSearch(request, callback);


      map.setCenter(pos);

    }, function() {
      handleNoGeolocation(true);
    });
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  }
}

function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }

  var options = {
    map: map,
    position: new google.maps.LatLng(60, 105),
    content: content
  };

  map.setCenter(options.position);
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }

    var pointArray = new google.maps.MVCArray(location_coords);

    heatmap = new google.maps.visualization.HeatmapLayer({
      data: pointArray,
      radius: 100
    });

    console.log(map);
    heatmap.setMap(map);
  }
}

function createMarker(place) {
  var placeLoc = place.geometry.location;
  locations.push(placeLoc);
  location_coords.push(placeLoc);
  var marker = new google.maps.Marker({
    map: map,
    position: placeLoc
  });

  markers.push(marker);

  var positionalRequest = {
    'locations': locations
  };

   // Initiate the location request


  google.maps.event.addListener(marker, 'click', function() {
    loc = this;
    elevator.getElevationForLocations(positionalRequest, function(results, status) {
      if (status == google.maps.ElevationStatus.OK) {

        // Retrieve the first result
        if (results[0]) {
          var currYear = new Date().getFullYear();
          // Open an info window indicating the elevation at the clicked position
          hatchery_infowindow.setContent('<div class="loc_marker"><h5>'
            + place.name
            + '</h5>'
            + '<strong>Elevation:</strong> '
            + round_results(results[0].elevation)
            + 'm'
            + '<br><strong>'
            + projectionDate
            + ' Year Projection:</strong> '
            + round_results(results[0].elevation - sea_level_rise_starting_at(currYear, currYear + projectionDate, INTERMEDIATE_HIGH))
            + 'm</div>');
          hatchery_infowindow.open(map, loc);
        } else {
          alert('No results found');
        }
      } else {
        alert('Elevation service failed due to: ' + status);
      }
    });
  });
}

google.maps.event.addDomListener(window, 'load', initialize);
