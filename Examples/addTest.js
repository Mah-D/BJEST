"use strict"
var bjest = require('../main');
var contractify = require('../lib/contractify.js');
var t = bjest.types;
/*
function add(x, y) {
    return x / y;
}
*/

var devideByTwo = {
    div_preCon: function(a, b) {
        //Assert.ok(b != 0);
		if (b == 0){
			return false;
		}
    },

    div: function(a, b) {
		
        return a / b;
    },

    div_postCon: function(a, b, result) {
		
        //Assert.equal(a / b, result);
		if (result == 1){
			return false;
		}
    }
};

contractify.instrument(devideByTwo);



forAll([t.int, t.int], 'addition is commutative', function (x, y) {
console.log();
console.log(x);
console.log(y);   
console.log(devideByTwo.div(x, y));

});