## Example Usage

### Simple

```js
var heimdall = require('heimdall');

function BroccoliNodeSchema() {
  this.builds = 0;
}


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
    "name": "broccoli",
    "stats": {
      "cpu": {
        "self": 10,
      },
    },
    "children": {
      "start": [1],
      "end": [1],
    },
  }, {
    "id": 1,
    "name": "node:babel",
    "stats": {
      "builds": 1,
      "cpu": {
        "self": 20,
      },
    },
    "children": {
      "start": [2, 3],
      "end": [2, 3],
    },
  }, {
    "id": 2,
    "name": "node:persistent-filter",
    "stats": {
      "builds": 1,
      "cpu": {
        "self": 30,
      },
    },
  }, {
    "id": 3,
    "name": "node:caching-writer",
    "stats": {
      "builds": 1,
      "cpu": {
        "self": 40,
      },
    },
  }],
}
```

### With Monitors

```js
var heimdall = require('heimdall');
var fs = require('fs');

var origLstatSync = fs.lstatSync;
var origMkdirSync = fs.mkdirSync;

heimdall.registerMonitor('fs', function FSSchema() {
  this.lstatCount = 0;
  this.mkdirCount = 0;
});

fs.lstatSync = function () {
  heimdall.statsFor('fs').lstatCount++;
  return origLstatSync.apply(fs, arguments);
}

fs.mkdirSync = function () {
  heimdall.statsFor('fs').mkdirCount++;
  return origMkdirSync.apply(fs, arguments);
}


function BroccoliNodeSchema() {
  this.builds = 0;
}


heimdall.node('broccoli', function () {
  heimdall.node('node:babel', BroccoliNodeSchema, function (h) {
    h.builds++;

    heimdall.node('node:persistent-filter', BroccoliNodeSchema, function (h) {
      h.builds++;
      fs.mkdirSync('./tmp');
    });

    heimdall.node('node:caching-writer', BroccoliNodeSchema, function (h) {
      h.builds++;
      fs.lstatSync('./tmp');
    });
  });
});

```

```json
{
  "nodes": [{
    "id": 0,
    "name": "broccoli",
    "stats": {
      "cpu": {
        "self": 10,
      },
      "fs": {
        lstatCount: 0,
        mkdirCount: 0,
      },
    },
    "children": {
      "start": [1],
      "end": [1],
    },
  }, {
    "id": 1,
    "name": "node:babel",
    "stats": {
      "builds": 1,
      "cpu": {
        "self": 20,
      },
      "fs": {
        lstatCount: 0,
        mkdirCount: 0,
      },
    },
    "children": {
      "start": [2, 3],
      "end": [2, 3],
    },
  }, {
    "id": 2,
    "name": "node:persistent-filter",
    "stats": {
      "builds": 1,
      "cpu": {
        "self": 30,
      },
      "fs": {
        lstatCount: 0,
        mkdirCount: 1,
      },
    },
  }, {
    "id": 3,
    "name": "node:caching-writer",
    "stats": {
      "builds": 1,
      "cpu": {
        "self": 40,
      },
      "fs": {
        lstatCount: 1,
        mkdirCount: 0,
      },
    },
  }],
}
```
