/**
 * Key server generates and provides key files to the 
 */

var restify = require('restify');
var path = require('path');

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
	privKeyFilename: "rsa-key.pem",
	getPrivKeyPath: function() {
		return path.join(this.certDir, this.privKeyFilename);
	}
};

server.put('/cert/:filename', function(req, res, next) {
	var filepath = path.join(settings.certDir, req.params.filename);
    fileutil.putFile.call(this, req, filepath, function(error) {
        configserver.putCert(settings.pyoptions, filepath);
        res.send(200);
	});
});

server.del('/reset', function(req, res, next) {
	configserver.clearAll(settings.pyoptions);
	res.send(200);
});

server.get('/cert/:filename', fileutil.getFile);

openssl.createPrivateKey(settings);
server.listen(3000);
