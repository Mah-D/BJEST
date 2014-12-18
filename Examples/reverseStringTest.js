var t = bjest.types;

function reverse(s) {
   return s.split("").reverse().join("");
}

forAll([t.string], 'reverse works correctly', function (s) {
    return reverse(reverse(s)) === s;
});