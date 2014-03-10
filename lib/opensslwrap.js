/**
 * Wrapper around openssl calls
 */

var fs = require('fs');
var sh = require('execSync');

exports.createPrivateKey = function(settings) {
	var filePath = settings.getPrivKeyPath();
	var cmd = "openssl genrsa -out " + filePath + " 2048 --passout " + settings.passout;
	var code = sh.run(cmd);
	console.log(filePath);
	console.log(cmd);
	console.log(code);
	return code;
};

