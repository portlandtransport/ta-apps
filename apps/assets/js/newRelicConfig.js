// extra parameters to pass to New Relic 
function getParameterByName( name )
    {
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( window.location.href );
    if( results == null )
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
    }
var applianceId = getParameterByName("appl[id]");
var applianceParentName = getParameterByName("option[parentname]");
if (applianceParentName.length < 5 || applianceParentName == "undefined") {
    applianceParentName = applianceId;
}
if (applianceId.length > 0) {
    console.log("Appliance ID: "+applianceId+" "+applianceId.length);
    newrelic.setCustomAttribute('applianceId', applianceId);
    newrelic.setCustomAttribute('applianceName', applianceParentName);
} else {
    /* get the IP Address of user */
    jQuery(document).ready( function() {
        jQuery.getJSON("https://api.ipify.org?format=json",
            function (data) {
                newrelic.setCustomAttribute('applianceId', data.ip);
                newrelic.setCustomAttribute('applianceName', data.ip);
                console.log("Appliance IP: "+data.ip);
            })
    });
}
if (document.domain == "dev.transitappliance.com") {
    newrelic.setCustomAttribute('applianceTier', 'development');
} else {
    newrelic.setCustomAttribute('applianceTier', 'production');
}
newrelic.setCustomAttribute('applianceApplication', trApplicationName);
newrelic.addPageAction("ST1: Application Start");

