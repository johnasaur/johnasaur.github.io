// links for APIs
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson"
var faultLinesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";


// render map
renderMap(earthquakeURL, faultLinesURL);

function renderMap(earthquakeURL, faultLinesURL) {
  
    d3.json(earthquakeURL, function(data) {
        var earthquakeData = data;
        d3.json(faultLinesURL, function(data) {
            var faultLineData = data;

            createFeatures(earthquakeData, faultLineData);
        });
    });

    function createFeatures(earthquakeData, faultLineData) {

        // define functions and create markers for earthquakes
        function onEachQuakeLayer(feature, layer) {
            return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
                fillOpacity: 1,
                color: chooseColor(feature.properties.mag),
                fillColor: chooseColor(feature.properties.mag),
                radius:  markerSize(feature.properties.mag)
            });
        }
        function onEachEarthquake(feature, layer) {
            layer.bindPopup("<h5>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
        };

        // create tectonic plates (fault lines)
        function onEachFaultLine(feature, layer) {
            L.polyline(feature.geometry.coordinates);
        };

        var earthquakes = L.geoJSON(earthquakeData, {
            onEachFeature: onEachEarthquake,
            pointToLayer: onEachQuakeLayer
        });

        var faultLines = L.geoJSON(faultLineData, {
            onEachFeature: onEachFaultLine,
            style: {
                weight: 1.5,
                color: "green"
            }
        });

       
        // run onEachEarthquake & onEachQuakeLayer functions once 
        var timelineLayer = L.timeline(earthquakeData, {
            getInterval: function(feature) {
                return {
                    start: feature.properties.time,
                    end: feature.properties.time + feature.properties.mag * 10000000
                };
            },
            pointToLayer: onEachQuakeLayer,
            onEachFeature: onEachEarthquake
        });

        createMap(earthquakes, faultLines, timelineLayer);
    };

    // create map
    function createMap(earthquakes, faultLines, timelineLayer) {

     // light layer
      var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1Ijoiam9obmFzYXVyIiwiYSI6ImNqaWYzcWU2YzAxZHczd281OWxmeTI1NXcifQ." +
      "NHBtF9qdHe9G9GGlMhlC-Q");

     // satellite layer
      var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
      "access_token=pk.eyJ1Ijoiam9obmFzYXVyIiwiYSI6ImNqaWYzcWU2YzAxZHczd281OWxmeTI1NXcifQ." +
      "NHBtF9qdHe9G9GGlMhlC-Q");
  
      // outdoors layer
      var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
        "access_token=pk.eyJ1Ijoiam9obmFzYXVyIiwiYSI6ImNqaWYzcWU2YzAxZHczd281OWxmeTI1NXcifQ." +
        "NHBtF9qdHe9G9GGlMhlC-Q");

   
        // define baseMaps to hold base layers
        var baseMaps = {
            "Light Map": lightmap,
            "Satellite": satellite,
            "Outdoors": outdoors,
        };

        // overlay maps
        var overlayMaps = {
            "Earthquakes": earthquakes,
            "Tectonic Plates": faultLines
        };

        // default map
        var map = L.map("map", {
            center: [37.0902, -95.7129],
            zoom: 3,
            layers: [lightmap, faultLines, earthquakes],
            scrollWheelZoom: false
        });

        // layer control
        L.control.layers(baseMaps, overlayMaps, {
            collapsed: true
        }).addTo(map);

        // legend
        var legend = L.control({position: "bottomright"});
        legend.onAdd = function(map) {
            var div = L.DomUtil.create("div", "info legend"),
                        grades = [1, 2, 3, 4, 5, 6],
                        labels = ["1", "2", "3", "4", "5", "5+"];

            for (var i = 0; i < grades.length; i++) {
                div.innerHTML += '<i style="background:' + chooseColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
            };

            return div;
        };
        legend.addTo(map);

        // timeline - leaflet plugin
        var timelineControl = L.timelineSliderControl({
            formatOutput: function(date) {
                return new Date(date).toString();
            }
        });
        timelineControl.addTo(map);
        timelineControl.addTimelines(timelineLayer);
        timelineLayer.addTo(map);
    };
}

// colours for the magnitude earthquakes
function chooseColor(magnitude) {
  return magnitude > 6 ? "red":
         magnitude > 5 ? "orange":
         magnitude > 4 ? "gold":
         magnitude > 3 ? "yellow":
         magnitude > 2 ? "yellowgreen":
                         "green"; 
};


// amplify earthquakes
function markerSize(magnitude) {
    return magnitude * 3;
};


