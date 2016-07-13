TODO

- write out js example to cover broccoli
- include JSON graph output
- think about cases in ember at runtime as well (counting sendEvents, &c.)
  - lazy granularity (initially pushing stats on a single root node; adding detail by calling start/stop)


```js
var H = require('heimdall')('broccoli');

var h = new H('merge-trees', this.id, ['build:count', 'build:time']);
h.start();
h.stats()['build:count']++;
h.stats().measure('build:time');
foo();
foo();
h.end();


// implemented elsewhere
var H = require('heimdall')('broccoli-merge-trees');
var h = new H(this.description, this.id, ['io:stat']);

function foo() {
  h.start(); // lets previous measure know it's no longer in selftime
  h.stats()['io:stat']++;
  h.end();
}
```

```json
{
  "nodes": [{
    "id": 0,
    "name": "broccoli",
  }, {
    "id": 1,
    "name": "broccoli-plugin-whatever"
  }],
  
  "graph": {
    "root": 0,
    "stats": {
    },
    "startChildren": [{
    }],
    "endChildren": [
    ]
  }
}
```
