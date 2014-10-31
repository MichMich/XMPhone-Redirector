var apn = require('apn');

var Notifier = function() {

	var deviceIdentifiers = [
		'ba513f83 af7f89d0 1071761c fa851d68 d3746fa4 00a2ee84 c0ebd418 c522fdb5'
	];
	var options = { "gateway": "gateway.sandbox.push.apple.com" };
	var apnConnection = new apn.Connection(options);

	this.addDevice = function(identifier) {
		if (deviceIdentifiers.indexOf(identifier) === -1) {
			deviceIdentifiers.push(identifier);
			console.log('Device registered: ' + identifier);
		} else {
			console.log('Device already registered: ' + identifier);
		}
	}

	this.sendNotification = function(notification, deviceIdentifierOfRequester) {

		for (i in deviceIdentifiers) {

			var deviceIdentifier = deviceIdentifiers[i];

			if (deviceIdentifierOfRequester != deviceIdentifier) {
				var myDevice = new apn.Device(deviceIdentifier);
				var note = new apn.Notification();

				note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
				note.badge = 0;
				note.sound = 'notification.wav';
				note.alert = notification;

				apnConnection.pushNotification(note, myDevice);

				console.log('Notification sent: ' + notification + ' to: ' + deviceIdentifier);
			} else {
				console.log('Prevented notification to requester: ' + deviceIdentifierOfRequester);
			}
		}
	}
}

module.exports = new Notifier();

//var notifier = new Notifier()
//notifier.sendNotification("Calls forwarded to Michael.");