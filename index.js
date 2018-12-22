"use strict"

let cmd = require('commander');
let cli = require('node-cmd');
let helpers = require('./lib/helpers');
let log = helpers.log;

let _settings;

function reset(){
  log.info("Called reset...");
  _settings = undefined;
}

//Might be deprecated later
function readSettingsCallback(cb) {
  log.info("Called readSettingsCallback...");
  helpers.readJson('../.sailias', (err, settings) => {
  	if(!err){
  	  _settings = settings;
  	  log.debug(settings);
  	  cb(null, settings);
  	} else {
  	  cb(err);
  	}
  });
}

//Uses Promises
function readSettings() {
  log.info("Called readSettings (promise)...");
  return new Promise((resolve, reject) => {
    readSettingsCallback((err, settings) => {
  	  if(!err) {
  	  	log.debug('Resolving promise');
  	    resolve(settings);
  	  } else {
  	  	log.debug('Rejecting promise');
  	    reject(err);
  	  }
    });
  });
}

//Uses Promises
function clone() {
  log.info("Called clone (promise)...");
  return new Promise((resolve, reject) => {
    readSettings().then((settings) => {
      preClone(settings).then(() => {

      });
  	}, (error) => {
  	  reject(error);
  	});
  });
}

function preClone(settings) {
  log.info("Called preClone...");
  return executeStep(settings, "pre-clone");
}

//Uses Promises
function executeStep(settings, step) {
  log.info("Called executeStep (promise)...");
  return new Promise((resolve, reject) => {
    let cmd = settings[step]["step"]
      .replace("<source>", settings.source)
      .replace("<sink>", settings.sink);
    let verify = settings[step].verify
      .replace("<source>", settings.source)
      .replace("<sink>", settings.sink);
    log.info(`Executing '${step}' command: '${cmd}'...`);
    executeCmd(cmd, resolve, reject, verify);
  });  
}

function executeCmd(cmd, resolve, reject, verifyCmd = '') {
  log.info("Called executeCmd (promise)...");
  cli.get(`${cmd}
  	${verifyCmd}`, (err, data, stderr) => {
  	console.log("TEST!")
    if (err) {
      log.err(err);
      reject(stderr);
    } else {
      log.info(data);
      //Assumes everything is well
      resolve(data);
    }
  });
}

function getSettings() {
  log.info("Called getSettings...");
  if(!_settings) {
  	throw new Error('Settings are not yet initialized, call readSettings() first!');
  }
  log.debug(_settings);
  return _settings;
}

exports.readSettingsCallback = readSettingsCallback;
exports.readSettings = readSettings;
exports.getSettings = getSettings;
exports.clone = clone;
exports.reset = reset;

