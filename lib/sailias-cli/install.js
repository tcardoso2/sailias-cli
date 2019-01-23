"use strict"

let sailias = require('../../index');
let log = require('../helpers').log;

exports = module.exports = () => {
  log.info(`Installing sink's dependencies...` );
  sailias.readSettings().then((settings) => {
    sailias.install(settings).then(() => {
      log.info("Sink dependencies installed");
    }, (err) => {
      //Promize was rejected
      log.error("Error installing dependencies:", err);
    });
  }, (err) => {
  	log.error(err);
  });  
}