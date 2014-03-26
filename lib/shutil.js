/**
 * Script execution utilies
 */

var sh = require('execSync');

exports.exec = function(cmd, actionName) {
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

