/*
 * Does it Leak?
 *
 * This scripts uses phantomjs to spawn a headless browser and check if the
 * target website is leaking requests not over https.
 *
 */
var page = new WebPage();
var unsafeurls = new Array();

function check_url(url, what) {
    if ( url.substring(0, 5) == "https" ) {
        console.log("DEBUG: Encrypted " + what + " " + url);
    } else {
        console.log("DEBUG: Found unencrypted " + what + "!");
        console.log("       URL: " + url);
        unsafeurls.push(url);
    }
}

page.onResourceRequested = function (request) {
    check_url(request.url, "request");
};

page.onResourceReceived = function (response) {
    check_url(response.url, "response");
};

page.onLoadFinished = function (status) {
    console.log("[+] Finished");
    console.log("--------------------");
    console.log("----- Results ------")
    console.log("--------------------");
    if (unsafeurls.length > 0) {
        console.log("We have detected " + unsafeurls.length + " unsafe URLs that are not being loaded over https");
        for (x in unsafeurls) {
            console.log((x + 1) + ") - " + unsafeurls[x]);
        }
    } else {
        console.log("We have not detected any leakage over non-https. All is well");
    }
    console.log("");
    phantom.exit();
};

url = phantom.args[0];
if (phantom.args.length < 1) {
    console.log("Does It Leak?");
    console.log("Usage: phantomjs doesitleak.js https://<TARGET_HOST>/");
    phantom.exit();
}
else if (url.substring(0, 5) != "https") {
    console.log("Error! URL must start with https://");
    phantom.exit();
}
else {
    console.log("[+] Scanning " + url + " for SSL leakage.");
    page.open(url);
}
