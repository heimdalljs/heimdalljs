const canRename = function () {
  const descriptor = Object.getOwnPropertyDescriptor(function() {}, 'name');
  return descriptor.configurable;
}();

export default function createSpy(name) {
  const calls = [];

  const spy = function spy(...args) {
    calls.push([this, ...args]);
  };

  spy.calls = calls;

  if (canRename) {
    Object.defineProperty(spy, 'name', {
      get() { return name; },
    });
  }

  return spy;
}
