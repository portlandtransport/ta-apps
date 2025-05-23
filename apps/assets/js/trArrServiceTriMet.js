/*
   Copyright 2010-2011 Portland Transport

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

function trArrServiceTriMetCreateUpdaters(arrivals_object, service_requests, updaters) {
	
	var max_stops_per_request = 10;

	// TriMet allows a max of 10 stops in one request, so split things up into multiple updater objects if need be
	while (service_requests.length > 0) {
		if (service_requests.length > max_stops_per_request) {
			updaters.push(new trArrTriMetUpdater(service_requests.slice(0,max_stops_per_request),arrivals_object));
			service_requests = service_requests.slice(max_stops_per_request);
		} else {
			updaters.push(new trArrTriMetUpdater(service_requests,arrivals_object));
			service_requests = [];
		}
	}

}

function trArrTriMetSupportsCors() {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // Supports CORS
    return true;
  } else if (typeof XDomainRequest != "undefined") {
    // IE
    return true;
  }
  return false;
}

function trArrTriMetUpdater(service_requests,arrivals_object) {
	
	var updater = this;
	
	updater.access_method = "jsonp";
	
	if (trArrTriMetSupportsCors()) {
		updater.access_method = "json";
	}
	
	// every updater object needs to maintain a queue
	this.arrivals_queue = [];
	this.service_messages = [];
	this.connection_health = [];
	
	this.update_interval = 60*1000;
	this.health_limit = Math.floor(60*60*1000/this.update_interval);
	
	var request_object = {}; // hash to use for testing arrivals against request
	
	var stop_id_list = [];
	for (var i = 0; i < service_requests.length; i++) {
		stop_id_list.push(service_requests[i].stop_id);
		request_object[service_requests[i].stop_id] = {};
		for (var j = 0; j < service_requests[i].routes.length; j++) {
			request_object[service_requests[i].stop_id][service_requests[i].routes[j].route_id] = true;
		}
	}
	var stop_string = stop_id_list.join(',');
	this.url = "//developer.trimet.org/ws/V1/arrivals/?locIDs="+stop_string+"&appID=828B87D6ABC0A9DF142696F76&json=true&streetcar=true";
	this.proxy_url = "//transitappliance.com/trimet_proxy.php?locIDs="+stop_string+"&appID=828B87D6ABC0A9DF142696F76&json=true&streetcar=true";
	
	// functions that will be polled by the arrivals object
	this.arrivals = function() {
		return this.arrivals_queue;
	}
	
	this.messages = function() {
		return this.service_messages;
	}
	
	this.connection = function() {
		return this.connection_health;
	}	
	
	this.update_connection_health = function(success_status) {
		var timestamp;
		try {
			timestamp = localTime().getTime();
		}
		catch (err) {
			if (typeof newrelic === "object") {
				newrelic.addPageAction("TR6: Timezone error, reloading page");
			}
			location.reload();
		}
	    updater.connection_health.unshift( { success: success_status, 'timestamp': timestamp } );
		if (updater.connection_health.length > this.health_limit) {
			updater.connection_health.length = this.health_limit; // limit to last hour
		}
	}
	
	this.trArrTriMetRequestLoop = function() {
		
		var serviceClasses = {
			"90": 1, // MAX
			"100": 1,
			"190" : 1,
			"200": 1,
			"290": 1,
			"203": 2, // commuter rail
			"193": 3, // Streetcar
			"194": 3, // Streetcar
			"195": 3, // Streetcar
			"196": 3, // Streetcar
			"293": 3, // Streetcar
			"2": 4, // FX
			"2a": 4, // FX
			"4": 5, // frequent service-Division/Fessenden
			"6": 5,
			"8": 5,
			"9": 5,
			"12": 5,
			"14": 5,
			"15": 5,
			"17": 5,
			"20": 5,
			"33": 5,
			"48": 5,
			"54": 5,
			"57": 5,
			"72": 5,
			"73": 5,
			"75": 5,
			"76": 5
		}
		
		updater.process_results = function(data) {
	  	updater.update_connection_health(true);
	  	var local_queue = [];
	  	var update_time = localTime().getTime();
	  	if (data.resultSet.arrival) {
				for (var i = 0; i < data.resultSet.arrival.length; i++){ 
					var arrival = data.resultSet.arrival[i];
					if (arrival.route == "193" || arrival.route == "194") {
						//continue; // Streetcar is handled by the NextBus adapter, so ignore TriMet info
					}
					if (request_object[arrival.locid] == undefined || request_object[arrival.locid][arrival.route] == undefined) {
						continue; // don't process an arrival if it wasn't in the stop list
					}
				  var entry = new transitArrival();
				  var arrival_time_raw = "";
				  
				  if (arrival.status == "canceled") {
				  	continue; // don't show canceled trips
				  }
					//console.log(arrival);

					if (arrival.status == "scheduled") {
						entry.type = "scheduled";
						arrival_time_raw = arrival.scheduled;
					} else {
						entry.type = "estimated";
						arrival_time_raw = arrival.estimated;
					}

					if (!isNaN(arrival_time_raw)) {
						entry.arrivalTime = arrival_time_raw
					} else {
						var year = arrival_time_raw.slice(0, 4);
						var mo = Number(arrival_time_raw.slice(5,7)) - 1; // Jan is 0 in JS
						var day = arrival_time_raw.slice(8, 10)
						var hour = arrival_time_raw.slice(11, 13);
						var min = arrival_time_raw.slice(14, 16);
						// Must be number or will be interpreted as tz
						var sec = Number(arrival_time_raw.slice(17,18));
						// Should get TriMet's TZ from GTFS agency defn, in case Oregon makes its own time
						// (e.g. America/Portland)
						var entry_date = new tzDate(year, mo, day, hour, min, sec, 'America/Los_Angeles');    
					
						entry.arrivalTime = entry_date.getTime(); // seconds since epoch for arrival
					}
					// console.log(entry.arrivalTime);


					entry.headsign = arrival.fullSign;
					entry.headsign = entry.headsign.replace("  "," ");
					entry.stop_id = arrival.locid;
					var stop_data = trStopCache().stopData('TriMet',entry.stop_id);
					entry.stop_data = copyStopData(stop_data);
					entry.route_id = arrival.route;
					for (var j = 0; j < stop_data.routes.length; j++){
						if (stop_data.routes[j].route_id == entry.route_id) {
							entry.route_data = stop_data.routes[j];
							entry.route_data.route_long_name = entry.route_data.route_long_name.replace("WES Commuter Rail","WES");
							if (serviceClasses[entry.route_id]) {
								entry.route_data.service_class = serviceClasses[entry.route_id];
							} else {
								entry.route_data.service_class = 6; // local bus
							}
						}
					}
					entry.agency = "TriMet";
					entry.avl_agency_id = "TriMet";
					entry.alerts = ""; // need to figure this out later
					entry.last_updated = update_time;
					local_queue.push(entry);
				}
			}
			
			// now copy to externally visble queue, making sure we're not in the middle of a query
			updater.arrivals_queue = local_queue;
			//trArrLog("<PRE>"+dump(updater.arrivals_queue)+"</PRE>");
				
		}


		jQuery.ajax({
		  url: updater.url,
		  dataType: updater.access_method,
		  cache: false,
		  error: function(data) {
		  	// first retry
				jQuery.ajax({
				  url: updater.url,
				  dataType: updater.access_method,
				  cache: false,
				  error: function(data) {
				  	// second retry
						jQuery.ajax({
						  url: updater.url,
						  dataType: updater.access_method,
						  cache: false,

						  error: function(data) {
							// last try via proxy
							jQuery.ajax({
								url: updater.proxy_url,
								dataType: updater.access_method,
								cache: false,
								error: function(data) {
									updater.update_connection_health(false);
									if (typeof newrelic === "object") {
										newrelic.addPageAction("TR1: TriMet Arrivals Error");
									} else {
										throw "TR1: TriMet Arrivals Error";
									}
								},
	
								success: updater.process_results
							});
						  },
						  success: updater.process_results
						});
				  },
				  success: updater.process_results
				});
		  },
		  success: updater.process_results
		});

	}
	
	updater.trArrTriMetRequestLoop(); // first time immediately
	setInterval(updater.trArrTriMetRequestLoop,updater.update_interval);

}

function copyStopData(data) {
	var out = {};
	for (var element in data) {
		// strip it down to just the GTFS elements
		if (element != 'routes' && element != 'geometry' && element != 'doc_type' && element.substring(0,1) != '_') {
			out[element] = data[element]
		}
	}
	return out;
}
