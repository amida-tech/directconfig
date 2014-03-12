/**
 * New node file
 */

var sh = require('execSync');
var path = require('path');

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

exports.clearAll = function(options) {
    var cmd = _getCmd(options, "clear_all.py");
    var code = sh.run(cmd);
    return code;
};