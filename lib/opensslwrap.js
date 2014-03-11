/**
 * Wrapper around openssl calls
 */

var fs = require('fs');
var sh = require('execSync');

exports.createPrivateKey = function(settings) {
	var filePath = settings.getPrivKeyPath();
	var cmd = "openssl genrsa -out " + filePath + " 2048 --passout " + settings.passout;
	var code = sh.run(cmd);
	return code;
};

var _createReqConfigFile = function(filePath, keyFilePath, info) {
	var v = "[req]\ndefault_bits = 1024\ndefault_keyfile = " + keyFilePath;
	v += "\ndistinguished_name = req_distinguished_name\nprompt = no\ndirstring_type = nobmp\n\n";
	v += "[req_distinguished_name]\ncountryName = " + info.country;
	v += "\nlocalityName = " + info.city + "\norganizationalUnitName = " + info.organization;
	v += "\ncommonName = " + info.domain + "\nemailAddress = " + info.domain + "\n";
	fs.writeFileSync(filePath, v);
};

exports.createPKCS10File = function(settings, info) {
	var kPath = settings.getPrivKeyPath();
	var rPath = settings.getReqConfigFilePath();
	var pPath = settings.getPKCS10FilePath();
	_createReqConfigFile(rPath, kPath, info);
	var cmd = "openssl req -new -config " + rPath + " -key " + kPath + " > " + pPath;
	var code = sh.run(cmd);
	return code;
};

