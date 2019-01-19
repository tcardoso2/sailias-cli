"use strict"
/*****************************************************
 * Sailias Add page specs:
 *   Allows adding and removing custom pages to the 
 *   installation
 *****************************************************/

let chai = require('chai');
let chaiAsPromised = require("chai-as-promised");
let should = chai.should();
let fs = require('fs');
let addPage = require('../lib/sailias-cli/page/add.js');
let removeRage = require('../lib/sailias-cli/page/remove.js');
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

describe("Page tests", function() {
  xit('"sailias add-page <pagename>" command should add a new page to the project ', function (done) {
  });
  xit('"sailias remove-page <pagename>" command should remove a page from the project ', function (done) {
  });
  xit('should be able to keep track of customizations made in a ~/.sailias/customization file', function (done) {
  });
  xit('"sailias list-pages" command should list all the pages and be able to show customizations made', function (done) {
  });
});

describe("Page package tests (WIP)", function() {
  xit('A page package should contain a page Javascript file under <SAILS_ROOT>/assets/js/pages/*,  ', function (done) {
  });
  xit('A page package should contain a route to be placed under <SAILS_ROOT>/config/routes.js,  ', function (done) {
  });
  xit('A page package should contain a view Javascript file under <SAILS_ROOT>/views/*  ', function (done) {
  });
  xit('A page package should contain a controller Javascript file under <SAILS_ROOT>/api/controllers/*  ', function (done) {
  });
});
