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

				
				this.update_forecast_old = function() {
				    
				    var api_key = trWeatherCredentials('WeatherAPI');
                    var weather_url = "https://api.weatherapi.com/v1/current.json?key="+api_key+"&q="+options.lat+","+options.lng+"&aqi=yes";

		            jQuery.ajax({
						url: weather_url,
						dataType: "json",
						success: function(data){
							if (typeof newrelic === "object") {
								newrelic.addPageAction("WE200: Weather request");
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
								newrelic.addPageAction("WE"+errorText+": Failure on weather request");
							}
						}

					});
				}

				this.update_forecast = function(retry_count) {
					const retry_limit = 1;

					var api_key = trWeatherCredentials('WeatherAPI');
                    var weather_url = "https://api.weatherapi.com/v1/current.json?key="+api_key+"&q="+options.lat+","+options.lng+"&aqi=no";

					const xhr = new XMLHttpRequest();

					xhr.responseType = 'text';

					xhr.open('GET', weather_url, true);

					// Set up the event handler for when the request state changes
					xhr.onreadystatechange = function() {
						// Check if the request is complete (readyState 4) and successful (status 200)

						if (xhr.readyState === 4 && xhr.status === 200) {
							console.log("Retry: "+retry_count);
							//console.log("Text response: "+xhr.responseText);

							// now try parsing json
							try {
								var data = JSON.parse(xhr.responseText);
								// Process data
								console.log(response_data);
								if ( typeof response_data != "undefined") {
									// process here
									if (data.current && data.current.condition) {
										weather.summary = data.current.condition.text;
										weather.temperature = Math.floor(data.current.temp_f + 0.5)+"&deg;";
										var icon_url = data.current.condition.icon;
										weather.icon = '<img src="'+icon_url+'" style="height: 1.4em; margin: -0.2em">';
										weather.timestamp = new Date();
									}
								}
							} catch (e) {
								//console.log("json parsing error");
								//console.log(e);
								if (retry_count >= retry_limit) {
									if (typeof newrelic === "object") {
										newrelic.addPageAction("WE9: Weather JSON parsing error");
									}
								}
							}

						} else if (xhr.readyState === 4 && xhr.status !== 200) {
							//console.log("xhr state error");
							if (retry_count >= retry_limit) {
								if (typeof newrelic === "object") {
									newrelic.addPageAction("WE"+xhr.status+": Weather response error "+xhr.statusText,{'errorText': xhr.statusText, 'errorThrown': xhr.status});
								}
							} else {
								weather.update_forecast(retry_count+1);
							}
						}
					};
					// Send the request
					xhr.send();
				}
				
				weather.update_forecast(0);				
				setInterval(function() {weather.update_forecast()}, 5*60*1000); // update every five minutes
				
				
			}		