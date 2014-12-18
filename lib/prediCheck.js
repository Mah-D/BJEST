//Do Not USE THIS 
(function (exports, module, define, require) {
    "use strict";
    var checkPredicate = function (attributes, constraints, options) {
        options = options || {};
        var results = v.runCheckings(attributes, constraints, options),
            attr, predicate;
        return checkPredicate.processCheckingResults(results, options);
    };

    var v = checkPredicate,
        root = this,
        FORMAT_REGEXP = /%\{([^\}]+)\}/g;
    v.extend = function (obj) {
        [].slice.call(arguments, 1).forEach(function (source) {
            for (var attr in source) {
                obj[attr] = source[attr];
            }
        });
        return obj;
    };

    v.extend(checkPredicate, {
        runCheckings: function (attributes, constraints, options) {
            var results = [],
                attr, predicateName, value, predicates, predicate, predicateOptions, error;
            for (attr in constraints) {
                value = v.getDeepObjectValue(attributes, attr);
                predicates = v.result(constraints[attr], value, attributes, attr);

                for (predicateName in predicates) {
                    predicate = v.predicates[predicateName];

                    if (!predicate) {
                        error = v.format("undefined predicate %{name}", {
                            name: predicateName
                        });
                        throw new Error(error);
                    }

                    predicateOptions = predicates[predicateName];

                    predicateOptions = v.result(predicateOptions, value, attributes, attr);
                    if (!predicateOptions) {
                        continue;
                    }
                    results.push({
                        attribute: attr,
                        error: predicate.call(predicate, value, predicateOptions, attr,
                            attributes)
                    });
                }
            }

            return results;
        },
        processCheckingResults: function (results, options) {
            var errors = {};

            // This indexes the errors per attribute
            results.forEach(function (result) {
                var error = result.error,
                    attribute = result.attribute;

                if (v.isString(error)) {
                    error = [error];
                }

                if (error) {
                    errors[attribute] = (errors[attribute] || []).concat(error);
                }
            });
            var msgResult = [];
            for (var _ in errors) {
                msgResult.push(v.fullMessages(errors, options));
            }
            if (msgResult.length === 0) {
                console.log('passes all predicates');
                return true;
            } else {
                console.log(msgResult);
                return false;
            }
        },
        result: function (value) {
            var args = [].slice.call(arguments, 1);
            if (typeof value === 'function') {
                value = value.apply(null, args);
            }
            return value;
        },

        isNumber: function (value) {
            return typeof value === 'number' && !isNaN(value);
        },

        isFunction: function (value) {
            return typeof value === 'function';
        },

        isInteger: function (value) {
            return v.isNumber(value) && value % 1 === 0;
        },

        isObject: function (obj) {
            return obj === Object(obj);
        },

        isDefined: function (obj) {
            return obj !== null && obj !== undefined;
        },

        format: function (str, vals) {
            return str.replace(FORMAT_REGEXP, function (m0, m1) {
                return String(vals[m1]);
            });
        },

        prettify: function (str) {
            return str

                .replace(/([^\s])\.([^\s])/g, '$1 $2')
                .replace(/\\+/g, '')
                .replace(/[_-]/g, ' ')
                .replace(/([a-z])([A-Z])/g, function (m0, m1, m2) {
                    return "" + m1 + " " + m2.toLowerCase();
                })
                .toLowerCase();
        },

        isString: function (value) {
            return typeof value === 'string';
        },

        isArray: function (value) {
            return {}.toString.call(value) === '[object Array]';
        },

        contains: function (obj, value) {
            if (!v.isDefined(obj)) {
                return false;
            }
            if (v.isArray(obj)) {
                return obj.indexOf(value) !== -1;
            }
            return value in obj;
        },

        getDeepObjectValue: function (obj, keypath) {
            if (!v.isObject(obj) || !v.isString(keypath)) {
                return undefined;
            }

            var key = "",
                i, escape = false;

            for (i = 0; i < keypath.length; ++i) {
                switch (keypath[i]) {
                case '.':
                    if (escape) {
                        escape = false;
                        key += '.';
                    } else if (key in obj) {
                        obj = obj[key];
                        key = "";
                    } else {
                        return undefined;
                    }
                    break;

                case '\\':
                    if (escape) {
                        escape = false;
                        key += '\\';
                    } else {
                        escape = true;
                    }
                    break;

                default:
                    escape = false;
                    key += keypath[i];
                    break;
                }
            }

            if (key in obj) {
                return obj[key];
            } else {
                return undefined;
            }
        },

        capitalize: function (str) {
            if (!v.isString(str)) {
                return str;
            }
            return str[0].toUpperCase() + str.slice(1);
        },

        fullMessages: function (errors, options) {
            options = options || {};

            var ret = options.flatten ? [] : {},
                attr;

            if (!errors) {
                return ret;
            }

            function processErrors(attr, errors) {
                errors.forEach(function (error) {
                    if (error[0] === '^') {
                        error = error.slice(1);
                    } else if (options.fullMessages !== false) {
                        error = v.format("%{attr} %{message}", {
                            attr: v.capitalize(v.prettify(attr)),
                            message: error
                        });
                    }
                    error = error.replace(/\\\^/g, "^");
                    if (options.flatten) {
                        ret.push(error);
                    } else {
                        (ret[attr] || (ret[attr] = [])).push(error);
                    }
                });
            }

            for (attr in errors) {
                processErrors(attr, errors[attr]);
            }
            return ret;
        },

        tryRequire: function (moduleName) {
            if (!v.require) {
                return null;
            }
            try {
                return v.require(moduleName);
            } catch (e) {
                return null;
            }
        },

        require: require,

        exposeModule: function (checkPredicate, root, exports, module, define) {
            if (exports) {
                if (module && module.exports) {
                    exports = module.exports = checkPredicate;
                }
                exports.checkPredicate = checkPredicate;
            } else {
                root.checkPredicate = checkPredicate;
                if (checkPredicate.isFunction(define) && define.amd) {
                    define("checkPredicate", [], function () {
                        return checkPredicate;
                    });
                }
            }
        },

        warn: function (msg) {
            if (typeof console !== "undefined" && console.warn) {
                console.warn(msg);
            }
        },

        error: function (msg) {
            if (typeof console !== "undefined" && console.error) {
                console.error(msg);
            }
        }
    });

    checkPredicate.predicates = {
        presence: function (value, options) {
            var message = options.message || "must have a value",
                attr;

            if (!v.isDefined(value)) {
                return message;
            }

            if (v.isFunction(value)) {
                return;
            }

            if (typeof value === 'string') {
                if ((/^\s*$/).test(value)) {
                    return message;
                }
            } else if (v.isArray(value)) {
                if (value.length === 0) {
                    return message;
                }
            } else if (v.isObject(value)) {
                for (attr in value) {
                    return;
                }
                return message;
            }
        },
        length: function (value, options) {
            if (!v.isDefined(value)) {
                return;
            }

            var is = options.is,
                maximum = options.maximum,
                minimum = options.minimum,
                tokenizer = options.tokenizer || function (val) {
                    return val;
                },
                err, errors = [];

            value = tokenizer(value);

            if (v.isNumber(is) && value.length !== is) {
                err = options.wrongLength ||
                    "has an incorrect length (should have %{count} characters)";
                errors.push(v.format(err, {
                    count: is
                }));
            }

            if (v.isNumber(minimum) && value.length < minimum) {
                err = options.tooShort ||
                    "is shorter than it's supposed to be (at least %{count} characters)";
                errors.push(v.format(err, {
                    count: minimum
                }));
            }

            if (v.isNumber(maximum) && value.length > maximum) {
                err = options.tooLong ||
                    "is longer than it's supposed to be (at most %{count} characters)";
                errors.push(v.format(err, {
                    count: maximum
                }));
            }

            if (errors.length > 0) {
                return options.message || errors;
            }
        },
        numericality: function (value, options) {
            if (!v.isDefined(value)) {
                return;
            }

            var errors = [],
                name, count, checks = {
                    greaterThan: function (v, c) {
                        return v > c;
                    },
                    greaterThanOrEqualTo: function (v, c) {
                        return v >= c;
                    },
                    equalTo: function (v, c) {
                        return v === c;
                    },
                    lessThan: function (v, c) {
                        return v < c;
                    },
                    lessThanOrEqualTo: function (v, c) {
                        return v <= c;
                    }
                };

            if (options.noStrings !== true && v.isString(value)) {
                value = +value;
            }

            if (!v.isNumber(value)) {
                return options.message || "not a valid number";
            }

            if (options.onlyInteger && !v.isInteger(value)) {
                return options.message || "must be an integer";
            }

            for (name in checks) {
                count = options[name];
                if (v.isNumber(count) && !checks[name](value, count)) {
                    errors.push(v.format("must be %{type} %{count}", {
                        count: count,
                        type: v.prettify(name)
                    }));
                }
            }

            if (options.odd && value % 2 !== 1) {
                errors.push("must be odd");
            }
            if (options.even && value % 2 !== 0) {
                errors.push("must be even");
            }

            if (errors.length) {
                return options.message || errors;
            }
        },
        format: function (value, options) {
            if (v.isString(options) || (options instanceof RegExp)) {
                options = {
                    pattern: options
                };
            }

            var message = options.message || "is invalid",
                pattern = options.pattern,
                match;

            if (!v.isDefined(value)) {
                return;
            }
            if (!v.isString(value)) {
                return message;
            }

            if (v.isString(pattern)) {
                pattern = new RegExp(options.pattern, options.flags);
            }
            match = pattern.exec(value);
            if (!match || match[0].length != value.length) {
                return message;
            }
        },
        inclusion: function (value, options) {
            if (v.isArray(options)) {
                options = {
                    within: options
                };
            }
            if (!v.isDefined(value)) {
                return;
            }
            if (v.contains(options.within, value)) {
                return;
            }
            var message = options.message || "^%{value} is not seen in the list";
            return v.format(message, {
                value: value
            });
        },
        exclusion: function (value, options) {
            if (v.isArray(options)) {
                options = {
                    within: options
                };
            }
            if (!v.isDefined(value)) {
                return;
            }
            if (!v.contains(options.within, value)) {
                return;
            }
            var message = options.message || "^%{value} is limited";
            return v.format(message, {
                value: value
            });
        }
    };

    checkPredicate.exposeModule(checkPredicate, root, exports, module, define);
}).call(this,
    typeof exports !== 'undefined' ? exports : null,
    typeof module !== 'undefined' ? module : null,
    typeof define !== 'undefined' ? define : null,
    typeof require !== 'undefined' ? require : null);