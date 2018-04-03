// tests

const _ = require('lodash');
const evaluate = require('../src/jsep-eval').evaluate;

let ctx, exp, res;

const name = 'condition-evaluator';
describe('======== ' + name + ' =========', () => {
  it(name + ': should compute an identifier', () => {
    const ctx = {a: 1};
    const exp = 'a';
    expect(evaluate(exp, ctx)).to.equal(1);
  });
  it(name + ': should do mathematical ops', () => {
    const exp = 'aa +3  -7 * 2.2'; // -14.4
    const res = evaluate({}, ctx);
    expect(Math.abs(res + 14.4) < 0.0000001).to.be.true;
  });
  it(name + ': should compute a computed member expression', () => {
    const ctx = {
      a: {b: 2},
      c: 'b'
    };
    const exp = 'a[c]';
    expect(evaluate(exp, ctx)).to.equal(2);
  });
  it(name + ': should compute a non-computed compound member expression', () => {
    const ctx = {
      a: {b: {c: {d: 3}}},
    };
    const exp = 'a.b.c.d === 3';
    expect(evaluate(exp, ctx)).to.be.true;
  });
  it(name + ': should compute a complex, mixed compound member expression', () => {
    const ctx = {
      a: {b: {c: 7}},
      b: {d: 'e'},
      c: 'd',
      d: {e: 'c'}
    };
    const exp = 'a.b[d[b[c]]]';
    expect(evaluate(exp, ctx)).to.equal(7);
  });
});

ctx = {
  a: {b: {c: 7}},
  b: {d: 'e'},
  c: 'd',
  d: {e: 'c'}
};
exp = 'a.b[d[b[c]]]'; // 7
res = evaluate(exp, ctx);
console.log('res ' + exp + ' = ', res);
