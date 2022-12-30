			function trWeather(options) { 
				
				// ensure this is called as constructor
				
				if (!(this instanceof trWeather)) {
					return new trWeather(options);
				}
				
				var weather = this;
				
				this.timestamp = undefined;
				this.api_key = undefined;
						

				// accessors
				this.get_summary_forecast = function() {
					return weather.summary;
				}
				
				this.get_icon = function() {
				    return weather.icon;
				    //return weather.icon.replace("64x64","128x128");
				}
				
				this.get_temperature = function() {
					return weather.temperature;
				}
				
				this.weather_is_current = function() {
					if (typeof weather.timestamp == "undefined") {
						// haven't gotten a forecast yet
						return false;
					}
					
					var age_of_forecast = new Date() - weather.timestamp;
					if (age_of_forecast > 15*60*1000) {
						// forecast is more than 15 minutes old
						return false;
					}
					
					return true; // recent enough!
				}			

				
				this.update_forecast = function() {
				    
				    var api_key = trWeatherCredentials('WeatherAPI');
                    var weather_url = "https://api.weatherapi.com/v1/current.json?key="+api_key+"&q="+options.lat+","+options.lng+"&aqi=no";

		            jQuery.ajax({
						url: weather_url,
						dataType: "json",
						success: function(data){
							if (typeof newrelic === "object") {
								newrelic.addPageAction("WE0: Weather request");
							}
							if (data.current && data.current.condition) {
							    weather.summary = data.current.condition.text;
							    weather.temperature = Math.floor(data.current.temp_f + 0.5)+"&deg;";
							    var icon_url = data.current.condition.icon;
							    weather.icon = '<img src="'+icon_url+'" style="height: 1.4em; margin: -0.2em">';
							    weather.timestamp = new Date();
							}

						},
						error: function(xhrObj,errorText,errorThrown) {
							if (typeof newrelic === "object") {
								newrelic.addPageAction("WE1: Failure on weather request",{'errorText': errorText, 'errorThrown': errorThrown});
							}
						}

					});
				}
				
				weather.update_forecast();				
				setInterval(function() {weather.update_forecast()}, 5*60*1000); // update every five minutes
				
				
			}		