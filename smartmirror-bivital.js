'use strict';

Module.register("smartmirror-bivital", {

	jsonData: null,

	// Default module config.
	defaults: {
		updateInterval: 1
	},

	start: function () {
		this.getJson();
		//this.scheduleUpdate();
	},

	scheduleUpdate: function () {
		var self = this;
		setInterval(function () {
			self.getJson();
		}, this.config.updateInterval);
	},

	// Request node_helper to get json from a mensa parser script
	getJson: function () {
		this.sendSocketNotification("smartmirror-bivital_GET_JSON", [this.config.ble_address]);
	},

	socketNotificationReceived: function (notification, payload) {
		if (notification === "smartmirror-bivital_JSON_RESULT") {
				this.jsonData = payload;
				this.updateDom(1);			
		}
	},

	// Override dom generator.
	getDom: function () {
		var wrapper = document.createElement("div");
		wrapper.className = "bivital";


		if (!this.jsonData) {
			wrapper.innerHTML = "Awaiting json data...";
			return wrapper;
		}
		this.data.header = 'BI-Vital Heart Rate Profile';
		wrapper.innerHTML = 'BI-Vital Heart rate: ' + this.jsonData; 

		return wrapper;
	},

	 getStyles: function () {
        return ['bitvital-style.css'];
    }

});
