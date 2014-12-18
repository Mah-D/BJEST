"use strict"
var errors = require('./errs');
var types = require('./types');

var Behavior = function (func, name, gen) {
    if (!(this instanceof Behavior)) {
        return new Behavior(func, name, gen);
    }

    if (typeof func !== 'function' ||
        typeof name !== 'string' ||
        typeof gen !== 'function') {
        throw new errors.bjestError('Behavior constructor called with ' +
            'invalid arguments');
    }

    this._func = func;
    this.name = name;
    this._gen = gen;
};

// Generate a test case for the Behavior.
Behavior.prototype.bjest = function (rng, size) {
    if (typeof size !== 'number' || size < 1) {
        throw new errors.bjestError('size must be a positive integer');
    }
    size |= 0;
    return this._gen(rng, size);
};

Behavior.prototype.runTest = function (testCase) {
    var result = {};

    try {
        result.success = this._func.apply(null, testCase.root);
    } catch (e) {
        result.success = false;
        result.error = e;
    }

    return result;
};

Behavior.prototype.shrinkFailingTest = function (testCase) {

    var node = testCase; 
    var childIndex = 0; 
    var behave = this; 

    return {
        next: function () {
            if (childIndex >= node.children().length) {
                return {
                    done: true
                };
            }

            var child = node.children()[childIndex];
            var result = behave.runTest(child);
            if (!result.success) {
                node = child;
                childIndex = 0;
            } else {
                childIndex++;
            }

            return {
                done: false,
                value: {
                    testArgs: child.root,
                    result: result
                }
            };
        }
    };
};

Behavior.forAll = function (args, name, func) {
    var gen = Array.isArray(args) ? types.record(args) : types.record(types.entity(args));

    return new Behavior(func, name, gen);
};

module.exports = Behavior;