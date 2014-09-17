var SerialPort = require("serialport").SerialPort;
var serialPort = new SerialPort("/dev/tty.SL400H-SPP");

function PhoneAPI() {
	// private variables
	var successCallback = function(){};
	var failureCallback = function(code, message){};

	var timeout = 3000;
	var timeoutTimer = null;
	var reconnectTimer = null;

	var successTriggers = [];
	var failureTriggers = [];

	//Serial port callbacks
	serialPort
		.on('open', function(data) {
			clearTimeout(timeoutTimer);
			console.log('Serial port opened.');
		})
		.on('data', function(data) {
			clearTimeout(timeoutTimer);

			//console.log('Data: ' + data);
			checkTriggers(data, successTriggers, function() {
				successCallback();
			}, "success");
			checkTriggers(data, failureTriggers, function() {
				failureCallback(1, "Could not handle request. Maybe the line is busy?");
			}, "failure");
		})
		.on('error', function(error) {
			clearTimeout(timeoutTimer);
			console.log('Error: ' + error);
			failureCallback(2, "Could not send command to phone.");
			reconnect();
		})
		.on('close', function(error) {
			clearTimeout(timeoutTimer);
			console.log('Connection closed.');
			setTimeout(function() {
				serialPort.open();
			}, 2000);
		});
	

	/**
	*
	*   Private API
	* 
	**/

	setSuccessTriggers = function(triggers) {
		successTriggers = triggers;
	};

	setFailureTriggers = function(triggers) {
		failureTriggers = triggers;
		failureTriggers.push("ERROR");
	};

	checkTriggers = function(string, triggers, callback, name) {
		string = string.toString();
		string = string.trim();
		strings = string.split(/(\r\n|\n|\r)/gm);

		for (var i = 0; i < strings.length; i++) {
			string = strings[i];
			string = string.replace(/(\r\n|\n|\r)/gm,"");
			if (string !== "") {
				if (triggers.indexOf(string) != -1) {
					//console.log(name + " trigger found: "+string);
					callback();
				}
			}
		}
	};

	sendCommand = function(command) {
		timeoutTimer = setTimeout(function() {
			console.log('Did not get a response from the phone...');
			failureCallback(3, "Phone response timed out.");
			reconnect();
		}, timeout);

		console.log('Sending: ' + command);
		
		serialPort.write(command + "\n", function(error) {
			if (error) {
				clearTimeout(timeoutTimer);
				failureCallback(4, "Unable to write to phone.");
				console.log('Write error: ' + error);
				reconnect();
			}
		});
	};

	reconnect = function() {
		clearTimeout(reconnectTimer);
		console.log('Setup reconnect timer.');
		reconnectTimer = setTimeout(function() {
			console.log('Trying to reconnect ...');
			try {
				serialPort.open();
			} catch(error) {
				console.log("Error reconnecting to phone...");
				console.log(error);
			}
		}, 2000);
	};

	/**
	*
	*	Public API
	*
	**/



	this.callNumber = function(number, onSuccess, onError) {
		successCallback = onSuccess;
		failureCallback = onError;

		setSuccessTriggers(["CLIP:"+number]);
		setFailureTriggers(["NO CARRIER"]);

		sendCommand('ATDT '+number);
	};

	this.hangUp = function(onSuccess, onError) {
		successCallback = onSuccess;
		failureCallback = onError;

		setSuccessTriggers(["NO CARRIER"]);
		setFailureTriggers([]);

		sendCommand('ATH');
	};

	this.redirectToNumber = function(number, onSuccess, onError) {
		realThis = this;
		this.callNumber('*21*'+number+'#', function() {
			realThis.hangUp(onSuccess, onError);
		}, onError);
	};

	this.disableRedirect = function(onSuccess, onError) {
		realThis = this;
		this.callNumber('#21#', function() {
			realThis.hangUp(onSuccess, onError);
		}, onError);
	};

	this.resetCallbacks = function() {
		successCallback = function(){};
		failureCallback = function(code, message){};
	};
}

module.exports = new PhoneAPI;