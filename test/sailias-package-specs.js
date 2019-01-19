"use strict"
/*****************************************************
 * Sailias Package specs:
 *   Packages a new sailias site into an executable
 *   file for target machine and performs smoke tests
 *****************************************************/

let chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
let fs = require('fs');
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

describe("Package tests", function() {
  xit('"sailias package" should package the current directory\'s contents into an executable file', function () {    
  });
  xit('The package should still exclude configuration files which need to be outside the executable file', function () {    
  });
});

describe("Smoke tests", function() {
  xit('Checks the web application executable works', function () {    
  });
  xit('Checks the application response to the configuration files', function () {    
  });
});