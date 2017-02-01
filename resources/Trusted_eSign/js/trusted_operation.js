'use strict';

var fs = require('fs');
var trusted = require('trusted-crypto');

function getFileCoding(filePath) {
  var res;
  var fd = fs.openSync(filePath, 'r');
  var buffer = new Buffer(2);
  fs.readSync(fd, buffer, 0, 2, 0);
       
  if(buffer.toString('utf8', 0, 2)  === '--'){  
    res = trusted.DataFormat.PEM;
  } else {
    res =  trusted.DataFormat.DER;
  }
  fs.closeSync(fd); 
  return res;
}


function isEncryptedKey(path) {
    "use strict";

    var res;
    var privkeyHeader = "-----BEGIN PRIVATE KEY-----";
    var encPrivkeyHeader = "-----BEGIN ENCRYPTED PRIVATE KEY-----";
    var lengthForRead = encPrivkeyHeader.length;

    var fd = fs.openSync(path, "r");
    var buffer = new Buffer(lengthForRead);

    fs.readSync(fd, buffer, 0, lengthForRead, 0);

    if (buffer.toString("utf8", 0, lengthForRead)  === encPrivkeyHeader) {
        res = 1;
    } else {
        res =  0;
    }
    fs.closeSync(fd);
    return res;
}