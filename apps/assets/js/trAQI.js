function trAQI(options) { 
    
    // ensure this is called as constructor
    
    if (!(this instanceof trAQI)) {
        return new trAQI(options);
    }
    
    var aqi = this;
    
    this.timestamp = undefined;
    this.api_key = undefined;
            

    // accessors
    this.get_summary_forecast = function() {
        return aqi.summary;
    }
    
    this.get_icon = function() {
        return "/apps/assets/img/aqi/aqi.svg";
        //return aqi.icon.replace("64x64","128x128");
    }
    
    this.get_aqi = function() {
        return aqi.aqi;
    }
    
    this.aqi_is_current = function() {
        if (typeof aqi.timestamp == "undefined") {
            // haven't gotten a forecast yet
            return false;
        }
        
        var age_of_forecast = new Date() - aqi.timestamp;
        if (age_of_forecast > 15*60*1000) {
            // forecast is more than 15 minutes old
            return false;
        }
        
        return true; // recent enough!
    }			


    this.update_aqi = function(retry_count) {
        const retry_limit = 1;

        var api_key = trAQICredentials('waqi');

        var aqi_url = "https://api.waqi.info/feed/geo:"+options.lat+";"+options.lng+"/?token="+api_key;

        const xhr = new XMLHttpRequest();

        xhr.responseType = 'text';

        xhr.open('GET', aqi_url, true);

        // Set up the event handler for when the request state changes
        xhr.onreadystatechange = function() {
            // Check if the request is complete (readyState 4) and successful (status 200)

            if (xhr.readyState === 4 && xhr.status === 200) {	

                // now try parsing json
                try {
                    var data = JSON.parse(xhr.responseText);
                    // Process data
                    if ( typeof data != "undefined") {
                        // process here

                        if (typeof newrelic === "object") {
                            newrelic.addPageAction("AQ200: aqi request");
                        }

                        console.log(data);
                        aqi.timestamp = new Date();
                        aqi.aqi = data.data.aqi;


                    } else {
                        if (typeof newrelic === "object") {
                            newrelic.addPageAction("AQJSON: aqi JSON parsing error");
                        }									
                    }
                } catch (e) {
                    //console.log("json parsing error");
                    //console.log(e);
                    if (retry_count >= retry_limit) {
                        if (typeof newrelic === "object") {
                            newrelic.addPageAction("AQJSON: aqi JSON parsing error");
                        }
                    }
                }

            } else if (xhr.readyState === 4 && xhr.status !== 200) {
                //console.log("xhr state error");
                if (retry_count >= retry_limit) {
                    if (typeof newrelic === "object") {
                        newrelic.addPageAction("AQ"+xhr.status+": aqi response error "+xhr.statusText,{'errorText': xhr.statusText, 'errorThrown': xhr.status});
                    }
                } else {
                    aqi.update_aqi(retry_count+1);
                }
            }
        };
        // Send the request
        xhr.send();
    }
    
    aqi.update_aqi(0);				
    setInterval(function() {aqi.update_aqi(0)}, 5*60*1000); // update every five minutes
    
    
}		


/* background info:

https://api.waqi.info/feed/geo:40.7128;-74.0060/?token=d015cb944b2f8bb876fb513c98e6e059f466f1e3

    var spectrum = [
        { a: 0, b: "#cccccc", f: "#ffffff" },
        { a: 50, b: "#009966", f: "#ffffff" },
        { a: 100, b: "#ffde33", f: "#000000" },
        { a: 150, b: "#ff9933", f: "#000000" },
        { a: 200, b: "#cc0033", f: "#ffffff" },
        { a: 300, b: "#660099", f: "#ffffff" },
        { a: 500, b: "#7e0023", f: "#ffffff" },
    ];
 
    var i = 0;
    for (i = 0; i < spectrum.length - 2; i++) {
        if (aqi == "-" || aqi <= spectrum[i].a) break;
    }
    return $("<div/>")
        .html(aqi)
        .css("font-size", "120%")
        .css("min-width", "30px")
        .css("text-align", "center")
        .css("background-color", spectrum[i].b)
        .css("color", spectrum[i].f);


https://thenounproject.com/browse/icons/term/air-quality/





AQI Range 	Level	Health Concern
0–50	Good	Little to no risk
51–100	Moderate	May pose some risk to unusually sensitive individuals
101–150	Unhealthy for Sensitive Groups	Sensitive groups may experience health effects
151–200	Unhealthy	May cause health effects for everyone
201–300	Very Unhealthy	Increased risk of health effects for everyone
301–500	Hazardous	Health alert for everyone; emergency condition

*/