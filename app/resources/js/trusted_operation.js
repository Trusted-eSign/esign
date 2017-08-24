"use strict";

const fs = require("fs");

function getFileCoding(filePath) {
  let res;
  const fd = fs.openSync(filePath, "r");
  const buffer = new Buffer(2);

  fs.readSync(fd, buffer, 0, 2, 0);

  if (buffer.toString("utf8", 0, 2) === "--") {
    res = trusted.DataFormat.PEM;
  } else {
    res = trusted.DataFormat.DER;
  }
  fs.closeSync(fd);
  return res;
}


function isEncryptedKey(path) {
  let res;
  const encPrivkeyHeader = "-----BEGIN ENCRYPTED PRIVATE KEY-----";
  const lengthForRead = encPrivkeyHeader.length;

  const fd = fs.openSync(path, "r");
  const buffer = new Buffer(lengthForRead);

  fs.readSync(fd, buffer, 0, lengthForRead, 0);

  if (buffer.toString("utf8", 0, lengthForRead) === encPrivkeyHeader) {
    res = 1;
  } else {
    res = 0;
  }
  fs.closeSync(fd);
  return res;
}
