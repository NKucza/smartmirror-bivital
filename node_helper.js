var NodeHelper = require('node_helper');
var request = require('request');
const PythonShell = require('python-shell');

module.exports = NodeHelper.create({
	start: function () {
		console.log('Smartmirror-BiVital helper started...');
	},

	getJson: function (ble_address) {
		var self = this;

		const pyshell = new PythonShell('modules/' + this.name + '/bivital_requests/notification_test.py', {pythonPath: 'python3', args: ble_address});

		pyshell.on('message', function (message) {

			try{
				var parsed_message = JSON.parse(message)
            	if (parsed_message.hasOwnProperty('HR')) {
            		obj_string = parsed_message.HR;
					self.sendSocketNotification("smartmirror-bivital_JSON_RESULT", obj_string);
					console.log(obj_string);
           		}
			}
			catch(err){
				//console.log(err)
			}

        });
	},

	//Subclass socketNotificationReceived received.
	socketNotificationReceived: function (notification, arg) {
		if (notification === "smartmirror-bivital_GET_JSON") {
			this.getJson(arg[0]);
		}
	}
});
