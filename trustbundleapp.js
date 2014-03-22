/**
 * Runs on Trust Bundle Publishing server
 */

var express = require('express');
var path = require('path');
var fs = require('fs');
var sh = require('execSync');
var http = require('http');
var https = require('https');

var runparams = require("./lib/runparams");
var fileutil = require("./lib/fileutil");
var openssl = require("./lib/opensslwrap");

var app = express();

var params = runparams.get();

app.use(express.json());

app.post('/file/:filename', fileutil.fileDownload(params));
app.post('/x509', openssl.generateX509(params));
app.post('/pkcs12', openssl.generatePKCS12(params));

app.post('/genbundle', function(req, res, next) {
	var info = req.body;
	var sign = info.sign;
	var cmd = params.getJavaJarCmd("TrustBundler.jar");
	cmd += " " + params.outDirectory + " " + params.outDirectory + " ";
	cmd += sign ? "bundle.p7m" : "bundle.p7b";
	if (sign) {
		var certificatePath = params.getFilePath(info.pkcs12 + ".p12");
		cmd += " -p " + params.passPhrase + " -c " + certificatePath;
	}
	console.log(cmd);
	var code = sh.exec(cmd);
	console.log(code);
	res.send(200);
});

app.post('/startunsigned', function(req, res, next) {
	var info = req.body;
	var appSigned = express();
	appSigned.get('/', function(req, res, next) {
		var filePath = params.getFilePath("bundle.p7b");
		res.sendfile(filePath);
	});
	var options = Object.create(null);
	options.passphrase = params.passPhrase;
	var keyPath = params.getPrivateKeyPath();
	var key = fs.readFileSync(keyPath);
	options.key = key;
	var certPath = params.getFilePath(info.x509 + ".pem");
	var cert = fs.readFileSync(certPath);
	options.cert = cert;
	https.createServer(options, appSigned).listen(3443);
	res.send(200);
});

app.post('/startsigned', function(req, res, next) {
	var appUnsigned = express();
	appUnsigned.get('/', function(req, res, next) {
		var filePath = params.getFilePath("bundle.p7m");
		res.sendfile(filePath);
	});
	http.createServer(appUnsigned).listen(3080);
	res.send(200);
});

openssl.generatePrivateKeyFile(params.getPrivateKeyPath(), params.passPhrase);
app.listen(3000);