var mongoose = require('mongoose');

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

exports.init = function(app) {

    /**
     * The homepage.  Just show index.jade
     */
    app.get('/', function(req, res) {
        res.render('index', {
            title: 'Hotspots Mapper'
        });
    });

    /**
     * Gets all incidents
     */
    app.get('/incidents.json', function(req, res) {
        return Incident.where('latitude').exists(true).select('id date type location notes officer disposition latitude longitude').exec(function (err, incidents) {
            if (!err) {
                return res.send(incidents);
            } else {
                return console.log(err);
            }
        });
    });
};