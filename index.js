"use strict"

let cmd = require('commander');
let cli = require('node-cmd');
let helpers = require('./lib/helpers');
let path = require('path');
let log = helpers.log;

var _settings;

function reset(){
  log.info("Called reset...");
  _settings = undefined;
}

/*********************
 * Might be deprecated later (use the 
 * promises method instead, readSettings)
 * Reads the .sailias settings file 
 * into an internal _settings property
 ********************/
function readSettingsCallback(cb) {
  log.info("Called readSettingsCallback...");
  if(!_settings) {
    helpers.readJson(path.resolve('.sailias'), (err, settings) => {
    	if(!err){
  	    _settings = settings;
  	    cb(null, settings);
  	  } else {
  	    cb(err);
  	  }
    });
  } else {
  	cb(null, _settings);
  }
}

/*********************
 * Might be deprecated later.
 * Reads the .sailias settings file 
 * into an internal _settings property
 ********************/
function readSettings() {
  log.info("Called readSettings (promise)...");
  return new Promise((resolve, reject) => {
    readSettingsCallback((err) => {
  	  if(!err) {
        log.debug('Resolving promise, settings are:');
        log.debug(_settings);
  	    resolve(_settings);
  	  } else {
  	  	log.debug(`Rejecting promise: ${err}`);
  	    reject(err);
  	  }
    });
  });
}

//COMMANDS
//One needs to add function here per command, if it does what is mentioned in sailias only,
//then it is enough to call the executeStep(settings, "your-command-name")
//If custom steps are needed, add those into the lig/sailias-cli/folder and call then from here
//For the command to be invoked via command line, add it into the bin/sailias file

//Uses Promises - clone needs to be redesigned I'm repeating the read settings, see the implementation of copy
function clone(settings) {
  log.info("Called clone (promise)...");
  return new Promise((resolve, reject) => {
    preClone(settings).then(() => {
      copy(settings).then(() => {
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

function install(settings) {
  log.info("Called install, wait for at least 1 minute this action usually takes some time...");
  return executeStep(settings, "install");
}

function remove(settings) {
  log.info("Called remove...");
  return executeStep(settings, "remove");
}

function deploy(settings) {
  log.info("Called deploy...");
  return executeStep(settings, "deploy");
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
  	  let err = `Error, step "${step}" was not found in .sailias file, did you forget to add? Aborting current action.`;
  	  log.error(err);
  	  reject("Incorrect Configuration");
  	}
  });  
}

function executeCmd(cmd, resolve, reject, verifyCmd = '') {
  log.info(`Called executeCmd (promise) on "${cmd} and verifying straight away with "${verifyCmd}"...`);
  cli.get(`${cmd}
  	${verifyCmd}`, (err, data, stderr) => {
    if (err) {
      log.error(err);
      reject(stderr);
    } else {
      log.info(`Verifying if cmd was successfull with > "${verifyCmd}"...`)
      //Assumes everything is well
      if (data.trim() === 'true') {
        resolve(data);
      } else {
        reject(data);
      }
    }
  });
}

function getSettings() {
  log.info("Called getSettings...");
  log.debug(_settings);
  if(!_settings) {
  	throw new Error('Settings are not yet initialized, call readSettings() first!');
  }
  return _settings;
}

exports.readSettingsCallback = readSettingsCallback;
exports.readSettings = readSettings;
exports.getSettings = getSettings;
exports.clone = clone;
exports.copy = copy;
exports.deploy = deploy;
exports.remove = remove;
exports.reset = reset;
exports.install = install;

