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

function trArrAgencyClackMakeServiceRequests(stops,options,stop_cache,service_requests) {
		
	if (typeof service_requests.Passio == "undefined") {
		service_requests.Passio = {};
	}
	if (typeof service_requests.Passio['Clack'] == "undefined") {
		service_requests.Passio['Clack'] = [];
	}

	for (var stop_id in stops) {
		var stop_data = stop_cache.stopData('Clack',stop_id);
		var obj = {stop_id: stop_id, stop_data: stop_data, routes: []};
		if (stops[stop_id]['*']) {
			for (var i = 0; i < stop_data.routes.length; i++){
				obj.routes.push(stop_data.routes[i]);
			}
		} else {
			var route_id = undefined;
			for (var id in stops[stop_id]) {
				route_id = id;
				for (var i = 0; i < stop_data.routes.length; i++){
					if (stop_data.routes[i].route_id == route_id) {
						obj.routes.push(stop_data.routes[i]);
					}
				}
			}
		}

		obj.callback = trArrAgencyClackEntryFilterCallback;

		service_requests.Passio['Clack'].push(obj);
		
	}
	
}

function trArrAgencyClackEntryFilterCallback(entry) {
	const route_initials = {
		"5396": "CX",
		"4154": "CI",
		"6140": "ES",
		"4155": "OC"
	}
	console.log(entry);
	entry.route_data.route_short_name = route_initials[entry.route_data.route_id];
	if (entry.route_id == "5396" && entry.stop_id == "155321") {
		entry.headsign = entry.headsign + " to Oregon City";
	}
	return entry;
}


