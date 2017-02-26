import { _setHasTypedArrays, default as hasTypedArrays } from '../../src/shared/has-typed-arrays';

const OriginalEnvironmentValue = hasTypedArrays();

class ArrayDouble {
  constructor(originalValue, newValue) {
    this.hasTypedArrayValue = newValue;
    this.originalHasTypedArrayValue = originalValue;
  }

  restore() {
    _setHasTypedArrays(this.originalHasTypedArrayValue);
  }
}

function mockHasTypedArrays(v) {
  let originalValue = hasTypedArrays();
  let double = new ArrayDouble(originalValue, v);
  _setHasTypedArrays(v);

  return double;
}

function restoreHasTypedArrays() {
  _setHasTypedArrays(OriginalEnvironmentValue);
}

export default function double(v) {
  mockHasTypedArrays(v);

  return {
    hasTypedArrayValue: hasTypedArrays(),
    originalHasTypedArrayValue: OriginalEnvironmentValue,
    restore: restoreHasTypedArrays
  }
}