import { _setHasTypedArrays, default as hasTypedArrays } from '../../src/shared/has-typed-arrays';

const OriginalEnvironmentValue = hasTypedArrays();

function mockHasTypedArrays(v) {
  _setHasTypedArrays(v);
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