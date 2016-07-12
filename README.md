TODO

- write out js example to cover broccoli
- include JSON graph output
- think about cases in ember at runtime as well (counting sendEvents, &c.)
  - lazy granularity (initially pushing stats on a single root node; adding detail by calling start/stop)


```js
var H = require('heimdall')('broccoli');

var h = H.somehow(this.description, this.id);
h.start();
h.end();
```

```
```
