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
app.post('/loadX509/:x509BaseName', configserver.loadX509(params));
app.post('/loadPKCS12/:x509BaseName', configserver.loadPKCS12(params));
app.post('/loadAnchor', configserver.loadAnchor(params));

app.post('/genX509', openssl.generateX509(params));
app.post('/genPKCS12/:x509BaseName', openssl.generatePKCS12(params));

app.post('/trustbundle', function(req, res, next) {
	var info = req.body;
	configserver.putTrustBundle(params.pyoptions, info);
	res.send(200);
});

var result = openssl.generatePrivateKeyFile(params);
if (result === null) {
    app.listen(3000);
}
