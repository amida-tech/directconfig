/**
 * Key server generates and provides key files to the 
 */

var restify = require('restify');

var fileutil = require("./lib/fileutil");

var server = restify.createServer();

var keyDirectory = '/opt/direct/certificates';
var logDirectory = '/var/log/upstart/direct-config.log';

server.put('/certificate', fileutil.putFile);
server.get('/certificate', fileutil.getFile);

server.listen(3000);