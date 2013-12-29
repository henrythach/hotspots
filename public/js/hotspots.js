/*global google,map,$,document*/
'use strict';

var QUINCY_LAT_LONG = new google.maps.LatLng(42.254423, -71.004725);

var geocoder;

function initialize() {

    geocoder = new google.maps.Geocoder();

    var mapOptions = {
        center: QUINCY_LAT_LONG,
        zoom: 14
    };

    var map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);

    $.get('/incidents.json').success(function(incidents) {
        incidents.forEach(function(incident, idx) {
            var marker = new google.maps.Marker({
                map: map,
                position: new google.maps.LatLng(incident.latitude, incident.longitude)
            });

            var contentInfo = "<div>" +
                "<strong>Type: </strong> " + incident.type + " <br>" +
                "<strong>Location: </strong> " + incident.location + " <br>" +
                "<strong>Officer: </strong> " + incident.officer + " <br>" +
                "<strong>Date: </strong> " + incident.date + " <br>" +
                "<strong>Notes: </strong> " + incident.notes + " <br>" +
                "<strong>Disposition: </strong> " + incident.disposition + "</div>";

            var infowindow = new google.maps.InfoWindow({
                content: contentInfo
            });

            google.maps.event.addListener(marker, 'click', function() {
                infowindow.open(map, marker);
            });
        });
    });

}

google.maps.event.addDomListener(window, 'load', initialize);