"use strict";
var RoseTree = require('./RoseTree');
var errors = require('./errs');
var shrink = require('./shrink');

var t = {};

t.pick = function (low, high, center) {
    if (arguments.length < 3) {
        center = low;
    }

    return function (rng, _size) {
        var n = Math.floor(rng.float() * (high - low + 1) + low);
        return new RoseTree(
            n,
            function () {
                return shrink.int(n, center);
            }
        );
    };
};

t.int = function (rng, size) {
    return t.pick(-size, size, 0)(rng, size);
};

t.int.nonNegative = function (rng, size) {
    return t.pick(0, size)(rng, size);
};

t.int.positive = function (rng, size) {
    return t.pick(1, size + 1)(rng, size);
};

t.suchThat = function (pred, gen, maxTries) {
    if (arguments.length < 3) maxTries = 10;

    return function (rng, size) {
        var triesLeft = maxTries;
        var tree;
        do {
            tree = gen(rng, size);
            if (pred(tree.root)) {
                return tree.filterSubtrees(pred);
            }
        } while (--triesLeft > 0);
        throw new errors.bjestError('suchThat: could not find a suitable value');
    };
};

function isNonzero(x) {
    return x !== 0;
}

t.int.nonZero = t.suchThat(isNonzero, t.int);

// FIXME: This should eventually generate non-ASCII characters, I guess.
t.char = function (rng, _size) {
    return t.pick(32, 126)(rng, _size).map(function (n) {
        return String.fromCharCode(n);
    });
};

t.arrayOf = function (elemGen) {
    return function (rng, size) {
        var len = t.int.nonNegative(rng, size).root;

        var elemTrees = new Array(len);
        for (var i = 0; i < len; i++) {
            elemTrees[i] = elemGen(rng, size);
        }

        return new RoseTree(
            elemTrees.map(function (tree) {
                return tree.root;
            }),
            function () {
                return shrink.array(elemTrees, true);
            }
        );
    };
};

t.record = function (gens) {
    var len = gens.length;
    return function (rng, size) {
        var elemTrees = new Array(len);
        for (var i = 0; i < len; i++) {
            elemTrees[i] = gens[i](rng, size);
        }

        return new RoseTree(
            elemTrees.map(function (tree) {
                return tree.root;
            }),
            function () {
                return shrink.array(elemTrees, false);
            }
        );
    };
};

t.fmap = function (fun, gen) {
    return function (rng, size) {
        return gen(rng, size).map(fun);
    };
};

t.append = function (gen, fun) {
    return function (rng, size) {
        return gen(rng, size).flatmap(function (value) {
            return fun(value)(rng, size);
        });
    };
};

t.string = t.fmap(function (chars) {
    return chars.join('');
}, t.arrayOf(t.char));

t.constant = function (x) {
    return function (_rng, _size) {
        return new RoseTree(x);
    };
};

t.oneOf = function (gens) {
    if (gens.length < 1) {
        throw new errors.bjestError('Empty array passed to oneOf');
    }
    if (gens.length === 1) {
        return gens[0];
    }
    return t.append(
        t.pick(0, gens.length - 1),
        function (genIndex) {
            return gens[genIndex];
        }
    );
};

t.elements = function (elems) {
    if (elems.length < 1) {
        throw new errors.bjestError('Empty array passed to elements');
    }
    return t.oneOf(elems.map(t.constant));
};

t.bool = t.elements([false, true]);

t.entity = function (obj) {
    var attributeNames = [];
    var gens = [];

    Object.keys(obj).forEach(function (key) {
        attributeNames.push(key);
        gens.push(obj[key]);
    });

    var entify = function (record) {
        var obj = {};
        for (var i = 0; i < record.length; i++) {
            obj[attributeNames[i]] = record[i];
        }
        return obj;
    };

    return t.fmap(entify, t.record(gens));
};

module.exports = t;