import ENV from './-env';
import console from '../src/shared/log';
import './shared-tests';
import './runtime-tests';
import './heimdall-tree-tests';
import scenarios from './scenarios';

function seekArg(name) {
  const args = process.argv;

  for (let i = 1, l = args.length; i < l; i++) {
    if (args[i].indexOf(name) === 0) {
      const argStr = args[i];

      return {
        index: i,
        name,
        arg: argStr,
        value: argStr.substr(name.length + 1)
      };
    }
  }

  return null;
}

const scenarioSpecified = seekArg('--scenario');
const scenario = scenarioSpecified !== null ? scenarioSpecified.value : 'default';

scenarios[scenario].setup();

// If we don't use this here, rollup is too smart
// and will prevent us from setting the global process testing flag.
if (ENV.IS_TESTING) {
  console.log(
    '\n\t===========================' +
    '\n\tRunning Heimdall Test Suite' +
    `\n\t\tScenario: ${scenario}` +
    '\n\t===========================' +
    '\n');
}
