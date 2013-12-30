/*global require,console*/

/**
 * A script that parses the police logs and stores them into a Postgresql database.
 */
(function () {
    'use strict';

    var fs = require('fs'),
        pg = require('pg'),
        Q = require('q');

    fs.readFile('./sample.txt', 'utf8', function (err, data) {

        var incidents = [],
            client;

        if (err) {
            return console.log(err);
        }

        // foreach block of text between a bunch of asterisks (*) and underscores (_)
        data.split(/[\*_]+/gm).forEach(function (incidentData) {
            var incident = {}, dateRegex;

            // trim it just in case
            incidentData = incidentData.trim();

            // incidents start with "Incident"
            if (incidentData.indexOf("Incident") === 0) {
                incident.id = incidentData.match(/^Incident #: (\d+)/)[1];
                incident.type = incidentData.match(/Type: (.*)$/m)[1];
                incident.location = incidentData.match(/^Location: (.*)$/m)[1];
                incident.recorded = incidentData.match(/How Rec: ([\w ]*) Call Taker/) ? incidentData.match(/How Rec: (\w*) Call Taker/)[1] : "N/A";
                incident.callTaker = incidentData.match(/Call Taker: (\w*)/)[1];
                incident.disposition = incidentData.match(/^Disposition: ([\w ]*) Officer:/m)[1];
                incident.officer = incidentData.match(/Officer: ([\w, ]*)$/) ? incidentData.match(/Officer: ([\w, ]*)$/)[1] : null;
                incident.notes = incidentData.split("Notes:\n")[1];

                // date needs to parsed
                dateRegex = incidentData.match(/Date: (\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
                incident.date = new Date(parseInt(dateRegex[1], 10),
                    parseInt(dateRegex[2], 10) - 1, // javascript's Date's month is 0-based.  idunno, it just is.
                    parseInt(dateRegex[3], 10),
                    parseInt(dateRegex[4], 10),
                    parseInt(dateRegex[5], 10),
                    parseInt(dateRegex[6], 10));

                incidents.push(incident);
            }
        });

        // make `subType` from `type`
        incidents.forEach(function (incident) {
            incident.subType = incident.type.match(/\(([\w \/]+)\)/)[1];
        });


        client = new pg.Client('postgres://localhost/hotspots');
        client.connect(function (err) {

            if (err) {
                return console.log('Error connecting to postgres!');
            }

            var queue = Q.delay(1);
            incidents.forEach(function (incident) {
                var insert_statement_sql = 'INSERT INTO incident (id,date,type,location,recorded,call_taker,disposition,officer,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)';
                queue = queue.then(function () {
                    client.query(insert_statement_sql, [
                        incident.id,
                        incident.date,
                        incident.type,
                        incident.location,
                        incident.recorded,
                        incident.callTaker,
                        incident.disposition,
                        incident.officer,
                        incident.notes
                    ], function (err) {
                        if (!err) {
                            console.log('Successfully added incident #: ' + incident.id);
                        } else {
                            console.log('Error adding incident #: ' + incident.id);
                        }
                    });
                }).delay(10);
            });

            queue = queue.done(function () {
                client.end();
            });
        });


    });

}());