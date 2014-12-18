"use strict";
//var PRNG = require('seedrandom');

var DEFAULT_COUNT = 10;

function getRoot(tree) {
    return tree.root;
}

function sample(gen, count, raw) {
    if (arguments.length < 2) {
        count = DEFAULT_COUNT;
    }

    var rng = Math.floor(Math.random() * Math.sin(Date.now() & 0xffffffff) * (Number.MAX_VALUE - Number.MIN_VALUE)) + Number.MIN_VALUE;
    var results = new Array(count);
    for (var i = 0; i < count; i++) {
        results[i] = gen(rng, Math.floor(i / 2) + 1);
    }
    return raw ? results : results.map(getRoot);
}

module.exports = sample;