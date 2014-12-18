"use strict";
var contract = require("../lib/contractify.js");
var lodash= require("lodash");
var t = bjest.types;
var ArbArray  = [1,2,0,3];
var inarr = [3,2,1];
var include = function (array, elm){
	if (array.length == 0)
		return false;
	for (var cnt = 0; cnt < array.length; cnt++ )
	{
		if (array[cnt] === elm)
			return true;
	}
	return false;	
}

function notInclude(array, elem){
	return !include(array, elem);
}
var includeCon = contract.contractify(
	function(a, v) {
		return include(a,v);
	},
	{
		snapshot: function (a,v){
			return {len: a.length,
					cpyarr: a
				};
		},
		preCond: function(a,v){
			return a instanceof Array
			
		},
		postCond: function(snapshot, ans, a, v){
			return (a.length ==  snapshot.len) && ans == lodash.contains(a, v) && snapshot.cpyarr == a ;
	}
}
);
var isSubset = function(array1, array2) {
	  var len1 = array1.length;
	  for (var i = 0; i < len1; i++) {
	    if (includeCon(array2, array1[i]) == false) {
	      return false;
	    }
	  }
	  return true;
}	
var subsetCon = contract.contractify(
		function(array1, array2){
			return isSubset(array1 , array2);
		},
		{
			snapshot: function (array1, array2){
				return{
					length1: array1.length,
					length2: array2.length,
					array1c: array1,
					array2c: array2
				};
			},
			preCond: function(array1,array2){
				return array1 instanceof Array && array2 instanceof Array;
			},
			
			postCond: function(snapshot,ans,array1,array2 ){
				return snapshot.length1 == array1.length && snapshot.length2== array2.length && snapshot.array1c == array1 && snapshot.array2c == array2 &&
				isSubset(array1 , array2) == array1.every(function(val) { return array2.indexOf(val) >= 0; });
			}	 
		}
	);
	console.log(subsetCon(inarr, ArbArray));
	
forAll([t.suchThat(notInclude, t.arrayOf(t.string)), t.string],'subset is complete', function(x,y){
	console.log();
	//console.log(x);
	//console.log(y)
		return subsetCon(x,[y].concat(x))  && subsetCon(x,x);
});
