"use strict"

let sailias = require('../../index');
let log = require('../helpers').log;

exports = module.exports = () => {
  log.info(`Cloning new space...` );
  //TODO: use promises instead
  sailias.readSettings().then((result) => {
    log.info('Got result!');
  }, (err) => {
  	log.error(err);
  });  
}