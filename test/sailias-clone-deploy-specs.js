"use strict"
/*****************************************************
 * Sales Deploy specs:
 *   Tests initial deployment steps which either:
 *   1) clone a new sailias backend into a destination
 *      folder and adds the current customizations on
 *      top of it;
 *   2) uses an existing sailias folder and adds the
 *      current customizations to it 
 *****************************************************/

let chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
let fs = require('fs');
let clone = require('../lib/sailias-cli/clone.js');
let deploy = require('../lib/sailias-cli/deploy.js');
let undeploy = require('../lib/sailias-cli/undeploy.js');

//Chai will use promises for async events
chai.use(chaiAsPromised);

before(function(done) {
  done();
});

after(function(done) {
  // here you can clear fixtures, etc.
  done();
});

describe("Cloning tests", function() {
  xit('should have a hidden .sailias files which stores configurations', function () {
  });
  xit('should allow defining and getting the values of a source directory/file to clone from in the sailias config file', function () {
  });
  xit('"sailias clone" command should clone a new sailias site into the destination ', function () {
  });
  xit('smoke tests to make sure the cloning went good. ', function () {
  });
});

describe("Customization - deploy tests", function() {
  xit('"sailias deploy" should package the current directory\'s contents via standard npm pack', function () {    
  });
  xit('should unpack the contents of the custom package into the sailias folder (via npm install and then moves files into actual folder)', function () {    
  });
  xit('should not unpack if does not find a sailias folder', function () {    
  });
  xit('smoke tests, should validate if all the contents unpacked are there (e.g. not overriten)', function () {    
  });
});

describe("undeploy tests", function() {
  xit('"sailias undeploy" should remove the sailias customizations', function () {    
  });
  xit('smoke tests, should validate if all the contents removed are really removed (e.g. sailias should be reverted to original state)', function () {    
  });
});