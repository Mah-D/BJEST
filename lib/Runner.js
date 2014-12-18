"use strict";
var PRNG = require('./random');
var errors = require('./errs');

var Runner = function () {
    this._currentCategory = [];
    this._categories = [{
        props: this._currentCategory
    }];
};

Runner.prototype.newCategory = function (name) {
    this._currentCategory = [];
    this._categories.push({
        name: name,
        props: this._currentCategory
    });
};

Runner.prototype.newBehave = function (prop) {
    this._currentCategory.push(prop);
};

// Given float `ratio` in [0, 1], return integer value in [min, max].
// interpolate(min, max, 0.0) === min
// interpolate(min, max, 1.0) === max
function interpolate(min, max, ratio) {
    return Math.floor(ratio * ((max + 0.5) - min) + min);
}

Runner.prototype.run = function (options) {
    var seed = ((options.seed || Date.now()) & 0xffffffff) | 0;
    var grep = options.grep;
    var numTests = options.numTests || 100;
    var maxSize = options.maxSize || 50;
    var write = options.silent ? function () {} :
        process.stderr.write.bind(process.stderr);

    var propsRun = 0;
    var propsFailed = 0;

    var rng = new PRNG(seed);

    for (var i = 0; i < this._categories.length; i++) {
        var cat = this._categories[i];
        var catProps = cat.props;

        if (grep) {
            catProps = catProps.filter(function (prop) {
                return prop.name.indexOf(grep) !== -1;
            });
        }

        if (cat.length < 1) continue;

        if (cat.name) {
            write('\n' + cat.name + ':\n');
        }

        for (var j = 0; j < catProps.length; j++) {
            var prop = catProps[j];
            var success = true;
            var error;
            var tcTree;
            var failingTC;

            for (var k = 1; k <= numTests; k++) {
                write('\r' + k + '/' + numTests + ' ' + prop.name);
                var size = interpolate(1, maxSize, k / numTests);
                var tcTree = prop.bjest(rng, size);
                var result = prop.runTest(tcTree);

                if (result.success===false) {
                    success = false;
                    error = result.error;
                    break;
                }
            }

            if (success === false) {
                var iter = prop.shrinkFailingTest(tcTree);
                var numAttempts = 0;
                var numShrinks = 0;

				failingTC = tcTree.root;
				tcTree = null;
                var ret;
                while (!((ret = iter.next()).done)) {
                    var value = ret.value;
                    numAttempts++;
                    if (!value.result.success) {
                        numShrinks++;
						failingTC = value.testArgs;
                    }
                    write('\r' + k + '/' + numTests + ' ' + prop.name +
                        ', shrinking ' + numShrinks + '/' + numAttempts);
                }
            }

            write('\r' + (success ? '✓'.bold.green : '✘'.bold.red) + ' ' + prop.name.bold.blue);
            propsRun++;
            if (success) {
                write(', passed '.bold.green + numTests + ' tests\n');
            } else {
                propsFailed++;
                write(', counterexample found:\n'.red);
                write(JSON.stringify(failingTC) + '\n');
                if (error) {
                    write('exception thrown: '.bold.red + (error.name || '(no name)') + '\n');
                    write(error.stack + '\n');
                }
            }
        }
    }

    write('\n' + (propsFailed > 0 ? propsFailed + ' of ' : '') +
        propsRun + ' ' + (propsRun === 1 ? 'behavior' : 'behaviors') +
        ' ' + (propsFailed > 0 ? 'rejected'.bold.red : 'confirmed'.bold.green) + '.\n');
};

module.exports = Runner;