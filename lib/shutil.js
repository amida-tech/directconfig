/**
 * Script execution utilies
 */

var sh = require('execSync');
var nimble = require('nimble');

var exec = function(cmd, actionName) {
    console.log("...executing: " + cmd);
    var result = sh.exec(cmd);
    var output = result.stdout;
    if (result.code === 0) {
        var p = output ? ':' : '.';
        console.log("..." + actionName + " succesfull" + p);
        if (output) {
            console.log(output);
        }
        return null;
    } else {
        console.log("..." + actionName + " failed:");
        if (! output) {
            output = "Unknown error.";
        }
        console.log(output);
        return output;
    }
};
exports.exec = exec;

var sleep = function(callback, duration) {
    console.log("...sleeping for " + duration/1000 + " seconds.");
    setTimeout(function() {callback();}, duration);
};
exports.sleep = sleep;

var startService = function(serviceName, port, callback) {
    var result = exec("sudo start " + serviceName, "starting " + serviceName);
    if (result !== null) {
        callback(result);
    }
    var waitPort = function waitPort(i) {
        var cmd = "sudo netstat -tpnl localhost";
        console.log("...executing: " + cmd);
        var r = sh.exec(cmd);
        var output = r.stdout;
        console.log(output);
        if (r.code !== 0) {
	    callback(output);
        } else {
	    if (output.indexOf(":" + port) > -1) {
	        callback();
            } else {
		i += 1;
                if (i === 20) {
		    callback("no port enable detected");
                } else {
		    setTimeout(function() {waitPort(i);}, 5000);
                }
            }
	}       
    };
    waitPort(0);
}

var restartDirect = function(callback) {
    nimble.series([
        function(cb) {exec("sudo stop direct-tomcat", "stop tomcat"); cb();},
        function(cb) {sleep(cb, 2000);},
        function(cb) {exec("sudo stop direct-dns", "stop dns"); cb();},
        function(cb) {sleep(cb, 2000);},
        function(cb) {exec("sudo stop direct-james", "stop james"); cb();},
        function(cb) {sleep(cb, 2000);},
        function(cb) {startService("direct-tomcat", 8081, cb);},
        function(cb) {var result = exec("sudo start direct-dns", "start dns"); cb(result);},
        function(cb) {sleep(cb, 2000);},
        function(cb) {startService("direct-james", 4555, cb)}
    ], function(errMessage) {
        callback(errMessage);
    });
};
exports.restartDirect = restartDirect;