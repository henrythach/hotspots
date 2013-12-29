/**
 * Node.js script that looks up for any incidents that do
 * not have any latitude or longitude.
 *
 * Usage: $ node geocoding.js
 *
 */

var mongoose = require('mongoose'),
    http = require('http'),
    Q = require('q');

mongoose.connect('mongodb://localhost/hotspots');

var Incident = mongoose.model('Incident', {
    id: Number,
    date: Date,
    type: String,
    location: String,
    recorded: String,
    callTaker: String,
    disposition: String,
    officer: String,
    notes: String,
    latitude: Number,
    longitude: Number
});

Incident.where('latitude').exists(false).exec(function(err, incidents) {
    if (!err) {
        var a = Q.delay(1);
        incidents.forEach(function(incident, idx) {
            a = a.then(function() {
                var addressToUse = incident.location.replace(/\([\w ]+\)/, '') + 'QUINCY MA';
                console.log("CALLING: " + 'http://maps.googleapis.com/maps/api/geocode/json?sensor=false&address=' + addressToUse);
                http.get('http://maps.googleapis.com/maps/api/geocode/json?sensor=false&address=' + addressToUse, function(res) {
                    var data = '';

                    res.on('data', function(chunk) {
                        data += chunk;
                    });

                    res.on('end', function() {
                        var obj = JSON.parse(data);
                        console.log(obj.results[0].geometry.location.lat);
                        incident.latitude = obj.results[0].geometry.location.lat;
                        incident.longitude = obj.results[0].geometry.location.lng;
                        incident.save(function (err) {
                            if (!err) {
                                console.log("Saved incident #: " + incident.id);
                            } else {
                                console.log("Uh ohs, incident #: " + incident.id);
                            }
                        });
                    })
                });

            }).delay(3000); // delay so google won't hate me
        });
        a = a.done(function() {
            process.exit(0);
        });
    } else {
        console.log("Err!")
    }
});