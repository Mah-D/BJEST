"use strict";
var ErrorSubclass = function ErrorSubclass() {};
ErrorSubclass.prototype = Error.prototype;

var bjestError = function bjestError() {
    if (!this instanceof bjestError) {
        throw new TypeError('illegal call to bjest');
    }
    var tmp = Error.prototype.constructor.apply(this, arguments);
    if (tmp.stack) {
        this.stack = tmp.stack.replace(/^Error/, 'bjestError');
    }
    if (tmp.message) {
        this.message = tmp.message;
    }
    this.name = 'bjestError';
    return this;
};
bjestError.prototype = new ErrorSubclass();
bjestError.prototype.constructor = bjestError;

var FailureError = function FailureError() {
    bjestError.prototype.constructor.apply(this, arguments);
    if (this.stack) {
        this.stack = this.stack.replace(/^bjestError/, 'FailureError');
    }
    this.name = 'FailureError';
};
FailureError.prototype = new bjestError();
FailureError.prototype.constructor = FailureError;

exports.bjestError = bjestError;
exports.FailureError = FailureError;