import chai from 'chai';
import spy from './spy';
import debug from 'debug';
import heimdall from 'heimdalljs';

import {
  ERROR, WARN, INFO, DEBUG, TRACE, default as Logger, NULL_LOGGER
} from '../src/logger';
import { default as Prefixer, defaultPrefixer } from '../src/prefixer';
// This is the main, debug-like API
import logGenerator from '../src/index';

let { expect } = chai;

describe('logGenerator', function() {
  const origDebugLevel = process.env.DEBUG_LEVEL;

  beforeEach( function() {
    debug.names.splice(0, debug.names.length);
    debug.skips.splice(0, debug.skips.length);
  });

  afterEach( function() {
    process.env.DEBUG_LEVEL = origDebugLevel;
  });

  it('returns a null logger for disabled namespaces', function() {
    expect(logGenerator('something')).to.equal(NULL_LOGGER);
  });

  it('returns a logger', function() {
    debug.enable('super-duper:project');

    expect(logGenerator('super-duper:project') instanceof Logger).to.equal(true);
  });

  it('sets log level according to DEBUG_LEVEL for names', function() {
    debug.enable('super-duper:project');

    expect(logGenerator('something-else')).to.equal(NULL_LOGGER);

    process.env.DEBUG_LEVEL = 'ERROR';
    logGenerator.debugLevel = undefined;
    expect(logGenerator('super-duper:project').level).to.equal(ERROR);

    process.env.DEBUG_LEVEL = 'WARN';
    logGenerator.debugLevel = undefined;
    expect(logGenerator('super-duper:project').level).to.equal(WARN);

    process.env.DEBUG_LEVEL = 'INFO';
    logGenerator.debugLevel = undefined;
    expect(logGenerator('super-duper:project').level).to.equal(INFO);

    process.env.DEBUG_LEVEL = 'DEBUG';
    logGenerator.debugLevel = undefined;
    expect(logGenerator('super-duper:project').level).to.equal(DEBUG);

    process.env.DEBUG_LEVEL = 'trace';
    logGenerator.debugLevel = undefined;
    expect(logGenerator('super-duper:project').level).to.equal(TRACE);

    process.env.DEBUG_LEVEL = 'error';
    logGenerator.debugLevel = undefined;
    expect(logGenerator('super-duper:project').level).to.equal(ERROR);

    process.env.DEBUG_LEVEL = 'warn';
    logGenerator.debugLevel = undefined;
    expect(logGenerator('super-duper:project').level).to.equal(WARN);

    process.env.DEBUG_LEVEL = 'info';
    logGenerator.debugLevel = undefined;
    expect(logGenerator('super-duper:project').level).to.equal(INFO);

    process.env.DEBUG_LEVEL = 'DEBUG';
    logGenerator.debugLevel = undefined;
    expect(logGenerator('super-duper:project').level).to.equal(DEBUG);

    process.env.DEBUG_LEVEL = 'TRACE';
    logGenerator.debugLevel = undefined;
    expect(logGenerator('super-duper:project').level).to.equal(TRACE);
  });

  it('sets log level according to DEBUG_LEVEL for numbers', function() {
    debug.enable('super-duper:project');

    process.env.DEBUG_LEVEL = `${ERROR}`;
    logGenerator.debugLevel = undefined;
    expect(logGenerator('super-duper:project').level).to.equal(ERROR);

    process.env.DEBUG_LEVEL = `${WARN}`;
    logGenerator.debugLevel = undefined;
    expect(logGenerator('super-duper:project').level).to.equal(WARN);

    process.env.DEBUG_LEVEL = `${INFO}`;
    logGenerator.debugLevel = undefined;
    expect(logGenerator('super-duper:project').level).to.equal(INFO);

    process.env.DEBUG_LEVEL = `${DEBUG}`;
    logGenerator.debugLevel = undefined;
    expect(logGenerator('super-duper:project').level).to.equal(DEBUG);

    process.env.DEBUG_LEVEL = `${TRACE}`;
    logGenerator.debugLevel = undefined;
    expect(logGenerator('super-duper:project').level).to.equal(TRACE);
  });

  it('uses a default level of INFO', function() {
    debug.enable('super-duper:project');

    delete process.env.DEBUG_LEVEL;
    logGenerator.debugLevel = undefined;
    expect(logGenerator('super-duper:project').level).to.equal(INFO);
  });
});

describe('NullLogger', function() {
  it('implements the logger API with noops', function() {
    let logger = NULL_LOGGER;

    const noopFnPattern = /^function (\w|\$)*\(\) \{\}$/;

    expect(logger.error+'').to.match(noopFnPattern);
    expect(logger.warn+'').to.match(noopFnPattern);
    expect(logger.info+'').to.match(noopFnPattern);
    expect(logger.debug+'').to.match(noopFnPattern);
    expect(logger.trace+'').to.match(noopFnPattern);
  });
});

describe('Logger', function() {
  it('prints messages <= its level', function() {
    let logger = new Logger('namespace', TRACE);
    logger._print = spy('_print');

    logger.error('hello');
    logger.warn('world');
    logger.info('how');
    logger.debug('are', 'you');
    logger.trace('doing');

    expect(logger._print.calls.map((c) => c.slice(1))).to.eql([
      ['hello'],
      ['world'],
      ['how'],
      ['are', 'you'],
      ['doing'],
    ]);
  });

  it('ignores messages > its level', function() {
    let logger = new Logger('namespace', ERROR - 1);
    logger._print = spy('_print');

    logger.error('hello');
    logger.warn('world');
    logger.info('how');
    logger.debug('are', 'you');
    logger.trace('doing');

    expect(logger._print.calls.map((c) => c.slice(1))).to.eql([]);
  });

  it('prefixes messages', function() {
    let logger = new Logger('namespace', INFO);
    logger._print = spy('_print');
    logger._prefixer = {
      prefix() {
        return 'hello ';
      },
    };

    logger.info('world');
    expect(logger._print.calls.map((c) => c.slice(1))).to.eql([
      ['hello world'],
    ]);
  });
});

describe('Prefixer', function() {
  beforeEach( function() {
    heimdall._reset();
  });

  it("reads matcher and depth from heimdall's logging config if present", function() {
    let logConfig = heimdall.configFor('logging');

    logConfig.depth = 1;
    logConfig.matcher = (id) => id.name == 'hello';

    let prefixer = new Prefixer();

    heimdall.start({ name: 'hello' });
    heimdall.start({ name: 'somemthing-else' });
    heimdall.start({ name: 'hello' });

    expect(prefixer.prefix()).to.match(/\[hello#\d\] /);
  });

  it('ignores the heimdall root node', function() {
    expect(new Prefixer().prefix()).to.equal('');
  });

  it('collects nodes from path to root, limited by `matcher`', function() {
    heimdall.start({ name: 'a' });
    heimdall.start({ name: 'b' });
    heimdall.start({ name: 'c' });
    heimdall.start({ name: 'd' });
    heimdall.start({ name: 'e' });

    let prefixer = new Prefixer();
    prefixer.matcher = (id) => /[ace]/.test(id.name);

    expect(prefixer.prefix()).to.match(/\[a#\d -> c#\d -> e#\d\] /);
  });

  it('collects nodes from path to root, limited by `depth`', function() {
    heimdall.start({ name: 'a' });
    heimdall.start({ name: 'b' });
    heimdall.start({ name: 'c' });
    heimdall.start({ name: 'd' });
    heimdall.start({ name: 'e' });

    let prefixer = new Prefixer();
    prefixer.depth = 4;

    expect(prefixer.prefix()).to.match(/\[b#\d -> c#\d -> d#\d -> e#\d\] /);
  });

  it('defaults depth to 3', function() {
    heimdall.start({ name: 'a' });
    heimdall.start({ name: 'b' });
    heimdall.start({ name: 'c' });
    heimdall.start({ name: 'd' });
    heimdall.start({ name: 'e' });

    let prefixer = new Prefixer();

    expect(prefixer.prefix()).to.match(/\[c#\d -> d#\d -> e#\d\] /);
  });
});
