
export default function createStub(obj, methodName) {
  const orig = obj[methodName];

  if (typeof orig !== 'function') {
    throw new Error(`${obj} has no method named '${methodName}'`);
  }

  const calls = [];
  
  const stub = function (...args) {
    calls.push([this, args]);
  };

  stub.calls = calls;
  stub.restore = () => obj[methodName] = orig;

  obj[methodName] = stub;
}
