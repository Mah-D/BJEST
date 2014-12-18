var contract = require("../lib/contractify.js");
var t = bjest.types;
//Helpers
var isHomogen = function (arr){
	for(var c = 0; c < arr.length -1; c++){
		if(typeof arr[c] != typeof arr[c+1])
		return false;
	}
	return true;
}

var count = function (array){
	var counts = {};
    for (var idx = 0; idx < array.length; idx++) {	
        var x = array[idx];
        if (counts[x] === undefined){
            counts[x] = 1;
		}
        else
            counts[x]++;
	}
    return counts;
}
var unsortedArray = [34, 203, 3, 746, 3, 984, 198, 764, 9];

//Bubble Sort
var bsort = function (a){
var swapped;
do {
    swapped = false;
    for (var i=0; i < a.length-1; i++) {
        if (a[i] > a[i+1]) {
            var temp = a[i];
            a[i] = a[i+1];
            a[i+1] = temp;
            swapped = true;
        }
    }
} while (swapped);
return a;
}

// Sort under contractify
var sort = contract.contractify(
    function(xs) {
        return bsort(xs);
    }, {
        snapshot: function(xs) {
           
            return {
            	length: xs.length,
				count: count(xs)
            };
        },
        preCond: function(xs) {
		
			return  (xs instanceof Array) && isHomogen(xs); 		
        },
        postCond: function(snapshot, ans, xs) {
			var newCount = count(xs);
			if (xs.length !=  snapshot.length){
				return false;
			}
			for(var k in snapshot.count){
				if (newCount[k]!= snapshot.count[k])
				return false;
			} 
            for (var idx = 0; idx < xs.length-1; idx++) {
                if (typeof xs[idx + 1] !== typeof xs[idx] ||  xs[idx + 1] < xs[idx]) {
                    return false;
                }
            }
            return true;
        }
    }
);
forAll([t.arrayOf(t.int)], 'testing sort', function (x) {
	//console.log('>>>unsorted array is :', x );
    return sort(x) ;
});
