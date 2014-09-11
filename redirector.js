var express = require("express");
var app = express();
var SerialPort = require("serialport").SerialPort

var serialPort = new SerialPort("/dev/tty.SL400H-SPP",{ baudrate: 9600 }, false);

//Start webserver
app
	.get('/command/:command', function(req, res){ 
		var command = req.param('command');

		sendCommand(command)

		res.send("{success:true}");
	})
	.get('/call/:number', function (req, res) {
		var number = req.param('number');
		callNumber(number);

		res.send("{success:true}");
	})
	.get('/redirect/:number', function (req, res) {
		var number = req.param('number');
		redirectToNumber(number);

		res.send("{success:true}");
	})
	.get('/disableredirect', function (req, res) {
		disableRedirect();

		res.send("{success:true}");
	})
	.get('/hangup', function (req, res) {
		hangUp();

		res.send("{success:true}");
	})

app.listen(8080, function() {
	console.log("Listening on 8080");
});

//Serial port callbacks
serialPort
	.on('open', function(data) {
		console.log('Serial port opened.');
	})
	.on('data', function(data) {
		console.log('Data: ' + data);
	})	
	.on('error', function(error) {
		console.log('Error: ' + error);
	})
	.on('close', function(error) {
		console.log('Connection closed.');
	});

//Open serial port
serialPort.open();

//Helper functions
function sendCommand(command) {
	console.log('Sending: ' + command);
	serialPort.write(command + "\n", function(error) {
	    if (error) { console.log('Write error: ' + err); }
    });
}

function callNumber(number) {
	sendCommand('ATDT '+number)
}

function hangUp() {
	sendCommand('ATH');
}

function redirectToNumber(number) {
	callNumber('*21*'+number+'#')
	setTimeout(hangUp, 15000);
}

function disableRedirect() {
	callNumber('#21#')
	setTimeout(hangUp, 15000);
}
