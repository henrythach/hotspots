/*global console,require,process,exports*/

(function (exports, pg) {
    'use strict';

    var connectionString = process.env.DATABASE_URL || 'postgres://localhost/hotspots';

    exports.init = function (app) {

        /**
         * The homepage.  Just show index.jade
         */
        app.get('/', function (req, res) {
            res.render('index', {
                title: 'Hotspots Mapper'
            });
        });

        /**
         * Gets all incidents
         */
        app.get('/incidents.json', function (req, res) {
            pg.connect(connectionString, function (err, client, done) {
                client.query('SELECT * FROM incident', function (err, result) {
                    done();
                    if (!err) {
                        return res.send(result.rows);
                    }
                    return console.error(err);
                });
            });
        });
    };


}(exports, require('pg')));
