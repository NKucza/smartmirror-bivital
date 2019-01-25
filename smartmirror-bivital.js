'use strict';

Module.register("smartmirror-bivital", {

	jsonData: null,
	hr: 0,
	rr: 0,
	temp: 0,
	humidity:0,
	pressure:0,
	acc:[0,0,0],
	gyro:[0,0,0],
	mag:[0,0,0],
	heartRates: [],
	mode : 'bar',


	// Default module config.
	defaults: {
		updateInterval: 1
	},

	start: function () {
		Log.info('Starting module: ' + this.name);
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
		if (notification === "not-bivital-raw") {
				this.jsonData = payload;
				this.acc[0] = this.jsonData["acc_x"];
				this.acc[1] = this.jsonData["acc_y"];
				this.acc[2] = this.jsonData["acc_z"];

				this.gyro[0] = this.jsonData["gyro_x"];
				this.gyro[1] = this.jsonData["gyro_y"];
				this.gyro[2] = this.jsonData["gyro_z"];

				this.mag[0] = this.jsonData["mag_x"];
				this.mag[1] = this.jsonData["mag_y"];
				this.mag[2] = this.jsonData["mag_z"];
				// res["acc_x"]) + " " + str(res["acc_y"]) + " " + str(res["acc_z"]
						
		} else if (notification === "not-bivital-hr") {
				this.jsonData = payload;
				this.hr = this.jsonData;
				this.heartRates.push(this.hr)		
		} else if (notification === "not-bivital-rr") {
			this.jsonData = payload;
			this.rr = this.jsonData;		
		} else if (notification === "not-bivital-temp") {
			this.jsonData = payload;
			this.temp = this.jsonData;		
		} else if (notification === "not-bivital-humidity") {
			this.jsonData = payload;
			this.humidity = this.jsonData;		
		}
		this.updateDom(1);	
	},

	// Override dom generator.
	getDom: function () {
		var wrapper = document.createElement("div");
		wrapper.className = "bivital";

		var canvas = document.createElement("canvas");
		canvas.id = 'waves';


		if (!this.jsonData) {
			wrapper.innerHTML = "Awaiting json data...";
			return wrapper;
		}

		console.log("[" + this.name + "] detected persons: " + payload);

		this.data.header = 'BI-Vital sensor data';
		var span = document.createElement("span");
	        span.innerHTML = `<i class="fa fa-heart" aria-hidden="true"></i>`;
		span.classList.add('pulse'); 
		wrapper.appendChild(span);
		
		wrapper.innerHTML = '<b>BI-Vital</b><br>Heart rate: ' + this.hr + '<br>'
						 + 'RR: ' + this.rr + '<br>'
						 + 'Temperature: ' + this.temp + ' °C<br>'
						 + 'Humidity: ' + this.humidity + '<br>' 
						 + 'Pressure: ' + this.pressure + '<br>'
						 + 'Acc: ' + this.acc[0] + " " + this.acc[1] + " " + this.acc[2] + '<br>'
						 + 'Gyro: ' + this.gyro[0] + " " + this.gyro[1] + " " + this.gyro[2] + '<br>'
						 + 'Magneto: ' + this.mag[0] + " " + this.mag[1] + " " + this.mag[2] + '<br>';

		wrapper.appendChild(canvas);
		console.log("Width: " + canvas.width + "Height: " + canvas.height)


		
		canvas.width = parseInt(getComputedStyle(canvas).width.slice(0, -2)) * devicePixelRatio;
		canvas.height = parseInt(getComputedStyle(canvas).height.slice(0, -2)) * devicePixelRatio;
		console.log("Width: " + canvas.width + "Height: " + canvas.height)
		var context = canvas.getContext('2d');
		var margin = 2;
		var max = Math.max(0, Math.round(canvas.width / 11));
		var offset = Math.max(0, this.heartRates.length - max);
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.strokeStyle = '#00796B';
		if (this.mode === 'bar') {
			for (var i = 0; i < Math.max(this.heartRates.length, max); i++) {
				var barHeight = Math.round(this.heartRates[i + offset ] * canvas.height / 200);
				context.rect(11 * i + margin, canvas.height - barHeight, margin, Math.max(0, barHeight - margin));
				context.stroke();
			}
		} else if (this.mode === 'line') {
			context.beginPath();
			context.lineWidth = 6;
			context.lineJoin = 'round';
			context.shadowBlur = '1';
			context.shadowColor = '#333';
			context.shadowOffsetY = '1';
			for (var i = 0; i < Math.max(this.heartRates.length, max); i++) {
				var lineHeight = Math.round(this.heartRates[i + offset ] * canvas.height / 200);
				if (i === 0) {
				context.moveTo(11 * i, canvas.height - lineHeight);
				} else {
				context.lineTo(11 * i, canvas.height - lineHeight);
				}
				context.stroke();
			}
		}

		context.fillStyle = "red"
		context.fillRect(0, 0 , canvas.width, canvas.height);
		return wrapper;
	},

	 getStyles: function () {
        return ['font-awesome.css','bitvital-style.css'];
    }

});
