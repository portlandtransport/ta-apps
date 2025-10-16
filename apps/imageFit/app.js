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

var redirectApp = {}; // keep state

// constants

redirectApp.APP_NAME 		= "Redirect";
redirectApp.APP_VERSION 	= "1.01";
redirectApp.APP_ID 			= "redirect";


// assess environment

redirectApp.is_development = (location.hostname == "dev.transitappliance.com");



/**
 * Loosely modeled on jquery.parsequery.js by Michael Manning (http://actingthemaggot.com)
 **/
trArrParseQuery = function(qs) {
	var q = (typeof qs === 'string'?qs:window.location.search);
	var params = {};
	jQuery.each(q.match(/^\??(.*)$/)[1].split('&'),function(i,p){
		p = p.replace(/\+/g,' ').replace(/\]/g,'');
		p = p.split('=');
		var keys = p[0].split('[');
		var value = p[1];
		var depth = keys.length;
		if (depth == 1) {
			// actually shouldn't happen, should always have at least two levels
			if (params[keys[0]] == undefined) {
				params[keys[0]] = {};
			}
			params[keys[0]][unescape(value)] = true;
		}
		if (depth == 2) {
			if (params[keys[0]] == undefined) {
				params[keys[0]] = {};
			}
			if (params[keys[0]][keys[1]] == undefined) {
				params[keys[0]][keys[1]] = {};
			}
			params[keys[0]][keys[1]][unescape(value)] = true;
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
			params[keys[0]][keys[1]][keys[2]][unescape(value)] = true;
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

var appliance = {};
for (var appl in query_params.appl) {
	var opt_array = [];
	for (var value in this.query_params.appl[appl]) {
		opt_array.push(value);
	}
	appliance[appl] = opt_array;
}

function RememberOriginalSize(img) {

	if (!img.originalsize) {
		img.originalsize = {width : img.width, height : img.height};
	}

}


function FixImage(fLetterBox, div, img) {

	RememberOriginalSize(img);

	var targetwidth = $(div).width();
	var targetheight = $(div).height();
	var srcwidth = img.originalsize.width;
	var srcheight = img.originalsize.height;
	var result = ScaleImage(srcwidth, srcheight, targetwidth, targetheight, fLetterBox);

	img.width = result.width;
	img.height = result.height;
	$(img).css("left", result.targetleft);
	$(img).css("top", result.targettop);
}

function StretchImage(div, img) {

	RememberOriginalSize(img);

	var targetwidth = $(div).width();
	var targetheight = $(div).height();

	img.width = targetwidth;
	img.height = targetheight;
	$(img).css("left", 0);
	$(img).css("top", 0);
}


function FixImages(fLetterBox) {
	$("div.aspectcorrect").each(function (index, div) {
		var img = $(div).find("img").get(0);
		FixImage(fLetterBox, div, img);
	});
}

function StretchImages() {
	$("div.aspectcorrect").each(function (index, div) {
		var img = $(div).find("img").get(0);
		StretchImage(div, img);
	});
}

window.onload = function() {
	// size div to window
	$("div#photo_holder").css("width",$(window).width()+"px").css("height",$(window).height()+"px");
	
	// add load handler to image
var fit_image = document.getElementById('photo');

fit_image.onload = function () {
	FixImages(true);   	
};

// load image
setTimeout(function(){
	fit_image.src = query_params['image_url'];
}, 5000);			
	
}

    













