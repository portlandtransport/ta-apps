/*
   Copyright 2011 Portland Transport

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

function initializePage (data) {
    // get the rights notice
    var rights_string = '';
    for (var agency in data.stopsConfig) {
	rights_string += data.agencyCache.agencyData(agency).rights_notice+" ";
    }
    jQuery('#ticker').html('<span class="rights">' + rights_string + '</span>');

    // Set the height of the display
    $('.box').css('height', ($(window).height() - 35) + 'px');
}

function displayPage (data) {
    // Fetch the two arrivals we'll be displaying
    // Not sure if I have to use toArray before slice
    // Get them by line
    var queue = [];
    var lines = data.arrivalsQueue.minutes(60).byLine()
    for (var line in lines) {
	queue.push(lines[line][0]);
    }

    // clear the boxes
    $('.box').text('');
    
    // Create an HTML Arrival
    function makeArrival(arr) {
	var html = '';
	if (arr != undefined) {
	    var mins = arr.minutes();
	    if (mins == 0) mins = 'Due';
	    html += '<div class="headsign">' + arr.headsign + '</div>';
	    html += '<div class="mins">' + mins + '</div>';
	    html += '<div class="board">Board at: ' + arr.stop_data.stop_name + '</div>';
	    html += '<div class="flags">';
	    if (arr.flags != undefined) {
		arr.flags.forEach(function (flag) {
		    html += '<img src="assets/img/flags/' + flag + '-48x48.png" />';
		});
	    }
	    html += '</div>';
				  
	    return html;
	}
	else { return '<div class="headsign">No arrival data available</div>'; }
    }

    // Populate the left box
    $('#leftbox').html(makeArrival(queue[0]));
    $('#rightbox').html(makeArrival(queue[1]));

    // Set the sizes
    // one height unit: 1%
    var hu = $('#leftbox').height()/100;
    $('.mins').css('font-size',  hu*55 + 'px');
    $('.board').css('font-size', hu*8 + 'px');
    $('.headsign').css('font-size', hu*9 + 'px');

    /*
    // Populate the service advisories
    jQuery('.advisory').remove();
    data.serviceMessages.forEach( function(msg) {
	jQuery('#ticker').append('<span class="advisory advisory-severity-' + msg.severity + '">' + msg + '</span>');
    });
    */
}
    

$('document').ready( function () {
    trArr({
	configString: window.location.search,
	displayInterval: 12*1000, 
	displayCallback: function (data) {
	    if (data.displayCallCount == 0) {
		initializePage(data);
	    }
	    displayPage(data);
	},
	initializeCallback: function (data) {
	    if (data.optionsConfig.single != undefined) {
		// Hide the right box
		jQuery('#rightbox').css('display', 'none');

		// And expand the left
		jQuery('#leftbox').css('width', '100%');
		
	    }
	    var rights_string = '';
	    for (var agency in data.stopsConfig) {
		rights_string += data.agencyCache.agencyData(agency).rights_notice+" ";
	    }
	    jQuery('#ticker').text(rights_string);

	}
    });
});
    