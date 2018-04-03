## jsep-eval: evaluate javascript expressions

jsep-eval evaluates javascript expressions, and uses [jsep](http://jsep.from.so/) to parse the expressions. A context can/should be supplied against which identifers are matched.


### Usage

#### Node.JS
First, run `npm install jsep-eval`. Then, in your source file:
```javascript
const jsepEval = require("jsep-eval");
const evaluate = jsepEval.evaluate;
const two = evaluate('1 + 1');
const three = evaluate('two + 1', {two: 2});
```
#### Configure evaluation restrictively
jsep-eval exposes the objects the allowed expression types
```javascript
const types = jsepEval.types;
```
So it is possible to dis-allow a given expression type by removing it from this array:
```javascript
const types = jsepEval.types;
evaluate('2 + 2'); // returns 4
delete types.BINARY;
evaluate('2 + 2'); // throws error
```
It is also possible to restrict evaluation by operator (both binary and unary):
```javascript
const binaryOps = jsepEval.operators.binary;
const unaryOps = jsepEval.operators.unary;

evaluate('2 === 2'); // returns true
delete binaryOps['==='];
evaluate('2 === 2'); // throws error

evaluate('!false'); // returns true
unaryOps['!'] = () => 'bob';
evaluate('!false'); // returns 'bob'
```

### License
jsep-eval is under the MIT license. See LICENSE file.
