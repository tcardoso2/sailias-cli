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

describe("User Admin add tests", function() {
  xit('"sailias add-admin <username>" command should add a new admin user to the project ', function (done) {
  });
});
