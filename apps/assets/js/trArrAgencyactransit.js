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

function trArrAgencyactransitMakeServiceRequests(stops,options,stop_cache,service_requests) {
		
	if (service_requests.NextBus == undefined) {
		service_requests.NextBus = {};
	}
	if (service_requests.NextBus['actransit'] == undefined) {
		service_requests.NextBus['actransit'] = [];
	}
	
	for (var stop_id in stops) {
		var stop_data = stop_cache.stopData('actransit',stop_id);
		var obj = {stop_id: stop_id, stop_data: stop_data, routes: []};
		if (stops[stop_id]['*']) {
			for (var i = 0; i < stop_data.routes.length; i++){
			        stop_data.routes[i].avl_route_id = stop_data.routes[i].route_short_name;
				obj.routes.push(stop_data.routes[i]);
			}
		} else {
			var route_id = undefined;
			for (var id in stops[stop_id]) {
				route_id = id;
			}
			for (var i = 0; i < stop_data.routes.length; i++){
				if (stop_data.routes[i].route_id == route_id) {
					stop_data.routes[i].avl_route_id = stop_data.routes[i].route_short_name;
					obj.routes.push(stop_data.routes[i]);
				}
			}
		}
	    //console.log(obj);
		service_requests.NextBus['actransit'].push(obj);
	}

}


