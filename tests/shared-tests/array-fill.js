import chai from 'chai';
import arrayFill from '../../src/shared/array-fill';
import doubleArray from '../mock/has-typed-arrays';

const { expect } = chai;

describe('arrayFill', function() {
  it('fills a Uint32Array', function() {
    let double = doubleArray(true);
    let originalArray = new Uint32Array(3);

    expect(originalArray[0]).to.equal(0, `The array was initialized with the correct value at index 0`);
    expect(originalArray[1]).to.equal(0, `The array was initialized with the correct value at index 1`);
    expect(originalArray[2]).to.equal(0, `The array was initialized with the correct value at index 2`);

    let a = arrayFill(originalArray, 1);

    expect(a instanceof Uint32Array).to.equal(true, `We got a Uint32Array back`);
    expect(a === originalArray).to.equal(true, `We got the same Uint32Array back`);
    expect(a.length).to.equal(3, `The array length has not changed`);
    expect(a[0]).to.equal(1, `The array was filled with the correct value at index 0`);
    expect(a[1]).to.equal(1, `The array was filled with the correct value at index 1`);
    expect(a[2]).to.equal(1, `The array was filled with the correct value at index 2`);

    double.restore();
  });
  it('fills an Array', function() {
    let double = doubleArray(false);
    let originalArray = new Array(3);

    expect(originalArray[0]).to.equal(undefined, `The array was initialized with the correct value at index 0`);
    expect(originalArray[1]).to.equal(undefined, `The array was initialized with the correct value at index 1`);
    expect(originalArray[2]).to.equal(undefined, `The array was initialized with the correct value at index 2`);

    let a = arrayFill(originalArray, 1);

    expect(a instanceof Array).to.equal(true, `We got a Uint32Array back`);
    expect(a === originalArray).to.equal(true, `We got the same Uint32Array back`);
    expect(a.length).to.equal(3, `The array length has not changed`);
    expect(a[0]).to.equal(1, `The array was filled with the correct value at index 0`);
    expect(a[1]).to.equal(1, `The array was filled with the correct value at index 1`);
    expect(a[2]).to.equal(1, `The array was filled with the correct value at index 2`);

    double.restore();
  });
});