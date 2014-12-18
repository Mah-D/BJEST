"use strict";
var RoseTree = require('./RoseTree');
// gets array and function, returns an array of rose trees where each tree's root is the element and its children are fun(element).
// [a] -> (a -> [a]) -> RoseTree a

function arrayToRoseTrees(array, fun) {
    return array.map(function (element) {
        return new RoseTree(element, function () {
            return fun(element);
        });
    });
}
//(a -> [a]) -> (a -> [RoseTree a])
function roseify(f) {
    var roseified = function () {
        var restArgs = [].slice.call(arguments, 1);
        return arrayToRoseTrees(
            f.apply(null, arguments),
            function (value) {
                return roseified.apply(null, [value].concat(restArgs));
            }
        );
    };
    return roseified;
}


function roundTowardZero(x) {
    if (x < 0) {
        return Math.ceil(x);
    }
    return Math.floor(x);
}


exports.int = roseify(function (n, center) {
    var diff = center - n;
    var out = [];
    while (Math.abs(diff) >= 1) {
        out.push(n + roundTowardZero(diff));
        diff /= 2;
    }
    return out;
});

exports.array = function (xtrees, tryRemoving) {
    var withElemsRemoved = []; // [[RoseTree a]]
    var withElemsShrunk = []; // [[RoseTree a]]
    var i;

    xtrees.forEach(function (xtree, index) {
        var xtreesBefore = xtrees.slice(0, index);
        var xtreesAfter = xtrees.slice(index + 1);

        if (tryRemoving) {
            withElemsRemoved.push(xtreesBefore.concat(xtreesAfter));
        }

        xtree.children().forEach(function (childNode) {
            var withAnElemShrunk = xtreesBefore.concat([childNode])
                .concat(xtreesAfter);
            withElemsShrunk.push(withAnElemShrunk);
        });
    });
  // [RoseTree a] -> RoseTree [a]
    var xtreesToArray = function (xts) {
        return new RoseTree(
            xts.map(function (tree) {
                return tree.root;
            }),
            function () {
                return exports.array(xts, tryRemoving);
            }
        );
    };

    return withElemsRemoved.concat(withElemsShrunk).map(xtreesToArray);
};