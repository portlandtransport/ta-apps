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

function trArrServiceClackCreateUpdaters(arrivals_object, service_requests, updaters) {
	
	var max_stops_per_request = 10;

	// TriMet allows a max of 10 stops in one request, so split things up into multiple updater objects if need be
	while (service_requests.length > 0) {
        updaters.push(new trArrTriMetUpdater(service_requests,arrivals_object));
        service_requests = [];
	}

}



function trArrClackUpdater(service_requests,arrivals_object) {
	
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

	/*
	updater.trArrTriMetRequestLoop(); // first time immediately
	setInterval(updater.trArrTriMetRequestLoop,updater.update_interval);
    */

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
