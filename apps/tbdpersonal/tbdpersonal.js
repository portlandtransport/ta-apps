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

   Author: Matt Conway

*/

// Create an HTML Arrival
// arr is actually an array of arrivals
function makeArrival(arr, num) {
	// if we're showing the same destination that is already shown, don't
	// change the color. This should only happen on the first iteration of
	// the loop
	if (currentDest != arr[0].headsign) {
	    if (oddeven == 'odd') oddeven = 'even';
	    else oddeven = 'odd';
	}

	// currentDest should only be used the first time.
	// this function is executed for each arrival 
	// in each cycle. The idea is that
	// showNextArrival sets currentDest, and if the first destination in the
	// new arrivals set is the same as the last in the old, the background
	// will not change. This is especially important when there is only one
	// arrival displaying, because the background will go back and
	// forth between blue and green without this. If it's left set, the
	// color will not change when the destination comes up that was last
	// in the previous set.
	currentDest = null; 

	var html = '<div class="box box' + oddeven + '" dest="' + 
	    arr[0].headsign + '">';
	// arr[0] b/c we get all arrivals for a specified destination in
	// next 60 minutes, so we can display also: 6, 18, 25
	// get all of the other arrivals
	var also = [];
	var listLen = arr.length;
	// start with 1 b/c we don't want to show also: this arrival
	for (var i=1; i < listLen; i++) {
	    also.push(arr[i].minutes());
	}

	if (arr[0] != undefined) {
	    var mins = arr[0].minutes();
	    if (mins <= 0) mins = 'Due';
	    // we put in a span so that textfill has something to resize
	    html += '<div class="headsign"><span>' + arr[0].headsign + 
		    '</span></div>';
	    html += '<div class="mins"><span>' + mins + '</span></div>';

	    if (also.length > 0) {
		    html += '<div class="also"><span>also: ' + also.join(', ') + 
		        '</span></div>';
	    }
	    else {
		    // put in a div to force it downward
		    html += '<div class="also"><span> </span></div>';
	    }

	    html += '<div class="board"><span>Board at: ' + 
		    arr[0].stop_data.stop_name + '</span></div>';
	}
	else { html += '<div class="headsign"><span>' + 
	       'No arrival data available</span></div>'; }
	html += '</div>'
	return html;
}

// set the box sizes
function autoSizeBoxes () {
    // give it some margins
    $('.mins, .also, .board, .headsign')
	    .css('margin-left', sizes.margin)
	    .css('margin-right', sizes.margin)
	    .css('overflow', 'hidden');

    // Set the sizes
    $('.mins').height(sizes.mins);
    // 0.8 to account for line spacing, padding, &c.
    $('.mins').css('font-size', (0.9 * sizes.mins) + 'px');
    $('.also').height(sizes.also).textfill({ maxFontPixels: sizes.also });
    $('.board').height(sizes.board).textfill({ maxFontPixels: sizes.board });
    $('.headsign').height(sizes.headsign).textfill({ maxFontPixels: sizes.headsign });
    
    // Set the height of the display
    $('.box').height(sizes.box);

    // prevent the destination from wrapping more than once (e.g. SF Muni line
    // 
    $('.headsign').each(function () {
	    var hs = jQuery(this);
	    var multiplier = 1;
	    while (true) {
	        // 2.5 to account for line spacing
	        if (hs.height() > 2.5 * sizes.headsign) {
		        multiplier = multiplier * 0.9;
		        hs.css('font-size', (multiplier * sizes.headsign) + 'px');
	        }
	        else break;
	    }
    });
}

function displayPage () {
    // Fetch the arrivals we'll be displaying
    // Not sure if I have to use toArray before slice
    // Get them by line
    var queue = [];
    var dests = theData.arrivalsQueue.current().minutes(60).byDest()
    for (var dest in dests) {
	    // Save all of them, not just the next one, to put in the
	    // also: text
	    queue.push(dest);
    }
    
    var boxes = jQuery('#boxes');

    // clear the boxes
    boxes.html('');
    
    // create the first box
    var arrsLen = queue.length
	boxes.append(makeArrival(dests[queue[0]], 0));

    // A clearing div to force the boxes div large.
    boxes.append('<div class="clear">');

    autoSizeBoxes();

    // Start the loop
    // 1000 to get ms
    setTimeout(function () { showNextArrival(1, queue) }, 1000*(theData.optionsConfig.timeout?theData.optionsConfig.timeout[0]:3));
}

function showNextArrival (i, dests) {
    // set the currently displaying destination
    // we do it here also, because, when only one destination is available
    // the else below will never get called, and the destination needs to be
    // set before we call displayPage() so that we won't get a background
    // alternating between blue and green
    currentDest = jQuery('.box').first().attr('dest');

    // if we're at the end
    if (i >= dests.length) {
        displayPage();
    }
    else {
        // get the latest information for this destination
        arr = theData.arrivalsQueue.minutes(60).byDest()[dests[i]];
        
        if (arr.length == 0) {
            showNextArrival(i + 1);
            return;
        }   
        
        // add the next arrival
        jQuery('.box').after(makeArrival(arr, i));
        
        // autosize
        autoSizeBoxes();
        
        // remove the currently shown arrival
        jQuery('.box').first().remove();
        
	    // set what the currently displaying destination is, so that
	    // the color won't be changed if we generate one that is the same
	    // on the next cycle
	    // the 'dest' attr is added to the box div exclusively for this purpose
	    currentDest = jQuery('.box').first().attr('dest');
	    setTimeout(function () { showNextArrival(i+1, dests) }, 1000*(theData.optionsConfig.timeout?theData.optionsConfig.timeout[0]:3));
    }
}

$('document').ready( function () {
    trArr({
	    configString: window.location.search,
	    displayInterval: 12*1000, 
	    displayCallback: function (data) {
	        // It will be read when the cycle finishes
	        theData = data;
	    },
	    initializeCallback: function (data) {
	        var rights_string = '';
	        for (var agency in data.stopsConfig) {
		        rights_string += data.agencyCache.agencyData(agency).rights_notice+" ";
	        }
	        jQuery('#ticker').html(rights_string + '&mdash;' + 'Transit Board&#153; Personal is a product of Portland Transport. Learn more at <a href="http://transitappliance.org">http://transitappliance.org</a>.');


	        // Initialize to []
	        serviceMessages = [];

	        // Set up the sizes
	        // one height unit: 1%
	        var hu = $(window).height()/100;
	        var wu = $(window).width()/100;
	        sizes = {
		        box: 86*hu,
		        ticker: 6.5*hu,
		        // Add room for stuff below baseline &c.
		        fullticker: 7.5*hu,
		        mins: 39*hu,
		        board: 12*hu,
		        headsign: 27*hu,
		        also: 7*hu,
		        margin: 5*wu
	        }

	        // Set up the boxes div
	        $('#boxes').css('height', sizes.box + 'px');
	        
	        // Make it tick, and set its height
	        jQuery('#ticker').marquee('marquee').css('font-size', sizes.ticker + 'px').css('height', sizes.fullticker + 'px').bind('stop', function () {
		        // When it finishes, update the ticker
		        jQuery('.advisory').remove();
		        theData.serviceMessages.forEach( function(msg) {
		            // Append it to the subdiv jquery.marquee creates
		            jQuery('.marquee div').append('&mdash;<span class="advisory advisory-severity-' + msg.severity + '">' + msg + '</span>')
		        });
	        });
	        
	        // show the first arrival
	        theData = data;

	        // keep track of state
	        oddeven = 'odd';
	        currentDest = '';

	        displayPage();
	    }
    });
});
	 
    