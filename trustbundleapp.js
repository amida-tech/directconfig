/**
 * New node file
 */


var express = require('express');
var app = express();

app.get('/bundle', function(req, res){
  res.sendfile("/Users/afsinustundag/Downloads/bundle.p7b");
});

app.listen(3000);