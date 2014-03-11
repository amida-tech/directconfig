/**
 * Wrapper around openssl calls
 */

var fs = require('fs');
var sh = require('execSync');

exports.createPrivateKey = function(settings) {
	var filePath = settings.getPrivKeyPath();
	var cmd = "openssl genrsa -out " + filePath + " 2048 --passout pass:" + settings.passout;
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

exports.createPKCS10 = function(settings, info) {
	var kPath = settings.getPrivKeyPath();
	var rPath = settings.getReqConfigFilePath();
	var pPath = settings.getPKCS10FilePath();
	_createReqConfigFile(rPath, kPath, info);
	var cmd = "openssl req -new -config " + rPath + " -key " + kPath + " > " + pPath;
	var code = sh.run(cmd);
	return code;
};

var _createSignConfigFile = function(filePath, info) {
	var v = "basicConstraints = critical,CA:true\nsubjectAltName = DNS:";
	v += info.domain + "\nsubjectKeyIdentifier=hash\nauthorityKeyIdentifier=keyid:always,issuer:always\n";
	fs.writeFileSync(filePath, v);
};

exports.createX509 = function(settings, info) {
	var kPath = settings.getPrivKeyPath();
	var cPath = settings.getSignConfigFilePath();
	var rPath = settings.getPath(info.request);
	var oPath = settings.getPath(info.x509 + ".pem");
	_createSignConfigFile(cPath, info);
	var cmd = "openssl x509 -req -in " + rPath + " -days 3650 -extfile " + cPath + " -signkey " + kPath + " -text -out " + oPath;
	var code = sh.run(cmd);
	var d = settings.getPath(info.x509 + ".der");
	var cmd2 = "openssl x509 -in " + oPath + " -outform der -out " + d;
	var code2 = sh.run(cmd2);
	return code;
};

exports.createPKCS12 = function(settings, info) {
	var k = settings.getPrivKeyPath();
	var x = settings.getPath(info.x509 + ".pem");
	var r = settings.getPath(info.pkcs12 + ".p12");
	var cmd = "cat " + k + " " + x + " | openssl pkcs12 -export -out " + r + " -passout pass:" + settings.passout;
	var code = sh.run(cmd);
	return code;
};

