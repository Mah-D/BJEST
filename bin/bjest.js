"use strict";
global.bjest = require('../lib/loader');
var color = require('colors');
var fs = require('fs');
var path = require('path');
var program = require('commander');
var Behavior = require('../lib/Behavior');
var Runner = require('../lib/Runner');
var write = process.stderr.write.bind(process.stderr);
var version = JSON.parse(fs.readFileSync(__dirname + '/../package.json','utf8')).version;
program
    .version(version)
    .usage('[options] files')
    .option('-n, --num-tests <count>',
        '# of testcases per behavior',
        1000)
    .option('-S, --max-size <n>',
        'max value of "size" parameter for generated values',
        500)
    .option('-g, --grep <pattern>',
        'only run tests matching <pattern>');
program.name = 'bjest';
program.parse(process.argv);
program.args.forEach(testFile);
function testFile(filename) {
    var runner = new Runner();
    global.forAll = function (params, name, fn) {
        runner.newBehave(Behavior.forAll(params, name, fn));
    };
    global.describe = function (name, testFunc) {
        runner.newCategory(name);
        testFunc();
    };
    require(path.join(process.cwd(), filename));
    delete global.forAll;
    delete global.describe;
    delete global.bjest;
    write('Testing '.bold.green + filename + '\n');
    runner.run({
        grep: program.grep,
        numTests: program.numTests,
        maxSize: program.maxSize
    });
}