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

function start(settings, async = true) {
  log.info("Called start...");
  return executeStep(settings, "start", async);
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
function executeStep(settings, step, async = false) {
  log.info(`Called executeStep (promise) for step "${step}" with async = ${async}...`);
  return new Promise((resolve, reject) => {
  	if (settings[step]) {
      try{
        let cmd = format(settings[step]["step"]);
        let verify = format(settings[step].verify);
        let save = format(settings[step].save);
        if(async) {
          log.info(`Executing '${step}' command: '${cmd}', save? '${save}' (Async)...`);
          executeCmdAsync(cmd, resolve, reject, verify, save);        
        } else {
          log.info(`Executing '${step}' command: '${cmd}', save? '${save}'...`);
          executeCmd(cmd, resolve, reject, verify, save);        
        }
      } catch(e) {
        log.error(e)
      }
  	} else {
  	  let err = `Error, step "${step}" was not found in .sailias file, did you forget to add? Aborting current action.`;
  	  log.error(err);
  	  reject("Incorrect Configuration");
  	}
  });  
}

//Resolves right away
function executeCmdAsync(cmd, resolve, reject, verifyCmd = '', save) {
  log.info(`Called executeCmdAsync (promise) on "${cmd} and verifying straight away with "${verifyCmd}" and save "${save}...`);
  cli.run(`${cmd}`);
  cli.run(`${verifyCmd}`);
  log.info(`Resolving, save = ${save}`);
  resolve(null, save);
}

function executeCmd(cmd, resolve, reject, verifyCmd = '', save) {
  log.info(`Called executeCmd (promise) on "${cmd} and verifying straight away with "${verifyCmd}" and save "${save}...`);
  //Should it be a get or a run? For long lived commands...
  cli.get(`${cmd}
  	${verifyCmd}`, (err, data, stderr) => {
    if (err) {
      log.error(err);
      reject(stderr);
    } else {
      log.info(`Verifying if cmd was successfull with > "${verifyCmd}"...`)
      //Assumes everything is well
      if (data.trim() === 'true') {
        resolve(data, save);
      } else {
        reject(data);
      }
    }
  });
}

function getSettings() {
  log.info("Called getSettings...");
  log.debug(`_settings is ${_settings}`);
  if(!_settings) {
    log.warning("OOOOooooops looks like _settings is not yet initialized, did you forget to call readSettings?");
  	throw new Error('Settings are not yet initialized, call readSettings() first!');
  }
  return _settings;
}

/*Shortcut function => Find a way to pass async! Test also!*/ 
function run(fn, args) {
  log.info(`Calling '${fn}' with args: '${args}'...`);
  let async = args == 'async';
  readSettings().then((settings) => {
    executeStep(settings, fn, async).then((data, save) => {
      try{
        let postLib = require(`./lib/sailias-cli/${fn}`)(data, save);
      } catch(e){
        //Make this a more friendly error
        if(e.message.indexOf("Cannot find module") >= 0) {
          log.info("No custom command found, ignoring and keeping it simple...")
        } else {
          log.warning(e);
        }
      }
    }, (error) => {
      //Promize was rejected
    });
  }, (err) => {
    log.error("Error reading Settings...")
    log.error(err);
  });
}

//Private
function format(step) {
  //TODO: Make this dinamyc replace based on .sailias
  if (!step) return;
  return step
    .replace(/<source>/g, _settings.source)
    .replace(/<sink>/g, _settings.sink)
    .replace(/<randomUID>/g, _settings.randomUID.type && _settings.randomUID.type == "function" ? functions["randomUID"]() : _settings.randomUID)
    .replace(/<lastUID>/g, _settings.lastUID.type && _settings.lastUID.type == "function" ? functions["lastUID"]() : _settings.lastUID);
}

//Functions 
let lastUID;
let functions = {
  randomUID : () => {
    lastUID = parseInt(Math.random() * 99999999999)
    return lastUID;
  },
  lastUID : () => {
    return lastUID;
  }
}

exports.readSettingsCallback = readSettingsCallback;
exports.readSettings = readSettings;
exports.getSettings = getSettings;
exports.clone = clone;
exports.copy = copy;
exports.start = start;
exports.deploy = deploy;
exports.remove = remove;
exports.reset = reset;
exports.install = install;
exports.run = run;

