"use strict"

let sailias = require('../../index');
let log = require('../helpers').log;

exports = module.exports = () => {
  log.info(`Removing contents from sink ...` );
  sailias.readSettings().then((settings) => {
    sailias.remove(settings).then((data) => {
      log.info("Contents removed from sink");
    }, (err) => {
      //Promize was rejected
      log.error("Error removing contents:", err);
    });
  }, (err) => {
  	log.error(err);
  });  
}