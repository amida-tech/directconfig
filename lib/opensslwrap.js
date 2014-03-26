/**
 * Wrapper around openssl calls
 */

var fs = require('fs');
var sh = require('execSync');

var shutil = require('./shutil');
var fileutil = require('./fileutil');

var _getPKCS10ConfigFileName = function(x509Name) {
    return x509Name + "-" + "req-config";
};

var _getPKCS10FileName = function(x509Name) {
    return x509Name + "-" + "req.pem";
};

var _getX509SignConfigFileName = function(x509Name) {
    return x509Name + "-" + "sign-config";
};

var _createPKCS10ConfigFile = function(filePath, keyFilePath, info) {
    var v = "[req]\n";
    v += "default_bits = 1024\n";
    v += "default_keyfile = " + keyFilePath + "\n";
    v += "distinguished_name = req_distinguished_name\n";
    v += "prompt = no\n";
    v += "dirstring_type = nobmp\n";
    v += "\n";
    v += "[req_distinguished_name]\n";
    v += "countryName = " + info.country + "\n";
    v += "localityName = " + info.city + "\n";
    v += "organizationalUnitName = " + info.organization + "\n";
    v += "commonName = " + info.domain + "\n"; 
    v += "emailAddress = " + info.domain + "\n";
    return fileutil.writeFileSyncUI(filePath, v, "pkcs10 request config file creation");
};

var createPKCS10File = function(params, info) {
    var rcn = _getPKCS10ConfigFileName(info.filename);
    var rcp = params.getFilePath(rcn);

    var errMsg = _createPKCS10ConfigFile(rcp, pkp, info);
    if (errMsg !== null) return errMsg;

    var rn = _getPKCS10FileName(info.filename);
    var rp = params.getFilePath(rn);

    var pkp = params.getPrivateKeyPath();
    var cmd = "openssl req -new -config " + rcp + " -key " + pkp + " > " + rp;
    return shutil.exec(cmd, "pkcs10 request file creation");
};

var _createX509SignConfigFile = function(filePath, info) {
    var v = ""; 
    v += "basicConstraints = critical,CA:true\nsubjectAltName = DNS:" + info.domain + "\n";
    v += "subjectKeyIdentifier=hash\n";
    v += "authorityKeyIdentifier=keyid:always,issuer:always\n";
    return fileutil.writeFileSyncUI(filePath, v, "x509 sign config file creation");
};

var createX509File = function(params, info) {
    var cscn = _getX509SignConfigFileName(info.filename);
    var cscp = params.getFilePath(cscn);
    var errMsg = _createX509SignConfigFile(cscp, info);
    if (errMsg != null) return errMsg;

    var pkp = params.getPrivateKeyPath();

    var rn = _getPKCS10FileName(info.filename);
    var rp = params.getFilePath(rn);

    var x509p = params.getFilePath(info.filename + ".pem");

    var cmd = "openssl x509 -req -in " + rp + " -days 3650 -extfile " + cscp + " -signkey " + pkp + " -text -out " + x509p;
    var result = shutil.exec(cmd, "x509 (pem) file creation");
    if (result) {
	return result;
    }

    var x509DERp = params.getFilePath(info.filename + ".der");
    var cmdDER = "openssl x509 -in " + x509p + " -outform der -out " + x509DERp;
    return shutil.exec(cmdDER, "x509 (der) file creation");
};

exports.generatePrivateKeyFile = function(params) {
    var pkp = params.getPrivateKeyPath();
    var cmd = "openssl genrsa -out " + pkp + ' 2048 --passout pass:""';
    return shutil.exec(cmd, "private key file creation");
};

exports.generateX509 = function(params) {
    return function(req, res, next) {
        var info = req.body;
	var msgPKCS10 = createPKCS10File(params, info);
        if (msgPKCS10 !== null) {
	    res.send(500, msgPKCS10);
        }
        var msgX509 = createX509File(params, info);
        if (msgX509 !== null) {
 	    res.send(500, msgX509);
	}
        res.send(201);
   };
};

exports.generatePKCS12 = function(params) {
    return function(req, res, next) {
        var name = req.params.x509BaseName;

        var pkp = params.getPrivateKeyPath();
        var x509p = params.getFilePath(name + ".pem");
	var pkcs12p = params.getFilePath(name + ".p12");
	var cmd = "cat " + pkp + " " + x509p + " | openssl pkcs12 -export -out " + pkcs12p + ' -passout pass:""';
        var msg = shutil.exec(cmd, "pkcs12 file creation");
        if (msg) {
 	    res.send(500, msg);
	} else {
	    res.send(201);
	}
    };
};

