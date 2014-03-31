/**
 * Updates Direct Reference Implementation configuration
 */

var sh = require('execSync');
var path = require('path');
var nimble = require('nimble');

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

var handleCmd = function(res, cmd, actionName) {
    var result = shutil.exec(cmd, actionName);
    if (result === null) {
        res.send(200);
    } else {
        res.send(500, result);
    }
};

var handleCmds = function(res, cmds, actionNames) {
    var n  = cmds.length;
    for (var i=0; i<n; ++i) {
        var result = shutil.exec(cmds[i], actionNames[i]);
        if (result !== null) {
            res.send(500, result);
            return false;
        }
    }
    return true;
};

exports.loadAnchor = function(params) {
    return function(req, res, next) {
	var info = req.body;
        var fp = params.getFilePath(info.filename);
	var cmd = _getCmd(params.pyOptions, "add_anchor.py" + " " + fp + " " + info.owner);
        handleCmd(res, cmd, "anchor file load");
    };
};

exports.loadX509 = function(params) {
    return function(req, res, next) {
        var fp = params.getFilePath(req.params.x509BaseName + ".der");
        var cmd = _getCmd(params.pyOptions, "add_certificate.py" + " " + fp);
        handleCmd(res, cmd, "x509 file load");
    };
};

exports.loadPKCS12 = function(params) {
    return function(req, res, next) {
        var fp = params.getFilePath(req.params.x509BaseName + ".p12");
        var cmd = _getCmd(params.pyOptions, "add_certificate.py" + " " + fp);
        handleCmd(res, cmd, "pkcs12 file load");
    };
};

var startService = function(serviceName, port, callback) {
    var result = shutil.exec("sudo start " + serviceName, "starting " + serviceName);
    if (result !== null) {
        callback(new Error(result));
    }
    var cmd = "netstat -tpnl localhost | grep " + port;
    var waitPort = function waitPort(callback, i) {
        var result = sh.exec(cmd);
        var output = result.stdout;
        if (result.code !== 0) {
	    callback(output);
        } else {
	    if (output.indexOf(port) > -1) {
	        callback();
            } else {
		i += 1;
                if (i == 12) {
		    callback(new Error("no port enable detected"));
                } else {
		    setTimeout(function() {waitPort(callback, i);}, 2000);
                }
            }
	}       
    };
    waitPort(callback, 0);
}

exports.reset = function(params) {
    return function(req, res, next) {
        console.log("Here I am ");
        var cmds = [
            //_getCmd(params.pyOptions, "clear_all.py"),
            //"sudo stop direct-tomcat", "sudo stop direct-dns", "sudo stop direct-james",
            params.getJavaJarCmd("JCSFlush.jar")]

           shutil.exec(cmd, actionName);
        var actionNames = ["clear configurations", "stop tomcat", "stop dns", "stop james", "reset jcs cache"];
        var result = handleCmds(res, cmds, actionNames);
        if (result) {
            nimble.series([
                function(callback) {startService("direct-tomcat", 8081, callback);},
                function(callback) {setTimeout(function() {sh.exec("start direct-dns"); callback();}, 2000)}, 	
                function(callback) {startService("direct-james", 4555, callback);}
            ], function(err) {
	        if (err) {
                    res.send(500, err);
		} else {
                    res.send(200);
		}
            });
        } else {
	    res.send(500, result);
        }
    };
};
