"use strict";
var Thunk = function (f) {
    if (!(this instanceof Thunk)) {
        return new Thunk(f);
    }

    this._f = f;
    this._realized = false;
    return this;
};

Thunk.prototype = {
    get: function () {
        if (!this._realized) {
            this._value = this._f();
            this._realized = true;
            this._f = null;
        }
        return this._value;
    }
};
var emptyThunk = new Thunk(function () {
    return [];
});
//data RoseTree a = RoseTree a (RoseTree a)
var RoseTree = function (root, childrenFunc) {
    if (!(this instanceof RoseTree)) {
        return new RoseTree(root, childrenFunc);
    }
    this.root = root;
    this._children = childrenFunc ? new Thunk(childrenFunc) : emptyThunk;
};
// RoseTree (RoseTree a) -> RoseTree a
function flatten(tree) {
    if (!(tree.root instanceof RoseTree)) {
        throw new TypeError("Can't call flatten when elements aren't trees");
    }
    return new RoseTree(
        tree.root.root,
        function () {
            var innerChildren = tree.root.children();
            var outerChildren = tree.children().map(flatten);
            return outerChildren.concat(innerChildren);
        }
    );
}
// (a -> b) -> RoseTree a -> RoseTree b
function fmap(f, tree) {
    return new RoseTree(
        f(tree.root),
        function () {
            return tree.children().map(fmap.bind(null, f));
        }
    );
}
// RoseTree a -> (a -> Bool) -> RoseTree a
function filterSubtrees(pred, tree) {
    return new RoseTree(
        tree.root,
        function () {
            return tree.children().filter(function (subtree) {
                return pred(subtree.root);
            }).map(filterSubtrees.bind(null, pred));
        }
    );
}
RoseTree.prototype = {
    children: function () {
        return this._children.get();
    },
	// RoseTree a -> (a -> b) -> RoseTree b
    map: function (f) {
        return fmap(f, this);
    },
	// RoseTree a -> (a -> RoseTree b) -> RoseTree b
    flatmap: function (f) {
        return flatten(fmap(f, this));
    },
	// RoseTree a -> (a -> Bool) -> RoseTree a
    filterSubtrees: function (pred) {
        return filterSubtrees(pred, this);
    }
};
module.exports = RoseTree;