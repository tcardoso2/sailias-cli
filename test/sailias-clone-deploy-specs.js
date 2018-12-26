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

describe("Cloning tests", function() {
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
  it('should have a function to initialize settings', function (done) {
    try {
      index.getSettings();
    } catch (e) {
      e.message.should.equal('Settings are not yet initialized, call readSettings() first!');
      index.readSettingsCallback((err, settings) => {
        (err == null).should.equal(true);
        (settings.source === undefined).should.not.equal(true);
        let _settings = index.getSettings();
        _settings.should.be.eql(settings);
        done();
      });
    }
  });
  it('initializing setting is also possible using promises', function (done) {
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
  it('"sailias clone" command should clone a new sailias site into the destination ', function (done) {
    if (!helpers.isOnline()) {
      done();
      return;
    }
    this.timeout(120000);
    cli.get(`${sailiasCmd} clone`, (err, data, stderr) => {
      (err == null).should.equal(true);
    })
  });
  it('"sailias copy" command should copy from cloned into sink ', function (done) {
    this.timeout(4000);
    cli.get(`${sailiasCmd} copy`, (err, data, stderr) => {
      console.log("Test output is: ", data);
      (err == null).should.equal(true);
      data.indexOf("Called copy...").should.be.gt(0);
      data.indexOf("Verifying if cmd").should.be.gt(0);
      done();
    })
  });
  it('smoke tests to make sure the cloning went good (besides the verification steps). ', function (done) {
    //test synchronously for api, assets, config, scripts, tasks, views folders
    let output = index.getSettings().sink;
    if (fs.existsSync(`${output}/api`)) {
      if (fs.existsSync(`${output}/assets`)) {
        if (fs.existsSync(`${output}/config`)) {
          if (fs.existsSync(`${output}/scripts`)) {
            if (fs.existsSync(`${output}/tasks`)) {
              if (fs.existsSync(`${output}/views`)) {
                //Checking for app.js, Gruntfie.js, package.json and README.md files
                if (fs.existsSync(`${output}/app.js`)) {
                  if (fs.existsSync(`${output}/Gruntfile.js`)) {
                    if (fs.existsSync(`${output}/package.json`)) {
                      if (fs.existsSync(`${output}/README.md`)) {

                        done();
                        return;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    should.fail();
  });
  it('"sailias remove" command should remove the local sink copy ', function (done) {
    this.timeout(4000);
    cli.get(`${sailiasCmd} remove`, (err, data, stderr) => {
      console.log("Test output is: ", data);
      (err == null).should.equal(true);
      data.indexOf("Called remove...").should.be.gt(0);
      data.indexOf("Verifying if cmd").should.be.gt(0);
      done();
    })
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