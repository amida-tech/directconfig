/**
 * Sets command line parameters and program constants
 */

var path = require('path');

var updateExecSettings = function(params) {
	var pyOptions = Object.create(null);
	pyOptions.pyscriptsdir = path.join(__dirname, "..", "pyscripts");
	pyOptions.pycmd = "python";
	params.pyOptions = pyOptions;

	var javaOptions = Object.create(null);
	javaOptions.javajardir = path.join(__dirname, "..", "jarlib");
	javaOptions.javacmd = "java -jar";
	params.javaOptions = javaOptions;
	params.getJavaJarCmd = function(jarName) {
		var jar = path.join(javaOptions.javajardir, jarName);
		var cmd = javaOptions.javacmd + " " + jar;
		return cmd;
	};
};

var updateCmdLineArgs = function(params) {
	var outDirectory = (process.argv.length > 2) ? process.argv[2] : '/tmp';
	params.outDirectory = outDirectory;
	params.getFilePath = function(filename) {
		return path.join(outDirectory, filename);
	};
};

var updateSpecificFilePaths = function(params, outDirectory) {
	params.getPrivateKeyPath = function() {
		return path.join(outDirectory, "rsa-key.pem");
	};
};

exports.get = function() {
	var params = Object.create(null);
	updateExecSettings(params);
	updateCmdLineArgs(params);
	updateSpecificFilePaths(params, params.outDirectory);
	return params;
};
