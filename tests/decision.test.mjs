import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyRegime, parseScenario } from '../decision.mjs';
const model = { ma200: 70_000, target: 87_000, low: 69_000, high: 71_000 };
test('risk takes priority over the historical entry zone and target', () => {
  assert.equal(classifyRegime({ ...model, price: 69_500 }), 'risk');
  assert.equal(classifyRegime({ ...model, target: 60_000, price: 69_500 }), 'risk');
});
test('entry and target boundaries give one mutually exclusive state', () => {
  for (const [price, expected] of [[70_000,'retest'],[71_000,'retest'],[71_001,'wait'],[86_999,'wait'],[87_000,'target']]) {
    assert.equal(classifyRegime({ ...model, price }), expected);
  }
});
test('missing, loading and invalid values never produce an action signal', () => {
  for (const price of [NaN, Infinity, 0, -1, undefined]) assert.equal(classifyRegime({ ...model, price }), 'unavailable');
  assert.equal(classifyRegime({ ...model, price: 77_000, ready: false }), 'unavailable');
});
test('clearing or invalid scenario input restores the actual price', () => {
  for (const input of ['', ' ', 'abc', '-1', '0', 'Infinity']) assert.equal(parseScenario(input), null);
  assert.equal(parseScenario('72000.5'), 72000.5);
});
