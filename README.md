**BJEST** is a Behavioral Conformance Testing tool for Javascript.
The idea is to help  testers to not to write testcases, instead, define valid behaviors in the form of predicate for the program under the test, and then BJest will generate values to check if the defined behavior holds.

To run: run bjest in [NodeJs](http://nodejs.org/) and pass the target file.
Options: ``` -n [#test cases] -s[size of test case]```

###1. Basic examples###

1. #####atmTest#####
has a withdraw function which simply receives two inputs namely 'balance' and 'amount' and decrements current balance by amount value and returns the new balance. The behavior we define here is just to make sure withdrawal amount is always less than the current balance i.e. the new balance never should be less than 0. We name this behavior atmTest() and pass it to BJEST along with number of tries and type of inputs, where here is non-negative numbers.

2. #####divTest#####
divTest.js defines the division operation on two given operands namely x and y. To check if division holds commutative behavior, we simply put a check to commutative behavior and BJest tests this behavior on integer types.

3. #####powerTest#####
We defined our power operation and to check if it performs soundly. we define a behavior that a correct power function should
return the same value as power function in Javascript ```Math``` library. The original function has some bugs and we commented out four steps to make it correct.

2. Supported Datatypes:
To see examples for each datatypes run: $ node sampling.js

###2. Basic Data types###

BJEST can generate values for the following primitive datatypes. ```bjest.sample([type])```  will return a sample array of the given
type. Run ```sampling.js``` to see a sample of all types.

- int
- 
        ```bjest.sample(t.int);   		//->[ -1, 0, 2, -1, 0, 2, 3, 3, -2, -1 ]```

- int.positive
        bjest.sample(t.int.positive); //->[ 2, 2, 1, 3, 1, 2, 5, 3, 2, 5 ]
- int.nonNegative
        bjest.sample(t.int.nonNegative); //->[ 1, 1, 0, 2, 0, 1, 4, 2, 1, 4 ]
- int.nonZero
        bjest.sample(t.int.nonZero); //->[ 1, -1, 2, -2, -1, 3, -1, -3, 3, -1 ]
- char
        bjest.sample(t.char); //->[ '\\', 'p', '(', '}', '\'', 'A', 't', 'G', '3', 'k' ]
- string
        bjest.sample(t.string)); //->[ 'p', '', '\'A', 'G3', 'B"_', '-', '/Z>', 'UU?', ']', ')?T/' ]
    -bool
        bjest.sample(t.bool); //-> [true, false, false, true, false, true, false, false, false, true ]

###3. Advanced Data typ###

Bjest can also generate values for the following non-primitive datatypes:

- arrayOf: receive a datatypes and generate array of give datatype.
        bjest.sample(t.arrayOf( t.int)); //-> [ [ -1 ],[],[ -1, -2 ],[],[ -1, 1, 1 ],[ -1 ],[],
        [ -4 ],[ 5, 3, 3, 2, 2 ],[ 0, -2, 0, 1 ] ]

- record: receive a list if different datatypes and generate value for each one in the given order.
        bjest.sample(t.record( [t.bool,t.int, t.string, t.char])); //-> [ [ true, 0, 'C', 'R' ],[ true, 0, '', 'p' ],
        [ false, -2, '', 'i' ],[ false, 1, '', '\\' ],[ true, -1, 'BJ', 'I' ],[ false, 0, '3G', 't' ], 
        [ true, 2, 'g', ';' ],[ false, -4, 'M', 't' ],[ false, -1, ';', '\'' ], [ false, 3, '2H=', '9' ] ]

- oneOf: receive a list of types and generate value for any of the given types.
        bjest.sample(t.oneOf([t.bool, t.int]));//->[ true, -1, true, 0, false, false, true, false, false, 0 ]
        
- elements: generate one of given elements.
        var shape = t.elements(['circle', 'rect', 'box']); bjest.sample(shape);
        //->[ 'box','circle','circle','circle','rect','circle','box','box','circle','rect' ]

- entity: tries to mimic object concept. Given an entity, BJest generate values for its fields.
        var employee = t.entity({
            ID: t.int.positive,
            empName: t.string
            });
            bjest.sample(employee);
        //->[ { ID: 2, empName: 'S' },{ ID: 2, empName: ']' },{ ID: 3, empName: 'S' },{ ID: 3, empName: 'O' },
        { ID: 3, empName: 'I -' },{ ID: 4, empName: '' },{ ID: 2, empName: '' },{ ID: 4, empName: 'C^' },
        { ID: 4, empName: 'y-b' },{ ID: 3, empName: 'lk' } ]

- fmap: receive a function and a type and maps the given function to the generated value of the given type.
        var cubic = t.fmap(function(n) {
            return Math.pow(3, n);}, t.int.nonNegative);
            bjest.sample(cubic);//-> [ 1, 1, 9, 3, 27, 27, 9, 3, 81, 27 ]
            
- suchThat: receives a predicate and type and generated values of the given type that pass predicate. A common case could be generating nonempty array:
        function isNonempty(val) { return val.length > 0; }
        var notEmptyArray = t.suchThat(isNotEmpty,t.arrayOf(t.char));
	suchThat receives predicates. checkPredicate is a library that lets a developer 	writes his constraints and and then you can check all these constraints against 	generated value. This can clearly show how random value generation is broken. 
	Currently the following constraints are available:
	- presence
	- length:		is, maximum, minimum
	- numericallity:		onlyInteger, greaterThan, greaterThanOrEqualTo, equalTo,lessThanOrEqualTo, lessThan, odd, even
	- format:		[check against regular expression pattern]
	- inclusion/exclusion

	You can use predCheck even without BJEST, though the idea was to use it with suchThat(). Example:
	
	
	var constraints = {
        creditCardNumber: {
            presence: true,
            format: {
            pattern: /^(34|37|4|5[1-5]).*$/,
            message: "must be a valid Amex, Visa or Mastercard #"
                },
            length: function(value, attributes, attributeName) {
                if (value) {
                     // Amex
                 if ((/^(34|37).*$/).test(value)) return {is: 15};
                    // Visa, Mastercard
                 if ((/^(4|5[1-5]).*$/).test(value)) return {is: 16};
                    }
            // Undefined card#, does not pass length check.
      return false;
            }
        },
        creditCardZip: function(value, attributes, attributeName) {
            if (!(/^(34|37).*$/).test(attributes.creditCardNumber)) return null;
                return {
                    presence: true,
                    length: {is: 5}
                };
            }
        };
        
Then,
	
	prediCheck({creditCardNumber: "4"}, constraints)
	returns False, " creditCardNumber: [ 'Credit card number has an incorrect length (should have 16 characters"
	prediCheck({creditCardNumber: "4242424242424242"}, constraints) and 
	prediCheck({creditCardNumber: "340000000000000", creditCardZip:"34300"}, constraints)
	
returns True.
        
I recommend to generate concrete values directly instead of filtering them. You should know probability is always against you. Example:

        //This is not good:
            var sixIsAwful = t.suchThat(
            function(n) { return n%6 === 0; },
            t.int.nonNegative);
       // This is better:
            var sixIsOK = t.fmap(function(n) { return n*6; },t.int.nonNegative);
            


- append: from the family of fmap. Generate values for a given type, where generated value mapped to a sampled function. This is a powerful tool for building test cases of values you already have. Suppose you want to test a function like ```Array.prototype.indexOf``` and you want array with elements from the give array:
        var t = bjest.types;
        function isNotEmpty(val) { return val.length > 0; }
        // This gives you a nonempty arrays of char.
        var charArray = t.suchThat(isNotEmpty,t.arrayOf(t.char));
        var arrayAndElement = t.append(charArray,function(chars) {
	    return t.record([t.elements(chars), t.constant(chars)]);});
	    bjest.sample(arrayAndElement);
	    //->[ [ '*', [ '*' ] ],
            [ 'P', [ 'P' ] ],
            [ 'b', [ 'b', 'p' ] ],
            [ ' ', [ ' ' ] ],
            [ '%', [ '%', 'O' ] ],
            [ 'F', [ ' ', 'F', '`' ] ],
            [ 'N', [ 'b', 'N' ] ],
            [ '/', [ '1', '/' ] ],
            [ ']', [ ']', 'l' ] ],
            [ '>', [ '$', '>', 'e' ] ] ]

    
###4. API###
    -forAll([BJEST types], 'test cases behavior', function () {
    //predicate
    });
    
generates values for arguments and check if the behavior holds with the passed number of testcases
```bjest.sample(datatypes, count)```
    generate sample value for a given datatype. samoling.js uses this method.

### 5. Few interesting cases###
Back to our employee enitity sample. Now image you want the age to be larger than 18. suchThat is not a good way, 
    instead you can do the following:
    
    var employeeGen = t.entity({
        name: t.string,
        age: t.fmap(function(n) { return n + 18; },t.int.nonNegative)});

**Create your generator:**
    The whole purpose of this project is to ease the testers task to not create/generate values and testcase, but to use fmap and append...Example:
    
    var schedule = function(begin, end) {
        this.begin = begin;
        this.end = end;
        }
    schedule.prototype.isConflicting = function([args]) { /* ... */ };
    
To make a schedule, testee just need to generate beging and end time concrete values and passes them to the
    constructor. Now tester can generate the values using record:
    
    t.record([t.int.nonNegative,t.int.nonNegative]);
    Then fmap over each generated time value:

    var genSchedule = t.fmap(function(record) {
      return new schedule(record[0], record[1]);},
        t.record([t.int.nonNegative,t.int.nonNegative));
        
Now, tester can use genSchedule in a defined behavior like a built-in datatype:

    forAll([genShecule], 'Schedule is conflicting', function(schedule) {
        return schedule.isConflicting(schedule);});
        
