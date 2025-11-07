function trAQI(options) { 
    
    // ensure this is called as constructor
    
    if (!(this instanceof trAQI)) {
        return new trAQI(options);
    }
    
    var aqi = this;
    
    this.timestamp = undefined;
    this.api_key = undefined;
    this.tier_data = undefined;

    this.spectrum = [
        { a: 0, b: "#cccccc", f: "#ffffff", t: "Header row only" },
        { a: 50, b: "#009966", f: "#ffffff", t: "Good" },
        { a: 100, b: "#ffde33", f: "#000000", t: "Moderate" },
        { a: 150, b: "#ff9933", f: "#000000", t: "Unhealthy for Sensitive Groups" },
        { a: 200, b: "#cc0033", f: "#ffffff", t: "Unhealthy" },
        { a: 300, b: "#660099", f: "#ffffff", t: "Very Unhealthy" },
        { a: 500, b: "#7e0023", f: "#ffffff", t: "Hazardous" },
    ];
            

    // accessors
    this.get_summary_forecast = function() {
        return aqi.summary;
    }
    
    this.get_icon = function() {

        return `
           <img src="data:image/svg+xml;utf8, <svg width="1200pt" height="1200pt" version="1.1" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg">
            <path stroke="currentColor" d="m75 1125h112.5c0-68.438 16.688-133.12 46.312-189.75l-97.5-56.25c-39.188 73.312-61.312 157.12-61.312 246z"/>
            <path stroke="currentColor" d="m155.06 846.38 97.5 56.25c15.938-25.125 34.688-48.375 55.688-69.375s44.25-39.75 69.375-55.688l-56.25-97.5c-67.125 42.188-124.12 99.188-166.31 166.31z"/>
            <path stroke="currentColor" d="m581.25 600.38c-81.938 2.8125-159.19 24.562-227.25 60.938l56.25 97.5c51.375-26.812 109.5-43.125 171-45.938z"/>
            <path stroke="currentColor" d="m878.62 680.06-56.25 97.5c25.125 15.938 48.375 34.688 69.375 55.688s39.75 44.25 55.688 69.375l97.5-56.25c-42.188-67.125-99.188-124.12-166.31-166.31z"/>
            <path stroke="currentColor" d="m966.19 935.25c29.625 56.625 46.312 121.31 46.312 189.75h112.5c0-88.875-22.125-172.69-61.312-246z"/>
            <path stroke="currentColor" d="m618.75 600.38v112.5c9.375 0.375 18.562 1.3125 27.562 2.25l16.125-43.125c8.4375-22.5 30.375-37.688 54.375-37.688 5.0625 0 10.312 0.75 15.188 2.0625 29.062 7.875 47.25 36.188 42 65.812l-7.6875 45.375c7.875 3.5625 15.562 7.125 23.25 11.062l56.25-97.5c-68.25-36.375-145.31-58.125-227.25-60.938z"/>
            <path stroke="currentColor" d="m722.44 672.56c-10.312-2.8125-21 2.625-24.75 12.75l-94.688 252.56c32.25 0.5625 62.625 9.1875 89.062 24.188l45.375-265.88c1.875-10.5-4.6875-20.625-15-23.438z"/>
            <path stroke="currentColor" d="m600 975c-82.875 0-150 67.125-150 150h300c0-82.875-67.125-150-150-150z"/>
            <path stroke="currentColor" d="m243.75 468.75c-10.312 0-18.75 8.4375-18.75 18.75s8.4375 18.75 18.75 18.75h300c10.312 0 18.75-8.4375 18.75-18.75s-8.4375-18.75-18.75-18.75z"/>
            <path stroke="currentColor" d="m168.75 506.25c10.312 0 18.75-8.4375 18.75-18.75s-8.4375-18.75-18.75-18.75h-93.75c-10.312 0-18.75 8.4375-18.75 18.75s8.4375 18.75 18.75 18.75z"/>
            <path stroke="currentColor" d="m75 243.75h131.25c10.312 0 18.75-8.4375 18.75-18.75s-8.4375-18.75-18.75-18.75h-131.25c-10.312 0-18.75 8.4375-18.75 18.75s8.4375 18.75 18.75 18.75z"/>
            <path stroke="currentColor" d="m75 375h356.25c10.312 0 18.75-8.4375 18.75-18.75s-8.4375-18.75-18.75-18.75h-356.25c-10.312 0-18.75 8.4375-18.75 18.75s8.4375 18.75 18.75 18.75z"/>
            <path stroke="currentColor" d="m281.25 243.75h451.31c51 0 92.438-41.438 92.438-92.438s-41.438-92.25-92.438-92.25h-35.062c-30.188 0-54.938 24.562-54.938 54.75s24.562 54.938 54.938 54.938h33.75c10.312 0 18.75-8.4375 18.75-18.75s-8.4375-18.75-18.75-18.75h-33.75c-9.5625 0-17.438-7.875-17.438-17.438s7.875-17.25 17.438-17.25h35.062c30.188 0 54.938 24.562 54.938 54.75s-24.562 54.938-54.938 54.938h-451.31c-10.312 0-18.75 8.4375-18.75 18.75s8.4375 18.75 18.75 18.75z"/>
            <path stroke="currentColor" d="m960 300h33.75c10.312 0 18.75-8.4375 18.75-18.75s-8.4375-18.75-18.75-18.75h-33.75c-9.5625 0-17.438-7.875-17.438-17.438s7.875-17.25 17.438-17.25h35.062c30.188 0 54.938 24.562 54.938 54.75s-24.562 54.938-54.938 54.938h-488.81c-10.312 0-18.75 8.4375-18.75 18.75s8.4375 18.75 18.75 18.75h488.81c51 0 92.438-41.438 92.438-92.438s-41.438-92.25-92.438-92.25h-35.062c-30.188 0-54.938 24.562-54.938 54.75s24.562 54.938 54.938 54.938z"/>
            <path stroke="currentColor" d="m637.5 468.75c-10.312 0-18.75 8.4375-18.75 18.75s8.4375 18.75 18.75 18.75h413.81c30.188 0 54.938 24.562 54.938 54.938s-24.562 54.75-54.938 54.75h-35.062c-9.5625 0-17.438-7.875-17.438-17.25s7.875-17.438 17.438-17.438h33.75c10.312 0 18.75-8.4375 18.75-18.75s-8.4375-18.75-18.75-18.75h-33.75c-30.188 0-54.938 24.562-54.938 54.938s24.562 54.75 54.938 54.75h35.062c51 0 92.438-41.438 92.438-92.25s-41.438-92.438-92.438-92.438z"/>
            </svg>">`;
    }
    
    this.get_aqi = function() {
        return aqi.aqi;
    }

    this.get_aqi_label = function() {
        return aqi.tier_data.t;
    }

    this.get_aqi_background_color = function() {
        return aqi.tier_data.b;
    }

    this.get_aqi_text_color = function() {
        return aqi.tier_data.f;
    }

    this.get_tier_data = function(value) {
        var i = 0;
        if (value >= 500) return this.spectrum[6];
        for (i = 0; i < this.spectrum.length - 2; i++) {
            if (value == "-" || value < this.spectrum[i].a) break;
        }
        return this.spectrum[i];
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
                            //newrelic.addPageAction("AQ200: aqi request");
                        }

                        aqi.timestamp = new Date();
                        aqi.aqi = data.data.aqi;
                        aqi.tier_data = aqi.get_tier_data(aqi.aqi);


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