import chai from 'chai';
import CounterStore from '../../src/shared/counter-store';

const { expect } = chai;

let counterStore;

describe('CounterStore', function() {
  beforeEach(function() {
    counterStore = new CounterStore();
  });

  afterEach(function() {
    counterStore = null;
  });

  it('`toJson` returns an instance of a new `CounterStore`', function() {
    expect(CounterStore.fromJSON({
      _namespaceCount: 0,
      _nameCache: {},
      _labelCache: {}
    }) instanceof CounterStore).to.be.true;
  });
});