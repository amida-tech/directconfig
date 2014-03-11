/**
 * Key server generates and provides key files to the 
 */

var restify = require('restify');
var path = require('path');
var fs = require('fs');

var fileutil = require("./lib/fileutil");
var configserver = require("./lib/configserver");
var openssl = require("./lib/opensslwrap");

var server = restify.createServer();

var settings = {
	pyoptions: {
		pyscriptsdir: path.join(__dirname, "pyscripts"),
		pycmd: "python"
	},
	certDir: (process.argv.length > 2) ? process.argv[2] : '/opt/direct/certificates',
	passout: (process.argv.length > 3) ? process.argv[3] : 'pass:""',
	privKeyFilename: "drsa-key.pem",
	getPrivKeyPath: function() {
		return path.join(this.certDir, this.privKeyFilename);
	},
	getReqConfigFilePath: function() {
		return path.join(this.certDir, "dreq-config");
	},
	getPKCS10FilePath: function() {
		return path.join(this.certDir, "dreq.pem");
	}
};

server.post('/file/:filename', function(req, res, next) {
	var filepath = path.join(settings.certDir, req.params.filename);
    fileutil.putFile.call(this, req, filepath, function(error) {
        res.send(200);
	});
});

server.get('/file/:filename', function(req, res, next) {
	var filepath = path.join(settings.certDir, req.params.filename);
	fs.readFile(filepath, function(err, data) {
		res.setHeader('content-type', 'application/octet-stream');
		res.send(data);
	});
});

server.post('/cert/:filename', function(req, res, next) {
	var filepath = path.join(settings.certDir, req.params.filename);
	configserver.putCert(settings.pyoptions, filepath);
	res.send(200);
});

server.del('/reset', function(req, res, next) {
	configserver.clearAll(settings.pyoptions);
	res.send(200);
});

server.post('/pkcs10', restify.bodyParser({mapParams: false}), function(req, res, next) {
	var info = req.body;
	openssl.createPKCS10File(settings, info);
	res.send(200);
	next();
});

server.get('/cert/:filename', fileutil.getFile);

openssl.createPrivateKey(settings);
server.listen(3000);
