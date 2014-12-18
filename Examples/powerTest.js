var t = bjest.types;

function mathPower(base, exponent) {

    if (exponent < 0) {
        return mathPower(1 / base, -exponent);
    }

    if (exponent === 0) {
        return 1;
    }

    if (base === 0) {
        return 0;
    }

    var result = 1;
    while (exponent-- > 0) {
        result *= base;
    }
    return result;
}

forAll([t.int, t.int], 'power is correct', function (x, y) {
    return mathPower(x, y) === Math.pow(x, y) ||
        (Math.abs(mathPower(x, y) - Math.pow(x, y)) / Math.pow(x, y)) < 0.00000001;
});