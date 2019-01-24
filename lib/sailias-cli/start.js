"use strict"

let log = require('../helpers').log;

exports = module.exports = (data, save) => {
  console.log(`Starting app ${data}, ${save}...` );
  log.error("Not working the save!, goes to previous step but not this function?")
}