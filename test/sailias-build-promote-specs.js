"use strict"
/*****************************************************
 * Sailias Add admin specs:
 *   Tests that an admin user was added to the
 *   installation
 *****************************************************/

let chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
let fs = require('fs');
let addAdmin = require('../lib/sailias-cli/admin/add.js');
let helpers = require('../lib/helpers');
let index = require('../index');
let cli = require('node-cmd');
const sailiasCmd = './bin/sailias';

//Chai will use promises for async events
chai.use(chaiAsPromised);

before(function(done) {
  done();
});

after(function(done) {
  // here you can clear fixtures, etc.
  done();
});

describe("Continuous integration tests", function() {
  xit('"sailias build" command should get a new sails source and integrate the sailias packages ', function (done) {
  });
  xit('"sailias promote" command should test the build and promote it into a release if tests are successful ', function (done) {
  });
});
