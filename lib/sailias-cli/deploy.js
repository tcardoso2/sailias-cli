"use strict"

let sailias = require('../../index');
let log = require('../helpers').log;

exports = module.exports = () => {
  log.info(`Deploying existing sailias clone...` );
  sailias.readSettings().then((settings) => {
    sailias.deploy(settings).then(() => {
      log.info("Site packaged");
    }, (err) => {
      //Promize was rejected
      log.error("Error packaging:", err);
    });
  }, (err) => {
  	log.error(err);
  });  
}