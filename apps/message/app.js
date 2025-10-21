/*
   Copyright 2010-2013 Portland Transport

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

var message = {}; // keep state

// constants

message.APP_NAME 		= "message";
message.APP_VERSION 	= "1.01";
message.APP_ID 			= "message";


// assess environment

message.is_development = (location.hostname == "dev.transitappliance.com");



/**
 * Loosely modeled on jquery.parsequery.js by Michael Manning (http://actingthemaggot.com)
 **/


trArrParseQuery = function(qs) {
	var q = (typeof qs === 'string'?qs:window.location.search);
	var params = {};
	jQuery.each(q.match(/^\??(.*)$/)[1].split('&'),function(i,p){
		p = decodeURIComponent(p).replace(/\+/g,' ').replace(/\]/g,'');
		p = p.split('=');
		/* old approach
		var keys = p[0].split('[');
		var value = p[1]; // doesn't allow for equals symbol in value
		*/
		var keys = p[0].split('[');
		p.shift();
		var value = p.join("=");
		var depth = keys.length;
		if (depth == 1) {
			// actually shouldn't happen, should always have at least two levels
			if (params[keys[0]] == undefined) {
				params[keys[0]] = {};
			}
			params[keys[0]][value] = true;
		}
		if (depth == 2) {
			if (params[keys[0]] == undefined) {
				params[keys[0]] = {};
			}
			if (params[keys[0]][keys[1]] == undefined) {
				params[keys[0]][keys[1]] = {};
			}
			params[keys[0]][keys[1]][value] = true;
		}
		if (depth == 3) {
			if (params[keys[0]] == undefined) {
				params[keys[0]] = {};
			}
			if (params[keys[0]][keys[1]] == undefined) {
				params[keys[0]][keys[1]] = {};
			}
			if (params[keys[0]][keys[1]][keys[2]] == undefined) {
				params[keys[0]][keys[1]][keys[2]] = {};
			}
			params[keys[0]][keys[1]][keys[2]][value] = true;
		}
	});
	return params;
}

var query_params = trArrParseQuery();


// turns options from objects into arrays
var options = {};
for (var option in query_params.option) {
	var opt_array = [];
	for (var value in this.query_params.option[option]) {
		opt_array.push(value);
	}
	options[option] = opt_array;
}

var content_url = options['content_url'];
if (typeof content_url == "object") {
	content_url = content_url[0];
}
console.log("Content:"+content_url);

var appliance = {};
for (var appl in query_params.appl) {
	var opt_array = [];
	for (var value in this.query_params.appl[appl]) {
		opt_array.push(value);
	}
	appliance[appl] = opt_array;
}






window.onload = function() {

	document.getElementById('message_frame').src = content_url;

	/* health logging */

	var start_time = ((new Date)).getTime();

	var platform = "";
	if (typeof options.platform === 'object') {
		platform = options.platform[0];
	}

	/* initiate healthcheck */

	var data = { timestamp: start_time, start_time: start_time, version: 'N/A', "id": appliance['id'], application_id: message.APP_ID, application_name: message.APP_NAME, application_version: message.APP_VERSION, application_host: window.location.protocol+'//'+window.location.host+'/', "height": jQuery(window).height(), "width": jQuery(window).width(), "platform": platform };
	trHealthUpdate(data,0,true);

	// logging of startup, beat every 30 min goes here
	setInterval(function(){
		var data = { timestamp: ((new Date)).getTime(), start_time: start_time, version: 'N/A', "id": appliance['id'], application_id: message.APP_ID, application_name: message.APP_NAME, application_version: message.APP_VERSION, application_host: window.location.protocol+'//'+window.location.host+'/', "height": jQuery(window).height(), "width": jQuery(window).width(), "platform": platform };
		trHealthUpdate(data,0,false);
	}, 30*60*1000);

	
}

    













