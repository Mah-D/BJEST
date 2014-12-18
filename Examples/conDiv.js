var contract = require("../lib/contractify.js");
var t = bjest.types;

var div = contract.contractify(
  function(x, y) { return x / y; }, {
    snapshot: function(x, y) {},
    preCond:  function(x, y) {
		
		return typeof x === "number" && typeof y === "number" && y!=0 ;
	},
    postCond: function(snapshot, ans, x, y) {
		
      return ans == x / y;
    }
  }
);


forAll([t.int, t.int.positive], 'testing div', function (x, y) {
	console.log('>>>x is :', x , ">>>>y is :", y);
    return div(x,y);
});
