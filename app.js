/**
 * Key server generates and provides key files to the 
 */

var express = require('express');
var restify = require('restify');
var path = require('path');
var fs = require('fs');

var fileutil = require("./lib/fileutil");
var configserver = require("./lib/configserver");
var openssl = require("./lib/opensslwrap");
var runparams = require("./lib/runparams");

var app = express();

var params = runparams.get();

app.use(express.json());

app.post('/file/:filename', fileutil.fileDownload(params));
app.get('/file/:filename', fileutil.fileUpload(params));

app.del('/reset', configserver.reset(params));
app.post('/loadPKCS12/:x509BaseName', configserver.loadPKCS12(params));

app.post('/genX509', openssl.generateX509(params));
app.post('/genPKCS12/:x509BaseName', openssl.generatePKCS12(params));

app.post('/cert', function(req, res, next) {
	var info = req.body;
	var filepath = path.join(params.outDirectory, info.filename);
	configserver.putCert(params.pyoptions, filepath);
	res.send(200);
});

app.post('/anchor', function(req, res, next) {
	var info = req.body;
	var filepath = path.join(params.outDirectory, info.filename);
        configserver.addAnchor(params.pyoptions, filepath, info.owner);
	res.send(200);
});

app.post('/trustbundle', function(req, res, next) {
	var info = req.body;
	configserver.putTrustBundle(params.pyoptions, info);
	res.send(200);
});

var result = openssl.generatePrivateKeyFile(params);
if (result === null) {
    app.listen(3000);
}
