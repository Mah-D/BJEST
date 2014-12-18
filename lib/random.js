// This is a simple implementation of Pseudorandom number generator
// For more information: http://en.wikipedia.org/wiki/Pseudorandom_number_generator
//TODO: LOOKING FOR A GOOD OFF-THE-SHELF PRNG LIBRARY
function random(seed) {
    if (arguments.length < 1) {
        throw new TypeError('prng is not seeded');
    }
    seed >>>= 0;
    var mdi = this.mdi = new Array(4);
    mdi[0] = 0xf1ea5eed;
    mdi[1] = mdi[2] = mdi[3] = seed;
    for (var i = 0; i < 20; i++) {
        this.next();
    }
    return this;
}

function rotate(x, k) {
    return (x << k) | (x >> (32 - k));
}

random.prototype.next = function () {
    var mdi = this.mdi;
    var e = (mdi[0] - rotate(mdi[1], 27)) >>> 0;
    mdi[0] = (mdi[1] ^ rotate(mdi[2], 17)) >>> 0;
    mdi[1] = (mdi[2] + mdi[3]) >>> 0;
    mdi[2] = (mdi[3] + e) >>> 0;
    mdi[3] = (e + mdi[0]) >>> 0;
    return mdi[3];
};

random.prototype['float'] = function () {
    return this.next() / 4294967296.0;
};


module.exports = random;