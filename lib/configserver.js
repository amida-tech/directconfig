/**
 * New node file
 */

var sh = require('execSync');
var path = require('path');

exports.putCert = function(options, filepath) {
    var script = path.join(options.pyscriptsdir, "add_certificate.py");
    var cmd = options.pycmd + " " + script + " " + filepath;
    var code = sh.run(cmd);
    return code;
};