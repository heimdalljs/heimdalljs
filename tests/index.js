import ENV from './-env';
import console from '../src/shared/log';
import './shared-tests';
import './runtime-tests';
import './heimdall-tree-tests';
import './session-compatibility-tests';

// If we don't use this here, rollup is too smart
// and will prevent us from setting the global process testing flag.
if (ENV.IS_TESTING) {
  console.log(
    '\n\t===========================' +
    '\n\tRunning Heimdall Test Suite' +
    '\n\t===========================' +
    '\n');
}