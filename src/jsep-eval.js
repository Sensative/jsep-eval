//
// evaluates javascript expression statements parsed with jsep
//

const _ = require('lodash');
const jsep = require('jsep');
const assert = require('assert');

const operators = {
  binary: {
    '===': (a, b) => (a === b),
    '!==': (a, b) => (a !== b),
    '==': (a, b) => (a == b), // eslint-disable-line
    '!=': (a, b) => (a != b), // eslint-disable-line
    '>': (a, b) => (a > b),
    '<': (a, b) => (a < b),
    '>=': (a, b) => (a >= b),
    '<=': (a, b) => (a <= b),
    '+': (a, b) => (a + b),
    '-': (a, b) => (a - b),
    '*': (a, b) => (a * b),
    '/': (a, b) => (a / b),
    '%': (a, b) => (a % b), // remainder
    '**': (a, b) => (a ** b), // exponentiation
    '&': (a, b) => (a & b), // bitwise AND
    '|': (a, b) => (a | b), // bitwise OR
    '^': (a, b) => (a ^ b), // bitwise XOR
    '<<': (a, b) => (a << b), // left shift
    '>>': (a, b) => (a >> b), // sign-propagating right shift
    '>>>': (a, b) => (a >>> b), // zero-fill right shift
    // Let's make a home for the logical operators here as well
    '||': (a, b) => (a || b),
    '&&': (a, b) => (a && b),
  },
  unary: {
    '!': a => !a,
    '~': a => ~a, // bitwise NOT
    '+': a => +a, // unary plus
    '-': a => -a, // unary negation
    '++': a => ++a, // increment
    '--': a => --a, // decrement
  },
};

const types = {
  // supported
  LITERAL: 'Literal',
  UNARY: 'UnaryExpression',
  BINARY: 'BinaryExpression',
  LOGICAL: 'LogicalExpression',
  CONDITIONAL: 'ConditionalExpression',  // a ? b : c
  MEMBER: 'MemberExpression',
  IDENTIFIER: 'Identifier',
  THIS: 'ThisExpression', // e.g. 'this.willBeUsed'
  CALL: 'CallExpression', // e.g. whatcha(doing)
  ARRAY: 'ArrayExpression', // e.g. [a, 2, g(h), 'etc']
  COMPOUND: 'Compound' // 'a===2, b===3' <-- multiple comma separated expressions.. returns last
};
const undefOperator = () => undefined;

const getParameterPath = (node, context) => {
  assert(node, 'Node missing');
  const type = node.type;
  assert(_.includes(types, type), 'invalid node type');
  assert(_.includes([types.MEMBER, types.IDENTIFIER], type), 'Invalid parameter path node type: ', type);
  // the easy case: 'IDENTIFIER's
  if (type === types.IDENTIFIER) {
    return node.name;
  }
  // Otherwise it's a MEMBER expression
  // EXAMPLES:  a[b] (computed)
  //            a.b (not computed)
  const computed = node.computed;
  const object = node.object;
  const property = node.property;
  // object is either 'IDENTIFIER', 'MEMBER', or 'THIS'
  assert(_.includes([types.MEMBER, types.IDENTIFIER, types.THIS], object.type), 'Invalid object type');
  assert(property, 'Member expression property is missing');

  let objectPath = '';
  if (object.type === types.THIS) {
    objectPath = '';
  } else {
    objectPath = node.name || getParameterPath(object, context);
  }

  if (computed) {
    // if computed -> evaluate anew
    const propertyPath = evaluateExpressionNode(property, context);
    return objectPath + '[' + propertyPath + ']';
  } else {
    assert(_.includes([types.MEMBER, types.IDENTIFIER], property.type), 'Invalid object type');
    const propertyPath = property.name || getParameterPath(property, context);
    return (objectPath ? objectPath + '.': '') + propertyPath;
  }
};

const evaluateExpressionNode = (node, context) => {
  assert(node, 'Node missing');
  assert(_.includes(types, node.type), 'invalid node type');
  switch (node.type) {
    case types.LITERAL: {
      return node.value;
    }
    case types.THIS: {
      return context;
    }
    case types.COMPOUND: {
      const expressions = _.map(node.body, el => evaluateExpressionNode(el, context));
      return expressions.pop();
    }
    case types.ARRAY: {
      const elements = _.map(node.elements, el => evaluateExpressionNode(el, context));
      return elements;
    }
    case types.UNARY: {
      const operator = operators.unary[node.operator] || undefOperator;
      assert(_.includes(operators.unary, operator), 'Invalid unary operator');
      const argument = evaluateExpressionNode(node.argument, context);
      assert(argument, 'argument is missing');
      return operator(argument);
    }
    case types.LOGICAL: // !!! fall-through to BINARY !!! //
    case types.BINARY: {
      const operator = operators.binary[node.operator] || undefOperator;
      assert(_.includes(operators.binary, operator), 'Invalid binary operator');
      const left = evaluateExpressionNode(node.left, context);
      const right = evaluateExpressionNode(node.right, context);
      return operator(left, right);
    }
    case types.CONDITIONAL: {
      const test = evaluateExpressionNode(node.test, context);
      const consequent = evaluateExpressionNode(node.consequent, context);
      const alternate = evaluateExpressionNode(node.alternate, context);
      assert(test, 'test argument is missing');
      assert(consequent, 'consequent argument is missing');
      assert(alternate, 'alternate argument is missing');
      return test ? consequent : alternate;
    }
    case types.CALL : {
      assert(_.includes([types.MEMBER, types.IDENTIFIER, types.THIS], node.callee.type), 'Invalid function callee type');
      const callee = evaluateExpressionNode(node.callee, context);
      const args = _.map(node.arguments, arg => evaluateExpressionNode(arg, context));
      return callee.apply(null, args);
    }
    case types.IDENTIFIER: // !!! fall-through to MEMBER !!! //
    case types.MEMBER: {
      const path = getParameterPath(node, context);
      return _.get(context, path);
    }
    default:
      return undefined;
  }
};

const evaluate = (expression, context) => {
  const tree = jsep(expression);
  return evaluateExpressionNode(tree, context);
};

const peval = (expression, context) => {
  return Promise.resolve()
    .then(() => evaluate(expression, context));
};

module.exports = {
  evaluate,
  peval,
  types,
  operators
};
