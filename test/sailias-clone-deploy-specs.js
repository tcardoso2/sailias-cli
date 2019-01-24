"use strict"
/*****************************************************
 * Sailias Deploy specs:
 *   Tests initial deployment steps which either:
 *   1) clone a new sailias backend into a destination
 *      folder and adds the current customizations on
 *      top of it;
 *   2) uses an existing sailias folder and adds the
 *      current customizations to it 
 *****************************************************/

let chai = require('chai');
let chaiHttp = require('chai-http');
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
chai.use(chaiHttp)

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
  it('should have a function to initialize settings from the .sailias file', function (done) {
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
  it('"sailias clone" command should clone a new sailias site into the destination (requires being online) ', function (done) {
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
  [ "@longtest" ]
  it('"sailias install" command should perform any npm install on the sink ', function (done) {
    this.timeout(50000);
    cli.get(`${sailiasCmd} install`, (err, data, stderr) => {
      console.log("Test output is: ", data);
      (err == null).should.equal(true);
      data.indexOf("Verifying if cmd").should.be.gt(0);
      done();
    })
  });
  it('"sailias start" command should start the sink app ', function (done) {
    this.timeout(50000);
    cli.get(`${sailiasCmd} start`, (err, data, stderr) => {
      console.log("Test output is: ", data);
      (err == null).should.equal(true);
      data.indexOf("Verifying if cmd").should.be.gt(0);
      done();
    })
  });
  it('site should be up and running ', function (done) {
    this.timeout(20000);
    console.log("Going to output folder and attempting to start app...");
    cli.run(`cd ./output && ls && node app`);
    setTimeout(() => {
      console.log("Sending HTTP request to site...");
      chai.request('localhost:1337')
        .get('/')
        .end((err, res) => {
          //Assert
          res.should.have.status(200);
          done();
      });
    }, 10000);
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
});

describe("List tests", function() {
  xit('"sailias list" should list current sailias sites and process associated', function (done) {    
  });
});

describe("Customizations - deploy tests", function() {
  it('"sailias deploy" should package the a directory\'s contents via standard npm pack (keeps source)', function (done) {    
    let settings = index.getSettings();
    this.timeout(20000);
    let output = settings.sink //TODO: Allow the command deploy to take an output
    cli.get(`${sailiasCmd} deploy`, (err, data, stderr) => {
      console.log("Test output is: ", data);
      let version = require('../output/package.json').version;
      (err == null).should.equal(true);
      data.indexOf("Called deploy...").should.be.gt(0);
      //data.indexOf("Verifying if cmd").should.be.gt(0);
      console.log(`Verifying if ${output}/sailias-${version}.tgz exists...`);
      fs.existsSync(`${output}/sailias-${version}.tgz`).should.equal(true);
      done();
    })
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

describe("kill tests", function() {
  xit('"sailias kill <pid>" command should kill an existing process ', function (done) {
    this.timeout(4000);
    cli.get(`${sailiasCmd} remove`, (err, data, stderr) => {
      console.log("Test output is: ", data);
      (err == null).should.equal(true);
      data.indexOf("Called remove...").should.be.gt(0);
      data.indexOf("Verifying if cmd").should.be.gt(0);
      done();
    })
  });
  xit('"sailias kill <pid>" again should return a message error saying process does not exist ', function (done) {
  });
});

describe("remove tests", function() {
  it('"sailias remove" command should remove the local sink copy ', function (done) {
    this.timeout(4000);
    cli.get(`${sailiasCmd} remove`, (err, data, stderr) => {
      console.log("Test output is: ", data);
      (err == null).should.equal(true);
      data.indexOf("Verifying if cmd").should.be.gt(0);
      done();
    })
  });
});