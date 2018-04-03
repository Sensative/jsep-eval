// tests

const _ = require('lodash');
const expect = require('chai').expect;
const evaluate = require('../src/jsep-eval').evaluate;

const EPSILON = 0.0000001;

const name = 'condition-evaluator';
describe('======== ' + name + ' =========', () => {
  it(name + ': equality operator should work for numbers', () => {
    expect(evaluate('4 === 4')).to.be.true;
  });
  it(name + ': should compute an identifier', () => {
    const ctx = {a: 1};
    const exp = 'a';
    expect(evaluate(exp, ctx)).to.equal(1);
  });
  it(name + ': should do mathematical ops', () => {
    const ctx = {aa: -2};
    const exp = 'aa +3  -7 * 2.2'; // -14.4
    const res = evaluate(exp, ctx);
    expect(Math.abs(res + 14.4) < EPSILON).to.be.true;
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
