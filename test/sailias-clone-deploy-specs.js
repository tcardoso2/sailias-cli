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
  it('"sailias clone" command should clone a new sailias site into the node_modules folder (requires being online) ', function (done) {
    helpers.isOnline((isConnected) => {
      if(!isConnected) {
        done();
        //Test should not be run if not online
        return;
      }
      this.timeout(120000);
      console.log("testing sailias clone command...");
      cli.get(`${sailiasCmd} clone`, (err, data, stderr) => {
        (err == null).should.equal(true);
        console.log("Clone done, checking if node_modules folder with a sailias dependency installed exists...");
        //Settings should have been read at thi point
        index.readSettings().then((settings) => {
          //Checks module is installed
          console.log("Read settings, checking node_modules...")
          if (fs.existsSync(`node_modules/sailias`)) {
            console.log("Sailias package exists in node_modules");
            done();
          };
        }, (error) => {
          should.fail(error);
        });
      });
    });
  });
  it('"sailias copy" command should copy from cloned into sink ', function (done) {
    this.timeout(4000);
    cli.get(`${sailiasCmd} copy`, (err, data, stderr) => {
      console.log("Test output is: ", data);
      (err == null).should.equal(true);
      data.indexOf("Verifying if cmd").should.be.gt(0);
      index.readSettings().then((settings) => {
        if (fs.existsSync(`${settings.sink}/api`)) {
          //Checking folders were copied into sink is done more comprehensively on a later test, we just test api for now
          done();
        }
      });
    });
  });
  [ "@longtest" ]
  it('"sailias install" command should perform any npm install on the sink ', function (done) {
    this.timeout(50000);
    console.log("Testing sailias install...")
    cli.get(`${sailiasCmd} install`, (err, data, stderr) => {
      console.log("Test output is: ", data);
      (err == null).should.equal(true);
      index.readSettings().then((settings) => {
        //Checks that an installation folder exists on sink
        if (fs.existsSync(`${settings.sink}/node_modules`)) {
          done();
        };
      });
    })
  });
  it('site should be up and running ', function (done) {
    this.timeout(20000);
    cli.get('ps aux | grep "node app"', (err, data) => {
      if (err) throw (err.message + "\nError doing command ps aux?... Could you be running this on a Windows?");
      let nrOriginalProcesses = data.split("\n").length;
      console.log(data);
      console.log(`There are currently ${nrOriginalProcesses} node apps running`);
      console.log("Going to output folder and attempting to start app...");
      cli.run(`cd ./output && ls && node app && echo "ThisIsATest123"`);
      let attempts = 0;
      let interval = setInterval(() => {
        attempts++;
        console.log("Sending HTTP request to site...");
        chai.request('localhost:1337')
          .get('/')
          .end((err, res) => {
            if((res.res.statusCode == 400) && attempts < 10) {
              console.log("Site seems not to be up yet, will test it in 5 seconds again ...");
              return;
            }
            res.should.have.status(200);
            //Must kill the process since it was ran with cli.run (background)
            if(nrOriginalProcesses > 1) {
              console.log("Number of original processes is bigger than 1, will clean up but I might kill something important...");
            }
            console.log("Site is up! :) Killing now background process...");

            cli.get('ps aux | grep "node app"', (err, data) => {
              if (err) {
                console.error("Error: ", err);
              } else {
                let procs = data.split("\n");
                console.log(procs);
                let procN;
                for (let p in procs) {
                  procN = procs[p].split(" ");
                  for (let i in procN) {
                    if (!isNaN(parseInt(procN[i]))) {
                      console.log(`Process # is ${procN[i]}, killing it...`);
                      cli.run(`kill ${procN[i]}`);
                      break;
                    }
                  }
                }
              }
              clearInterval(interval);
              done(); 
            });
        });
      }, 5000);  //Expects up in 10 seconds... too little?
    });
  });
  it('smoke tests to make sure the cloning went good (besides the verification steps). ', function (done) {
    //test synchronously for api, assets, config, scripts, tasks, views folders
    index.readSettings().then((settings) => {
      let output = settings.sink;
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
    }, (err) => {
      should.fail("Did not manage to get settings to perform the test");
    });
  });
});

describe("List tests", function() {
  xit('"sailias list" should list current sailias sites and process associated', function (done) {    
  });
});

describe("Customizations - deploy tests", function() {
  it('"sailias deploy" should package the a directory\'s contents via standard npm pack (keeps source)', function (done) {    
    this.timeout(20000);
    index.readSettings().then((settings) => {
      let output = settings.sink //TODO: Allow the command deploy to take an output
      cli.get(`${sailiasCmd} deploy`, (err, data, stderr) => {
        console.log("Test output is: ", data);
        let version = require('../output/package.json').version;
        (err == null).should.equal(true);
        data.indexOf("Called deploy...").should.be.gt(0);
        //data.indexOf("Verifying if cmd").should.be.gt(0);
        console.log(`Verifying if ${output}/sailias-${version}.tgz exists...`);
        fs.existsSync(`${output}/sailias-${version}.tgz`).should.equal(true);
        console.log("Cleaning up...");
        fs.unlinkSync(`${output}/sailias-${version}.tgz`);
        done();
      })
    });
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
  it('"sailias start async" command should start the sink app ', function (done) {
    this.timeout(30000);
    console.log("Starting sails app...");
    cli.get(`${sailiasCmd} start`, (err, data, stderr) => {
      console.log("Test output is: ", data);
      (err == null).should.equal(true);
      done();
    })
  });
  xit('/pid route should expose the process Id for the app ', function (done) {
    this.timeout(4000);
    chai.request('localhost:1337')
      .get('/pid')
      .end((err, res) => {
        res.should.have.status(200);
        let pid = res.body.pid;
        isNan(pid).should.equal(false);
      });
  });
  xit('"sailias list" command should list the node process running on the default port 1337 ', function (done) {
  });
  xit('"sailias kill <pid>" command should kill an existing process ', function (done) {
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