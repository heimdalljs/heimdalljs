import debug from 'debug';
import {
  ERROR, WARN, INFO, DEBUG, TRACE,
  NULL_LOGGER, default as Logger
} from './logger';

function computeDebugLevel() {
  let level;

  if (!process.env.DEBUG_LEVEL) {
    level = INFO;
  } else {
    switch (process.env.DEBUG_LEVEL.toUpperCase()) {
      case 'ERROR': level = ERROR; break;
      case 'WARN':  level = WARN; break;
      case 'INFO':  level = INFO; break;
      case 'DEBUG': level = DEBUG; break;
      case 'TRACE': level = TRACE; break;
      default:
        level = parseInt(process.env.DEBUG_LEVEL, 10);
    }
  }

  logGenerator.debugLevel = level;
}

export default function logGenerator(namespace) {
  if (debug.enabled(namespace)) {
    if (logGenerator.debugLevel === undefined) {
      computeDebugLevel();
    }

    return new Logger(namespace, logGenerator.debugLevel);
  } else {
    return NULL_LOGGER;
  }
}

logGenerator.debugLevel = undefined;
