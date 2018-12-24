"use strict"

let sailias = require('../../index');
let log = require('../helpers').log;

exports = module.exports = () => {
  log.info(`Cloning new space...` );
  //TODO: use promises instead
  sailias.readSettings().then((result) => {
    sailias.clone().then(() => {
      //TODO: needs to be completed later
    }, (error) => {
      //Promize was rejected
    });
  }, (err) => {
  	log.error(err);
  });  
}