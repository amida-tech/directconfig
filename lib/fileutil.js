/**
 * New node file
 */

var fs = require('fs');

var errorHandler = function errorHandler(err) {
	console.log(err);
};

exports.putFile = function putFile(req, filepath, callback) {
	var data = new Buffer('');
	
	req.on('data', function(chunk) {
		data = Buffer.concat([data, chunk]);
	});
	
	req.on('end', function() {
		fs.writeFile(filepath, data, 'binary', errorHandler);
		callback(null);
	});
};

exports.getFile = function getFile(req, res, next) {
	fs.readFile('/Work/sandbox/serverout/provider.der', function(err, data) {
		res.setHeader('content-type', 'application/octet-stream');
		res.send(data);
	});
};
