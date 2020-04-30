const webdriver = require('selenium-webdriver');
const chrome = require("selenium-webdriver/chrome");
const fs = require('fs');
const path = require('path');
const By = webdriver.By;
const until = webdriver.until;
const REQUEST_TIMEOUT = 18000;
const CHROME_OPTIONS = new chrome.Options();
const chalk = require('chalk');
const ProgressBar = require('progress');

CHROME_OPTIONS.addArguments(

  'v8-cache-options=none',
  'v8-cache-strategies-for-cache-storage=none',
  "disable-background-networking",
  // "0",
  "bwsi",
  "disable-gpu-program-cache",
  // "silent-launch",
  // "enable-net-benchmarking",
  // "metrics-recording-only",
  "no-default-browser-check",
  "no-first-run",
  // "--enable-gpu-benchmarking",
  "disable-cache",
  "no-proxy-server",
  "disable-component-extensions-with-background-pages",
  "disable-default-apps",
  "ignore-certificate-errors"
  //  first available ephemeral port
  // "--remote-debugging-port=0"

);

function ChromeTest(config, CACHE_DIR) {
  this.runs = config.runs || 1;
  this.slug = config.slug;
  this.domain = config.domain || 'http://localhost:4200/';
  this.url = this.domain + config.slug;
  this.outputPath = path.join(CACHE_DIR, config.slug + '.json');
  console.log(chalk.grey('\t[' + this.slug + '] outputPath => ' + this.outputPath));
  this.timeoutMessage = "Url timeout for slug '" + config.slug + "'";
  this.completionCheck = config.check || until.elementLocated(By.id('test-complete'));
  this.options = config.chromeOptions || CHROME_OPTIONS;
  this._runsWillFail = false;
  this.progress = null;

  this.builder = new webdriver.Builder()
    .forBrowser('chrome')
    .setChromeOptions(this.options);
  this.driver = null;
}

ChromeTest.prototype.run = function runTests() {
  let Test = this;
  let runs = new Array(Test.runs).fill(0);
  let results = [];

  console.log(chalk.cyan('GET ' ) + chalk.grey(Test.url));

  Test.progress = new ProgressBar(' running scenario [:bar] :percent :etas', { total: Test.runs, clear: true });
  Test.driver = Test.builder.build();

  return runs
    .reduce(function(chain) {
      return chain.then(function() {
        if (Test._runsWillFail) {
          return false;
        }
        return Test.runOnce()
          .then((data) => {
            results.push(data);
            return true;
          });
      });
    }, Promise.resolve())
    .then(function() {
      let jsonDataStr = '[' + results.join(',') + ']';
      fs.writeFileSync(Test.outputPath, jsonDataStr);

      return jsonDataStr;
    })
    .then(function(result) {
      return Test.driver.quit()
        .then(function() {
          return result;
        });
    });
};

ChromeTest.prototype.runOnce = function runTest() {
  let Test = this;
  let timeout;

  Test.progress.tick();

  if (Test._runsWillFail) {
    return Promise.reject();
  }

  return new Promise(function(resolve, reject) {
    timeout = setTimeout(function() {
      Test._runsWillFail = true;
      Test.driver.quit();
      reject(new Error(Test.timeoutMessage));
    }, REQUEST_TIMEOUT);

    Test.driver.get(Test.url);
    Test.driver.wait(Test.completionCheck);

    Test.driver.executeScript('return window.result;')
      .then(function(jsonDataStr) {
        clearTimeout(timeout);
        resolve(jsonDataStr);
      }, function(e) {
        clearTimeout(timeout);
        throw e;
      });
  });
};

module.exports = ChromeTest;
