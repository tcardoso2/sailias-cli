"use strict"
/*****************************************************
 * Sailias Index specs:
 *   Fundamental tests on the main index module
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

describe("Basic tests", function() {
  it('should have a hidden .sailias file which stores configurations', function (done) {
    fs.open('./.sailias', 'r', (err, file) => {
      (err == null).should.equal(true);
      done();
    });
  });
  it('should allow defining and getting the values of a source directory/file to clone from in the sailias config file', function (done) {
    helpers.readJson('../.sailias', (err, settings) => {
      (err == null).should.equal(true);
      (settings.source === undefined).should.not.equal(true);
      done();
    });
  });
  it('should have a function to initialize settings from the .sailias file', function (done) {
    try {
      index.getSettings();
    } catch (e) {
      e.message.should.equal('Settings are not yet initialized, call readSettings() first!');
      console.log("Caught expected exception, this is part of the test, calling readSettings now...");
      index.readSettingsCallback((err, settings) => {
        (err == null).should.equal(true);
        (settings.source === undefined).should.not.equal(true);
        console.log("Re-calling getSettings again, should not return an exception now...");
        let _settings = index.getSettings();
        _settings.should.be.eql(settings);
        done();
      });
    }
  });
  it('initializing setting is also possible using promises (preferred method)', function (done) {
    index.reset();
    try {
      index.getSettings();
    } catch (e) {
      e.message.should.equal('Settings are not yet initialized, call readSettings() first!');
      index.readSettings().then((settings) => {
        (settings.source === undefined).should.not.equal(true);
        let _settings = index.getSettings();
        _settings.should.be.eql(settings);
        done();
      }, (error) => {
        //Promise was rejected
        should.fail();
      });
    }
  });
});

describe("run function tests", function() {
  xit('Checks the web application executable works', function () {    
  });
  xit('Checks the application response to the configuration files', function () {    
  });
});