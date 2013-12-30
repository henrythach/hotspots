/*global console,require*/
(function () {
    'use strict';

    var pg = require('pg'),

        http = require('http'),

        Q = require('q');

    pg.connect('postgres://localhost/hotspots', function (err, client, done) {
        if (err) {
            return console.error('error connecting', err);
        }

        client.query('SELECT * FROM incident WHERE lat IS null', function (err, result) {
            if (err) {
                return console.error('error running query', err);
            }

            var queue = Q.delay(1);

            result.rows.forEach(function (incident) {
                var addressToUse;

                // append 'QUINCY MA' to the end of location to get a better geocode
                addressToUse = incident.location.replace(/\([\w ]+\)/, '') + 'QUINCY MA';

                queue = queue.then(function () {
                    http.get('http://maps.googleapis.com/maps/api/geocode/json?sensor=false&address=' + addressToUse, function (res) {
                        var data = '';

                        res.on('data', function (chunk) {
                            data += chunk;
                        });

                        res.on('end', function () {
                            var obj = JSON.parse(data),
                                location = obj.results[0].geometry.location;

                            client.query('UPDATE incident SET lat = $1, lng = $2 WHERE id = $3', [location.lat, location.lng, incident.id], function (e, r) {
                                if (e) {
                                    return console.err('error updating incident #' + incident.id, err);
                                }
                                console.log('updated incident #' + incident.id);
                            });

                        });

                    });
                }).delay(3000); // delay so google won't hate me
            });

            queue = queue.done(function () {
                client.end();
            });
        });
    });

}());