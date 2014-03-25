/**
 * Updates Direct Reference Implementation configuration
 */

var sh = require('execSync');
var path = require('path');

var shutil = require('./shutil');

var _getCmd = function(options, scriptName) {
    var script = path.join(options.pyscriptsdir, scriptName);
    var cmd = options.pycmd + " " + script;
    return cmd;
};

exports.putCert = function(options, filepath) {
    var cmd = _getCmd(options, "add_certificate.py") + " " + filepath;
    var code = sh.run(cmd);
    return code;
};

exports.putTrustBundle = function(options, info) {
	var cmd = _getCmd(options, "add_trust_bundle.py") + " " + info.trustName + " " + info.trustUrl;
	var code = sh.run(cmd);
	return code;
};

exports.addAnchor = function(options, filepath, owner) {
	var cmd = _getCmd(options, "add_anchor.py") + " " + filepath + " " + owner;
	var code = sh.run(cmd);
	return code;
};

var handleCmd = function(res, cmd, actionName) {
    var result = shutil.exec(cmd, actionName);
    if (result === null) {
        res.send(200)
    } else {
        res.send(500, result);
    }
};

exports.loadPKCS12 = function(params) {
    return function(req, res, next) {
        var fp = params.getFilePath(req.params.x509BaseName + ".p12");
        var cmd = _getCmd(params.pyOptions, "add_certificate.py" + " " + fp);
        handleCmd(res, cmd, "pkcs12 file load");
    };
};

exports.reset = function(params) {
    return function(req, res, next) {
        var cmd = _getCmd(params.pyOptions, "clear_all.py");
        handleCmd(res, cmd, "configuration reset");
    };
};
