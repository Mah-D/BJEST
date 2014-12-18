"use strict"
var t = bjest.types;


function upwardThrow(mass, v0){
	var g = 9.8;
	var tr = v0/g;
	return v0 * tr - (1/2 * g * tr^2); 
}

forAll([t.int.positive,t.int.positive], 'glass ceiling is safe', function (x,y) {
	console.log('>>>mass is :', x ,'  initial velocity is: ', y);
    return upwardThrow(x,y) < 3;
});
