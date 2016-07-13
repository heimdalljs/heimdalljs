TODO

  - monitor provided partial schema?
    - cpu
    - fs
  - monitor registration?


```js
var heimdall = require('heimdall');
var heimdallCpu = require('heimdall/monitors/cpu');
var heimdallFs = require('heimdall/monitors/fs');

function BroccoliNodeSchema() {
  this.builds = 0;
}

heimdall.registerMonitor(cpu);
heimdall.registerMonitor(fs);

heimdall.node('broccoli', function () {
  heimdall.node('node:babel', BroccoliNodeSchema, function (h) {
    h.builds++;

    heimdall.node('node:persistent-filter', BroccoliNodeSchema, function (h) {
      h.builds++;
    });

    heimdall.node('node:caching-writer', BroccoliNodeSchema, function (h) {
      h.builds++;
    });
  });
});

```

```json
{
  "nodes": [{
    "id": 0,
    "name": "broccoli",,
    stats: {
      cpu: {
        self: 10,
      },
      fs: { /* ... */ },
    },
    children: {
      start: [1],
      end: [1],
    },
  }, {
    "id": 1,
    "name": "node:babel"
    stats: {
      builds: 1,
      cpu: {
        self: 20,
      },
      fs: { /* ... */ },
    },
    children: {
      start: [2, 3],
      end: [2, 3],
    },
  }, {
    "id": 2,
    "name": "node:persistent-filter"
    stats: {
      builds: 1,
      cpu: {
        self: 30,
      },
      fs: { /* ... */ },
    },
  }, {
    "id": 3,
    "name": "node:caching-writer"
    stats: {
      builds: 1,
      cpu: {
        self: 40,
      },
      fs: { /* ... */ },
    },
  }],
}
```

