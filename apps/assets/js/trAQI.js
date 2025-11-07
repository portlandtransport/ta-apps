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

        return `<img src="data:PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTIwMHB0IiBoZWlnaHQ9IjEyMDBwdCIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgMTIwMCAxMjAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogPHBhdGggZD0ibTc1IDExMjVoMTEyLjVjMC02OC40MzggMTYuNjg4LTEzMy4xMiA0Ni4zMTItMTg5Ljc1bC05Ny41LTU2LjI1Yy0zOS4xODggNzMuMzEyLTYxLjMxMiAxNTcuMTItNjEuMzEyIDI0NnoiLz4KIDxwYXRoIGQ9Im0xNTUuMDYgODQ2LjM4IDk3LjUgNTYuMjVjMTUuOTM4LTI1LjEyNSAzNC42ODgtNDguMzc1IDU1LjY4OC02OS4zNzVzNDQuMjUtMzkuNzUgNjkuMzc1LTU1LjY4OGwtNTYuMjUtOTcuNWMtNjcuMTI1IDQyLjE4OC0xMjQuMTIgOTkuMTg4LTE2Ni4zMSAxNjYuMzF6Ii8+CiA8cGF0aCBkPSJtNTgxLjI1IDYwMC4zOGMtODEuOTM4IDIuODEyNS0xNTkuMTkgMjQuNTYyLTIyNy4yNSA2MC45MzhsNTYuMjUgOTcuNWM1MS4zNzUtMjYuODEyIDEwOS41LTQzLjEyNSAxNzEtNDUuOTM4eiIvPgogPHBhdGggZD0ibTg3OC42MiA2ODAuMDYtNTYuMjUgOTcuNWMyNS4xMjUgMTUuOTM4IDQ4LjM3NSAzNC42ODggNjkuMzc1IDU1LjY4OHMzOS43NSA0NC4yNSA1NS42ODggNjkuMzc1bDk3LjUtNTYuMjVjLTQyLjE4OC02Ny4xMjUtOTkuMTg4LTEyNC4xMi0xNjYuMzEtMTY2LjMxeiIvPgogPHBhdGggZD0ibTk2Ni4xOSA5MzUuMjVjMjkuNjI1IDU2LjYyNSA0Ni4zMTIgMTIxLjMxIDQ2LjMxMiAxODkuNzVoMTEyLjVjMC04OC44NzUtMjIuMTI1LTE3Mi42OS02MS4zMTItMjQ2eiIvPgogPHBhdGggZD0ibTYxOC43NSA2MDAuMzh2MTEyLjVjOS4zNzUgMC4zNzUgMTguNTYyIDEuMzEyNSAyNy41NjIgMi4yNWwxNi4xMjUtNDMuMTI1YzguNDM3NS0yMi41IDMwLjM3NS0zNy42ODggNTQuMzc1LTM3LjY4OCA1LjA2MjUgMCAxMC4zMTIgMC43NSAxNS4xODggMi4wNjI1IDI5LjA2MiA3Ljg3NSA0Ny4yNSAzNi4xODggNDIgNjUuODEybC03LjY4NzUgNDUuMzc1YzcuODc1IDMuNTYyNSAxNS41NjIgNy4xMjUgMjMuMjUgMTEuMDYybDU2LjI1LTk3LjVjLTY4LjI1LTM2LjM3NS0xNDUuMzEtNTguMTI1LTIyNy4yNS02MC45Mzh6Ii8+CiA8cGF0aCBkPSJtNzIyLjQ0IDY3Mi41NmMtMTAuMzEyLTIuODEyNS0yMSAyLjYyNS0yNC43NSAxMi43NWwtOTQuNjg4IDI1Mi41NmMzMi4yNSAwLjU2MjUgNjIuNjI1IDkuMTg3NSA4OS4wNjIgMjQuMTg4bDQ1LjM3NS0yNjUuODhjMS44NzUtMTAuNS00LjY4NzUtMjAuNjI1LTE1LTIzLjQzOHoiLz4KIDxwYXRoIGQ9Im02MDAgOTc1Yy04Mi44NzUgMC0xNTAgNjcuMTI1LTE1MCAxNTBoMzAwYzAtODIuODc1LTY3LjEyNS0xNTAtMTUwLTE1MHoiLz4KIDxwYXRoIGQ9Im0yNDMuNzUgNDY4Ljc1Yy0xMC4zMTIgMC0xOC43NSA4LjQzNzUtMTguNzUgMTguNzVzOC40Mzc1IDE4Ljc1IDE4Ljc1IDE4Ljc1aDMwMGMxMC4zMTIgMCAxOC43NS04LjQzNzUgMTguNzUtMTguNzVzLTguNDM3NS0xOC43NS0xOC43NS0xOC43NXoiLz4KIDxwYXRoIGQ9Im0xNjguNzUgNTA2LjI1YzEwLjMxMiAwIDE4Ljc1LTguNDM3NSAxOC43NS0xOC43NXMtOC40Mzc1LTE4Ljc1LTE4Ljc1LTE4Ljc1aC05My43NWMtMTAuMzEyIDAtMTguNzUgOC40Mzc1LTE4Ljc1IDE4Ljc1czguNDM3NSAxOC43NSAxOC43NSAxOC43NXoiLz4KIDxwYXRoIGQ9Im03NSAyNDMuNzVoMTMxLjI1YzEwLjMxMiAwIDE4Ljc1LTguNDM3NSAxOC43NS0xOC43NXMtOC40Mzc1LTE4Ljc1LTE4Ljc1LTE4Ljc1aC0xMzEuMjVjLTEwLjMxMiAwLTE4Ljc1IDguNDM3NS0xOC43NSAxOC43NXM4LjQzNzUgMTguNzUgMTguNzUgMTguNzV6Ii8+CiA8cGF0aCBkPSJtNzUgMzc1aDM1Ni4yNWMxMC4zMTIgMCAxOC43NS04LjQzNzUgMTguNzUtMTguNzVzLTguNDM3NS0xOC43NS0xOC43NS0xOC43NWgtMzU2LjI1Yy0xMC4zMTIgMC0xOC43NSA4LjQzNzUtMTguNzUgMTguNzVzOC40Mzc1IDE4Ljc1IDE4Ljc1IDE4Ljc1eiIvPgogPHBhdGggZD0ibTI4MS4yNSAyNDMuNzVoNDUxLjMxYzUxIDAgOTIuNDM4LTQxLjQzOCA5Mi40MzgtOTIuNDM4cy00MS40MzgtOTIuMjUtOTIuNDM4LTkyLjI1aC0zNS4wNjJjLTMwLjE4OCAwLTU0LjkzOCAyNC41NjItNTQuOTM4IDU0Ljc1czI0LjU2MiA1NC45MzggNTQuOTM4IDU0LjkzOGgzMy43NWMxMC4zMTIgMCAxOC43NS04LjQzNzUgMTguNzUtMTguNzVzLTguNDM3NS0xOC43NS0xOC43NS0xOC43NWgtMzMuNzVjLTkuNTYyNSAwLTE3LjQzOC03Ljg3NS0xNy40MzgtMTcuNDM4czcuODc1LTE3LjI1IDE3LjQzOC0xNy4yNWgzNS4wNjJjMzAuMTg4IDAgNTQuOTM4IDI0LjU2MiA1NC45MzggNTQuNzVzLTI0LjU2MiA1NC45MzgtNTQuOTM4IDU0LjkzOGgtNDUxLjMxYy0xMC4zMTIgMC0xOC43NSA4LjQzNzUtMTguNzUgMTguNzVzOC40Mzc1IDE4Ljc1IDE4Ljc1IDE4Ljc1eiIvPgogPHBhdGggZD0ibTk2MCAzMDBoMzMuNzVjMTAuMzEyIDAgMTguNzUtOC40Mzc1IDE4Ljc1LTE4Ljc1cy04LjQzNzUtMTguNzUtMTguNzUtMTguNzVoLTMzLjc1Yy05LjU2MjUgMC0xNy40MzgtNy44NzUtMTcuNDM4LTE3LjQzOHM3Ljg3NS0xNy4yNSAxNy40MzgtMTcuMjVoMzUuMDYyYzMwLjE4OCAwIDU0LjkzOCAyNC41NjIgNTQuOTM4IDU0Ljc1cy0yNC41NjIgNTQuOTM4LTU0LjkzOCA1NC45MzhoLTQ4OC44MWMtMTAuMzEyIDAtMTguNzUgOC40Mzc1LTE4Ljc1IDE4Ljc1czguNDM3NSAxOC43NSAxOC43NSAxOC43NWg0ODguODFjNTEgMCA5Mi40MzgtNDEuNDM4IDkyLjQzOC05Mi40MzhzLTQxLjQzOC05Mi4yNS05Mi40MzgtOTIuMjVoLTM1LjA2MmMtMzAuMTg4IDAtNTQuOTM4IDI0LjU2Mi01NC45MzggNTQuNzVzMjQuNTYyIDU0LjkzOCA1NC45MzggNTQuOTM4eiIvPgogPHBhdGggZD0ibTYzNy41IDQ2OC43NWMtMTAuMzEyIDAtMTguNzUgOC40Mzc1LTE4Ljc1IDE4Ljc1czguNDM3NSAxOC43NSAxOC43NSAxOC43NWg0MTMuODFjMzAuMTg4IDAgNTQuOTM4IDI0LjU2MiA1NC45MzggNTQuOTM4cy0yNC41NjIgNTQuNzUtNTQuOTM4IDU0Ljc1aC0zNS4wNjJjLTkuNTYyNSAwLTE3LjQzOC03Ljg3NS0xNy40MzgtMTcuMjVzNy44NzUtMTcuNDM4IDE3LjQzOC0xNy40MzhoMzMuNzVjMTAuMzEyIDAgMTguNzUtOC40Mzc1IDE4Ljc1LTE4Ljc1cy04LjQzNzUtMTguNzUtMTguNzUtMTguNzVoLTMzLjc1Yy0zMC4xODggMC01NC45MzggMjQuNTYyLTU0LjkzOCA1NC45MzhzMjQuNTYyIDU0Ljc1IDU0LjkzOCA1NC43NWgzNS4wNjJjNTEgMCA5Mi40MzgtNDEuNDM4IDkyLjQzOC05Mi4yNXMtNDEuNDM4LTkyLjQzOC05Mi40MzgtOTIuNDM4eiIvPgo8L3N2Zz4=">`;
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