var t = bjest.types;
var pCheck = bjest.prediCheck;

function add(x, y) {
    return x + y;
}

var constraints = {
    operand: {
        numericality: {
            onlyInteger: true,
            greaterThan: 2
        }
    }
};

function pred(n) {
    return pCheck({
        operand: n
    }, constraints)
};

forAll([t.constant(5), t.suchThat(pred, t.int.positive)], 'addition is commutative', function (x, y) {
    console.log(x, y);
    return add(x, y) === add(y, x);
});