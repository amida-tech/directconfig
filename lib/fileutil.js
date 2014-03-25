/**
 * File utilities
 */

var fs = require('fs');

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

exports.fileUpload = function(params) {
    return function(req, res, next) {
        var filename = req.params.filename;
        var filepath = params.getFilePath(filename);
        res.send(filepath);
    };
};

exports.writeFileSyncUI = function(filePath, data, actionName) {
    try {
        fs.writeFileSync(filePath, data);
        console.log("..." + actionName + " successful.");
        return null;
    } catch (err) {
        console.log("..." + actionName + " failed:");
        console.log(error.stack);
        return error.stack;
    }
};
