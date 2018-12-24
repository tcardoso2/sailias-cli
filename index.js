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
  if(!_settings) {
    helpers.readJson('../.sailias', (err, settings) => {
    	if(!err){
  	    _settings = settings;
  	    log.debug(settings);
  	    cb(null, settings);
  	  } else {
  	    cb(err);
  	  }
    });
  } else {
  	cb(null, _settings);
  }
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
  	  	log.debug(`Rejecting promise: ${err}`);
  	    reject(err);
  	  }
    });
  });
}

//Uses Promises - clone needs to be redesigned I'm repeating the read settings, see the implementation of copy
function clone() {
  log.info("Called clone (promise)...");
  return new Promise((resolve, reject) => {
    readSettings().then((settings) => {
      preClone(settings).then(() => {
        copy(settings).then(() => {
        });
      });
  	}, (error) => {
  	  reject(error);
  	});
  });
}

function copy(settings) {
  log.info("Called copy...");
  return executeStep(settings, "copy");
}

function remove(settings) {
  log.info("Called remove...");
  return executeStep(settings, "remove");
}

function preClone(settings) {
  log.info("Called preClone...");
  return executeStep(settings, "pre-clone");
}

//Uses Promises
function executeStep(settings, step) {
  log.info(`Called executeStep (promise) for step "${step}"...`);
  return new Promise((resolve, reject) => {
  	if (settings[step]) {
      let cmd = settings[step]["step"]
        .replace("<source>", settings.source)
        .replace("<sink>", settings.sink);
      let verify = settings[step].verify
        .replace("<source>", settings.source)
        .replace("<sink>", settings.sink);
      log.info(`Executing '${step}' command: '${cmd}'...`);
      executeCmd(cmd, resolve, reject, verify);
  	} else {
  	  let err = `Error, step "${step}" was not found. Aborting.`;
  	  log.error(err);
  	  reject("Incorrect Configuration");
  	}
  });  
}

function executeCmd(cmd, resolve, reject, verifyCmd = '') {
  log.info("Called executeCmd (promise)...");
  cli.get(`${cmd}
  	${verifyCmd}`, (err, data, stderr) => {
    if (err) {
      log.error(err);
      reject(stderr);
    } else {
      log.info(`Verifying if cmd was successfull with >"${verifyCmd}"...`)
      //Assumes everything is well
      if (data == 'true') {
        resolve(data);
      } else {
        reject(data);
      }
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
exports.copy = copy;
exports.remove = remove;
exports.reset = reset;

