"use strict";

var assert = require('assert');
var Tester = require('../lib/Runner');
var Behavior = require('../lib/Behavior');
var t = require('../lib/types');

describe('testing BJEST', function() {
  it('Check every given behavior tested enough', function() {
    var NUM_BEHAVES = 40;
    var checked = [];
    var tester = new Tester();

    for (var i = 0; i < NUM_BEHAVES; i++) {
      (function() {
        var j = i;  
        checked[j] = 0;
        tester.newProp(Behavior.forAll([t.int], '', function(n) {
          assert(typeof n === 'number' && (n|0) === n);
          checked[j]++;
          return true;
        }));
      })();
    }

    tester.run({silent: true, numTests: 100});

    assert.equal(checked.length, NUM_BEHAVES);
    assert(checked.every(function(n) { return n === 100; }));
  });

  it('selects random test', function() {
    var tester = new Tester();
    var test1 = false, test2 = false;
    tester.newProp(Behavior.forAll([t.int], 'test1 ', function() {
      test1 = true;
      return true;
    }));
    tester.newProp(Behavior.forAll([t.int], 'test2', function() {
      test2 = true;
      return true;
    }));
    tester.run({silent: true, grep: 'test1'});

    assert.equal(test1, true);
    assert.equal(test2, false);
  });
});
