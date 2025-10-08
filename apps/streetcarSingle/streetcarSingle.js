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

	if (typeof arr == "undefined" || arr.length == 0) {
		return "<div></div>";
	}

	currentDest = null; 

	var headsign = arr[0].headsign.replace("Portland","");
	if (arr[0].stop_id == "10777") {
		headsign = "NS Streetcar to South Waterfront via <b>Pearl District</b> and <b>Downtown</b>";
	} 

	var html = '<div class="box ' + "route_"+arr[0].route_id + '" dest="' + 
	    arr[0].headsign + '">';
	// arr[0] b/c we get all arrivals for a specified destination in
	// next 60 minutes, so we can display also: 6, 18, 25
	// get all of the other arrivals
	var also = [];
	var listLen = arr.length;
	// start with 1 b/c we don't want to show also: this arrival
	for (var i=1; i < listLen && i < 2; i++) {
	    also.push(formatted_arrival_time(arr[i],false));
	}

	if (arr[0] != undefined) {
	    //var mins = formatted_arrival_time(arr[0],true);
		var mins = arr[0].minutes();

		/*
		html += '<div class="logo"><img src="/apps/assets/images/psi/Streetcar_Logo_Horz_Trans-07.png" style="width: 500px;"></div>';
	    // we put in a span so that textfill has something to resize
	    html += '<div class="top_margin"></div><div class="headsign"><span>' + headsign + 
		    '</span></div>';
	    html += '<div class="mins"><span>' + mins + '</span></div>';
		*/

		if (mins <= 0) {
			mins = "<span style=\"color: yellow\"><b>Due</b></span>"
		} else if (mins < 5) {
			mins = "<span style=\"color: yellow\"><b>" +mins + "</b><span style=\"font-size: 30%\"> min</span></span>";
		} else {
			mins = "<b>"+mins + "</b><span style=\"font-size: 30%\"> min</span>";
		}
		html += '<div class="logo"><img src="/apps/assets/images/psi/Streetcar_Logo_Horz_Trans-07.png" style="width: 500px;"></div>';
		html += '<div class="headsign" ><span>'+headsign+'</span></div>';
		html += '<div class="mins"><span style="font-size: 90%"><nobr>' + mins + '</nobr></span></div>';

		if (also.length > 0) {
			html += '<div class="also">&nbsp;<br><span>' + also.join(' min, ') + 
				' min</span></div>';
		}
		else {
			// put in a div to force it downward
			html += '<div class="also"><span> </span></div>';
		}

		/*
	    html += '<div class="board"><span>Board at: ' + 
		    arr[0].stop_data.stop_name + '</span></div>';
			*/
		    
	}
	else 
	{ 
		html += '<div class="headsign"><span>' + 'No arrival data available</span></div>'; 
	}
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
    $('.top_margin').height(sizes.top_margin).textfill({ maxFontPixels: sizes.also });
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
    
    // make sure arrival time does not overflow
    $('.mins').each(function () {
	    var mins = jQuery(this);
	    var multiplier = 1;
	    while (true) {
	        if (mins[0].scrollWidth > mins[0].clientWidth) {
		        multiplier = multiplier * 0.9;
		        mins.css('font-size', (multiplier * sizes.mins) + 'px');
	        }
	        else break;
	    }
    });
    //console.log($('.mins')[0].scrollWidth);
    //console.log($('.mins')[0].clientWidth);
}

function displayPage () {
    // Fetch the arrivals we'll be displaying
    // Not sure if I have to use toArray before slice
    // Get them by line
    var queue = [];
    var dests = theData.arrivalsQueue.current().minutes(60*48).byDest()
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
    if (typeof dests == "undefined" || i >= dests.length) {
        displayPage();
    }
    else {
        // get the latest information for this destination
        arr = theData.arrivalsQueue.minutes(60*48).byDest()[dests[i]];
        
        if (typeof arr == "undefined" || arr.length == 0) {
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
	
	function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    return "";
	}
	
	var application_id = getQueryVariable('appl[id]');

	/* disable tracekit
	
	var handler_url = "http://transitappliance.com/cgi-bin/js_error.pl";
	
	TraceKit.report.subscribe(function (stackInfo) {   
		var serialized_stack = JSON.stringify(stackInfo);
		if (serialized_stack.match(/tracekit/)) {
			// don't track self-referential tracekit errors
		} else if (serialized_stack.match(/Timezone/i)){
			jQuery.ajax({
			    url: handler_url,
			    type: 'POST',
			    data: {
					  	applicationName: 			"Streetcar Single",
					  	applicationVersion: 	"1.00",
					  	applicationId: 				"sc-single",
					  	applianceId:					application_id,
			        browserUrl: 					window.location.href,
			        codeFile:							stackInfo.url,
			        message:							"TZ1: Timezone error, restarting application: "+stackInfo.message,
			        userAgent: 						navigator.userAgent,
			        stackInfo: 						serialized_stack
			    }
			});
			
			setTimeout(function(){
				// restart app
				location.reload(true);
			},2000);
			
		} else {
			jQuery.ajax({
			    url: handler_url,
			    type: 'POST',
			    data: {
					  	applicationName: 			"Streetcar Single",
					  	applicationVersion: 	"1.00",
					  	applicationId: 				"sc-single",
					  	applianceId:					application_id,
			        browserUrl: 					window.location.href,
			        codeFile:							stackInfo.url,
			        message:							stackInfo.message,
			        userAgent: 						navigator.userAgent,
			        stackInfo: 						serialized_stack
			    }
			});
		}
	});	

	*/
	
	

    trArr({
	  	applicationName: 			"Streetcar Single",
	  	applicationVersion: 	"1.00",
	  	applicationId: 				"sc-single",
    	assetsDir:	"../assets",
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
		        box: 100*hu,
		        top_margin: 10*hu,
		        //ticker: 6.5*hu,
		        ticker: 0*hu,
		        // Add room for stuff below baseline &c.
		        fullticker: 7.5*hu,
		        mins: 39*hu,
		        //board: 12*hu,
		        board: 0*hu,
		        headsign: 27*hu,
		        also: 13.6*hu,
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

formatted_arrival_time = function(arrival,reduce_unit) {
	var reduce_style = "";
	if (reduce_unit) {
		reduce_style = 'style="font-size: 50%"';
	}
	var displayTime = "";
	var milliseconds_until_arrival = arrival.arrivalTime - new Date();
	
	var minutes_until_arrival = Math.round(milliseconds_until_arrival/60000);
	if (minutes_until_arrival == 0) {
		minutes_until_arrival = "Due";
	} else {
		minutes_until_arrival = "<nobr>"+minutes_until_arrival+" <span "+reduce_style+">min</span></nobr>"; 
	}
	if (arrival.type == 'scheduled') {
		timeclass = ' scheduled';
		var sched_date = localTime(arrival.arrivalTime);
		displayTime = sched_date.toString('h:mmtt');
		displayTime = displayTime.replace(/^0:/,'12:');
	} else {
		displayTime = minutes_until_arrival;
		timeclass = "";
	}
	
	return displayTime;
}
	 
    