/**
 * New node file
 */

var sh = require('execSync');
var path = require('path');

exports.putCert = function(options, filename) {
	var code = sh.run(options.pycmd + " " + options.pyscriptsdir);
	console.log("test for " + filename + " " + code + " = " + code);
};