var tests = [];
var lock = false;
var webPage = require('webpage');
var page = webPage.create();
var system = require('system');
var data = require(system.args[1]);
var success = true;
var checks = {};

checks.load = function(url) {
  console.log("Load " + url);
  page.open(url, function(status) {
    console.log(url + " " + status);
    success = status === "success";
  });
};
checks.fill = function(obj) {
  console.log("Put value into field");
  console.log(obj.element + " " + obj.value);
  page.evaluate(function(element, value) {
    document.querySelector(element).value = value;
  }, obj.element, obj.value);
};
checks.search = function(obj) {
  console.log("Check element's attribute for value");
  console.log(obj.element + " with " + obj.attr + " that equals " + obj.value);
  success = page.evaluate(function(element, attr, value) {
    return value === document.querySelector(element)[attr];
  }, obj.element, obj.attr, obj.value);
};
checks.exist = function(obj) {
  console.log("Check for element on page");
  console.log(obj.element + " " + obj.bool);
  success = page.evaluate(function(element, bool) {
    return bool === (document.querySelector(element) !== null);
  }, obj.element, obj.bool);
};
checks.click = function(element) {
  console.log("Click to submit");
  console.log(element);
  page.evaluate(function(element) {
    document.querySelector(element).click();
  }, element);
};
checks.saveHTML = function(location) {
  console.log("Return HTML Page");
  var fs = require('fs');
  var result = page.evaluate(function() {
    return document.querySelectorAll("html")[0].outerHTML;
  });
  fs.write(location, result, 'w');
  return result;
};
checks.finish = function() {
  console.log("Save to DB");
};
page.onLoadStarted = function() {
  lock = true;
};
page.onLoadFinished = function() {
  lock = false;
};

data.tests.steps.forEach(function(test) {
  tests.push(function() {
    checks[test.type](test[test.type]);
  });
});

console.log("Total of " + tests.length + " tests loaded for " + data.tests.name);

var i;
i = 0;

interval = setInterval(runTests, 250);

function runTests() {
  if (success === false) {
    console.log("test failed");
    phantom.exit(1);
  }
  if (i == tests.length) {
    console.log("test complete");
    phantom.exit(0);
  }
  if (lock === false) {
    console.log("Test " + i.toString());
    tests[i]();
    i++;
  }
}
