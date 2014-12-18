"use strict"
var t = bjest.types;

function maxStretch(mass){
	var K = 300;
	var g = 9.8;
	return mass * g / K ; 
}

forAll([t.int.positive], 'glass table is safe', function (x) {
	console.log('>>>mass is :', x );
	var K = 300;
	var g = 9.8;
    return maxStretch(x) < 3;
});
