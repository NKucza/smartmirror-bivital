var NodeHelper = require('node_helper');
var request = require('request');
const {PythonShell} = require('python-shell');

module.exports = NodeHelper.create({
	start: function () {
		console.log('Smartmirror-BiVital helper started...');
	},

	getJson: function (ble_address) {
		var self = this;

		const pyshell = new PythonShell('modules/' + this.name + '/bivital-python/ble_python_grabber/bivital_python_grabber.py', {pythonPath: 'python3', args: ble_address});

		pyshell.on('message', function (message) {
			try{
				var parsed_message = JSON.parse(message)
            	if (parsed_message.hasOwnProperty('HR')) {
            		obj_string = parsed_message.HR;
					self.sendSocketNotification("not-bivital-hr", obj_string);
					console.log(obj_string);
           		} else if (parsed_message.hasOwnProperty('RR')) {
            		obj_string = parsed_message.RR;
					self.sendSocketNotification("not-bivital-rr", obj_string);
					// console.log(obj_string);
           		} else if (parsed_message.hasOwnProperty('TEMP')) {
            		obj_string = parsed_message.TEMP;
					self.sendSocketNotification("not-bivital-temp", obj_string);
					// console.log(obj_string);
           		} else if (parsed_message.hasOwnProperty('HUMIDITY')) {
            		obj_string = parsed_message.HUMIDITY;
					self.sendSocketNotification("not-bivital-humidity", obj_string);
					// console.log(obj_string);
           		} else if (parsed_message.hasOwnProperty('PRESSURE')) {
            		obj_string = parsed_message.PRESSURE;
					self.sendSocketNotification("not-bivital-pressure", obj_string);
					// console.log(obj_string);
           		} else if (parsed_message.hasOwnProperty('RAW')) {
            		obj_string = parsed_message.RAW;
					self.sendSocketNotification("not-bivital-raw", obj_string);
					// console.log(obj_string);
           		}
			}
			catch(err){
				console.log(err)
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
