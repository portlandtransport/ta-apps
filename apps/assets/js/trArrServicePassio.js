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

  Authors:
  Chris Smith: Original code

*/


function trArrServicePassioCreateUpdaters(arrivals_object, service_requests, updaters) {
    
    this.agencies = trAgencyCache();
    
    for (var avl_agency_id in service_requests) {
	    var agency = avl_agency_id;
        var agency_data = this.agencies.agencyData(agency);
	    updaters.push(new trArrPassioUpdater(service_requests,arrivals_object,avl_agency_id,agency,agency_data.gtfs_rt_url));
    }
    
}

function trArrPassioUpdater(service_requests,arrivals_object,avl_agency_id,agency,agency_rt_url) {
    
    
	var updater = this;
    this.url = agency_rt_url;
	updater.service_requests = service_requests[agency];
	
	// every updater object needs to maintain a queue
	this.arrivals_queue = [];
	this.service_messages = [];
	this.connection_health = [];
	
	this.update_interval = 60*1000;
	this.health_limit = Math.floor(60*60*1000/this.update_interval);
	
	var request_object = {}; // hash to use for testing arrivals against request

    updater.arrivals_queue = [];

	/*
	updater.trArrTriMetRequestLoop(); // first time immediately
	setInterval(updater.trArrTriMetRequestLoop,updater.update_interval);
    */
	// functions that will be polled by the arrivals object
	this.arrivals = function() {
		return[];
		return this.arrivals_queue;
	}
	
	this.messages = function() {
		return[];
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
				newrelic.addPageAction("PS6: Timezone error, reloading page");
			}
			location.reload();
		}
	    updater.connection_health.unshift( { success: success_status, 'timestamp': timestamp } );
		if (updater.connection_health.length > this.health_limit) {
			updater.connection_health.length = this.health_limit; // limit to last hour
		}
	}
	



	this.trArrPassioRequestLoop = function() {		
		
		updater.process_results = function(trips) {
			updater.update_connection_health(true);
			var local_queue = [];
			var update_time = localTime().getTime();

			// loop through stops in request and see if we have arrivals for that stop
			updater.service_requests.forEach((stop) => {
				console.log(stop);
				//console.log(trips);
			
				if (trips[stop.stop_id]) {
					console.log(trips[stop.stop_id]);
				}
				
			});

			
			// now copy to externally visble queue, making sure we're not in the middle of a query
			updater.arrivals_queue = local_queue;
			//trArrLog("<PRE>"+dump(updater.arrivals_queue)+"</PRE>");

			// Create a new XMLHttpRequest object

		}

		const xhr = new XMLHttpRequest();

		xhr.responseType = 'arraybuffer'
		xhr.open('GET', updater.url, true);

		// Set up the event handler for when the request state changes
		xhr.onreadystatechange = function() {
			// Check if the request is complete (readyState 4) and successful (status 200)

			if (xhr.readyState === 4 && xhr.status === 200) {

				//var trips = parser.parse_response(xhr.response);
				var trips = window.tripUpdateParser.parseBuffer(xhr.response);

				updater.process_results(trips);

			} else if (xhr.readyState === 4 && xhr.status !== 200) {
				if (typeof newrelic === "object") {
					newrelic.addPageAction("PS1: Passio Arrivals Error");
				} else {
					throw "PS1: Passio Arrivals Error";
				}
			}
		};

		// Send the request
		xhr.send();
			

	}

	updater.trArrPassioRequestLoop(); // first time immediately
	setInterval(updater.trArrPassioRequestLoop,updater.update_interval);
}

function copyArray(in_array) {
    var out_array = [];
    for (var i = 0; i < in_array.length; i++){ 
	out_array[i] = in_array[i];
    } 
    return out_array;
}
