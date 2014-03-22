/**
 * Wrapper around openssl calls
 */

var fs = require('fs');
var sh = require('execSync');

exports.generatePrivateKeyFile = function(filepath, passphrase) {
	var cmd = "openssl genrsa -out " + filepath + " 2048 --passout pass:" + passphrase;
	var code = sh.run(cmd);
	return code;
};

exports.createPrivateKey = function(settings) {
	var filePath = settings.getPrivateKeyPath();
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

var createPKCS10 = function(settings, info) {
	var kPath = settings.getPrivateKeyPath();
	var rPath = settings.getCertRequestConfigPath();
	var pPath = settings.getPKCS10Path();
	_createReqConfigFile(rPath, kPath, info);
	var cmd = "openssl req -new -config " + rPath + " -key " + kPath + " > " + pPath;
	var code = sh.run(cmd);
	return code;
};
exports.createPKCS10 = createPKCS10;

var _createSignConfigFile = function(filePath, info) {
	var v = "basicConstraints = critical,CA:true\nsubjectAltName = DNS:";
	v += info.domain + "\nsubjectKeyIdentifier=hash\nauthorityKeyIdentifier=keyid:always,issuer:always\n";
	fs.writeFileSync(filePath, v);
};

var createX509 = function(settings, info) {
	var kPath = settings.getPrivateKeyPath();
	var cPath = settings.getSignConfigPath();
	var rPath = settings.getFilePath(info.request);
	var oPath = settings.getFilePath(info.x509 + ".pem");
	_createSignConfigFile(cPath, info);
	var cmd = "openssl x509 -req -in " + rPath + " -days 3650 -extfile " + cPath + " -signkey " + kPath + " -text -out " + oPath;
	var code = sh.run(cmd);
	var d = settings.getFilePath(info.x509 + ".der");
	var cmd2 = "openssl x509 -in " + oPath + " -outform der -out " + d;
	var code2 = sh.run(cmd2);
	return code;
};
exports.createX509 = createX509;

var createPKCS12 = function(settings, info) {
	var k = settings.getPrivateKeyPath();
	var x = settings.getFilePath(info.x509 + ".pem");
	var r = settings.getFilePath(info.pkcs12 + ".p12");
	var cmd = "cat " + k + " " + x + " | openssl pkcs12 -export -out " + r + " -passout pass:" + settings.passout;
	var code = sh.run(cmd);
	return code;
};
exports.createPKCS12 = createPKCS12;

exports.generateX509 = function(params) {
	return function(req, res, next) {
		var info = req.body;
		createPKCS10(params, info);
		createX509(params, info);
		res.send(200);
	};
};

exports.generatePKCS12 = function(params) {
	return function(req, res, next) {
		var info = req.body;
		createPKCS12(params, info);
		res.send(200);
	};
};
