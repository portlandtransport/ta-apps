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
    console.log(this.agencies.cache);
    
    for (var avl_agency_id in service_requests) {
	    var agency = avl_agency_id;
        var agency_rt_url = this.agencies[agency][gtfs_rt_url];
	    updaters.push(new trArrPassioUpdater(service_requests,arrivals_object,avl_agency_id,agency,agency_rt_url));
    }
    
}

function trArrPassioUpdater(service_requests,arrivals_object,avl_agency_id,agency,agency_rt_url) {
    
    
	var updater = this;
    this.url = agency_rt_url;

    console.log(this.url)l
	
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

    updater.arrivals_queue = [];

	/*
	updater.trArrTriMetRequestLoop(); // first time immediately
	setInterval(updater.trArrTriMetRequestLoop,updater.update_interval);
    */
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
	

}

function copyArray(in_array) {
    var out_array = [];
    for (var i = 0; i < in_array.length; i++){ 
	out_array[i] = in_array[i];
    } 
    return out_array;
}


