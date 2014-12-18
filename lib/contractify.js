function contractify(f, args) {
    return function() {
        if (args.preCond && !args.preCond.apply(this, arguments)) {
            var e = new Error('didn\'t pass precondition');
            var problemSpot = e.stack.split('\n')[2];
            console.log('there is a bug here:\n' + problemSpot);
            throw e;
        }
        var snapshot = (args.snapshot || function() {}).apply(this, arguments);
        var ans = f.apply(this, arguments);
        if (args.postCond) {
            var vs = [snapshot, ans];
            for (var idx = 0; idx < arguments.length; idx++) {
                vs.push(arguments[idx]);
            }
            if (!args.postCond.apply(this, vs)) {
                var e = new Error('didn\'t pass postcondition');
                var problemSpot = f.toString();
                console.log('there is a bug here:\n' + problemSpot);
                throw e;
            }
        }
        return ans;
    };
}
module.exports.contractify = contractify;
