/**
 * New node file
 */

var fs = require('fs');

var errorHandler = function errorHandler(err) {
	console.log(err);
};

exports.putFile = function putFile(req, res, next) {
	console.log('in putfile');

	var data = new Buffer('');
	
	req.on('data', function(chunk) {
		data = Buffer.concat([data, chunk]);
	});
	
	req.on('end', function() {
		fs.writeFile('/Work/sandbox/serverin/patient.der', data, 'binary', errorHandler);
		res.send(200);
	});
};

exports.getFile = function getFile(req, res, next) {
	fs.readFile('/Work/sandbox/serverout/provider.der', function(err, data) {
		res.setHeader('content-type', 'application/octet-stream');
		res.send(data);
	});
};
