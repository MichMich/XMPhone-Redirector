var express = require("express");
var app = express();
var phoneAPI = require("./libs/phoneapi");
var moment = require('moment');

var db = require('./db');

//Setup Routes
app
	.get('/api/numbers', function(req, res) {
		var users = db.users;
		res.send( users );
	})

	.all('/api/redirect/:id', function (req, res) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'Content-Type,X-Requested-With');
		var id = req.param('id');
		var user = db.users[id];
		if( typeof user === 'object' ) {
			phoneAPI.redirectToNumber(user.number, function() {
				for ( var i = 0; i < db.users.length; i++ ) {
					if( db.users[i] !== user ) {
						db.users[i].redirect_since = null;
					} else {
						user.redirect_since = moment().format('YYYY-MM-DD HH:mm:ss');
					}
				}
				db.logs.push({message:"Redirect success.", time: moment().format('YYYY-MM-DD HH:mm:ss')});
				res.send({
					success: true,
					redirect_to: user
				});
				phoneAPI.resetCallbacks();
			}, function(code, message) {
				db.logs.push({message:"Redirect failure.", time: moment().format('YYYY-MM-DD HH:mm:ss')});
				res.send({
					success: false,
					code: code,
					message: message
				});
				phoneAPI.resetCallbacks();
			});
		} else {
			res.send( { success: false,
						code: 404,
						message: "No user found width given id: "+ id
			});
		}
	})
	.all('/api/redirect', function (req, res) {

		phoneAPI.disableRedirect(function() {
			db.logs.push({message:"Disable redirect success.", time: moment().format('YYYY-MM-DD HH:mm:ss')});
			for ( var i = 0; i < db.users.length; i++ ) {
				db.users[i].redirect_since = null;
			}
			res.send( { success: true } );
			phoneAPI.resetCallbacks();
		}, function(code, message) {
			db.logs.push({message:"Disable redirect failure.", time: moment().format('YYYY-MM-DD HH:mm:ss')});
			res.send( { success: false,
						code: code,
						message: message
			});
			phoneAPI.resetCallbacks();
		});
	})
	.get('/', function (req, res) {
		res.send('XMPhone-Redirecter API');
	})
	.get('/api/logs', function(req, res) {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'Content-Type,X-Requested-With');
		res.send( db.logs.reverse() );
	});

app.listen(8080, function() {
	var now = new Date();
	db.logs.push({message:"Listening on 8080", time: moment().format('YYYY-MM-DD HH:mm:ss')});
});