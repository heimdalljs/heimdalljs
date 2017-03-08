import assert from './assert';

const DEPRECATIONS = Object.create(null);

export default function deprecate(message: String, options) {
  assert(`You must include a message as the first argument to deprecate`, message);
  assert(`You must pass an options hash as the second argument to deprecate`, options);
  assert(`You must include an 'id' in the options hash passed to deprecate`, options.id);
  assert(`You must include 'since' in the options hash passed to deprecate`, options.since);
  assert(`You must include 'until' in the options hash passed to deprecate`, options.until);
  if (DEPRECATIONS[options.id]) {
    return;
  }

  DEPRECATIONS[options.id] = true;

  console.warn(`DEPRECATION[heimdalljs-${options.id}]: ${message}\nDeprecated in '${options.since}' and will be removed in '${options.until}'`);
}