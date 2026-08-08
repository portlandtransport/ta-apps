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
	//console.log(entry);

	const trArrAgencyCTRANServiceLevels = {
		'050' : 1,
		'051' : 1,
		'105' : 2,
		'106' : 2,
		'164' : 2,
		'190' : 2,
		'060' : 3,
		'065' : 3,
		'071' : 3,
		'002' : 7,
		'009' : 7,
		'041' : 7,
		'047' : 7,
		'048' : 7
	}

	entry.route_data.route_short_name = entry.route_data.route_id;
	if (entry.route_data.route_id == "106") {
		entry.route_data.route_short_name = "105X";
	}
	if (entry.route_id == "050" || entry.route_id == "051") {
		entry.route_data.route_short_name = "VINE";
		entry.route_data.service_class = 1;
	}
	entry.route_data.route_short_name = entry.route_data.route_short_name.replace(/^0+/, ''); 

	if (Object.hasOwn(entry.stop_data,'trip_data')) {
		entry.headsign = entry.headsign = entry.headsign+" to "+entry.stop_data.trip_data[entry.trip_id].trip_headsign;
		entry.headsign = entry.headsign.replace(/Express to Express to/,'Express to');

		if (Object.hasOwn(trDebug,'disaggregate_trips')) {
			entry.headsign = entry.headsign+" ("+entry.trip_id+")";
		}
		
	}	

	if (entry.stop_data.stop_lat < 45.5852698) {
		entry.headsign = "C-TRAN "+entry.headsign;
	} else {

		if (Object.hasOwn(trArrAgencyCTRANServiceLevels,entry.route_id)) {
			entry.route_data.service_class = trArrAgencyCTRANServiceLevels[entry.route_id];
		}
		
		/*
		// in Vancouver, assign local colors and services levels
		if (entry.route_id == "105" || entry.route_id == "106") {
			entry.route_data.service_class = 2;
		}
		if (entry.route_id == "060" || entry.route_id == "071") {
			entry.route_data.service_class = 3;
		}
		if (entry.route_id == "002" || entry.route_id == "041") {
			entry.route_data.service_class = 7;
		}
			*/
	}
	if (Object.hasOwn(trDebug,'report_callback_arrival')) {
		console.log(entry);
	}
	
	// kill inbound entries at Turtle Pl
	if (entry.stop_id == '6136' && entry.headsign.match(/downtown vancouver/i != null)) {
		entry = null;
	}

	return entry;
}



