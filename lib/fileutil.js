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
		fs.writeFileSync(filepath, data, 'binary', errorHandler);
		callback(null);
	});
};

exports.fileDownload = function(params) {
	return function(req, res, next) {
		var filename = req.params.filename;
		var filepath = params.getFilePath(filename);
	
		var data = new Buffer('');
		req.on('data', function(chunk) {
			data = Buffer.concat([data, chunk]);
		});
		req.on('error', function(err) {
			res.send(500);
		});
		req.on('end', function() {
			try {
				fs.writeFileSync(filepath, data, 'binary');
				res.send(201);
			} catch (err) {
				res.send(500);
			}
		});
	};
};