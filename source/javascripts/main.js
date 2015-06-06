var map;
var elevator;
var hatchery_infowindow;

var elevations = {};

function initialize() {
  elevator = new google.maps.ElevationService();
  hatchery_infowindow = new google.maps.InfoWindow();
  var mapOptions = {
    zoom: 9
  };

  map = new google.maps.Map(document.getElementById('map'),
      mapOptions);

  // Try HTML5 geolocation
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);

      var request = {
        location: pos,
        radius: 16090.34,
        query: "fish hatcheries"
      };

      var infowindow = new google.maps.InfoWindow({
        map: map,
        position: pos,
        content: 'You are here.'
      });

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

  var infowindow = new google.maps.InfoWindow(options);
  map.setCenter(options.position);
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}

function createMarker(place) {
  var locations = [];
  var placeLoc = place.geometry.location;
  locations.push(placeLoc);
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });
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
          // Open an info window indicating the elevation at the clicked position
          hatchery_infowindow.setContent('Location: ' + place.name + '<br>Elevation: ' + results[0].elevation + 'm');
          hatchery_infowindow.open(map, loc);
          console.log(results[0]);
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
