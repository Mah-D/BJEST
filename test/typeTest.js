"use strict";

var assert = require('assert');
var bjest = require('../main');
var t = bjest.types;

function isInt(n) {
  return typeof n === 'number' && Math.floor(n) === n;
}

function isPositiveInt(n) {
  return isInt(n) && n > 0;
}

function isNonZeroInt(n) {
  return isInt(n) && n !== 0;
}

function isNonNegativeInt(n) {
  return isInt(n) && n >= 0;
}

function isChar(ch) {
  return typeof ch === 'string' && ch.length === 1 &&
    ch.charCodeAt(0) >= 32 && ch.charCodeAt(0) <= 126;
}

function isString(str) {
  return typeof str === 'string' && str.split('').every(isChar);
}

function isBool(bv) {
  return bv === true || bv === false;
}

function isArray(func) {
  return function(arr) {
    return Array.isArray(arr) && arr.every(func);
  }
}

describe('bjest.type.int', function() {
  it('could generate integeres', function() {
    var tc = bjest.sample(t.int, 100);
    assert(tc.every(isInt));
  });
});

describe('bjest.type.int.nonNegative', function() {
  it('could generate non-Negative integers', function() {
    var tc = bjest.sample(t.int.nonNegative, 100);
    assert(tc.every(isNonNegativeInt));
  });
});

describe('bjest.type.int.nonZero', function() {
  it('could generate nonZero integeres', function() {
    var tc = bjest.sample(t.int.nonZero, 100);
    assert(tc.every(isNonZeroInt));
  });
});

describe('bjest.type.int.positive', function() {
  it('could generate positive integers', function() {
    var tc = bjest.sample(t.int.positive, 100);
    assert(tc.every(isPositiveInt));
  });
});

describe('bjest.type.char', function() {
  it('could generate ASCII characters', function() {
    var ch = bjest.sample(t.char, 100);
    assert(ch.every(isChar));
  });
});

describe('bjest.type.string', function() {
  it('could generate ASCII strings', function() {
    var str = bjest.sample(t.string, 100);
    assert(str.every(isString));
  });
});

describe('bjest.type.bool', function() {
  it('could generate booleans', function() {
    var bv = bjest.sample(t.bool, 1000);
    assert(bv.every(isBool));
  });
});

describe('bjest.type.arrayOf', function() {
  it('could generate arrays of integers', function() {
    var arrInt = bjest.sample(t.arrayOf(t.int), 100);
    assert(arrInt.every(isArray(isInt)));
  });
  
  it('could generate arrays of strings', function() {
      var arrStr = bjest.sample(t.arrayOf(t.string), 100);
      assert(arrStr.every(isArray(isString)));
    });
});

describe('bjest.type.record', function() {
  it('could generate record', function() {
    var rec = bjest.sample(t.record([t.char, t.int, t.string, t.bool]), 100);
    assert(rec.every(function(recv) {
      return isChar(recv[0]) && isInt(recv[1]) && isString(recv[2]) &&
        isBool(recv[3]);
    }));
  });
});

describe('bjest.type.oneOf', function() {
  it('could select one of int or string and generate int or string', function() {
    var one = bjest.sample(t.oneOf([t.int, t.string]), 100);
    assert(one.every(function(v) {
      return isString(v) || isInt(v);
    }));
  });
});

describe('bjest.type.element', function() {
  it('could select from a set of predefined elements', function() {
    var employee = ['senior', 'fresh', 'retired', 'prospective'];
    var elements = bjest.sample(t.elements(employee), 100);
    assert(elements.every(function(v) {
      return employee.indexOf(v) !== -1;
    }));
  });
});

describe('bjest.type.constant', function() {
  it('could returns a constant predefined value', function() {
    var cons = bjest.sample(t.constant('c'), 100);
    assert(cons.every(function(c) {
      return c === 'c';
    }));
  });
});

describe('bjest.type.entity', function() {
  it('could generate objects with declared fields', function() {
    var fields = {
      ID: t.int,
      position: t.string
    };
    var en = bjest.sample(t.entity(fields), 100);
    assert(en.every(function(v) {
      return Object.keys(v).length === 2 && isInt(v.ID) &&
        isString(v.position);
    }));
  });
});