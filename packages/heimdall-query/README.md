# Heimdall Query

An analysis tool for heimdall trees.

## Installation

```cli
npm install heimdall-query --save-dev
```

## Analyzing A Heimdall Tree

TODO: There are a few limitations here at the moment in how you need to
construct your test scenarios for the browser runner to work.

## Example Using

```js
const config = require('./config');
const CACHE_DIR = process.argv[2] === '-c' ? process.argv[3] : '.';
const path = require('path');
const cachePath = path.join(__dirname, './results', CACHE_DIR);
const run = require('heimdall-query');

run(config, cachePath);
```

## Example Config

```js
module.exports = {
  runs: 5,
  domain: 'http://localhost:4200/',
  slugs: ['query?modelName=complex&limit=100'],
  ignoreBranches: [
    // 'adapter._makeRequest',
    // 'InternalModel._materializeRecord'
  ],
  stats: [
    {
      key: 'stats.self.selfTime',
      name: 'Count',
      rollup: false,
      transform: function (t, c) {
        return c;
      },
    },
    { key: 'stats.self.selfTime', name: 'Self Time', rollup: false },
    { key: 'stats.self.selfTime', name: 'Total Time', rollup: true },
    {
      key: 'stats.self.selfTime',
      name: 'Throughput',
      rollup: false,
      transform: function (t, c) {
        return `${(c / (t / 1e6)).toFixed(2)} ops/ms`;
      },
    },
  ],
  browser: 'chrome',
  name: 'Performance Analysis',
  compressAfter: 10,
  maxDepth: 25,
  collapseByName: true,
  finderPath: 'my-root-node',
};
```
