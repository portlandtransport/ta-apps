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

function trArrAgencyCTRANMakeServiceRequests(stops,options,stop_cache,service_requests) {
		
	if (typeof service_requests.Passio == "undefined") {
		service_requests.Passio = {};
	}
	if (typeof service_requests.Passio['CTRAN'] == "undefined") {
		service_requests.Passio['CTRAN'] = [];
	}

	for (var stop_id in stops) {
		var stop_data = stop_cache.stopData('CTRAN',stop_id);
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

		obj.callback = trArrAgencyCTRANEntryFilterCallback;

		service_requests.Passio['CTRAN'].push(obj);
		
	}
	
}

function trArrAgencyCTRANEntryFilterCallback(entry) {
	// PDX lat 45.5852698
	//console.log("raw");
	/*
	if (false && entry.route_id == "051") {
		console.log(entry.route_id+" "+entry.stop_id+" "+entry.trip_id);
		console.log(entry);
	}
	*/

	entry.route_data.route_short_name = entry.route_data.route_id;
	if (entry.route_data.route_id == "106") {
		entry.route_data.route_short_name = "105X";
	}
	entry.route_data.route_short_name = entry.route_data.route_short_name.replace(/^0+/, ''); 
	if (entry.stop_data.stop_lat < 45.5852698) {
		entry.headsign = "C-TRAN "+entry.headsign;
	}
	if (entry.route_id == "050" || entry.route_id == "051") {
		entry.route_data.route_short_name = "VINE";
		entry.route_data.service_class = 2;
	}
	//console.log("massaged");
	//console.log(entry);
	return entry;
}



