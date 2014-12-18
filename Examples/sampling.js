var bjest = require('../main');
var colors = require('colors');
var t = bjest.types;

//console.log(bjest.sample(t.record([t.bool, t.int, t.bool, t.string, t.number])));
console.log("premitive datatypes--------:");
console.log("some int :  ".bold.green, bjest.sample(t.int));
console.log("some positive int :  ".bold.green, bjest.sample(t.int.positive));
console.log("some nonNegative int :  ".bold.green, bjest.sample(t.int.nonNegative));
console.log("some nonZero int :  ".bold.green, bjest.sample(t.int.nonZero));
console.log("some char :  ".bold.yellow, bjest.sample(t.char));
console.log("some string :  ".bold.yellow, bjest.sample(t.string));
console.log("some bool :  ".bold.yellow, bjest.sample(t.bool));
console.log("========================");
console.log("combinatorial datatypes--------:");
console.log("Array of some int>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>".bold.grey, bjest.sample(t.arrayOf(t.int,5)));
console.log("Array of some string".bold.grey, bjest.sample(t.arrayOf(t.string)));
console.log("Array of some bool".bold.grey, bjest.sample(t.arrayOf(t.bool)));
console.log("a record of bool, int, string char in order".bold.grey, bjest.sample(t.record([t.bool, t.int, t.string, t.char])));
console.log("oneOf".bold.grey, bjest.sample(t.oneOf([t.bool, t.int])));
//console.log("Constant".bold.grey, bjest.sample(t.constant(t.int)));

var shape = t.elements(['circle', 'rect', 'box']);
console.log("Shape:", bjest.sample((shape),100));

var movie = t.entity({
    name: t.string,
    time: t.int.positive,
    director: t.entity({
        name: t.string,
        age: t.int.nonNegative
    })
});
console.log("object field value generation".bold.red, bjest.sample(movie));
console.log("object field value generation".bold.red, bjest.sample(t.arrayOf(movie)));

var cubic = t.fmap(function (n) {
    return Math.pow(3, n);
}, t.int.nonNegative);
console.log("fMap".bold.red, bjest.sample(cubic));


function isNotEmpty(val) {
        return val.length > 0;
    }
    // This gives you a nonempty arrays of char.
var charArray = t.suchThat(isNotEmpty, t.arrayOf(t.char));
var arrayAndElement = t.append(charArray, function (chars) {
    return t.record([t.elements(chars), t.constant(chars)]);
});
console.log(bjest.sample(arrayAndElement));

function isNonempty(val) {
    return val.length > 0;
}
var notEmptyArray = t.suchThat(isNotEmpty, t.arrayOf(t.char));

function is_sorted(arr) {
    var len = arr.length - 1;
    for(var i = 0; i < len; ++i) {
        if(arr[i] > arr[i+1]) {
            return false;
        }
    }
    return true;
}