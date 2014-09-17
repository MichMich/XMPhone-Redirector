var express = require("express");
var app = express();
var phoneAPI = require("./phoneapi");


//Start webserver
app

/*
	.get('/command/:command', function(req, res){ 
		var command = req.param('command');

		phoneAPI.sendCommand(command)

		res.send("{success:true}");
	})
	.get('/call/:number', function (req, res) {
		var number = req.param('number');
		phoneAPI.callNumber(number);

		res.send("{success:true}");
	})
*/
	.get('/redirect/:number', function (req, res) {
		var number = req.param('number');
		phoneAPI.redirectToNumber(number, function() {
			console.log("Redirect success.")
			res.send("{success:true}");
			phoneAPI.resetCallbacks();
		}, function(code, message) {
			console.log("Redirect failure.")
			res.send("{success:false, code: "+code+", message:'"+message+"'}");
			phoneAPI.resetCallbacks();
		});
	})
	.get('/disableredirect', function (req, res) {
		phoneAPI.disableRedirect(function() {
			console.log("Disable redirect success.")
			res.send("{success:true}");
			phoneAPI.resetCallbacks();
		}, function(code, message) {
			console.log("Disable redirect failure.")
			res.send("{success:false, code: "+code+", message:'"+message+"'}");
			phoneAPI.resetCallbacks();
		});
	})
	.get('/hangup', function (req, res) {
		phoneAPI.hangUp(function() {
			console.log("Hangup success.")
			res.send("{success:true}");
			phoneAPI.resetCallbacks();
		}, function(code, message) {
			console.log("Hangup failure.")
			res.send("{success:false, code: "+code+", message:'"+message+"'}");
			phoneAPI.resetCallbacks();
		});
	})

app.listen(8080, function() {
	console.log("Listening on 8080");
});

