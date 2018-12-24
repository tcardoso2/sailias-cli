"use strict"

let sailias = require('../../index');
let log = require('../helpers').log;

exports = module.exports = () => {
  log.info(`Copying from cloned space into sink...` );
  sailias.readSettings().then((settings) => {
    sailias.copy(settings).then(() => {
      log.info("Contents copied from install folder to sink");
    }, (err) => {
      //Promize was rejected
      log.error("Error copying:", err);
    });
  }, (err) => {
  	log.error(err);
  });  
}