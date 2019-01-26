"use strict"

let fs = require('fs');
let tracer = require("tracer");

let log = tracer.colorConsole({ level: "trace" }); // initialization requires it to go to trace level, can go up but not down, see https://www.npmjs.com/package/tracer
tracer.console({
  inspectOpt: {
    showHidden: true, // the object's non-enumerable properties will be shown too
    depth: 5 // tells inspect how many times to recurse while formatting the object. This is useful for inspecting large complicated objects. Defaults to 2. To make it recurse indefinitely pass null.
  }
});

tracer.setLevel("debug"); // Will start with this level
log.warning = log.warn;

exports.readJson = (path, cb) => {
  fs.readFile(require.resolve(path), (err, data) => {
  	if (err)
  	  cb(err);
  	else
  	  cb(null, JSON.parse(data));
  });
}

exports.log = log;

exports.setLevel = (traceLevel) => {
  log.warn(`Setting log level to ${traceLevel}.`);
  tracer.setLevel(traceLevel);
  return log;
};

exports.isOnline = (callback) => {
  //Quick and 'dirty' way to check if online
  require('dns').resolve('www.google.com', (err) => {
    if(err) {
      console.log("(No connection to the internet)");
      callback(false);
    }
    else {
      console.log("(You are connected to the internet)");
      callback(true);
    }
  });
};
